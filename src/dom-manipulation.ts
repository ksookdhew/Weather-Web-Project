import { fetchCity7DayForecast, fetchCityWeather } from "./api.ts";
import { WEATHER_CODES, WEATHER_ICONS, WEATHER_IMAGES } from "./constants.ts";
import { City, WeatherResponse } from "./interfaces.ts";
import { cities } from "./utilities.ts";

export async function displayWeather() {
  const detailsDiv = document.querySelector<HTMLDivElement>("#app > #detail");
  detailsDiv?.remove();

  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const homeDiv = document.createElement("div");
  homeDiv.id = "home";
  homeDiv.className = "flex flex-col gap-4 w-full items-center text-white";

  const pageTitle = document.createElement("h1");
  pageTitle.className = "text-white text-4xl p-8 self-start";
  pageTitle.innerText = "Weather";
  homeDiv?.append(pageTitle);

  for (const city of cities) {
    const cityDiv = document.createElement("div");

    const weatherData = await fetchCityWeather(city);

    cityDiv.className = `flex bg-${
      WEATHER_CODES[weatherData.current.weather_code]
    } w-10/12 justify-between rounded-md p-5 `;

    const cityTitle = document.createElement("h3");
    cityTitle.className = "w-fit";
    cityTitle.innerText = city.name;
    cityDiv.append(cityTitle);

    const weatherDiv = document.createElement("div");
    weatherDiv.className = "flex w-fit gap-4";

    const weatherIcon = document.createElement("div");
    weatherIcon.innerHTML = `  <svg
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      viewBox="0 0 24 24"
      height="20px"
      width="20px"
      xmlns="http://www.w3.org/2000/svg"
    >
        ${WEATHER_ICONS[weatherData.current.weather_code]}
    </svg>`;

    const temperature = document.createElement("h2");
    temperature.innerText = `${weatherData.current.temperature_2m.toFixed(0)}°`;

    weatherDiv.append(weatherIcon);
    weatherDiv.append(temperature);
    cityDiv.append(weatherDiv);

    cityDiv.addEventListener("click", () =>
      displayWeatherDetail(city, weatherData)
    );
    homeDiv.append(cityDiv);
  }

  appDiv?.append(homeDiv);
}

export async function displayWeatherDetail(city: City, today: WeatherResponse) {
  const homeDiv = document.querySelector<HTMLDivElement>("#app > #home");
  homeDiv?.remove();

  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const detailDiv = document.createElement("div");
  detailDiv.id = "detail";
  detailDiv.className = "flex flex-col w-full items-center h-screen";

  const weatherDetail = await fetchCity7DayForecast(city);

  const todayDiv = document.createElement("div");
  todayDiv.className = "text-white text-center w-full self-center p-8 h-2/5";
  todayDiv.setAttribute(
    "style",
    `background: url("/src/images/${
      WEATHER_IMAGES[today.current.weather_code]
    }") no-repeat center center/cover;`
  );

  const cityTitle = document.createElement("h3");
  cityTitle.className = "text-2xl";
  cityTitle.innerText = `${city.name}`;
  todayDiv.append(cityTitle);

  const tempElement = document.createElement("h2");
  tempElement.className = "text-4xl";
  tempElement.innerText = `${today.current.temperature_2m.toFixed(0)}°`;
  todayDiv.append(tempElement);

  const weatherDescription = document.createElement("h4");
  weatherDescription.className = "text-xl";
  weatherDescription.innerText = `${WEATHER_CODES[today.current.weather_code]}`;
  todayDiv.append(weatherDescription);

  const highLowTemps = document.createElement("h4");
  highLowTemps.className = "text-lg";
  highLowTemps.innerText = `H:${weatherDetail.daily.temperature_2m_max[0]}° L:${weatherDetail.daily.temperature_2m_min[0]}°`;
  todayDiv.append(highLowTemps);

  detailDiv.append(todayDiv);

  const gridDiv = document.createElement("div");
  gridDiv.className = `w-full grid grid-cols-4 gap-4 text-center text-white p-5 justify-center bg-${
    WEATHER_CODES[today.current.weather_code]
  }`;

  for (let i = 0; i < weatherDetail.daily.time.length; i++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "contents";

    const dayName = document.createElement("div");
    dayName.className = "text-left";
    dayName.innerText =
      i === 0
        ? "Today"
        : new Date(weatherDetail.daily.time[i]).toLocaleDateString("en-US", {
            weekday: "long",
          });
    dayDiv.append(dayName);

    const weatherIconDiv = document.createElement("div");
    weatherIconDiv.className = "place-self-center";
    weatherIconDiv.innerHTML = `
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="0"
          viewBox="0 0 24 24"
          height="20px"
          width="20px"
          xmlns="http://www.w3.org/2000/svg"
        >
           ${WEATHER_ICONS[weatherDetail.daily.weather_code[i]]}
        </svg>`;
    dayDiv.append(weatherIconDiv);

    const tempMin = document.createElement("div");
    tempMin.innerText = `${weatherDetail.daily.temperature_2m_min[i]}°`;
    dayDiv.append(tempMin);

    const tempMax = document.createElement("div");
    tempMax.innerText = `${weatherDetail.daily.temperature_2m_max[i]}°`;
    dayDiv.append(tempMax);

    gridDiv.append(dayDiv);
  }

  detailDiv.append(gridDiv);

  const backButtonDiv = document.createElement("div");
  backButtonDiv.className = "flex justify-end w-10/12";

  const backButton = document.createElement("div");
  backButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  backButton.innerHTML = `
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 576 512"
        height="20px"
        width="20px"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M401.4 224h-214l83-79.4c11.9-12.5 11.9-32.7 0-45.2s-31.2-12.5-43.2 0L89 233.4c-6 5.8-9 13.7-9 22.4v.4c0 8.7 3 16.6 9 22.4l138.1 134c12 12.5 31.3 12.5 43.2 0 11.9-12.5 11.9-32.7 0-45.2l-83-79.4h214c16.9 0 30.6-14.3 30.6-32 .1-18-13.6-32-30.5-32z"></path>
      </svg>`;
  backButton.addEventListener("click", () => {
    displayWeather();
  });
  backButtonDiv.append(backButton);

  detailDiv.append(backButtonDiv);

  appDiv?.append(detailDiv);
}
