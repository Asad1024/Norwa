'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { Mail, MapPin, Globe, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await fetch(`/api/page-content/contact?t=${Date.now()}&lang=${language}`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          setPageData(data.page)
        }
      } catch (error) {
        console.error('Error fetching page content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPageContent()
  }, [language])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSubmitted(true)
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' })
        setSubmitted(false)
      }, 3000)
    } catch (error: any) {
      console.error('Error sending contact form:', error)
      alert('Failed to send message. Please try again later.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const content = pageData?.content || {}
  const title = pageData?.title || t.contact.title
  const subtitle = pageData?.subtitle || t.contact.subtitle
  const companyName = content.companyName || t.contact.companyName
  const address = content.address || t.contact.address
  const email = content.email || 'post@greenex.no'
  const website = content.website || 'https://www.greenolyte.no'
  const websiteLabel = content.websiteLabel || 'www.greenolyte.no'
  const mapEmbedUrl = content.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1997.3456789!2d10.513!3d59.938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4641%3A0x0!2sIndustriveien%2031%2C%201337%20Sandvika!5e0!3m2!1sen!2sno!4v1234567890123!5m2!1sen!2sno'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
            <Mail className="w-6 h-6 text-gray-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">{title}</h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-gray-600" />
                {t.contact.visitUs}
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {companyName}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {address}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 bg-nature-green-50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Mail className="w-5 h-5 text-nature-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{t.contact.emailLabel}</p>
                        <a
                          href={`mailto:${email}`}
                          className="text-sm text-gray-900 hover:text-gray-700 font-medium transition-colors"
                        >
                          {email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-nature-green-50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Globe className="w-5 h-5 text-nature-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{t.contact.corporateWebsite}</p>
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-900 hover:text-gray-700 font-medium transition-colors"
                        >
                          {websiteLabel}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-gray-600" />
                {t.contact.findUsOnMap}
              </h2>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                  title="Greenex Norway Location"
                />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Send className="w-6 h-6 text-gray-600" />
              {t.contact.sendUsMessage}
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t.contact.thankYou}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t.contact.thankYouMessage}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide"
                    >
                      {t.contact.nameLabel} *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                      placeholder={t.contact.namePlaceholder}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide"
                    >
                      {t.contact.emailLabel} *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                      placeholder={t.contact.emailPlaceholder}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide"
                    >
                      {t.contact.subjectLabel} *
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                      placeholder={t.contact.subjectPlaceholder}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide"
                    >
                      {t.contact.messageLabel} *
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                      rows={6}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all resize-none text-sm"
                      placeholder={t.contact.messagePlaceholder}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                  >
                    {t.contact.sendMessage}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
