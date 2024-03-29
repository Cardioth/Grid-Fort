import { serverUrl } from "./serverURL";
import { unhideRegisterButtons, returnToLoginFromRegister } from "../ui/uiElements/registerInterface";
import { createAlertMessage } from "../ui/uiElements/createAlertMessage";
import { loginProceed } from "./loginUser";

export function registerUser(username, password) {
    fetch(serverUrl+"/auth/register", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 409) {
            console.log("User already exists");
            createAlertMessage("User already exists", unhideRegisterButtons);
            throw new Error('User already exists');
        } else if (response.status === 400) {
            console.log("Username can only contain letters");
            createAlertMessage("Username can only contain letters", unhideRegisterButtons);
            throw new Error('Username can only contain letters');
        } else {
            createAlertMessage("Failed to register user: " + response.status, unhideRegisterButtons);
            throw new Error('Registration failed with status: ' + response.status);
        }
    })
    .then(data => {
      if (data.message && data.message === "User registered and logged in successfully") {
        createAlertMessage("Registration Successful", loginProceed(username, data));
      }
    })
    .catch(error => {
    });
}