import Mapbox from '@rnmapbox/maps';
import { ENV } from './env';

export const initMapbox = () => {
  Mapbox.setAccessToken(ENV.MAPBOX_ACCESS_TOKEN);
};

export const MAPBOX_TOKEN = ENV.MAPBOX_ACCESS_TOKEN;
