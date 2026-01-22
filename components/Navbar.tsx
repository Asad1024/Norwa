'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useLanguageStore } from '@/store/languageStore'
import { useTranslations } from '@/hooks/useTranslations'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const itemCount = useCartStore((state) => state.getItemCount())
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { showLoader } = useGlobalLoader()
  const t = useTranslations()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    showLoader(t.loader.loading)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear user state immediately
      setUser(null)
      
      // Redirect to home page
      router.push('/')
      router.refresh()
      
      // Wait a bit for navigation then hide loader
      setTimeout(() => {
        window.location.href = '/' // Force full page reload to clear all state
      }, 100)
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect even if there's an error
      router.push('/')
      router.refresh()
      window.location.href = '/'
    }
  }

  const isAdmin = user?.user_metadata?.role === 'admin'
  const [navLinks, setNavLinks] = useState<{ href: string; label: string }[]>([])

  useEffect(() => {
    const fetchNavLinks = async () => {
      try {
        const response = await fetch(`/api/nav-links?t=${Date.now()}`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          const linkLabels: { [key: string]: string } = {
            'products': t.navbar.products,
            'about': t.navbar.about,
            'how-to-use': t.navbar.howToUse,
            'contact': t.navbar.contact,
          }
          const enabledLinks = (data.navLinks || []).map((link: any) => ({
            href: link.href,
            label: linkLabels[link.link_key] || link.link_key,
          }))
          setNavLinks(enabledLinks)
        } else {
          // Fallback to default links if API fails
          setNavLinks([
            { href: '/products', label: t.navbar.products },
            { href: '/about', label: t.navbar.about },
            { href: '/how-to-use', label: t.navbar.howToUse },
            { href: '/contact', label: t.navbar.contact },
          ])
        }
      } catch (error) {
        console.error('Error fetching nav links:', error)
        // Fallback to default links on error
        setNavLinks([
          { href: '/products', label: t.navbar.products },
          { href: '/about', label: t.navbar.about },
          { href: '/how-to-use', label: t.navbar.howToUse },
          { href: '/contact', label: t.navbar.contact },
        ])
      }
    }

    fetchNavLinks()
    
    // Re-fetch nav links every 5 seconds to catch updates
    const interval = setInterval(fetchNavLinks, 5000)
    return () => clearInterval(interval)
  }, [language, t.navbar.products, t.navbar.about, t.navbar.howToUse, t.navbar.contact])

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.png"
              alt="NORWA Logo"
              width={120}
              height={40}
              className="object-contain h-8 w-auto transition-opacity group-hover:opacity-80"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-nature-green-600 text-white'
                    : 'text-gray-600 hover:text-nature-green-600 hover:bg-nature-green-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-0.5 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-nature-green-600 text-white'
                    : 'text-gray-600 hover:text-nature-green-600'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('no')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  language === 'no'
                    ? 'bg-nature-green-600 text-white'
                    : 'text-gray-600 hover:text-nature-green-600'
                }`}
                title="Norwegian"
              >
                NO
              </button>
            </div>
            
            {!loading && user && (
              <>
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title={t.navbar.cart}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-nature-blue-600 text-white text-xs font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Link>
                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-nature-green-400 to-nature-green-600 text-white font-semibold text-sm flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105 overflow-hidden"
                    aria-label="Profile menu"
                  >
                    {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                      <Image
                        src={user.user_metadata.avatar_url || user.user_metadata.picture}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>
                        {(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                  
                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          href="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className={`block px-3 py-2 text-sm font-medium transition-colors ${
                            pathname === '/profile'
                              ? 'bg-gray-50 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {t.navbar.profile}
                          </div>
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setProfileMenuOpen(false)}
                          className={`block px-3 py-2 text-sm font-medium transition-colors ${
                            pathname === '/orders'
                              ? 'bg-gray-50 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {t.navbar.orders}
                          </div>
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            className={`block px-3 py-2 text-sm font-medium transition-colors ${
                              pathname?.startsWith('/admin')
                                ? 'bg-gray-50 text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              {t.navbar.admin}
                            </div>
                          </Link>
                        )}
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setProfileMenuOpen(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t.navbar.signOut}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {!loading && !user && (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {t.navbar.login}
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:block bg-nature-green-600 hover:bg-nature-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  {t.navbar.signUp}
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 space-y-1 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-nature-green-600 text-white'
                    : 'text-gray-600 hover:bg-nature-green-50 hover:text-nature-green-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    {t.navbar.admin}
                  </Link>
                )}
              </>
            )}
            {!user && (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {t.navbar.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium bg-nature-green-600 hover:bg-nature-green-700 text-white text-center transition-colors"
                >
                  {t.navbar.signUp}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
