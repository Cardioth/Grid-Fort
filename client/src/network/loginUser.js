import { setCurrentScene } from "../managers/sceneManager";
import { fadeToBlack } from "../ui/generalGUI";
import { connectToServer, socket } from "./connect";
import { createAlertMessage } from "./createAlertMessage";
import { unhideLoginButtons } from "../ui/loginInterface";
import { serverUrl } from "./serverURL";
import { setUniCredits } from "../../../common/data/config";

export function loginUser(username, password) {
  fetch(serverUrl+"/auth/login", {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => {
      if (response.ok) {
          return response.json(); // Parse the JSON in the response
      } else {
          throw new Error('Login failed');
      }
  })
  .then(data => {
      localStorage.setItem('loggedIn', true); // Store a flag in local storage
      localStorage.setItem('username', username); // Optionally store the username
      connectToServer(()=>{
        fadeToBlack(()=>{
          setUniCredits(data.uniCredits);
          setCurrentScene("menu");
          socket.emit("getCollection");
        });
      });
  })
  .catch(error => {
    createAlertMessage("Login failed", unhideLoginButtons);
  });
}