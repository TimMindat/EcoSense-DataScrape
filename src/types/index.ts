export interface AirQualityData {
  date: string;
  location: string;
  aqi: number;
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
}

export interface WaterQualityData {
  date: string;
  location: string;
  ph: number;
  conductivity: number;
  turbidity: number;
}

export interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}