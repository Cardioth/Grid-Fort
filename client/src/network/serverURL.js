const isDevelopment = window.location.hostname === 'localhost';
export const serverUrl = isDevelopment ? 'http://localhost:3000' : 'https://grid-fort-server-d1b61f740a9b.herokuapp.com/';