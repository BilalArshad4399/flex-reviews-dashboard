"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FlexLogo } from "@/components/flex-logo"
import Link from "next/link"
import { BarChart3, Star, Users, Shield, TrendingUp, Building } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--flex-background)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--flex-primary)]/5 to-transparent" />
        
        <div className="container mx-auto px-6 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <FlexLogo size="large" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--flex-primary)] mb-6">
              Reviews Management System
            </h1>
            
            <p className="text-xl text-[var(--flex-text)] max-w-3xl mx-auto mb-8">
              Centralized platform for managing and showcasing guest reviews across all Flex Living properties
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-[var(--flex-primary)] hover:bg-[var(--flex-green-dark)] text-white">
                <Link href="/dashboard">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-[var(--flex-primary)] text-[var(--flex-primary)]">
                <Link href="/reviews">
                  <Star className="w-5 h-5 mr-2" />
                  View Public Reviews
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-[var(--flex-primary)] text-center mb-12">
            Platform Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-[var(--border)] flex-shadow hover:flex-shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[var(--flex-cream)] rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-[var(--flex-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--flex-primary)] mb-2">
                  Review Management
                </h3>
                <p className="text-[var(--flex-text)]">
                  Import, manage, and approve guest reviews from multiple sources with ease
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-[var(--border)] flex-shadow hover:flex-shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[var(--flex-cream)] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-[var(--flex-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--flex-primary)] mb-2">
                  Analytics & Insights
                </h3>
                <p className="text-[var(--flex-text)]">
                  Track review trends, ratings, and category performance across properties
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-[var(--border)] flex-shadow hover:flex-shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[var(--flex-cream)] rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[var(--flex-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--flex-primary)] mb-2">
                  Approval Workflow
                </h3>
                <p className="text-[var(--flex-text)]">
                  Review and approve content before it goes live on public pages
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid md:grid-cols-4 gap-8 text-center"
          >
            <div>
              <Building className="w-8 h-8 text-[var(--flex-primary)] mx-auto mb-2" />
              <div className="text-3xl font-bold text-[var(--flex-primary)]">50+</div>
              <p className="text-[var(--flex-text)]">Properties</p>
            </div>
            
            <div>
              <Users className="w-8 h-8 text-[var(--flex-primary)] mx-auto mb-2" />
              <div className="text-3xl font-bold text-[var(--flex-primary)]">1000+</div>
              <p className="text-[var(--flex-text)]">Happy Guests</p>
            </div>
            
            <div>
              <Star className="w-8 h-8 text-[var(--flex-primary)] mx-auto mb-2" />
              <div className="text-3xl font-bold text-[var(--flex-primary)]">4.8</div>
              <p className="text-[var(--flex-text)]">Average Rating</p>
            </div>
            
            <div>
              <TrendingUp className="w-8 h-8 text-[var(--flex-primary)] mx-auto mb-2" />
              <div className="text-3xl font-bold text-[var(--flex-primary)]">95%</div>
              <p className="text-[var(--flex-text)]">Recommend Rate</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-b from-white to-[var(--flex-cream)] border-t border-[var(--border)] mt-16">
        <div className="container mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <FlexLogo size="large" className="mx-auto md:mx-0 mb-4" />
              <p className="text-[var(--flex-text)] leading-relaxed mb-4">
                Premium flexible living spaces across the globe. Experience comfort, convenience, and community.
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 bg-[var(--flex-primary)] rounded-full flex items-center justify-center hover:bg-[var(--flex-green-dark)] transition-colors cursor-pointer">
                  <span className="text-white text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-[var(--flex-primary)] rounded-full flex items-center justify-center hover:bg-[var(--flex-green-dark)] transition-colors cursor-pointer">
                  <span className="text-white text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-[var(--flex-primary)] rounded-full flex items-center justify-center hover:bg-[var(--flex-green-dark)] transition-colors cursor-pointer">
                  <span className="text-white text-sm font-bold">@</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-[var(--flex-primary)] mb-4">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/dashboard" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                    Reviews Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                    Public Reviews
                  </Link>
                </li>
                <li>
                  <Link href="https://theflex.global" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                    Main Website
                  </Link>
                </li>
                <li>
                  <Link href="https://theflex.global/properties" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                    Browse Properties
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-[var(--flex-primary)] mb-4">Get in Touch</h4>
              
              {/* CTA Button */}
              <div className="mt-6">
                <Link 
                  href="https://theflex.global"
                  className="inline-flex items-center gap-2 bg-[var(--flex-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--flex-green-dark)] transition-colors font-medium"
                >
                  <span>Visit Flex Living</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--flex-text)] text-sm">
              © 2024 Flex Living. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="https://theflex.global/privacy" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="https://theflex.global/terms" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                Terms of Service
              </Link>
              <Link href="https://theflex.global/cookies" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}