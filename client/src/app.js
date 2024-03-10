import { setCurrentScene } from "./managers/sceneManager";
setCurrentScene("preload");

document.addEventListener('touchstart', function(event) {
    if (event.target.nodeName === 'BUTTON' || event.target.nodeName === 'A') {
      event.preventDefault();
    }
  }, false);