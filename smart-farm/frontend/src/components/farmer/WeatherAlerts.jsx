import React, { useState, useEffect, useCallback } from 'react';
import {
  CloudRain, ThermometerSun, Snowflake, Wind, Sun, CloudLightning,
  MapPin, Loader2, RefreshCw, Droplets, Cloud, AlertTriangle
} from 'lucide-react';
import api from '../../utils/api';

const WEATHER_ICONS = {
  heat: ThermometerSun,
  frost: Snowflake,
  rain: CloudRain,
  wind: Wind,
  uv: Sun,
  storm: CloudLightning,
};

const WEATHER_CODE_MAP = {
  0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Foggy', 51: 'Drizzle', 61: 'Rain', 63: 'Rain', 65: 'Heavy Rain',
  71: 'Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
  80: 'Showers', 81: 'Showers', 82: 'Heavy Showers',
  85: 'Snow Showers', 86: 'Heavy Snow Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

function getWeatherDesc(code) {
  return WEATHER_CODE_MAP[code] ?? 'Unknown';
}

export default function WeatherAlerts({ onLocationResolved }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useGeo, setUseGeo] = useState(true);

  const fetchWeather = useCallback(async (lat, lng, location) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (lat != null && lng != null) {
        params.set('lat', lat);
        params.set('lng', lng);
      } else if (location) params.set('location', location);
      const { data } = await api.get(`/weather?${params.toString()}`);
      setWeather(data);
      onLocationResolved?.(data.location);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch weather');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [onLocationResolved]);

  useEffect(() => {
    if (!useGeo) {
      fetchWeather(null, null, null);
      return;
    }
    if (!navigator.geolocation) {
      fetchWeather(null, null, null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeather(null, null, null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, [useGeo, fetchWeather]);

  const handleRefresh = () => {
    if (useGeo && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(null, null, null)
      );
    } else fetchWeather(null, null, null);
  };

  if (loading)
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 text-stone-400">
          <Loader2 className="w-5 h-5 animate-spin text-leaf-500" />
          Fetching weather for your location…
        </div>
      </div>
    );

  if (error && !weather)
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex gap-2">
            {useGeo && (
              <button
                type="button"
                onClick={() => setUseGeo(false)}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                Use profile location
              </button>
            )}
            <button type="button" onClick={handleRefresh} className="btn-secondary text-sm py-1.5 px-3">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );

  if (!weather) return null;

  const { location, current, daily, alerts } = weather;
  const locLabel = location?.name || `${location?.lat?.toFixed(2)}°, ${location?.lng?.toFixed(2)}°`;

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Cloud className="w-4 h-4 text-sky-400" />
          Real-Time Weather
        </h3>
        <div className="flex items-center gap-2">
          {useGeo && (
            <button
              type="button"
              onClick={() => setUseGeo(false)}
              className="text-stone-500 hover:text-white text-xs"
            >
              Use profile
            </button>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            title="Refresh weather"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-stone-400 text-sm">
        <MapPin className="w-4 h-4 text-leaf-500" />
        <span>{locLabel}</span>
        {location?.source && (
          <span className="text-stone-600 text-xs">({location.source})</span>
        )}
      </div>

      {current && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-2xl font-display text-white font-bold">{Math.round(current.temp)}°C</div>
            <div className="text-stone-500 text-xs">{getWeatherDesc(current.weatherCode)}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-white">{current.humidity}%</span>
            <span className="text-stone-500 text-xs">Humidity</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
            <Wind className="w-4 h-4 text-sky-400" />
            <span className="text-white">{current.windSpeed} km/h</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-white">UV {current.uvIndex ?? '—'}</span>
          </div>
        </div>
      )}

      {alerts && alerts.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Weather Alerts ({alerts.length})
          </h4>
          <div className="space-y-2">
            {alerts.map((a, i) => {
              const Icon = WEATHER_ICONS[a.type] || AlertTriangle;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    a.severity === 'high'
                      ? 'bg-red-900/20 border-red-500/30'
                      : 'bg-amber-900/15 border-amber-700/30'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${a.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                  <div>
                    <p className="text-stone-200 text-sm font-medium capitalize">{a.type} alert</p>
                    <p className="text-stone-400 text-sm">{a.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {daily?.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {daily.slice(0, 5).map((d, i) => (
              <div key={d.date} className="bg-white/5 rounded-xl p-2 text-center">
                <div className="text-stone-400 text-xs font-medium">
                  {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                </div>
                <div className="text-white font-bold text-sm mt-1">
                  {d.tempMax != null ? `${Math.round(d.tempMax)}°` : '—'}
                </div>
                <div className="text-stone-500 text-xs">
                  {d.tempMin != null ? `${Math.round(d.tempMin)}°` : '—'}
                </div>
                {d.precip > 0 && (
                  <div className="text-blue-400 text-xs mt-1 flex items-center justify-center gap-0.5">
                    <CloudRain className="w-3 h-3" />
                    {d.precip} mm
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
