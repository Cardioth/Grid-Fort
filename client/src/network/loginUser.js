import { setCurrentScene } from "../managers/sceneManager";
import { fadeToBlack } from "../ui/generalGUI";
import { connectToServer } from "./connect";
import { createAuthMessage } from "./createAuthMessage";
import { unhideLoginButtons } from "./loginInterface";
import { serverUrl } from "./serverURL";

export function loginUser(username, password) {
    fetch(serverUrl+"/auth/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            localStorage.setItem('loggedIn', true); // Store a flag in local storage
            localStorage.setItem('username', username); // Optionally store the username
            connectToServer();
            fadeToBlack( () => {
                setCurrentScene("menu");
            });
        } else {
            throw new Error('Login failed');
        }
    })
    .catch(error => {
      createAuthMessage("Login failed", unhideLoginButtons);
      console.error('Login error:', error);
    });
  }
  