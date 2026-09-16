// Dynamic detection of current host for production builds when env vars are not set
const getProductionApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  return 'http://localhost:8000';
};

const getProductionSocketUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  return 'ws://localhost:8000';
};

const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || getProductionApiUrl(),
  socketBaseurl: import.meta.env.VITE_SOCKET_URL || getProductionSocketUrl()
};

export default config;
