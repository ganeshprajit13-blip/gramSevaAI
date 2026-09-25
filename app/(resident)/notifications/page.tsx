'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, Info, AlertTriangle, FileText, Calendar, Trash2 } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { Notification } from '@/types'
import { timeAgo } from '@/utils'
import Link from 'next/link'

export default function NotificationsPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const mockNotes: Notification[] = [
      {
        id: '1',
        title: language === 'ta' ? 'புதிய அரசுத் திட்டம் வெளியிடப்பட்டது' : 'New Scheme Available',
        message: language === 'ta' ? 'உங்கள் மாவட்டத்தில் உள்ள விவசாயிகளுக்கான புதிய மானியத் திட்டம் அறிவிக்கப்பட்டுள்ளது.' : 'A new subsidy for farmers in your district has been announced.',
        type: 'scheme_published',
        scheme_id: '123',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        is_read: false
      },
      {
        id: '2',
        title: language === 'ta' ? 'சுயவிவரம் முழுமையடையவில்லை' : 'Profile Incomplete',
        message: language === 'ta' ? 'பொருத்தமான நலத்திட்ட பரிந்துரைகளைப் பெற உங்கள் சுயவிவரப் படிவத்தை முடிக்கவும்.' : 'Please complete your profile to get personalized scheme recommendations.',
        type: 'reminder',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        is_read: true
      }
    ]
    
    // Attempt to fetch from API, fallback to mock if no actual DB exists for notes yet
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer mock-token` }
    }).then(r => r.json()).then(d => {
      if (d.data && d.data.length > 0) {
        setNotifications(d.data)
      } else {
        setNotifications(mockNotes)
      }
    }).catch(() => {
      setNotifications(mockNotes)
    }).finally(() => setLoading(false))
  }, [user, language])

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'scheme_published': return <FileText className="w-5 h-5 text-primary" />
      case 'announcement': return <Bell className="w-5 h-5 text-blue-500" />
      case 'reminder': return <AlertTriangle className="w-5 h-5 text-orange-500" />
      default: return <Info className="w-5 h-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6 pt-8 lg:pt-0 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('notifications')}</h1>
          <p className="page-subtitle">
            {language === 'ta'
              ? 'சமீபத்திய அரசுத் திட்டங்கள் மற்றும் பொது அறிவிப்புகளைப் பெறுங்கள்'
              : 'Stay updated with the latest schemes and announcements'}
          </p>
        </div>
        <div className="bg-secondary px-3 py-1.5 rounded-lg text-sm font-medium">
          {notifications.filter(n => !n.is_read).length} {language === 'ta' ? 'படிக்காதவை' : 'Unread'}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
        ) : notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-bold mb-2">{language === 'ta' ? 'அறிவிப்புகள் ஏதுமில்லை' : 'No notifications yet'}</h3>
            <p className="text-sm text-muted-foreground">{language === 'ta' ? 'நீங்கள் அனைத்து அறிவிப்புகளையும் பார்த்துவிட்டீர்கள்!' : "You're all caught up!"}</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-4 sm:p-5 flex gap-4 transition-colors ${!note.is_read ? 'bg-primary/5 border-primary/20' : ''}`}
                onClick={() => !note.is_read && markAsRead(note.id)}
              >
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!note.is_read ? 'bg-primary/10' : 'bg-secondary'}`}>
                  {getIcon(note.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-semibold ${!note.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {note.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(note.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {note.message}
                  </p>
                  
                  {note.scheme_id && (
                    <Link href={`/schemes/${note.scheme_id}`} className="text-xs font-medium text-primary hover:underline">
                      {t('viewDetails')} →
                    </Link>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNotification(note.id); }}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {!note.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary self-center mt-2" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
