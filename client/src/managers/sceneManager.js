import { initGameScene, initMenuScene, initGUIScene, initPreloadScene, initAuthenticationScene} from "../graphics/sceneInitialization";
import { resetGame } from './resetGame';
import { createLoginInterface } from "../network/loginInterface";

export let currentScene;

export function setCurrentScene(setScene) {
    if(setScene === "preload" && currentScene === undefined){
        initGUIScene();
        initPreloadScene();
    }

    if(setScene === "authentication" && currentScene === "preload"){
        initGUIScene();
        initAuthenticationScene();
    }

    if(setScene === "authentication" && currentScene === "menu"){
        initGUIScene();
        createLoginInterface();
    }

    if(setScene === "menu" && currentScene === "authentication"){
        initGUIScene();
        initMenuScene();
    }

    if(setScene === "build" && currentScene === undefined){
        initGUIScene();
        initGameScene();
    }

    if(setScene === "menu" && (currentScene === "build" || currentScene === "endBattle")){
        resetGame();
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