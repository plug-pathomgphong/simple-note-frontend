export const getBaseUrl = () => {
  return window.__APP_CONFIG__?.VITE_BASE_API || '';
};