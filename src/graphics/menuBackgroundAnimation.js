import { menuBackgrounds } from "./sceneInitialization";

export function menuBackgroundAnimation() {
    if(menuBackgrounds && menuBackgrounds.length > 0){
        for(const background of menuBackgrounds){
            background.position.x += 0.005;
            if(background.position.x > background.width*2+1.5){
                background.position.x = -background.width*2+1.5;
            }
        }
    }
}