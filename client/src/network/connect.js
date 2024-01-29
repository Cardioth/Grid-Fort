import io from 'socket.io-client';
import { serverUrl } from './serverURL';
import { updateUniCreditsListener } from './updateCredits';

export let socket;
export let privs;

export function connectToServer(functionOnConnect){
  socket = io(serverUrl, { withCredentials: true });

  socket.on('connect', () => {
    console.log('Connected to the server: ' + serverUrl);
    functionOnConnect();
  });

  socket.on('privs', (cprivs) => {
    privs = cprivs;
    if(privs === "admin") {
      socket.on("consoleResponse", (response) => {
        console.log(response);
      });
    }
  });

  updateUniCreditsListener();
}
