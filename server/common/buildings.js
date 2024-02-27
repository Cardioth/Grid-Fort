"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getRandomBuilding = getRandomBuilding;
const defaultStats = {
  armor: 0,
  energyResistance: 0,
  health: 30
};
const defaultAttackingStats = {
  critChance: 10,
  critDamageBonus: 50,
  blastRadius: 0,
  fireRate: 10,
  windUpTime: 0,
  ammoDraw: 1
};
const defaultQualities = {
  fireRateCounter: 0,
  windUpCounter: 0,
  returnable: true,
  placed: false,
  moveable: true,
  effects: {},
  stats: {
    ...defaultStats
  },
  cost: 1,
  rejectStats: [],
  description: "",
  destroyed: false,
  possibleCellTargets: [],
  preferredTarget: ["Booster", "Weapon", "Shield", "Radar", "Core"],
  rotation: "N",
  rotationAdjustment: {
    x: 0,
    y: 0
  },
  level: 1,
  bonuses: [],
  bStats: {}
};

/*  Shape Key Guide:
    0: empty
    1: occupied
    2: anchorPoint
    3: kineticWeapon
    4: energyWeapon
    5: missileWeapon
    6: booster
    7: anchorPointKineticWeapon
    8: anchorPointEnergyWeapon
    9: anchorPointMissileWeapon
    10: anchorPointBooster
*/

const allBuildings = {
  miniArty: {
    name: "Artillery",
    class: "Weapon",
    description: "Basic Artillery Weapon",
    cost: 1,
    width: 3,
    height: 2,
    shape: [1, 7, 1, 0, 1, 0],
    color: "#3ca9c8",
    drawable: true,
    BUID: 1,
    stats: {
      health: 30,
      kineticFirepower: 1,
      blastRadius: 1,
      ammoStorage: 12,
      fireRate: 8
    }
  },
  basicLaser: {
    name: "Basic Laser",
    class: "Weapon",
    description: "Basic Laser Weapon",
    cost: 1,
    width: 2,
    height: 2,
    shape: [8, 1, 1, 0],
    color: "#5497e3",
    drawable: true,
    BUID: 2,
    stats: {
      health: 25,
      energyFirepower: 2,
      powerStorage: 15,
      powerDraw: 0.2,
      fireRate: 2
    }
  },
  damageBooster: {
    name: "Damage Booster",
    class: "Booster",
    description: "Basic Damage Booster",
    cost: 2,
    width: 3,
    height: 3,
    shape: [6, 1, 6, 6, 2, 6, 6, 1, 6],
    color: "#487fb6",
    drawable: true,
    BUID: 3,
    effects: {
      energyFirepower: 1,
      kineticFirepower: 1
    }
  },
  powerStation: {
    name: "Power Station",
    class: "Booster",
    description: "Let your laser weapons shoot for longer!",
    cost: 1,
    width: 4,
    height: 4,
    shape: [0, 6, 6, 0, 6, 8, 1, 6, 6, 1, 1, 6, 0, 6, 6, 0],
    color: "#5497e3",
    drawable: true,
    BUID: 4,
    stats: {
      energyFirepower: 1,
      fireRate: 3,
      powerStorage: 30,
      powerDraw: 0.1
    },
    effects: {
      powerStorage: 100
    }
  },
  ammoStation: {
    name: "Ammo Station",
    class: "Booster",
    cost: 3,
    width: 4,
    height: 4,
    shape: [0, 5, 5, 0, 5, 2, 1, 5, 5, 1, 1, 5, 0, 5, 5, 0],
    color: "#35608a",
    drawable: false,
    BUID: 5,
    stats: {
      kineticFirepower: 1,
      ammoStorage: 30,
      fireRate: 12,
      ammoStorage: 50
    },
    effects: {
      ammoStorage: 100
    }
  },
  protector: {
    name: "Protector",
    class: "Booster",
    cost: 1,
    width: 2,
    height: 3,
    shape: [1, 5, 1, 5, 2, 1],
    color: "#324d62",
    drawable: false,
    BUID: 6,
    stats: {
      kineticFirepower: 1,
      ammoStorage: 15
    },
    effects: {
      armor: 1,
      energyResistance: 1
    }
  },
  energyResistance: {
    name: "Energy Shield",
    class: "Shield",
    cost: 2,
    width: 6,
    height: 3,
    shape: [0, 5, 5, 5, 5, 0, 5, 5, 1, 1, 5, 5, 5, 1, 1, 1, 1, 5],
    color: "#546572",
    drawable: false,
    BUID: 7,
    effects: {
      energyResistance: 1
    }
  },
  radar: {
    name: "Radar",
    class: "Radar",
    cost: 2,
    width: 3,
    height: 3,
    shape: [0, 1, 0, 1, 1, 1, 0, 1, 0],
    color: "#546572",
    drawable: false,
    BUID: 8,
    stats: {
      radarRange: 2,
      health: 10
    },
    effects: {
      radarRange: 2
    }
  },
  powerRing: {
    name: "Power Ring",
    class: "Booster",
    cost: 9,
    width: 6,
    height: 6,
    shape: [0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 5, 5, 1, 0, 0, 1, 5, 5, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0],
    color: "#fcc15b",
    drawable: false,
    BUID: 9,
    effects: {
      energyFirepower: 5,
      powerStorage: 10
    }
  },
  core: {
    name: "Core",
    class: "Core",
    cost: 9,
    width: 3,
    height: 3,
    shape: [1, 1, 1, 1, 8, 1, 1, 1, 1],
    color: "#a9bcdb",
    moveable: false,
    returnable: false,
    drawable: false,
    BUID: 0,
    stats: {
      health: 20,
      energyFirepower: 2,
      powerStorage: 1000,
      powerDraw: 0.2,
      fireRate: 2
    }
  },
  matador: {
    name: "Matador",
    class: "Booster",
    cost: 1,
    width: 2,
    height: 3,
    shape: [1, 5, 1, 5, 2, 1],
    color: "#324d62",
    drawable: false,
    BUID: 10,
    stats: {
      kineticFirepower: 1,
      ammoStorage: 15,
      radarRange: 2
    },
    effects: {
      armor: 1,
      energyResistance: 1,
      radarRange: 2
    }
  },
  salvador: {
    name: "Salvador",
    class: "Weapon",
    cost: 5,
    width: 4,
    height: 3,
    shape: [0, 1, 1, 1, 2, 1],
    color: "#324d62",
    drawable: false,
    BUID: 11,
    stats: {
      kineticFirepower: 1,
      ammoStorage: 20,
      fireRate: 1,
      blastRadius: 2,
      health: 30
    }
  }
};

//Add default stats to all buildings if stat is not specified
for (let key in allBuildings) {
  //Add default qualities to building
  for (let key2 in defaultQualities) {
    if (!allBuildings[key].hasOwnProperty(key2)) {
      allBuildings[key][key2] = defaultQualities[key2];
    }
  }
  //Add default stats to building
  for (let key3 in defaultStats) {
    if (!allBuildings[key].stats.hasOwnProperty(key3) && !allBuildings[key].rejectStats.includes(key3)) {
      allBuildings[key].stats[key3] = defaultStats[key3];
    }
  }
  //Add default stats for attacking buildings
  if (allBuildings[key].stats.hasOwnProperty("kineticFirepower") || allBuildings[key].stats.hasOwnProperty("energyFirepower")) {
    for (let key4 in defaultAttackingStats) {
      if (!allBuildings[key].stats.hasOwnProperty(key4)) {
        allBuildings[key].stats[key4] = defaultAttackingStats[key4];
      }
    }
  }
  //Add backup shape for buildings
  for (let key5 in allBuildings[key]) {
    allBuildings[key].originalShape = [...allBuildings[key].shape];
    allBuildings[key].originalWidth = allBuildings[key].width;
    allBuildings[key].originalHeight = allBuildings[key].height;
  }
  //Add keyName to building
  allBuildings[key].keyName = key;
}
var _default = exports.default = allBuildings;
function getRandomBuilding() {
  const drawableCards = Object.values(allBuildings).filter(card => card.drawable);
  const randomNumber = Math.floor(Math.random() * drawableCards.length);
  return {
    ...drawableCards[randomNumber]
  };
}