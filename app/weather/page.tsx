"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, Eye, MapPin, Search } from "lucide-react"

const OPENWEATHERMAP_API_KEY = process.env.NEXT_PUBLIC_OWM_KEY;

export default function WeatherPage() {
  const [location, setLocation] = useState("")
  const [currentWeather, setCurrentWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualCity, setManualCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geoDebug, setGeoDebug] = useState<any>(null);
  const [geoCoords, setGeoCoords] = useState<{lat: number, lon: number} | null>(null);
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const [pendingCoords, setPendingCoords] = useState<{lat: number, lon: number} | null>(null);

  // Helper: fetch weather by coordinates
  async function fetchWeatherByCoords(lat: number, lon: number, city: string) {
    // Fetch weather data from Open-Meteo (include hourly humidity, uv_index, visibility)
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weathercode&hourly=relative_humidity_2m,uv_index,visibility&timezone=auto`);
    const weatherData = await weatherRes.json();
    const weatherCodeToCondition = (code: number) => {
      if ([0].includes(code)) return 'Sunny';
      if ([1, 2, 3].includes(code)) return 'Partly Cloudy';
      if ([45, 48].includes(code)) return 'Foggy';
      if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rainy';
      if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowy';
      if ([95, 96, 99].includes(code)) return 'Thunderstorm';
      return 'Cloudy';
    };
    // Find the current hour index
    let humidity = '-';
    let uvIndex = '-';
    let visibility = '-';
    if (weatherData.hourly && weatherData.hourly.time && weatherData.hourly.relative_humidity_2m) {
      const now = new Date();
      const hourIdx = weatherData.hourly.time.findIndex((t: string) => t.startsWith(now.toISOString().slice(0, 13)));
      if (hourIdx !== -1) {
        humidity = weatherData.hourly.relative_humidity_2m[hourIdx] + '%';
        uvIndex = weatherData.hourly.uv_index[hourIdx] !== undefined ? weatherData.hourly.uv_index[hourIdx].toString() : '-';
        visibility = weatherData.hourly.visibility[hourIdx] !== undefined ? (weatherData.hourly.visibility[hourIdx] / 1000).toFixed(1) + ' km' : '-';
      }
    }
    setCurrentWeather({
      location: city,
      temperature: Math.round(weatherData.current_weather.temperature),
      condition: weatherCodeToCondition(weatherData.current_weather.weathercode),
      humidity,
      windSpeed: Math.round(weatherData.current_weather.windspeed),
      visibility,
      uvIndex,
      pressure: '-',
    });
    setForecast(weatherData.daily.time.map((date: string, idx: number) => ({
      day: idx === 0 ? 'Today' : new Date(date).toLocaleDateString(undefined, { weekday: 'long' }),
      high: Math.round(weatherData.daily.temperature_2m_max[idx]),
      low: Math.round(weatherData.daily.temperature_2m_min[idx]),
      condition: weatherCodeToCondition(weatherData.daily.weathercode[idx]),
      icon: weatherCodeToCondition(weatherData.daily.weathercode[idx]).toLowerCase().includes('rain') ? 'rain' : weatherCodeToCondition(weatherData.daily.weathercode[idx]).toLowerCase().includes('cloud') ? 'cloud' : 'sun',
      precipitation: weatherData.daily.precipitation_probability_mean[idx] || 0,
    })));
  }

  // Add a loading state for weather fetch
  useEffect(() => {
    async function fetchLocationAndWeather() {
      setIsLoading(true);
      // 1. Try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            setGeoCoords({ lat, lon });
            // Use Open-Meteo reverse geocoding to get city name
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`);
            const geoData = await geoRes.json();
            setGeoDebug(geoData);
            if (geoData && geoData.results && geoData.results.length > 0) {
              // Kolkata override: if coords are in Kolkata bounding box, auto-select Kolkata
              if (
                lat >= 22.3 && lat <= 22.7 &&
                lon >= 88.2 && lon <= 88.6
              ) {
                setLocation('Kolkata, India');
                console.log('Kolkata override:', lat, lon, 'Kolkata, India');
                await fetchWeatherByCoords(lat, lon, 'Kolkata, India');
                setCityOptions([]);
                setPendingCoords(null);
                setIsLoading(false);
                return;
              }
              // Try to auto-select Kolkata/Calcutta if present
              const autoIdx = geoData.results.findIndex((opt: any) =>
                opt.name.toLowerCase() === 'kolkata' || opt.name.toLowerCase() === 'calcutta'
              );
              setCityOptions(geoData.results);
              setPendingCoords({ lat, lon });
              if (autoIdx !== -1) {
                // Auto-select Kolkata/Calcutta
                const { name, country, admin1 } = geoData.results[autoIdx];
                setLocation(`${name}, ${admin1 ? admin1 + ', ' : ''}${country}`);
                await fetchWeatherByCoords(lat, lon, `${name}, ${admin1 ? admin1 + ', ' : ''}${country}`);
                setCityOptions([]);
                setPendingCoords(null);
                setIsLoading(false);
              }
              // Otherwise, let user pick
            } else {
              // fallback: use first result or just fetch weather
              setLocation('');
              await fetchWeatherByCoords(lat, lon, '');
              setLocationError(null);
              setIsLoading(false);
            }
          } catch (err) {
            // If geolocation fails, fallback to IP-based
            await fetchByIP();
          }
        }, async (err) => {
          // If user denies or error, fallback to IP-based
          await fetchByIP();
        });
      } else {
        // No geolocation, fallback to IP-based
        await fetchByIP();
      }
    }
    async function fetchByIP() {
      try {
        const locRes = await fetch('/api/get-location');
        const locData = await locRes.json();
        if (!locData.city || !locData.lat || !locData.lon) throw new Error('Could not detect location');
        setLocation(locData.city);
        await fetchWeatherByCoords(locData.lat, locData.lon, locData.city);
        setLocationError(null);
      } catch (err: any) {
        setLocationError("Could not detect your city automatically. Please enter your city below.");
        setCurrentWeather(null);
        setForecast([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLocationAndWeather();
  }, []);

  // Manual city search handler
  const handleManualCitySearch = async () => {
    if (!manualCity.trim()) return;
    await fetchWeatherByCity(manualCity);
  };

  // Search box handler (main search bar)
  const searchWeather = async () => {
    if (!location.trim()) return;
    await fetchWeatherByCity(location);
  };

  async function fetchWeatherByCity(city: string) {
    setIsLoading(true);
    try {
      // Use Open-Meteo geocoding API to get lat/lon
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      if (!geoData.results || !geoData.results[0]) throw new Error('City not found');
      const { latitude, longitude, name, country } = geoData.results[0];
      await fetchWeatherByCoords(latitude, longitude, `${name}, ${country}`);
      setLocation(`${name}, ${country}`);
      setLocationError(null);
    } catch (err) {
      setLocationError("Could not find weather for that city. Please try again.");
      setCurrentWeather(null);
      setForecast([]);
    } finally {
      setIsLoading(false);
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "cloudy":
      case "partly cloudy":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />
    }
  }

  const getForecastIcon = (icon: string) => {
    switch (icon) {
      case "sun":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "cloud":
        return <Cloud className="h-6 w-6 text-gray-500" />
      case "rain":
        return <CloudRain className="h-6 w-6 text-blue-500" />
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  // Handler for user picking a city from dropdown
  const handleCityOptionSelect = async (idx: number) => {
    if (!cityOptions[idx] || !pendingCoords) return;
    const { name, country, admin1 } = cityOptions[idx];
    setLocation(`${name}, ${admin1 ? admin1 + ', ' : ''}${country}`);
    await fetchWeatherByCoords(pendingCoords.lat, pendingCoords.lon, `${name}, ${admin1 ? admin1 + ', ' : ''}${country}`);
    setCityOptions([]);
    setPendingCoords(null);
    setIsLoading(false);
  };

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Weather Forecasting</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get accurate weather predictions to plan your farming activities
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter location (city, state, country)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={searchWeather} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            {cityOptions.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-sm text-gray-700">Select your city for best accuracy:</div>
                <select
                  className="border rounded px-2 py-1"
                  onChange={e => handleCityOptionSelect(Number(e.target.value))}
                  defaultValue={-1}
                >
                  <option value={-1} disabled>Select city...</option>
                  {cityOptions.map((opt, idx) => (
                    <option key={idx} value={idx}>
                      {opt.name}{opt.admin1 ? `, ${opt.admin1}` : ''}, {opt.country}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {geoCoords && (
              <div className="mt-2 text-xs text-gray-500">Detected coordinates: {geoCoords.lat.toFixed(4)}, {geoCoords.lon.toFixed(4)}</div>
            )}
            {geoDebug && (
              <details className="mt-2 text-xs text-gray-400">
                <summary>Show geocoding debug info</summary>
                <pre>{JSON.stringify(geoDebug, null, 2)}</pre>
              </details>
            )}
            {locationError && (
              <div className="mt-4 text-red-600 text-sm">
                {locationError}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter your city manually"
                    value={manualCity}
                    onChange={e => setManualCity(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={handleManualCitySearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading weather data...
          </div>
        )}

        {/* Current Weather */}
        {currentWeather && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Weather
              </CardTitle>
              <CardDescription>{currentWeather.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center space-x-4">
                  {getWeatherIcon(currentWeather.condition)}
                  <div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {currentWeather.temperature}°C
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-300">{currentWeather.condition}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Humidity</div>
                      <div className="font-semibold">{currentWeather.humidity}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Wind Speed</div>
                      <div className="font-semibold">{currentWeather.windSpeed} km/h</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Visibility</div>
                      <div className="font-semibold">{currentWeather.visibility}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">UV Index</div>
                      <div className="font-semibold">{currentWeather.uvIndex}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7-Day Forecast */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>7-Day Forecast</CardTitle>
            <CardDescription>Plan your farming activities with extended weather predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {forecast.map((day, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="font-medium text-sm mb-2">{day.day}</div>
                  <div className="flex justify-center mb-2">{getForecastIcon(day.icon)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{day.condition}</div>
                  <div className="text-sm">
                    <div className="font-semibold">{day.high}°</div>
                    <div className="text-gray-500">{day.low}°</div>
                  </div>
                  <div className="mt-2">
                    <Badge variant={day.precipitation > 50 ? "default" : "secondary"} className="text-xs">
                      {day.precipitation}% rain
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Farming Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Farming Recommendations</CardTitle>
            <CardDescription>Weather-based suggestions for your farming activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-700 dark:text-green-400">Today's Activities</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Good day for irrigation - moderate temperature
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Suitable for pesticide application - low wind
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Monitor UV levels for worker safety
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">This Week's Outlook</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Rain expected Wednesday - postpone harvesting
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Good conditions for planting Thursday-Friday
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Weekend rain may affect field access
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
