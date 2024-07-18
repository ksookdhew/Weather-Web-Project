import { City, GeocodeResponse } from "./interfaces.ts";

export function getSvgIcon(path: string, isWeatherIcon: boolean): string {
  let viewbox: string;
  isWeatherIcon ? (viewbox = "0 0 16 16") : (viewbox = "0 0 576 512");
  return ` <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="${viewbox}"
        height="20px"
        width="20px"
        xmlns="http://www.w3.org/2000/svg"
      >
        ${path}
     </svg>`;
}

export function extractCityData(cityData: GeocodeResponse): City {
  return {
    name: cityData.results[0].name,
    latitude: +cityData.results[0].latitude,
    longitude: +cityData.results[0].longitude,
  };
}
