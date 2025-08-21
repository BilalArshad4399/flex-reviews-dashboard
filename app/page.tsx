"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { 
  Shield, Building, 
  CheckCircle2, ArrowRight, Sparkles
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#F1F3EE]/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#284E4C]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#10B981]/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-6 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#284E4C]/10 to-[#10B981]/10 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#284E4C]" />
              <span className="text-sm font-medium text-[#284E4C]">Premium Property Management Platform</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#284E4C] via-[#3a6562] to-[#10B981] bg-clip-text text-transparent">
                Flex Reviews
              </span>
              <br />
              <span className="text-4xl md:text-5xl text-gray-700">Dashboard</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Centralized platform for managing and showcasing guest reviews across all 
              <span className="font-semibold text-[#284E4C]"> Flex Living </span> 
              properties with powerful analytics and insights
            </p>
            
            {/* CTA Buttons */}
            <div className="flex gap-6 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" className="bg-gradient-to-r from-[#284E4C] to-[#3a6562] hover:from-[#1e3a38] hover:to-[#2a5552] text-white shadow-xl px-8 py-6 text-lg rounded-xl">
                  <Link href="/admin">
                    <Shield className="w-5 h-5 mr-2" />
                    Admin Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" variant="outline" className="border-2 border-[#284E4C] text-[#284E4C] hover:bg-[#284E4C] hover:text-white transition-all shadow-lg px-8 py-6 text-lg rounded-xl bg-white/80 backdrop-blur">
                  <Link href="/properties">
                    <Building className="w-5 h-5 mr-2" />
                    View Properties
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" variant="outline" className="border-2 border-[#4285F4] text-[#4285F4] hover:bg-[#4285F4] hover:text-white transition-all shadow-lg px-8 py-6 text-lg rounded-xl bg-white/80 backdrop-blur">
                  <Link href="/google-reviews">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google Reviews
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-8 mt-12 flex-wrap"
            >
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm">Trusted by 50+ Properties</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm">1000+ Reviews Managed</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm">Real-time Analytics</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[#284E4C] to-[#10B981] bg-clip-text text-transparent mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to manage, analyze, and showcase your property reviews effectively
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}