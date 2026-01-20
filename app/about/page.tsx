'use client'

import { FlaskConical, Droplets, Leaf, Zap, Shield, Users, Target, TrendingUp } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

export default function AboutPage() {
  const t = useTranslations()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Company Overview */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.about.aboutTitle}
              </h2>
              <div className="space-y-3 text-gray-600 leading-relaxed text-sm">
                <p>
                  {t.about.aboutDescription1}
                </p>
                <p>
                  {t.about.aboutDescription2}
                </p>
                <p>
                  {t.about.aboutDescription3}
                </p>
                <p>
                  {t.about.aboutDescription4}
                </p>
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

        {/* Mission Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
              <Target className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {t.about.ourMission}
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              {t.about.missionSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <TrendingUp className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.about.growthInnovation}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.about.growthDescription}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <Leaf className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.about.norwaCleaningRange}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.about.norwaDescription}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-nature-green-900 via-nature-green-700 to-nature-green-600 rounded-lg p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-xl font-semibold mb-4">{t.about.ourVision}</h3>
              <p className="text-sm leading-relaxed text-white/90">
                {t.about.visionDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {t.about.ourCoreValues}
            </h2>
            <p className="text-sm text-gray-600">
              {t.about.valuesSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                <Leaf className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.about.sustainability}</h3>
              <p className="text-sm text-gray-600">
                {t.about.sustainabilityDesc}
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                <Zap className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.about.innovation}</h3>
              <p className="text-sm text-gray-600">
                {t.about.innovationDesc}
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.about.reliability}</h3>
              <p className="text-sm text-gray-600">
                {t.about.reliabilityDesc}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
