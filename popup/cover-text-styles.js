// =====================================================
// RH Pharma — Cover Text Styles (v0.10.0)
// =====================================================
// สไตล์ headline บนปก infographic/วิดีโอสุขภาพ
// แนวคิดจาก KruBank coverTextStyles แต่ปรับให้เหมาะกับเนื้อหาสุขภาพและกฎ พ.ร.บ. ยา
// =====================================================

const CoverTextStyles = (() => {

  const STYLES = [
    {
      id: 'urgent-warning',
      label: '⚠️ เตือนภัย/Alert',
      icon: '⚠️',
      tone: 'urgent',
      bestFor: ['ADR', 'drug recall', 'อาการอันตราย'],
      typography: 'ตัวอักษรหนามาก สีแดง พื้นเหลือง',
      promptEn: 'bold red urgent warning headline on yellow background, large impactful sans-serif, alert badge style, high contrast, attention-grabbing but professional medical context',
      promptTh: 'หัวข้อตัวหนาสีแดงบนพื้นเหลือง ดูเป็นเตือนภัย คอนทราสต์สูง แต่ยังคงดูเป็นวิชาการแพทย์',
      examples: [
        'หยุดยาทันที! ถ้ามีอาการนี้',
        '⚠️ ระวัง — ห้ามใช้ร่วมกับยานี้',
        'อาการที่ต้องรีบพบแพทย์'
      ]
    },
    {
      id: 'friendly-tip',
      label: '💡 เคล็ดลับ/Tip',
      icon: '💡',
      tone: 'friendly',
      bestFor: ['การใช้ยาในชีวิตประจำวัน', 'health tip'],
      typography: 'ตัวมน อ่านง่าย สีฟ้า/เขียวอ่อน',
      promptEn: 'friendly health tip headline, rounded soft sans-serif, light blue or mint green background, light bulb icon, approachable and reassuring medical tone',
      promptTh: 'หัวข้อเป็นเคล็ดลับ ตัวอักษรมน อ่านง่าย พื้นฟ้าหรือเขียวอ่อน มี icon หลอดไฟ',
      examples: [
        'เคล็ดลับกินยาให้ไม่ลืม',
        'รู้ไหม? ยานี้ต้องกินตอน...',
        '3 เทคนิคเก็บยาให้คงคุณภาพ'
      ]
    },
    {
      id: 'question-hook',
      label: '❓ ตั้งคำถาม',
      icon: '❓',
      tone: 'curious',
      bestFor: ['Q&A', 'myth-busting', 'ดึงดูดคลิก'],
      typography: 'คำถามใหญ่ + ? ตัวใหญ่',
      promptEn: 'engaging question headline with large emphasized question mark, modern editorial style, medical magazine feel, draws curiosity',
      promptTh: 'หัวข้อเป็นคำถาม ตัว ? ใหญ่เด่น สไตล์ editorial นิตยสารแพทย์ ดึงดูดความสงสัย',
      examples: [
        'ยาความดัน...กินตอนเช้าหรือเย็น?',
        'แพ้ยา vs ผลข้างเคียง ต่างกันยังไง?',
        'ลืมกินยา 1 มื้อ ต้องทำยังไง?'
      ]
    },
    {
      id: 'number-list',
      label: '🔢 ลิสต์เลข',
      icon: '🔢',
      tone: 'informative',
      bestFor: ['Top 5 / Top 10', 'how-to', 'key facts'],
      typography: 'ตัวเลขใหญ่ + หัวข้อหลัก',
      promptEn: 'big bold number with topic headline, infographic top-list style, professional health magazine layout',
      promptTh: 'ตัวเลขใหญ่หนา + หัวข้อตัวรอง สไตล์ลิสต์นิตยสารสุขภาพ',
      examples: [
        '5 ยาที่ห้ามกินกับแอลกอฮอล์',
        '3 ขั้นตอน หยอดตาให้ถูกวิธี',
        'TOP 10 ผลข้างเคียงต้องรู้'
      ]
    },
    {
      id: 'comparison',
      label: '⚖️ เปรียบเทียบ',
      icon: '⚖️',
      tone: 'analytical',
      bestFor: ['ยา A vs ยา B', 'จริง vs เท็จ', 'ก่อน vs หลัง'],
      typography: 'แบ่งครึ่ง — 2 สี',
      promptEn: 'split-screen comparison headline, divided color blocks, equal weight on both sides, balanced professional design',
      promptTh: 'หัวข้อแบบแบ่งครึ่ง 2 สี ดูเปรียบเทียบ ทั้ง 2 ฝั่งน้ำหนักเท่ากัน',
      examples: [
        'ยาแก้ปวด: PCM vs NSAID',
        'แพ้ยา ≠ ดื้อยา',
        'ก่อนกินยา vs หลังกินยา'
      ]
    },
    {
      id: 'myth-busting',
      label: '🔥 ทุบความเข้าใจผิด',
      icon: '🔥',
      tone: 'corrective',
      bestFor: ['ความเชื่อผิดๆ', 'fake news', 'fact-check'],
      typography: 'ปั๊ม "ผิด!" สีแดง ตัวหนา',
      promptEn: 'bold "MYTH BUSTED" style headline, red stamp effect, fact-check infographic, authoritative medical correction',
      promptTh: 'หัวข้อแบบทุบความเชื่อผิด มีปั๊ม "ผิด!" สีแดง สไตล์ fact-check',
      examples: [
        'จริงหรือ? ยาแก้ปวดทำให้ติด',
        '❌ กินยาคุมแล้วเป็นมะเร็ง — ความจริงคือ...',
        'MYTH: ยาฆ่าเชื้อกินจนหายแล้วหยุดได้'
      ]
    },
    {
      id: 'gentle-care',
      label: '🌸 อ่อนโยน/Care',
      icon: '🌸',
      tone: 'gentle',
      bestFor: ['ดูแลผู้สูงอายุ', 'pediatric', 'mental health', 'pregnancy'],
      typography: 'ตัวอักษรนุ่ม สีพาสเทล',
      promptEn: 'gentle caring headline, soft pastel colors, rounded serif font, warm care-focused medical design, mother-and-child friendly',
      promptTh: 'หัวข้อแบบอ่อนโยน นุ่ม สีพาสเทล ฟอนต์โค้งมน อบอุ่น เน้นการดูแล',
      examples: [
        'ดูแลคุณยาย กินยาให้ถูก',
        'อาหารเสริมแม่ตั้งครรภ์',
        'ป้อนยาลูกน้อยอย่างไรให้ปลอดภัย'
      ]
    },
    {
      id: 'clinical-modern',
      label: '🏥 คลินิกโมเดิร์น',
      icon: '🏥',
      tone: 'professional',
      bestFor: ['HCP audience', 'CPG summary', 'clinical pearl'],
      typography: 'ตัวอักษรสะอาด ฟอนต์โมเดิร์น',
      promptEn: 'clean modern clinical headline, white background with blue accent line, sans-serif modern professional medical journal style',
      promptTh: 'หัวข้อสไตล์คลินิกโมเดิร์น ขาวสะอาด เส้นน้ำเงิน ฟอนต์ sans-serif สไตล์ medical journal',
      examples: [
        'CPG Update — HT Management 2024',
        'Clinical Pearl: Warfarin dosing',
        'Drug Interaction Update'
      ]
    },
    {
      id: 'islamic-modest',
      label: '☪️ สไตล์อิสลาม',
      icon: '☪️',
      tone: 'modest-respectful',
      bestFor: ['คนไข้มุสลิม', 'งานในจังหวัดชายแดนใต้'],
      typography: 'ลายเรขาคณิตอิสลาม + ฟอนต์อ่านง่าย',
      promptEn: 'modest Islamic geometric pattern border headline, respectful color palette of green and gold, halal-friendly medical design for southern Thailand Muslim community',
      promptTh: 'หัวข้อมีกรอบลายเรขาคณิตอิสลาม สีเขียวทอง ดูสุภาพ เหมาะกับคนไข้มุสลิมจังหวัดชายแดนใต้',
      examples: [
        'ยานี้ฮาลาลไหม?',
        'การใช้ยาช่วงเดือนรอมฎอน',
        'Doa untuk kesihatan + เรื่องยา'
      ]
    },
    {
      id: 'series-day',
      label: '📅 ซีรีส์รายวัน',
      icon: '📅',
      tone: 'sequential',
      bestFor: ['Day 1 of 7', 'multi-day campaign'],
      typography: 'Badge "Day X" มุมบน',
      promptEn: 'series episode style headline with "Day X/N" badge in top corner, consistent design across episodes, sequential storytelling',
      promptTh: 'หัวข้อสไตล์ซีรีส์ มี badge "Day X/N" มุมบน ดีไซน์เป็นชุดต่อเนื่อง',
      examples: [
        'Day 1/7 — รู้จักยาเบาหวาน',
        'Day 3/5 — เทคนิคพ่น MDI',
        'EP.2 — อาการที่ต้องเฝ้าระวัง'
      ]
    }
  ];

  function getById(id) {
    return STYLES.find(s => s.id === id) || null;
  }

  function getBestForCategory(category) {
    // map content category → suggested styles
    const map = {
      'adr-alert': ['urgent-warning', 'myth-busting'],
      'drug-knowledge': ['number-list', 'clinical-modern', 'friendly-tip'],
      'qa': ['question-hook', 'myth-busting'],
      'disease-prevention': ['friendly-tip', 'number-list', 'islamic-modest'],
      'health-behavior': ['friendly-tip', 'series-day'],
      'pediatric': ['gentle-care', 'friendly-tip'],
      'pregnancy': ['gentle-care', 'islamic-modest'],
      'elderly': ['gentle-care', 'number-list'],
      'professional': ['clinical-modern', 'number-list']
    };
    const ids = map[category] || ['friendly-tip', 'number-list'];
    return ids.map(getById).filter(Boolean);
  }

  function buildHeadlinePrompt(text, styleId, options = {}) {
    const style = getById(styleId) || STYLES[1];
    const lang = options.language || 'th';
    const ratio = options.ratio || '1:1';
    return `Create infographic cover for health communication by Rueso Hospital Pharmacy Department.

Headline text: "${text}"
Style: ${style.promptEn}
Aspect ratio: ${ratio}
Language: ${lang}
Tone: ${style.tone}

Requirements:
- Headline must be highly readable (large, bold)
- ${lang === 'th' ? 'Thai script must be rendered correctly (use Nano Banana Pro for accurate Thai text)' : ''}
- Professional medical/health context — not commercial advertising
- No claims of "cure", "100% effective", or other prohibited language
- Hospital pharmacy branding context
- Empty space at bottom for disclaimer line`;
  }

  return {
    STYLES,
    getById,
    getBestForCategory,
    buildHeadlinePrompt,
    list: () => STYLES
  };
})();

window.CoverTextStyles = CoverTextStyles;
console.log('[CoverTextStyles] loaded —', CoverTextStyles.STYLES.length, 'styles');
