'use client'

import { FlaskConical, Droplets, Leaf, Zap, Shield, Users, Target, TrendingUp } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { useEffect, useState } from 'react'

const iconMap: { [key: string]: any } = {
  Droplets,
  Leaf,
  Zap,
  Shield,
  TrendingUp,
  Target,
}

export default function AboutPage() {
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await fetch(`/api/page-content/about?t=${Date.now()}&lang=${language}`, {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Fallback to translations if no page data
  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t.about.aboutTitle}
                </h2>
                <div className="space-y-3 text-gray-600 leading-relaxed text-sm">
                  <p>{t.about.aboutDescription1}</p>
                  <p>{t.about.aboutDescription2}</p>
                  <p>{t.about.aboutDescription3}</p>
                  <p>{t.about.aboutDescription4}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-8 h-full flex items-center justify-center border border-gray-200 shadow-sm">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg mb-4">
                    <Droplets className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.about.electrochemicallyActivated}</h3>
                  <p className="text-sm text-gray-600">{t.about.innovativeTechnology}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  const content = pageData.content
  const overviewSection = content?.sections?.find((s: any) => s.type === 'overview')
  const missionSection = content?.sections?.find((s: any) => s.type === 'mission')
  const valuesSection = content?.sections?.find((s: any) => s.type === 'values')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Company Overview */}
        {overviewSection && (
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {overviewSection.title || pageData.title}
                </h2>
                <div className="space-y-3 text-gray-600 leading-relaxed text-sm">
                  {overviewSection.descriptions?.map((desc: string, idx: number) => (
                    <p key={idx}>{desc}</p>
                  ))}
                </div>
              </div>
              {overviewSection.feature && (
                <div className="bg-white rounded-lg p-8 h-full flex items-center justify-center border border-gray-200 shadow-sm">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg mb-4">
                      {iconMap[overviewSection.feature.icon] && (
                        (() => {
                          const IconComponent = iconMap[overviewSection.feature.icon]
                          return <IconComponent className="w-10 h-10 text-gray-600" />
                        })()
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{overviewSection.feature.title}</h3>
                    <p className="text-sm text-gray-600">{overviewSection.feature.description}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Mission Section */}
        {missionSection && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                <Target className="w-6 h-6 text-gray-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {missionSection.title}
              </h2>
              {missionSection.subtitle && (
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                  {missionSection.subtitle}
                </p>
              )}
            </div>

            {missionSection.cards && missionSection.cards.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {missionSection.cards.map((card: any, idx: number) => {
                  const IconComponent = iconMap[card.icon] || TrendingUp
                  return (
                    <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                      <IconComponent className="w-8 h-8 text-gray-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {missionSection.vision && (
              <div className="bg-gradient-to-br from-nature-green-900 via-nature-green-700 to-nature-green-600 rounded-lg p-8 text-white">
                <div className="max-w-3xl mx-auto text-center">
                  <h3 className="text-xl font-semibold mb-4">{missionSection.vision.title}</h3>
                  <p className="text-sm leading-relaxed text-white/90">
                    {missionSection.vision.description}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Values Section */}
        {valuesSection && (
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {valuesSection.title}
              </h2>
              {valuesSection.subtitle && (
                <p className="text-sm text-gray-600">
                  {valuesSection.subtitle}
                </p>
              )}
            </div>

            {valuesSection.values && valuesSection.values.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {valuesSection.values.map((value: any, idx: number) => {
                  const IconComponent = iconMap[value.icon] || Leaf
                  return (
                    <div key={idx} className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                        <IconComponent className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-600">
                        {value.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
