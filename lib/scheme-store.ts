import { getStoredResidents, type ResidentRecord } from './resident-store'

export interface SchemeRecord {
  id: string
  title: string
  name?: string
  title_ta?: string
  name_ta?: string
  category: 'Women Empowerment' | 'Agriculture' | 'Education' | 'Health' | 'Housing' | 'Pension' | 'Employment' | 'Business' | 'Student Scholarship' | 'Livestock' | 'Infrastructure' | 'Other'
  category_ta?: string
  type: 'Central Government' | 'State Government' | 'District' | 'Panchayat'
  type_ta?: string
  description: string
  description_ta?: string
  benefits_list: string[]
  benefits_list_ta?: string[]
  benefit_details: {
    type: string
    amount: string
    frequency: string
  }
  benefit_details_ta?: {
    type: string
    amount: string
    frequency: string
  }
  launch_date: string
  closing_date: string
  status: 'active' | 'upcoming' | 'closed' | 'draft' | 'published'
  keywords?: string[]
  keywords_ta?: string[]
  
  // Step 2 Eligibility
  eligibility: {
    min_age?: number
    max_age?: number
    gender?: 'Male' | 'Female' | 'All'
    occupation?: string[]
    income_range?: string[]
    education?: string[]
    land_ownership?: 'No Land' | 'Agricultural' | 'Residential' | 'Commercial' | 'Any'
    land_size_acres?: number
    disability?: 'Yes' | 'No' | 'Any'
    marital_status?: string[]
    village_filter?: string
    ward_filter?: string
    category_filter?: string[]
  }
  eligibility_summary_ta?: string

  // Step 3 Documents
  required_documents: string[]
  required_documents_ta?: string[]

  // Step 4 Application Method
  application_method: {
    type: 'Online' | 'Offline' | 'Both'
    online_url?: string
    official_website?: string
    redirection_link?: string
    office_name?: string
    officer_name?: string
    office_address?: string
    working_hours?: string
    contact_number?: string
    maps_location?: string
  }
  application_method_ta?: {
    type?: string
    office_name?: string
    officer_name?: string
    office_address?: string
    working_hours?: string
  }

  // Step 5 Media
  media: {
    poster_url?: string
    pdf_url?: string
    brochure_url?: string
    video_url?: string
  }

  // Step 6 AI Checker
  ai_checker_enabled: boolean

  // Step 8 Important Info
  important_info: {
    faqs: { question: string; answer: string }[]
    terms_and_conditions?: string
    helpline_number?: string
    official_website?: string
    official_email?: string
  }
  important_info_ta?: {
    faqs: { question: string; answer: string }[]
    terms_and_conditions?: string
  }

  // Step 9 AI Summary
  ai_summary: string
  ai_summary_ta?: string

  created_at: string
  updated_at: string
}

export const INITIAL_SCHEMES: SchemeRecord[] = [
  {
    id: 'SCH-001',
    title: 'Kalaignar Magalir Urimai Thittam',
    name: 'Kalaignar Magalir Urimai Thittam',
    title_ta: 'கலைஞர் மகளிர் உரிமைத் திட்டம்',
    name_ta: 'கலைஞர் மகளிர் உரிமைத் திட்டம்',
    category: 'Women Empowerment',
    category_ta: 'மகளிர் நலம்',
    type: 'State Government',
    type_ta: 'மாநில அரசு',
    description: 'Direct financial assistance of ₹1,000 monthly for women heads of eligible households across Tamil Nadu to improve livelihood standard, economic autonomy, and nutrition.',
    description_ta: 'தமிழ்நாட்டின் தகுதிவாய்ந்த குடும்பங்களின் பெண் தலைவர்களுக்கு மாதம் ₹1,000 நேரடி வங்கிப் பரிமாற்றம் மூலம் நிதி உதவி வழங்கி, அவர்களின் பொருளாதார சுதந்திரத்தை உறுதி செய்யும் அரசு திட்டம்.',
    benefits_list: [
      '₹1,000 Direct Monthly Bank Transfer',
      'Priority access to Self Help Group loans',
      'Free financial literacy training'
    ],
    benefits_list_ta: [
      'மாதந்தோறும் ₹1,000 வங்கி கணக்கில் நேரடி பரிமாற்றம்',
      'மகளிர் சுய உதவிக் குழுக் கடன்களில் முன்னுரிமை',
      'இலவச நிதி விழிப்புணர்வுப் பயிற்சி'
    ],
    benefit_details: {
      type: 'Cash Assistance',
      amount: '₹1,000',
      frequency: 'Monthly'
    },
    benefit_details_ta: {
      type: 'நேரடி நிதியுதவி',
      amount: '₹1,000',
      frequency: 'மாதந்தோறும்'
    },
    launch_date: '2023-09-15',
    closing_date: '2027-12-31',
    status: 'active',
    keywords: ['women', 'magalir', 'urimai', '1000', 'female', 'financial aid', 'monthly stipend', 'kmut'],
    keywords_ta: ['மகளிர்', 'பெண்கள்', 'உரிமைத் திட்டம்', '1000', 'கலைஞர்', 'பெண் தலைவர்கள்', 'நிதியுதவி', 'மாத உதவி'],
    eligibility: {
      min_age: 21,
      max_age: 65,
      gender: 'Female',
      occupation: ['Homemaker', 'Daily Wage Worker', 'Agricultural Labourer', 'Self Employed'],
      income_range: ['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000'],
      education: ['Any'],
      land_ownership: 'Any',
      disability: 'Any',
      marital_status: ['Single', 'Married', 'Widow', 'Divorced']
    },
    eligibility_summary_ta: '21 முதல் 65 வயது வரையிலான குடும்பப் பெண் தலைவர்கள், ஆண்டு குடும்ப வருமானம் ₹2.5 லட்சத்திற்குள் இருக்க வேண்டும்.',
    required_documents: ['Aadhaar Card', 'Ration Card', 'Bank Passbook', 'Income Certificate'],
    required_documents_ta: ['ஆதார் அட்டை', 'குடும்ப அட்டை (ரேஷன் கார்டு)', 'வங்கி கணக்குப் புத்தகம்', 'வருமானச் சான்றிதழ்'],
    application_method: {
      type: 'Both',
      online_url: 'https://kmut.tn.gov.in',
      official_website: 'https://kmut.tn.gov.in',
      office_name: 'Block Development Office (BDO) GramSeva Center',
      officer_name: 'Welfare Extension Officer',
      office_address: 'Main Road, Village Block Headquarters',
      working_hours: '9:30 AM - 5:30 PM (Mon-Sat)',
      contact_number: '1800-425-1000',
      maps_location: 'https://maps.google.com/?q=BDO+Office'
    },
    application_method_ta: {
      type: 'ஆன்லைன் மற்றும் நேரில்',
      office_name: 'வட்டார வளர்ச்சி அலுவலகம் (BDO) கிராம சேவை மையம்',
      officer_name: 'சமூக நல விரிவாக்க அலுவலர்',
      office_address: 'முதன்மைச் சாலை, ஊராட்சி ஒன்றிய அலுவலகம்',
      working_hours: 'காலை 9:30 - மாலை 5:30 (திங்கள் முதல் சனி வரை)'
    },
    media: {
      poster_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      pdf_url: '#',
      brochure_url: '#',
      video_url: '#'
    },
    ai_checker_enabled: true,
    important_info: {
      faqs: [
        { question: 'Is there an age relaxation for widows?', answer: 'Yes, eligible widows above 18 years can apply with valid death certificate of spouse.' },
        { question: 'How is money transferred?', answer: 'Directly deposited into your Aadhaar-seeded bank account on the 15th of every month.' }
      ],
      terms_and_conditions: 'Applicant household annual electricity consumption must be below 3600 units.',
      helpline_number: '1800-425-1000',
      official_website: 'https://kmut.tn.gov.in',
      official_email: 'support.kmut@tn.gov.in'
    },
    important_info_ta: {
      faqs: [
        { question: 'விதவைப் பெண்களுக்கு வயது வரம்பில் சலுகை உள்ளதா?', answer: 'ஆம், கணவரின் இறப்புச் சான்றிதழுடன் 18 வயதுக்கு மேற்பட்ட தகுதியுடைய விதவைப் பெண்கள் விண்ணப்பிக்கலாம்.' },
        { question: 'பணம் எவ்வாறு வழங்கப்படும்?', answer: 'ஒவ்வொரு மாதமும் 15-ஆம் தேதி ஆதார் இணைக்கப்பட்ட உங்கள் வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்படும்.' }
      ],
      terms_and_conditions: 'குடும்பத்தின் ஆண்டு மின் நுகர்வு 3600 யூனிட்டுகளுக்குள் இருக்க வேண்டும்.'
    },
    ai_summary: 'Provides ₹1,00,00 direct monthly cash assistance to women household heads aged 21–65 with annual family income below ₹2.5 lakh.',
    ai_summary_ta: 'ஆண்டு வருமானம் ₹2.5 லட்சத்திற்குள் உள்ள 21 முதல் 65 வயதுடைய குடும்பப் பெண் தலைவர்களுக்கு மாதம் ₹1,000 நேரடி வங்கி நிதி உதவி வழங்குகிறது.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-07-25T00:00:00Z'
  },
  {
    id: 'SCH-002',
    title: 'PM Kisan Samman Nidhi Scheme',
    name: 'PM Kisan Samman Nidhi Scheme',
    title_ta: 'பிரதம மந்திரி கிசான் சம்மான் நிதி திட்டம்',
    name_ta: 'பிரதம மந்திரி கிசான் சம்மான் நிதி திட்டம்',
    category: 'Agriculture',
    category_ta: 'வேளாண்மை / விவசாயிகள்',
    type: 'Central Government',
    type_ta: 'மத்திய அரசு',
    description: 'Income support scheme for all landholding farmer families across the country to enable them to meet agricultural inputs and domestic needs.',
    description_ta: 'விவசாயிகளுக்கு விதை, உரம் போன்ற இடுபொருட்கள் வாங்குவதற்கும் மற்றும் விவசாயத் தேவைகளுக்கும் ஆண்டுக்கு ₹6,000 வழங்கும் மத்திய அரசின் நேரடி உதவித் திட்டம்.',
    benefits_list: [
      '₹6,000 Annual cash benefit in 3 equal installments of ₹2,000',
      'Direct Benefit Transfer (DBT) into bank account',
      'Subsidy on Kisan Credit Card loans'
    ],
    benefits_list_ta: [
      'ஆண்டுக்கு ₹6,000 உதவித்தொகை 3 சம தவணைகளில் (தலா ₹2,000) வங்கிக் கணக்கில் வரவு',
      'நேரடி பலன் பரிமாற்றம் (DBT) முறை',
      'கிசான் கிரெடிட் கார்டு கடன் மற்றும் மானிய முன்னுரிமை'
    ],
    benefit_details: {
      type: 'Cash Assistance',
      amount: '₹6,000',
      frequency: 'Annual'
    },
    benefit_details_ta: {
      type: 'வருமான உதவி',
      amount: '₹6,000',
      frequency: 'ஆண்டுதோறும் (3 தவணைகள்)'
    },
    launch_date: '2019-02-24',
    closing_date: '2028-12-31',
    status: 'active',
    keywords: ['farmer', 'agriculture', 'kisan', '6000', 'pmkisan', 'crop', 'landholder', 'fertilizer', 'subsidy'],
    keywords_ta: ['விவசாயி', 'விவசாயம்', 'விவசாயிகளுக்கான', 'கிசான்', 'வேளாண்', 'உழவர்', '6000', 'பயிர்', 'விதை மானியம்'],
    eligibility: {
      min_age: 18,
      max_age: 80,
      gender: 'All',
      occupation: ['Farmer', 'Agricultural Labourer'],
      income_range: ['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000', '₹2,50,000 – ₹5,00,000'],
      land_ownership: 'Agricultural',
      disability: 'Any'
    },
    eligibility_summary_ta: 'விவசாய நிலம் வைத்துள்ள சிறு மற்றும் குறு விவசாயிகள். ஆதார் மற்றும் நிலப் பட்டா விவரங்கள் கட்டாயம்.',
    required_documents: ['Aadhaar Card', 'Land Document (Patta/Chitta)', 'Bank Passbook', 'Farmer Certificate'],
    required_documents_ta: ['ஆதார் அட்டை', 'நில ஆவணங்கள் (பட்டா / சிட்டா)', 'வங்கி கணக்குப் புத்தகம்', 'விவசாயி அடையாளச் சான்று'],
    application_method: {
      type: 'Online',
      online_url: 'https://pmkisan.gov.in',
      official_website: 'https://pmkisan.gov.in'
    },
    application_method_ta: {
      type: 'ஆன்லைன் தளம் மற்றும் இ-சேவை மையம்',
      office_name: 'வேளாண்மை உதவி இயக்குநர் அலுவலகம் / இ-சேவை மையம்'
    },
    media: {
      poster_url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
      pdf_url: '#'
    },
    ai_checker_enabled: true,
    important_info: {
      faqs: [
        { question: 'Is e-KYC mandatory for PM Kisan?', answer: 'Yes, mandatory Aadhaar e-KYC must be completed via OTP or bio-metric authentication.' }
      ],
      helpline_number: '155261 / 011-24300606',
      official_website: 'https://pmkisan.gov.in'
    },
    important_info_ta: {
      faqs: [
        { question: 'PM கிசான் திட்டத்திற்கு e-KYC அவசியமா?', answer: 'ஆம், தவணைத் தொகையைப் பெற பயோமெட்ரிக் அல்லது OTP மூலமான e-KYC பதிவு கட்டாயமாகும்.' }
      ]
    },
    ai_summary: 'Provides ₹6,000 annual direct income support in 3 installments to landholding farmer families with cultivable land.',
    ai_summary_ta: 'விவசாய நிலம் வைத்துள்ள விவசாயக் குடும்பங்களுக்கு ஆண்டுக்கு ₹6,000 (3 தவணைகளில் தலா ₹2,000) நேரடி வங்கி ஆதரவு வழங்குகிறது.',
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-07-25T00:00:00Z'
  },
  {
    id: 'SCH-003',
    title: 'Moovalur Ramamirtham Ammaiyar Higher Education Scheme (Pudhumai Penn)',
    name: 'Moovalur Ramamirtham Ammaiyar Higher Education Scheme (Pudhumai Penn)',
    title_ta: 'மூவலூர் ராமாமிர்தம் அம்மையார் உயர்கல்வி உறுதித் திட்டம் (புதுமைப் பெண்)',
    name_ta: 'மூவலூர் ராமாமிர்தம் அம்மையார் உயர்கல்வி உறுதித் திட்டம் (புதுமைப் பெண்)',
    category: 'Student Scholarship',
    category_ta: 'மாணவர் கல்வி உதவித்தொகை',
    type: 'State Government',
    type_ta: 'மாநில அரசு',
    description: 'Financial assistance of ₹1,000 per month for female students who studied from Class 6 to 12 in Government schools and are now pursuing higher education.',
    description_ta: 'அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை படித்து உயர்கல்வி பயிலும் மாணவிகளுக்கு பட்டப்படிப்பு முடியும் வரை மாதம் ₹1,000 உதவித்தொகை வழங்கும் தமிழ்நாடு அரசுத் திட்டம்.',
    benefits_list: [
      '₹1,000 Monthly cash stipend throughout degree completion',
      'Free Laptop scheme priority',
      'Career counseling and internship support'
    ],
    benefits_list_ta: [
      'பட்டப்படிப்பு முடியும் வரை மாதம் ₹1,000 உதவித்தொகை',
      'இலவச மடிக்கணினி திட்ட முன்னுரிமை',
      'தொழில் வழிகாட்டுதல் மற்றும் வேலைவாய்ப்பு பயிற்சி'
    ],
    benefit_details: {
      type: 'Scholarship',
      amount: '₹1,000',
      frequency: 'Monthly'
    },
    benefit_details_ta: {
      type: 'கல்வி உதவித்தொகை',
      amount: '₹1,000',
      frequency: 'மாதந்தோறும்'
    },
    launch_date: '2022-09-05',
    closing_date: '2027-06-30',
    status: 'active',
    keywords: ['student', 'scholarship', 'pudhumai penn', 'girl student', 'higher education', 'college', '1000', 'degree', 'government school'],
    keywords_ta: ['மாணவர்', 'மாணவி', 'மாணவர்களுக்கான', 'கல்வி', 'உதவித்தொகை', 'புதுமைப் பெண்', 'கல்லூரி', 'பட்டப்படிப்பு', 'அரசுப் பள்ளி'],
    eligibility: {
      min_age: 17,
      max_age: 25,
      gender: 'Female',
      occupation: ['Student'],
      education: ['Undergraduate', 'Diploma', 'Postgraduate'],
      income_range: ['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000', '₹2,50,000 – ₹5,00,000']
    },
    eligibility_summary_ta: '6 முதல் 12-ஆம் வகுப்பு வரை அரசுப் பள்ளிகளில் பயின்று தற்போது கல்லூரி / பாலிடெக்னிக் பட்டப்படிப்பு பயிலும் மாணவிகள்.',
    required_documents: ['Aadhaar Card', 'School Transfer Certificate (6-12 Govt School)', 'College ID & Bonafide Certificate', 'Bank Passbook'],
    required_documents_ta: ['ஆதார் அட்டை', 'பள்ளி மாற்றுச் சான்றிதழ் (6-12 அரசுப் பள்ளி படிப்புக்கான சான்று)', 'கல்லூரி அடையாள அட்டை மற்றும் உண்மைச் சான்றிதழ்', 'வங்கி கணக்குப் புத்தகம்'],
    application_method: {
      type: 'Online',
      online_url: 'https://penkalvi.tn.gov.in',
      official_website: 'https://penkalvi.tn.gov.in'
    },
    application_method_ta: {
      type: 'கல்லூரி வழியாக ஆன்லைன் பதிவு',
      office_name: 'அந்தந்தக் கல்லூரி முதல்வர் அலுவலகம் / பெண் கல்வி தளம்'
    },
    media: {
      poster_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
    },
    ai_checker_enabled: true,
    important_info: {
      faqs: [
        { question: 'Can private college students apply?', answer: 'Yes, provided the student completed schooling (6th-12th) in a Tamil Nadu Government school.' }
      ],
      helpline_number: '1800-425-0111'
    },
    important_info_ta: {
      faqs: [
        { question: 'தனியார் கல்லூரியில் படிப்பவர்கள் விண்ணப்பிக்கலாமா?', answer: 'ஆம், 6 முதல் 12-ஆம் வகுப்பு வரை தமிழ்நாடு அரசுப் பள்ளியில் படித்திருந்தால் தனியார் கல்லூரிகளில் பயிலும் மாணவிகளும் தகுதியுடையவர்கள்.' }
      ]
    },
    ai_summary: 'Grants ₹1,000 monthly financial aid to female students pursuing higher education who studied in government schools from Class 6 to 12.',
    ai_summary_ta: 'அரசுப் பள்ளியில் 6-12 படித்த மாணவிகள் உயர்கல்வி தொடர மாதம் ₹1,000 நிதி உதவி வழங்குகிறது.',
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-07-25T00:00:00Z'
  },
  {
    id: 'SCH-004',
    title: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    name: 'Pradhan Mantri Awas Yojana - Gramin',
    title_ta: 'பிரதம மந்திரி ஆவாஸ் யோஜனா - கிராமப்புற வீட்டுவசதித் திட்டம்',
    name_ta: 'பிரதம மந்திரி ஆவாஸ் யோஜனா - கிராமப்புற வீட்டுவசதித் திட்டம்',
    category: 'Housing',
    category_ta: 'வீட்டுவசதி',
    type: 'Central Government',
    type_ta: 'மத்திய அரசு',
    description: 'Financial grant for homeless families and households living in kutcha or dilapidated houses in rural areas to construct permanent pucca houses with sanitation facilities.',
    description_ta: 'கிராமப்புறங்களில் வீடற்ற அல்லது குடிசை வீடுகளில் வசிக்கும் ஏழைக் குடும்பங்களுக்கு கான்கிரீட் நிரந்தர வீடு கட்ட ₹1.20 லட்சம் முதல் ₹2.40 லட்சம் வரை அரசு மானியம் வழங்கும் திட்டம்.',
    benefits_list: [
      'Financial assistance up to ₹1,20,000 in plains and ₹1,30,000 in hilly areas',
      'Additional 90 days of unskilled wage support under MGNREGS (approx. ₹27,000)',
      '₹12,000 incentive for constructing household toilet under Swachh Bharat'
    ],
    benefits_list_ta: [
      'சமவெளிப் பகுதிகளில் வீடு கட்ட ₹1,20,000 மற்றும் மலைப்பகுதிகளுக்கு ₹1,30,000 நேரடி மானியம்',
      'மகாத்மா காந்தி ஊரக வேலைவாய்ப்புத் திட்டத்தின் கீழ் 90 நாட்கள் ஊதியம் (சுமார் ₹27,000)',
      'கழிப்பறை கட்ட தூய்மை பாரதத் திட்டம் கீழ் கூடுதல் ₹12,000 மானியம்'
    ],
    benefit_details: {
      type: 'Housing Grant',
      amount: 'Up to ₹2,40,000',
      frequency: 'Staged Installments'
    },
    benefit_details_ta: {
      type: 'வீட்டு மானியம்',
      amount: '₹2,40,000 வரை',
      frequency: 'கட்டுமான நிலை தவணைகள்'
    },
    launch_date: '2016-11-20',
    closing_date: '2028-12-31',
    status: 'active',
    keywords: ['housing', 'awas', 'house', 'pucca', 'pmay', 'home', 'rural shelter', 'roof'],
    keywords_ta: ['வீடு', 'வீட்டுவசதி', 'வீட்டுமனை', 'ஆவாஸ்', 'குடிசை மாற்று', 'கான்கிரீட் வீடு', 'நிரந்தர வீடு'],
    eligibility: {
      min_age: 18,
      max_age: 75,
      gender: 'All',
      income_range: ['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000'],
      land_ownership: 'Residential'
    },
    eligibility_summary_ta: 'கிராமப்புறங்களில் சொந்த நிலம் இருந்து நிரந்தர வீடற்ற குடும்பங்கள் அல்லது குடிசை வீடுகளில் வசிப்பவர்கள்.',
    required_documents: ['Aadhaar Card', 'Ration Card / BPL Card', 'Land Patta or Ownership Document', 'Bank Passbook', 'MGNREGA Job Card'],
    required_documents_ta: ['ஆதார் அட்டை', 'குடும்ப அட்டை (ரேஷன் கார்டு)', 'வீட்டுமனைப் பட்டா அல்லது நில உரிமை ஆவணம்', 'வங்கி கணக்குப் புத்தகம்', '100 நாள் வேலை அட்டை'],
    application_method: {
      type: 'Offline',
      official_website: 'https://pmayg.nic.in',
      office_name: 'Village Panchayat Office / Block Development Office (BDO)',
      working_hours: '10:00 AM - 5:00 PM'
    },
    application_method_ta: {
      type: 'ஊராட்சி செயலர் / BDO அலுவலகம் வழியாக',
      office_name: 'கிராம ஊராட்சி அலுவலகம் / வட்டார வளர்ச்சி அலுவலகம் (BDO)'
    },
    media: {
      poster_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'
    },
    ai_checker_enabled: true,
    important_info: {
      faqs: [
        { question: 'Who approves the house grant?', answer: 'The Gram Sabha verifies the SECC beneficiary list and the BDO sanctions the funds.' }
      ],
      helpline_number: '1800-11-6446'
    },
    important_info_ta: {
      faqs: [
        { question: 'வீட்டு மானியத்தை அனுமதிப்பது யார்?', answer: 'கிராம சபை மூலம் தகுதியுள்ள பயனாளிகள் பட்டியல் சரிபார்க்கப்பட்டு, வட்டார வளர்ச்சி அலுவலரால் (BDO) நிதி ஒப்பளிக்கப்படுகிறது.' }
      ]
    },
    ai_summary: 'Grants up to ₹2.4 Lakh combined housing subsidy for rural families living without pucca shelters.',
    ai_summary_ta: 'நிரந்தர வீடற்ற கிராமப்புற ஏழைக் குடும்பங்களுக்கு வீடு கட்ட ₹2.4 லட்சம் வரை ஒருங்கிணைந்த மானியம் வழங்குகிறது.',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-07-25T00:00:00Z'
  },
  {
    id: 'SCH-005',
    title: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS / Ayushman Bharat)",
    name: "Chief Minister's Comprehensive Health Insurance Scheme",
    title_ta: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS)',
    name_ta: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS)',
    category: 'Health',
    category_ta: 'சுகாதாரம் / மருத்துவம்',
    type: 'State Government',
    type_ta: 'மாநில அரசு',
    description: 'Cashless hospitalisation coverage up to ₹5,00,000 per family per year across empannelled government and private hospitals in Tamil Nadu.',
    description_ta: 'தமிழ்நாட்டில் உள்ள அனைத்து தகுதியுடைய குடும்பங்களுக்கும் ஆண்டுக்கு ₹5,00,000 வரை கட்டணமில்லா மருத்துவச் சிகிச்சை மற்றும் அறுவை சிகிச்சைகளை வழங்கும் முதலமைச்சரின் விரிவான காப்பீட்டுத் திட்டம்.',
    benefits_list: [
      'Cashless hospital coverage up to ₹5 Lakh per year for the entire family',
      'Over 1,900 medical procedures and surgeries covered',
      'Accepted across 1,600+ government and private network hospitals'
    ],
    benefits_list_ta: [
      'குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா மருத்துவ சிகிச்சை',
      '1,900-க்கும் மேற்பட்ட அறுவை சிகிச்சைகள் மற்றும் நோய்களுக்கான இலவச சிகிச்சை',
      '1,600-க்கும் மேற்பட்ட அரசு மற்றும் தனியார் மருத்துவமனைகளில் பணமில்லா சிகிச்சை'
    ],
    benefit_details: {
      type: 'Health Insurance',
      amount: '₹5,00,000 / year',
      frequency: 'Annual Cashless Cover'
    },
    benefit_details_ta: {
      type: 'மருத்துவக் காப்பீடு',
      amount: '₹5,00,000 / ஆண்டுக்கு',
      frequency: 'பணமில்லா மருத்துவ சிகிச்சை'
    },
    launch_date: '2012-01-11',
    closing_date: '2030-12-31',
    status: 'active',
    keywords: ['health', 'insurance', 'hospital', 'medical', 'ayushman', 'cmchis', 'surgery', 'cashless', 'doctor'],
    keywords_ta: ['மருத்துவம்', 'சுகாதாரம்', 'காப்பீடு', 'மருத்துவமனை', 'இலவச சிகிச்சை', 'முதலமைச்சர் காப்பீடு', 'ஆயுஷ்மான்'],
    eligibility: {
      min_age: 0,
      max_age: 100,
      gender: 'All',
      income_range: ['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000']
    },
    eligibility_summary_ta: 'ஆண்டு வருமானம் ₹1,20,000-க்குள் உள்ள குடும்பங்கள் (ரேஷன் அட்டைதாரர்கள்).',
    required_documents: ['Smart Ration Card', 'Aadhaar Card of all family members', 'Income Certificate issued by VAO/Tahsildar'],
    required_documents_ta: ['ஸ்மார்ட் குடும்ப அட்டை (ரேஷன் கார்டு)', 'குடும்ப உறுப்பினர்களின் ஆதார் அட்டைகள்', 'வருமானச் சான்றிதழ்'],
    application_method: {
      type: 'Both',
      online_url: 'https://cmchistn.com',
      official_website: 'https://cmchistn.com',
      office_name: 'District Collectorate CMCHIS Kiosk / Taluk Office',
      contact_number: '1800-425-3993'
    },
    application_method_ta: {
      type: 'மாவட்ட ஆட்சியர் அலுவலகம் / இ-சேவை மையம்',
      office_name: 'மாவட்ட ஆட்சியரகம் CMCHIS மையம் / வட்டாட்சியர் அலுவலகம்',
      contact_number: '1800-425-3993'
    },
    media: {
      poster_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
    },
    ai_checker_enabled: true,
    important_info: {
      faqs: [
        { question: 'Is prior enrollment required during medical emergency?', answer: 'During sudden accidents, emergency coverage can be processed directly at network hospitals via emergency token.' }
      ],
      helpline_number: '1800-425-3993'
    },
    important_info_ta: {
      faqs: [
        { question: 'அவசர சிகிச்சையின் போது உடனடி அனுமதி கிடைக்குமா?', answer: 'ஆம், விபத்து மற்றும் அவசர சிகிச்சையின் போது அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் அவசர டோக்கன் மூலம் உடனடியாகச் சேர்க்கப்படலாம்.' }
      ]
    },
    ai_summary: 'Provides ₹5,00,000 annual cashless health and surgical cover for eligible rural and urban families.',
    ai_summary_ta: 'தகுதியுடைய குடும்பங்களுக்கு ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா மருத்துவ சிகிச்சைகளை வழங்குகிறது.',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-07-25T00:00:00Z'
  },
  {
    id: 'SCH-006',
    title: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
    name: 'Indira Gandhi National Old Age Pension Scheme',
    title_ta: 'இந்திரா காந்தி தேசிய முதியோர் ஓய்வூதியத் திட்டம் (OAP)',
    name_ta: 'இந்திரா காந்தி தேசிய முதியோர் ஓய்வூதியத் திட்டம் (OAP)',
    category: 'Pension',
    category_ta: 'ஓய்வூதியம்',
    type: 'State Government',
    type_ta: 'மாநில அரசு / மத்திய அரசு',
    description: 'Monthly social security financial pension of ₹1,000 directly credited to senior citizens aged 60 and above living below poverty line.',
    description_ta: 'வறுமைக் கோட்டிற்கு கீழ் வாழும் 60 வயது மற்றும் அதற்கு மேற்பட்ட முதியவர்களுக்கு மாதாந்திர சமூகப் பாதுகாப்பு ஓய்வூதியமாக ₹1,000 வழங்கும் அரசுத் திட்டம்.',
    benefits_list: [
      '₹1,000 Direct monthly pension into bank account',
      'Free distribution of 2 sarees / dhotis during Pongal and Diwali',
      'Free public transport bus pass quota for eligible seniors'
    ],
    benefits_list_ta: [
      'மாதந்தோறும் ₹1,000 முதியோர் ஓய்வூதியம் நேரடியாக வங்கிக் கணக்கில் வரவு',
      'பொங்கல் மற்றும் தீபாவளி பண்டிகைகளின் போது இலவச வேட்டி / சேலை',
      'அரசுப் பேருந்துகளில் இலவச பயணச் சலுகை'
    ],
    benefit_details: {
      type: 'Pension',
      amount: '₹1,000',
      frequency: 'Monthly'
    },
    benefit_details_ta: {
      type: 'முதியோர் ஓய்வூதியம்',
      amount: '₹1,000',
      frequency: 'மாதந்தோறும்'
    },
    launch_date: '2007-11-19',
    closing_date: '2030-12-31',
    status: 'active',
    keywords: ['pension', 'old age', 'oap', 'senior citizen', 'elderly', 'monthly aid', 'ignaps', 'retiree'],
    keywords_ta: ['ஓய்வூதியம்', 'முதியோர்', 'முதியவர்களுக்கான', 'முதியோர் ஓய்வூதியம்', 'வயதானவர்கள்', '1000', 'பென்ஷன்'],
    eligibility: {
      min_age: 60,
      max_age: 100,
      gender: 'All',
      income_range: ['Below ₹1,00,000']
    },
    eligibility_summary_ta: '60 வயதுக்கு மேற்பட்ட, வருமானம் இல்லாத அல்லது வறுமைக்கோட்டிற்கு கீழ் உள்ள முதியவர்கள்.',
    required_documents: ['Aadhaar Card', 'Age Proof Certificate', 'BPL Ration Card', 'Bank Passbook'],
    required_documents_ta: ['ஆதார் அட்டை', 'வயது சான்றிதழ்', 'வறுமைக்கோட்டு குடும்ப அட்டை', 'வங்கி கணக்குப் புத்தகம்'],
    application_method: {
      type: 'Both',
      online_url: 'https://edistricts.tn.gov.in',
      office_name: 'Taluk Office / Village Administrative Officer (VAO)',
      working_hours: '10:00 AM - 5:00 PM'
    },
    application_method_ta: {
      type: 'இ-சேவை மையம் அல்லது VAO அலுவலகம்',
      office_name: 'கிராம நிர்வாக அலுவலர் (VAO) / வட்டாட்சியர் அலுவலகம்'
    },
    media: {
      poster_url: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80'
    },
    ai_checker_enabled: true,
    important_info: {
      faqs: [
        { question: 'What is the minimum age to apply?', answer: 'Applicant must have completed 60 years of age.' }
      ],
      helpline_number: '1800-425-1000'
    },
    important_info_ta: {
      faqs: [
        { question: 'விண்ணப்பிக்க குறைந்தபட்ச வயது என்ன?', answer: 'விண்ணப்பதாரர் 60 வயது பூர்த்தியடைந்திருக்க வேண்டும்.' }
      ]
    },
    ai_summary: 'Provides ₹1,000 monthly social security pension for BPL senior citizens aged 60 and above.',
    ai_summary_ta: '60 வயது மற்றும் அதற்கு மேற்பட்ட முதியவர்களுக்கு மாதம் ₹1,000 ஓய்வூதியம் வழங்குகிறது.',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-07-25T00:00:00Z'
  }
]

const SCHEME_STORAGE_KEY = 'gramseva_scheme_database_v3'

export function getStoredSchemes(): SchemeRecord[] {
  if (typeof window === 'undefined') return INITIAL_SCHEMES
  try {
    const raw = localStorage.getItem(SCHEME_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(INITIAL_SCHEMES))
      return INITIAL_SCHEMES
    }
    const parsed: SchemeRecord[] = JSON.parse(raw)
    
    // Automatically merge with INITIAL_SCHEMES to ensure official Tamil translations are always present
    const merged = parsed.map(stored => {
      const initialMatch = INITIAL_SCHEMES.find(i => i.id === stored.id)
      if (initialMatch) {
        return {
          ...stored,
          title_ta: stored.title_ta || initialMatch.title_ta,
          name_ta: stored.name_ta || initialMatch.name_ta,
          category_ta: stored.category_ta || initialMatch.category_ta,
          type_ta: stored.type_ta || initialMatch.type_ta,
          description_ta: stored.description_ta || initialMatch.description_ta,
          benefits_list_ta: stored.benefits_list_ta || initialMatch.benefits_list_ta,
          benefit_details_ta: stored.benefit_details_ta || initialMatch.benefit_details_ta,
          keywords_ta: stored.keywords_ta || initialMatch.keywords_ta,
          keywords: stored.keywords || initialMatch.keywords,
          eligibility_summary_ta: stored.eligibility_summary_ta || initialMatch.eligibility_summary_ta,
          required_documents_ta: stored.required_documents_ta || initialMatch.required_documents_ta,
          important_info_ta: stored.important_info_ta || initialMatch.important_info_ta,
          ai_summary_ta: stored.ai_summary_ta || initialMatch.ai_summary_ta,
        }
      }
      return stored
    })

    // Also include any initial schemes that are not in stored list
    INITIAL_SCHEMES.forEach(initScheme => {
      if (!merged.some(m => m.id === initScheme.id)) {
        merged.push(initScheme)
      }
    })

    return merged
  } catch {
    return INITIAL_SCHEMES
  }
}

export function saveStoredSchemes(schemes: SchemeRecord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(schemes))
  } catch (err) {
    console.error('Failed to save schemes to localStorage:', err)
  }
  window.dispatchEvent(new CustomEvent('gramseva_scheme_db_updated'))
}

export function getLatestSchemes(limit: number = 4): SchemeRecord[] {
  const schemes = getStoredSchemes().filter(s => s.status !== 'draft')
  schemes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return schemes.slice(0, limit)
}

export function saveScheme(schemeData: Partial<SchemeRecord>): SchemeRecord {
  const schemes = getStoredSchemes()
  const now = new Date().toISOString()
  
  let newScheme: SchemeRecord
  if (schemeData.id) {
    const idx = schemes.findIndex(s => s.id === schemeData.id)
    if (idx !== -1) {
      newScheme = {
        ...schemes[idx],
        ...schemeData,
        updated_at: now,
      } as SchemeRecord
      schemes[idx] = newScheme
    } else {
      newScheme = {
        ...INITIAL_SCHEMES[0],
        ...schemeData,
        id: schemeData.id,
        created_at: now,
        updated_at: now,
      } as SchemeRecord
      schemes.unshift(newScheme)
    }
  } else {
    const id = `SCH-${Date.now().toString().slice(-4)}`
    newScheme = {
      id,
      title: schemeData.title || schemeData.name || 'New Welfare Scheme',
      name: schemeData.title || schemeData.name || 'New Welfare Scheme',
      title_ta: schemeData.title_ta || schemeData.name_ta || 'புதிய அரசு நலத்திட்டம்',
      category: schemeData.category || 'Women Empowerment',
      category_ta: schemeData.category_ta || 'மகளிர் நலம்',
      type: schemeData.type || 'State Government',
      type_ta: schemeData.type_ta || 'மாநில அரசு',
      description: schemeData.description || '',
      description_ta: schemeData.description_ta || '',
      benefits_list: schemeData.benefits_list || [],
      benefits_list_ta: schemeData.benefits_list_ta || [],
      benefit_details: schemeData.benefit_details || { type: 'Subsidy', amount: '₹5,000', frequency: 'One-time' },
      launch_date: schemeData.launch_date || new Date().toISOString().split('T')[0],
      closing_date: schemeData.closing_date || '2027-12-31',
      status: schemeData.status || 'active',
      eligibility: schemeData.eligibility || { gender: 'All' },
      required_documents: schemeData.required_documents || ['Aadhaar Card', 'Ration Card'],
      required_documents_ta: schemeData.required_documents_ta || ['ஆதார் அட்டை', 'ரேஷன் அட்டை'],
      application_method: schemeData.application_method || { type: 'Online' },
      media: schemeData.media || {},
      ai_checker_enabled: schemeData.ai_checker_enabled ?? true,
      important_info: schemeData.important_info || { faqs: [] },
      ai_summary: schemeData.ai_summary || '',
      created_at: now,
      updated_at: now,
    }
    schemes.unshift(newScheme)
  }

  saveStoredSchemes(schemes)

  // Trigger automated notification event for eligible residents
  if (typeof window !== 'undefined') {
    const notification = {
      id: `NOTIF-${Date.now()}`,
      title: `🎉 New Government Scheme Published: ${newScheme.title}`,
      message: `The BDO Admin has deployed "${newScheme.title}". Check your eligibility now!`,
      date: new Date().toLocaleString(),
      type: 'scheme',
      scheme_id: newScheme.id
    }
    const notifs = JSON.parse(localStorage.getItem('gramseva_notifications') || '[]')
    notifs.unshift(notification)
    localStorage.setItem('gramseva_notifications', JSON.stringify(notifs))
  }

  return newScheme
}

export function updateSchemeStatus(id: string, status: SchemeRecord['status']): SchemeRecord | null {
  const schemes = getStoredSchemes()
  const idx = schemes.findIndex(s => s.id === id)
  if (idx !== -1) {
    schemes[idx] = {
      ...schemes[idx],
      status,
      updated_at: new Date().toISOString()
    }
    saveStoredSchemes(schemes)

    if (typeof window !== 'undefined') {
      const isLive = status === 'active' || status === 'published'
      const notification = {
        id: `NOTIF-${Date.now()}`,
        title: isLive 
          ? `🟢 Scheme Now Live: ${schemes[idx].title}` 
          : `⏳ Scheme Upcoming: ${schemes[idx].title}`,
        message: isLive 
          ? `"${schemes[idx].title}" is now officially open for applications.` 
          : `"${schemes[idx].title}" has been scheduled as an upcoming scheme.`,
        date: new Date().toLocaleString(),
        type: 'scheme',
        scheme_id: id
      }
      const notifs = JSON.parse(localStorage.getItem('gramseva_notifications') || '[]')
      notifs.unshift(notification)
      localStorage.setItem('gramseva_notifications', JSON.stringify(notifs))
    }

    return schemes[idx]
  }
  return null
}

export function deleteScheme(id: string): boolean {
  const schemes = getStoredSchemes()
  const filtered = schemes.filter(s => s.id !== id)
  if (filtered.length !== schemes.length) {
    saveStoredSchemes(filtered)
    return true
  }
  return false
}

// ─── TARGET BENEFICIARY ESTIMATOR ──────────────────────────────────────────────
export function estimateTargetBeneficiaries(eligibility: SchemeRecord['eligibility']) {
  const residents = getStoredResidents()
  let count = 0

  residents.forEach(res => {
    let eligible = true
    const age = res.age ?? 0

    if (eligibility.min_age !== undefined && age < eligibility.min_age) eligible = false
    if (eligibility.max_age !== undefined && age > eligibility.max_age) eligible = false

    if (eligibility.gender && eligibility.gender !== 'All') {
      if (res.gender !== eligibility.gender) eligible = false
    }

    if (eligibility.occupation && eligibility.occupation.length > 0 && !eligibility.occupation.includes('Any')) {
      if (!res.occupation || !eligibility.occupation.includes(res.occupation)) eligible = false
    }

    if (eligibility.education && eligibility.education.length > 0 && !eligibility.education.includes('Any')) {
      if (!res.education || !eligibility.education.includes(res.education)) eligible = false
    }

    if (eligibility.land_ownership && eligibility.land_ownership !== 'Any') {
      if (res.land_ownership !== eligibility.land_ownership) eligible = false
    }

    if (eligible) count++
  })

  return count
}

// ─── RESIDENT ELIGIBILITY EVALUATOR ──────────────────────────────────────────
export function evaluateResidentEligibility(scheme: SchemeRecord, resident: ResidentRecord) {
  const rules = []
  let passedCount = 0
  const totalCount = 4

  const age = resident.age ?? 0
  const minAge = scheme.eligibility.min_age ?? 0
  const maxAge = scheme.eligibility.max_age ?? 100
  const ageMatch = age >= minAge && age <= maxAge

  rules.push({
    title: 'Age Requirement',
    expected: `${minAge} – ${maxAge} years`,
    actual: `${age} years`,
    passed: ageMatch,
    reason: ageMatch ? 'Age is within required limits' : `Age ${age} does not meet ${minAge}-${maxAge}`
  })
  if (ageMatch) passedCount++

  const requiredGender = scheme.eligibility.gender ?? 'All'
  const genderMatch = requiredGender === 'All' || resident.gender === requiredGender
  rules.push({
    title: 'Gender Requirement',
    expected: requiredGender,
    actual: resident.gender ?? 'Not Specified',
    passed: genderMatch,
    reason: genderMatch ? 'Gender criteria met' : `Requires ${requiredGender}`
  })
  if (genderMatch) passedCount++

  const allowedOccupations = scheme.eligibility.occupation ?? ['Any']
  const occMatch = allowedOccupations.includes('Any') || (resident.occupation && allowedOccupations.includes(resident.occupation))
  rules.push({
    title: 'Occupation Requirement',
    expected: allowedOccupations.join(', '),
    actual: resident.occupation ?? 'General',
    passed: !!occMatch,
    reason: occMatch ? 'Occupation eligible' : 'Occupation does not match required categories'
  })
  if (occMatch) passedCount++

  const landReq = scheme.eligibility.land_ownership ?? 'Any'
  const landMatch = landReq === 'Any' || resident.land_ownership === landReq
  rules.push({
    title: 'Land Requirement',
    expected: landReq,
    actual: resident.land_ownership ?? 'Not Specified',
    passed: landMatch,
    reason: landMatch ? 'Land criteria met' : `Requires ${landReq}`
  })
  if (landMatch) passedCount++

  const score = Math.round((passedCount / totalCount) * 100)
  const isEligible = score >= 75

  return {
    isEligible,
    matchScore: score,
    criteria: rules,
    summary: isEligible
      ? `Eligible! Your profile meets ${passedCount} of ${totalCount} key criteria.`
      : `Partially eligible (${score}% match). Check criteria requirements before applying.`
  }
}
