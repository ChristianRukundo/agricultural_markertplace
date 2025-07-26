"use client";

import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LocationData {
  province: string;
  district: string;
  sector: string;
  cell?: string;
}

interface LocationPickerProps {
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
  disabled?: boolean;
}

const RWANDA_LOCATIONS = {
  "Kigali City": {
    Gasabo: [
      "Bumbogo",
      "Gatsata",
      "Gikomero",
      "Gisozi",
      "Jabana",
      "Jali",
      "Kacyiru",
      "Kimihurura",
      "Kimisagara",
      "Kinyinya",
      "Ndera",
      "Nduba",
      "Remera",
      "Rusororo",
      "Rutunga",
    ],
    Kicukiro: [
      "Gahanga",
      "Gatenga",
      "Kagarama",
      "Kanombe",
      "Kicukiro",
      "Kigarama",
      "Masaka",
      "Niboye",
      "Nyarugunga",
      "Ruhango",
    ],
    Nyarugenge: [
      "Gitega",
      "Kanyinya",
      "Kigali",
      "Kimisagara",
      "Mageragere",
      "Muhima",
      "Nyakabanda",
      "Nyamirambo",
      "Rwezamenyo",
      "Shyorongi",
    ],
  },
  "Eastern Province": {
    Bugesera: [
      "Gashora",
      "Juru",
      "Kamabuye",
      "Ntarama",
      "Nyamata",
      "Nyarugenge",
      "Rilima",
      "Ruhuha",
      "Rweru",
      "Shyara",
    ],
    Gatsibo: [
      "Gasange",
      "Gatsibo",
      "Gitoki",
      "Kageyo",
      "Kiramuruzi",
      "Kiziguro",
      "Muhura",
      "Murambi",
      "Ngarama",
      "Nyagihanga",
      "Remera",
      "Rugarama",
      "Rwimbogo",
    ],
    Kayonza: [
      "Gahini",
      "Kabare",
      "Kabarondo",
      "Mukarange",
      "Murama",
      "Murundi",
      "Mwiri",
      "Ndego",
      "Nyamirama",
      "Rukara",
      "Ruramira",
      "Rwinkwavu",
    ],
    Kirehe: [
      "Gatore",
      "Kigarama",
      "Kigina",
      "Kirehe",
      "Mahama",
      "Mpanga",
      "Musaza",
      "Mushikiri",
      "Nasho",
      "Nyamugali",
      "Nyarubuye",
    ],
    Ngoma: [
      "Gashanda",
      "Jarama",
      "Karembo",
      "Kazo",
      "Kibungo",
      "Mugesera",
      "Murama",
      "Remera",
      "Rukira",
      "Rukumberi",
      "Sake",
      "Zaza",
    ],
    Nyagatare: [
      "Gatunda",
      "Karangazi",
      "Katabagemu",
      "Kiyombe",
      "Matimba",
      "Mimuli",
      "Mukama",
      "Musheri",
      "Nyagatare",
      "Rukomo",
      "Rwempasha",
      "Rwimiyaga",
      "Tabagwe",
    ],
    Rwamagana: [
      "Fumbwe",
      "Gahengeri",
      "Gishari",
      "Karenge",
      "Kigabiro",
      "Muhazi",
      "Munyaga",
      "Munyiginya",
      "Musha",
      "Muyumbu",
      "Mwulire",
      "Nzige",
      "Rubona",
      "Rukira",
    ],
  },
  // Add more provinces/districts as needed
};

export function LocationPicker({
  value,
  onChange,
  disabled = false,
}: LocationPickerProps) {
  const [selectedProvince, setSelectedProvince] = useState(
    value?.province || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    value?.district || ""
  );
  const [selectedSector, setSelectedSector] = useState(value?.sector || "");

  const provinces = Object.keys(RWANDA_LOCATIONS);
  const districts = selectedProvince
    ? Object.keys(
        RWANDA_LOCATIONS[selectedProvince as keyof typeof RWANDA_LOCATIONS] ||
          {}
      )
    : [];
  const sectors =
    selectedProvince && selectedDistrict
      ? RWANDA_LOCATIONS[selectedProvince as keyof typeof RWANDA_LOCATIONS]?.[
          selectedDistrict as keyof (typeof RWANDA_LOCATIONS)[keyof typeof RWANDA_LOCATIONS]
        ] || []
      : [];

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedDistrict("");
    setSelectedSector("");
    onChange(null);
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedSector("");
    onChange(null);
  };

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    onChange({
      province: selectedProvince,
      district: selectedDistrict,
      sector: sector,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province */}
        <div>
          <label className="block text-sm font-medium mb-2">Province</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent"
                disabled={disabled}
              >
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedProvince || "Select Province"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {provinces.map((province) => (
                <DropdownMenuItem
                  key={province}
                  onClick={() => handleProvinceChange(province)}
                >
                  {province}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium mb-2">District</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent"
                disabled={disabled || !selectedProvince}
              >
                <span>{selectedDistrict || "Select District"}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {districts.map((district) => (
                <DropdownMenuItem
                  key={district}
                  onClick={() => handleDistrictChange(district)}
                >
                  {district}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sector */}
        <div>
          <label className="block text-sm font-medium mb-2">Sector</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent"
                disabled={disabled || !selectedDistrict}
              >
                <span>{selectedSector || "Select Sector"}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {sectors.map((sector) => (
                <DropdownMenuItem
                  key={sector}
                  onClick={() => handleSectorChange(sector)}
                >
                  {sector}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selected Location Display */}
      {value && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <span>
              {value.sector}, {value.district}, {value.province}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
