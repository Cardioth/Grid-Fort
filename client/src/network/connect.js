import io from 'socket.io-client';
import { serverUrl } from './serverURL';
import { updateUniCreditsListener } from './updateCredits';

export let socket;
export let privs;

export function connectToServer(functionOnPrivs){
  socket = io(serverUrl, { withCredentials: true });

  socket.on('connect', () => {
    console.log('Connected to the server: ' + serverUrl);
  });

  socket.on('privs', (cprivs) => {
    functionOnPrivs();
    privs = cprivs;
    if(privs === "admin") {
      socket.on("consoleResponse", (response) => {
        console.log(response);
      });
    }
  });

  updateUniCreditsListener();
}
