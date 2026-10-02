import { SupportedLanguageCode } from './languages';

export const TRANSLATIONS: Record<SupportedLanguageCode, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.investigations': 'Investigations',
    'nav.evidence_library': 'Evidence Library',
    'nav.reports': 'Reports',
    'nav.monitoring': 'Monitoring',
    'nav.knowledge_hub': 'Knowledge Hub',
    'nav.settings': 'Settings',
    'nav.community': 'Community',
    'nav.submit_claim': 'Submit Claim',
    'nav.platform_workspace': 'Platform Workspace',
    'nav.analyst_platform': 'Analyst Platform',
    'nav.capabilities.search': 'Advanced multi-source search',
    'nav.capabilities.analysis': 'AI-assisted analysis',
    'nav.capabilities.verification': 'Cross-platform verification',
    'nav.capabilities.export': 'Export & share reports',
    'nav.version': 'Truth. Verified. v3.2.0',

    // Top Header
    'header.search_placeholder': 'Search people, organizations, events...',
    'header.live_system': 'LIVE SYSTEM',
    'header.alerts': 'Intelligence Alerts',
    'header.active': 'Active',
    'header.switch_role': 'Switch Active Role',
    'header.language': 'Language',

    // Hero Section
    'hero.badge': 'INTELLIGENCE ANALYSIS HUB',
    'hero.headline': 'Verify. Investigate. Report.',
    'hero.subtitle': 'Get deeper insights with multi-source intelligence and AI-powered analysis for high-stakes claims, corporate disclosures, and breaking events.',
    'hero.search_placeholder': 'Enter claim, event, or statement (e.g. Justin Bieber elected PM of Japan)...',
    'hero.analyze': 'Analyze →',
    'hero.analyzing': 'Analyzing...',
    'hero.try': 'Try:',

    // Subtabs
    'tab.quick_verify': 'Quick Verify',
    'tab.multi_source': 'Multi-Source Analysis',
    'tab.timeline': 'Timeline View',
    'tab.entity_explorer': 'Entity Explorer',
    'tab.generate_report': 'Generate Report',

    // Verification Overview & TTS
    'overview.title': 'Verification Overview',
    'overview.ai_analysis': 'AI ANALYSIS',
    'overview.view_detailed': 'View Detailed Analysis →',
    'overview.confidence_breakdown': 'Confidence Breakdown',
    'overview.metric.verified_sources': 'Verified Sources',
    'overview.metric.cross_source': 'Cross-source Match',
    'overview.metric.credibility': 'Credibility of Sources',
    'overview.metric.consistency': 'Content Consistency',
    'overview.metric.anomaly': 'AI Anomaly Detection',

    // TTS Audio Controls
    'tts.listen_summary': 'Listen AI Audio Summary',
    'tts.playing': 'Speaking Summary...',
    'tts.pause': 'Pause',
    'tts.resume': 'Resume',
    'tts.stop': 'Stop',
    'tts.claim_spoken': 'Claim being assessed',
    'tts.verdict_spoken': 'Official Assessment',
    'tts.reality_spoken': 'Fact and Reality Analysis',

    // Relevance Gate
    'relevance.rejected': 'Evidence Relevance Gate: Claim Unsubstantiated',
    'relevance.desc': 'Retrieved sources do not match the core subject, predicate action, or geographic anchors of this query.',

    // Key Sources
    'sources.title': 'Key Sources & Evidence',
    'sources.filter.all': 'All',
    'sources.filter.news': 'News',
    'sources.filter.government': 'Government',
    'sources.filter.social': 'Social Media',
    'sources.view_source': 'View source →',
    'sources.verified': 'Verified',
    'sources.unverified': 'Unverified',

    // Related Entities
    'entities.title': 'Related Searches & Entities',
    'entities.subtitle': 'Explore related people, organizations, and events for a broader context.',

    // Right Sidebar
    'insights.title': 'AI Insights',
    'insights.no_records': 'No official records found',
    'insights.no_records_desc': 'No confirmation from sovereign authorities or credible international news agencies.',
    'insights.origin': 'Origin of the claim',
    'insights.origin_desc': 'The claim originated from a satire account or unverified online posting.',
    'insights.similar': 'Similar past incidents',
    'insights.similar_desc': 'This pattern resembles previously debunked hoaxes regarding political leadership changes.',
    'insights.view_full': 'View full analysis →',

    'timeline.title': 'Evidence Timeline',
    'timeline.view_all': 'View all →',

    'export.title': 'Export / Share',
    'export.subtitle': 'Generate a verified intelligence dossier or share with your investigation team.',
    'export.download': 'Download Report',
    'export.share': 'Share Analysis',

    // Community Poll
    'poll.title': 'Community Claim Dossier',
    'poll.desc': 'Cast your verified verdict on whether this finding is accurate.',
    'poll.supported': 'Corroborated',
    'poll.disputed': 'Disputed',
    'poll.refuted': 'Refuted / Hoax',
    'poll.voted': 'Voted',
    'poll.vote_now': 'Vote',

    // Status Badges
    'status.likely_false': 'Likely False',
    'status.questionable': 'Questionable',
    'status.supported': 'Supported',
    'status.likely_true': 'Likely True',
    'status.mixed': 'Mixed',
    'status.insufficient': 'Insufficient Evidence'
  },

  hi: {
    // Nav
    'nav.home': 'होम',
    'nav.search': 'सर्च',
    'nav.investigations': 'जांच पड़ताल',
    'nav.evidence_library': 'सबूत संग्रह',
    'nav.reports': 'रिपोर्ट्स',
    'nav.monitoring': 'लाइव निगरानी',
    'nav.knowledge_hub': 'ज्ञान केंद्र',
    'nav.settings': 'सेटिंग्स',
    'nav.community': 'समुदाय',
    'nav.submit_claim': 'दावा प्रस्तुत करें',
    'nav.platform_workspace': 'विश्लेषक कार्यक्षेत्र',
    'nav.analyst_platform': 'एनालिस्ट प्लेटफॉर्म',
    'nav.capabilities.search': 'उन्नत मल्टी-सोर्स खोज',
    'nav.capabilities.analysis': 'एआई-सहायक तथ्य विश्लेषण',
    'nav.capabilities.verification': 'क्रॉस-प्लेटफ़ॉर्म सत्यापन',
    'nav.capabilities.export': 'रिपोर्ट निर्यात और साझाकरण',
    'nav.version': 'सत्यता सत्यापित v3.2.0',

    // Top Header
    'header.search_placeholder': 'व्यक्तियों, संगठनों, घटनाओं को खोजें...',
    'header.live_system': 'लाइव प्रणाली',
    'header.alerts': 'खुफिया अलर्ट',
    'header.active': 'सक्रिय',
    'header.switch_role': 'सक्रिय भूमिका बदलें',
    'header.language': 'भाषा चुनें',

    // Hero Section
    'hero.badge': 'खुफिया विश्लेषण हब',
    'hero.headline': 'सत्यापित करें। जांचें। रिपोर्ट करें।',
    'hero.subtitle': 'उच्च जोखिम वाले दावों, कॉर्पोरेट बयानों और महत्वपूर्ण घटनाओं के लिए बहु-स्रोत खुफिया और एआई-संचालित विश्लेषण प्राप्त करें।',
    'hero.search_placeholder': 'दावा, घटना या बयान दर्ज करें (उदा. क्या जस्टिन बीबर जापान के पीएम बने)...',
    'hero.analyze': 'विश्लेषण करें →',
    'hero.analyzing': 'विश्लेषण जारी...',
    'hero.try': 'उदाहरण:',

    // Subtabs
    'tab.quick_verify': 'त्वरित सत्यापन',
    'tab.multi_source': 'बहु-स्रोत विश्लेषण',
    'tab.timeline': 'समयरेखा दृश्य',
    'tab.entity_explorer': 'इकाई अन्वेषक',
    'tab.generate_report': 'रिपोर्ट तैयार करें',

    // Verification Overview & TTS
    'overview.title': 'सत्यापन अवलोकन',
    'overview.ai_analysis': 'एआई विश्लेषण',
    'overview.view_detailed': 'विस्तृत विश्लेषण देखें →',
    'overview.confidence_breakdown': 'विश्वसनीयता विवरण',
    'overview.metric.verified_sources': 'सत्यापित स्रोत',
    'overview.metric.cross_source': 'क्रॉस-सोर्स मिलान',
    'overview.metric.credibility': 'स्रोतों की साख',
    'overview.metric.consistency': 'सामग्री की निरंतरता',
    'overview.metric.anomaly': 'एआई विसंगति जांच',

    // TTS Audio Controls
    'tts.listen_summary': 'एआई ऑडियो सारांश सुनें',
    'tts.playing': 'सारांश बोल रहे हैं...',
    'tts.pause': 'रोकें',
    'tts.resume': 'पुनः शुरू करें',
    'tts.stop': 'समाप्त करें',
    'tts.claim_spoken': 'दावा जिसकी जांच की जा रही है',
    'tts.verdict_spoken': 'आधिकारिक मूल्यांकन',
    'tts.reality_spoken': 'तथ्य और वास्तविकता विश्लेषण',

    // Relevance Gate
    'relevance.rejected': 'साक्ष्य प्रासंगिकता अस्वीकार: दावा अप्रमाणित',
    'relevance.desc': 'इंटरनेट से प्राप्त स्रोत इस खोज के मुख्य विषय, क्रिया या भौगोलिक संदर्भ से मेल नहीं खाते।',

    // Key Sources
    'sources.title': 'प्रमुख स्रोत और साक्ष्य',
    'sources.filter.all': 'सभी',
    'sources.filter.news': 'समाचार',
    'sources.filter.government': 'सरकारी',
    'sources.filter.social': 'सोशल मीडिया',
    'sources.view_source': 'स्रोत देखें →',
    'sources.verified': 'सत्यापित',
    'sources.unverified': 'असत्यापित',

    // Related Entities
    'entities.title': 'संबंधित खोजें और संस्थाएं',
    'entities.subtitle': 'विस्तृत संदर्भ के लिए संबंधित व्यक्तियों, संगठनों और घटनाओं का अन्वेषण करें।',

    // Right Sidebar
    'insights.title': 'एआई अंतर्दृष्टि',
    'insights.no_records': 'कोई आधिकारिक रिकॉर्ड नहीं मिला',
    'insights.no_records_desc': 'सरकारी अभिलेखों या विश्वसनीय समाचार एजेंसियों से कोई पुष्टि नहीं है।',
    'insights.origin': 'दावे की उत्पत्ति',
    'insights.origin_desc': 'यह दावा किसी व्यंग्य (सटायर) खाते या असत्यापित ऑनलाइन पोस्ट से शुरू हुआ था।',
    'insights.similar': 'समान पिछली घटनाएं',
    'insights.similar_desc': 'यह पैटर्न राजनेताओं के पदों को लेकर पहले फैलाई गई फर्जी खबरों जैसा है।',
    'insights.view_full': 'पूर्ण विश्लेषण देखें →',

    'timeline.title': 'साक्ष्य समयरेखा',
    'timeline.view_all': 'सभी देखें →',

    'export.title': 'निर्यात / साझा करें',
    'export.subtitle': 'सत्यापित डोजियर रिपोर्ट डाउनलोड करें या अपनी टीम के साथ साझा करें।',
    'export.download': 'रिपोर्ट डाउनलोड करें',
    'export.share': 'विश्लेषण साझा करें',

    // Community Poll
    'poll.title': 'सामुदायिक दावा डोजियर',
    'poll.desc': 'इस निष्कर्ष पर अपना प्रामाणिक मत दर्ज करें।',
    'poll.supported': 'सत्यापित',
    'poll.disputed': 'विवादित',
    'poll.refuted': 'गलत / फर्जी',
    'poll.voted': 'वोट किया',
    'poll.vote_now': 'वोट करें',

    // Status Badges
    'status.likely_false': 'संभावित रूप से असत्य',
    'status.questionable': 'संदेहास्पद',
    'status.supported': 'सत्यापित साक्ष्य',
    'status.likely_true': 'संभावित सत्य',
    'status.mixed': 'मिश्रित साक्ष्य',
    'status.insufficient': 'अपर्याप्त साक्ष्य'
  },

  bn: {
    // Nav
    'nav.home': 'হোম',
    'nav.search': 'অনুসন্ধান',
    'nav.investigations': 'তদন্ত',
    'nav.evidence_library': 'প্রমাণাগার',
    'nav.reports': 'প্রতিবেদন',
    'nav.monitoring': 'লাইভ পর্যবেক্ষণ',
    'nav.knowledge_hub': 'জ্ঞান কেন্দ্র',
    'nav.settings': 'সেটিংস',
    'nav.community': 'সম্প্রদায়',
    'nav.submit_claim': 'দাবি জমা দিন',
    'nav.platform_workspace': 'প্ল্যাটফর্ম ওয়ার্কস্পেস',
    'nav.analyst_platform': 'বিশ্লেষক প্ল্যাটফর্ম',
    'nav.capabilities.search': 'উন্নত বহু-উৎস অনুসন্ধান',
    'nav.capabilities.analysis': 'এআই সহায়তায় বিশ্লেষণ',
    'nav.capabilities.verification': 'ক্রস-প্ল্যাটফর্ম যাচাইকরণ',
    'nav.capabilities.export': 'রিপোর্ট ডাউনলোড ও শেয়ার',
    'nav.version': 'সত্যতা যাচাইকৃত v3.2.0',

    // Top Header
    'header.search_placeholder': 'ব্যক্তি, প্রতিষ্ঠান বা ঘটনা অনুসন্ধান করুন...',
    'header.live_system': 'লাইভ সিস্টেম',
    'header.alerts': 'গোয়েন্দা সতর্কতা',
    'header.active': 'সক্রিয়',
    'header.switch_role': 'ভূমিকা পরিবর্তন',
    'header.language': 'ভাষা',

    // Hero Section
    'hero.badge': 'গোয়েন্দা বিশ্লেষণ কেন্দ্র',
    'hero.headline': 'যাচাই করুন। তদন্ত করুন। প্রতিবেদন দিন।',
    'hero.subtitle': 'গুরুত্বপূর্ণ ঘটনা ও তথ্যের জন্য বহু-উৎস বিশ্লেষণ ও এআই চালিত অন্তর্দৃষ্টি লাভ করুন।',
    'hero.search_placeholder': 'যেকোনো দাবি বা ঘটনা লিখুন...',
    'hero.analyze': 'বিশ্লেষণ করুন →',
    'hero.analyzing': 'বিশ্লেষণ চলছে...',
    'hero.try': 'চেষ্টা করুন:',

    // Subtabs
    'tab.quick_verify': 'দ্রুত যাচাই',
    'tab.multi_source': 'বহু-উৎস বিশ্লেষণ',
    'tab.timeline': 'সময়রেখা',
    'tab.entity_explorer': 'এনটিটি এক্সপ্লোরার',
    'tab.generate_report': 'রিপোর্ট তৈরি করুন',

    // Verification Overview & TTS
    'overview.title': 'যাচাইকরণ বিবরণ',
    'overview.ai_analysis': 'এআই বিশ্লেষণ',
    'overview.view_detailed': 'বিস্তারিত বিশ্লেষণ দেখুন →',
    'overview.confidence_breakdown': 'নির্ভরযোগ্যতার বিবরণ',
    'overview.metric.verified_sources': 'যাচাইকৃত উৎস',
    'overview.metric.cross_source': 'উৎস মিল',
    'overview.metric.credibility': 'উৎসের নির্ভরযোগ্যতা',
    'overview.metric.consistency': 'বিষয়বস্তুর সামঞ্জস্য',
    'overview.metric.anomaly': 'এআই অসঙ্গতি সনাক্তকরণ',

    // TTS
    'tts.listen_summary': 'এআই অডিও সারসংক্ষেপ শুনুন',
    'tts.playing': 'সারসংক্ষেপ পাঠ করা হচ্ছে...',
    'tts.pause': 'থামান',
    'tts.resume': 'পুনরায় চালান',
    'tts.stop': 'বন্ধ করুন',
    'tts.claim_spoken': 'যে দাবিটি মূল্যায়ন করা হচ্ছে',
    'tts.verdict_spoken': 'আনুষ্ঠানিক সিদ্ধান্ত',
    'tts.reality_spoken': 'বাস্তব তথ্য ও সত্যতা বিশ্লেষণ',

    // Relevance Gate
    'relevance.rejected': 'প্রাসঙ্গিকতা যাচাই প্রত্যাখ্যান: দাবি অপ্রমাণিত',
    'relevance.desc': 'প্রাপ্ত প্রমাণ এই অনুসন্ধানের মূল বিষয়বস্তু বা অবস্থানের সাথে মিলছে না।',

    // Key Sources
    'sources.title': 'প্রধান উৎস ও প্রমাণ',
    'sources.filter.all': 'সমস্ত',
    'sources.filter.news': 'সংবাদ',
    'sources.filter.government': 'সরকারি',
    'sources.filter.social': 'সোশ্যাল মিডিয়া',
    'sources.view_source': 'উৎস দেখুন →',
    'sources.verified': 'যাচাইকৃত',
    'sources.unverified': 'অযাচাইকৃত',

    // Related Entities
    'entities.title': 'সম্পর্কিত অনুসন্ধান ও সংস্থা',
    'entities.subtitle': 'বৃহত্তর প্রেক্ষাপটের জন্য সম্পর্কিত তথ্য অনুসন্ধান করুন।',

    // Right Sidebar
    'insights.title': 'এআই অন্তর্দৃষ্টি',
    'insights.no_records': 'কোনো সরকারি তথ্য মেলেনি',
    'insights.no_records_desc': 'সরকারি নথি বা প্রধান সংবাদ মাধ্যম থেকে কোনো নিশ্চিতকরণ পাওয়া যায়নি।',
    'insights.origin': 'দাবির উৎস',
    'insights.origin_desc': 'দাবিটি একটি ব্যঙ্গাত্মক অ্যাকাউন্ট বা অনলাইন গুজব থেকে শুরু হয়েছিল।',
    'insights.similar': 'অনুরূপ অতীতের ঘটনা',
    'insights.similar_desc': 'এটি পূর্বে উন্মোচিত রাজনৈতিক ভুয়ো সংবাদের ধরনের সাথে মিলে যায়।',
    'insights.view_full': 'সম্পূর্ণ বিশ্লেষণ দেখুন →',

    'timeline.title': 'প্রমাণ সময়রেখা',
    'timeline.view_all': 'সমস্ত দেখুন →',

    'export.title': 'এক্সপোর্ট / শেয়ার',
    'export.subtitle': 'যাচাইকৃত রিপোর্ট ডাউনলোড করুন অথবা দলের সাথে শেয়ার করুন।',
    'export.download': 'রিপোর্ট ডাউনলোড',
    'export.share': 'বিশ্লেষণ শেয়ার',

    // Community Poll
    'poll.title': 'কমিউনিটি মূল্যায়ন',
    'poll.desc': 'এই তথ্যের যথার্থতার ওপর আপনার ভোট দিন।',
    'poll.supported': 'সমর্থিত',
    'poll.disputed': 'বিতর্কিত',
    'poll.refuted': 'ভুয়ো / অসত্য',
    'poll.voted': 'ভোট প্রদত্ত',
    'poll.vote_now': 'ভোট দিন',

    // Status Badges
    'status.likely_false': 'সম্ভবত মিথ্যা',
    'status.questionable': 'সন্দেহজনক',
    'status.supported': 'সমর্থিত',
    'status.likely_true': 'সম্ভবত সত্য',
    'status.mixed': 'মিশ্র প্রমাণ',
    'status.insufficient': 'অপর্যাপ্ত প্রমাণ'
  },

  te: {
    // Nav
    'nav.home': 'హోమ్',
    'nav.search': 'శోధన',
    'nav.investigations': 'పరిశోధనలు',
    'nav.evidence_library': 'సాక్ష్యాల లైబ్రరీ',
    'nav.reports': 'నివేదికలు',
    'nav.monitoring': 'ప్రత్యక్ష పర్యవేక్షణ',
    'nav.knowledge_hub': 'నాలెడ్జ్ హబ్',
    'nav.settings': 'సెట్టింగ్‌లు',
    'nav.community': 'కమ్యూనిటీ',
    'nav.submit_claim': 'దావాను సమర్పించండి',
    'nav.platform_workspace': 'ప్లాట్‌ఫామ్ వర్క్‌స్పేస్',
    'nav.analyst_platform': 'విశ్లేషకుల వేదిక',
    'nav.capabilities.search': 'అధునాతన బహుళ-మూలాల శోధన',
    'nav.capabilities.analysis': 'ఏఐ ఆధారిత వాస్తవ విశ్లేషణ',
    'nav.capabilities.verification': 'క్రాస్-ప్లాట్‌ఫామ్ ధృవీకరణ',
    'nav.capabilities.export': 'నివేదికల డౌన్‌లోడ్ మరియు భాగస్వామ్యం',
    'nav.version': 'నిజం ధృవీకరించబడింది v3.2.0',

    // Top Header
    'header.search_placeholder': 'వ్యక్తులు, సంస్థలు, ఈవెంట్‌ల కోసం శోధించండి...',
    'header.live_system': 'లైవ్ సిస్టమ్',
    'header.alerts': 'ఇంటెలిజెన్స్ హెచ్చరికలు',
    'header.active': 'యాక్టివ్',
    'header.switch_role': 'పాత్రను మార్చండి',
    'header.language': 'భాష',

    // Hero Section
    'hero.badge': 'ఇంటెలిజెన్స్ అనాలిసిస్ హబ్',
    'hero.headline': 'ధృవీకరించండి. పరిశోధించండి. నివేదించండి.',
    'hero.subtitle': 'కీలకమైన సమాచారం కోసం బహుళ-మూలాల నుండి సమాచారాన్ని మరియు ఏఐ విశ్లేషణను పొందండి.',
    'hero.search_placeholder': 'ఏదైనా దావా లేదా సంఘటన నమోదు చేయండి...',
    'hero.analyze': 'విశ్లేషించండి →',
    'hero.analyzing': 'విశ్లేషణ కొనసాగుతోంది...',
    'hero.try': 'ఉదాహరణ:',

    // Subtabs
    'tab.quick_verify': 'త్వరిత ధృవీకరణ',
    'tab.multi_source': 'బహుళ-మూలాల విశ్లేషణ',
    'tab.timeline': 'కాలక్రమం',
    'tab.entity_explorer': 'ఎంటిటీ అన్వేషకుడు',
    'tab.generate_report': 'నివేదికను రూపొందించండి',

    // Verification Overview & TTS
    'overview.title': 'ధృవీకరణ వివరాలు',
    'overview.ai_analysis': 'ఏఐ విశ్లేషణ',
    'overview.view_detailed': 'పూర్తి వివరాలు చూడండి →',
    'overview.confidence_breakdown': 'విశ్వసనీయత విభజన',
    'overview.metric.verified_sources': 'ధృవీకరించబడిన మూలాలు',
    'overview.metric.cross_source': 'మూలాల సమన్వయం',
    'overview.metric.credibility': 'మూలాల విశ్వసనీయత',
    'overview.metric.consistency': 'సమాచార స్థిరత్వం',
    'overview.metric.anomaly': 'ఏఐ అసమానతల గుర్తింపు',

    // TTS
    'tts.listen_summary': 'ఏఐ ఆడియో సారాంశం వినండి',
    'tts.playing': 'సారాంశం చదువుతున్నారు...',
    'tts.pause': 'పాజ్',
    'tts.resume': 'పునఃప్రారంభించు',
    'tts.stop': 'ఆపు',
    'tts.claim_spoken': 'పరిశీలించబడుతున్న దావా',
    'tts.verdict_spoken': 'అధికారిక నిర్ధారణ',
    'tts.reality_spoken': 'వాస్తవ సమాచారం మరియు సత్య విశ్లేషణ',

    // Relevance Gate
    'relevance.rejected': 'సాక్ష్యం తిరస్కరించబడింది: నిరాధారమైన దావా',
    'relevance.desc': 'లభించిన ఆధారాలు ఈ శోధన యొక్క ప్రధాన విషయానికి సరిపోలడం లేదు.',

    // Key Sources
    'sources.title': 'ప్రధాన మూలాలు & సాక్ష్యాలు',
    'sources.filter.all': 'అన్నీ',
    'sources.filter.news': 'వార్తలు',
    'sources.filter.government': 'ప్రభుత్వం',
    'sources.filter.social': 'సోషల్ మీడియా',
    'sources.view_source': 'మూలాన్ని చూడండి →',
    'sources.verified': 'ధృవీకరించబడింది',
    'sources.unverified': 'ధృవీకరించబడలేదు',

    // Related Entities
    'entities.title': 'సంబంధిత శోధనలు & సంస్థలు',
    'entities.subtitle': 'మరింత స్పష్టత కోసం సంబంధిత వ్యక్తులు మరియు సంస్థలను అన్వేషించండి.',

    // Right Sidebar
    'insights.title': 'ఏఐ అంతర్దృష్టులు',
    'insights.no_records': 'అధికారిక రికార్డులు లేవు',
    'insights.no_records_desc': 'ప్రభుత్వ లేదా విశ్వసనీయ వార్తా సంస్థల నుండి ఎటువంటి నిర్ధారణ లభించలేదు.',
    'insights.origin': 'దావా మూలం',
    'insights.origin_desc': 'ఈ ప్రచారం సోషల్ మీడియాలోని ఒక వ్యంగ్య పోస్ట్ ద్వారా మొదలైంది.',
    'insights.similar': 'గతంలో జరిగిన సంఘటనలు',
    'insights.similar_desc': 'గతంలో జరిగిన తప్పుడు రాజకీయ ప్రచారాల తరహాలోనే ఇది ఉంది.',
    'insights.view_full': 'పూర్తి విశ్లేషణ చూడండి →',

    'timeline.title': 'సాక్ష్యాల కాలక్రమం',
    'timeline.view_all': 'అన్నీ చూడండి →',

    'export.title': 'ఎగుమతి / భాగస్వామ్యం',
    'export.subtitle': 'ధృవీకరించబడిన నివేదికను డౌన్‌లోడ్ చేయండి లేదా మీ బృందంతో పంచుకోండి.',
    'export.download': 'నివేదికను డౌన్‌లోడ్ చేయండి',
    'export.share': 'విశ్లేషణను పంచుకోండి',

    // Community Poll
    'poll.title': 'కమ్యూనిటీ ఓటింగ్',
    'poll.desc': 'ఈ అంశంపై మీ ప్రామాణికమైన అభిప్రాయాన్ని ఓటు చేయండి.',
    'poll.supported': 'నిజం',
    'poll.disputed': 'వివాదాస్పదం',
    'poll.refuted': 'అవాస్తవం / తప్పు',
    'poll.voted': 'ఓటు వేయబడింది',
    'poll.vote_now': 'ఓటు వేయండి',

    // Status Badges
    'status.likely_false': 'అవాస్తవమయ్యే అవకాశం ఉంది',
    'status.questionable': 'సందేహాస్పదం',
    'status.supported': 'ధృవీకరించబడింది',
    'status.likely_true': 'నిజమయ్యే అవకాశం ఉంది',
    'status.mixed': 'మిశ్రమ ఆధారాలు',
    'status.insufficient': 'సరిపోని ఆధారాలు'
  },

  ta: {
    // Nav
    'nav.home': 'முகப்பு',
    'nav.search': 'தேடல்',
    'nav.investigations': 'விசாரணைகள்',
    'nav.evidence_library': 'ஆதார நூலகம்',
    'nav.reports': 'அறிக்கைகள்',
    'nav.monitoring': 'நேரலை கண்காணிப்பு',
    'nav.knowledge_hub': 'அறிவு மையம்',
    'nav.settings': 'அமைப்புகள்',
    'nav.community': 'சமூகம்',
    'nav.submit_claim': 'கூற்றைச் சமர்ப்பிக்கவும்',
    'nav.platform_workspace': 'பணியிடம்',
    'nav.analyst_platform': 'ஆய்வாளர் தளம்',
    'nav.capabilities.search': 'மேம்பட்ட பல-மூலத் தேடல்',
    'nav.capabilities.analysis': 'AI-உதவி உண்மை பகுப்பாய்வு',
    'nav.capabilities.verification': 'குறுக்கு தள சரிபார்ப்பு',
    'nav.capabilities.export': 'அறிக்கை பதிவிறக்கம்',
    'nav.version': 'உண்மை சரிபார்க்கப்பட்டது v3.2.0',

    // Top Header
    'header.search_placeholder': 'நபர்கள், அமைப்புகள், நிகழ்வுகளைத் தேடுங்கள்...',
    'header.live_system': 'நேரலை அமைப்பு',
    'header.alerts': 'எச்சரிக்கைகள்',
    'header.active': 'செயலில்',
    'header.switch_role': 'பாத்திரத்தை மாற்றவும்',
    'header.language': 'மொழி',

    // Hero Section
    'hero.badge': 'புலனாய்வு பகுப்பாய்வு மையம்',
    'hero.headline': 'சரிபார்க்கவும். விசாரிக்கவும். அறிக்கை செய்யவும்.',
    'hero.subtitle': 'முக்கியமான தகவல்கள் மற்றும் நிகழ்வுகளுக்கு நம்பகமான பல-மூல AI பகுப்பாய்வைப் பெறுங்கள்.',
    'hero.search_placeholder': 'சரிபார்க்க வேண்டிய கூற்றை உள்ளிடவும்...',
    'hero.analyze': 'பகுப்பாய்வு செய் →',
    'hero.analyzing': 'பகுப்பாய்வு நடக்கிறது...',
    'hero.try': 'முயற்சிக்க:',

    // Subtabs
    'tab.quick_verify': 'விரைவு சரிபார்ப்பு',
    'tab.multi_source': 'பல-மூல பகுப்பாய்வு',
    'tab.timeline': 'காலவரிசை',
    'tab.entity_explorer': 'நிறுவன ஆய்வாளர்',
    'tab.generate_report': 'அறிக்கை உருவாக்கவும்',

    // Verification Overview & TTS
    'overview.title': 'சரிபார்ப்பு மேலோட்டம்',
    'overview.ai_analysis': 'AI பகுப்பாய்வு',
    'overview.view_detailed': 'முழு விவரங்களைப் பார்க்கவும் →',
    'overview.confidence_breakdown': 'நம்பகத்தன்மை விவரங்கள்',
    'overview.metric.verified_sources': 'சரிபார்க்கப்பட்ட ஆதாரங்கள்',
    'overview.metric.cross_source': 'மூல ஒப்பீடு',
    'overview.metric.credibility': 'ஆதாரங்களின் நம்பகத்தன்மை',
    'overview.metric.consistency': 'உள்ளடக்க நிலைத்தன்மை',
    'overview.metric.anomaly': 'AI முரண்பாடு கண்டறிதல்',

    // TTS
    'tts.listen_summary': 'AI ஆடியோ சுருக்கத்தைக் கேளுங்கள்',
    'tts.playing': 'சுருக்கம் படிக்கப்படுகிறது...',
    'tts.pause': 'இடைநிறுத்து',
    'tts.resume': 'தொடரவும்',
    'tts.stop': 'நிறுத்து',
    'tts.claim_spoken': 'ஆய்வு செய்யப்படும் கூற்று',
    'tts.verdict_spoken': 'அதிகாரப்பூர்வ முடிவு',
    'tts.reality_spoken': 'உண்மை மற்றும் யதார்த்த பகுப்பாய்வு',

    // Relevance Gate
    'relevance.rejected': 'ஆதாரம் நிராகரிக்கப்பட்டது: தொடர்பற்ற கூற்று',
    'relevance.desc': 'கிடைக்கப்பட்ட ஆதாரங்கள் தேடப்பட்ட முதன்மை கூற்றுடன் பொருந்தவில்லை.',

    // Key Sources
    'sources.title': 'முக்கிய ஆதாரங்கள் மற்றும் சான்றுகள்',
    'sources.filter.all': 'அனைத்தும்',
    'sources.filter.news': 'செய்திகள்',
    'sources.filter.government': 'அரசு',
    'sources.filter.social': 'சமூக ஊடகம்',
    'sources.view_source': 'ஆதாரத்தைப் பார்க்கவும் →',
    'sources.verified': 'சரிபார்க்கப்பட்டது',
    'sources.unverified': 'சரிபார்க்கப்படவில்லை',

    // Related Entities
    'entities.title': 'தொடர்புடைய தேடல்கள்',
    'entities.subtitle': 'கூடுதல் சூழலுக்கு தொடர்புடைய நபர்கள் மற்றும் அமைப்புகளை ஆராயுங்கள்.',

    // Right Sidebar
    'insights.title': 'AI நுண்ணறிவு',
    'insights.no_records': 'அதிகாரப்பூர்வ பதிவுகள் இல்லை',
    'insights.no_records_desc': 'அரசு அல்லது முன்னணி செய்தி நிறுவனங்களிடம் இருந்து எந்த உறுதிப்படுத்தலும் இல்லை.',
    'insights.origin': 'கூற்றின் தோற்றம்',
    'insights.origin_desc': 'இக்கூற்று சமூக வலைத்தள நகைச்சுவை அல்லது போலி பதிவிலிருந்து உருவானது.',
    'insights.similar': 'முந்தைய சம்பவங்கள்',
    'insights.similar_desc': 'இது முன்னர் முறியடிக்கப்பட்ட அரசியல் வதந்திகளைப் போன்றது.',
    'insights.view_full': 'முழு பகுப்பாய்வைக் காண்க →',

    'timeline.title': 'ஆதார காலவரிசை',
    'timeline.view_all': 'அனைத்தும் காண்க →',

    'export.title': 'பதிவிறக்கம் / பகிர்வு',
    'export.subtitle': 'சரிபார்க்கப்பட்ட அறிக்கையைப் பதிவிறக்கவும் அல்லது பகிரவும்.',
    'export.download': 'அறிக்கையைப் பதிவிறக்குக',
    'export.share': 'பகுப்பாய்வைப் பகிர்க',

    // Community Poll
    'poll.title': 'சமூக மதிப்பீடு',
    'poll.desc': 'இந்த உண்மைத்தன்மைக்கு உங்கள் வாக்கைப் பதிவு செய்யுங்கள்.',
    'poll.supported': 'உண்மை',
    'poll.disputed': 'சர்ச்சைக்குரியது',
    'poll.refuted': 'பொய் / வதந்தி',
    'poll.voted': 'வாக்களிக்கப்பட்டது',
    'poll.vote_now': 'வாக்களிக்கவும்',

    // Status Badges
    'status.likely_false': 'பெரும்பாலும் தவறானது',
    'status.questionable': 'சந்தேகத்திற்குரியது',
    'status.supported': 'உறுதிப்படுத்தப்பட்டது',
    'status.likely_true': 'பெரும்பாலும் உண்மை',
    'status.mixed': 'கலவையான சான்றுகள்',
    'status.insufficient': 'போதுமான சான்றுகள் இல்லை'
  },

  mr: {
    // Nav
    'nav.home': 'होम',
    'nav.search': 'शोध',
    'nav.investigations': 'तपास',
    'nav.evidence_library': 'पुरावा ग्रंथालय',
    'nav.reports': 'अहवाल',
    'nav.monitoring': 'थेट देखरेख',
    'nav.knowledge_hub': 'ज्ञान केंद्र',
    'nav.settings': 'सेटिंग्ज',
    'nav.community': 'समुदाय',
    'nav.submit_claim': 'दावा दाखल करा',
    'nav.platform_workspace': 'प्लॅटफॉर्म वर्कस्पेस',
    'nav.analyst_platform': 'अनालिस्ट प्लॅटफॉर्म',
    'nav.capabilities.search': 'प्रगत बहु-स्रोत शोध',
    'nav.capabilities.analysis': 'एआय-सहाय्यित विश्लेषण',
    'nav.capabilities.verification': 'क्रॉस-प्लॅटफॉर्म पडताळणी',
    'nav.capabilities.export': 'अहवाल निर्यात व शेअर',
    'nav.version': 'सत्यता पडताळलेली v3.2.0',

    // Top Header
    'header.search_placeholder': 'व्यक्ती, संस्था, घटना शोधा...',
    'header.live_system': 'थेट प्रणाली',
    'header.alerts': 'गुप्तवार्ता सूचना',
    'header.active': 'सक्रिय',
    'header.switch_role': 'भूमिका बदला',
    'header.language': 'भाषा',

    // Hero Section
    'hero.badge': 'गुप्तवार्ता विश्लेषण केंद्र',
    'hero.headline': 'पडताळा. तपासा. अहवाल द्या.',
    'hero.subtitle': 'महत्त्वाच्या दाव्यांसाठी आणि घटनांसाठी बहु-स्रोत गुप्तवार्ता आणि एआय विश्लेषण मिळवा.',
    'hero.search_placeholder': 'कोणताही दावा किंवा विधान प्रविष्ट करा...',
    'hero.analyze': 'विश्लेषण करा →',
    'hero.analyzing': 'विश्लेषण सुरू आहे...',
    'hero.try': 'उदाहरणे:',

    // Subtabs
    'tab.quick_verify': 'जलद पडताळणी',
    'tab.multi_source': 'बहु-स्रोत विश्लेषण',
    'tab.timeline': 'टाइमलाइन दृश्य',
    'tab.entity_explorer': 'घटक अन्वेषक',
    'tab.generate_report': 'अहवाल तयार करा',

    // Verification Overview & TTS
    'overview.title': 'पडताळणी सारांश',
    'overview.ai_analysis': 'एआय विश्लेषण',
    'overview.view_detailed': 'तपशीलवार विश्लेषण पहा →',
    'overview.confidence_breakdown': 'विश्वासार्हता तपशील',
    'overview.metric.verified_sources': 'पडताळलेले स्रोत',
    'overview.metric.cross_source': 'क्रॉस-स्रोत जुळणी',
    'overview.metric.credibility': 'स्रोतांची विश्वासार्हता',
    'overview.metric.consistency': 'मजकुराची सुसंगतता',
    'overview.metric.anomaly': 'एआय विसंगती शोध',

    // TTS
    'tts.listen_summary': 'एआय ऑडिओ सारांश ऐका',
    'tts.playing': 'सारांश वाचत आहे...',
    'tts.pause': 'थांबवा',
    'tts.resume': 'पुन्हा सुरू करा',
    'tts.stop': 'बंद करा',
    'tts.claim_spoken': 'तपासला जाणारा दावा',
    'tts.verdict_spoken': 'अधिकृत निष्कर्ष',
    'tts.reality_spoken': 'तथ्य आणि वास्तविकता विश्लेषण',

    // Relevance Gate
    'relevance.rejected': 'पुरावा अप्रासंगिक: दावा अप्रमाणित',
    'relevance.desc': 'उपलब्ध पुरावे या शोधाच्या मुख्य विषयाशी जुळत नाहीत.',

    // Key Sources
    'sources.title': 'प्रमुख स्रोत आणि पुरावे',
    'sources.filter.all': 'सर्व',
    'sources.filter.news': 'बातम्या',
    'sources.filter.government': 'शासकीय',
    'sources.filter.social': 'सोशल मीडिया',
    'sources.view_source': 'स्रोत पहा →',
    'sources.verified': 'पडताळलेले',
    'sources.unverified': 'अपडताळलेले',

    // Related Entities
    'entities.title': 'संबंधित शोध व संस्था',
    'entities.subtitle': 'विस्तृत संदर्भासाठी संबंधित व्यक्ती आणि संस्था तपासा.',

    // Right Sidebar
    'insights.title': 'एआय अंतर्दृष्टी',
    'insights.no_records': 'कोणतीही अधिकृत नोंद आढळली नाही',
    'insights.no_records_desc': 'सरकारी किंवा विश्वासू वृत्तसंस्थांकडून कोणताही दुजोरा मिळालेला नाही.',
    'insights.origin': 'दाव्याचे मूळ',
    'insights.origin_desc': 'हा दावा सोशल मीडियावरील उपहासात्मक पोस्ट किंवा अफवेतून सुरू झाला.',
    'insights.similar': 'मागील घटना',
    'insights.similar_desc': 'हे यापूर्वी उघडकीस आलेल्या खोट्या बातम्यांप्रमाणेच आहे.',
    'insights.view_full': 'संपूर्ण विश्लेषण पहा →',

    'timeline.title': 'पुरावा टाइमलाइन',
    'timeline.view_all': 'सर्व पहा →',

    'export.title': 'निर्यात / शेअर करा',
    'export.subtitle': 'पडताळणी अहवाल डाउनलोड करा किंवा सहकाऱ्यांसोबत शेअर करा.',
    'export.download': 'अहवाल डाउनलोड करा',
    'export.share': 'विश्लेषण शेअर करा',

    // Community Poll
    'poll.title': 'समुदाय मतदान',
    'poll.desc': 'या निष्कर्षाच्या सत्यतेवर आपले मत नोंदवा.',
    'poll.supported': 'सत्य',
    'poll.disputed': 'वादग्रस्त',
    'poll.refuted': 'खोटे / अफवा',
    'poll.voted': 'मतदान झाले',
    'poll.vote_now': 'मत द्या',

    // Status Badges
    'status.likely_false': 'खोटे असण्याची शक्यता',
    'status.questionable': 'संशयास्पद',
    'status.supported': 'प्रमाणित',
    'status.likely_true': 'सत्य असण्याची शक्यता',
    'status.mixed': 'मिश्र पुरावे',
    'status.insufficient': 'अपुरा पुरावा'
  },

  gu: {
    // Nav
    'nav.home': 'હોમ',
    'nav.search': 'શોધ',
    'nav.investigations': 'તપાસ',
    'nav.evidence_library': 'પુરાવા સંગ્રહ',
    'nav.reports': 'અહેવાલો',
    'nav.monitoring': 'જીવંત દેખરેખ',
    'nav.knowledge_hub': 'જ્ઞાન કેન્દ્ર',
    'nav.settings': 'સેટિંગ્સ',
    'nav.community': 'સમુદાય',
    'nav.submit_claim': 'દાવો સબમિટ કરો',
    'nav.platform_workspace': 'પ્લેટફોર્મ વર્કસ્પેસ',
    'nav.analyst_platform': 'એનાલિસ્ટ પ્લેટફોર્મ',
    'nav.capabilities.search': 'અદ્યતન બહુ-સ્ત્રોત શોધ',
    'nav.capabilities.analysis': 'એઆઈ આધારિત તથ્ય વિશ્લેષણ',
    'nav.capabilities.verification': 'ક્રોસ-પ્લેટફોર્મ ચકાસણી',
    'nav.capabilities.export': 'અહેવાલ ડાઉનલોડ અને શેરિંગ',
    'nav.version': 'સત્યતા ચકાસાયેલ v3.2.0',

    // Top Header
    'header.search_placeholder': 'વ્યક્તિઓ, સંસ્થાઓ, બનાવો શોધો...',
    'header.live_system': 'લાઇવ સિસ્ટમ',
    'header.alerts': 'ગુપ્ત માહિતી ચેતવણીઓ',
    'header.active': 'સક્રિય',
    'header.switch_role': 'રોલ બદલો',
    'header.language': 'ભાષા',

    // Hero Section
    'hero.badge': 'ઇન્ટેલિજન્સ એનાલિસિસ હબ',
    'hero.headline': 'ચકાસો. તપાસો. અહેવાલ આપો.',
    'hero.subtitle': 'મહત્વના દાવાઓ અને ઘટનાઓ માટે બહુ-સ્ત્રોત અને એઆઈ આધારિત વિશ્લેષણ મેળવો.',
    'hero.search_placeholder': 'કોઈપણ દાવો અથવા બનાવ દાખલ કરો...',
    'hero.analyze': 'વિશ્લેષણ કરો →',
    'hero.analyzing': 'વિશ્લેષણ ચાલુ છે...',
    'hero.try': 'ઉદાહરણ:',

    // Subtabs
    'tab.quick_verify': 'ઝડપી ચકાસણી',
    'tab.multi_source': 'બહુ-સ્ત્રોત વિશ્લેષણ',
    'tab.timeline': 'સમયરેખા',
    'tab.entity_explorer': 'એન્ટિટી એક્સપ્લોરર',
    'tab.generate_report': 'અહેવાલ બનાવો',

    // Verification Overview & TTS
    'overview.title': 'ચકાસણી વિહંગાવલોકન',
    'overview.ai_analysis': 'એઆઈ વિશ્લેષણ',
    'overview.view_detailed': 'વિગતવાર વિશ્લેષણ જુઓ →',
    'overview.confidence_breakdown': 'વિશ્વસનીયતા વિગતો',
    'overview.metric.verified_sources': 'ચકાસાયેલ સ્ત્રોતો',
    'overview.metric.cross_source': 'સ્ત્રોત મેળ',
    'overview.metric.credibility': 'સ્ત્રોતોની વિશ્વસનીયતા',
    'overview.metric.consistency': 'સામગ્રીની સુસંગતતા',
    'overview.metric.anomaly': 'એઆઈ વિસંગતતા તપાસ',

    // TTS
    'tts.listen_summary': 'એઆઈ ઓડિયો સારાંશ સાંભળો',
    'tts.playing': 'સારાંશ વાંચી રહ્યા છીએ...',
    'tts.pause': 'થોભો',
    'tts.resume': 'ફરી શરૂ કરો',
    'tts.stop': 'બંધ કરો',
    'tts.claim_spoken': 'તપાસવામાં આવી રહેલો દાવો',
    'tts.verdict_spoken': 'સત્તાવાર નિર્ણય',
    'tts.reality_spoken': 'તથ્ય અને વાસ્તવિકતા વિશ્લેષણ',

    // Relevance Gate
    'relevance.rejected': 'પુરાવો અપ્રસ્તુત: દાવો બિનપુરાવાવાળો',
    'relevance.desc': 'મળેલા પુરાવા આ શોધના મુખ્ય વિષય સાથે મેળ ખાતા નથી.',

    // Key Sources
    'sources.title': 'મુખ્ય સ્ત્રોતો અને પુરાવા',
    'sources.filter.all': 'બધા',
    'sources.filter.news': 'સમાચાર',
    'sources.filter.government': 'સરકારી',
    'sources.filter.social': 'સોશિયલ મીડિયા',
    'sources.view_source': 'સ્ત્રોત જુઓ →',
    'sources.verified': 'ચકાસાયેલ',
    'sources.unverified': 'અચકાસાયેલ',

    // Related Entities
    'entities.title': 'સંબંધિત શોધો અને સંસ્થાઓ',
    'entities.subtitle': 'વ્યાપક સંદર્ભ માટે સંબંધિત વ્યક્તિઓ અને સંસ્થાઓ તપાસો.',

    // Right Sidebar
    'insights.title': 'એઆઈ આંતરદ્રષ્ટિ',
    'insights.no_records': 'કોઈ સત્તાવાર રેકોર્ડ મળ્યો નથી',
    'insights.no_records_desc': 'સરકારી અથવા વિશ્વસનીય સમાચાર એજન્સીઓ તરફથી કોઈ સમર્થન નથી.',
    'insights.origin': 'દાવાનું મૂળ',
    'insights.origin_desc': 'આ દાવો સોશિયલ મીડિયા પર વ્યંગ્યાત્મક પોસ્ટ અથવા અફવા દ્વારા ફેલાયો હતો.',
    'insights.similar': 'ભૂતકાળની ઘટનાઓ',
    'insights.similar_desc': 'આ અગાઉ બહાર આવેલા રાજકીય ખોટા સમાચારો જેવું જ છે.',
    'insights.view_full': 'સંપૂર્ણ વિશ્લેષણ જુઓ →',

    'timeline.title': 'પુરાવા સમયરેખા',
    'timeline.view_all': 'બધા જુઓ →',

    'export.title': 'નિકાસ / શેર કરો',
    'export.subtitle': 'ચકાસાયેલ અહેવાલ ડાઉનલોડ કરો અથવા સહકર્મીઓ સાથે શેર કરો.',
    'export.download': 'અહેવાલ ડાઉનલોડ કરો',
    'export.share': 'વિશ્લેષણ શેર કરો',

    // Community Poll
    'poll.title': 'સમુદાય મતદાન',
    'poll.desc': 'આ તારણની સત્યતા પર તમારો મત આપો.',
    'poll.supported': 'સાચું',
    'poll.disputed': 'વિવાદાસ્પદ',
    'poll.refuted': 'ખોટું / અફવા',
    'poll.voted': 'મત આપેલ છે',
    'poll.vote_now': 'મત આપો',

    // Status Badges
    'status.likely_false': 'ખોટું હોવાની સંભાવના',
    'status.questionable': 'શંકાસ્પદ',
    'status.supported': 'પ્રમાણિત',
    'status.likely_true': 'સાચું હોવાની સંભાવના',
    'status.mixed': 'મિશ્ર પુરાવા',
    'status.insufficient': 'અપૂરતો પુરાવો'
  }
};
