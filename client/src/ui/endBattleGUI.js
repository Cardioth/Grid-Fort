import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUI3Dscene, GUITexture } from '../graphics/sceneInitialization.js';
import { GUIscene } from "../graphics/sceneInitialization.js";
import { returnToBuildScene } from "../gameplay/endBattle.js";
import { getImage } from "../graphics/loadImages.js";
import { medals, strikes } from "../managers/gameSetup.js";
import { playerBoard, enemyBoard } from "../managers/gameSetup.js";
import { camelCaseToTitleCase } from "../utilities/utils.js";
import { currentScene, setCurrentScene } from "../managers/sceneManager.js";
import { createEndGameScreen, fadeInContinueButton } from "./endGameGUI.js";
import { createCustomButton } from "./createCustomButton.js";
import { socket } from "../network/connect.js";
import { createLootBoxes } from "../graphics/createLootBoxes.js";

export function createEndBattleScreen(victory){
    //container
    const container = new GUI.Rectangle();
    container.width = "100%";
    container.height = "100%";
    container.thickness = 0;

    const endBattleDarkness = new GUI.Rectangle();
    endBattleDarkness.width = "100%";
    endBattleDarkness.height = "100%";
    endBattleDarkness.thickness = 0;
    endBattleDarkness.background = "black";
    endBattleDarkness.alpha = 0.7;
    endBattleDarkness.zIndex = 1;
    container.addControl(endBattleDarkness);

    //Bottom panel image
    const endBattleBacking = new GUI.Image("endBattleBacking", getImage("endBattleBacking.png"));
    endBattleBacking.width = "929px";
    endBattleBacking.height = "344px";
    endBattleBacking.zIndex = 2;
    container.addControl(endBattleBacking);

    if(victory){
        const victoryText = new GUI.Image("victoryText", getImage("victoryText.png"));
        victoryText.width = "254px";
        victoryText.height = "51px";
        victoryText.top = "-132px";
        victoryText.left = "343px";
        victoryText.zIndex = 3;
        container.addControl(victoryText);
    } else {
        const defeatText = new GUI.Image("defeatText", getImage("defeatText.png"));
        defeatText.width = "254px";
        defeatText.height = "51px";
        defeatText.top = "-132px";
        defeatText.left = "343px";
        defeatText.zIndex = 3;
        container.addControl(defeatText);
    }
    //Text Container
    const textContainer = new GUI.Rectangle();
    textContainer.width = "1000px";
    textContainer.height = "1000px";
    textContainer.left = "-300px";
    textContainer.thickness = 0;

    //Medals Text
    const medalText = new GUI.TextBlock();
    medalText.text = "Medals: " + medals;
    medalText.color = "#92EDFF";
    medalText.fontSize = 20;
    medalText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    medalText.top = "-83px";
    medalText.left = "860px";
    medalText.fontFamily = "GemunuLibre-Bold";
    medalText.zIndex = 4;
    textContainer.addControl(medalText);

    //Strike Text
    const strikeText = new GUI.TextBlock();
    strikeText.text = "Strikes: " + strikes + "/ 7";
    strikeText.color = "#FF5D48";
    strikeText.fontSize = 20;
    strikeText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    strikeText.top = "17px";
    strikeText.left = "860px";
    strikeText.fontFamily = "GemunuLibre-Bold";
    strikeText.zIndex = 5;
    textContainer.addControl(strikeText);

    //Your Stats Text
    const yourStatsText = new GUI.TextBlock();
    yourStatsText.text = "Your Stats:";
    yourStatsText.color = "white";
    yourStatsText.fontSize = 20;
    yourStatsText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    yourStatsText.top = "-113px";
    yourStatsText.left = "357px";
    yourStatsText.fontFamily = "GemunuLibre-Bold";
    yourStatsText.zIndex = 6;
    textContainer.addControl(yourStatsText);

    //Enemy Stats Text
    const enemyStatsText = new GUI.TextBlock();
    enemyStatsText.text = "Opponent Stats:";
    enemyStatsText.color = "white";
    enemyStatsText.fontSize = 20;
    enemyStatsText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    enemyStatsText.top = "-113px";
    enemyStatsText.left = "603px";
    enemyStatsText.fontFamily = "GemunuLibre-Bold";
    enemyStatsText.zIndex = 7;
    textContainer.addControl(enemyStatsText);

    //Continue Button
    const continueButton = createCustomButton("Continue", () => {
        if(currentScene === "endBattle"){
            const animation = new BABYLON.Animation("containerFadeOut", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            animation.setKeys([
                { frame: 0, value: 1 },
                { frame: 30, value: 0 }
            ]);
            container.animations = [];
            container.animations.push(animation);
            let ease = new BABYLON.CubicEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
            animation.setEasingFunction(ease);    

            if(strikes >= 7){
                setCurrentScene("endGame");
                GUIscene.beginDirectAnimation(container, [container.animations[0]], 0, 30, false, 1, function(){
                    container.dispose();
                });
                createEndGameScreen();
                socket.emit("endGame");                
                socket.once("endGameResponse", (rewards) => {
                    GUIscene.rewardsReady = true;
                    if(GUIscene.lootBoxReady && !GUIscene.rewardsDisplayed){
                        createLootBoxes(GUI3Dscene, rewards);
                        GUIscene.rewardsDisplayed = true;
                    }
                    if(!GUIscene.lootBoxReady){
                        GUIscene.rewards = rewards;
                    }
                    if(rewards.length === 0){
                        fadeInContinueButton(GUIscene.continueButtonEndGame);
                    }
                });
            } else {
                GUIscene.beginDirectAnimation(container, [container.animations[0]], 0, 30, false, 1, function(){
                    container.dispose();
                });
                returnToBuildScene();
            }
        }
    });
    continueButton.top = 118;
    continueButton.left = 321;
    continueButton.zIndex = 20;
   
    container.addControl(continueButton);

    //Strike Icons
    for (let i = 0; i < strikes; i++) {
        const strikeIcon = new GUI.Image("strikeIcon", getImage("strikeIcon.png"));
        strikeIcon.width = "55px";
        strikeIcon.height = "55px";
        strikeIcon.top = "66px";
        strikeIcon.left = 80 + i*54;
        strikeIcon.zIndex = 9;
        container.addControl(strikeIcon);
    }

    //Medal Icons
    function getMedalImage(medalCount) {
        if (medalCount < 6) {
            return "medalIcon1.png"; // Level 1 Medal
        } else if (medalCount < 12) {
            return "medalIcon2.png"; // Level 2 Medal
        } else {
            return "medalIcon3.png"; // Level 3 Medal
        }
    }

    for (let i = 0; i < medals; i++) {
        const level = Math.floor(i / 6);
        const medalImage = getMedalImage(level * 6);
        const medalIcon = new GUI.Image("medalIcon", getImage(medalImage));
        medalIcon.width = "60px";
        medalIcon.height = "45px";
        medalIcon.top = "-36px";
        medalIcon.left = 85 + (i % 6) * 63;
        medalIcon.zIndex = 10;
        container.addControl(medalIcon);
    }

    //Fort Stats
    let lineHeight = 0;
    for(let key in playerBoard.stats){
        if(playerBoard.stats[key].stat !== 0){
            let text = camelCaseToTitleCase(key) + ": " + playerBoard.stats[key].stat;
            const statsText = new GUI.TextBlock();
            statsText.text = text;
            statsText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            statsText.color = "#262323";
            statsText.fontSize = 16;
            statsText.top = -76 + lineHeight + "px";
            statsText.left = "357px";
            statsText.fontFamily = "GemunuLibre-Medium";
            statsText.zIndex = 11;
            textContainer.addControl(statsText);
            lineHeight += 20;
        }
    }

    //Enemy Stats
    lineHeight = 0;
    for(let key in enemyBoard.stats){
        if(enemyBoard.stats[key].stat !== 0){
            let text = camelCaseToTitleCase(key) + ": " + enemyBoard.stats[key].stat;
            const statsText = new GUI.TextBlock();
            statsText.text = text;
            statsText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            statsText.color = "#262323";
            statsText.fontSize = 16;
            statsText.top = -76 + lineHeight + "px";
            statsText.left = "603px";
            statsText.fontFamily = "GemunuLibre-Medium";
            statsText.zIndex = 11;
            textContainer.addControl(statsText);
            lineHeight += 20;
        }
    }

    textContainer.zIndex = 8;

    container.addControl(textContainer);
    
    container.zIndex = 300;

    GUITexture.addControl(container);

    // Animate container fade in
    container.alpha = 0;
    const animation = new BABYLON.Animation("containerFadeIn", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: 0 },
        { frame: 40, value: 1 }
    ]);
    container.animations = [];
    container.animations.push(animation);
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    animation.setEasingFunction(ease);    
    GUIscene.beginDirectAnimation(container, [container.animations[0]], 0, 40, false, 1);


    return endBattleDarkness;
}