'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Landmark, Search, ChevronRight, ArrowLeft,
  FileText, Coins, Users, MapPin, Droplet, Zap, Award, Leaf, HeartPulse, GraduationCap, Clock, CheckCircle2
} from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { getStoredServices, type ServiceRecord } from '@/lib/service-store'

export default function ServicesPage() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [searchVal, setSearchVal] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const items = getStoredServices().filter(s => s.isActive !== false)
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setServices(items)
      setLoading(false)
    }

    loadData()
    window.addEventListener('gramseva_services_db_updated', loadData)
    return () => window.removeEventListener('gramseva_services_db_updated', loadData)
  }, [])

  const categories = ['All', 'Civil Registration', 'Revenue Services', 'Land Revenue', 'Public Utilities']

  const filteredServices = services.filter(svc => {
    const matchesCat = selectedCategory === 'All' || svc.category === selectedCategory
    const matchesSearch =
      !searchVal.trim() ||
      svc.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchVal.toLowerCase()) ||
      svc.department.toLowerCase().includes(searchVal.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F766E] via-teal-800 to-slate-900 rounded-[22px] p-6 sm:p-8 text-white space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" /> {t('back')}
          </button>
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider">
            {language === 'en' ? 'Village E-Sevai Digital Services' : 'கிராம இ-சேவை டிஜிட்டல் சேவைகள்'}
          </span>
        </div>

        <div className="space-y-1 pt-2">
          <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight">{t('services')}</h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            {language === 'en'
              ? 'Apply online for birth certificates, income declarations, land patta transfers, drinking water connections, and revenue certificates directly through GramSeva AI.'
              : 'பிறப்புச் சான்றிதழ், வருமானச் சான்று, பட்டா மாறுதல், குடிநீர் இணைப்பு மற்றும் வருவாய்ச் சான்றிதழ்களுக்கு நேரடியாக விண்ணப்பிக்கவும்.'}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={language === 'en' ? 'Search village services...' : 'கிராம சேவைகளைத் தேடுங்கள்...'}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0F766E] font-medium"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map((cat) => {
            const label = cat === 'All'
              ? t('all')
              : cat === 'Civil Registration'
              ? t('svcCivilRegistration')
              : cat === 'Revenue Services'
              ? t('svcRevenueServices')
              : cat === 'Land Revenue'
              ? t('svcLandRevenue')
              : t('svcPublicUtilities')

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-[18px] bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <Landmark className="w-12 h-12 text-slate-400 mx-auto" />
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('noServicesFound')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'en' ? 'Try adjusting your search criteria or category filter.' : 'வடிகட்டியை மாற்றி மீண்டும் முயற்சிக்கவும்.'}
            </p>
          </div>
          <button
            onClick={() => { setSearchVal(''); setSelectedCategory('All'); }}
            className="px-4 py-2 bg-[#0F766E] text-white text-xs font-extrabold rounded-xl cursor-pointer"
          >
            {t('reset')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((svc) => {
            const name = language === 'ta' && (svc as any).name_ta ? (svc as any).name_ta : svc.name
            const desc = language === 'ta' && (svc as any).description_ta ? (svc as any).description_ta : svc.description
            const dept = language === 'ta' && (svc as any).department_ta ? (svc as any).department_ta : svc.department

            return (
              <motion.div
                key={svc.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 rounded-[18px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="h-40 relative overflow-hidden bg-slate-950">
                    <img
                      src={svc.image}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs ${
                        svc.status === 'New' ? 'bg-[#16A34A] text-white' : 'bg-[#0F766E] text-white'
                      }`}>
                        {svc.status === 'New' ? (language === 'en' ? 'New' : 'புதியது') : (language === 'en' ? 'Available' : 'செயலில்')}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      {dept}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-[#0F766E] transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => toast.success(language === 'en' ? `Service application initiated for "${name}"` : `"${name}" சேவை விண்ணப்பம் தொடங்கப்பட்டது`)}
                    className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-[#0F766E] hover:text-white text-slate-800 dark:text-slate-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center"
                  >
                    {t('applyNow')}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

    </div>
  )
}
