import * as BABYLON from '@babylonjs/core';

export const imageCache = {};

export function loadImages(scene) {

    const assetsManager = new BABYLON.AssetsManager(scene);

    const paths = [
        "boostSymbol.png",
        "bottomUI.png",
        "buildingStatsPanel.png",
        "buildingStatsPanelBottom.png",
        "cardArtwork1.png",
        "cardArtwork2.png",
        "cardArtwork3.png",
        "cardArtwork4.png",
        "cardLevel1.png",
        "cardLevel2.png",
        "cardLevel3.png",
        "cardLevel4.png",
        "cardArtworkBackground.png",
        "cardDamage.png",
        "cardHealth.png",
        "endTurnButton.png",
        "endTurnButtonBack.png",
        "gameCredit.png",
        "gameCreditIcon.png",
        "countdown_one.png",
        "countdown_two.png",
        "countdown_three.png",
        "countdown_background.png",
        "continueButton.png",
        "defeatText.png",
        "victoryText.png",
        "endBattleBacking.png",
        "medalIcon1.png",
        "medalIcon2.png",
        "medalIcon3.png",
        "strikeIcon.png",
        "credIcon.png",
        "startButton.png",
        "cancelButton.png",
        "credIconNoShine.png",
        "strikeDialogue.png",
        "strikeDialogueIcon.png",
        "circleBacking.png",
        'emptyButton.png',
        'SolanalogoPNGimage.png',
        'Phantom-Icon_App_60x60.png',
        'solflareIcon.png',
        'emptyButtonHighlight.png',
        'arrowButton.png',
        'arrowButtonR.png',
        'emptyDot.png',
        'filledDot.png',
        'checkButton.png',
        'panelSliced/panelSlicedTopLeft.png',
        'panelSliced/panelSlicedTopMiddle.png',
        'panelSliced/panelSlicedTopRight.png',
        'panelSliced/panelSlicedMiddleLeft.png',
        'panelSliced/panelSlicedMiddleMiddle.png',
        'panelSliced/panelSlicedMiddleRight.png',
        'panelSliced/panelSlicedBottomLeft.png',
        'panelSliced/panelSlicedBottomMiddle.png',
        'panelSliced/panelSlicedBottomRight.png',
        'wires.png',
        'collectionCardPanelFilters.png',
        'bigButton.png',
        'addDeckButton.png',
        'addDeckButtonOver.png',
        'saveDeckButton.png',
        'saveDeckButtonOver.png',
        'gameDialogueBacking.png',
        'miniCard1.png',
        'miniCard2.png',
        'miniCard3.png',
        'miniCard4.png',
        'boosterIcon.png',
        'weaponIcon.png',
        'shieldIcon.png',
        'repairIcon.png',
        'radarIcon.png',
        'scrollBarHandle.png',
        'loadIcon1.png',
        'loadIcon2.png',
        'miniDeckBackingOn.png',
        'miniDeckBackingOff.png',
        'binIcon.png',
        'gameDialogueBacking.png',
        'gameDialogueBacking2.png',
        'inputDialogueBox.png',
        'playButtonBack.png',
        'playButtonMiddle.png',
        'playButtonFront.png',
    ];
    
    paths.forEach(path => {
        var imgTask = assetsManager.addImageTask(path, path);
        imgTask.onSuccess = function(task) {
            imageCache[path] = task.image;
        };
    });

    assetsManager.load();
}

export function getImage(path) {
    return imageCache[path].src;
}
