import allBuildings from "./buildings";

export const AIforts = [
    {
        name: "Yuan Lee", description: "My little fortress.", layout: [
            { building: allBuildings.miniArty, x: -3, y: -2, rotation: "R" },
            //{ building: allBuildings.damageBooster, x: -2, y: -2, rotation: "N" },
            { building: allBuildings.basicLaser, x: 2, y: 2, rotation: "RR" },
        ]
    },
];