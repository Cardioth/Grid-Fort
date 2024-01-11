const isDevelopment = window.location.hostname === 'localhost';
export const serverUrl = isDevelopment ? 'http://localhost:3000' : 'https://api.gridfort.net';