'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useGlobalLoader } from '@/components/GlobalLoader'
import BackButton from '@/components/BackButton'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { Save, CheckCircle, XCircle, Plus, Trash2, Languages } from 'lucide-react'

export default function AdminEditPagePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'no'>('en')
  const [navLinkEnabled, setNavLinkEnabled] = useState<boolean>(true)
  const [navLinkId, setNavLinkId] = useState<string | null>(null)
  const [updatingNavLink, setUpdatingNavLink] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({
    show: false,
    message: '',
    type: 'success',
  })
  const t = useTranslations()

  const pageKey = params?.pageKey as string

  useEffect(() => {
    const fetchData = async () => {
      showLoader(t.loader.loading)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          hideLoader()
          router.push('/login')
          return
        }

        const isAdmin = user.user_metadata?.role === 'admin'
        if (!isAdmin) {
          hideLoader()
          router.push('/')
          return
        }

        setUser(user)
        await fetchPage()
        
        // Fetch nav link status for this page
        const navLinkKey = pageKey // pageKey matches link_key in nav_links_settings
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            const navResponse = await fetch('/api/admin/nav-links', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            })
            if (navResponse.ok) {
              const navData = await navResponse.json()
              const navLink = navData.navLinks?.find((link: any) => link.link_key === navLinkKey)
              if (navLink) {
                setNavLinkId(navLink.id)
                setNavLinkEnabled(navLink.is_enabled ?? true)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching nav link status:', error)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
        hideLoader()
      }
    }

    fetchData()
  }, [supabase, router, showLoader, hideLoader, pageKey])

  const fetchPage = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/admin/page-content', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const foundPage = (data.pages || []).find((p: any) => p.page_key === pageKey)
        if (foundPage) {
          setPage(foundPage)
          initializeFormData(foundPage)
        }
      }
    } catch (error) {
      console.error('Error fetching page:', error)
    }
  }

  const initializeFormData = (pageData: any) => {
    // Get translations for title and subtitle
    const titleTranslations = pageData.title_translations || { en: pageData.title || '', no: pageData.title || '' }
    const subtitleTranslations = pageData.subtitle_translations || { en: pageData.subtitle || '', no: pageData.subtitle || '' }
    
    // Get content - check if it has language structure or is old format
    let content = pageData.content || {}
    if (content.en || content.no) {
      // New format with translations
      content = content[activeLanguage] || content.en || {}
    }
    // If old format, use as-is (will be migrated)
    
    if (pageKey === 'about') {
      const overview = content.sections?.find((s: any) => s.type === 'overview') || {}
      const mission = content.sections?.find((s: any) => s.type === 'mission') || {}
      const values = content.sections?.find((s: any) => s.type === 'values') || {}
      
      // Get Norwegian content if available
      const contentNo = pageData.content?.no || {}
      const overviewNo = contentNo.sections?.find((s: any) => s.type === 'overview') || {}
      const missionNo = contentNo.sections?.find((s: any) => s.type === 'mission') || {}
      const valuesNo = contentNo.sections?.find((s: any) => s.type === 'values') || {}
      
      setFormData({
        title_en: titleTranslations.en || '',
        title_no: titleTranslations.no || '',
        subtitle_en: subtitleTranslations.en || '',
        subtitle_no: subtitleTranslations.no || '',
        // Overview section - English
        overviewTitle_en: overview.title || '',
        overviewDescriptions_en: overview.descriptions || ['', '', '', ''],
        featureIcon: overview.feature?.icon || 'Droplets',
        featureTitle_en: overview.feature?.title || '',
        featureDescription_en: overview.feature?.description || '',
        // Overview section - Norwegian
        overviewTitle_no: overviewNo.title || overview.title || '',
        overviewDescriptions_no: overviewNo.descriptions || overview.descriptions || ['', '', '', ''],
        featureTitle_no: overviewNo.feature?.title || overview.feature?.title || '',
        featureDescription_no: overviewNo.feature?.description || overview.feature?.description || '',
        // Mission section - English
        missionTitle_en: mission.title || '',
        missionSubtitle_en: mission.subtitle || '',
        missionCard1Icon: mission.cards?.[0]?.icon || 'TrendingUp',
        missionCard1Title_en: mission.cards?.[0]?.title || '',
        missionCard1Description_en: mission.cards?.[0]?.description || '',
        missionCard2Icon: mission.cards?.[1]?.icon || 'Leaf',
        missionCard2Title_en: mission.cards?.[1]?.title || '',
        missionCard2Description_en: mission.cards?.[1]?.description || '',
        visionTitle_en: mission.vision?.title || '',
        visionDescription_en: mission.vision?.description || '',
        // Mission section - Norwegian
        missionTitle_no: missionNo.title || mission.title || '',
        missionSubtitle_no: missionNo.subtitle || mission.subtitle || '',
        missionCard1Title_no: missionNo.cards?.[0]?.title || mission.cards?.[0]?.title || '',
        missionCard1Description_no: missionNo.cards?.[0]?.description || mission.cards?.[0]?.description || '',
        missionCard2Title_no: missionNo.cards?.[1]?.title || mission.cards?.[1]?.title || '',
        missionCard2Description_no: missionNo.cards?.[1]?.description || mission.cards?.[1]?.description || '',
        visionTitle_no: missionNo.vision?.title || mission.vision?.title || '',
        visionDescription_no: missionNo.vision?.description || mission.vision?.description || '',
        // Values section - English
        valuesTitle_en: values.title || '',
        valuesSubtitle_en: values.subtitle || '',
        value1Icon: values.values?.[0]?.icon || 'Leaf',
        value1Title_en: values.values?.[0]?.title || '',
        value1Description_en: values.values?.[0]?.description || '',
        value2Icon: values.values?.[1]?.icon || 'Zap',
        value2Title_en: values.values?.[1]?.title || '',
        value2Description_en: values.values?.[1]?.description || '',
        value3Icon: values.values?.[2]?.icon || 'Shield',
        value3Title_en: values.values?.[2]?.title || '',
        value3Description_en: values.values?.[2]?.description || '',
        // Values section - Norwegian
        valuesTitle_no: valuesNo.title || values.title || '',
        valuesSubtitle_no: valuesNo.subtitle || values.subtitle || '',
        value1Title_no: valuesNo.values?.[0]?.title || values.values?.[0]?.title || '',
        value1Description_no: valuesNo.values?.[0]?.description || values.values?.[0]?.description || '',
        value2Title_no: valuesNo.values?.[1]?.title || values.values?.[1]?.title || '',
        value2Description_no: valuesNo.values?.[1]?.description || values.values?.[1]?.description || '',
        value3Title_no: valuesNo.values?.[2]?.title || values.values?.[2]?.title || '',
        value3Description_no: valuesNo.values?.[2]?.description || values.values?.[2]?.description || '',
      })
    } else if (pageKey === 'contact') {
      const contentNo = pageData.content?.no || {}
      setFormData({
        title_en: titleTranslations.en || '',
        title_no: titleTranslations.no || '',
        subtitle_en: subtitleTranslations.en || '',
        subtitle_no: subtitleTranslations.no || '',
        companyName_en: content.companyName || '',
        address_en: content.address || '',
        email: content.email || '',
        website: content.website || '',
        websiteLabel_en: content.websiteLabel || '',
        mapEmbedUrl: content.mapEmbedUrl || '',
        // Norwegian
        companyName_no: contentNo.companyName || content.companyName || '',
        address_no: contentNo.address || content.address || '',
        websiteLabel_no: contentNo.websiteLabel || content.websiteLabel || '',
      })
    } else if (pageKey === 'how-to-use') {
      const sections = content.sections || []
      const contentNo = pageData.content?.no || {}
      const sectionsNo = contentNo.sections || []
      setFormData({
        title_en: titleTranslations.en || '',
        title_no: titleTranslations.no || '',
        subtitle_en: subtitleTranslations.en || '',
        subtitle_no: subtitleTranslations.no || '',
        // Section 1 - English
        section1Title_en: sections[0]?.title || '',
        section1Description_en: sections[0]?.description || '',
        section1Video1Title_en: sections[0]?.videos?.[0]?.title || '',
        section1Video1Description_en: sections[0]?.videos?.[0]?.description || '',
        section1Video1Url: sections[0]?.videos?.[0]?.url || '',
        section1Video2Title_en: sections[0]?.videos?.[1]?.title || '',
        section1Video2Description_en: sections[0]?.videos?.[1]?.description || '',
        section1Video2Url: sections[0]?.videos?.[1]?.url || '',
        // Section 1 - Norwegian
        section1Title_no: sectionsNo[0]?.title || sections[0]?.title || '',
        section1Description_no: sectionsNo[0]?.description || sections[0]?.description || '',
        section1Video1Title_no: sectionsNo[0]?.videos?.[0]?.title || sections[0]?.videos?.[0]?.title || '',
        section1Video1Description_no: sectionsNo[0]?.videos?.[0]?.description || sections[0]?.videos?.[0]?.description || '',
        section1Video2Title_no: sectionsNo[0]?.videos?.[1]?.title || sections[0]?.videos?.[1]?.title || '',
        section1Video2Description_no: sectionsNo[0]?.videos?.[1]?.description || sections[0]?.videos?.[1]?.description || '',
        // Section 2 - English
        section2Title_en: sections[1]?.title || '',
        section2Description_en: sections[1]?.description || '',
        section2Video1Title_en: sections[1]?.videos?.[0]?.title || '',
        section2Video1Description_en: sections[1]?.videos?.[0]?.description || '',
        section2Video1Url: sections[1]?.videos?.[0]?.url || '',
        section2Video2Title_en: sections[1]?.videos?.[1]?.title || '',
        section2Video2Description_en: sections[1]?.videos?.[1]?.description || '',
        section2Video2Url: sections[1]?.videos?.[1]?.url || '',
        // Section 2 - Norwegian
        section2Title_no: sectionsNo[1]?.title || sections[1]?.title || '',
        section2Description_no: sectionsNo[1]?.description || sections[1]?.description || '',
        section2Video1Title_no: sectionsNo[1]?.videos?.[0]?.title || sections[1]?.videos?.[0]?.title || '',
        section2Video1Description_no: sectionsNo[1]?.videos?.[0]?.description || sections[1]?.videos?.[0]?.description || '',
        section2Video2Title_no: sectionsNo[1]?.videos?.[1]?.title || sections[1]?.videos?.[1]?.title || '',
        section2Video2Description_no: sectionsNo[1]?.videos?.[1]?.description || sections[1]?.videos?.[1]?.description || '',
      })
    }
  }

  const buildContentFromFormData = () => {
    if (pageKey === 'about') {
      return {
        en: {
          sections: [
            {
              type: 'overview',
              title: formData.overviewTitle_en || '',
              descriptions: (formData.overviewDescriptions_en || []).filter((d: string) => d.trim()),
              feature: {
                icon: formData.featureIcon || 'Droplets',
                title: formData.featureTitle_en || '',
                description: formData.featureDescription_en || '',
              },
            },
            {
              type: 'mission',
              title: formData.missionTitle_en || '',
              subtitle: formData.missionSubtitle_en || '',
              cards: [
                {
                  icon: formData.missionCard1Icon || 'TrendingUp',
                  title: formData.missionCard1Title_en || '',
                  description: formData.missionCard1Description_en || '',
                },
                {
                  icon: formData.missionCard2Icon || 'Leaf',
                  title: formData.missionCard2Title_en || '',
                  description: formData.missionCard2Description_en || '',
                },
              ],
              vision: {
                title: formData.visionTitle_en || '',
                description: formData.visionDescription_en || '',
              },
            },
            {
              type: 'values',
              title: formData.valuesTitle_en || '',
              subtitle: formData.valuesSubtitle_en || '',
              values: [
                {
                  icon: formData.value1Icon || 'Leaf',
                  title: formData.value1Title_en || '',
                  description: formData.value1Description_en || '',
                },
                {
                  icon: formData.value2Icon || 'Zap',
                  title: formData.value2Title_en || '',
                  description: formData.value2Description_en || '',
                },
                {
                  icon: formData.value3Icon || 'Shield',
                  title: formData.value3Title_en || '',
                  description: formData.value3Description_en || '',
                },
              ],
            },
          ],
        },
        no: {
          sections: [
            {
              type: 'overview',
              title: formData.overviewTitle_no || formData.overviewTitle_en || '',
              descriptions: (formData.overviewDescriptions_no || formData.overviewDescriptions_en || []).filter((d: string) => d.trim()),
              feature: {
                icon: formData.featureIcon || 'Droplets',
                title: formData.featureTitle_no || formData.featureTitle_en || '',
                description: formData.featureDescription_no || formData.featureDescription_en || '',
              },
            },
            {
              type: 'mission',
              title: formData.missionTitle_no || formData.missionTitle_en || '',
              subtitle: formData.missionSubtitle_no || formData.missionSubtitle_en || '',
              cards: [
                {
                  icon: formData.missionCard1Icon || 'TrendingUp',
                  title: formData.missionCard1Title_no || formData.missionCard1Title_en || '',
                  description: formData.missionCard1Description_no || formData.missionCard1Description_en || '',
                },
                {
                  icon: formData.missionCard2Icon || 'Leaf',
                  title: formData.missionCard2Title_no || formData.missionCard2Title_en || '',
                  description: formData.missionCard2Description_no || formData.missionCard2Description_en || '',
                },
              ],
              vision: {
                title: formData.visionTitle_no || formData.visionTitle_en || '',
                description: formData.visionDescription_no || formData.visionDescription_en || '',
              },
            },
            {
              type: 'values',
              title: formData.valuesTitle_no || formData.valuesTitle_en || '',
              subtitle: formData.valuesSubtitle_no || formData.valuesSubtitle_en || '',
              values: [
                {
                  icon: formData.value1Icon || 'Leaf',
                  title: formData.value1Title_no || formData.value1Title_en || '',
                  description: formData.value1Description_no || formData.value1Description_en || '',
                },
                {
                  icon: formData.value2Icon || 'Zap',
                  title: formData.value2Title_no || formData.value2Title_en || '',
                  description: formData.value2Description_no || formData.value2Description_en || '',
                },
                {
                  icon: formData.value3Icon || 'Shield',
                  title: formData.value3Title_no || formData.value3Title_en || '',
                  description: formData.value3Description_no || formData.value3Description_en || '',
                },
              ],
            },
          ],
        },
      }
    } else if (pageKey === 'contact') {
      return {
        en: {
          companyName: formData.companyName_en || '',
          address: formData.address_en || '',
          email: formData.email || '',
          website: formData.website || '',
          websiteLabel: formData.websiteLabel_en || '',
          mapEmbedUrl: formData.mapEmbedUrl || '',
        },
        no: {
          companyName: formData.companyName_no || formData.companyName_en || '',
          address: formData.address_no || formData.address_en || '',
          email: formData.email || '',
          website: formData.website || '',
          websiteLabel: formData.websiteLabel_no || formData.websiteLabel_en || '',
          mapEmbedUrl: formData.mapEmbedUrl || '',
        },
      }
    } else if (pageKey === 'how-to-use') {
      return {
        en: {
          sections: [
            {
              title: formData.section1Title_en || '',
              description: formData.section1Description_en || '',
              videos: [
                {
                  title: formData.section1Video1Title_en || '',
                  description: formData.section1Video1Description_en || '',
                  url: formData.section1Video1Url || '',
                },
                {
                  title: formData.section1Video2Title_en || '',
                  description: formData.section1Video2Description_en || '',
                  url: formData.section1Video2Url || '',
                },
              ],
            },
            {
              title: formData.section2Title_en || '',
              description: formData.section2Description_en || '',
              videos: [
                {
                  title: formData.section2Video1Title_en || '',
                  description: formData.section2Video1Description_en || '',
                  url: formData.section2Video1Url || '',
                },
                {
                  title: formData.section2Video2Title_en || '',
                  description: formData.section2Video2Description_en || '',
                  url: formData.section2Video2Url || '',
                },
              ],
            },
          ],
        },
        no: {
          sections: [
            {
              title: formData.section1Title_no || formData.section1Title_en || '',
              description: formData.section1Description_no || formData.section1Description_en || '',
              videos: [
                {
                  title: formData.section1Video1Title_no || formData.section1Video1Title_en || '',
                  description: formData.section1Video1Description_no || formData.section1Video1Description_en || '',
                  url: formData.section1Video1Url || '',
                },
                {
                  title: formData.section1Video2Title_no || formData.section1Video2Title_en || '',
                  description: formData.section1Video2Description_no || formData.section1Video2Description_en || '',
                  url: formData.section1Video2Url || '',
                },
              ],
            },
            {
              title: formData.section2Title_no || formData.section2Title_en || '',
              description: formData.section2Description_no || formData.section2Description_en || '',
              videos: [
                {
                  title: formData.section2Video1Title_no || formData.section2Video1Title_en || '',
                  description: formData.section2Video1Description_no || formData.section2Video1Description_en || '',
                  url: formData.section2Video1Url || '',
                },
                {
                  title: formData.section2Video2Title_no || formData.section2Video2Title_en || '',
                  description: formData.section2Video2Description_no || formData.section2Video2Description_en || '',
                  url: formData.section2Video2Url || '',
                },
              ],
            },
          ],
        },
      }
    }
    return { en: {}, no: {} }
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const translateText = async (text: string): Promise<string> => {
    if (!text || !text.trim()) return ''
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          from: 'en',
          to: 'no',
        }),
      })
      const data = await response.json()
      return data.translated || text
    } catch (error) {
      console.error('Translation error:', error)
      return text
    }
  }

  const handleTranslateToNO = async () => {
    if (activeLanguage !== 'no') {
      setActiveLanguage('no')
      // Wait a bit for the tab to switch
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setTranslating(true)
    try {
      // Translate all English fields to Norwegian
      const updates: any = {}

      // Title and subtitle
      if (formData.title_en) {
        updates.title_no = await translateText(formData.title_en)
      }
      if (formData.subtitle_en) {
        updates.subtitle_no = await translateText(formData.subtitle_en)
      }

      if (pageKey === 'about') {
        // Overview section
        if (formData.overviewTitle_en) {
          updates.overviewTitle_no = await translateText(formData.overviewTitle_en)
        }
        if (formData.overviewDescriptions_en) {
          updates.overviewDescriptions_no = await Promise.all(
            formData.overviewDescriptions_en.map((desc: string) => translateText(desc))
          )
        }
        if (formData.featureTitle_en) {
          updates.featureTitle_no = await translateText(formData.featureTitle_en)
        }
        if (formData.featureDescription_en) {
          updates.featureDescription_no = await translateText(formData.featureDescription_en)
        }
        // Mission section
        if (formData.missionTitle_en) {
          updates.missionTitle_no = await translateText(formData.missionTitle_en)
        }
        if (formData.missionSubtitle_en) {
          updates.missionSubtitle_no = await translateText(formData.missionSubtitle_en)
        }
        if (formData.missionCard1Title_en) {
          updates.missionCard1Title_no = await translateText(formData.missionCard1Title_en)
        }
        if (formData.missionCard1Description_en) {
          updates.missionCard1Description_no = await translateText(formData.missionCard1Description_en)
        }
        if (formData.missionCard2Title_en) {
          updates.missionCard2Title_no = await translateText(formData.missionCard2Title_en)
        }
        if (formData.missionCard2Description_en) {
          updates.missionCard2Description_no = await translateText(formData.missionCard2Description_en)
        }
        if (formData.visionTitle_en) {
          updates.visionTitle_no = await translateText(formData.visionTitle_en)
        }
        if (formData.visionDescription_en) {
          updates.visionDescription_no = await translateText(formData.visionDescription_en)
        }
        // Values section
        if (formData.valuesTitle_en) {
          updates.valuesTitle_no = await translateText(formData.valuesTitle_en)
        }
        if (formData.valuesSubtitle_en) {
          updates.valuesSubtitle_no = await translateText(formData.valuesSubtitle_en)
        }
        if (formData.value1Title_en) {
          updates.value1Title_no = await translateText(formData.value1Title_en)
        }
        if (formData.value1Description_en) {
          updates.value1Description_no = await translateText(formData.value1Description_en)
        }
        if (formData.value2Title_en) {
          updates.value2Title_no = await translateText(formData.value2Title_en)
        }
        if (formData.value2Description_en) {
          updates.value2Description_no = await translateText(formData.value2Description_en)
        }
        if (formData.value3Title_en) {
          updates.value3Title_no = await translateText(formData.value3Title_en)
        }
        if (formData.value3Description_en) {
          updates.value3Description_no = await translateText(formData.value3Description_en)
        }
      } else if (pageKey === 'contact') {
        if (formData.companyName_en) {
          updates.companyName_no = await translateText(formData.companyName_en)
        }
        if (formData.address_en) {
          updates.address_no = await translateText(formData.address_en)
        }
        if (formData.websiteLabel_en) {
          updates.websiteLabel_no = await translateText(formData.websiteLabel_en)
        }
      } else if (pageKey === 'how-to-use') {
        // Section 1
        if (formData.section1Title_en) {
          updates.section1Title_no = await translateText(formData.section1Title_en)
        }
        if (formData.section1Description_en) {
          updates.section1Description_no = await translateText(formData.section1Description_en)
        }
        if (formData.section1Video1Title_en) {
          updates.section1Video1Title_no = await translateText(formData.section1Video1Title_en)
        }
        if (formData.section1Video1Description_en) {
          updates.section1Video1Description_no = await translateText(formData.section1Video1Description_en)
        }
        if (formData.section1Video2Title_en) {
          updates.section1Video2Title_no = await translateText(formData.section1Video2Title_en)
        }
        if (formData.section1Video2Description_en) {
          updates.section1Video2Description_no = await translateText(formData.section1Video2Description_en)
        }
        // Section 2
        if (formData.section2Title_en) {
          updates.section2Title_no = await translateText(formData.section2Title_en)
        }
        if (formData.section2Description_en) {
          updates.section2Description_no = await translateText(formData.section2Description_en)
        }
        if (formData.section2Video1Title_en) {
          updates.section2Video1Title_no = await translateText(formData.section2Video1Title_en)
        }
        if (formData.section2Video1Description_en) {
          updates.section2Video1Description_no = await translateText(formData.section2Video1Description_en)
        }
        if (formData.section2Video2Title_en) {
          updates.section2Video2Title_no = await translateText(formData.section2Video2Title_en)
        }
        if (formData.section2Video2Description_en) {
          updates.section2Video2Description_no = await translateText(formData.section2Video2Description_en)
        }
      }

      // Update form data with translations
      setFormData({ ...formData, ...updates })
      showNotification(t.adminPages.translatedToNO || 'Content translated to Norwegian', 'success')
    } catch (error: any) {
      console.error('Translation error:', error)
      showNotification('Failed to translate content. Please translate manually.', 'error')
    } finally {
      setTranslating(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSaving(false)
        return
      }

      const content = buildContentFromFormData()
      const titleTranslations = {
        en: formData.title_en || '',
        no: formData.title_no || formData.title_en || '',
      }
      const subtitleTranslations = {
        en: formData.subtitle_en || '',
        no: formData.subtitle_no || formData.subtitle_en || '',
      }

      const response = await fetch('/api/admin/page-content', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageKey,
          title_translations: titleTranslations,
          subtitle_translations: subtitleTranslations,
          content,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification(t.adminPages.contentUpdated || 'Page content updated successfully', 'success')
        await fetchPage()
        // Force refresh of the page
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        showNotification(data.error || 'Failed to update page content', 'error')
      }
    } catch (error: any) {
      console.error('Error saving page:', error)
      showNotification('Failed to update page content', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return null
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <BackButton href="/admin/pages" className="mb-4" />
          <div className="text-center py-12 text-gray-500">
            <p>{t.adminPages.pageNotFound || 'Page not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const getPageLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      'about': t.navbar.about,
      'contact': t.navbar.contact,
      'how-to-use': t.navbar.howToUse,
    }
    return labels[key] || key
  }

  const renderAboutForm = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Overview Section</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Overview Title</label>
            <input
              type="text"
              value={activeLanguage === 'en' ? (formData.overviewTitle_en || '') : (formData.overviewTitle_no || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [activeLanguage === 'en' ? 'overviewTitle_en' : 'overviewTitle_no']: e.target.value 
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
            />
          </div>
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description {idx + 1}</label>
              <textarea
                value={activeLanguage === 'en' 
                  ? (formData.overviewDescriptions_en?.[idx] || '') 
                  : (formData.overviewDescriptions_no?.[idx] || '')}
                onChange={(e) => {
                  const key = activeLanguage === 'en' ? 'overviewDescriptions_en' : 'overviewDescriptions_no'
                  const newDescriptions = [...(formData[key] || [])]
                  newDescriptions[idx] = e.target.value
                  setFormData({ ...formData, [key]: newDescriptions })
                }}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm resize-none"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feature Icon (e.g., Droplets, Leaf, Zap)</label>
            <input
              type="text"
              value={formData.featureIcon || ''}
              onChange={(e) => setFormData({ ...formData, featureIcon: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feature Title</label>
            <input
              type="text"
              value={activeLanguage === 'en' ? (formData.featureTitle_en || '') : (formData.featureTitle_no || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [activeLanguage === 'en' ? 'featureTitle_en' : 'featureTitle_no']: e.target.value 
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feature Description</label>
            <input
              type="text"
              value={activeLanguage === 'en' ? (formData.featureDescription_en || '') : (formData.featureDescription_no || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [activeLanguage === 'en' ? 'featureDescription_en' : 'featureDescription_no']: e.target.value 
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Mission Section</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mission Title</label>
            <input
              type="text"
              value={activeLanguage === 'en' ? (formData.missionTitle_en || '') : (formData.missionTitle_no || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [activeLanguage === 'en' ? 'missionTitle_en' : 'missionTitle_no']: e.target.value 
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mission Subtitle</label>
            <input
              type="text"
              value={activeLanguage === 'en' ? (formData.missionSubtitle_en || '') : (formData.missionSubtitle_no || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [activeLanguage === 'en' ? 'missionSubtitle_en' : 'missionSubtitle_no']: e.target.value 
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
            />
          </div>
          {[1, 2].map((cardNum) => (
            <div key={cardNum} className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Card {cardNum}</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <input
                    type="text"
                    value={formData[`missionCard${cardNum}Icon` as keyof typeof formData] || ''}
                    onChange={(e) => {
                      const key = `missionCard${cardNum}Icon` as keyof typeof formData
                      setFormData({ ...formData, [key]: e.target.value })
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Icon is the same for all languages</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={activeLanguage === 'en' 
                      ? (formData[`missionCard${cardNum}Title_en` as keyof typeof formData] || '') 
                      : (formData[`missionCard${cardNum}Title_no` as keyof typeof formData] || '')}
                    onChange={(e) => {
                      const key = activeLanguage === 'en' 
                        ? `missionCard${cardNum}Title_en` 
                        : `missionCard${cardNum}Title_no`
                      setFormData({ ...formData, [key]: e.target.value })
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={activeLanguage === 'en' 
                      ? (formData[`missionCard${cardNum}Description_en` as keyof typeof formData] || '') 
                      : (formData[`missionCard${cardNum}Description_no` as keyof typeof formData] || '')}
                    onChange={(e) => {
                      const key = activeLanguage === 'en' 
                        ? `missionCard${cardNum}Description_en` 
                        : `missionCard${cardNum}Description_no`
                      setFormData({ ...formData, [key]: e.target.value })
                    }}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vision Title</label>
            <input
              type="text"
              value={activeLanguage === 'en' ? (formData.visionTitle_en || '') : (formData.visionTitle_no || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [activeLanguage === 'en' ? 'visionTitle_en' : 'visionTitle_no']: e.target.value 
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vision Description</label>
            <textarea
              value={activeLanguage === 'en' ? (formData.visionDescription_en || '') : (formData.visionDescription_no || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [activeLanguage === 'en' ? 'visionDescription_en' : 'visionDescription_no']: e.target.value 
              })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Values Section</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Values Title</label>
            <input
              type="text"
              value={activeLanguage === 'en' ? (formData.valuesTitle_en || '') : (formData.valuesTitle_no || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [activeLanguage === 'en' ? 'valuesTitle_en' : 'valuesTitle_no']: e.target.value 
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Values Subtitle</label>
            <input
              type="text"
              value={activeLanguage === 'en' ? (formData.valuesSubtitle_en || '') : (formData.valuesSubtitle_no || '')}
              onChange={(e) => setFormData({ 
                ...formData, 
                [activeLanguage === 'en' ? 'valuesSubtitle_en' : 'valuesSubtitle_no']: e.target.value 
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
            />
          </div>
          {[1, 2, 3].map((valNum) => (
            <div key={valNum} className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Value {valNum}</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <input
                    type="text"
                    value={formData[`value${valNum}Icon` as keyof typeof formData] || ''}
                    onChange={(e) => {
                      const key = `value${valNum}Icon` as keyof typeof formData
                      setFormData({ ...formData, [key]: e.target.value })
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Icon is the same for all languages</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={activeLanguage === 'en' 
                      ? (formData[`value${valNum}Title_en` as keyof typeof formData] || '') 
                      : (formData[`value${valNum}Title_no` as keyof typeof formData] || '')}
                    onChange={(e) => {
                      const key = activeLanguage === 'en' 
                        ? `value${valNum}Title_en` 
                        : `value${valNum}Title_no`
                      setFormData({ ...formData, [key]: e.target.value })
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={activeLanguage === 'en' 
                      ? (formData[`value${valNum}Description_en` as keyof typeof formData] || '') 
                      : (formData[`value${valNum}Description_no` as keyof typeof formData] || '')}
                    onChange={(e) => {
                      const key = activeLanguage === 'en' 
                        ? `value${valNum}Description_en` 
                        : `value${valNum}Description_no`
                      setFormData({ ...formData, [key]: e.target.value })
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContactForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
        <input
          type="text"
          value={activeLanguage === 'en' ? (formData.companyName_en || '') : (formData.companyName_no || '')}
          onChange={(e) => setFormData({ 
            ...formData, 
            [activeLanguage === 'en' ? 'companyName_en' : 'companyName_no']: e.target.value 
          })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address (use \n for new lines)</label>
        <textarea
          value={activeLanguage === 'en' ? (formData.address_en || '') : (formData.address_no || '')}
          onChange={(e) => setFormData({ 
            ...formData, 
            [activeLanguage === 'en' ? 'address_en' : 'address_no']: e.target.value 
          })}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Email is the same for all languages</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
        <input
          type="url"
          value={formData.website || ''}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Website URL is the same for all languages</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Website Label</label>
        <input
          type="text"
          value={activeLanguage === 'en' ? (formData.websiteLabel_en || '') : (formData.websiteLabel_no || '')}
          onChange={(e) => setFormData({ 
            ...formData, 
            [activeLanguage === 'en' ? 'websiteLabel_en' : 'websiteLabel_no']: e.target.value 
          })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Embed URL</label>
        <textarea
          value={formData.mapEmbedUrl || ''}
          onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">Map URL is the same for all languages</p>
      </div>
    </div>
  )

  const renderHowToUseForm = () => (
    <div className="space-y-6">
      {[1, 2].map((sectionNum) => (
        <div key={sectionNum} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Section {sectionNum}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={activeLanguage === 'en' 
                  ? (formData[`section${sectionNum}Title_en` as keyof typeof formData] || '') 
                  : (formData[`section${sectionNum}Title_no` as keyof typeof formData] || '')}
                onChange={(e) => {
                  const key = activeLanguage === 'en' 
                    ? `section${sectionNum}Title_en` 
                    : `section${sectionNum}Title_no`
                  setFormData({ ...formData, [key]: e.target.value })
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Description</label>
              <textarea
                value={activeLanguage === 'en' 
                  ? (formData[`section${sectionNum}Description_en` as keyof typeof formData] || '') 
                  : (formData[`section${sectionNum}Description_no` as keyof typeof formData] || '')}
                onChange={(e) => {
                  const key = activeLanguage === 'en' 
                    ? `section${sectionNum}Description_en` 
                    : `section${sectionNum}Description_no`
                  setFormData({ ...formData, [key]: e.target.value })
                }}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm resize-none"
              />
            </div>
            {[1, 2].map((videoNum) => (
              <div key={videoNum} className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Video {videoNum}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
                    <input
                      type="text"
                      value={activeLanguage === 'en' 
                        ? (formData[`section${sectionNum}Video${videoNum}Title_en` as keyof typeof formData] || '') 
                        : (formData[`section${sectionNum}Video${videoNum}Title_no` as keyof typeof formData] || '')}
                      onChange={(e) => {
                        const key = activeLanguage === 'en' 
                          ? `section${sectionNum}Video${videoNum}Title_en` 
                          : `section${sectionNum}Video${videoNum}Title_no`
                        setFormData({ ...formData, [key]: e.target.value })
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Description</label>
                    <textarea
                      value={activeLanguage === 'en' 
                        ? (formData[`section${sectionNum}Video${videoNum}Description_en` as keyof typeof formData] || '') 
                        : (formData[`section${sectionNum}Video${videoNum}Description_no` as keyof typeof formData] || '')}
                      onChange={(e) => {
                        const key = activeLanguage === 'en' 
                          ? `section${sectionNum}Video${videoNum}Description_en` 
                          : `section${sectionNum}Video${videoNum}Description_no`
                        setFormData({ ...formData, [key]: e.target.value })
                      }}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                    <input
                      type="url"
                      value={formData[`section${sectionNum}Video${videoNum}Url` as keyof typeof formData] || ''}
                      onChange={(e) => {
                        const key = `section${sectionNum}Video${videoNum}Url` as keyof typeof formData
                        setFormData({ ...formData, [key]: e.target.value })
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Video URL is the same for all languages</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <BackButton href="/admin/pages" className="mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900">
            {getPageLabel(pageKey)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t.adminPages.editDescription || 'Update the content for this page'}
          </p>
          
          {/* Navigation Toggle */}
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              {t.adminPages.showInNavigation || 'Show in Navigation'}
            </label>
            <button
              type="button"
              onClick={async () => {
                if (!navLinkId) return
                setUpdatingNavLink(true)
                try {
                  const { data: { session } } = await supabase.auth.getSession()
                  if (!session) return

                  const newStatus = !navLinkEnabled
                  const response = await fetch('/api/admin/nav-links', {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${session.access_token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      updates: [{
                        id: navLinkId,
                        is_enabled: newStatus,
                      }],
                    }),
                  })

                  if (response.ok) {
                    setNavLinkEnabled(newStatus)
                    showNotification(
                      newStatus 
                        ? (t.adminPages.navLinkEnabled || 'Page is now visible in navigation')
                        : (t.adminPages.navLinkDisabled || 'Page is now hidden from navigation'),
                      'success'
                    )
                  } else {
                    showNotification('Failed to update navigation status', 'error')
                  }
                } catch (error) {
                  console.error('Error updating nav link:', error)
                  showNotification('Failed to update navigation status', 'error')
                } finally {
                  setUpdatingNavLink(false)
                }
              }}
              disabled={updatingNavLink || !navLinkId}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-nature-green-500 focus:ring-offset-2 disabled:opacity-50 ${
                navLinkEnabled ? 'bg-nature-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  navLinkEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            {!navLinkId && (
              <span className="text-xs text-gray-500">
                ({t.adminPages.navLinkNotConfigured || 'Navigation link not configured'})
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="space-y-6">
            {/* Language Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 mb-4">
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setActiveLanguage('en')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeLanguage === 'en'
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {t.forms.english || 'English'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLanguage('no')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeLanguage === 'no'
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {t.forms.norwegian || 'Norwegian'}
                </button>
              </div>
              {activeLanguage === 'no' && (formData.title_en || formData.subtitle_en || (pageKey === 'about' && formData.overviewTitle_en) || (pageKey === 'contact' && formData.companyName_en) || (pageKey === 'how-to-use' && formData.section1Title_en)) && (
                <button
                  type="button"
                  onClick={handleTranslateToNO}
                  disabled={translating}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-nature-green-700 bg-nature-green-50 hover:bg-nature-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Languages className="w-4 h-4" />
                  {translating ? (t.forms.translating || 'Translating...') : (t.forms.translateToNO || 'Translate from English')}
                </button>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t.adminPages.titleLabel || 'Title'} {activeLanguage === 'en' && '*'}
              </label>
              <input
                id="title"
                type="text"
                value={activeLanguage === 'en' ? (formData.title_en || '') : (formData.title_no || '')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  [activeLanguage === 'en' ? 'title_en' : 'title_no']: e.target.value 
                })}
                required={activeLanguage === 'en'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                placeholder={t.adminPages.titlePlaceholder || 'Page title'}
              />
            </div>

            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                {t.adminPages.subtitleLabel || 'Subtitle'}
              </label>
              <input
                id="subtitle"
                type="text"
                value={activeLanguage === 'en' ? (formData.subtitle_en || '') : (formData.subtitle_no || '')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  [activeLanguage === 'en' ? 'subtitle_en' : 'subtitle_no']: e.target.value 
                })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                placeholder={t.adminPages.subtitlePlaceholder || 'Page subtitle (optional)'}
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              {pageKey === 'about' && renderAboutForm()}
              {pageKey === 'contact' && renderContactForm()}
              {pageKey === 'how-to-use' && renderHowToUseForm()}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => router.push('/admin/pages')}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-nature-green-600 hover:bg-nature-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    {t.common.saving}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t.common.save}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}
      </div>
    </div>
  )
}
