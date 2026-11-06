import { SchemeRecord } from './scheme-store'

// Tamil query keyword synonyms mapping to category and scheme concepts
const TAMIL_KEYWORD_MAP: Record<string, string[]> = {
  // Agriculture / Farmer
  'விவசாய': ['agriculture', 'farmer', 'kisan', 'crop', 'land', 'uzhavar', 'விவசாயம்'],
  'விவசாயி': ['agriculture', 'farmer', 'kisan', 'crop', 'land', 'uzhavar', 'விவசாயி'],
  'விவசாயிகளுக்கான': ['agriculture', 'farmer', 'kisan', 'crop', 'land', 'uzhavar'],
  'உழவர்': ['agriculture', 'farmer', 'kisan', 'uzhavar'],
  'வேளாண்': ['agriculture', 'farmer', 'kisan'],
  'வேளாண்மை': ['agriculture', 'farmer', 'kisan'],
  'பயிர்': ['agriculture', 'crop', 'kisan'],
  'கிசான்': ['kisan', 'agriculture', 'farmer'],

  // Women / Magalir
  'மகளிர்': ['women', 'magalir', 'urimai', 'female', 'shg'],
  'பெண்': ['women', 'female', 'pudhumai penn', 'girl'],
  'பெண்கள்': ['women', 'female', 'magalir'],
  'உரிமை': ['urimai', 'magalir', 'women'],
  'கலைஞர்': ['kalaignar', 'magalir'],
  'தாய்ப்பால்': ['maternity', 'women', 'mother'],
  'கர்ப்பிணி': ['maternity', 'women', 'mother'],

  // Student / Education / Scholarship
  'மாணவர்': ['student', 'education', 'scholarship', 'pudhumai penn', 'school', 'college'],
  'மாணவி': ['student', 'education', 'scholarship', 'pudhumai penn'],
  'மாணவர்கள்': ['student', 'education', 'scholarship'],
  'மாணவர்களுக்கான': ['student', 'education', 'scholarship'],
  'கல்வி': ['education', 'scholarship', 'student', 'school', 'college'],
  'உதவித்தொகை': ['scholarship', 'stipend', 'pension', 'aid'],
  'படிப்பு': ['education', 'student'],
  'பள்ளி': ['school', 'education', 'student'],
  'கல்லூரி': ['college', 'education', 'student'],

  // Housing
  'வீடு': ['housing', 'awas', 'house', 'pucca'],
  'வீட்டுவசதி': ['housing', 'awas'],
  'ஆவாஸ்': ['awas', 'housing'],
  'குடிசை': ['housing', 'rural housing'],

  // Pension / Senior Citizens
  'முதியோர்': ['pension', 'senior', 'oap', 'elderly'],
  'முதியவர்கள்': ['pension', 'senior', 'oap'],
  'ஓய்வூதியம்': ['pension', 'oap', 'monthly aid'],
  'விதவை': ['widow', 'pension', 'women'],
  'மாற்றுத்திறனாளி': ['disability', 'differently abled', 'pension'],

  // Health / Medical
  'மருத்துவம்': ['health', 'ayushman', 'medical', 'hospital', 'insurance'],
  'சுகாதாரம்': ['health', 'medical', 'hospital'],
  'காப்பீடு': ['insurance', 'health', 'ayushman'],
  'ஆயுஷ்மான்': ['ayushman', 'health'],

  // Employment / Business
  'வேலை': ['employment', 'mnrega', 'job', 'work'],
  'வேலைவாய்ப்பு': ['employment', 'job', 'skill'],
  'தொழில்': ['business', 'self employed', 'artisan', 'vishwakarma'],
  'சுயதொழில்': ['business', 'self employed', 'shg'],

  // Common money / benefits
  '1000': ['1000', 'magalir', 'pudhumai penn', 'urimai', '₹1,000'],
  '6000': ['6000', 'kisan', 'pm kisan', '₹6,000'],
  'பணம்': ['benefit', 'financial', 'cash', 'aid'],
  'மானியம்': ['subsidy', 'aid', 'grant'],
}

// Stopwords in Tamil and English that should not filter out results
const STOP_WORDS = new Set([
  'அரசு', 'திட்டம்', 'திட்டங்கள்', 'என்ன', 'பற்றி', 'கூறவும்', 'எனக்கு', 'வேண்டும்',
  'எவை', 'கிடைக்கும்', 'உள்ளதா', 'உள்ளன', 'விவரம்', 'எப்படி', 'விண்ணப்பிப்பது',
  'scheme', 'schemes', 'government', 'govt', 'what', 'are', 'the', 'for', 'in',
  'is', 'how', 'to', 'apply', 'my', 'me', 'tell', 'show', 'all', 'details'
])

/**
 * Tokenize a search query into clean search tokens and related synonyms
 */
export function extractSearchTokens(rawQuery: string): { tokens: string[]; expandedKeywords: string[] } {
  if (!rawQuery) return { tokens: [], expandedKeywords: [] }

  const cleaned = rawQuery.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ')
  const words = cleaned.split(/\s+/).filter(w => w.length > 0)

  const tokens: string[] = []
  const expanded = new Set<string>()

  for (const word of words) {
    if (!STOP_WORDS.has(word)) {
      tokens.push(word)
    }

    // Check Tamil keyword mapping
    for (const [key, synonyms] of Object.entries(TAMIL_KEYWORD_MAP)) {
      if (word === key || word.startsWith(key) || key.startsWith(word)) {
        synonyms.forEach(s => expanded.add(s.toLowerCase()))
      }
    }

    // English keyword expansion
    if (word.includes('farm') || word === 'kisan' || word === 'agri') {
      expanded.add('agriculture')
      expanded.add('farmer')
      expanded.add('விவசாயி')
      expanded.add('வேளாண்')
    } else if (word.includes('women') || word.includes('girl') || word === 'female') {
      expanded.add('women')
      expanded.add('magalir')
      expanded.add('மகளிர்')
      expanded.add('பெண்')
    } else if (word.includes('student') || word.includes('scholar') || word.includes('edu')) {
      expanded.add('student')
      expanded.add('education')
      expanded.add('மாணவர்')
      expanded.add('கல்வி')
    } else if (word.includes('pension') || word.includes('elder') || word.includes('senior')) {
      expanded.add('pension')
      expanded.add('முதியோர்')
      expanded.add('ஓய்வூதியம்')
    } else if (word.includes('house') || word.includes('home') || word === 'awas') {
      expanded.add('housing')
      expanded.add('வீடு')
      expanded.add('வீட்டுவசதி')
    } else if (word.includes('health') || word.includes('medic') || word.includes('doctor')) {
      expanded.add('health')
      expanded.add('மருத்துவம்')
      expanded.add('காப்பீடு')
    }
  }

  // If all words were stopwords (e.g. user just typed "schemes"), keep original words
  const finalTokens = tokens.length > 0 ? tokens : words

  return { tokens: finalTokens, expandedKeywords: Array.from(expanded) }
}

/**
 * Match schemes against query with support for Tamil & English,
 * searching title, category, description, benefits, eligibility, and keywords.
 */
export function searchSchemes(
  schemes: SchemeRecord[],
  query: string,
  categoryFilter: string = 'All'
): SchemeRecord[] {
  if (!schemes || schemes.length === 0) return []

  const trimmed = query.trim()

  // Filter by category first if specified and not 'All'
  let list = schemes
  if (categoryFilter && categoryFilter !== 'All') {
    list = list.filter(s => {
      const catEn = (s.category || '').toLowerCase()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catTa = ((s as any).category_ta || '').toLowerCase()
      const filterLower = categoryFilter.toLowerCase()
      return catEn === filterLower || catTa === filterLower
    })
  }

  if (!trimmed) {
    return list
  }

  const { tokens, expandedKeywords } = extractSearchTokens(trimmed)
  const fullQueryLower = trimmed.toLowerCase()

  const scoredSchemes = list.map(scheme => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = scheme as any

    const titleEn = (s.title || s.name || '').toLowerCase()
    const titleTa = (s.title_ta || s.name_ta || '').toLowerCase()
    const descEn = (s.description || '').toLowerCase()
    const descTa = (s.description_ta || '').toLowerCase()
    const catEn = (s.category || '').toLowerCase()
    const catTa = (s.category_ta || '').toLowerCase()
    const typeEn = (s.type || '').toLowerCase()
    const typeTa = (s.type_ta || '').toLowerCase()

    const benefitsEn = Array.isArray(s.benefits_list) ? s.benefits_list.join(' ').toLowerCase() : ''
    const benefitsTa = Array.isArray(s.benefits_list_ta) ? s.benefits_list_ta.join(' ').toLowerCase() : ''
    const keywordsEn = Array.isArray(s.keywords) ? s.keywords.join(' ').toLowerCase() : ''
    const keywordsTa = Array.isArray(s.keywords_ta) ? s.keywords_ta.join(' ').toLowerCase() : ''
    const aiSummaryEn = (s.ai_summary || '').toLowerCase()
    const aiSummaryTa = (s.ai_summary_ta || '').toLowerCase()

    let score = 0

    // 1. Exact full query matches
    if (titleEn.includes(fullQueryLower) || titleTa.includes(fullQueryLower)) score += 100
    if (catEn.includes(fullQueryLower) || catTa.includes(fullQueryLower)) score += 60
    if (descEn.includes(fullQueryLower) || descTa.includes(fullQueryLower)) score += 40
    if (benefitsEn.includes(fullQueryLower) || benefitsTa.includes(fullQueryLower)) score += 40

    // 2. Token matches
    for (const token of tokens) {
      if (titleEn.includes(token) || titleTa.includes(token)) score += 30
      if (catEn.includes(token) || catTa.includes(token)) score += 20
      if (keywordsEn.includes(token) || keywordsTa.includes(token)) score += 25
      if (benefitsEn.includes(token) || benefitsTa.includes(token)) score += 15
      if (descEn.includes(token) || descTa.includes(token)) score += 10
      if (typeEn.includes(token) || typeTa.includes(token)) score += 8
      if (aiSummaryEn.includes(token) || aiSummaryTa.includes(token)) score += 10
    }

    // 3. Expanded semantic keyword matches (e.g. Tamil query "விவசாயி" matched "agriculture")
    for (const kw of expandedKeywords) {
      if (titleEn.includes(kw) || titleTa.includes(kw)) score += 25
      if (catEn.includes(kw) || catTa.includes(kw)) score += 25
      if (keywordsEn.includes(kw) || keywordsTa.includes(kw)) score += 20
      if (benefitsEn.includes(kw) || benefitsTa.includes(kw)) score += 15
      if (descEn.includes(kw) || descTa.includes(kw)) score += 10
    }

    return { scheme, score }
  })

  // Filter out schemes with 0 score and sort descending by score
  const matches = scoredSchemes
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.scheme)

  return matches
}

