'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import * as LucideIcons from 'lucide-react'
import { Search, X } from 'lucide-react'

interface IconPickerProps {
  value: string | null
  onChange: (iconName: string | null) => void
}

// Popular icons for categories - expanded list
const popularIcons = [
  'Sparkles', 'Droplets', 'Heart', 'Wind', 'Dog', 'Car', 'Package',
  'FlaskConical', 'Leaf', 'Zap', 'Shield', 'ShoppingCart', 'Home',
  'Utensils', 'Shirt', 'Gamepad2', 'Music', 'Book', 'Camera', 'Gift',
  'Star', 'Bell', 'Settings', 'User', 'Users', 'Mail', 'Phone',
  'MapPin', 'Calendar', 'Clock', 'TrendingUp', 'Target', 'Award',
  'Trophy', 'CheckCircle', 'AlertCircle', 'Info', 'HelpCircle',
  'Wrench', 'Hammer', 'Scissors', 'Brush', 'Paintbrush', 'Palette',
  'Beaker', 'Microscope', 'Atom', 'Flower', 'TreePine', 'Mountain',
  'Sun', 'Moon', 'Cloud', 'Droplet', 'Flame', 'Snowflake',
  'Coffee', 'Wine', 'Pizza', 'Apple', 'Banana', 'Cherry',
  'Bike', 'Plane', 'Ship', 'Train', 'Bus', 'Taxi',
  'Building', 'Store', 'Warehouse', 'Factory', 'Hospital', 'School'
]

// Get all available Lucide icons - filter out Icon suffix variants
const getAllIcons = (): string[] => {
  const iconNames: string[] = []
  const seen = new Set<string>()
  const excluded = new Set([
    'createLucideIcon',
    'Icon',
    'default',
    'lucideReact',
    'IconNode',
    'IconProps',
    'IconContext',
    'Search',
    'X'
  ])
  
  try {
    for (const name in LucideIcons) {
      // Skip excluded names
      if (excluded.has(name)) continue
      
      // Skip if ends with "Icon" (these are duplicates)
      if (name.endsWith('Icon')) continue
      
      const item = LucideIcons[name as keyof typeof LucideIcons]
      
      // Check if it's a function (React component)
      if (typeof item === 'function') {
        // Check if it starts with uppercase (React component convention)
        if (name.length > 0 && name[0] === name[0].toUpperCase()) {
          // Avoid duplicates
          if (!seen.has(name)) {
            iconNames.push(name)
            seen.add(name)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error getting icons:', error)
  }
  
  return iconNames.sort()
}

// Initialize all icons at module level
const allIcons = getAllIcons()

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedIcon = value ? (LucideIcons[value as keyof typeof LucideIcons] as React.ComponentType<any>) : null

  const filteredIcons = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    
    // If no search query, show popular icons
    if (!query) {
      return popularIcons
    }
    
    // If allIcons is empty, fallback to searching popular icons
    if (allIcons.length === 0) {
      return popularIcons.filter(iconName => 
        iconName.toLowerCase().includes(query)
      )
    }
    
    // Search through all icons
    const results = allIcons.filter(iconName => {
      const lowerName = iconName.toLowerCase()
      return lowerName.includes(query)
    })
    
    // Limit to 200 results for performance
    return results.slice(0, 200)
  }, [searchQuery])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleIconSelect = (iconName: string) => {
    onChange(iconName)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-nature-green-700 mb-2">
        Icon
      </label>
      
      {/* Selected Icon Display */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-16 h-16 bg-nature-green-50 border-2 border-nature-green-200 rounded-lg hover:border-nature-green-400 transition-colors"
        >
          {selectedIcon ? (
            (() => {
              const IconComponent = selectedIcon
              return <IconComponent className="w-8 h-8 text-nature-green-600" />
            })()
          ) : (
            <span className="text-nature-green-400 text-sm">Select</span>
          )}
        </button>
        
        {selectedIcon && (
          <>
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Clear icon"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
              {value}
            </span>
          </>
        )}
      </div>

      {/* Icon Picker Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setIsOpen(false)
              setSearchQuery('')
            }}
          />
          <div 
            ref={modalRef}
            className="absolute z-50 mt-2 w-full max-w-2xl bg-white rounded-xl shadow-2xl border-2 border-nature-green-200 max-h-[600px] flex flex-col"
          >
            {/* Header with Search */}
            <div className="p-4 border-b border-nature-green-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-nature-green-800">Select Icon</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search icons by name (e.g., heart, star, home)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsOpen(false)
                      setSearchQuery('')
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-nature-green-200 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent"
                />
              </div>
              {!searchQuery && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing popular icons. Type to search all {allIcons.length > 0 ? `${allIcons.length}+` : 'available '}icons.
                </p>
              )}
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-2">
                  Found {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </p>
              )}
            </div>

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-8 gap-3">
                  {filteredIcons.map((iconName) => {
                    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>
                    if (!IconComponent || typeof IconComponent !== 'function') {
                      return null
                    }
                    
                    const isSelected = value === iconName
                    
                    try {
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => handleIconSelect(iconName)}
                          className={`p-3 rounded-lg border-2 transition-all hover:scale-110 flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-nature-green-100 border-nature-green-600 shadow-md'
                              : 'bg-gray-50 border-gray-200 hover:border-nature-green-400 hover:bg-nature-green-50'
                          }`}
                          title={iconName}
                        >
                          <IconComponent className={`w-5 h-5 ${
                            isSelected ? 'text-nature-green-600' : 'text-gray-600'
                          }`} />
                          <span className={`text-[10px] font-medium truncate w-full text-center ${
                            isSelected ? 'text-nature-green-700' : 'text-gray-500'
                          }`}>
                            {iconName.length > 8 ? iconName.substring(0, 7) + '...' : iconName}
                          </span>
                        </button>
                      )
                    } catch (error) {
                      console.warn(`Failed to render icon: ${iconName}`, error)
                      return null
                    }
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">No icons found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-nature-green-100 flex justify-between items-center bg-gray-50">
              <span className="text-sm text-gray-600">
                {searchQuery ? `${filteredIcons.length} result${filteredIcons.length !== 1 ? 's' : ''}` : `${popularIcons.length} popular icons`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setSearchQuery('')
                }}
                className="px-4 py-2 bg-nature-green-600 hover:bg-nature-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
