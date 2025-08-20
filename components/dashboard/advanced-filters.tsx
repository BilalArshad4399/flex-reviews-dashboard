"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Filter, X } from "lucide-react"
import type { ReviewFilters } from "@/lib/types"

interface AdvancedFiltersProps {
  filters: ReviewFilters
  onFiltersChange: (filters: ReviewFilters) => void
  properties: string[]
  categories: string[]
}

export function AdvancedFilters({ filters, onFiltersChange, properties, categories }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof ReviewFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" || value === "" ? undefined : value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined)

  return (
    <Card className="shadow-sm border border-gray-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors py-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-emerald-600" />
                <span className="text-lg font-semibold text-gray-900">Advanced Filters</span>
                {hasActiveFilters && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
                    Active
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="property-filter" className="text-sm font-medium text-gray-700">
                  Property
                </Label>
                <div className="relative">
                  <Select value={filters.listing || "all"} onValueChange={(value) => updateFilter("listing", value)}>
                    <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property} value={property} className="hover:bg-emerald-50">
                          {property}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating-filter" className="text-sm font-medium text-gray-700">
                  Minimum Rating
                </Label>
                <div className="relative">
                  <Select
                    value={filters.rating?.toString() || "all"}
                    onValueChange={(value) => updateFilter("rating", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Ratings</SelectItem>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()} className="hover:bg-emerald-50">
                          {rating}+ Stars
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
                  Category
                </Label>
                <div className="relative">
                  <Select value={filters.category || "all"} onValueChange={(value) => updateFilter("category", value)}>
                    <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="hover:bg-emerald-50">
                          {category.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                  Approval Status
                </Label>
                <div className="relative">
                  <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value)}>
                    <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved" className="hover:bg-emerald-50">
                        Approved
                      </SelectItem>
                      <SelectItem value="pending" className="hover:bg-emerald-50">
                        Pending
                      </SelectItem>
                      <SelectItem value="rejected" className="hover:bg-emerald-50">
                        Rejected
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-from" className="text-sm font-medium text-gray-700">
                  Date From
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  className="bg-white border-gray-200 shadow-sm hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to" className="text-sm font-medium text-gray-700">
                  Date To
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  className="bg-white border-gray-200 shadow-sm hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors bg-transparent"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
