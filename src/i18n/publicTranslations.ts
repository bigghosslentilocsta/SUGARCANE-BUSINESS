export type PublicLanguage = 'en' | 'te' | 'hi';

export const PUBLIC_LANG_STORAGE_KEY = 'mss_public_lang';

export const WHATSAPP_NUMBER = '919392457024';
export const WHATSAPP_PREDEFINED_TEXT = 'hi, can i know about your sugarcane?';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_PREDEFINED_TEXT
)}`;

export interface PublicLanguageOption {
  code: PublicLanguage;
  nativeLabel: string;
  englishLabel: string;
  subtitle: string;
}

export const LANGUAGE_OPTIONS: PublicLanguageOption[] = [
  {
    code: 'en',
    nativeLabel: 'English',
    englishLabel: 'English',
    subtitle: 'Continue in English',
  },
  {
    code: 'te',
    nativeLabel: 'తెలుగు',
    englishLabel: 'Telugu',
    subtitle: 'తెలుగులో కొనసాగండి',
  },
  {
    code: 'hi',
    nativeLabel: 'हिन्दी',
    englishLabel: 'Hindi',
    subtitle: 'हिन्दी में जारी रखें',
  },
];

export interface PublicTranslations {
  locale: string;
  brandName: string;
  languageModal: {
    eyebrow: string;
    title: string;
    description: string;
    continueDefault: string;
  };
  nav: {
    about: string;
    clients: string;
    contact: string;
    requestQuote: string;
    languageLabel: string;
    toggleMenu: string;
  };
  whatsapp: {
    cta: string;
    floatingLabel: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    imageAlt: string;
    imageFallbackSub: string;
    metrics: { value: string; label: string }[];
  };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    imageAlt: string;
    imageFallback: string;
    capabilities: { index: string; title: string; detail: string }[];
  };
  clients: {
    eyebrow: string;
    title: string;
    prevAria: string;
    nextAria: string;
    uploadedPrefix: string;
    fallbackTitle: string;
    fallbackCaption: string;
    slideCaptionsByUrl: Record<string, string>;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    addressTitle: string;
    addressLine1: string;
    addressLine2: string;
    mobileTitle: string;
    hoursTitle: string;
    hoursLine1: string;
    hoursLine2: string;
    formTitle: string;
    formSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    validationError: string;
    submitError: string;
    successMessage: string;
    submittingButton: string;
    submitButton: string;
  };
  footer: {
    addressSummary: string;
    rights: string;
    admin: string;
    portal: string;
  };
}

export const PUBLIC_TRANSLATIONS: Record<PublicLanguage, PublicTranslations> = {
  en: {
    locale: 'en-IN',
    brandName: 'Mallikarjuna Sugarcane Suppliers',
    languageModal: {
      eyebrow: 'Welcome',
      title: 'Choose Your Preferred Language',
      description:
        'Select English, Telugu, or Hindi to read our sugarcane export details and request a quote.',
      continueDefault: 'Continue in English (Default)',
    },
    nav: {
      about: 'About Us',
      clients: 'Happy Clients',
      contact: 'Contact',
      requestQuote: 'Request Quote',
      languageLabel: 'Language',
      toggleMenu: 'Toggle navigation menu',
    },
    whatsapp: {
      cta: 'Chat on WhatsApp',
      floatingLabel: 'WhatsApp Us',
    },
    hero: {
      eyebrow: 'Maharashtra & Karnataka Sugarcane Export',
      headline: 'Sweet, field-selected sugarcane supplied 12 months a year.',
      description:
        'We export sugarcane from Maharashtra and Karnataka directly to our customers. Our team visits fields in person to inspect crop quality and pick only the sweetest, finest cane for reliable year-round delivery.',
      primaryCta: 'Request Supply Quote',
      secondaryCta: 'View Supply Gallery',
      imageAlt:
        'Freshly harvested sugarcane bundles stacked inside Mallikarjuna Sugarcane Suppliers depot',
      imageFallbackSub: 'Maharashtra & Karnataka Sugarcane Export',
      metrics: [
        {
          value: '50 Active Units',
          label: 'Supplied year-round regardless of season',
        },
        {
          value: '100+ Units',
          label: 'Supported during peak seasonal demand',
        },
        {
          value: '12 Months',
          label: 'Continuous year-round supply available',
        },
        {
          value: 'MH & KA',
          label: 'Direct export from Maharashtra & Karnataka',
        },
      ],
    },
    about: {
      eyebrow: 'About Us',
      title: 'Hand-picked directly from Maharashtra & Karnataka fields.',
      description:
        'We export sugarcane from Maharashtra and Karnataka with a strict focus on sweetness and freshness. Instead of buying blind lots, we visit the fields directly to verify sugarcane quality and select the best crops for our customers all 12 months of the year.',
      imageAlt:
        'Direct field inspection of tall sweet sugarcane stalks before harvest selection',
      imageFallback: 'Direct Field Quality Inspection',
      capabilities: [
        {
          index: '01.',
          title: 'Direct Field Quality Inspection',
          detail:
            'We go directly to sugarcane farms across Maharashtra and Karnataka to inspect crop maturity, stalk quality, and natural sweetness—hand-picking only the best cane for our customers.',
        },
        {
          index: '02.',
          title: '12-Month Uninterrupted Supply to 50 Active Units',
          detail:
            'With 12 months supply available, we consistently supply 50 active units regardless of season—keeping mills, juice centers, and jaggery units stocked every single month.',
        },
        {
          index: '03.',
          title: '100+ Units Capacity in Peak Season',
          detail:
            'During seasonal harvest peaks, our procurement and dispatch operations scale smoothly to supply over 100+ active units on time with fresh, clean sugarcane loads.',
        },
      ],
    },
    clients: {
      eyebrow: 'Happy Clients',
      title: 'From our farms and depots to 50+ active units year-round.',
      prevAria: 'Previous client photo',
      nextAria: 'Next client photo',
      uploadedPrefix: 'Uploaded',
      fallbackTitle: 'Client Dispatch Gallery',
      fallbackCaption: 'Happy Clients sugarcane delivery',
      slideCaptionsByUrl: {
        '/assets/aistudio/image_5fcf53d7.png':
          'Covered Depot Stock — Clean Bundled Sugarcane Ready for Dispatch',
        '/assets/aistudio/image_6b0fe2f5.png':
          'Direct Field Inspection — Checking Stalk Height & Sweetness Before Harvest',
        '/assets/aistudio/image_535ce9fa.png':
          'Bulk Warehouse Stack — Year-Round 12-Month Supply Reserve',
        '/assets/aistudio/image_c0dbed69.png':
          'Freshly Cut Golden-Green Cane Selected from Maharashtra & Karnataka Farms',
        '/assets/aistudio/image_0c3698c9.png':
          'Trimmed High-Sweetness Cane Loaded for Customer Unit Delivery',
        '/assets/aistudio/image_ae3db5ef.png':
          'Wholesale Market Yard Supply — Supporting 50+ Active & 100+ Seasonal Units',
      },
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Schedule a bulk sugarcane supply dispatch.',
      description:
        'Whether you run one of our 50 year-round active units or need seasonal bulk shipments across 100+ unit schedules, reach out for sweet, field-selected sugarcane exported from Maharashtra and Karnataka.',
      addressTitle: 'Market & Supply Address',
      addressLine1: 'Mallikarjuna Sugarcane Suppliers, Market, Tara Nagar,',
      addressLine2: 'Lingampally, Serilingampalle (M), Telangana 500019',
      mobileTitle: 'Mobile',
      hoursTitle: 'Business Hours',
      hoursLine1: 'Monday – Saturday: 06:00 AM – 08:00 PM',
      hoursLine2: 'Crushing Season Truck Receiving: 24 Hours',
      formTitle: 'Request a Supply Quote',
      formSubtitle:
        'Share your mill or unit location and estimated weekly quantity in tons for a custom quote.',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. Suresh Deshpande',
      phoneLabel: 'Phone Number',
      phonePlaceholder: 'e.g. +91 98450 11234',
      companyLabel: 'Mill / Jaggery Unit Name (Optional)',
      companyPlaceholder: 'e.g. Shri Renuka Agro Mills',
      messageLabel: 'Supply Requirement & Delivery Location',
      messagePlaceholder:
        'Specify required tons per day, preferred cane variety, and delivery site...',
      validationError:
        'Please enter your name, phone number, and supply requirement.',
      submitError:
        'Unable to send quote request right now. Please call or WhatsApp us directly.',
      successMessage:
        'Your quote request has been received. Our team will reach out shortly.',
      submittingButton: 'Sending Quote Request...',
      submitButton: 'Submit Quote Request',
    },
    footer: {
      addressSummary:
        'Market, Tara Nagar, Lingampally, Serilingampalle (M), Telangana 500019',
      rights: 'All rights reserved.',
      admin: 'Admin',
      portal: 'Portal',
    },
  },

  te: {
    locale: 'te-IN',
    brandName: 'మల్లికార్జున చెరకు సరఫరాదారులు',
    languageModal: {
      eyebrow: 'స్వాగతం',
      title: 'మీకు కావలసిన భాషను ఎంచుకోండి',
      description:
        'మా చెరకు సరఫరా వివరాలు చూడటానికి మరియు కోట్ అడగడానికి తెలుగు, హిందీ లేదా ఇంగ్లీష్ ఎంచుకోండి.',
      continueDefault: 'ఇంగ్లీష్‌లో కొనసాగండి (డిఫాల్ట్)',
    },
    nav: {
      about: 'మా గురించి',
      clients: 'సంతోషకరమైన వినియోగదారులు',
      contact: 'సంప్రదించండి',
      requestQuote: 'కోట్ అడగండి',
      languageLabel: 'భాష',
      toggleMenu: 'నావిగేషన్ మెను మార్చండి',
    },
    whatsapp: {
      cta: 'వాట్సాప్‌లో చాట్ చేయండి',
      floatingLabel: 'వాట్సాప్',
    },
    hero: {
      eyebrow: 'మహారాష్ట్ర & కర్ణాటక చెరకు ఎగుమతి',
      headline:
        'సంవత్సరంలో 12 నెలలూ పొలంలో నేరుగా ఎంపిక చేసిన తియ్యని చెరకు సరఫరా.',
      description:
        'మేము మహారాష్ట్ర మరియు కర్ణాటక నుండి మా వినియోగదారులకు నేరుగా చెరకు ఎగుమతి చేస్తాము. మా బృందం స్వయంగా పొలాలకు వెళ్లి పంట నాణ్యతను పరిశీలించి, అత్యంత తియ్యని మరియు నాణ్యమైన చెరకును మాత్రమే ఎంపిక చేసి సంవత్సరమంతా సరఫరా చేస్తుంది.',
      primaryCta: 'సరఫరా కోట్ అడగండి',
      secondaryCta: 'సరఫరా గ్యాలరీ చూడండి',
      imageAlt:
        'మల్లికార్జున చెరకు సరఫరాదారుల డిపోలో తాజాగా కోసిన చెరకు కట్టలు',
      imageFallbackSub: 'మహారాష్ట్ర & కర్ణాటక చెరకు ఎగుమతి',
      metrics: [
        {
          value: '50 యాక్టివ్ యూనిట్లు',
          label: 'సీజన్‌తో సంబంధం లేకుండా ఏడాది పొడవునా సరఫరా',
        },
        {
          value: '100+ యూనిట్లు',
          label: 'సీజన్ డిమాండ్ సమయంలో నిరంతర సరఫరా',
        },
        {
          value: '12 నెలలు',
          label: 'సంవత్సరంలో ప్రతి నెల నిరంతర చెరకు లభ్యత',
        },
        {
          value: 'మహారాష్ట్ర & కర్ణాటక',
          label: 'పొలాల నుండి నేరుగా నాణ్యమైన చెరకు ఎగుమతి',
        },
      ],
    },
    about: {
      eyebrow: 'మా గురించి',
      title: 'మహారాష్ట్ర & కర్ణాటక పొలాల నుండి స్వయంగా ఎంపిక చేసిన చెరకు.',
      description:
        'తీపి మరియు తాజాదనానికి అత్యంత ప్రాధాన్యత ఇస్తూ మేము మహారాష్ట్ర మరియు కర్ణాటక నుండి చెరకు ఎగుమతి చేస్తాము. నేరుగా పొలాలకు వెళ్లి పంట నాణ్యతను తనిఖీ చేసి, మా వినియోగదారుల కోసం సంవత్సరంలోని 12 నెలలూ ఉత్తమమైన చెరకును ఎంపిక చేస్తాము.',
      imageAlt:
        'కోతకు ముందు పొలంలో ఎత్తైన తియ్యని చెరకు గడల నాణ్యత పరిశీలన',
      imageFallback: 'నేరుగా పొలంలో నాణ్యత తనిఖీ',
      capabilities: [
        {
          index: '01.',
          title: 'నేరుగా పొలంలో నాణ్యత తనిఖీ',
          detail:
            'మేము మహారాష్ట్ర మరియు కర్ణాటకలోని చెరకు పొలాలకు స్వయంగా వెళ్లి పంట పక్వత, గడ నాణ్యత మరియు సహజ తీపిని పరిశీలించి అత్యుత్తమ చెరకును మాత్రమే ఎంచుకుంటాము.',
        },
        {
          index: '02.',
          title: '50 యాక్టివ్ యూనిట్లకు 12 నెలలూ నిరంతర సరఫరా',
          detail:
            '12 నెలలూ చెరకు అందుబాటులో ఉండటంతో, సీజన్‌తో సంబంధం లేకుండా 50 యాక్టివ్ యూనిట్లకు—మిల్లులు, జ్యూస్ సెంటర్లు మరియు బెల్లం తయారీ కేంద్రాలకు—ప్రతి నెల నిరంతరంగా సరఫరా చేస్తాము.',
        },
        {
          index: '03.',
          title: 'సీజన్ సమయంలో 100+ యూనిట్ల సామర్థ్యం',
          detail:
            'సీజనల్ కోతల సమయంలో మా సేకరణ మరియు రవాణా వ్యవస్థ 100+ యూనిట్లకు తాజా, శుభ్రమైన చెరకు లోడ్లను సమయానికి చేరవేస్తుంది.',
        },
      ],
    },
    clients: {
      eyebrow: 'సంతోషకరమైన వినియోగదారులు',
      title:
        'మా పొలాలు మరియు డిపోల నుండి ఏడాది పొడవునా 50+ యాక్టివ్ యూనిట్లకు సరఫరా.',
      prevAria: 'మునుపటి ఫోటో',
      nextAria: 'తరువాతి ఫోటో',
      uploadedPrefix: 'అప్‌లోడ్ చేసిన తేదీ',
      fallbackTitle: 'వినియోగదారుల సరఫరా గ్యాలరీ',
      fallbackCaption: 'వినియోగదారుల చెరకు సరఫరా',
      slideCaptionsByUrl: {
        '/assets/aistudio/image_5fcf53d7.png':
          'డిపో స్టాక్ — పంపిణీకి సిద్ధంగా ఉన్న శుభ్రమైన చెరకు కట్టలు',
        '/assets/aistudio/image_6b0fe2f5.png':
          'పొలంలో ప్రత్యక్ష తనిఖీ — కోతకు ముందు గడ ఎత్తు & తీపి పరిశీలన',
        '/assets/aistudio/image_535ce9fa.png':
          'బల్క్ గోదాము నిల్వ — ఏడాది పొడవునా 12 నెలల సరఫరా రిజర్వ్',
        '/assets/aistudio/image_c0dbed69.png':
          'మహారాష్ట్ర & కర్ణాటక పొలాల నుండి తాజాగా కోసిన బంగారు-పచ్చ చెరకు',
        '/assets/aistudio/image_0c3698c9.png':
          'వినియోగదారుల యూనిట్లకు పంపడానికి సిద్ధం చేసిన తియ్యని చెరకు',
        '/assets/aistudio/image_ae3db5ef.png':
          'మార్కెట్ యార్డ్ హోల్‌సేల్ సరఫరా — 50+ యాక్టివ్ & 100+ సీజనల్ యూనిట్లకు సేవ',
      },
    },
    contact: {
      eyebrow: 'సంప్రదించండి',
      title: 'బల్క్ చెరకు సరఫరా కోసం ఇప్పుడే సంప్రదించండి.',
      description:
        'మీరు మా 50 శాశ్వత యూనిట్లలో ఒకటైనా లేదా సీజన్‌లో 100+ యూనిట్ల షెడ్యూల్‌కు బల్క్ లోడ్లు కావాలన్నా, మహారాష్ట్ర మరియు కర్ణాటక నుండి తియ్యని, పొలంలో ఎంపిక చేసిన చెరకు కోసం మమ్మల్ని సంప్రదించండి.',
      addressTitle: 'మార్కెట్ & సరఫరా చిరునామా',
      addressLine1: 'మల్లికార్జున చెరకు సరఫరాదారులు, మార్కెట్, తారా నగర్,',
      addressLine2: 'లింగంపల్లి, శేరిలింగంపల్లి (మం), తెలంగాణ 500019',
      mobileTitle: 'మొబైల్',
      hoursTitle: 'పని వేళలు',
      hoursLine1: 'సోమవారం – శనివారం: ఉదయం 06:00 – రాత్రి 08:00',
      hoursLine2: 'క్రషింగ్ సీజన్ ట్రక్కు స్వీకరణ: 24 గంటలు',
      formTitle: 'సరఫరా కోట్ అడగండి',
      formSubtitle:
        'కస్టమ్ కోట్ కోసం మీ మిల్లు లేదా యూనిట్ ప్రాంతం మరియు వారానికి కావలసిన టన్నుల వివరాలను పంపండి.',
      nameLabel: 'పూర్తి పేరు',
      namePlaceholder: 'ఉదా. సురేష్ దేశ్‌పాండే',
      phoneLabel: 'ఫోన్ నంబర్',
      phonePlaceholder: 'ఉదా. +91 98450 11234',
      companyLabel: 'మిల్లు / బెల్లం యూనిట్ పేరు (ఐచ్ఛికం)',
      companyPlaceholder: 'ఉదా. శ్రీ రేణుక ఆగ్రో మిల్స్',
      messageLabel: 'సరఫరా అవసరం & డెలివరీ ప్రాంతం',
      messagePlaceholder:
        'రోజుకు కావలసిన టన్నులు, చెరకు రకం మరియు డెలివరీ చిరునామాను నమోదు చేయండి...',
      validationError:
        'దయచేసి మీ పేరు, ఫోన్ నంబర్ మరియు సరఫరా అవసరాన్ని నమోదు చేయండి.',
      submitError:
        'ప్రస్తుతం కోట్ పంపడం సాధ్యం కాలేదు. దయచేసి నేరుగా ఫోన్ లేదా వాట్సాప్ చేయండి.',
      successMessage:
        'మీ కోట్ అభ్యర్థన అందింది. మా బృందం త్వరలో మిమ్మల్ని సంప్రదిస్తుంది.',
      submittingButton: 'కోట్ పంపిస్తున్నాము...',
      submitButton: 'కోట్ అభ్యర్థన పంపండి',
    },
    footer: {
      addressSummary:
        'మార్కెట్, తారా నగర్, లింగంపల్లి, శేరిలింగంపల్లి (మం), తెలంగాణ 500019',
      rights: 'అన్ని హక్కులు ప్రత్యేకించబడినవి.',
      admin: 'అడ్మిన్',
      portal: 'పోర్టల్',
    },
  },

  hi: {
    locale: 'hi-IN',
    brandName: 'मल्लिकार्जुन गन्ना सप्लायर्स',
    languageModal: {
      eyebrow: 'स्वागत है',
      title: 'अपनी पसंदीदा भाषा चुनें',
      description:
        'हमारी गन्ना सप्लाई की जानकारी पढ़ने और कोटेशन प्राप्त करने के लिए हिंदी, तेलुगु या अंग्रेज़ी चुनें।',
      continueDefault: 'अंग्रेज़ी में जारी रखें (डिफ़ॉल्ट)',
    },
    nav: {
      about: 'हमारे बारे में',
      clients: 'संतुष्ट ग्राहक',
      contact: 'संपर्क करें',
      requestQuote: 'कोटेशन मांगें',
      languageLabel: 'भाषा',
      toggleMenu: 'मेनू खोलें या बंद करें',
    },
    whatsapp: {
      cta: 'व्हाट्सएप पर चैट करें',
      floatingLabel: 'व्हाट्सएप',
    },
    hero: {
      eyebrow: 'महाराष्ट्र और कर्नाटक गन्ना निर्यात',
      headline: 'साल के 12 महीने खेतों से चुना हुआ मीठा और ताज़ा गन्ना।',
      description:
        'हम महाराष्ट्र और कर्नाटक से अपने ग्राहकों को सीधे गन्ना निर्यात करते हैं। हमारी टीम स्वयं खेतों में जाकर फसल की गुणवत्ता की जांच करती है और साल भर भरोसेमंद सप्लाई के लिए केवल सबसे मीठा और बेहतरीन गन्ना चुनती है।',
      primaryCta: 'सप्लाई कोटेशन मांगें',
      secondaryCta: 'सप्लाई गैलरी देखें',
      imageAlt:
        'मल्लिकार्जुन गन्ना सप्लायर्स डिपो में ताज़ा कटे हुए गन्ने के बंडल',
      imageFallbackSub: 'महाराष्ट्र और कर्नाटक गन्ना निर्यात',
      metrics: [
        {
          value: '50 सक्रिय यूनिट्स',
          label: 'मौसम की परवाह किए बिना साल भर नियमित सप्लाई',
        },
        {
          value: '100+ यूनिट्स',
          label: 'सीज़न के समय अधिकतम मांग पर भी पूरी सप्लाई',
        },
        {
          value: '12 महीने',
          label: 'पूरे साल निरंतर गन्ना उपलब्धता',
        },
        {
          value: 'MH और KA',
          label: 'महाराष्ट्र और कर्नाटक के खेतों से सीधा निर्यात',
        },
      ],
    },
    about: {
      eyebrow: 'हमारे बारे में',
      title: 'महाराष्ट्र और कर्नाटक के खेतों से सीधे हाथ से चुना हुआ गन्ना।',
      description:
        'मिठास और ताज़गी पर विशेष ध्यान देते हुए हम महाराष्ट्र और कर्नाटक से गन्ना निर्यात करते हैं। बिना देखे माल खरीदने के बजाय हम सीधे खेतों में जाकर गन्ने की गुणवत्ता जांचते हैं और साल के सभी 12 महीने ग्राहकों के लिए सर्वश्रेष्ठ फसल चुनते हैं।',
      imageAlt:
        'कटाई से पहले खेत में ऊंचे और मीठे गन्ने की सीधी गुणवत्ता जांच',
      imageFallback: 'खेत में सीधी गुणवत्ता जांच',
      capabilities: [
        {
          index: '01.',
          title: 'खेत में सीधी गुणवत्ता जांच',
          detail:
            'हम महाराष्ट्र और कर्नाटक के गन्ना खेतों में खुद जाकर फसल की पकने की स्थिति, गन्ने की मोटाई और प्राकृतिक मिठास की जांच करते हैं—ताकि ग्राहकों को केवल सबसे अच्छा गन्ना मिले।',
        },
        {
          index: '02.',
          title: '50 सक्रिय यूनिट्स को 12 महीने निरंतर सप्लाई',
          detail:
            '12 महीने सप्लाई उपलब्ध होने के कारण हम हर मौसम में 50 सक्रिय यूनिट्स—शुगर मिलों, जूस सेंटरों और गुड़ इकाइयों—को हर महीने लगातार गन्ना पहुंचाते हैं।',
        },
        {
          index: '03.',
          title: 'सीज़न के समय 100+ यूनिट्स की क्षमता',
          detail:
            'पीक सीज़न के दौरान हमारी खरीद और ट्रांसपोर्ट टीम 100+ सक्रिय यूनिट्स को समय पर ताज़ा और साफ गन्ने के लोड पहुंचाती है।',
        },
      ],
    },
    clients: {
      eyebrow: 'संतुष्ट ग्राहक',
      title: 'हमारे खेतों और डिपो से साल भर 50+ सक्रिय यूनिट्स तक सप्लाई।',
      prevAria: 'पिछली फोटो',
      nextAria: 'अगली फोटो',
      uploadedPrefix: 'अपलोड तिथि',
      fallbackTitle: 'ग्राहक सप्लाई गैलरी',
      fallbackCaption: 'संतुष्ट ग्राहक गन्ना डिलीवरी',
      slideCaptionsByUrl: {
        '/assets/aistudio/image_5fcf53d7.png':
          'डिपो स्टॉक — डिस्पैच के लिए तैयार साफ और बंधे हुए गन्ने के बंडल',
        '/assets/aistudio/image_6b0fe2f5.png':
          'खेत में सीधी जांच — कटाई से पहले गन्ने की ऊंचाई और मिठास की परख',
        '/assets/aistudio/image_535ce9fa.png':
          'थोक गोदाम स्टॉक — पूरे 12 महीने सप्लाई के लिए सुरक्षित भंडार',
        '/assets/aistudio/image_c0dbed69.png':
          'महाराष्ट्र और कर्नाटक के खेतों से ताज़ा कटा सुनहरा-हरा गन्ना',
        '/assets/aistudio/image_0c3698c9.png':
          'ग्राहक यूनिट डिलीवरी के लिए लोड किया गया छिला हुआ मीठा गन्ना',
        '/assets/aistudio/image_ae3db5ef.png':
          'थोक मंडी यार्ड सप्लाई — 50+ सक्रिय और 100+ सीज़नल यूनिट्स की सेवा',
      },
    },
    contact: {
      eyebrow: 'संपर्क करें',
      title: 'थोक गन्ना सप्लाई की बुकिंग के लिए संपर्क करें।',
      description:
        'चाहे आप हमारे 50 नियमित यूनिट्स में से हों या सीज़न में 100+ यूनिट्स के लिए थोक लोड चाहते हों, महाराष्ट्र और कर्नाटक से मीठे, खेत से चुने गन्ने के लिए हमसे संपर्क करें।',
      addressTitle: 'मंडी और सप्लाई पता',
      addressLine1: 'मल्लिकार्जुन गन्ना सप्लायर्स, मार्केट, तारा नगर,',
      addressLine2: 'लिंगमपल्ली, सेरिलिंगमपल्ली (मं), तेलंगाना 500019',
      mobileTitle: 'मोबाइल',
      hoursTitle: 'कार्य समय',
      hoursLine1: 'सोमवार – शनिवार: सुबह 06:00 – रात 08:00',
      hoursLine2: 'क्रशिंग सीज़न ट्रक रिसीविंग: 24 घंटे',
      formTitle: 'सप्लाई कोटेशन मांगें',
      formSubtitle:
        'कस्टम कोटेशन के लिए अपनी मिल या यूनिट का स्थान और प्रति सप्ताह आवश्यक टन की मात्रा बताएं।',
      nameLabel: 'पूरा नाम',
      namePlaceholder: 'उदा. सुरेश देशपांडे',
      phoneLabel: 'फ़ोन नंबर',
      phonePlaceholder: 'उदा. +91 98450 11234',
      companyLabel: 'मिल / गुड़ यूनिट का नाम (वैकल्पिक)',
      companyPlaceholder: 'उदा. श्री रेणुका एग्रो मिल्स',
      messageLabel: 'सप्लाई आवश्यकता और डिलीवरी स्थान',
      messagePlaceholder:
        'प्रतिदिन आवश्यक टन, पसंदीदा गन्ना किस्म और डिलीवरी पता लिखें...',
      validationError:
        'कृपया अपना नाम, फ़ोन नंबर और सप्लाई आवश्यकता दर्ज करें।',
      submitError:
        'अभी कोटेशन भेजने में समस्या आ रही है। कृपया सीधे कॉल या व्हाट्सएप करें।',
      successMessage:
        'आपका कोटेशन अनुरोध प्राप्त हो गया है। हमारी टीम शीघ्र ही आपसे संपर्क करेगी।',
      submittingButton: 'कोटेशन भेजा जा रहा है...',
      submitButton: 'कोटेशन अनुरोध भेजें',
    },
    footer: {
      addressSummary:
        'मार्केट, तारा नगर, लिंगमपल्ली, सेरिलिंगमपल्ली (मं), तेलंगाना 500019',
      rights: 'सर्वाधिकार सुरक्षित।',
      admin: 'एडमिन',
      portal: 'पोर्टल',
    },
  },
};

export function formatLocalizedDate(
  isoString: string,
  lang: PublicLanguage
): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  const locale = PUBLIC_TRANSLATIONS[lang].locale;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
