const isDevelopment = window.location.hostname === 'localhost';
export const serverUrl = isDevelopment ? 'https://localhost:3000' : 'https://api.gridfort.net';