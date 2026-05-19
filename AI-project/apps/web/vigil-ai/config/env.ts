// ============================================================
// VIGIL AI — Environment Configuration
// Reads from EXPO_PUBLIC_ vars (set in .env file)
// Falls back to LAN dev values for testing
// ============================================================

const IS_DEV = process.env.NODE_ENV !== 'production';

// Resolve host dynamically in browser or fallback to localhost/LAN IP
const getDevHost = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

const devHost = getDevHost();

// Backend base URL — defaults to your dynamic LAN/localhost IP so physical devices and browsers can connect
const RAW_API_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (IS_DEV ? `http://${devHost}:3001/api/v1` : 'https://api.resqai.pk/api/v1');

const RAW_SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  (IS_DEV ? `http://${devHost}:3001` : 'https://api.resqai.pk');

export const ENV = {
  /** Full base URL for the axios API client (no trailing slash) */
  API_BASE_URL: RAW_API_URL,

  /** Socket.IO server URL (no path suffix) */
  SOCKET_URL: RAW_SOCKET_URL,

  /** Mapbox token for @rnmapbox/maps */
  MAPBOX_ACCESS_TOKEN:
    process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.YOUR_MAPBOX_TOKEN_HERE',

  /** Feature flags */
  ENABLE_REAL_AI: process.env.EXPO_PUBLIC_ENABLE_REAL_AI !== 'false',
  ENABLE_REAL_SOCKET: process.env.EXPO_PUBLIC_ENABLE_REAL_SOCKET !== 'false',

  IS_DEV,
};
