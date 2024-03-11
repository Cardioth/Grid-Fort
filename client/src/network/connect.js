import io from 'socket.io-client';
import { serverUrl } from './serverURL';
import { updateUniCreditsListener } from './updateCredits';
import { setCollection } from '../managers/collectionManager';

export let socket;
export let privs;
export let fetchingCollection = false;

export function setFetchingCollection(value){
  fetchingCollection = value;
}

export function connectToServer(functionOnPrivs){
  socket = io(serverUrl, { withCredentials: true });

  socket.on('connect', () => {
    console.log('Connected to the server: ' + serverUrl);
    if(localStorage.getItem('collection') === null || localStorage.getItem('collectionDate') === null || Date.now() - localStorage.getItem('collectionDate') > 86400000){
      socket.emit("getCollection");
    } else {
      setCollection(JSON.parse(localStorage.getItem('collection')), false);
    }
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

  socket.on("getCollectionResponse", (response) => {
      fetchingCollection = false
      setCollection(response, true);
      localStorage.setItem('collectionDate', Date.now());
  });

  updateUniCreditsListener();
}
