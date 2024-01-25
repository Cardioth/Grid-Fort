import io from 'socket.io-client';
import { serverUrl } from './serverURL';
import { updateUniCreditsListener } from './updateCredits';

export let socket;
export let privs;

export function connectToServer(){
  socket = io(serverUrl, { withCredentials: true });
  console.log('Connecting to the server: ' + serverUrl);
    
  socket.on('connect', () => {
    console.log('Connected to the server: ' + serverUrl);
  });

  socket.on('privs', (cprivs) => {
    privs = cprivs;    
  });

  updateUniCreditsListener();
}
