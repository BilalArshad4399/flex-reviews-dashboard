"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  MapPin, Bed, Bath, Users, Star, ArrowRight, Calendar,
  ChevronDown, Filter, Heart, Share2, Wifi, Car, Coffee
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/Header"

const PROPERTIES = [
  {
    id: "175160",
    name: "Luxury Studio in Central London",
    location: "Central London",
    address: "123 Oxford Street, London W1D 2LN",
    price: 150,
    currency: "£",
    priceLabel: "per night",
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    beds: 1,
    rating: 4.8,
    reviewsCount: 24,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"
    ],
    amenities: ["WiFi", "Kitchen", "Washing Machine", "TV"],
    featured: true,
    availability: "Available now"
  },
  {
    id: "128652",
    name: "2B N1 A - 29 Shoreditch Heights",
    location: "Shoreditch",
    address: "29 Shoreditch Heights, London E1 6QE",
    price: 250,
    currency: "£",
    priceLabel: "per night",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    beds: 3,
    rating: 4.9,
    reviewsCount: 18,
    images: [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1200",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200",
      "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200"
    ],
    amenities: ["WiFi", "Gym", "Parking", "Concierge"],
    featured: true,
    availability: "Available from Jan 15"
  }
]

export default function PropertiesPage() {
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)

  const locations = ["all", ...new Set(PROPERTIES.map(p => p.location))]
  
  let filteredProperties = [...PROPERTIES]
  
  // Apply location filter
  if (selectedLocation !== "all") {
    filteredProperties = filteredProperties.filter(p => p.location === selectedLocation)
  }
  
  // Apply price filter
  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-").map(Number)
    filteredProperties = filteredProperties.filter(p => {
      if (max) {
        return p.price >= min && p.price <= max
      }
      return p.price >= min
    })
  }
  
  // Apply sorting
  filteredProperties.sort((a, b) => {
    switch(sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "featured":
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    }
  })

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] mt-[88px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(40, 78, 76, 0.7), rgba(40, 78, 76, 0.7)), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920')`
          }}
        />
        <div className="relative h-full flex items-center justify-center text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Premium serviced apartments across London's finest locations
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-2 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by location or property name..."
                    className="w-full px-4 py-3 rounded-lg focus:outline-none"
                  />
                </div>
                <button className="bg-[#284E4C] text-white px-8 py-3 rounded-lg hover:bg-[#1e3a39] transition">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-[88px] z-40 bg-white border-b shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {/* Quick Filters */}
              <div className="hidden md:flex items-center gap-2">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#284E4C]"
                >
                  <option value="all">All Locations</option>
                  {locations.slice(1).map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#284E4C]"
                >
                  <option value="all">Any Price</option>
                  <option value="0-150">Under £150</option>
                  <option value="150-250">£150 - £250</option>
                  <option value="250-350">£250 - £350</option>
                  <option value="350-9999">£350+</option>
                </select>
              </div>
            </div>
            
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden md:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#284E4C]"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Any</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Any</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Any</option>
                    <option>1-2</option>
                    <option>3-4</option>
                    <option>5+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Any</option>
                    <option>WiFi</option>
                    <option>Parking</option>
                    <option>Gym</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Count */}
      <section className="max-w-[1400px] mx-auto px-6 pt-8">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-[#333333]">{filteredProperties.length}</span> properties
          {selectedLocation !== "all" && ` in ${selectedLocation}`}
        </p>
      </section>

      {/* Properties Grid */}
      <section className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <Link 
              key={property.id} 
              href={`/property/${property.id}`}
              className="group"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                {/* Property Images */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay Elements */}
                  <div className="absolute top-4 left-4">
                    {property.featured && (
                      <span className="bg-[#284E4C] text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition">
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition">
                      <Share2 className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                      <span className="font-semibold text-[#333333]">{property.rating}</span>
                      <span className="text-gray-600 text-sm">({property.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-[#333333] mb-2 group-hover:text-[#284E4C] transition line-clamp-1">
                      {property.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-[#5C5C5A] mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.address}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#5C5C5A] mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{property.maxGuests} guests</span>
                      </div>
                    </div>
                    
                    {/* Amenities Preview */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-[#F1F3EE] rounded-full text-xs text-[#5C5C5A]"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-[#F1F3EE] rounded-full text-xs text-[#5C5C5A]">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-2xl font-bold text-[#284E4C]">
                        {property.currency}{property.price}
                        <span className="text-sm font-normal text-[#5C5C5A] ml-1">/{property.priceLabel}</span>
                      </p>
                      <p className="text-xs text-[#5C5C5A] mt-1">{property.availability}</p>
                    </div>
                    <button className="bg-[#284E4C] text-white px-4 py-2 rounded-lg hover:bg-[#1e3a39] transition flex items-center gap-2">
                      <span className="text-sm font-medium">View</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#F1F3EE] py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#333333] mb-4">
              Stay Updated
            </h2>
            <p className="text-[#5C5C5A] mb-8">
              Get the latest properties and exclusive offers delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#284E4C]"
              />
              <button className="bg-[#284E4C] text-white px-6 py-3 rounded-lg hover:bg-[#1e3a39] transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#284E4C] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src="https://lsmvmmgkpbyqhthzdexc.supabase.co/storage/v1/object/public/website/Uploads/White_V3%20Symbol%20%26%20Wordmark.png"
                alt="The Flex"
                className="h-10 mb-4"
              />
              <p className="text-gray-300 text-sm">
                Premium serviced apartments for modern living
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                <li><Link href="/properties" className="hover:text-white transition">Properties</Link></li>
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Locations</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Central London</li>
                <li>Canary Wharf</li>
                <li>Shoreditch</li>
                <li>King's Cross</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📧 info@theflex.global</li>
                <li>📱 +44 77 2374 5646</li>
                <li>📍 London, UK</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>© 2024 The Flex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}