export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  locale: string;
  samplePrompts: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  };
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    locale: 'en-US',
    samplePrompts: {
      beginner: [
        'I would like to order a cup of coffee, please.',
        'My name is Alex and I am learning languages.',
        'The weather is very warm and pleasant today.'
      ],
      intermediate: [
        'Yesterday I went to college and attended three lectures.',
        'If I have enough free time this weekend, I will visit the botanical gardens.',
        'Even though it was raining heavily, we enjoyed our morning walk.'
      ],
      advanced: [
        'Had we taken those potential bottlenecks into consideration earlier, the rollout would have been smoother.',
        'Notwithstanding recent market fluctuations, our quarterly performance exceeded strategic forecasts.',
        'It is paramount that we reconcile competing priorities before finalizing the allocation of resources.'
      ]
    }
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    locale: 'hi-IN',
    samplePrompts: {
      beginner: [
        'नमस्ते, मेरा नाम राहुल है और मैं भारत से हूँ।',
        'कृपया मुझे एक कप गर्म चाय दीजिए।',
        'आज का मौसम बहुत सुहावना और धूप वाला है।'
      ],
      intermediate: [
        'कल शाम मैं अपने दोस्तों के साथ बाज़ार गया था।',
        'अगर इस सप्ताहांत समय मिला, तो हम ऐतिहासिक स्थल घूमने चलेंगे।',
        'रोज़ाना बोलने का अभ्यास करने से आत्मविश्वास और भाषा पर पकड़ मजबूत होती है।'
      ],
      advanced: [
        'आधुनिक युग में तीव्र तकनीकी प्रगति के साथ-साथ नैतिक मूल्यों का संरक्षण भी अनिवार्य है।',
        'यदि हमने समय रहते इन पर्यावरणीय चुनौतियों का समाधान नहीं निकाला, तो भावी पीढ़ी को भारी क्षति उठानी पड़ेगी।',
        'वैश्विक अर्थव्यवस्था में विविधता और समावेशिता को प्रोत्साहित करने वाली नीतियां दीर्घकालिक समृद्धि लाती हैं।'
      ]
    }
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    locale: 'te-IN',
    samplePrompts: {
      beginner: [
        'నమస్కారం, నా పేరు రమేష్, నేను కొత్త విషయాలు నేర్చుకోవడానికి ఇష్టపడతాను.',
        'దయచేసి నాకు ఒక గ్లాసు మంచినీళ్లు ఇవ్వండి.',
        'ఈ రోజు వాతావరణం చాలా ఆహ్లాదకరంగా మరియు చల్లగా ఉంది.'
      ],
      intermediate: [
        'నిన్న సాయంత్రం నేను నా స్నేహితులతో కలిసి గ్రంథాలయానికి వెళ్లాను.',
        'వారాంతంలో సమయం దొరికితే, నేను మా కుటుంబంతో కలిసి ప్రయాణం చేస్తాను.',
        'రోజూ భాషను మాట్లాడటం ద్వారా మనం సులభంగా పట్టు సాధించవచ్చు.'
      ],
      advanced: [
        'సమాజ సమగ్ర వికాసానికి నాణ్యమైన విద్య మరియు ఆధునిక సాంకేతిక పరిజ్ఞానం అత్యంత ఆవశ్యకం.',
        'సమస్యల మూలాలను విశ్లేషించి దీర్ఘకాలిక వ్యూహాత్మక ప్రణాళికలు రూపొందించడం అవసరం.',
        'మన ప్రాచీన సంస్కృతి మరియు కళారూపాలను పరిరక్షించుకుంటూ ఆధునికతను ఆహ్వానించాలి.'
      ]
    }
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    locale: 'kn-IN',
    samplePrompts: {
      beginner: [
        'ನಮಸ್ಕಾರ, ನನ್ನ ಹೆಸರು ಆನಂದ್, ನಾನು ಹೊಸ ಭಾಷೆಗಳನ್ನು ಕಲಿಯುತ್ತಿದ್ದೇನೆ.',
        'ದಯವಿಟ್ಟು ನನಗೆ ಒಂದು ಕಪ್ ಬಿಸಿ ಕಾಫಿ ಕೊಡಿ.',
        'ಇವತ್ತು ಹವಾಮಾನ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ ಮತ್ತು ಬಿಸಿಲಿದೆ.'
      ],
      intermediate: [
        'ನಿನ್ನೆ ಸಂಜೆ ನಾನು ಗೆಳೆಯರ ಜೊತೆ ಉದ್ಯಾನವನಕ್ಕೆ ಹೋಗಿ ಸಮಯ ಕಳೆದೆ.',
        'ಮುಂದಿನ ವಾರ ರಜೆ ಸಿಕ್ಕರೆ ನಾನು ಕರಾವಳಿ ಪ್ರದೇಶಕ್ಕೆ ಪ್ರವಾಸ ಹೋಗುತ್ತೇನೆ.',
        'ಪ್ರತಿದಿನ ಮಾತನಾಡುವ ಅಭ್ಯಾಸ ಬೆಳೆಸಿಕೊಂಡರೆ ಭಾಷೆಯನ್ನು ಸರಾಗವಾಗಿ ಕಲಿಯಬಹುದು.'
      ],
      advanced: [
        'ಆಧುನಿಕ ಶಿಕ್ಷಣ ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ತಂತ್ರಜ್ಞಾನದ ಸಮರ್ಥ ಬಳಕೆ ವಿದ್ಯಾರ್ಥಿಗಳ ಬೆಳವಣಿಗೆಗೆ ಪೂರಕವಾಗಿದೆ.',
        'ಯಾವುದೇ ಸವಾಲನ್ನು ಎದುರಿಸಲು ನಿರಂತರ ಪರಿಶ್ರಮ ಮತ್ತು ಸಕಾರಾತ್ಮಕ ದೃಷ್ಟಿಕೋನ ಅತ್ಯಂತ ಅಗತ್ಯ.',
        'ನಮ್ಮ ಶ್ರೀಮಂತ ಸಾಹಿತ್ಯ ಪರಂಪರೆ ಮತ್ತು ಜಾನಪದ ಕಲೆಗಳನ್ನು ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಕೊಂಡೊಯ್ಯುವುದು ನಮ್ಮ ಕರ್ತವ್ಯ.'
      ]
    }
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    locale: 'ml-IN',
    samplePrompts: {
      beginner: [
        'നമസ്കാരം, എന്റെ പേര് രാഹുൽ എന്നാണ്, എനിക്ക് പുതിയ ഭാഷകൾ പഠിക്കാൻ ഇഷ്ടമാണ്.',
        'ദയവായി എനിക്ക് ഒരു ഗ്ലാസ്സ് വെള്ളം തരുമോ?',
        'ഇന്ന് കാലാവസ്ഥ വളരെ മനോഹരവും കുളിർമയുള്ളതുമാണ്.'
      ],
      intermediate: [
        'ഇന്നലെ വൈകുന്നേരം ഞാൻ സുഹൃത്തുക്കളോടൊപ്പം പുസ്തകശാല സന്ദർശിച്ചു.',
        'അടുത്ത ആഴ്ച ഒഴിവുസമയം ലഭിച്ചാൽ ഞാൻ ഒരു പുതിയ പുസ്തകം വായിച്ചു തീർക്കും.',
        'ദിവസവും സംസാരിച്ചു പരിശീലിച്ചാൽ ഏതു ഭാഷയിലും നല്ല പ്രാവീണ്യം നേടാം.'
      ],
      advanced: [
        'സുസ്ഥിര വികസനത്തിന് പരിസ്ഥിതി സൗഹൃദപരമായ സമീപനങ്ങളും വിഭവങ്ങളുടെ കാര്യക്ഷമമായ വിനിയോഗവും അത്യന്താപേക്ഷിതമാണ്.',
        'സാങ്കേതികവിദ്യയുടെ മുന്നേറ്റം പുതിയ സാധ്യതകൾ തുറക്കുമ്പോൾ അതിന്റെ ഉത്തരവാദിത്തപരമായ ഉപയോഗം ഉറപ്പാക്കണം.',
        'വിദ്യാഭ്യാസവും സാംസ്കാരിക മൂല്യങ്ങളും പരസ്പരം ഇഴചേർന്നു നിൽക്കുമ്പോഴാണ് ഒരു സമൂഹത്തിന് യഥാർത്ഥ പുരോഗതി കൈവരുന്നത്.'
      ]
    }
  }
];
