import { socket } from "./connect";
import { setUniCredits } from "../data/config";

export function updateUniCreditsListener(){
    socket.on("uniCreditsUpdate", (response) => {
        setUniCredits(response);
    });
}

export function requestUpdateCredits(){
    socket.emit("getUniCredits");
    socket.on("uniCreditsUpdate", (response) => {
        setUniCredits(response);
    });
}