import { setCurrentScene } from "./managers/sceneManager";
setCurrentScene("preload");

import io from 'socket.io-client';

// Determine the environment and set the server URL accordingly
const isDevelopment = window.location.hostname === 'localhost';
const serverUrl = isDevelopment ? 'http://localhost:3000' : 'https://grid-fort-server.herokuapp.com';

// Connect to the server
const socket = io(serverUrl);

// Event listener for successful connection
socket.on('connect', () => {
  console.log('Connected to the server!' + serverUrl);
});

// Handle the event sent from the server
socket.on('some-event', (data) => {
  console.log('Data received:', data);
});
