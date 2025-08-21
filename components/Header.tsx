"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  ChevronDown, Globe, Building2, Info, BookOpen, Mail, Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed left-0 right-0 w-full z-50 top-0 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#284E4C] shadow-sm' 
          : 'bg-[#FFFDF6] md:bg-transparent'
      }`}
      style={{ top: '0px' }}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-[88px]">
          <Link className="flex items-center" href="/">
            <div className="flex items-center">
              <img 
                alt="The Flex" 
                fetchPriority="high" 
                width="120" 
                height="40" 
                className="object-contain"
                src={isScrolled 
                  ? "https://lsmvmmgkpbyqhthzdexc.supabase.co/storage/v1/object/public/website/Uploads/White_V3%20Symbol%20%26%20Wordmark.png"
                  : "https://lsmvmmgkpbyqhthzdexc.supabase.co/storage/v1/object/public/website/Uploads/Green_V3%20Symbol%20%26%20Wordmark%20(1).png"
                }
                style={{ color: 'transparent' }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${
                isScrolled 
                  ? 'text-white text-base leading-6 font-medium' 
                  : 'text-[#333333] text-sm leading-5 font-medium'
              }`}
              style={{
                fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                fontWeight: 500
              }}
              type="button"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Landlords
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>

            <Link href="/about-us">
              <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${
                isScrolled 
                  ? 'text-white text-base leading-6 font-medium' 
                  : 'text-[#333333] text-sm leading-5 font-medium'
              }`}
              style={{
                fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                fontWeight: 500
              }}>
                <Info className="h-4 w-4 mr-2" />
                About Us
              </button>
            </Link>

            <Link href="/careers">
              <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${
                isScrolled 
                  ? 'text-white text-base leading-6 font-medium' 
                  : 'text-[#333333] text-sm leading-5 font-medium'
              }`}
              style={{
                fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                fontWeight: 500
              }}>
                <BookOpen className="h-4 w-4 mr-2" />
                Careers
              </button>
            </Link>

            <Link href="/contact">
              <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${
                isScrolled 
                  ? 'text-white text-base leading-6 font-medium' 
                  : 'text-[#333333] text-sm leading-5 font-medium'
              }`}
              style={{
                fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                fontWeight: 500
              }}>
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </button>
            </Link>

            <button 
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${
                isScrolled 
                  ? 'text-white text-base leading-6 font-medium' 
                  : 'text-[#333333] text-sm leading-5 font-medium'
              }`}
              style={{
                fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                fontWeight: 500
              }}
              type="button"
            >
              <span className="flex items-center">
                <span className="pr-4">🇬🇧</span>
                English
              </span>
            </button>

            <button 
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${
                isScrolled 
                  ? 'text-white text-base leading-6 font-medium' 
                  : 'text-[#333333] text-sm leading-5 font-medium'
              }`}
              style={{
                fontFamily: '__Inter_19640c, __Inter_Fallback_19640c',
                fontWeight: 500
              }}
              type="button"
            >
              <span className="text-lg filter drop-shadow-sm">£</span>
              <span className="text-xs font-medium ml-1 filter drop-shadow-sm">GBP</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-1">
            <button 
              className={`inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-xs h-10 px-3 rounded-full border-2 border-transparent hover:border-white/20 transition-all duration-200 active:scale-95 ${
                isScrolled 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-[#333333] hover:bg-gray-100'
              }`}
              type="button"
            >
              <span className="text-lg filter drop-shadow-sm">🇬🇧</span>
              <span className="text-xs font-medium ml-1 filter drop-shadow-sm">GB</span>
            </button>

            <button 
              className={`inline-flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-xs h-10 px-3 rounded-full border-2 border-transparent hover:border-white/20 transition-all duration-200 active:scale-95 font-bold ${
                isScrolled 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-[#333333] hover:bg-gray-100'
              }`}
              type="button"
            >
              <span className="text-lg filter drop-shadow-sm">£</span>
              <span className="text-xs font-medium ml-1 filter drop-shadow-sm">GBP</span>
            </button>

            <button 
              className={`inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-xs h-10 w-10 p-0 rounded-full border-2 border-transparent hover:border-white/20 transition-all duration-200 active:scale-95 ${
                isScrolled 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-[#333333] hover:bg-gray-100'
              }`}
            >
              <Menu className="h-5 w-5 filter drop-shadow-sm" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}