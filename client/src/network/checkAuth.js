import { setUniCredits, uniCredits } from "../../../common/data/config";
import { initGUIScene } from "../graphics/sceneInitialization";
import { setCurrentScene } from "../managers/sceneManager";
import { fadeToBlack } from "../ui/generalGUI";
import { connectToServer } from "./connect";
import { createLoginInterface } from "../ui/uiElements/loginInterface";
import { serverUrl } from "./serverURL";
import { goToCollection } from "../ui/menuGUI";

export function checkAuth(){
    fetch(serverUrl + "/auth/checkAuth", {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },})
    .then(response => response.json())
    .then(data => {
      if (data.auth) {
        connectToServer(()=>{
          fadeToBlack(()=>{
            setUniCredits(data.uniCredits);
            goToCollection();
          });
        });
      } else {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        fadeToBlack(()=>{
          initGUIScene();
          createLoginInterface();
        });
      }
    })
    .catch(error => {
      console.error('Error checking authentication:', error);
    });
}
