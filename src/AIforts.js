import allBuildings from "./buildings";

export const AIforts = [
    {
        name: "Yuan Lee", description: "My little fortress.", layout: [
            { building: allBuildings.miniArty, x: 0, y: -3, rotation: "R" },
            { building: allBuildings.protector, x: -2, y: -1, rotation: "N" },
            { building: allBuildings.radar, x: 2, y: 2, rotation: "N" },
            { building: allBuildings.damageBooster, x: -2, y: -2, rotation: "N" },
            { building: allBuildings.basicLaser, x: -3, y: -2, rotation: "N" },
            { building: allBuildings.ammoStation, x: 1, y: -4, rotation: "N" },
        ]
    },
    // {name:"Sir Biggles", description:"A fortress with a lot of firepower.",layout:[
    //     {building:allBuildings.miniArty, x:1, y:-1, rotation:"N"},
    //     {building:allBuildings.miniArty, x:-1, y:2, rotation:"RR"},
    //     {building:allBuildings.miniArty, x:-1, y:-1, rotation:"L"},
    //     {building:allBuildings.miniArty, x:2, y:1, rotation:"R"},
    //     {building:allBuildings.basicLaser, x:1, y:-2, rotation:"N"},
    //     {building:allBuildings.basicLaser, x:3, y:1, rotation:"R"},
    //     {building:allBuildings.basicLaser, x:0, y:3, rotation:"RR"},
    //     {building:allBuildings.basicLaser, x:-2, y:0, rotation:"L"},
    //     {building:allBuildings.radar, x:-2, y:-3, rotation:"N"},
    //     {building:allBuildings.radar, x:3, y:-2, rotation:"N"},
    //     {building:allBuildings.radar, x:-3, y:2, rotation:"N"},
    //     {building:allBuildings.radar, x:2, y:3, rotation:"N"},
    // ]},
];