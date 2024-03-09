import * as GUI from "@babylonjs/gui";
import { availableCredits } from "../gameplay/credits.js";
import { currentScene } from "../managers/sceneManager.js";
import { getImage } from "./loadImages.js";
import { camelCaseToTitleCase } from "../utilities/utils.js";

export function createCardGraphic(card) {
    var container = new GUI.Rectangle();
    container.width = "620px";
    container.height = "950px";
    container.thickness = 0;

    //Card Artwork
    var cardArtwork = new GUI.Image("but", "cardArt/"+ card.keyName +".png");
    cardArtwork.width = "500px";
    cardArtwork.height = "500px";
    cardArtwork.top = "-150px";
    container.addControl(cardArtwork);

    //Card Backing
    if(card.level >= 1){
    var cardBack = new GUI.Image("but", getImage("cardArtwork"+card.level+".png"));
    cardBack.width = "620px";
    cardBack.height = "920px";
    container.addControl(cardBack);
    }

    //Card Name
    var nameText = new GUI.TextBlock();
    nameText.text = card.name;
    if(card.tradable){
        nameText.color = "#f0ec84";
    } else {
        nameText.color = "white";
    }
    
    nameText.fontSize = 60;
    nameText.top = "40px";
    nameText.shadowBlur = 0;
    nameText.shadowColor = "#262626";
    nameText.shadowOffsetX = 0;
    nameText.shadowOffsetY = 2;
    nameText.scaleY = 0.9;
    nameText.fontFamily = "GemunuLibre-Medium";
    container.addControl(nameText);

    //Card Class
    var classText = new GUI.TextBlock();
    classText.text = card.class;
    classText.color = "white";
    classText.fontSize = 50;
    classText.top = "100px";
    classText.shadowBlur = 0;
    classText.shadowColor = "#262626";
    classText.shadowOffsetX = 0;
    classText.shadowOffsetY = 2;
    classText.scaleY = 0.9;
    classText.fontFamily = "GemunuLibre-Medium";
    container.addControl(classText);

    //Card Cost
    var costText = new GUI.TextBlock();
    costText.text = card.cost;
    costText.color = "#53F4FD";
    costText.fontSize = 65;
    costText.top = "-380px";
    costText.left = "-230px";
    costText.fontFamily = "RussoOne-Regular";
    container.addControl(costText);

    //Card Damage
    if (card.stats.hasOwnProperty("kineticFirepower") || card.stats.hasOwnProperty("energyFirepower")) {
        var healthImage = new GUI.Image("but", getImage("cardDamage.png"));
        healthImage.width = "147px";
        healthImage.height = "219px";
        healthImage.top = "350px";
        healthImage.left = "-230px";
        container.addControl(healthImage);
        var damageText = new GUI.TextBlock();
        damageText.text = card.stats.kineticFirepower || card.stats.energyFirepower;
        damageText.color = "#F67249";
        damageText.fontSize = 65;
        damageText.top = "383px";
        damageText.left = "-230px";
        damageText.fontFamily = "RussoOne-Regular";
        container.addControl(damageText);
    }

    //Card Health
    if (card.stats.hasOwnProperty("health")) {
        var healthImage = new GUI.Image("but", getImage("cardHealth.png"));
        healthImage.width = "147px";
        healthImage.height = "219px";
        healthImage.top = "350px";
        healthImage.left = "230px";
        container.addControl(healthImage);
        var healthText = new GUI.TextBlock();
        healthText.text = card.stats.health;
        healthText.color = "#49E35A";
        healthText.fontSize = 65;
        healthText.top = "383px";
        healthText.left = "230px";
        healthText.fontFamily = "RussoOne-Regular";
        container.addControl(healthText);
    }

    //Bonus stats
    var index = 0;
    for(var stats in card.bStats){
        var statText = new GUI.TextBlock();
        statText.text = "+" + card.bStats[stats] + " " + camelCaseToTitleCase(stats);
        statText.color = "#16191f";
        statText.fontSize = 50;
        statText.top = 190 + index*50 + "px";
        statText.scaleY = 0.8;
        statText.left = "0px";
        statText.fontFamily = "GemunuLibre-Medium";
        container.addControl(statText);

        index++;
    }

    container.scaleX = 0.25;
    container.scaleY = 0.25;

    container.top = card.currentPosition.y;
    container.left = card.currentPosition.x;
    container.rotation = card.rotation;
    container.zIndex = card.zIndex;
    container.ignoreAdaptiveScaling = true;
    container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

    card.container = container;

    container.onPointerEnterObservable.add(function () {
        if(card.cost <= availableCredits && currentScene === "build"){
            document.body.style.cursor='grab'
        }
    });
    container.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });

    return container;
}
