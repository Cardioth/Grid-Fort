import { initGameScene, initMenuScene, disposeGameScene, initGUIScene, initPreloadScene} from "../graphics/sceneInitialization";
import { connectToServer } from "../network/connect";

export let currentScene;

export function setCurrentScene(setScene) {
    if(setScene === "preload" && currentScene === undefined){
        initGUIScene();
        initPreloadScene();
        connectToServer();
    }

    if(setScene === "menu" && currentScene === "preload"){
        initGUIScene();
        initMenuScene();
    }

    if(setScene === "build" && currentScene === undefined){
        initGUIScene();
        initGameScene();
    }

    if(setScene === "menu" && currentScene === "build"){
        disposeGameScene();
        initGUIScene();
        initMenuScene();
    }

    if(setScene === "build" && currentScene === "menu"){
        initGUIScene();
        initGameScene();
    }
    if(setScene === "battleCountdown"  && currentScene === "build"){

    }

    currentScene = setScene;
}