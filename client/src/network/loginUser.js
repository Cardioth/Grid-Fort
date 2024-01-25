import { setCurrentScene } from "../managers/sceneManager";
import { fadeToBlack } from "../ui/generalGUI";
import { connectToServer } from "./connect";
import { createAuthMessage } from "./createAuthMessage";
import { unhideLoginButtons } from "../ui/loginInterface";
import { serverUrl } from "./serverURL";
import { setUniCredits } from "../data/config";

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
      setUniCredits(data.uniCredits); // Update uniCredits
      localStorage.setItem('loggedIn', true); // Store a flag in local storage
      localStorage.setItem('username', username); // Optionally store the username
      connectToServer();
      fadeToBlack( () => {
          setCurrentScene("menu");
      });
  })
  .catch(error => {
    createAuthMessage("Login failed", unhideLoginButtons);
  });
}

  