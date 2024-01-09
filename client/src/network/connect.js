import io from 'socket.io-client';

export let socket;

export function connectToServer(){
    const isDevelopment = window.location.hostname === 'localhost';
    const serverUrl = isDevelopment ? 'http://localhost:3000' : 'https://grid-fort-server-d1b61f740a9b.herokuapp.com/';
    
    socket = io(serverUrl);
    
    socket.on('connect', () => {
      console.log('Connected to the server!' + serverUrl);
    });

    socket.on('some-event', (data) => {
      console.log('Data received:', data);
    });
}
