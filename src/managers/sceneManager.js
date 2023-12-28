import { initGameScene, initMenuScene, disposeGameScene, initGUIScene, initPreloadScene} from "../graphics/sceneInitialization";

export let currentScene;

export function setCurrentScene(setScene) {
    if(setScene === "preload" && currentScene === undefined){
        initGUIScene();
        initPreloadScene();
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