/**
 * Structured data for Rwandan administrative divisions
 * This data can be used for location dropdowns and validation
 */

export interface Sector {
  name: string
  code: string
}

export interface District {
  name: string
  code: string
  sectors: Sector[]
}

export interface Province {
  name: string
  code: string
  districts: District[]
}

/**
 * Rwanda administrative divisions
 * TODO: Complete with full list of sectors for each district
 */
export const RWANDA_LOCATIONS: Province[] = [
  {
    name: "Kigali City",
    code: "KGL",
    districts: [
      {
        name: "Gasabo",
        code: "GAS",
        sectors: [
          { name: "Bumbogo", code: "BUM" },
          { name: "Gatsata", code: "GAT" },
          { name: "Jali", code: "JAL" },
          { name: "Gikomero", code: "GIK" },
          { name: "Gisozi", code: "GIS" },
          { name: "Jabana", code: "JAB" },
          { name: "Kacyiru", code: "KAC" },
          { name: "Kimihurura", code: "KIM" },
          { name: "Kimisagara", code: "KMS" },
          { name: "Kinyinya", code: "KIN" },
          { name: "Ndera", code: "NDE" },
          { name: "Nduba", code: "NDU" },
          { name: "Remera", code: "REM" },
          { name: "Rusororo", code: "RUS" },
          { name: "Rutunga", code: "RUT" },
        ],
      },
      {
        name: "Kicukiro",
        code: "KIC",
        sectors: [
          { name: "Gahanga", code: "GAH" },
          { name: "Gatenga", code: "GAE" },
          { name: "Gikondo", code: "GIK" },
          { name: "Kagarama", code: "KAG" },
          { name: "Kanombe", code: "KAN" },
          { name: "Kicukiro", code: "KIC" },
          { name: "Kigarama", code: "KIG" },
          { name: "Masaka", code: "MAS" },
          { name: "Niboye", code: "NIB" },
          { name: "Nyarugunga", code: "NYA" },
        ],
      },
      {
        name: "Nyarugenge",
        code: "NYA",
        sectors: [
          { name: "Gitega", code: "GIT" },
          { name: "Kanyinya", code: "KAN" },
          { name: "Kigali", code: "KIG" },
          { name: "Kimisagara", code: "KIM" },
          { name: "Mageragere", code: "MAG" },
          { name: "Muhima", code: "MUH" },
          { name: "Nyakabanda", code: "NYA" },
          { name: "Nyamirambo", code: "NYM" },
          { name: "Nyarugenge", code: "NYR" },
          { name: "Rwezamenyo", code: "RWE" },
        ],
      },
    ],
  },
  {
    name: "Eastern Province",
    code: "EST",
    districts: [
      {
        name: "Bugesera",
        code: "BUG",
        sectors: [
          { name: "Gashora", code: "GAS" },
          { name: "Juru", code: "JUR" },
          { name: "Kamabuye", code: "KAM" },
          { name: "Ntarama", code: "NTA" },
          { name: "Mareba", code: "MAR" },
          { name: "Mayange", code: "MAY" },
          { name: "Musenyi", code: "MUS" },
          { name: "Mwogo", code: "MWO" },
          { name: "Ngeruka", code: "NGE" },
          { name: "Nyamata", code: "NYA" },
          { name: "Nyarugenge", code: "NYR" },
          { name: "Rilima", code: "RIL" },
          { name: "Ruhuha", code: "RUH" },
          { name: "Rweru", code: "RWE" },
          { name: "Shyara", code: "SHY" },
        ],
      },
      // TODO: Add other Eastern Province districts
    ],
  },
  {
    name: "Northern Province",
    code: "NOR",
    districts: [
      {
        name: "Gicumbi",
        code: "GIC",
        sectors: [
          { name: "Bukure", code: "BUK" },
          { name: "Bwisige", code: "BWI" },
          { name: "Byumba", code: "BYU" },
          { name: "Cyumba", code: "CYU" },
          { name: "Gicumbi", code: "GIC" },
          { name: "Kageyo", code: "KAG" },
          { name: "Kaniga", code: "KAN" },
          { name: "Manyagiro", code: "MAN" },
          { name: "Miyove", code: "MIY" },
          { name: "Mukarange", code: "MUK" },
          { name: "Muko", code: "MUK" },
          { name: "Mutete", code: "MUT" },
          { name: "Nyamiyaga", code: "NYA" },
          { name: "Nyankenke II", code: "NYN" },
          { name: "Rubaya", code: "RUB" },
          { name: "Rukomo", code: "RUK" },
          { name: "Rushaki", code: "RUS" },
          { name: "Rutare", code: "RUT" },
          { name: "Ruvune", code: "RUV" },
          { name: "Rwamiko", code: "RWA" },
          { name: "Shangasha", code: "SHA" },
        ],
      },
      // TODO: Add other Northern Province districts
    ],
  },
  {
    name: "Southern Province",
    code: "SOU",
    districts: [
      {
        name: "Huye",
        code: "HUY",
        sectors: [
          { name: "Gishamvu", code: "GIS" },
          { name: "Karama", code: "KAR" },
          { name: "Kigoma", code: "KIG" },
          { name: "Kinazi", code: "KIN" },
          { name: "Maraba", code: "MAR" },
          { name: "Mbazi", code: "MBA" },
          { name: "Mukura", code: "MUK" },
          { name: "Ngoma", code: "NGO" },
          { name: "Ruhashya", code: "RUH" },
          { name: "Rusatira", code: "RUS" },
          { name: "Rwaniro", code: "RWA" },
          { name: "Simbi", code: "SIM" },
          { name: "Tumba", code: "TUM" },
          { name: "Yanze", code: "YAN" },
        ],
      },
      // TODO: Add other Southern Province districts
    ],
  },
  {
    name: "Western Province",
    code: "WES",
    districts: [
      {
        name: "Karongi",
        code: "KAR",
        sectors: [
          { name: "Bwishyura", code: "BWI" },
          { name: "Gashari", code: "GAS" },
          { name: "Gishyita", code: "GIS" },
          { name: "Gisovu", code: "GIS" },
          { name: "Gitesi", code: "GIT" },
          { name: "Murambi", code: "MUR" },
          { name: "Mutuntu", code: "MUT" },
          { name: "Rugabano", code: "RUG" },
          { name: "Ruganda", code: "RUG" },
          { name: "Rwankuba", code: "RWA" },
          { name: "Twumba", code: "TWU" },
        ],
      },
      // TODO: Add other Western Province districts
    ],
  },
]

/**
 * Helper function to get all districts
 */
export function getAllDistricts(): District[] {
  return RWANDA_LOCATIONS.flatMap((province) => province.districts)
}

/**
 * Helper function to get all sectors
 */
export function getAllSectors(): Sector[] {
  return RWANDA_LOCATIONS.flatMap((province) => province.districts.flatMap((district) => district.sectors))
}

/**
 * Helper function to find district by code
 */
export function findDistrictByCode(code: string): District | undefined {
  return getAllDistricts().find((district) => district.code === code)
}

/**
 * Helper function to find sector by code
 */
export function findSectorByCode(code: string): Sector | undefined {
  return getAllSectors().find((sector) => sector.code === code)
}
