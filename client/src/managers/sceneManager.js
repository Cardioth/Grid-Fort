import { initGameScene, initMenuScene, initGUIScene, initPreloadScene, initAuthenticationScene} from "../graphics/sceneInitialization";
import { resetGame } from './resetGame';
import { createLoginInterface } from "../ui/loginInterface";
import { createCollectionInterface } from "../ui/collectionGUI";

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

    if(setScene === "collection" && currentScene === "menu"){
        initGUIScene();
        createCollectionInterface();
    }

    if(setScene === "menu" && currentScene === "collection"){
        initGUIScene();
        initMenuScene();
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

    currentScene = setScene;
}