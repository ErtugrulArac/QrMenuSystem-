"use client"
import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { FiChevronLeft, FiChevronRight, FiZap, FiClock } from 'react-icons/fi'

interface Campaign {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  discount: string
  bgGradient: string
  active: boolean
  duration?: number | null
  durationUnit?: 'minutes' | 'hours' | 'days'
  type?: 'campaign'
}

interface Announcement {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  bgGradient: string
  active: boolean
  icon?: string
  type?: 'announcement'
}

type BannerItem = (Campaign | Announcement) & { type: 'campaign' | 'announcement' }

const CampaignBanner = () => {
  const { lang } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [items, setItems] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(3600)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [campaignsRes, announcementsRes] = await Promise.all([
          fetch('/api/campaigns'),
          fetch('/api/announcements')
        ])

        const campaigns = campaignsRes.ok ? await campaignsRes.json() : []
        const announcements = announcementsRes.ok ? await announcementsRes.json() : []

        // Tag with type and merge
        const tagged: BannerItem[] = [
          ...campaigns.map((c: Campaign) => ({ ...c, type: 'campaign' as const })),
          ...announcements.map((a: Announcement) => ({ ...a, type: 'announcement' as const }))
        ]

        // Filter active and shuffle
        const active = tagged.filter(item => item.active)
        const shuffled = active.sort(() => Math.random() - 0.5)
        setItems(shuffled)
      } catch (error) {
        console.error('Banner öğeleri yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  // Timer countdown - only for campaigns with duration
  useEffect(() => {
    const current = items[currentIndex]
    if (!current || current.type !== 'campaign') {
      setTimeLeft(0)
      return
    }

    const campaign = current as Campaign
    if (!campaign.duration || !campaign.createdAt) {
      setTimeLeft(0)
      return
    }

    const convertToSeconds = (duration: number, unit?: string): number => {
      switch (unit) {
        case 'hours': return duration * 3600
        case 'days': return duration * 86400
        case 'minutes':
        default: return duration * 60
      }
    }

    const totalSeconds = convertToSeconds(campaign.duration, campaign.durationUnit)
    const createdTime = new Date(campaign.createdAt).getTime()
    
    const calculateTimeLeft = () => {
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - createdTime) / 1000)
      return Math.max(0, totalSeconds - elapsedSeconds)
    }

    const remaining = calculateTimeLeft()
    setTimeLeft(remaining)

    if (remaining <= 0) {
      handleDeactivateCampaign(campaign.id)
      return
    }

    const timer = setInterval(() => {
      const timeRemaining = calculateTimeLeft()
      setTimeLeft(timeRemaining)

      if (timeRemaining <= 0) {
        handleDeactivateCampaign(campaign.id)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [items, currentIndex])

  // Auto slide
  useEffect(() => {
    if (items.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [items.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [items.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const handleDeactivateCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false })
      })

      if (response.ok) {
        setItems(items.filter(i => i.id !== campaignId))
        
        if (items[currentIndex]?.id === campaignId) {
          setCurrentIndex(prev => Math.max(0, prev > 0 ? prev - 1 : 0))
        }
      }
    } catch (error) {
      console.error('Kampanya deactivate edilirken hata:', error)
    }
  }

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX)
    handleSwipe()
  }

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    }
    if (isRightSwipe) {
      prevSlide()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading || items.length === 0) return null

  const current = items[currentIndex]
  const isCampaign = current.type === 'campaign'

  return (
    <div className='w-full bg-gradient-to-b from-white to-gray-50 border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-2 md:px-4 py-4'>
        {/* Banner */}
        <div 
          className='relative overflow-hidden rounded-3xl shadow-2xl group cursor-grab active:cursor-grabbing'
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background with overlay */}
          <div className={`bg-gradient-to-br ${current.bgGradient} w-full px-6 md:px-10 py-6 md:py-8 text-white flex items-stretch justify-between transition-all duration-500 relative min-h-[160px] md:min-h-[200px]`}>
            {/* Left Content Section */}
            <div className='flex-1 flex flex-col justify-center max-w-xs md:max-w-lg z-10'>
              {/* Badge - Campaign or Announcement */}
              {isCampaign ? (
                <div className='inline-flex items-center gap-2 bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-2 w-fit border border-white/30'>
                  <FiZap className='w-3.5 h-3.5 md:w-4 md:h-4 animate-pulse' />
                  <span className='font-bold text-xs md:text-sm text-white'>{(current as Campaign).discount}</span>
                </div>
              ) : (
                <div className='inline-flex items-center gap-2 bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-2 w-fit border border-white/30'>
                  <span className='text-lg'>{(current as Announcement).icon || '📢'}</span>
                  <span className='font-bold text-xs md:text-sm text-white'>{lang === 'TR' ? 'Duyuru' : 'Announcement'}</span>
                </div>
              )}

              {/* Title */}
              <h2 className='text-2xl md:text-3xl lg:text-4xl font-black mb-2 text-white leading-tight'>
                {lang === 'TR' ? current.title : current.titleEn}
              </h2>

              {/* Description */}
              <p className='text-xs md:text-sm text-white/90 leading-relaxed mb-4 max-w-md'>
                {lang === 'TR' ? current.description : current.descriptionEn}
              </p>

              {/* Timer - Only show if campaign has duration */}
              {isCampaign && (current as Campaign).duration && (
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/30'>
                    <FiClock className='w-4 h-4' />
                    <span className='font-bold text-xs md:text-sm font-mono'>{formatTime(timeLeft)}</span>
                  </div>
                  <span className='text-xs text-white/80'>{lang === 'TR' ? 'Kalan' : 'Time'}</span>
                </div>
              )}
            </div>

            {/* Right Image/Decoration Section */}
            <div className='flex absolute right-0 top-0 bottom-0 items-center justify-center w-1/3 opacity-20 pointer-events-none'>
              <div className='text-9xl animate-bounce'>🎁</div>
            </div>

            {/* Shine Effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700'></div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className='absolute left-3 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/25 hover:bg-white/40 text-white rounded-full transition-all duration-300 z-10 backdrop-blur-sm border border-white/20 hidden md:opacity-0 md:group-hover:opacity-100'
          >
            <FiChevronLeft className='w-5 h-5 md:w-6 md:h-6' />
          </button>
          <button
            onClick={nextSlide}
            className='absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/25 hover:bg-white/40 text-white rounded-full transition-all duration-300 z-10 backdrop-blur-sm border border-white/20 hidden md:opacity-0 md:group-hover:opacity-100'
          >
            <FiChevronRight className='w-5 h-5 md:w-6 md:h-6' />
          </button>
        </div>

        {/* Dots - Enhanced */}
        <div className='flex justify-center items-center gap-3 mt-5'>
          <div className='flex gap-2'>
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 w-8 h-2.5' 
                    : 'bg-gray-300 w-2 h-2.5 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          {items.length > 1 && (
            <span className='text-xs text-gray-500 font-medium'>
              {currentIndex + 1} / {items.length}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CampaignBanner
