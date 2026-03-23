import React, { useState, useEffect } from 'react';
import {
  CloudRain, ThermometerSun, Snowflake, Wind, Sun, CloudLightning,
  MapPin, Loader2, RefreshCw, Droplets, Cloud, AlertTriangle, Search
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

const DEFAULT_LOCATIONS = ['Pune, India', 'Nagpur, India', 'Mumbai, India'];

export default function AdminWeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchLoc, setSearchLoc] = useState('Pune, India');

  const fetchWeather = (location) => {
    if (!location?.trim()) return;
    setLoading(true);
    setError('');
    api.get(`/weather?location=${encodeURIComponent(location.trim())}`)
      .then(({ data }) => {
        setWeather(data);
        setSearchLoc(location.trim());
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Could not fetch weather');
        setWeather(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeather('Pune, India');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const loc = e.target.location?.value?.trim();
    if (loc) fetchWeather(loc);
  };

  const locLabel = weather?.location?.name || searchLoc;

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Cloud className="w-4 h-4 text-sky-400" />
          Regional Weather
        </h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              name="location"
              type="text"
              defaultValue={searchLoc}
              placeholder="City, District, State"
              className="input-field pl-9 pr-4 py-2 text-sm w-48"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-2 px-4 text-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {error && !weather && (
        <div className="flex items-center gap-3 text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading && !weather ? (
        <div className="flex items-center gap-3 text-stone-400 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          Fetching weather…
        </div>
      ) : weather && (
        <>
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>{locLabel}</span>
          </div>

          {weather.current && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-display text-white font-bold">{Math.round(weather.current.temp)}°C</div>
                <div className="text-stone-500 text-xs">{getWeatherDesc(weather.current.weatherCode)}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-white">{weather.current.humidity}%</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                <Wind className="w-4 h-4 text-sky-400" />
                <span className="text-white">{weather.current.windSpeed} km/h</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-white">UV {weather.current.uvIndex ?? '—'}</span>
              </div>
            </div>
          )}

          {weather.alerts?.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Weather Alerts
              </h4>
              <div className="space-y-2">
                {weather.alerts.slice(0, 3).map((a, i) => {
                  const Icon = WEATHER_ICONS[a.type] || AlertTriangle;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                        a.severity === 'high' ? 'bg-red-900/20' : 'bg-amber-900/15'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                      <span className="text-stone-300">{a.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {DEFAULT_LOCATIONS.filter((l) => l !== searchLoc).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => fetchWeather(loc)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              >
                {loc}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
