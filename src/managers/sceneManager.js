import { initGameScene, initMenuScene, disposeGUIScene, disposeGameScene, initGUIScene} from "../graphics/sceneInitialization";

export let currentScene;

export function setCurrentScene(setScene) {
    if(setScene === "menu" && currentScene === undefined){
        initGUIScene();
        initMenuScene();
    }

    if(setScene === "build" && currentScene === undefined){
        initGUIScene();
        initGameScene();
    }

    if(setScene === "menu" && currentScene === "build"){
        disposeGameScene();
        disposeGUIScene();
        initGUIScene();
        initMenuScene();
    }

    if(setScene === "build" && currentScene === "menu"){
        disposeGameScene();
        disposeGUIScene();
        initGUIScene();
        initGameScene();
    }

    currentScene = setScene;
}