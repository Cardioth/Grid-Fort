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
      // Update your game UI to reflect that the user is logged out
    })
    .catch(error => {
      console.error('Logout error:', error);
    });
}
  