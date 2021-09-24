import './App.scss';
import React, { useEffect, useState } from 'react';

const API_URL = 'https://api.openweathermap.org/data/2.5/onecall?'
const API_KEY = 'a210cb44ef008c00232a0254377c16d0'
//Parameters
let city = null;
let currentWeather = null;
let currentTemp = null;
let sunrise = null;
let sunset = null;
let currentHumidity = null;
let currentWind = null;
let daily = {};
let measure = "°C";
let distanceTime = "m/s";

const createApi = ({ lon, lat }) => {
  if (measure == "°C") {
    return `${API_URL}lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${API_KEY}`
  } else {
    return `${API_URL}lat=${lat}&lon=${lon}&exclude=minutely&units=imperial&appid=${API_KEY}`
  }
}

const getCoords = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude

      })
      )
    } else {
      reject('Could not find you location')
    }
  })
}

const toJSON = response => response.json()

const getWeatherData = (setWeather) =>
  getCoords()
    .then(createApi)
    .then(fetch)
    .then(toJSON)
    .then(setWeather);

const timeTraslate = (epoch) => {
  let date = new Date(epoch * 1000);
  let hour = date.getHours();
  let minute = date.getMinutes();
  if (minute < 10) {
    minute = `0${minute}`
  } if (hour < 10) {
    hour = `0${hour}`
  }
  return `${hour}:${minute}`;
}

const timeTrim = (weatherHourly) => {
  for (let i = 0; i < 23; i++) {
    if (timeTraslate(weatherHourly[i].date) == "00:00") {
      return i;
    }
  }
}

const dayTranslate = (epoch) => {
  let newDate = new Date(epoch * 1000);
  switch (newDate.getDay()) {
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    case 0:
      return "Sunday";
    default:
      return "error";
  }
}

function App() {
  const [weather, setWeather] = useState({});
  const [hourly, setHourly] = useState({});

  useEffect(() => {
    getWeatherData(setWeather)
  }, [getWeatherData])

  useEffect(() => {
    if (weather.timezone) {
      city = weather.timezone.slice(7);
      currentWeather = weather.current.weather[0].description;
      currentTemp = Math.floor(weather.current.temp);
      sunrise = timeTraslate(weather.current.sunrise);
      sunset = timeTraslate(weather.current.sunset);
      currentWind = weather.current.wind_speed;
      currentHumidity = weather.current.humidity;
      daily = weather.daily.slice(1, 6);
      setHourly(weather.hourly.slice(0, timeTrim(weather.hourly)));
    } else {
      city = "Could not get weather"
    }

  }, [weather])

  const convert = () => {
    if (measure == "°F") {
      measure = "°C";
      distanceTime = "m/s"
    } else {
      measure = "°F";
      distanceTime = "mph"
    }
    getWeatherData(setWeather);
  }

  return (
    <div className="App">
      <div className="switchOn">
        <h1>{city}</h1>
        <button onClick={() => { convert() }}>Switch Units </button>
      </div>
      <div className="current-weather">
        <h3 className="current-weather__content">Current Temperature is: {currentWeather}</h3>
        <h3 className="current-weather__temp">{currentTemp}{measure}</h3>
      <div className="current-weather__info">
        <p><i class="fas fa-wind" title="wind"></i>Wind: {currentWind}{distanceTime}</p>
        <p><i class="fa fa-tint" aria-hidden="true"></i>Humidity: {currentHumidity}%</p>
        <p>Sunrise at: {sunrise}</p>
        <p>Sunset at: {sunset}</p>
      </div>
      </div>

      <div className="hourly-forecast">
        <h3 className="hourly-forecast__title">Hourly Forecast</h3>
        <div className="hourly-forecast__item">
          {hourly.map && hourly.map(hour => (
            <div>
              <p className="hourly-forecast__time">{timeTraslate(hour.dt)}</p>
              <p className="hourly-forecast__temp">{Math.floor(hour.temp)}{measure}</p>
              <p className="hourly-forecast__weather"></p>
              <p className="hourly-forecast__wind">{hour.wind_speed}{distanceTime}</p>
              <p className="hourly-forecast__humidity"><i class="fa fa-tint" aria-hidden="true"></i>{hour.humidity}%</p>
            </div>
          ))}
        </div>
      </div>  
      
      <div className="daily">
        <h2 className="daily-title">Forecast for 5 days</h2>
        <div className="daily__content">
          {daily.map && daily.map(day => (
            <div className="dayContainer">
              <p className="dayData"><b>{dayTranslate(day.dt)}</b></p>
              <p className="dayData">{day.weather[0].main}</p>
              <p className="dayData">{Math.floor(day.temp.max)}{measure} / {Math.floor(day.temp.min)}{measure}</p>
              <p className="daydata"></p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;