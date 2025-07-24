"use client"

import { useState, useEffect } from "react"
import { RWANDA_LOCATIONS } from "@/constants/rwandaLocations"

interface LocationPickerProps {
  value?: {
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
  }
  onChange: (location: {
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
  }) => void
  required?: boolean
  className?: string
}

export function LocationPicker({ value = {}, onChange, required = false, className = "" }: LocationPickerProps) {
  const [selectedProvince, setSelectedProvince] = useState(value.province || "")
  const [selectedDistrict, setSelectedDistrict] = useState(value.district || "")
  const [selectedSector, setSelectedSector] = useState(value.sector || "")
  const [selectedCell, setSelectedCell] = useState(value.cell || "")
  const [selectedVillage, setSelectedVillage] = useState(value.village || "")

  const provinces = Object.keys(RWANDA_LOCATIONS)
  const districts = selectedProvince ? Object.keys(RWANDA_LOCATIONS[selectedProvince] || {}) : []
  const sectors =
    selectedDistrict && selectedProvince
      ? Object.keys(RWANDA_LOCATIONS[selectedProvince]?.[selectedDistrict] || {})
      : []
  const cells =
    selectedSector && selectedDistrict && selectedProvince
      ? Object.keys(RWANDA_LOCATIONS[selectedProvince]?.[selectedDistrict]?.[selectedSector] || {})
      : []
  const villages =
    selectedCell && selectedSector && selectedDistrict && selectedProvince
      ? RWANDA_LOCATIONS[selectedProvince]?.[selectedDistrict]?.[selectedSector]?.[selectedCell] || []
      : []

  useEffect(() => {
    onChange({
      province: selectedProvince || undefined,
      district: selectedDistrict || undefined,
      sector: selectedSector || undefined,
      cell: selectedCell || undefined,
      village: selectedVillage || undefined,
    })
  }, [selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage, onChange])

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province)
    setSelectedDistrict("")
    setSelectedSector("")
    setSelectedCell("")
    setSelectedVillage("")
  }

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district)
    setSelectedSector("")
    setSelectedCell("")
    setSelectedVillage("")
  }

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector)
    setSelectedCell("")
    setSelectedVillage("")
  }

  const handleCellChange = (cell: string) => {
    setSelectedCell(cell)
    setSelectedVillage("")
  }

  const selectClasses =
    "w-full px-4 py-3 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Province {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className={selectClasses}
          required={required}
        >
          <option value="">Select Province</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {selectedProvince && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            District {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className={selectClasses}
            required={required}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedDistrict && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sector</label>
          <select value={selectedSector} onChange={(e) => handleSectorChange(e.target.value)} className={selectClasses}>
            <option value="">Select Sector</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedSector && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cell</label>
          <select value={selectedCell} onChange={(e) => handleCellChange(e.target.value)} className={selectClasses}>
            <option value="">Select Cell</option>
            {cells.map((cell) => (
              <option key={cell} value={cell}>
                {cell}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedCell && villages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Village</label>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className={selectClasses}
          >
            <option value="">Select Village</option>
            {villages.map((village) => (
              <option key={village} value={village}>
                {village}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
