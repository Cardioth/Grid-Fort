import { initGameScene, initMenuScene, initGUIScene, initPreloadScene, initAuthenticationScene, bloomPipeline} from "../graphics/sceneInitialization";
import { createBloomAdjuster } from '../graphics/testingGraphics/createBloomAdjuster';
import { resetGame } from './resetGame';
import { createLoginInterface } from "../ui/loginInterface";
import { createCollectionInterface } from "../ui/collectionGUI";
import { resizeCanvas } from "../graphics/resizeCanvas";
import { createProfileInterface } from "../ui/profileGUI";

export let currentScene;

export function setCurrentScene(setScene) {
    if(setScene === "preload" && currentScene === undefined){
        initGUIScene();
        initPreloadScene();
        resizeCanvas();
    }

    if(setScene === "authentication" && currentScene === "preload"){
        initGUIScene();
        initAuthenticationScene();
    }

    if(setScene === "authentication" && currentScene === "menu"){
        initGUIScene();
        createLoginInterface();
    }

    if(setScene === "menu" && (currentScene === "authentication" || currentScene === "profile")){
        initGUIScene();
        initMenuScene();
    }

    if(setScene === "collection" && currentScene === "menu"){
        initGUIScene();
        createCollectionInterface();
    }

    if(setScene === "profile" && currentScene === "menu"){
        initGUIScene();
        createProfileInterface();
    }

    if(setScene === "menu" && currentScene === "collection"){
        initGUIScene();
        initMenuScene();
    }

    if(setScene === "menu" && (currentScene === "build" || currentScene === "endBattle" || currentScene === "endGame")){
        resetGame();
        initGUIScene();
        initMenuScene();
    }

    if(setScene === "build" && currentScene === "menu"){
        initGUIScene();
        initGameScene();
        //createBloomAdjuster(bloomPipeline);
    }

    currentScene = setScene;
}