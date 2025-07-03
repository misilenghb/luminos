
export interface MainStone {
  id: string; // for mapping in UI
  crystalType: string;
  color: string;
  shape?: string;
  clarity?: string;
  surfaceTreatment?: string;
  inclusions?: string[];
}

export interface CompositionalAestheticsSettings {
  style?: string;
  overallStructure?: string;
}

export type Accessories = string;

export interface ColorSystemSettings {
  mainHue?: string;
}

export interface DesignStateInput {
  designCategory: string;
  overallDesignStyle: string;
  userIntent?: string;
  imageStyle?: string;
  applicationPlatform?: string;
  aspectRatio?: string;
  mainStones: MainStone[];
  accessories?: Accessories;
  compositionalAesthetics?: CompositionalAestheticsSettings;
  colorSystem?: ColorSystemSettings;
}

export interface SimpleDesignInput {
  designCategory: string;
  mainCrystal1: string;
  mainCrystal1Color: string;
  mainCrystal2?: string;
  mainCrystal2Color?: string;
  overallDesignStyle: string;
  userIntent: string;
}

export interface CrystalData {
  displayName: string;
  englishName: string;
  availableColors: string[];
  specificInclusions?: string[]; 
  shapes?: string[]; 
  clarities?: string[]; 
  surfaceTreatments?: string[]; 
  healingProperties?: string[];
  chakra?: string[];
  element?: string[];
  zodiac?: string[];
}

export type CrystalTypeMapping = Record<string, CrystalData>;

export const universalInclusionKeys = [
  "inclusion_bubbles", // Gas or liquid bubbles
  "inclusion_fractures", // Cracks or fissures
  "inclusion_veils", // Cloud-like or feathery inclusions
  "inclusion_color_zoning", // Uneven color distribution
  "inclusion_growth_lines", // Visible lines from crystal growth stages
  "inclusion_fingerprints", // Liquid-filled, fingerprint-like patterns
  "inclusion_silk", // Fine, fibrous inclusions (e.g., rutile) causing chatoyancy or sheen
  "inclusion_liquid_filled_cavities", // Cavities filled with liquid (e.g., enhydro)
  "inclusion_two_phase_inclusions",    // Inclusions with both liquid and gas
  "inclusion_three_phase_inclusions", // Inclusions with solid, liquid, and gas
  "inclusion_negative_crystals",     // Cavities shaped like perfect crystals
  "inclusion_surface_markings", // Etchings, trigons, record keepers on the crystal surface
  "inclusion_matrix_host_rock" // Remnants of the host rock/matrix
];
