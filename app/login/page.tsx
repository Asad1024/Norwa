'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const t = useTranslations()
  const resetToDefault = useLanguageStore((state) => state.resetToDefault)

  useEffect(() => {
    const authError = searchParams.get('error')
    if (authError === 'auth_failed') {
      setError('Authentication failed. Please try again.')
    } else if (authError === 'account_deactivated') {
      setError(t.login.accountDeactivated)
    }
  }, [searchParams, t])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    showLoader(t.loader.loading)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if user is banned/deactivated
        if (error.message?.includes('banned') || error.message?.includes('disabled')) {
          throw new Error(t.login.accountDeactivated)
        }
        throw error
      }

      // Check if user is banned/deactivated after successful login
      if (data?.user) {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userData?.user?.banned_until || userData?.user?.user_metadata?.is_active === false) {
          await supabase.auth.signOut()
          throw new Error(t.login.accountDeactivated)
        }
      }

      // Reset language to Norwegian on login
      resetToDefault()
      
      // Get redirect path before clearing
      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin')
      const redirectPath = redirectAfterLogin || '/'
      sessionStorage.removeItem('redirectAfterLogin')
      
      // Note: PendingCartHandler component will handle adding the item to cart
      // The item is already stored in sessionStorage as 'addToCartAfterLogin'
      
      router.push(redirectPath)
      router.refresh()
    } catch (error: any) {
      hideLoader()
      setError(error.message || t.login.failed)
    }
  }

  const handleGoogleLogin = async () => {
    showLoader(t.loader.loading)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      hideLoader()
      setError(error.message || 'Failed to sign in with Google')
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    showLoader(t.loader.loading)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        if (error.message?.includes('rate limit') || error.message?.includes('invalid')) {
          setError(error.message || t.login.resetPasswordError)
        } else {
          setSuccess(t.login.resetPasswordSent)
        }
      } else {
        setSuccess(t.login.resetPasswordSent)
      }

      setTimeout(() => {
        setShowForgotPassword(false)
        setSuccess('')
      }, 3000)
    } catch (error: any) {
      setError(error.message || t.login.resetPasswordError)
    } finally {
      hideLoader()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-green-50 rounded-lg mb-4">
              <svg className="w-6 h-6 text-nature-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {t.login.title}
            </h1>
            <p className="text-sm text-gray-600">{t.login.welcome}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide"
                >
                  {t.login.email}
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
              >
                {t.login.resetPassword}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false)
                  setError('')
                  setSuccess('')
                }}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 text-sm"
              >
                {t.login.backToLogin}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide"
                >
                  {t.login.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide"
                >
                  {t.login.password}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-nature-green-600 hover:text-nature-green-700 font-medium"
                >
                  {t.login.forgotPassword}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
              >
                {t.login.login}
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 transition-colors text-sm shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t.login.noAccount}{' '}
            <Link
              href="/register"
              className="text-nature-green-600 hover:text-nature-green-700 font-medium underline"
            >
              {t.login.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-nature-green-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
