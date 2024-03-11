import { serverUrl } from "./serverURL";
import { socket } from "./connect";
import { fadeToBlack } from "../ui/generalGUI";
import { setCurrentScene } from "../managers/sceneManager";

export function signOutUser() {
    fetch(serverUrl + "/auth/logout", {
      method: 'GET',
      credentials: 'include' // Include credentials to make sure the cookie is sent
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      // Clear any local storage flags or session data
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('collection');
      // Update your game UI to reflect that the user is logged out
      socket.disconnect();
      fadeToBlack(
        () => {
            setCurrentScene("authentication");
        }
      );
    })
    .catch(error => {
      console.error('Logout error:', error);
    });
}
  