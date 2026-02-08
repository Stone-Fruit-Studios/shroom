import * as THREE from "three";

export const Color = {
  WHITE: "#ffffff",
  BLACK: "#000000",
  BRICK: "#c0392b",
  CREAM: "#e8d5b7",
  CHARCOAL: "#2c3e50",
  PLUM: "#7a5890",
  SILVER: "#c0b8b8",
  LAVENDER: "#d8c8e0",
  SCARLET: "#ff3030",
  VIOLET: "#c060ff",
  CRIMSON: "#ff2222",
  AMBER: "#ffaa00",
  TAN: "#d4c5a9",
  SIENNA: "#8b5e3c",
  SAGE: "#a0a898",
  SLATE_GREEN: "#506058",
  FERN: "#4a8b3f",
  NEON_GREEN: "#7bff6b",
  PINE: "#2a5848",
  CYAN: "#40eebb",
  BARK: "#5a3a1a",
  FOREST: "#2d6b1e",
  ESPRESSO: "#3a2818",
  EVERGREEN: "#1a3a18",
  MIDNIGHT: "#101830",
  NAVY: "#1e3058",
  STEEL: "#2a3850",
  OBSIDIAN: "#081018",
  DEEP_NAVY: "#122030",
  DARK_TEAL: "#1a3040",
  MOSS: "#2d5a27",
  DARK_MOSS: "#1a3028",
  VOID: "#0a1a0a",
  OLIVE: "#558855",
  HUNTER: "#2a4838",
  IVORY: "#e8e4d8",
  ASH: "#c8c4b8",
  PERIWINKLE: "#c8d8ff",
  PEWTER: "#80b0b8",
  INDIGO: "#7b68ee",
  TEAL: "#40a898",
  PEACH: "#ffe8c0",
  CADET: "#5090a0",
  SKY_BLUE: "#a0d8ff",
  SEAFOAM: "#60c8b0",
  GOLD: "#c8a850",
  BRONZE: "#a08040",
  SUNFLOWER: "#ffcc44",
  TANGERINE: "rgba(255, 153, 68, 0.95)",
  COCOA: "#2a1800",
  CORAL: "#e05555",
  MARIGOLD: "#e0a030",
  EMERALD: "#55b060",
  CORNFLOWER: "#5588cc",
  AZURE: "#4498dd",
  CERULEAN: "#33aaee",
  ROSE: "#cc6699",
  HONEY: "#cc9944",
  ROYAL_BLUE: "#3838cc",
  WARM_BEIGE: "#dcc0a8",
  DARK_EYE: "#2a1810",
  BLUSH: "#e88888",
  NIGHT_BODY: "#121218",
  DEEP_ROYAL: "#2828aa",
  AMBER_EYE: "#ddaa22",
  AMBER_GLOW: "#bb8800",
  LIGHT_BLUE_SPOT: "#88bbff",

  // -- Bioluminescent environment --

  // Deco mushrooms
  DECO_STEM_NORMAL: "#90c8c0",
  DECO_CAP_NORMAL: "#6848a8",
  DECO_CAP_EMISSIVE: "#5040c0",
  DECO_STEM_DARK: "#607068",
  DECO_CAP_DARK: "#384838",
  DECO_CAP_EMISSIVE_DARK: "#0a0810",

  // Glow plants
  PLANT_STEM_NORMAL: "#2a6858",
  PLANT_BULB_NORMAL: "#40eebb",
  PLANT_STEM_DARK: "#1a3028",
  PLANT_BULB_DARK: "#20a088",

  // Bioluminescent trees
  TRUNK_NORMAL: "#2a1e3a",
  TRUNK_EMISSIVE_NORMAL: "#140a20",
  CANOPY_NORMAL: "#1a5040",
  CANOPY_EMISSIVE_NORMAL: "#10a878",
  TRUNK_DARK: "#181020",
  TRUNK_EMISSIVE_DARK: "#0a0618",
  CANOPY_DARK: "#0a1810",
  CANOPY_EMISSIVE_DARK: "#040808",

  // Sky – brighter enchanted blues
  SKY_NORMAL_TOP: "#142860",
  SKY_NORMAL_MID: "#2858a0",
  SKY_NORMAL_BOT: "#4080b8",
  SKY_DARK_TOP: "#060810",
  SKY_DARK_MID: "#0a1018",
  SKY_DARK_BOT: "#101820",

  // Ground
  GROUND_NORMAL: "#1e4838",
  GROUND_DARK: "#101a18",
  BANK_NORMAL: "#2a5a3a",
  BANK_DARK: "#141e18",

  // Fog
  FOG_BLUE: "#182848",
  FOG_DARK: "#060a0a",

  // Smoke / ground particles
  SMOKE_NORMAL: "#6088b0",
  SMOKE_DARK: "#283838",

  // Moon
  MOON_COOL: "#d8e8ff",
  MOON_LIGHT_COOL: "#b0c8e8",

  // Lighting – normal
  LIGHT_BLUE_WHITE: "#b8d0f0",
  ACCENT_INDIGO: "#6848a8",
  FILL_WARM_CYAN: "#80c8c0",
  RIM_BRIGHT_CYAN: "#60d8e0",

  // Lighting – dark
  DARK_COLD_GREY: "#607080",
  DARK_ACCENT_TEAL: "#285848",
  DARK_FILL_CADET: "#406068",
  DARK_RIM_SEAFOAM: "#408878",

  // Cloud colors – sky (3 brightness tiers)
  CLOUD_SKY_BRIGHT: "#5088c0",
  CLOUD_SKY_MID: "#4078b0",
  CLOUD_SKY_DIM: "#3068a0",
  CLOUD_SKY_DARK: "#0a1828",
  CLOUD_SKY_DARK_B: "#0c1a28",
  CLOUD_SKY_DARK_C: "#081420",

  // Cloud colors – fog
  CLOUD_FOG_NORMAL: "#3068a0",
  CLOUD_FOG_NORMAL_B: "#2858a0",
  CLOUD_FOG_DARK: "#0a1818",
  CLOUD_FOG_DARK_B: "#081418",
} as const;

export const Mushroom = {
  colors: {
    normal: {
      cap: new THREE.Color(Color.ROYAL_BLUE),
      stem: new THREE.Color(Color.WARM_BEIGE),
      spots: new THREE.Color(Color.LIGHT_BLUE_SPOT),
      eyes: new THREE.Color(Color.DARK_EYE),
      pupils: new THREE.Color(Color.BLACK),
    },
    dark: {
      cap: new THREE.Color(Color.DEEP_ROYAL),
      stem: new THREE.Color(Color.NIGHT_BODY),
      spots: new THREE.Color(Color.LAVENDER),
      eyes: new THREE.Color(Color.AMBER_EYE),
      pupils: new THREE.Color('#1a0800'),
    },
  },
  emissive: {
    normal: {
      spots: new THREE.Color(Color.BLACK),
      eyes: new THREE.Color(Color.BLACK),
      pupils: new THREE.Color(Color.BLACK),
    },
    dark: {
      spots: new THREE.Color(Color.VIOLET),
      eyes: new THREE.Color(Color.AMBER_GLOW),
      pupils: new THREE.Color(Color.AMBER_GLOW),
    },
  },
  faceColor: Color.DARK_EYE,
  capEmissive: Color.AMBER,
  capRadius: 0.55,
  capTilt: -0.15,
  capScale: [1.4, 0.7, 1.4] as const,
  spotSizes: [
    0.07, 0.04, 0.05, 0.07, 0.035, 0.06, 0.04, 0.07, 0.05, 0.035, 0.06,
  ],
  spotCount: 12,
  spotCoverage: 0.65,
  stemArgs: [0.28, 0.35, 0.75, 16] as const,
  eyeOffsetX: 0.14,
  eyeY: 0.15,
  eyeZ: 0.32,
  eyeRadius: 0.09,
  pupilRadius: 0.055,
  highlightRadius: 0.025,
  highlightOffset: [0.025, 0.03, 0.04] as const,
  cheekRadius: 0.05,
  cheekColor: Color.BLUSH,
  cheekOffsetX: 0.2,
  cheekY: 0.02,
  cheekZ: 0.34,
  browY: 0.34,
  browSize: [0.1, 0.02, 0.02] as const,
  mouthPos: [0, -0.02, 0.34] as const,
  mouthArgs: [0.04, 0.012, 16, 32, Math.PI] as const,
  face: {
    mouth: { normal: 1, dark: -1 },
    brow: { normal: 0.3, dark: -0.4 },
  } as const,
  anim: {
    happy: {
      baseY: 0,
      hop: {
        hopDuration: 0.45,
        idleDuration: 2.0,
        height: 0.15,
        range: 1.8,
        stepSize: 0.6,
        landSquash: 0.06,
        idleBounceSpeed: 3,
        idleBounceAmt: 0.02,
        turnChance: 0.08,
        turnDuration: 0.15,
        tiltAmt: 0.12,
        swaySpeed: 1.5,
        swayAmt: 0.02,
      },
    },
    hungry: {
      baseY: -0.05,
      hop: {
        hopDuration: 0.3,
        idleDuration: 0.8,
        height: 0.08,
        range: 1.2,
        stepSize: 0.4,
        landSquash: 0.12,
        idleBounceSpeed: 2,
        idleBounceAmt: 0.01,
        turnChance: 0.15,
        turnDuration: 0.1,
        tiltAmt: 0.06,
        swaySpeed: 0.8,
        swayAmt: 0.01,
      },
    },
  } as const,
  decay: {
    feedBounce: 0.95,
    mistShimmy: 0.94,
    pokeJolt: 0.88,
    giftGlow: 0.96,
  } as const,
};

export const Env = {
  decoColors: {
    normal: {
      stem: new THREE.Color(Color.DECO_STEM_NORMAL),
      cap: new THREE.Color(Color.DECO_CAP_NORMAL),
    },
    dark: {
      stem: new THREE.Color(Color.DECO_STEM_DARK),
      cap: new THREE.Color(Color.DECO_CAP_DARK),
    },
  },
  decoEmissive: {
    normal: new THREE.Color(Color.DECO_CAP_EMISSIVE),
    dark: new THREE.Color(Color.DECO_CAP_EMISSIVE_DARK),
  },
  plantColors: {
    normal: {
      stem: new THREE.Color(Color.PLANT_STEM_NORMAL),
      bulb: new THREE.Color(Color.PLANT_BULB_NORMAL),
    },
    dark: {
      stem: new THREE.Color(Color.PLANT_STEM_DARK),
      bulb: new THREE.Color(Color.PLANT_BULB_DARK),
    },
  },
  treeColors: {
    normal: {
      trunk: new THREE.Color(Color.TRUNK_NORMAL),
      canopy: new THREE.Color(Color.CANOPY_NORMAL),
    },
    dark: {
      trunk: new THREE.Color(Color.TRUNK_DARK),
      canopy: new THREE.Color(Color.CANOPY_DARK),
    },
  },
  treeEmissive: {
    normal: {
      trunk: new THREE.Color(Color.TRUNK_EMISSIVE_NORMAL),
      canopy: new THREE.Color(Color.CANOPY_EMISSIVE_NORMAL),
    },
    dark: {
      trunk: new THREE.Color(Color.TRUNK_EMISSIVE_DARK),
      canopy: new THREE.Color(Color.CANOPY_EMISSIVE_DARK),
    },
  },
  trunkEmissiveIntensity: { normal: 0.08, dark: 0.03 },
  canopyEmissiveIntensity: { normal: 0.4, dark: 0.05 },
  skyColors: {
    normal: {
      top: new THREE.Color(Color.SKY_NORMAL_TOP),
      mid: new THREE.Color(Color.SKY_NORMAL_MID),
      bot: new THREE.Color(Color.SKY_NORMAL_BOT),
    },
    dark: {
      top: new THREE.Color(Color.SKY_DARK_TOP),
      mid: new THREE.Color(Color.SKY_DARK_MID),
      bot: new THREE.Color(Color.SKY_DARK_BOT),
    },
  },
  groundColors: {
    normal: new THREE.Color(Color.GROUND_NORMAL),
    dark: new THREE.Color(Color.GROUND_DARK),
  },
  bankColors: {
    normal: new THREE.Color(Color.BANK_NORMAL),
    dark: new THREE.Color(Color.BANK_DARK),
  },
  fogColor: Color.FOG_BLUE,
  fogDensity: { normal: 0.028, dark: 0.04 },
  smokeColor: { normal: Color.SMOKE_NORMAL, dark: Color.SMOKE_DARK },
  smokeOpacity: { normal: 0.25, dark: 0.25 },
  moonColor: new THREE.Color(Color.MOON_COOL),
  moonLightColor: Color.MOON_LIGHT_COOL,
  moonOpacity: { normal: 0.9, dark: 0.15 },
  moonLightIntensity: { normal: 1.5, dark: 0.05 },
  moonPosition: [4, 5, -6] as const,
  moonRadius: 1.5,
  skyRadius: 50,
  groundRadius: 10,
  glowLightThreshold: 1.0,
  sparkles: {
    count: 60,
    size: 14,
    scale: new THREE.Vector3(10, 1.5, 10),
    speed: 0.2,
    noise: 2,
  },
};

export const Lighting = {
  colors: {
    ambient: { normal: { intensity: 0.9 }, dark: { intensity: 0.35 } },
    directional: {
      normal: { intensity: 2.0, color: new THREE.Color(Color.LIGHT_BLUE_WHITE) },
      dark: { intensity: 0.8, color: new THREE.Color(Color.DARK_COLD_GREY) },
    },
    accent: {
      normal: { intensity: 1.0, color: new THREE.Color(Color.ACCENT_INDIGO) },
      dark: { intensity: 1.2, color: new THREE.Color(Color.DARK_ACCENT_TEAL) },
    },
    fill: {
      normal: { intensity: 1.2, color: new THREE.Color(Color.FILL_WARM_CYAN) },
      dark: { intensity: 0.5, color: new THREE.Color(Color.DARK_FILL_CADET) },
    },
    rim: {
      normal: { intensity: 1.2, color: new THREE.Color(Color.RIM_BRIGHT_CYAN) },
      dark: { intensity: 0.7, color: new THREE.Color(Color.DARK_RIM_SEAFOAM) },
    },
  } as const,
  positions: {
    directional: [5, 8, 3],
    accent: [-3, 2, -2],
    fill: [3, 3, 2],
    rim: [-2, 4, 4],
  } as const,
  shadowMapSize: [1024, 1024] as const,
};

export const Jar = {
  colors: {
    body: Color.GOLD,
    emissive: Color.AMBER,
    cap: Color.BRONZE,
    light: Color.SUNFLOWER,
    badge: Color.TANGERINE,
    text: Color.COCOA,
  },
};

export const Meter = {
  colors: {
    hunger: { low: Color.CORAL, mid: Color.MARIGOLD, high: Color.EMERALD },
    thirst: { low: Color.CORNFLOWER, mid: Color.AZURE, high: Color.CERULEAN },
    boredom: { low: Color.ROSE, mid: Color.HONEY, high: Color.EMERALD },
  },
  thresholds: { low: 30, mid: 60 } as const,
};
