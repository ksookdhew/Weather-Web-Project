import { fetchCityWeather } from "./api.ts";
import { WEATHER_CODES, WEATHER_ICONS } from "./constants.ts";
import { cities } from "./utilities.ts";

export async function displayWeather() {
  const detailsDiv = document.querySelector<HTMLDivElement>("#app > #detail");
  detailsDiv?.remove();

  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const homeDiv = document.createElement("div");
  homeDiv.id = "home";
  homeDiv.className = "flex flex-col gap-4 w-full items-center text-white";

  for (const city of cities) {
    const cityDiv = document.createElement("div");

    const weatherData = await fetchCityWeather(city);

    cityDiv.className = `flex bg-${
      WEATHER_CODES[weatherData.current.weather_code]
    } w-10/12 justify-between rounded-md p-5 cursor-pointer transition hover:scale-110`;

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
      <path fill="none" d="M0 0h24v24H0z"></path>
        ${WEATHER_ICONS[weatherData.current.weather_code]}
    </svg>`;

    const temperature = document.createElement("h2");
    temperature.innerText = `${weatherData.current.temperature_2m.toFixed(0)}°`;

    weatherDiv.append(weatherIcon);
    weatherDiv.append(temperature);
    cityDiv.append(weatherDiv);

    cityDiv.addEventListener("click", () => console.log(cityDiv));
    homeDiv.append(cityDiv);
  }

  appDiv?.append(homeDiv);
}
