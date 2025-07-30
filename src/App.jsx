import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function App() {
  const [location, setLocation] = useState("Jakarta");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [date, setDate] = useState({
    day: "Monday",
    fullDate: "04 September",
  });

  const [condition, setCondition] = useState("Cloudy");
  const [weather, setWeather] = useState({
    temp: "",
    desc: "",
    icon: "",
  });

  const [dataStats, setDataStats] = useState([]);
  const [forecastData, setForecastData] = useState([]);

  const API_KEY = "6cedc718b0add3f84ad2469132a15ef7";

  const getWeatherIcon = (cond) => {
    switch (cond) {
      case "Clouds":
        return "/filter_drama.png";
      case "Rain":
        return "/rainy.png";
      case "Clear":
        return "/light_mode.png";
      default:
        return "/help.png";
    }
  };

  const getBackgroundByCondition = (cond) => {
    switch (cond) {
      case "Clouds":
        return "bg-[#2e2e2e]";
      case "Rain":
        return "bg-blue-900";
      case "Clear":
        return "bg-yellow-500";
      default:
        return "bg-gray-800";
    }
  };

  const fetchSuggestions = async (input) => {
    if (input.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${API_KEY}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSelectCity = (city) => {
    const fullName = `${city.name}${city.state ? ", " + city.state : ""}, ${
      city.country
    }`;
    setLocation(fullName);
    setQuery("");
    setSuggestions([]);
  };

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
    )
      .then((res) => res.json())
      .then((data) => {
        setCondition(data.weather[0].main);
        setWeather({
          temp: `${Math.round(data.main.temp)}°`,
          desc: data.weather[0].main,
          icon: getWeatherIcon(data.weather[0].main),
        });
        setDataStats([
          {
            icon: "/air.png",
            value: `${data.wind.speed} m/s`,
            label: "Wind",
          },
          {
            icon: "/humidity_low.png",
            value: `${data.main.humidity}%`,
            label: "Humidity",
          },
          {
            icon: "/cloud.png",
            value: `${data.clouds.all}%`,
            label: "Clouds",
          },
          {
            icon: "/device_thermostat.png",
            value: `${Math.round(data.main.feels_like)}°`,
            label: "Real Feel",
          },
        ]);
      })
      .catch((error) => {
        console.error("Gagal fetch data:", error);
      });

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`
    )
      .then((res) => res.json())
      .then((data) => {
        const dailyData = [];
        const addedDates = new Set();
        data.list.forEach((item) => {
          const date = new Date(item.dt_txt);
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "long",
          });
          const dateKey = date.toDateString();
          if (!addedDates.has(dateKey)) {
            addedDates.add(dateKey);
            dailyData.push({
              day: dayName,
              icon: getWeatherIcon(item.weather[0].main),
              temp: `${Math.round(item.main.temp)}°`,
              desc: item.weather[0].main,
            });
          }
        });
        setForecastData(dailyData.slice(0, 5));
      })
      .catch((error) => {
        console.error("Gagal fetch forecast:", error);
      });
  }, [location]);

  const bgColor = getBackgroundByCondition(condition);

  return (
    <div
      className={`min-h-screen ${bgColor} text-white flex items-center justify-center transition-colors duration-500`}
    >
      <div className="w-[600px] p-8 text-sm">
        <div className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Insert your city name"
            className="w-full bg-transparent border-b border-white/40 text-white placeholder-white/60 pr-6 focus:outline-none text-xs italic p-2"
          />
          <Search className="absolute right-0 top-1.5 w-4 h-4 text-white/60" />
          {suggestions.length > 0 && (
            <div className="absolute z-10 bg-white text-black mt-2 w-full max-h-48 overflow-y-auto rounded shadow">
              {suggestions.map((city, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectCity(city)}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-sm"
                >
                  {city.name}
                  {city.state ? `, ${city.state}` : ""}, {city.country}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="leading-tight flex gap-10 my-10 items-center">
          <div>
            <p className="text-white font-bold text-2xl">{date.day}</p>
            <p className="text-white/80 text-2xl">{date.fullDate}</p>
          </div>
          <h1 className="text-[50px] font-bold">{location}</h1>
        </div>

        <hr className="border-white/40 my-4" />

        <div className="my-10 flex items-center">
          <div>
            <h2 className="text-[93px] font-normal mb-[-20px]">
              {weather.temp}
            </h2>
            <p className="text-white/80 text-[23px]">{weather.desc}</p>
          </div>
          <img src={weather.icon} alt="Weather Icon" className="h-32" />
        </div>

        <hr className="border-white/40 my-4" />

        <div className="grid grid-cols-4 text-center text-xs text-white/80 mb-6 gap-y-2">
          {dataStats.map((item, index) => (
            <div key={index} className="flex flex-col items-start">
              <div className="flex gap-2 items-center">
                <img src={item.icon} alt={item.label} className="h-6 mb-1" />
                <span className=" text-[20px] text-white">{item.value}</span>
              </div>
              <span className="mt-1">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="text-white/80 text-xs mt-6">
          <h3 className="mb-2 tracking-wide">Weekly Forecast</h3>
          <div className="flex gap-2">
            {forecastData.map((item, index) => (
              <div
                key={index}
                className="bg-white/10 p-3 rounded-md w-24 text-center"
              >
                <p className="mb-1">{item.day}</p>
                <img src={item.icon} alt={item.desc} className="h-6 mx-auto" />
                <p className="text-white font-semibold mt-1">{item.temp}</p>
                <p className="mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
