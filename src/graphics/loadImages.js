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
