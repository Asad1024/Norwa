'use client'

import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { Play, Pause } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function HowToUsePage() {
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Professional Video component with actual video playback
  const VideoPlayer = ({ title, description, videoUrl }: { title?: string; description?: string; videoUrl?: string }) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handlePlayPause = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
        } else {
          videoRef.current.play()
          setIsPlaying(true)
        }
      }
    }

    const handleVideoEnd = () => {
      setIsPlaying(false)
    }

    return (
      <div 
        className="group relative bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg hover:border-nature-green-400 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative bg-gray-900 aspect-video flex items-center justify-center overflow-hidden">
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                onClick={handlePlayPause}
                onEnded={handleVideoEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                playsInline
              />
              {/* Play/Pause overlay */}
              {(!isPlaying || isHovered) && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity duration-300 z-10"
                  onClick={handlePlayPause}
                >
                  <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/35 hover:scale-110 transition-all duration-300 shadow-xl border-2 border-white/30">
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" fill="white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" fill="white" />
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </div>
          )}
        </div>
        
        {/* Video info card */}
        {(title || description) && (
          <div className="p-4 bg-white">
            {title && (
              <h3 className="font-semibold text-gray-900 mb-1.5 text-base">{title}</h3>
            )}
            {description && (
              <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await fetch(`/api/page-content/how-to-use?t=${Date.now()}&lang=${language}`, {
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

  const content = pageData?.content || {}
  const title = pageData?.title || t.howToUse.title
  const subtitle = pageData?.subtitle || t.howToUse.subtitle
  const sections = content.sections || []

  // Fallback to default sections if none exist
  if (sections.length === 0) {
    sections.push({
      title: t.howToUse.fettfjerner,
      description: t.howToUse.fettfjernerDesc,
      videos: [
        {
          title: t.howToUse.introVideoTitle,
          description: t.howToUse.introVideoDesc,
          url: 'https://video.wixstatic.com/video/01bed9_e15acfaf3db649cd890cfb7e920fb016/720p/mp4/file.mp4'
        },
        {
          title: t.howToUse.quickStartTitle,
          description: t.howToUse.quickStartDesc,
          url: 'https://video.wixstatic.com/video/01bed9_bb35b5284c2141a7b05437d2eabb0105/1080p/mp4/file.mp4'
        }
      ]
    })
    sections.push({
      title: t.howToUse.grillRenser,
      description: t.howToUse.grillRenserDesc,
      videos: [
        {
          title: t.howToUse.fettfjernerDemoTitle,
          description: t.howToUse.fettfjernerDemoDesc,
          url: 'https://video.wixstatic.com/video/01bed9_9e51ecc36ca946b291214f5c80df029f/720p/mp4/file.mp4'
        },
        {
          title: t.howToUse.fettfjernerUsageTitle,
          description: t.howToUse.fettfjernerUsageDesc,
          url: 'https://video.wixstatic.com/video/01bed9_7e6cc7dfb63b432d915e826083ce960e/1080p/mp4/file.mp4'
        }
      ]
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Sections */}
        {sections.map((section: any, sectionIdx: number) => (
          <div key={sectionIdx}>
            {sectionIdx > 0 && (
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>
            )}

            <section className="mb-12">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                  <span className="text-nature-green-600">{section.title}</span>
                </h2>
                {section.description && (
                  <p className="text-sm text-gray-600 max-w-2xl">
                    {section.description}
                  </p>
                )}
              </div>
              {section.videos && section.videos.length > 0 && (
                <div className="grid md:grid-cols-2 gap-5">
                  {section.videos.map((video: any, videoIdx: number) => (
                    <VideoPlayer 
                      key={videoIdx}
                      title={video.title}
                      description={video.description}
                      videoUrl={video.url}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ))}
      </div>
    </div>
  )
}
