"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"

interface ReviewsFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  ratingFilter: string
  onRatingChange: (value: string) => void
  propertyFilter: string
  onPropertyChange: (value: string) => void
  properties: string[]
  onReset: () => void
}

export function ReviewsFilter({
  searchTerm,
  onSearchChange,
  ratingFilter,
  onRatingChange,
  propertyFilter,
  onPropertyChange,
  properties,
  onReset,
}: ReviewsFilterProps) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-6 flex-shadow">
      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[var(--flex-primary)] rounded-lg flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--flex-primary)]">Filter Reviews</h3>
        </div>
      </div>

      {/* Compact Filter Controls */}
      <div className="flex flex-col md:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--flex-text)]/60" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 w-full bg-white border border-[var(--border)] hover:border-[var(--flex-primary)]/50 focus:border-[var(--flex-primary)] focus:ring-2 focus:ring-[var(--flex-primary)]/20 rounded-lg transition-all duration-200 placeholder:text-[var(--flex-text)]/60"
          />
        </div>

        {/* Property Filter */}
        <div className="flex-1">
          <Select value={propertyFilter} onValueChange={onPropertyChange}>
            <SelectTrigger className="h-10 w-full bg-white border border-[var(--border)] hover:border-[var(--flex-primary)]/50 focus:border-[var(--flex-primary)] focus:ring-2 focus:ring-[var(--flex-primary)]/20 rounded-lg transition-all duration-200">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-[var(--border)] shadow-xl rounded-lg z-50 max-h-60 overflow-y-auto">
              <SelectItem value="all" className="hover:bg-[var(--flex-cream)] focus:bg-[var(--flex-cream)] rounded-md m-1">
                All Properties
              </SelectItem>
              {properties.map((property) => (
                <SelectItem
                  key={property}
                  value={property}
                  className="hover:bg-[var(--flex-cream)] focus:bg-[var(--flex-cream)] rounded-md m-1"
                >
                  {property}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="flex-1">
          <Select value={ratingFilter} onValueChange={onRatingChange}>
            <SelectTrigger className="h-10 w-full bg-white border border-[var(--border)] hover:border-[var(--flex-primary)]/50 focus:border-[var(--flex-primary)] focus:ring-2 focus:ring-[var(--flex-primary)]/20 rounded-lg transition-all duration-200">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-[var(--border)] shadow-xl rounded-lg z-50 max-h-60 overflow-y-auto">
              <SelectItem value="all" className="hover:bg-[var(--flex-cream)] focus:bg-[var(--flex-cream)] rounded-md m-1">
                All Ratings
              </SelectItem>
              <SelectItem value="10" className="hover:bg-[var(--flex-cream)] focus:bg-[var(--flex-cream)] rounded-md m-1">
                ⭐ 10 Stars
              </SelectItem>
              <SelectItem value="9" className="hover:bg-[var(--flex-cream)] focus:bg-[var(--flex-cream)] rounded-md m-1">
                ⭐ 9+ Stars
              </SelectItem>
              <SelectItem value="8" className="hover:bg-[var(--flex-cream)] focus:bg-[var(--flex-cream)] rounded-md m-1">
                ⭐ 8+ Stars
              </SelectItem>
              <SelectItem value="7" className="hover:bg-[var(--flex-cream)] focus:bg-[var(--flex-cream)] rounded-md m-1">
                ⭐ 7+ Stars
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={onReset}
            className="h-10 px-4 bg-white border border-[var(--border)] hover:bg-[var(--flex-primary)] hover:border-[var(--flex-primary)] text-[var(--flex-text)] hover:text-white font-medium rounded-lg transition-all duration-200 whitespace-nowrap"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
