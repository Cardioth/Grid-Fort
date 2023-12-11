import { fortStats } from "../managers/setup";

export function wrapText(context, text, x, y, lineHeight) {
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, y + (i * lineHeight));
    }
}

export function hitTest(x,y,button){
    if(x > button.x && x < button.x+button.width && y > button.y && y < button.y+button.height){
        return true;
    }
    return false;
}

export function camelCaseToTitleCase(input) {
    // This regular expression finds all camel case words.
    return input
        // Insert a space before any uppercase letter followed by a lowercase letter.
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // Capitalize the first letter of each word.
        .replace(/\b\w/g, char => char.toUpperCase());
}
export function updateBoardStats(board) {
    board.stats = JSON.parse(JSON.stringify(fortStats));
    board.allPlacedBuildings.forEach((building) => {
        for (let key in building.stats) {
            if (board.stats.hasOwnProperty(key)) {
                board.stats[key].stat += building.stats[key];
            }
        } 5;
    });
}
