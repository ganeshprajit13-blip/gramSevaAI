/**
 * GramSeva AI Knowledge Engine
 * Provides instant, accurate government scheme guidance and recommendations
 * for Tamil Nadu and Central Government welfare schemes in English and Tamil.
 */

export interface SchemeInfo {
  name: string
  nameTa: string
  category: string
  categoryTa: string
  department: string
  description: string
  descriptionTa: string
  benefits: string
  benefitsTa: string
  eligibility: string
  eligibilityTa: string
  documents: string[]
  documentsTa: string[]
  applicationProcess: string
  applicationProcessTa: string
  office: string
  officeTa: string
}

export const TN_GOVT_SCHEMES: SchemeInfo[] = [
  {
    name: 'Kalaignar Magalir Urimai Thittam',
    nameTa: 'கலைஞர் மகளிர் உரிமைத் திட்டம்',
    category: 'Women Empowerment',
    categoryTa: 'மகளிர் முன்னேற்றம்',
    department: 'Social Welfare & Women Empowerment Dept, Govt of Tamil Nadu',
    description: 'Monthly direct financial support of ₹1,000 provided to eligible women heads of families across Tamil Nadu.',
    descriptionTa: 'தமிழ்நாட்டில் உள்ள தகுதியான குடும்பத் தலைவிகளுக்கு மாதந்தோறும் ₹1,000 நேரடி வங்கிப் பரிமாற்றம் மூலம் வழங்கப்படும் திட்டம்.',
    benefits: '₹1,000 per month credited directly to the bank account via Aadhaar-enabled payment system.',
    benefitsTa: 'மாதம் ₹1,000 தகுதியான பெண்களின் வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்படுகிறது.',
    eligibility: 'Women family head aged 21 to 65 years. Annual household income below ₹2.5 Lakhs. Family electricity consumption under 3,600 units/year. Wetland ownership less than 5 acres or dryland less than 10 acres.',
    eligibilityTa: '21 முதல் 65 வயது வரையிலான பெண் குடும்பத் தலைவிகள். குடும்ப ஆண்டு வருமானம் ₹2.5 லட்சத்திற்குள் இருக்க வேண்டும். மின் பயன்பாடு ஆண்டுக்கு 3,600 யூனிட்டுக்குள் இருக்க வேண்டும். நஞ்சை நிலம் 5 ஏக்கர் அல்லது புஞ்சை நிலம் 10 ஏக்கருக்குள் இருக்க வேண்டும்.',
    documents: [
      'Smart Family Ration Card',
      'Aadhaar Card of the woman applicant',
      'Bank Account Passbook (linked with Aadhaar)',
      'Electricity Bill / Consumer Number',
    ],
    documentsTa: [
      'ஸ்மார்ட் குடும்ப அட்டை (ரேஷன் கார்டு)',
      'விண்ணப்பதாரரின் ஆதார் அட்டை',
      'ஆதாருடன் இணைக்கப்பட்ட வங்கிக் கணக்கு புத்தகம்',
      'மின் கட்டண ரசீது / நுகர்வோர் எண்',
    ],
    applicationProcess: 'Apply during designated Special Camps or visit your local e-Sevai Centre / Block Development Office (BDO). Appeals for rejected applications can be submitted online at kmut.tn.gov.in or through the Revenue Divisional Officer (RDO).',
    applicationProcessTa: 'சிறப்பு முகாம்கள் அல்லது உங்கள் அருகிலுள்ள இ-சேவை மையம் / வட்டார வளர்ச்சி அலுவலகம் (BDO) மூலம் விண்ணப்பிக்கலாம். நிராகரிக்கப்பட்ட விண்ணப்பங்களுக்கு kmut.tn.gov.in இணையதளம் அல்லது கோட்டாட்சியர் (RDO) அலுவலகத்தில் மேல்முறையீடு செய்யலாம்.',
    office: 'Block Development Office (BDO) / Taluk Office / e-Sevai Centre',
    officeTa: 'வட்டார வளர்ச்சி அலுவலகம் (BDO) / வட்டாட்சியர் அலுவலகம் / இ-சேவை மையம்',
  },
  {
    name: 'PM Kisan Samman Nidhi Yojana',
    nameTa: 'பிரதம மந்திரி கிசான் சம்மான் நிதி திட்டம்',
    category: 'Agriculture & Farmers',
    categoryTa: 'விவசாயம் & உழவர் நலன்',
    department: 'Ministry of Agriculture and Farmers Welfare, Govt of India',
    description: 'Income support of ₹6,000 per year in three equal installments of ₹2,000 to all landholding farmer families.',
    descriptionTa: 'விவசாய நிலம் வைத்துள்ள விவசாய குடும்பங்களுக்கு ஆண்டுக்கு ₹6,000 நிதி உதவி, மூன்று தவணைகளில் (தவணைக்கு ₹2,000) வழங்கப்படும் திட்டம்.',
    benefits: '₹6,000 annually credited directly to bank account in 3 tranches of ₹2,000 (April-July, August-November, December-March).',
    benefitsTa: 'ஆண்டுக்கு ₹6,000 நேரடி வங்கிப் பரிமாற்றம் மூலம் 4 மாதங்களுக்கு ஒருமுறை ₹2,000 வீதம் 3 தவணைகளாக வழங்கப்படுகிறது.',
    eligibility: 'Small and marginal farmer families with cultivable landholding in their name.',
    eligibilityTa: 'சொந்த பெயரில் சாகுபடி செய்யக்கூடிய விவசாய நிலம் வைத்திருக்கும் அனைத்து சிறு மற்றும் குறு விவசாயிகள்.',
    documents: [
      'Aadhaar Card',
      'Land Record / Patta / Chitta',
      'Aadhaar-seeded Bank Account with NPCI mapping',
      'Valid Mobile Number for OTP',
    ],
    documentsTa: [
      'ஆதார் அட்டை',
      'நில உரிமை ஆவணம் / பட்டா / சிட்டா',
      'NPCI இணைக்கப்பட்ட ஆதார் வங்கிக் கணக்கு',
      'OTP சரிபார்ப்புக்கான செல்போன் எண்',
    ],
    applicationProcess: 'Register on pmkisan.gov.in portal under "New Farmer Registration" or visit nearest e-Sevai Centre or Block Agricultural Extension Office.',
    applicationProcessTa: 'pmkisan.gov.in இணையதளத்தில் "New Farmer Registration" மூலம் அல்லது அருகிலுள்ள இ-சேவை மையம் / வட்டார வேளாண்மை உதவி இயக்குநர் அலுவலகத்தில் பதிவு செய்யலாம்.',
    office: 'Block Agriculture Extension Office / e-Sevai Centre',
    officeTa: 'வட்டார வேளாண்மை விரிவாக்க மையம் / இ-சேவை மையம்',
  },
  {
    name: 'Moovalur Ramamirtham Ammaiyar Higher Education Scheme (Pudhumai Penn)',
    nameTa: 'புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார் உயர் கல்வித் திட்டம்)',
    category: 'Student Scholarship',
    categoryTa: 'மாணவர் கல்வி உதவித்தொகை',
    department: 'Social Welfare & Women Empowerment Dept, Govt of Tamil Nadu',
    description: 'Financial assistance of ₹1,000 per month for female students who studied Classes 6 to 12 in Tamil Nadu Government Schools pursuing UG degrees, diplomas, or ITI courses.',
    descriptionTa: 'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை பயின்று கல்லூரிப் படிப்பைத் தொடரும் மாணவிகளுக்கு மாதம் ₹1,000 உதவித்தொகை வழங்கும் திட்டம்.',
    benefits: '₹1,000 credited every month into student’s bank account until completion of undergraduate course/diploma.',
    benefitsTa: 'பட்டப்படிப்பு அல்லது டிப்ளமோ படிப்பு முடியும் வரை மாணவியின் வங்கிக் கணக்கில் மாதம் ₹1,000 செலுத்தப்படும்.',
    eligibility: 'Girl students who studied in Tamil Nadu Government Schools from 6th to 12th standard and joined higher education in recognised colleges/institutions.',
    eligibilityTa: 'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12 வரை படித்த மாணவிகள், அரசு அங்கீகாரம் பெற்ற கல்லூரிகளில் இளநிலைப் பட்டம்/டிப்ளமோ/ITI படிப்பவர்கள்.',
    documents: [
      'Aadhaar Card',
      'School Transfer Certificate (TC) / Proof of 6th-12th Govt schooling',
      'College Admission ID & Fee Receipt',
      'Bank Account Passbook (Student’s own account)',
    ],
    documentsTa: [
      'மாணவியின் ஆதார் அட்டை',
      'பள்ளி மாற்றுச் சான்றிதழ் (TC) / 6-12 அரசுப் பள்ளி சான்றிதழ்',
      'கல்லூரி சேர்க்கை அடையாள அட்டை / கட்டண ரசீது',
      'மாணவியின் வங்கிக் கணக்குப் புத்தகம்',
    ],
    applicationProcess: 'Apply through your College Nodal Officer via penkalvi.tn.gov.in portal during college admission.',
    applicationProcessTa: 'கல்லூரி சேர்க்கையின் போது கல்லூரி ஒருங்கிணைப்பாளர் (Nodal Officer) மூலம் penkalvi.tn.gov.in இணையதளத்தில் விண்ணப்பிக்கலாம்.',
    office: 'College Nodal Officer / Directorate of Social Welfare',
    officeTa: 'கல்லூரி ஒருங்கிணைப்பு அலுவலர் / சமூக நலத்துறை அலுவலகம்',
  },
  {
    name: 'Chief Minister Comprehensive Health Insurance Scheme (CMCHIS)',
    nameTa: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்',
    category: 'Healthcare',
    categoryTa: 'மருத்துவம் & நல்வாழ்வு',
    department: 'Health and Family Welfare Dept, Govt of Tamil Nadu',
    description: 'Provides cashless medical treatment and hospitalisation up to ₹5,00,000 per family per year in empanelled government and private hospitals.',
    descriptionTa: 'அரசு மற்றும் தனியார் அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் ஒரு குடும்பத்திற்கு ஆண்டுக்கு ₹5,00,000 வரை கட்டணமில்லா பணமில்லா சிகிச்சை வழங்கும் திட்டம்.',
    benefits: 'Cashless hospitalisation coverage up to ₹5,00,000/year for 1,000+ medical and surgical procedures.',
    benefitsTa: '1,000-க்கும் மேற்பட்ட அறுவை சிகிச்சைகள் மற்றும் நோய்களுக்கு ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா சிகிச்சை.',
    eligibility: 'Resident families of Tamil Nadu holding Smart Ration Card with annual income below ₹1,20,000.',
    eligibilityTa: 'தமிழ்நாட்டில் வசிக்கும் ஸ்மார்ட் குடும்ப அட்டை உள்ளவர்கள், ஆண்டு குடும்ப வருமானம் ₹1,20,000-க்குள் உள்ள குடும்பங்கள்.',
    documents: [
      'Smart Family Ration Card',
      'Income Certificate issued by VAO / Tahsildar (annual income < ₹1.2L)',
      'Aadhaar Cards of all family members',
    ],
    documentsTa: [
      'ஸ்மார்ட் குடும்ப அட்டை',
      'வருமானச் சான்றிதழ் (ஆண்டு வருமானம் ₹1.2 லட்சத்திற்குள்)',
      'குடும்ப உறுப்பினர்கள் அனைவரின் ஆதார் அட்டை',
    ],
    applicationProcess: 'Visit District Collectorate CMCHIS Kiosk or Taluk Office with required documents to get the CMCHIS Smart Card.',
    applicationProcessTa: 'மாவட்ட ஆட்சியர் அலுவலகத்தில் உள்ள CMCHIS மையம் அல்லது தாலுகா அலுவலகத்திற்குச் சென்று ஸ்மார்ட் அட்டை பெற்றுக் கொள்ளலாம்.',
    office: 'District Collectorate CMCHIS Kiosk / Taluk Office',
    officeTa: 'மாவட்ட ஆட்சியர் அலுவலக CMCHIS மையம் / வட்டாட்சியர் அலுவலகம்',
  },
  {
    name: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    nameTa: 'பிரதம மந்திரி ஆவாஸ் யோஜனா - கிராமின் (வீட்டு வசதி திட்டம்)',
    category: 'Housing',
    categoryTa: 'வீட்டு வசதி',
    department: 'Rural Development and Panchayat Raj, Govt of Tamil Nadu & Govt of India',
    description: 'Financial assistance for construction of pucca houses with basic amenities for rural houseless families.',
    descriptionTa: 'கிராமப்புறங்களில் சொந்தமாக கான்கிரீட் வீடு இல்லாத ஏழை எளிய குடும்பங்களுக்கு புதிய கான்கிரீட் வீடு கட்ட நிதி உதவி வழங்கும் திட்டம்.',
    benefits: 'Financial assistance of up to ₹2,77,000 (Central + State share + MGNREGS 90 days labor + Toilet incentive).',
    benefitsTa: 'மத்திய மற்றும் மாநில அரசு நிதி, 90 நாட்கள் 100 நாள் வேலை ஊதியம் மற்றும் கழிப்பறை மானியம் உட்பட ₹2.77 லட்சம் வரை உதவித்தொகை.',
    eligibility: 'Rural households without permanent housing, selected based on SECC 2011 / Grama Sabha beneficiary list.',
    eligibilityTa: 'கிராமப்புறங்களில் நிரந்தர கான்கிரீட் வீடு இல்லாத, கிராம சபை ஒப்புதல் பெற்ற தகுதியான பயனாளிகள்.',
    documents: [
      'Aadhaar Card & Smart Ration Card',
      'Land Ownership Document / Patta / House Site Patta',
      'Bank Account Passbook',
      'MGNREGS Job Card',
    ],
    documentsTa: [
      'ஆதார் அட்டை & ஸ்மார்ட் குடும்ப அட்டை',
      'வீட்டுமனை பட்டா / நில உரிமை ஆவணம்',
      'வங்கிக் கணக்குப் புத்தகம்',
      '100 நாள் வேலை அட்டை (MGNREGS Job Card)',
    ],
    applicationProcess: 'Apply through your Village Panchayat Secretary or Block Development Officer (BDO - Village Panchayats).',
    applicationProcessTa: 'உங்கள் கிராம ஊராட்சி செயலாளர் அல்லது வட்டார வளர்ச்சி அலுவலர் (BDO) மூலம் விண்ணப்பிக்கலாம்.',
    office: 'Block Development Office (BDO) / Village Panchayat Office',
    officeTa: 'வட்டார வளர்ச்சி அலுவலகம் (BDO) / கிராம ஊராட்சி மன்ற அலுவலகம்',
  },
  {
    name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
    nameTa: 'முதியோர் உதவித்தொகை திட்டம் (OAP)',
    category: 'Social Security',
    categoryTa: 'சமூகப் பாதுகாப்பு',
    department: 'Revenue and Disaster Management Dept, Govt of Tamil Nadu',
    description: 'Monthly financial assistance to senior citizens aged 60 and above living below poverty line without family support.',
    descriptionTa: 'வறுமைக் கோட்டிற்கு கீழ் வாழும் 60 வயதுக்கு மேற்பட்ட ஆதரவற்ற முதியவர்களுக்கு மாதந்தோறும் நிதி உதவி வழங்கும் திட்டம்.',
    benefits: '₹1,200 per month credited directly to bank account or postal savings account + Free Rice & festive dhotis/sarees.',
    benefitsTa: 'மாதந்தோறும் ₹1,200 உதவித்தொகை நேரடி வங்கி/அஞ்சலகக் கணக்கில் வரவு + இலவச அரிசி & வேட்டி, சேலை.',
    eligibility: 'Senior citizens aged 60 years and above, living below poverty line, with no regular earning family support.',
    eligibilityTa: '60 வயது மற்றும் அதற்கு மேற்பட்ட ஆதரவற்ற முதியவர்கள், வருமானம் இல்லாதவர்கள்.',
    documents: [
      'Aadhaar Card (Age proof)',
      'Smart Family Ration Card',
      'Income Certificate (from VAO / Revenue Inspector)',
      'Bank / Post Office Passbook',
    ],
    documentsTa: [
      'ஆதார் அட்டை (வயது சான்று)',
      'ஸ்மார்ட் ரேஷன் கார்டு',
      'வருமானச் சான்றிதழ் (VAO / RI சான்றிதழ்)',
      'வங்கி அல்லது அஞ்சலக சேமிப்புக் கணக்கு புத்தகம்',
    ],
    applicationProcess: 'Submit application via TN e-Sevai centre (tnesevai.tn.gov.in) or to the Special Tahsildar (Social Security Schemes) at Taluk Office.',
    applicationProcessTa: 'இ-சேவை மையம் மூலம் அல்லது தாலுகா அலுவலகத்தில் உள்ள சமூகப் பாதுகாப்புத் திட்ட தனி வட்டாட்சியரிடம் விண்ணப்பிக்கலாம்.',
    office: 'Taluk Office (Social Security Scheme Wing) / e-Sevai Centre',
    officeTa: 'வட்டாட்சியர் அலுவலகம் (சமூகப் பாதுகாப்பு பிரிவு) / இ-சேவை மையம்',
  }
]

/**
 * Generates an intelligent, human-like response based on user input.
 */
export function generateSmartGuidance(query: string, language: 'en' | 'ta' = 'en'): string {
  const q = query.toLowerCase().trim()

  // 1. Greetings
  const isGreeting = ['hi', 'hello', 'hey', 'வணக்கம்', 'vanakkam', 'namaste', 'greetings', 'help', 'ஹலோ'].some(
    (greet) => q === greet || q.startsWith(greet + ' ') || q.endsWith(' ' + greet)
  )

  if (isGreeting && q.length < 20) {
    if (language === 'ta') {
      return `வணக்கம்! **கிராம சேவா AI (GramSeva AI)** குடிமக்கள் உதவி மையத்திற்கு வரவேற்கிறோம்.

நான் தமிழ்நாடு மற்றும் மத்திய அரசு நலத்திட்டங்களுக்கான உங்கள் டிஜிட்டல் வழிகாட்டி.

உங்களுக்கு உதவக்கூடிய முக்கிய சேவைகள்:
- 🌾 **விவசாயம் & உழவர் நலன்**: PM கிசான், பயிர்க் காப்பீடு, உழவர் பாதுகாப்பு, சொட்டு நீர் பாசன மானியம்
- 👩 **மகளிர் முன்னேற்றம்**: கலைஞர் மகளிர் உரிமைத் திட்டம் (மாதம் ₹1,000), புதுமைப் பெண் திட்டம்
- 🎓 **கல்வி & மாணவர்கள்**: உயர் கல்வி உதவித்தொகை, தமிழ்ப் புதல்வன் திட்டம், இலவச மடிக்கணினி
- 🏠 **வீட்டு வசதி**: பிரதம மந்திரி ஆவாஸ் யோஜனா (PMAY), கலைஞரின் கனவு இல்லம்
- 🏥 **மருத்துவம்**: முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS - ₹5 லட்சம்)
- 👵 **முதியோர் & மாற்றுத்திறனாளிகள்**: முதியோர் உதவித்தொகை (OAP), விதவை உதவித்தொகை
- 📑 **சான்றிதழ்கள் & அலுவலகங்கள்**: பட்டா/சிட்டா, வட்டார வளர்ச்சி அலுவலகம் (BDO) மற்றும் இ-சேவை சேவைகள்

இன்று உங்களுக்கு எந்த அரசுத் திட்டம் அல்லது சான்றிதழ் பற்றிய தகவல் தேவைப்படுகிறது? கீழே உங்கள் கேள்வியைக் கேட்கலாம்.`
    }

    return `Hello! Welcome to **GramSeva AI** — Citizen Welfare & Government Schemes Advisor.

I am here to guide you through Tamil Nadu and Central Government welfare schemes, eligibility rules, required documents, and office application procedures.

**Key Assistance Areas:**
- 🌾 **Agriculture & Farmers**: PM Kisan (₹6,000/yr), Uzhavar Pathukappu, Crop Insurance, Drip Irrigation Subsidies
- 👩 **Women Empowerment**: Kalaignar Magalir Urimai Thittam (₹1,000/month), Pudhumai Penn
- 🎓 **Education & Students**: Higher Education Scholarships, Tamil Pudhalvan Scheme
- 🏠 **Housing**: Pradhan Mantri Awas Yojana (PMAY-Gramin), Kalaignar Kanavu Illam
- 🏥 **Healthcare**: CMCHIS (₹5 Lakhs cashless treatment per year)
- 👵 **Pensions**: Old Age Pension (OAP), Destitute Widow Pension, Disability Support
- 🏛️ **Offices & Documents**: Block Development Office (BDO), Taluk Office, Patta/Chitta, TN e-Sevai

How can I help you today? Ask any question about a scheme or required documents.`
  }

  // 2. Check for specific schemes
  if (q.includes('magalir') || q.includes('மகளிர்') || q.includes('kalaignar') || q.includes('urimai') || q.includes('1000') || q.includes('women')) {
    const s = TN_GOVT_SCHEMES[0]
    if (language === 'ta') {
      return `### 👩 ${s.nameTa} (${s.name})

**திட்ட விளக்கம்:**
${s.descriptionTa}

**பெறக்கூடிய நன்மைகள்:**
- ${s.benefitsTa}

**தகுதி வரம்புகள்:**
${s.eligibilityTa}

**தேவையான ஆவணங்கள்:**
${s.documentsTa.map((d) => `- ✅ ${d}`).join('\n')}

**விண்ணப்பிக்கும் முறை & அலுவலகம்:**
- **எங்கு விண்ணப்பிக்க வேண்டும்**: ${s.applicationProcessTa}
- **முக்கிய அலுவலகம்**: ${s.officeTa}

💡 *குறிப்பு: உங்கள் விண்ணப்பம் நிராகரிக்கப்பட்டிருந்தால், kmut.tn.gov.in தளத்தில் மேல்முறையீடு செய்யலாம் அல்லது கோட்டாட்சியர் (RDO) அலுவலகத்தை அணுகலாம்.*`
    }

    return `### 👩 ${s.name}

**Description:**
${s.description}

**Key Benefits:**
- ${s.benefits}

**Eligibility Criteria:**
${s.eligibility}

**Required Documents:**
${s.documents.map((d) => `- ✅ ${d}`).join('\n')}

**How to Apply:**
- **Process**: ${s.applicationProcess}
- **Designated Office**: ${s.office}

💡 *Tip: If your application was rejected or on hold, you can file an appeal online at kmut.tn.gov.in or directly visit the Revenue Divisional Office (RDO).*`
  }

  if (q.includes('kisan') || q.includes('farmer') || q.includes('விவசாயி') || q.includes('agriculture') || q.includes('பயிர்') || q.includes('உழவர்')) {
    const s = TN_GOVT_SCHEMES[1]
    if (language === 'ta') {
      return `### 🌾 ${s.nameTa} (${s.name})

**திட்ட விளக்கம்:**
${s.descriptionTa}

**பெறக்கூடிய நன்மைகள்:**
- ${s.benefitsTa}

**தகுதி வரம்புகள்:**
${s.eligibilityTa}

**தேவையான ஆவணங்கள்:**
${s.documentsTa.map((d) => `- ✅ ${d}`).join('\n')}

**விண்ணப்பிக்கும் முறை & அலுவலகம்:**
- **எங்கு விண்ணப்பிக்க வேண்டும்**: ${s.applicationProcessTa}
- **முக்கிய அலுவலகம்**: ${s.officeTa}

💡 *முக்கிய ஆலோசனை: தவணை தொகை தொடர்ந்து கிடைக்க உங்கள் வங்கிக் கணக்கில் ஆதார் மற்றும் e-KYC சரிபார்ப்பு செய்திருப்பது அவசியமாகும்.*`
    }

    return `### 🌾 ${s.name}

**Description:**
${s.description}

**Key Benefits:**
- ${s.benefits}

**Eligibility Criteria:**
${s.eligibility}

**Required Documents:**
${s.documents.map((d) => `- ✅ ${d}`).join('\n')}

**How to Apply:**
- **Process**: ${s.applicationProcess}
- **Designated Office**: ${s.office}

💡 *Important Tip: Ensure your bank account has active NPCI Aadhaar linking and complete your biometric or OTP e-KYC on pmkisan.gov.in.*`
  }

  if (q.includes('pudhumai') || q.includes('penn') || q.includes('புதுமை') || q.includes('scholarship') || q.includes('student') || q.includes('கல்வி') || q.includes('மாணவர்')) {
    const s = TN_GOVT_SCHEMES[2]
    if (language === 'ta') {
      return `### 🎓 ${s.nameTa}

**திட்ட விளக்கம்:**
${s.descriptionTa}

**பெறக்கூடிய நன்மைகள்:**
- ${s.benefitsTa}

**தகுதி வரம்புகள்:**
${s.eligibilityTa}

**தேவையான ஆவணங்கள்:**
${s.documentsTa.map((d) => `- ✅ ${d}`).join('\n')}

**விண்ணப்பிக்கும் முறை:**
- **விண்ணப்ப நடைமுறை**: ${s.applicationProcessTa}
- **அலுவலகம்**: ${s.officeTa}

💡 *மாணவர்களுக்கான கூடுதல் திட்டம்: அரசுப் பள்ளிகளில் படித்து கல்லூரி செல்லும் மாணவர்களுக்கு மாதம் ₹1,000 வழங்கும் "தமிழ்ப் புதல்வன் திட்டம்" நடைமுறையில் உள்ளது.*`
    }

    return `### 🎓 ${s.name}

**Description:**
${s.description}

**Key Benefits:**
- ${s.benefits}

**Eligibility Criteria:**
${s.eligibility}

**Required Documents:**
${s.documents.map((d) => `- ✅ ${d}`).join('\n')}

**How to Apply:**
- **Application Process**: ${s.applicationProcess}
- **Designated Contact**: ${s.office}

💡 *Note for Male Students: The Government of Tamil Nadu has also launched the "Tamil Pudhalvan Scheme" offering ₹1,000/month for male students from government schools entering higher education.*`
  }

  if (q.includes('health') || q.includes('medical') || q.includes('insurance') || q.includes('மருத்துவம்') || q.includes('காப்பீடு') || q.includes('cmchis')) {
    const s = TN_GOVT_SCHEMES[3]
    if (language === 'ta') {
      return `### 🏥 ${s.nameTa} (${s.name})

**திட்ட விளக்கம்:**
${s.descriptionTa}

**பெறக்கூடிய நன்மைகள்:**
- ${s.benefitsTa}

**தகுதி வரம்புகள்:**
${s.eligibilityTa}

**தேவையான ஆவணங்கள்:**
${s.documentsTa.map((d) => `- ✅ ${d}`).join('\n')}

**விண்ணப்பிக்கும் முறை:**
- **நடைமுறை**: ${s.applicationProcessTa}
- **அலுவலகம்**: ${s.officeTa}`
    }

    return `### 🏥 ${s.name}

**Description:**
${s.description}

**Key Benefits:**
- ${s.benefits}

**Eligibility Criteria:**
${s.eligibility}

**Required Documents:**
${s.documents.map((d) => `- ✅ ${d}`).join('\n')}

**How to Apply:**
- **Application Process**: ${s.applicationProcess}
- **Designated Office**: ${s.office}`
  }

  if (q.includes('house') || q.includes('pmay') || q.includes('housing') || q.includes('வீடு') || q.includes('ஆவாஸ்') || q.includes('கனவு இல்லம்')) {
    const s = TN_GOVT_SCHEMES[4]
    if (language === 'ta') {
      return `### 🏠 ${s.nameTa} (${s.name})

**திட்ட விளக்கம்:**
${s.descriptionTa}

**பெறக்கூடிய நன்மைகள்:**
- ${s.benefitsTa}

**தகுதி வரம்புகள்:**
${s.eligibilityTa}

**தேவையான ஆவணங்கள்:**
${s.documentsTa.map((d) => `- ✅ ${d}`).join('\n')}

**விண்ணப்பிக்கும் முறை:**
- **நடைமுறை**: ${s.applicationProcessTa}
- **அலுவலகம்**: ${s.officeTa}`
    }

    return `### 🏠 ${s.name}

**Description:**
${s.description}

**Key Benefits:**
- ${s.benefits}

**Eligibility Criteria:**
${s.eligibility}

**Required Documents:**
${s.documents.map((d) => `- ✅ ${d}`).join('\n')}

**How to Apply:**
- **Application Process**: ${s.applicationProcess}
- **Designated Office**: ${s.office}`
  }

  if (q.includes('pension') || q.includes('old age') || q.includes('widow') || q.includes('முதியோர்') || q.includes('விதவை') || q.includes('உதவித்தொகை') || q.includes('oap')) {
    const s = TN_GOVT_SCHEMES[5]
    if (language === 'ta') {
      return `### 👵 ${s.nameTa} (${s.name})

**திட்ட விளக்கம்:**
${s.descriptionTa}

**பெறக்கூடிய நன்மைகள்:**
- ${s.benefitsTa}

**தகுதி வரம்புகள்:**
${s.eligibilityTa}

**தேவையான ஆவணங்கள்:**
${s.documentsTa.map((d) => `- ✅ ${d}`).join('\n')}

**விண்ணப்பிக்கும் முறை:**
- **நடைமுறை**: ${s.applicationProcessTa}
- **அலுவலகம்**: ${s.officeTa}`
    }

    return `### 👵 ${s.name}

**Description:**
${s.description}

**Key Benefits:**
- ${s.benefits}

**Eligibility Criteria:**
${s.eligibility}

**Required Documents:**
${s.documents.map((d) => `- ✅ ${d}`).join('\n')}

**How to Apply:**
- **Application Process**: ${s.applicationProcess}
- **Designated Office**: ${s.office}`
  }

  // 3. General Government Guidance
  if (language === 'ta') {
    return `### 🏛️ அரசு நலத்திட்ட வழிகாட்டி (GramSeva Citizen Guidance)

உங்கள் கேள்வி: **"${query}"**

தமிழ்நாடு அரசு மற்றும் மத்திய அரசின் முக்கிய திட்டங்கள் மற்றும் சேவைகளுக்கான பொதுவான வழிகாட்டுதல்:

#### 1. 📋 பொதுவான தகுதி & சான்றிதழ்கள்
- **வருமான வரம்பு**: பெரும்பாலான திட்டங்களுக்கு குடும்ப ஆண்டு வருமானம் ₹2.5 லட்சத்திற்குள் இருக்க வேண்டும் (மருத்துவக் காப்பீட்டிற்கு ₹1.2 லட்சம்).
- **சான்றிதழ்கள்**: வருமானச் சான்றிதழ், சாதிச் சான்றிதழ், இருப்பிடச் சான்றிதழ் ஆகியவற்றை இ-சேவை மையங்களில் (tnesevai.tn.gov.in) பெறலாம்.

#### 2. 📑 விண்ணப்பிக்கத் தேவையான பொது ஆவணங்கள்
- ✅ ஆதார் அட்டை (அனைத்து குடும்ப உறுப்பினர்களுக்கும்)
- ✅ ஸ்மார்ட் குடும்ப அட்டை (Ration Card)
- ✅ ஆதாருடன் இணைக்கப்பட்ட வங்கிக் கணக்கு புத்தகம்
- ✅ நில உடமை ஆவணங்கள் (பட்டா/சிட்டா - விவசாயத் திட்டங்களுக்கு)

#### 3. 🏛️ அணுக வேண்டிய அரசு அலுவலகங்கள்
- **கிராம அளவில்**: கிராம நிர்வாக அலுவலர் (VAO) மற்றும் கிராம ஊராட்சி செயலர்
- **வட்டார அளவில்**: வட்டார வளர்ச்சி அலுவலகம் (BDO Office) மற்றும் வேளாண்மை விரிவாக்க மையம்
- **தாலுகா அளவில்**: வட்டாட்சியர் அலுவலகம் (Taluk Office)

மேலும் குறிப்பிட்ட திட்டம் குறித்து அறிய, திட்டத்தின் பெயரைத் தட்டச்சு செய்து கேட்கவும் (எ.கா: "மகளிர் உரிமைத் திட்டம்", "PM கிசான்", "வீட்டு வசதி திட்டம்").`
  }

  return `### 🏛️ GramSeva Citizen Advisory

Your query: **"${query}"**

Here is comprehensive guidance regarding Government Welfare Schemes and Citizen Services in Tamil Nadu:

#### 1. 📋 Eligibility Overview
- **Income Ceiling**: Most social welfare schemes require an annual family income under ₹2,50,000 (₹1,20,000 for CMCHIS healthcare).
- **Essential Certificates**: Income Certificate, Community Certificate, and Nativity Certificate can be applied via TN e-Sevai centres or online at tnesevai.tn.gov.in.

#### 2. 📑 Mandatory Documents Checklist
- ✅ Aadhaar Card of applicant and family members
- ✅ Smart Family Ration Card
- ✅ Aadhaar-linked Bank Passbook (NPCI mapped for Direct Benefit Transfer)
- ✅ Land Records (Patta / Chitta for agricultural schemes)

#### 3. 🏛️ Key Offices to Visit
- **Village Level**: Village Administrative Officer (VAO) & Village Panchayat Secretary
- **Block Level**: Block Development Office (BDO) & Agricultural Extension Office
- **Taluk Level**: Taluk Office (Tahsildar / Social Security Schemes Wing)

To get detailed instructions on any specific scheme, type its name (e.g. *"Kalaignar Magalir Urimai"*, *"PM Kisan"*, *"PMAY Housing"*).`
}

/**
 * Generates personalized scheme recommendations based on profile attributes.
 */
export function generateSmartRecommendations(profile: any, language: 'en' | 'ta' = 'en'): string {
  const isFarmer = profile.farmer_status || (profile.occupation && /farmer|agri|விவசாய/i.test(profile.occupation))
  const isFemale = profile.gender && /female|woman|பெண்/i.test(profile.gender)
  const isSenior = (profile.age && Number(profile.age) >= 60)
  const income = Number(profile.annual_income) || 180000
  const name = profile.name || (language === 'ta' ? 'குடிமகன்' : 'Resident')

  if (language === 'ta') {
    let text = `### 🌟 குடிமக்கள் நலத்திட்டப் பரிந்துரைகள் (AI Scheme Recommendations)

**குடிமகன் விவரம்:** ${name} | வயது: ${profile.age ?? 38} | தொழில்: ${profile.occupation ?? 'விவசாயி'} | வருமானம்: ₹${income.toLocaleString('en-IN')}

---

#### 1. 🏆 மிகவும் பரிந்துரைக்கப்படும் திட்டம் (Highly Recommended)
`
    if (isFarmer) {
      text += `**🌾 PM கிசான் சம்மான் நிதி திட்டம் & தமிழ்நாடு உழவர் பாதுகாப்புத் திட்டம்**
- **காரணம்**: நீங்கள் விவசாயத் தொழிலில் ஈடுபட்டுள்ளதால், ஆண்டுக்கு ₹6,000 நேரடி உதவித்தொகை மற்றும் பயிர்க் காப்பீடு மானியம் பெற முழுத் தகுதி பெற்றுள்ளீர்கள்.
- **நன்மைகள்**: ₹6,000 நேரடி வங்கிப் பரிமாற்றம் + 50% உழவு இயந்திரம்/உர மானியம்.
- **அடுத்த நடவடிக்கை**: அருகிலுள்ள வட்டார வேளாண்மை அலுவலகம் அல்லது இ-சேவை மையம் மூலம் பட்டா மற்றும் ஆதார் சமர்ப்பிக்கவும்.

`
    } else if (isFemale) {
      text += `**👩 கலைஞர் மகளிர் உரிமைத் திட்டம் (KMUT)**
- **காரணம்**: தகுதியான பெண் குடும்பத் தலைவிகளுக்கு அரசு வழங்கும் உரிமைத் தொகைக்கு உங்கள் வருமான வரம்பு (< ₹2.5L) பொருந்துகிறது.
- **நன்மைகள்**: மாதம் ₹1,000 நேரடி வங்கிப் பரிமாற்றம் (ஆண்டுக்கு ₹12,000).
- **அடுத்த நடவடிக்கை**: ஸ்மார்ட் ரேஷன் கார்டு மற்றும் ஆதாருடன் இ-சேவை மையத்தில் விண்ணப்பிக்கவும்.

`
    } else if (isSenior) {
      text += `**👵 முதியோர் உதவித்தொகை திட்டம் (IGNOAPS - OAP)**
- **காரணம்**: உங்கள் வயது 60-க்கு மேல் உள்ளதால் அரசு சமூகப் பாதுகாப்பு உதவித்தொகைக்கு தகுதியுடையவர்.
- **நன்மைகள்**: மாதம் ₹1,200 உதவித்தொகை + இலவச ரேஷன் அரிசி.
- **அடுத்த நடவடிக்கை**: VAO வருமானச் சான்றிதழுடன் தாலுகா அலுவலகத்தில் விண்ணப்பிக்கவும்.

`
    } else {
      text += `**🏥 முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS)**
- **காரணம்**: உங்கள் குடும்பத்திற்கு மருத்துவச் செலவுகளிலிருந்து ₹5 லட்சம் வரை முழுப் பாதுகாப்பு அளிக்கிறது.
- **நன்மைகள்**: 1,000-க்கும் மேற்பட்ட அரசு மற்றும் தனியார் மருத்துவமனைகளில் ₹5,00,000 வரை இலவச சிகிச்சை.
- **அடுத்த நடவடிக்கை**: ரேஷன் கார்டுடன் மாவட்ட ஆட்சியர் அலுவலகம் அல்லது தாலுகா அலுவலகத்தில் ஸ்மார்ட் கார்டு பெறவும்.

`
    }

    text += `#### 2. ✨ பரிந்துரைக்கப்படும் கூடுதல் திட்டங்கள் (Recommended)
`
    if (!isFemale) {
      text += `**👩 குடும்ப பெண்களுக்கான புதுமைப் பெண் / மகளிர் நலத்திட்டங்கள்**
- உங்கள் குடும்பத்தில் உள்ள மாணவிகள் அரசுப் பள்ளியில் படித்து கல்லூரி சேர்ந்தால் மாதம் ₹1,000 பெற முடியும்.
`
    }
    text += `**🏠 பிரதம மந்திரி ஆவாஸ் யோஜனா (PMAY - கிராமின்)**
- சொந்தமாக கான்கிரீட் வீடு இல்லாத பட்சத்தில், புதிய வீடு கட்ட ₹2.77 லட்சம் வரை அரசு மானியம் பெறலாம்.
- விண்ணப்பிக்க: கிராம ஊராட்சி செயலர் அல்லது BDO அலுவலகத்தை அணுகவும்.

**🏥 முதலமைச்சரின் காப்பீட்டு அட்டை (CMCHIS)**
- குடும்ப உறுப்பினர்கள் அனைவருக்கும் ஆண்டுக்கு ₹5 லட்சம் மருத்துவ உதவி.

---
💡 *உதவிக்கு உங்கள் வட்டார வளர்ச்சி அலுவலகம் (BDO) அல்லது கிராம இ-சேவை மையத்தை நேரில் அணுகவும்.*`

    return text
  }

  // English
  let text = `### 🌟 Personalized AI Scheme Recommendations

**Resident Profile:** ${name} | Age: ${profile.age ?? 38} | Occupation: ${profile.occupation ?? 'Farmer'} | Income: ₹${income.toLocaleString('en-IN')}

---

#### 1. 🏆 Highly Recommended Scheme
`
  if (isFarmer) {
    text += `**🌾 PM Kisan Samman Nidhi & TN Uzhavar Pathukappu Thittam**
- **Match Reason**: As an active agricultural worker/farmer with qualifying family income, you are eligible for direct annual income support.
- **Direct Benefit**: ₹6,000 per year directly in bank account + crop insurance & farm equipment subsidies.
- **Next Step**: Visit your local Block Agricultural Extension Office or e-Sevai Centre with Land Patta and Aadhaar.

`
  } else if (isFemale) {
    text += `**👩 Kalaignar Magalir Urimai Thittam (KMUT)**
- **Match Reason**: Eligible woman head of family with annual income below ₹2.5 Lakhs.
- **Direct Benefit**: ₹1,000 credited per month (₹12,000 annually) directly to bank account.
- **Next Step**: Submit your Smart Ration card and Aadhaar at the local e-Sevai centre.

`
  } else if (isSenior) {
    text += `**👵 Indira Gandhi National Old Age Pension Scheme (IGNOAPS)**
- **Match Reason**: Senior citizen aged 60+ within rural low-income criteria.
- **Direct Benefit**: ₹1,200 monthly pension + free festival clothing & rice quota.
- **Next Step**: Submit VAO report at the Taluk Office Social Welfare wing.

`
  } else {
    text += `**🏥 Chief Minister Comprehensive Health Insurance Scheme (CMCHIS)**
- **Match Reason**: Full healthcare safeguard for rural households with annual family income under ₹1,20,000.
- **Direct Benefit**: Up to ₹5,00,000 cashless hospitalisation coverage per year in empanelled hospitals.
- **Next Step**: Visit the District Collectorate CMCHIS kiosk or Taluk Office.

`
  }

  text += `#### 2. ✨ Additional Matching Schemes
**🏠 Pradhan Mantri Awas Yojana (PMAY-Gramin)**
- Financial grant up to ₹2,77,000 for constructing a permanent pucca house in rural areas.
- **Contact**: Village Panchayat Secretary or Block Development Officer (BDO).

**🎓 Moovalur Ramamirtham / Pudhumai Penn & Tamil Pudhalvan**
- ₹1,000/month for college students who completed schooling in TN Government schools.
- **Contact**: College Nodal Officer via penkalvi.tn.gov.in.

---
💡 *For application support, visit your nearest Block Development Office (BDO) or Village e-Sevai Centre.*`

  return text
}
