import { NextResponse } from "next/server"

// Sample Google Reviews data - Replace with actual Google Places API integration
const sampleGoogleReviews = [
  {
    id: "gr_1",
    author_name: "Sarah Johnson",
    author_url: "https://www.google.com/maps/contrib/1",
    rating: 5,
    relative_time_description: "2 weeks ago",
    text: "Amazing stay at Flex Living! The apartment was spotless, modern, and had everything we needed. The location was perfect for exploring the city. Will definitely book again!",
    time: Date.now() - 14 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - Central London",
    property_address: "123 Oxford Street, London"
  },
  {
    id: "gr_2",
    author_name: "Michael Chen",
    author_url: "https://www.google.com/maps/contrib/2",
    rating: 4,
    relative_time_description: "1 month ago",
    text: "Great experience overall. The check-in process was smooth and the apartment was well-equipped. Only minor issue was some noise from the street, but that's expected in central London.",
    time: Date.now() - 30 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - Canary Wharf",
    property_address: "45 Canada Square, London"
  },
  {
    id: "gr_3",
    author_name: "Emma Wilson",
    author_url: "https://www.google.com/maps/contrib/3",
    rating: 5,
    relative_time_description: "3 weeks ago",
    text: "Flex Living exceeded my expectations! The apartment was beautiful, the amenities were top-notch, and the customer service was excellent. Perfect for business travelers.",
    time: Date.now() - 21 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - King's Cross",
    property_address: "78 Euston Road, London"
  },
  {
    id: "gr_4",
    author_name: "James Taylor",
    author_url: "https://www.google.com/maps/contrib/4",
    rating: 5,
    relative_time_description: "1 week ago",
    text: "Absolutely loved my stay! The apartment was stylish, comfortable, and in a great location. The flexible booking options made it perfect for my changing schedule.",
    time: Date.now() - 7 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - Shoreditch",
    property_address: "92 Brick Lane, London"
  },
  {
    id: "gr_5",
    author_name: "Sophie Martin",
    author_url: "https://www.google.com/maps/contrib/5",
    rating: 4,
    relative_time_description: "2 months ago",
    text: "Very nice apartment with modern furnishings. The only reason for 4 stars instead of 5 is that the WiFi could have been faster. Otherwise, everything was perfect!",
    time: Date.now() - 60 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - Central London",
    property_address: "123 Oxford Street, London"
  },
  {
    id: "gr_6",
    author_name: "David Brown",
    author_url: "https://www.google.com/maps/contrib/6",
    rating: 5,
    relative_time_description: "5 days ago",
    text: "Outstanding service and accommodation! The team was incredibly helpful, and the apartment was exactly as advertised. Highly recommend Flex Living for anyone visiting London.",
    time: Date.now() - 5 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - Canary Wharf",
    property_address: "45 Canada Square, London"
  },
  {
    id: "gr_7",
    author_name: "Lisa Anderson",
    author_url: "https://www.google.com/maps/contrib/7",
    rating: 5,
    relative_time_description: "3 days ago",
    text: "Best serviced apartment experience I've had! Everything from booking to check-out was seamless. The apartment was luxurious and the location couldn't be better.",
    time: Date.now() - 3 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - King's Cross",
    property_address: "78 Euston Road, London"
  },
  {
    id: "gr_8",
    author_name: "Robert Garcia",
    author_url: "https://www.google.com/maps/contrib/8",
    rating: 4,
    relative_time_description: "6 weeks ago",
    text: "Good value for money. The apartment was clean and well-maintained. Location is excellent with easy access to public transport. Would stay again.",
    time: Date.now() - 42 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - Shoreditch",
    property_address: "92 Brick Lane, London"
  },
  {
    id: "gr_9",
    author_name: "Maria Rodriguez",
    author_url: "https://www.google.com/maps/contrib/9",
    rating: 5,
    relative_time_description: "1 day ago",
    text: "Just checked out after a month-long stay and I'm already planning my next visit! The flexibility, comfort, and service were all exceptional. Thank you Flex Living!",
    time: Date.now() - 1 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - Central London",
    property_address: "123 Oxford Street, London"
  },
  {
    id: "gr_10",
    author_name: "Thomas White",
    author_url: "https://www.google.com/maps/contrib/10",
    rating: 5,
    relative_time_description: "4 weeks ago",
    text: "Perfect for extended stays! The apartment felt like a real home away from home. Great amenities, responsive staff, and excellent location. Highly recommended!",
    time: Date.now() - 28 * 24 * 60 * 60 * 1000,
    profile_photo_url: null,
    property_name: "Flex Living - Canary Wharf",
    property_address: "45 Canada Square, London"
  }
]

export async function GET(request: Request) {
  try {
    // In a real implementation, you would:
    // 1. Call Google Places API with your API key
    // 2. Fetch reviews for each Flex Living property
    // 3. Combine and normalize the data
    
    // For now, return sample data
    return NextResponse.json({
      success: true,
      data: sampleGoogleReviews,
      count: sampleGoogleReviews.length,
      source: "google",
      // Include metadata about the API call
      metadata: {
        fetched_at: new Date().toISOString(),
        properties_count: 4,
        average_rating: 4.7
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Google reviews",
        data: []
      },
      { status: 500 }
    )
  }
}

// Optional: POST endpoint to refresh Google reviews from API
export async function POST(request: Request) {
  try {
    // This would trigger a fresh fetch from Google Places API
    // and potentially store the results in your database
    
    return NextResponse.json({
      success: true,
      message: "Google reviews refresh initiated",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh Google reviews"
      },
      { status: 500 }
    )
  }
}