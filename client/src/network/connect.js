import io from 'socket.io-client';
import { serverUrl } from './serverURL';
import { updateUniCreditsListener } from './updateCredits';

export let socket;

export function connectToServer(){
  socket = io(serverUrl, { withCredentials: true });
    
  socket.on('connect', () => {
    console.log('Connected to the server: ' + serverUrl);
  });

  updateUniCreditsListener();
}
