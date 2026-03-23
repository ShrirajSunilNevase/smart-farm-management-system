const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Land = require('../models/Land');

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// Resolve location to lat/lng: geolocation coords, address string, or land location
async function resolveCoordinates(userId, lat, lng, location) {
  if (lat != null && lng != null) return { lat: parseFloat(lat), lng: parseFloat(lng), source: 'geolocation' };
  const search = location && location.trim();
  if (search) {
    const { data } = await axios.get(GEOCODE_URL, { params: { name: search, count: 1 } });
    const r = data?.results?.[0];
    if (r) return { lat: r.latitude, lng: r.longitude, name: r.name, source: 'geocode' };
  }
  const user = await User.findById(userId).select('address');
  if (user?.address) {
    const { data } = await axios.get(GEOCODE_URL, { params: { name: user.address, count: 1 } });
    const r = data?.results?.[0];
    if (r) return { lat: r.latitude, lng: r.longitude, name: r.name, source: 'profile' };
  }
  const land = await Land.findOne({ farmerId: userId, approvalStatus: 'approved' }).sort({ createdAt: -1 });
  if (land?.location) {
    const { data } = await axios.get(GEOCODE_URL, { params: { name: land.location, count: 1 } });
    const r = data?.results?.[0];
    if (r) return { lat: r.latitude, lng: r.longitude, name: r.name, source: 'land' };
  }
  return null;
}

// Derive agricultural weather alerts from forecast
function deriveAlerts(current, daily) {
  const alerts = [];
  if (!current && !daily) return alerts;

  const today = daily?.[0];
  const temp = current?.temperature_2m ?? today?.temperature_2m_max ?? today?.temperature_2m_min;
  const precip = current?.precipitation ?? today?.precipitation_sum ?? 0;
  const wind = current?.wind_speed_10m ?? today?.wind_speed_10m_max ?? 0;
  const uv = today?.uv_index_max ?? current?.uv_index ?? 0;
  const wcode = current?.weather_code ?? today?.weather_code ?? 0;

  if (temp != null) {
    if (temp >= 40) alerts.push({ type: 'heat', severity: 'high', message: 'Extreme heat expected. Avoid fieldwork during peak hours.', icon: 'thermometer-sun' });
    else if (temp >= 36) alerts.push({ type: 'heat', severity: 'medium', message: 'High temperature. Stay hydrated and limit outdoor work.', icon: 'thermometer' });
    if (temp <= 2 && temp > -5) alerts.push({ type: 'frost', severity: 'medium', message: 'Frost risk. Protect sensitive crops overnight.', icon: 'snowflake' });
    else if (temp <= -5) alerts.push({ type: 'frost', severity: 'high', message: 'Severe cold. Take measures to protect crops and livestock.', icon: 'snowflake' });
  }
  if (precip >= 50) alerts.push({ type: 'rain', severity: 'high', message: 'Heavy rainfall expected. Check drainage and delay field work.', icon: 'cloud-rain' });
  else if (precip >= 20) alerts.push({ type: 'rain', severity: 'medium', message: 'Moderate rain forecast. Plan irrigation and fieldwork accordingly.', icon: 'cloud-drizzle' });
  if (wind >= 50) alerts.push({ type: 'wind', severity: 'high', message: 'Strong winds expected. Secure equipment and avoid spraying.', icon: 'wind' });
  else if (wind >= 35) alerts.push({ type: 'wind', severity: 'medium', message: 'Moderate winds. Be cautious with pesticides and dust.', icon: 'wind' });
  if (uv >= 10) alerts.push({ type: 'uv', severity: 'high', message: 'Very high UV index. Use sun protection and limit exposure.', icon: 'sun' });
  else if (uv >= 8) alerts.push({ type: 'uv', severity: 'medium', message: 'High UV index. Wear protective clothing and hat.', icon: 'sun' });
  if ([95, 96, 99].includes(wcode)) alerts.push({ type: 'storm', severity: 'high', message: 'Thunderstorm possible. Avoid fieldwork and seek shelter.', icon: 'cloud-lightning' });

  return alerts;
}

// @GET /api/weather — real-time weather + alerts (farmer: uses profile/land/coords)
router.get('/', protect, async (req, res) => {
  try {
    const { lat, lng, location } = req.query;
    const coords = await resolveCoordinates(req.user._id, lat, lng, location);
    if (!coords) {
      return res.status(400).json({
        message: 'Location required. Enable geolocation, add an address in your profile, or pass lat/lng or location query.',
      });
    }

    const params = {
      latitude: coords.lat,
      longitude: coords.lng,
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,uv_index_max',
      timezone: 'auto',
      forecast_days: 5,
    };

    const { data } = await axios.get(FORECAST_URL, { params });
    const current = data?.current;
    const daily = data?.daily;
    const today = daily?.time?.[0] ? {
      temperature_2m_max: daily.temperature_2m_max?.[0],
      temperature_2m_min: daily.temperature_2m_min?.[0],
      precipitation_sum: daily.precipitation_sum?.[0],
      weather_code: daily.weather_code?.[0],
      wind_speed_10m_max: daily.wind_speed_10m_max?.[0],
      uv_index_max: daily.uv_index_max?.[0],
    } : null;
    const alerts = deriveAlerts(current, [today].filter(Boolean));

    res.json({
      location: { lat: coords.lat, lng: coords.lng, name: coords.name, source: coords.source },
      current: current ? {
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature ?? current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precip: current.precipitation,
        weatherCode: current.weather_code,
        windSpeed: current.wind_speed_10m,
        windDir: current.wind_direction_10m,
        uvIndex: current.uv_index,
      } : null,
      daily: daily?.time?.map((t, i) => ({
        date: t,
        tempMax: daily.temperature_2m_max?.[i],
        tempMin: daily.temperature_2m_min?.[i],
        precip: daily.precipitation_sum?.[i],
        weatherCode: daily.weather_code?.[i],
        windMax: daily.wind_speed_10m_max?.[i],
        uvMax: daily.uv_index_max?.[i],
      })) ?? [],
      alerts,
    });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(500).json({ message: err.response?.data?.reason || 'Failed to fetch weather' });
  }
});

module.exports = router;
