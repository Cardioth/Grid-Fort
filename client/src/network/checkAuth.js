import { setCurrentScene } from "../managers/sceneManager";
import { fadeToBlack } from "../ui/generalGUI";
import { connectToServer } from "./connect";
import { createLoginInterface } from "./loginInterface";
import { serverUrl } from "./serverURL";

export function checkAuth(){
    fetch(serverUrl + "/auth/checkAuth")
    .then(response => response.json())
    .then(data => {
      if (data.authenticated) {
        connectToServer();
        fadeToBlack(setCurrentScene("menu"));
      } else {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        createLoginInterface();
      }
    })
    .catch(error => {
      console.error('Error checking authentication:', error);
    });
}
