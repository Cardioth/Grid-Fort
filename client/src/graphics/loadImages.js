import * as BABYLON from '@babylonjs/core';

export const imageCache = {};

export function loadImages(scene) {

    const assetsManager = new BABYLON.AssetsManager(scene);

    const paths = [
        "boostSymbol.png",
        "bottomUI.png",
        "buildingStatsPanel.png",
        "buildingStatsPanelBottom.png",
        "cardArtwork.png",
        "cardDamage.png",
        "cardHealth.png",
        "cardLevel1.png",
        "cardLevel2.png",
        "cardLevel3.png",
        "cardLevel4.png",
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
        "startGameBacking.png",
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
        'collectionCardPanel.png',
        'collectionDeckPanel.png',
        'arrowButton.png',
        'arrowButtonR.png',
        'emptyDot.png',
        'filledDot.png',
        'checkButton.png',
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
