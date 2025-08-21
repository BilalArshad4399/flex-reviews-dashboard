import { NextResponse } from "next/server"

// Sample property data - In production, this would come from your database
const PROPERTIES = {
  "175160": {
    id: "175160",
    name: "Luxury Studio in Central London",
    location: "Central London",
    address: "123 Oxford Street, London W1D 2LN",
    price: "£150",
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    size: "45 sqm",
    minimumStay: 2,
    description: "Experience the heart of London in this beautifully appointed studio apartment. Located on the iconic Oxford Street, you'll be steps away from world-class shopping, dining, and entertainment. The space features modern furnishings, a fully equipped kitchen, and all the amenities you need for a comfortable stay. Perfect for business travelers or couples looking to explore the city.",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
      "https://images.unsplash.com/photo-1489171078254-c3365d6e359f?w=1200",
      "https://images.unsplash.com/photo-1505691723518-36a5ac3965ae?w=1200",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200"
    ],
    amenities: [
      "WiFi",
      "Fully Equipped Kitchen",
      "Washing Machine",
      "TV",
      "Air Conditioning",
      "24/7 Support",
      "Self Check-in",
      "Workspace",
      "Coffee Machine",
      "Premium Linens"
    ]
  },
  "128652": {
    id: "128652",
    name: "2B N1 A - 29 Shoreditch Heights",
    location: "Shoreditch",
    address: "29 Shoreditch Heights, London E1 6QE",
    price: "£250",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    size: "75 sqm",
    minimumStay: 3,
    description: "Stunning two-bedroom apartment in the heart of London's financial district. This modern space offers spectacular views of the Thames and city skyline. With high-end finishes throughout, including a marble bathroom and designer kitchen, this apartment provides the perfect blend of luxury and comfort. Ideal for families or professionals working in Canary Wharf.",
    images: [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1200",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200",
      "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200",
      "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1200",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1200"
    ],
    amenities: [
      "WiFi",
      "Gym Access",
      "Parking",
      "Concierge Service",
      "Balcony with View",
      "Smart TV",
      "Dishwasher",
      "In-unit Laundry",
      "Floor Heating",
      "Security System"
    ]
  },
  "316890": {
    id: "316890",
    name: "Modern Penthouse in Nine Elms",
    location: "Nine Elms",
    address: "45 Embassy Gardens, London SW11 7BW",
    price: "£350",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    size: "120 sqm",
    minimumStay: 5,
    description: "Spectacular three-bedroom penthouse apartment in the prestigious Embassy Gardens development. This exceptional property offers panoramic views across London, including the iconic Battersea Power Station. The apartment features floor-to-ceiling windows, three spacious bedrooms, and access to exclusive resident facilities including the famous Sky Pool. Perfect for families or groups seeking luxury accommodation in one of London's most exciting new neighborhoods.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      "https://images.unsplash.com/photo-1600566753086-00878f1b12d5?w=1200",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200"
    ],
    amenities: [
      "WiFi",
      "Sky Pool Access",
      "Private Terrace",
      "Gym & Spa",
      "Underground Parking",
      "Smart Home System",
      "Wine Cooler",
      "Walk-in Wardrobe",
      "Designer Furniture",
      "24/7 Concierge"
    ]
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    
    // Get property data
    const property = PROPERTIES[propertyId as keyof typeof PROPERTIES]
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      )
    }

    // Return property data without reviews (reviews are fetched separately)
    const propertyData = {
      ...property,
      reviews: [], // Reviews are fetched from /api/reviews/hostaway
      averageRating: 0, // Will be calculated on the frontend
      totalReviews: 0 // Will be calculated on the frontend
    }

    return NextResponse.json({
      success: true,
      data: propertyData
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch property details" 
      },
      { status: 500 }
    )
  }
}