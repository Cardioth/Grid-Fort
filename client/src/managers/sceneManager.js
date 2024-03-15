import { initGameScene, initMenuScene, initGUIScene, initPreloadScene, initAuthenticationScene, bloomPipeline} from "../graphics/sceneInitialization";
import { createBloomAdjuster } from '../graphics/testingGraphics/createBloomAdjuster';
import { resetGame } from './resetGame';
import { createLoginInterface } from "../ui/uiElements/loginInterface";
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

    if(setScene === "authentication" && currentScene === "collection"){
        initGUIScene();
        createLoginInterface();
    }

    if(setScene === "collection"){
        if(currentScene === "build" || currentScene === "endBattle" || currentScene === "endGame"){
            resetGame();
        }
        initGUIScene();
        createCollectionInterface();
    }

    if(setScene === "profile"){
        initGUIScene();
        createProfileInterface();
    }

    if(setScene === "build"){
        initGUIScene();
        initGameScene();
        //createBloomAdjuster(bloomPipeline);
    }

    currentScene = setScene;
}