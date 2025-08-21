"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  Users, Wifi, Bed, Bath,
  ChevronDown, WashingMachine, Wind,
  Mail, Clock,
  Expand, X, ChevronLeft, ChevronRight, House,
  Sofa, Network, UtensilsCrossed, Thermometer, ShieldCheck, Calendar, CalendarCheck, MessageCircle, Shield,
  Ban, PawPrint, PartyPopper, CalendarClock, Headphones, Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/Header"

interface PropertyReview {
  id: number
  guest_name: string
  rating: number
  text: string
  submitted_at: string
  source?: string
  cleanliness?: number
  communication?: number
  comfort?: number
  location?: number
}

interface PropertyDetails {
  id: string
  name: string
  location: string
  address: string
  price: string
  bedrooms: number
  bathrooms: number
  beds: number
  maxGuests: number
  description: string
  images: string[]
  amenities: Record<string, boolean>
  reviews: PropertyReview[]
  averageRating: number
  totalReviews: number
  checkInTime: string
  checkOutTime: string
  minStay: number
  refundPolicy: {
    short: string[]
    long: string[]
  }
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const [property, setProperty] = useState<PropertyDetails | null>(null)
  const [reviews, setReviews] = useState<PropertyReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(3)
  const [isBookingFixed, setIsBookingFixed] = useState(false)
  const [bookingPosition, setBookingPosition] = useState<'normal' | 'fixed' | 'absolute'>('normal')
  const bookingRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    fetchPropertyDetails()
    fetchReviews()
  }, [params.id])

  useEffect(() => {
    const handleScroll = () => {
      if (!placeholderRef.current || !bookingRef.current || !footerRef.current) return
      
      const placeholder = placeholderRef.current.getBoundingClientRect()
      const footer = footerRef.current.getBoundingClientRect()
      const bookingHeight = bookingRef.current.offsetHeight
      
      // Check if we should start sticking
      const shouldFix = placeholder.top <= 100
      
      // Calculate how much space is available before footer (with 20px buffer)
      const availableSpace = footer.top - 20
      const desiredTop = 100
      
      if (!shouldFix) {
        // Normal position
        setBookingPosition('normal')
        setIsBookingFixed(false)
        bookingRef.current.style.width = 'auto'
      } else {
        // Fixed position
        setBookingPosition('fixed')
        setIsBookingFixed(true)
        const width = placeholderRef.current.offsetWidth
        bookingRef.current.style.width = `${width}px`
        
        // Adjust top position if it would overlap footer
        if (availableSpace < (desiredTop + bookingHeight)) {
          // Keep it fixed but adjust top to stay above footer
          const adjustedTop = Math.max(availableSpace - bookingHeight, 0)
          bookingRef.current.style.top = `${adjustedTop}px`
        } else {
          // Normal fixed position
          bookingRef.current.style.top = `${desiredTop}px`
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isBookingFixed])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesPerView(1)
      } else if (window.innerWidth < 1280) {
        setSlidesPerView(2)
      } else {
        setSlidesPerView(2) // Show 2 cards on desktop for better readability
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`/api/property/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setProperty(data.data)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      // Fetch reviews from the hostaway endpoint using propertyId mapping
      const response = await fetch(`/api/reviews/hostaway?propertyId=${params.id}`)
      const data = await response.json()
      
      
      // Check if we have a listing with reviews (new API structure)
      if (data && data.listing && data.listing.reviews && data.listing.reviews.length > 0) {
        // Transform reviews from the new API structure
        const transformedReviews: PropertyReview[] = data.listing.reviews.map((review: any) => ({
          id: review.id,
          guest_name: review.guestName || 'Anonymous',
          rating: review.rating || 0,
          text: review.reviewText || '',
          submitted_at: review.submittedAt,
          source: 'Hostaway',
          cleanliness: review.categories?.cleanliness,
          communication: review.categories?.communication,
          comfort: review.categories?.comfort,
          location: review.categories?.location,
        }))
        
        setReviews(transformedReviews)
        
        // Use the pre-calculated average rating from the API
        setAverageRating(data.listing.averageRating || 0)
      } else {
        setReviews([])
        setAverageRating(0)
      }
    } catch (error) {
      setReviews([])
      setAverageRating(0)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFFDF7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B7B7A]"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-2">Property not found</h1>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Header */}
      <Header />

      {/* Image Gallery - Added padding-top to account for fixed header */}
      <section className="max-w-[1400px] mx-auto px-6 py-6 pt-[112px]">
        <div className="hidden md:block">
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[600px]">
            {/* Main Image */}
            <div 
              className="col-span-2 row-span-2 relative cursor-pointer group"
              onClick={() => {
                setCurrentImageIndex(0)
                setShowGalleryModal(true)
              }}
            >
              <img 
                src={property.images[0]} 
                alt={`${property.name} - Main`}
                className="w-full h-full object-cover rounded-l-xl"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-200 rounded-l-xl"></div>
            </div>
            
            {/* Side Images */}
            <div 
              className="relative cursor-pointer group"
              onClick={() => {
                setCurrentImageIndex(1)
                setShowGalleryModal(true)
              }}
            >
              <img 
                src={property.images[1] || property.images[0]} 
                alt={`${property.name} - Image 2`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-200"></div>
            </div>
            
            <div 
              className="relative cursor-pointer group"
              onClick={() => {
                setCurrentImageIndex(2)
                setShowGalleryModal(true)
              }}
            >
              <img 
                src={property.images[2] || property.images[0]} 
                alt={`${property.name} - Image 3`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-200"></div>
            </div>
            
            <div 
              className="relative cursor-pointer group"
              onClick={() => {
                setCurrentImageIndex(3)
                setShowGalleryModal(true)
              }}
            >
              <img 
                src={property.images[3] || property.images[1] || property.images[0]} 
                alt={`${property.name} - Image 4`}
                className="w-full h-full object-cover rounded-tr-xl"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-200 rounded-tr-xl"></div>
            </div>
            
            <div 
              className="relative cursor-pointer group"
              onClick={() => {
                setCurrentImageIndex(4)
                setShowGalleryModal(true)
              }}
            >
              <img 
                src={property.images[4] || property.images[2] || property.images[0]} 
                alt={`${property.name} - Image 5`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-200"></div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(0)
                  setShowGalleryModal(true)
                }}
                className="absolute bottom-6 right-6 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <Expand className="h-4 w-4" />
                View all photos
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Gallery */}
        <div className="md:hidden">
          <div className="relative">
            <img 
              src={property.images[currentImageIndex]} 
              alt={property.name}
              className="w-full h-[300px] object-cover rounded-lg"
              onClick={() => setShowGalleryModal(true)}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {property.images.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white w-6' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
            <div className="text-white text-sm font-medium">
              {currentImageIndex + 1} / {property.images.length}
            </div>
            <button
              onClick={() => setShowGalleryModal(false)}
              className="text-white p-2 hover:bg-white/10 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Main Image Container */}
          <div className="flex-1 flex items-center justify-center relative px-20">
            <button
              onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : property.images.length - 1)}
              className="absolute left-4 text-white p-3 hover:bg-white/10 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setCurrentImageIndex(prev => prev < property.images.length - 1 ? prev + 1 : 0)}
              className="absolute right-4 text-white p-3 hover:bg-white/10 rounded-full transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <div className="max-w-[1200px] max-h-[70vh] w-full h-full flex items-center justify-center">
              <img 
                src={property.images[currentImageIndex]} 
                alt={`${property.name} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
          
          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
            <div className="flex gap-2 overflow-x-auto justify-center">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 transition-all ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-white opacity-100' 
                      : 'opacity-60 hover:opacity-80'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`}
                    className="h-16 w-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Property Title and Stats - Desktop */}
      <section className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-6 text-[#333333]">
            <span>{property.name}</span>
          </h1>
          
          {/* Property Stats with border */}
          <div className="flex items-center gap-8 border-b border-gray-200 pb-8">
            <button data-state="closed">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full">
                  <Users className="h-5 w-5 text-[#5C5C5A]" />
                </div>
                <div className="text-sm">
                  <span className="font-medium text-[#333333]">{property.maxGuests}</span>
                  <span className="text-[#5C5C5A] block">
                    <span>guests</span>
                  </span>
                </div>
              </div>
            </button>
            
            <button data-state="closed">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full">
                  <Bed className="h-5 w-5 text-[#5C5C5A]" />
                </div>
                <div className="text-sm">
                  <span className="font-medium text-[#333333]">{property.bedrooms}</span>
                  <span className="text-[#5C5C5A] block">
                    <span>bedrooms</span>
                  </span>
                </div>
              </div>
            </button>
            
            <button data-state="closed">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full">
                  <Bath className="h-5 w-5 text-[#5C5C5A]" />
                </div>
                <div className="text-sm">
                  <span className="font-medium text-[#333333]">{property.bathrooms}</span>
                  <span className="text-[#5C5C5A] block">
                    <span>bathrooms</span>
                  </span>
                </div>
              </div>
            </button>
            
            <button data-state="closed">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full">
                  <House className="h-5 w-5 text-[#5C5C5A]" />
                </div>
                <div className="text-sm">
                  <span className="font-medium text-[#333333]">{property.beds || 5}</span>
                  <span className="text-[#5C5C5A] block">
                    <span>beds</span>
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile version */}
        <div className="md:hidden">
          <h1 className="text-2xl font-bold mb-4 text-[#333333]">
            {property.name}
          </h1>
          <div className="flex flex-wrap gap-4 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#5C5C5A]" />
              <span className="text-sm">
                <span className="font-medium text-[#333333]">{property.maxGuests}</span>
                <span className="text-[#5C5C5A] ml-1">guests</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-[#5C5C5A]" />
              <span className="text-sm">
                <span className="font-medium text-[#333333]">{property.bedrooms}</span>
                <span className="text-[#5C5C5A] ml-1">bedrooms</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-[#5C5C5A]" />
              <span className="text-sm">
                <span className="font-medium text-[#333333]">{property.bathrooms}</span>
                <span className="text-[#5C5C5A] ml-1">bathrooms</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <House className="h-4 w-4 text-[#5C5C5A]" />
              <span className="text-sm">
                <span className="font-medium text-[#333333]">{property.beds || 5}</span>
                <span className="text-[#5C5C5A] ml-1">beds</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-[1400px] mx-auto px-6 pb-12 mt-12" style={{ overflow: 'visible' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Content - Made responsive */}
          <div className="lg:col-span-2 space-y-8" style={{ minHeight: '100vh' }}>
            {/* About Property */}
            <div className="rounded-lg mb-8 p-6 bg-white shadow-lg" style={{ border: '0px solid rgb(229, 229, 229)' }}>
              <h2 className="mb-4 text-[#333333]" style={{ 
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: '32px',
                fontFamily: '__Inter_19640c, __Inter_Fallback_19640c, Inter, sans-serif'
              }}>
                <span style={{ display: 'inline' }}>About this property</span>
              </h2>
              <div className="space-y-4">
                <p className="text-[#5C5C5A] whitespace-pre-line" style={{
                  lineHeight: '24px',
                  fontFamily: '__Inter_19640c, __Inter_Fallback_19640c, Inter, sans-serif',
                  fontSize: '14px',
                  color: 'rgb(92, 92, 90)'
                }}>
                  <span className="" style={{ display: showFullDescription ? 'block' : 'inline' }}>
                    {showFullDescription ? (
                      <>This spacious apartment in Nine Elms is ideal for up to {property.maxGuests} guests. It has {property.bedrooms} bedrooms, each with a double bed for 2 people, and a large living room with an extra single bed for one more guest. With {property.bathrooms} modern bathrooms, you'll have plenty of space and privacy. The fully equipped kitchen makes cooking easy, and the balcony offers a great spot to relax. Whether you're here for business or leisure, this apartment combines comfort, convenience, and a fantastic location for exploring London.

I'm happy to welcome you to this stylish apartment, perfect for families or groups looking for a comfortable stay. With {property.bedrooms} spacious bedrooms, each featuring a double bed for 2 people, it's ideal for up to 6 guests. The large living room also has an extra single bed, perfect for one more guest.

You'll find {property.bathrooms} modern bathrooms, a fully equipped kitchen with top-notch appliances, and a lovely balcony to relax on. For your comfort, all duvets and pillows are hypoallergenic, and the bed linen is 100% cotton.

The apartment is beautifully decorated to the highest standards, offering fast Wi-Fi and all the amenities you need for a relaxing stay. Whether you're here for business or leisure, this apartment is a fantastic base to explore Nine Elms and beyond.

I'm here to ensure your experience is exceptional, so feel free to contact me for anything you might need!

To complete your check-in, I'll need to see a valid ID and have you agree to our terms and conditions. This helps maintain a safe and friendly atmosphere for everyone, and I greatly appreciate your collaboration.

Nine Elms is a dynamic and rapidly developing area in London, offering a perfect blend of modern living and convenience. Whether you're here for a short visit or longer stay, there's plenty to explore. Here's why I think Nine Elms is a great spot:

Excellent Transport Links: Nine Elms station (on the Northern Line) makes getting into central London quick and easy. Plus, there are great bus routes nearby.

Riverside Location: The Thames is just a short walk away, offering beautiful views and scenic walks along the river.

Growing Neighborhood: Nine Elms has seen a lot of exciting development in recent years, with new shops, cafes, and restaurants popping up all the time.

Green Spaces: The area is close to Battersea Park and other green spaces, perfect for outdoor activities, relaxing, or picnicking by the water.

Dining and Entertainment: Nine Elms offers a variety of trendy cafes, restaurants, and bars, and with its proximity to areas like Clapham and Vauxhall, you're never far from even more dining and nightlife options.

Cultural Hotspot: The area is near attractions like the Tate Britain, the new American Embassy, and is a short walk from the vibrant culture of South Bank.

Family-Friendly: With parks, playgrounds, and good schools in the area, Nine Elms is a welcoming neighborhood for families.

Nine Elms is a perfect blend of urban excitement, riverside charm, and convenience, making it a fantastic place to stay and explore all that London has to offer.

A Toca Restaurant - 3 mins walk
Avenida Brasil UK - 8 mins walk
Lansdowne Green (Stop H) - 1 min walk</>
                    ) : (
                      <>This spacious apartment in Nine Elms is ideal for up to {property.maxGuests} guests. It has {property.bedrooms} bedrooms, each with a double bed for 2 people, and a large living room with an extra single bed for one more guest. With {property.bathrooms} modern bathrooms, you'll have plenty of space and privacy. The fully equipped kitchen makes cooking ea...</>
                    )}
                  </span>
                </p>
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 underline-offset-4 text-[#284E4C] hover:text-[#284E4C]/90 p-0 h-auto"
                >
                  <span>{showFullDescription ? 'Show less' : 'Read more'}</span>
                </button>
              </div>
            </div>

            {/* Amenities */}
            <div className="rounded-lg text-card-foreground p-6 mb-12 bg-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold" style={{
                  fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                  fontSize: '24px',
                  lineHeight: '32px',
                  fontWeight: 700,
                  color: '#0A0A0A'
                }}>
                  <span>Amenities</span>
                </h2>
                <button 
                  className="justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-sm h-9 px-4 py-2 flex items-center gap-2 border-[#284E4C]/20 text-[#284E4C] hover:bg-[#284E4C]/5"
                  type="button"
                >
                  <span>View all amenities</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 text-[#5C5C5A]">
                  <div className="p-2 rounded-full">
                    <Sofa className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-base leading-6 font-normal" style={{
                    fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    color: '#5C5C5A'
                  }}>
                    <span>Cable TV</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5C5A]">
                  <div className="p-2 rounded-full">
                    <Network className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-base leading-6 font-normal" style={{
                    fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    color: '#5C5C5A'
                  }}>
                    <span>Internet</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5C5A]">
                  <div className="p-2 rounded-full">
                    <Wifi className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-base leading-6 font-normal" style={{
                    fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    color: '#5C5C5A'
                  }}>
                    <span>Wireless</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5C5A]">
                  <div className="p-2 rounded-full">
                    <UtensilsCrossed className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-base leading-6 font-normal" style={{
                    fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    color: '#5C5C5A'
                  }}>
                    <span>Kitchen</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5C5A]">
                  <div className="p-2 rounded-full">
                    <WashingMachine className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-base leading-6 font-normal" style={{
                    fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    color: '#5C5C5A'
                  }}>
                    <span>Washing Machine</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5C5A]">
                  <div className="p-2 rounded-full">
                    <Wind className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-base leading-6 font-normal" style={{
                    fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    color: '#5C5C5A'
                  }}>
                    <span>Hair Dryer</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5C5A]">
                  <div className="p-2 rounded-full">
                    <Thermometer className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-base leading-6 font-normal" style={{
                    fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    color: '#5C5C5A'
                  }}>
                    <span>Heating</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5C5A]">
                  <div className="p-2 rounded-full">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-base leading-6 font-normal" style={{
                    fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    color: '#5C5C5A'
                  }}>
                    <span>Smoke detector</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5C5A]">
                  <div className="p-2 rounded-full">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-base leading-6 font-normal" style={{
                    fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    color: '#5C5C5A'
                  }}>
                    <span>Carbon Monoxide Detector</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stay Policies */}
            <div className="rounded-lg text-card-foreground p-6 mb-8 bg-white border-0 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-[#333333]">
                <span>Stay Policies</span>
              </h2>
              
              <div className="space-y-8">
                {/* Check-in/out */}
                <div className="bg-[#F1F3EE] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full">
                      <Clock className="h-5 w-5 text-[#284E4C]" />
                    </div>
                    <h3 className="font-semibold text-lg text-[#333333]">
                      <span>Check-in & Check-out</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-[#5C5C5A]">
                        <span>Check-in time</span>
                      </p>
                      <p className="font-semibold text-lg text-[#333333]">
                        <span>3:00 PM</span>
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-[#5C5C5A]">
                        <span>Check-out time</span>
                      </p>
                      <p className="font-semibold text-lg text-[#333333]">
                        <span>10:00 AM</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* House Rules */}
                <div className="bg-[#F1F3EE] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full">
                      <Shield className="h-5 w-5 text-[#284E4C]" />
                    </div>
                    <h3 className="font-semibold text-lg text-[#333333]">
                      <span>House Rules</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                      <Ban className="h-5 w-5 text-[#5C5C5A]" />
                      <p className="font-medium text-[#333333]">
                        <span>No smoking</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                      <PawPrint className="h-5 w-5 text-[#5C5C5A]" />
                      <p className="font-medium text-[#333333]">
                        <span>No pets</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                      <PartyPopper className="h-5 w-5 text-[#5C5C5A]" />
                      <p className="font-medium text-[#333333]">
                        <span>No parties or events</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                      <Shield className="h-5 w-5 text-[#5C5C5A]" />
                      <p className="font-medium text-[#333333]">
                        <span className="">Security deposit required</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-[#F1F3EE] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full">
                      <CalendarClock className="h-5 w-5 text-[#284E4C]" />
                    </div>
                    <h3 className="font-semibold text-lg text-[#333333]">
                      <span>Cancellation Policy</span>
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-[#333333]">
                        <span>For stays less than 28 days</span>
                      </h4>
                      <div className="flex items-start gap-2 text-sm text-[#5C5C5A]">
                        <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0"></div>
                        <p><span>Full refund up to 14 days before check-in</span></p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-[#5C5C5A] mt-1">
                        <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0"></div>
                        <p><span>No refund for bookings less than 14 days before check-in</span></p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-[#333333]">
                        <span>For stays of 28 days or more</span>
                      </h4>
                      <div className="flex items-start gap-2 text-sm text-[#5C5C5A]">
                        <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0"></div>
                        <p><span>Full refund up to 30 days before check-in</span></p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-[#5C5C5A] mt-1">
                        <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0"></div>
                        <p><span>No refund for bookings less than 30 days before check-in</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="rounded-lg text-card-foreground p-6 mb-8 bg-white border-0 shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-[#333333]">
                  <span>Guest Reviews</span>
                </h2>
                
                {/* Rating Summary */}
                <div className="text-center mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex text-[#FFC107] text-2xl">
                      {"★".repeat(Math.round(averageRating / 2))}
                      <span className="text-gray-300">{"★".repeat(5 - Math.round(averageRating / 2))}</span>
                    </div>
                    <span className="text-xl font-medium text-[#333333]">
                      {averageRating > 0 
                        ? `${averageRating.toFixed(1)} out of 10`
                        : 'No ratings yet'
                      }
                    </span>
                  </div>
                  <p className="text-sm text-[#5C5C5A]">Based on {reviews.length} guest reviews</p>
                </div>
                
                {/* Reviews Slider */}
                <div className="relative">
                  <div className="overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ 
                        transform: `translateX(-${currentReviewIndex * (100 / slidesPerView)}%)`
                      }}
                    >
                      {reviews.map((review, index) => (
                        <div 
                          key={review.id} 
                          className="flex-shrink-0 px-3 md:px-4 lg:px-5"
                          style={{ width: `${100 / slidesPerView}%` }}
                        >
                          <div className="bg-white rounded-xl h-full flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="p-6 md:p-8 flex flex-col h-full">
                              {/* Stars with Rating */}
                              <div className="flex items-center gap-3 mb-4">
                                <div className="flex text-[#FFC107] text-xl">
                                  {"★".repeat(Math.min(5, Math.floor(review.rating / 2)))}
                                  <span className="text-gray-300">{"★".repeat(5 - Math.min(5, Math.floor(review.rating / 2)))}</span>
                                </div>
                                <span className="text-lg font-semibold text-[#333333]">
                                  {review.rating ? `${review.rating}/10` : 'No rating'}
                                </span>
                              </div>
                              
                              {/* Review Ratings if available */}
                              {(review.cleanliness || review.communication || review.comfort || review.location) && (
                                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                                  {review.cleanliness && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-600">Cleanliness:</span>
                                      <span className="font-semibold text-[#333333]">{review.cleanliness}/10</span>
                                    </div>
                                  )}
                                  {review.communication && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-600">Communication:</span>
                                      <span className="font-semibold text-[#333333]">{review.communication}/10</span>
                                    </div>
                                  )}
                                  {review.comfort && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-600">Comfort:</span>
                                      <span className="font-semibold text-[#333333]">{review.comfort}/10</span>
                                    </div>
                                  )}
                                  {review.location && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-600">Location:</span>
                                      <span className="font-semibold text-[#333333]">{review.location}/10</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Review Text */}
                              <p className="text-gray-700 mb-6 flex-grow leading-relaxed">
                                {review.text}
                              </p>
                              
                              {/* Source */}
                              {review.source && (
                                <p className="text-sm italic text-gray-600 mb-4">
                                  Source: {review.source}
                                </p>
                              )}
                              
                              {/* Footer */}
                              <div className="mt-auto -mx-6 md:-mx-8 -mb-6 md:-mb-8 px-6 md:px-8 py-4 bg-[#F1F3EE] rounded-b-xl">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#333333]">{review.guest_name}</span>
                                  <span className="text-sm font-bold text-[#5C5C5A]">
                                    {new Date(review.submitted_at).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    }).replace(/\//g, '.')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={() => {
                      setCurrentReviewIndex(prev => Math.max(0, prev - 1));
                    }}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-all ${
                      currentReviewIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={currentReviewIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const maxIndex = Math.max(0, reviews.length - slidesPerView);
                      setCurrentReviewIndex(prev => Math.min(maxIndex, prev + 1));
                    }}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-all ${
                      currentReviewIndex >= reviews.length - slidesPerView 
                        ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={currentReviewIndex >= reviews.length - slidesPerView}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Dots Indicator */}
                  <div className="flex justify-center mt-6 gap-2">
                    {Array.from({ 
                      length: Math.max(1, reviews.length - slidesPerView + 1)
                    }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentReviewIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentReviewIndex === index
                            ? 'bg-[#284E4C] w-6' 
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="rounded-lg text-card-foreground p-6 mb-8 bg-white border-0 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-[#333333]">
                <span>Location</span>
              </h2>
              <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden">
                <div className="relative w-full h-full">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.5947774689!2d-0.17276068422941!3d51.502436279635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzA4LjgiTiAwwrAxMCcyMi4wIlc!5e0!3m2!1sen!2suk!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div ref={placeholderRef} style={{ minHeight: isBookingFixed ? bookingRef.current?.offsetHeight : 'auto', position: 'relative' }}>
              <div 
              ref={bookingRef}
              className={`text-card-foreground bg-white dark:bg-gray-800 border-0 shadow-lg rounded-2xl transition-none ${
                bookingPosition === 'fixed' ? 'fixed z-40' : 
                bookingPosition === 'absolute' ? 'absolute z-40' : ''
              }`}
              style={
                bookingPosition === 'fixed' ? {
                  top: '100px',
                  right: 'auto',
                  left: placeholderRef.current ? `${placeholderRef.current.getBoundingClientRect().left}px` : 'auto'
                } : bookingPosition === 'absolute' ? {
                  position: 'absolute',
                  bottom: '0',
                  right: 'auto',
                  left: '0'
                } : {}
              }
            >
              {/* Header with green background */}
              <div className="relative overflow-hidden rounded-t-2xl">
                <div className="absolute inset-0 bg-[#284E4C] rounded-t-2xl"></div>
                <div className="relative p-6">
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-1">
                    <span className="">Book your stay</span>
                  </h3>
                  <p className="text-sm text-[#D2DADA]">
                    <span className="">Select dates to see the total price</span>
                  </p>
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-6 pt-4">
                {/* Date and Guest Selector */}
                <div className="space-y-1">
                  <div className="flex gap-2">
                    {/* Date Selector */}
                    <div className="flex-1">
                      <div className="grid w-full h-full [&>button]:w-full [&>button]:justify-start [&>button]:text-left [&>button]:h-[42px] [&>button]:bg-[#F1F3EE] [&>button]:border-0 [&>button]:shadow-sm [&>button]:hover:bg-[#FFFDF6] [&>button]:rounded-l-md [&>button]:rounded-r-none">
                        <button 
                          className="inline-flex items-center whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-input px-4 py-2 w-full h-full justify-start text-left font-normal bg-transparent border-0 shadow-none transition-colors rounded-none group hover:bg-transparent hover:text-current text-muted-foreground"
                          type="button"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>
                            <span>Select dates</span>
                          </span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Guest Selector */}
                    <div className="w-[120px]">
                      <button 
                        type="button" 
                        className="flex w-full items-center justify-between rounded-md border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 h-[42px] bg-[#F1F3EE] border-0 shadow-sm hover:bg-[#FFFDF6] transition-colors text-[#333333] rounded-l-none rounded-r-md"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span style={{ pointerEvents: 'none' }}>1</span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3 pt-6">
                  <button 
                    className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-12 rounded-md px-8 w-full bg-[#284E4C] hover:bg-[#284E4C]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={false}
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    <span>Check availability</span>
                  </button>
                  
                  <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-sm h-12 rounded-md px-8 w-full border-[#284E4C]/20 text-[#284E4C] hover:bg-[#284E4C]/5 hover:border-[#284E4C]/30">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span className="">Send Inquiry</span>
                  </button>
                </div>
                
                {/* Instant Confirmation */}
                <p className="text-sm text-[#5C5C5A] text-center mt-4">
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span className="">Instant confirmation</span>
                  </span>
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} className="bg-[#284E4C] text-white font-sans mt-0">
        <div className="container mx-auto px-4 py-16 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
            {/* Newsletter */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">
                  Join The Flex
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Sign up now and stay up to date on our latest news and exclusive deals including 5% off your first stay!
                </p>
              </div>
              
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-sans"
                    placeholder="First name"
                    required
                    type="text"
                  />
                  <input 
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-sans"
                    placeholder="Last name"
                    required
                    type="text"
                  />
                </div>
                <input 
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-sans"
                  placeholder="Email address"
                  required
                  type="email"
                />
                <div className="flex gap-2">
                  <button 
                    type="button"
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[120px] h-10 min-h-[40px] bg-white/10 border-white/20 text-white font-sans"
                  >
                    <div className="flex items-center gap-1 font-sans">
                      🇬🇧<span className="font-sans">+44</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  <input 
                    className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1 h-10 min-h-[40px] bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-sans"
                    placeholder="Phone number"
                    required
                    type="tel"
                  />
                </div>
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 w-full bg-white text-[#284E4C] hover:bg-gray-100 transition-colors font-sans"
                  type="submit"
                >
                  <Send className="h-4 w-4 mr-2" />
                  <span className="font-sans">Subscribe</span>
                </button>
              </form>
            </div>

            {/* The Flex */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">
                The Flex
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Professional property management services for landlords, flexible corporate lets for businesses and quality accommodations for short-term and long-term guests.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/theflexliving/" className="text-white hover:text-gray-300 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/theflex.global/?locale=us&hl=en" className="text-white hover:text-gray-300 transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/theflexliving" className="text-white hover:text-gray-300 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a className="text-gray-300 hover:text-white transition-colors text-sm" href="/blog">
                    Blog
                  </a>
                </li>
                <li>
                  <a className="text-gray-300 hover:text-white transition-colors text-sm" href="/careers">
                    Careers
                  </a>
                </li>
                <li>
                  <a className="text-gray-300 hover:text-white transition-colors text-sm" href="/terms">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a className="text-gray-300 hover:text-white transition-colors text-sm" href="/privacy">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Locations */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">
                Locations
              </h3>
              <ul className="space-y-2">
                <li>
                  <div className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer">
                    London
                  </div>
                </li>
                <li>
                  <div className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer">
                    Paris
                  </div>
                </li>
                <li>
                  <div className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer">
                    Algiers
                  </div>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">
                Contact Us
              </h3>
              <ul className="space-y-4">
                <li>
                  <div className="flex items-center mb-2">
                    <Headphones className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm">
                      Support Numbers
                    </span>
                  </div>
                  <ul className="space-y-2">
                    <li>
                      <a href="tel:+447723745646" className="flex items-start group text-gray-300 hover:text-white transition-colors">
                        <span className="mr-2 text-base">🇬🇧</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-400">
                            United Kingdom
                          </span>
                          <span className="text-sm group-hover:text-gray-100">+44 77 2374 5646</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="tel:+33757592241" className="flex items-start group text-gray-300 hover:text-white transition-colors">
                        <span className="mr-2 text-base">🇩🇿</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-400">
                            Algeria
                          </span>
                          <span className="text-sm group-hover:text-gray-100">+33 7 57 59 22 41</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="tel:+33644645717" className="flex items-start group text-gray-300 hover:text-white transition-colors">
                        <span className="mr-2 text-base">🇫🇷</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-400">
                            France
                          </span>
                          <span className="text-sm group-hover:text-gray-100">+33 6 44 64 57 17</span>
                        </div>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                  <a href="mailto:info@theflex.global" className="text-gray-300 hover:text-white transition-colors text-sm">
                    info@theflex.global
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-300">
            <p className="text-sm">
              © 2025 The Flex. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <button className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition z-50">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>
    </div>
  )
}