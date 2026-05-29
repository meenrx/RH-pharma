// =====================================================
// RH Pharma — Disclaimer Injector (v0.10.0)
// =====================================================
// แทรก disclaimer และ branding อัตโนมัติทุกโพสต์
// บริบทสื่อสุขภาพ: ต้องระบุชัดว่า
//   1. เป็นข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำเฉพาะบุคคล
//   2. ผู้ป่วยควรปรึกษาแพทย์/เภสัชกรก่อนตัดสินใจ
//   3. แหล่งข้อมูล/ผู้รับผิดชอบ (รพ./กลุ่มงาน)
// =====================================================

const DisclaimerInjector = (() => {

  // ===== Disclaimer สำเร็จรูปตามประเภทเนื้อหา =====
  const TEMPLATES = {
    th: {
      'general': '⚕️ ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำเฉพาะบุคคล โปรดปรึกษาเภสัชกร/แพทย์ก่อนตัดสินใจ',
      'drug-knowledge': '⚕️ ข้อมูลเพื่อการศึกษาเรื่องยา ผู้ป่วยแต่ละรายอาจใช้ยาแตกต่างกัน โปรดปรึกษาเภสัชกรประจำตัว',
      'adr-alert': '⚠️ หากมีข้อสงสัยเกี่ยวกับผลข้างเคียง อย่าหยุดยาเองทันที — โทรปรึกษาแพทย์/เภสัชกรก่อน',
      'disease-prevention': '⚕️ ข้อมูลทั่วไปเพื่อการป้องกันโรค ไม่ใช่การวินิจฉัย หากมีอาการผิดปกติให้พบแพทย์',
      'health-behavior': '⚕️ ข้อมูลส่งเสริมพฤติกรรมสุขภาพ เหมาะกับคนทั่วไป ผู้มีโรคประจำตัวควรปรึกษาแพทย์ก่อนปรับเปลี่ยน',
      'qa': '⚕️ คำตอบเป็นข้อมูลทั่วไป กรณีเฉพาะรายควรปรึกษาเภสัชกร/แพทย์',
      'warning': '⚠️ ข้อมูลเตือนภัย หากมีอาการดังกล่าวให้รีบพบแพทย์ทันที',
      'pediatric': '⚕️ ข้อมูลทั่วไปเรื่องยา/สุขภาพในเด็ก ขนาดยาในเด็กแตกต่างตามน้ำหนัก/อายุ โปรดปรึกษาเภสัชกร',
      'pregnancy': '⚕️ การใช้ยาในหญิงตั้งครรภ์/ให้นมบุตร ต้องประเมินเป็นรายบุคคล โปรดปรึกษาแพทย์/เภสัชกรเสมอ',
      'elderly': '⚕️ ผู้สูงอายุมักใช้ยาหลายชนิด ต้องระวังปฏิกิริยาระหว่างยา โปรดปรึกษาเภสัชกร'
    },
    ms: {
      'general': '⚕️ Maklumat untuk pendidikan, bukan nasihat individu. Sila berunding dengan ahli farmasi/doktor.',
      'drug-knowledge': '⚕️ Maklumat ubat untuk pendidikan. Penggunaan setiap pesakit berbeza. Sila berunding dengan ahli farmasi.',
      'adr-alert': '⚠️ Jika syak kesan sampingan, jangan hentikan ubat sendiri. Hubungi doktor/farmasi dahulu.',
      'disease-prevention': '⚕️ Maklumat pencegahan umum, bukan diagnosis. Jika ada gejala, sila berjumpa doktor.',
      'health-behavior': '⚕️ Maklumat kesihatan umum. Pesakit kronik perlu berunding doktor sebelum perubahan.',
      'qa': '⚕️ Jawapan ini bersifat umum. Untuk kes individu, sila berunding ahli farmasi/doktor.',
      'warning': '⚠️ Jika anda mengalami simptom ini, segera berjumpa doktor.',
      'pediatric': '⚕️ Dos ubat untuk kanak-kanak bergantung berat/umur. Sila berunding ahli farmasi.',
      'pregnancy': '⚕️ Penggunaan ubat semasa hamil/menyusu mestilah dinilai oleh doktor.',
      'elderly': '⚕️ Warga emas mungkin guna banyak ubat. Sila berunding ahli farmasi untuk elakkan interaksi.'
    },
    en: {
      'general': '⚕️ Educational information only — not personal medical advice. Please consult a pharmacist/physician.',
      'drug-knowledge': '⚕️ Drug information for education. Individual treatment may vary. Consult your pharmacist.',
      'adr-alert': '⚠️ If you suspect a side effect, do not stop medication on your own. Consult your provider first.',
      'disease-prevention': '⚕️ General prevention information, not a diagnosis. See a doctor if symptoms appear.',
      'health-behavior': '⚕️ General health guidance. Patients with chronic conditions should consult a provider.',
      'qa': '⚕️ These answers are general. For specific cases, please consult a pharmacist/physician.',
      'warning': '⚠️ If you experience these symptoms, seek medical attention promptly.',
      'pediatric': '⚕️ Pediatric doses depend on weight/age. Please consult a pharmacist.',
      'pregnancy': '⚕️ Drug use during pregnancy/lactation requires individual assessment by a provider.',
      'elderly': '⚕️ Older adults often take multiple drugs. Consult a pharmacist to avoid interactions.'
    }
  };

  // ===== Branding footer =====
  function buildBranding(settings = {}, language = 'th') {
    const hospital = settings.hospitalName || 'โรงพยาบาลรือเสาะ';
    const dept = settings.department || 'กลุ่มงานเภสัชกรรม';
    const phone = settings.phoneNumber || '';
    const hashtag = settings.hashtag || '#รพรือเสาะ #เภสัชกรรม';

    if (language === 'ms') {
      return [
        `🏥 ${hospital === 'โรงพยาบาลรือเสาะ' ? 'Hospital Rueso' : hospital}`,
        `👨‍⚕️ ${dept === 'กลุ่มงานเภสัชกรรม' ? 'Jabatan Farmasi' : dept}`,
        phone ? `📞 ${phone}` : null,
        hashtag
      ].filter(Boolean).join('\n');
    }
    if (language === 'en') {
      return [
        `🏥 ${hospital === 'โรงพยาบาลรือเสาะ' ? 'Rueso Hospital' : hospital}`,
        `👨‍⚕️ ${dept === 'กลุ่มงานเภสัชกรรม' ? 'Department of Pharmacy' : dept}`,
        phone ? `📞 ${phone}` : null,
        hashtag
      ].filter(Boolean).join('\n');
    }
    return [
      `🏥 ${hospital}`,
      `👨‍⚕️ ${dept}`,
      phone ? `📞 ${phone}` : null,
      hashtag
    ].filter(Boolean).join('\n');
  }

  // ===== แทรก disclaimer + branding ลงในข้อความ =====
  function inject(text, options = {}) {
    const language = options.language || 'th';
    const category = options.category || 'general';
    const settings = options.settings || {};
    const includeBranding = options.includeBranding !== false;
    const includeDisclaimer = options.includeDisclaimer !== false;

    const langTpl = TEMPLATES[language] || TEMPLATES.th;
    const disclaimer = options.customDisclaimer
      || settings.defaultDisclaimer
      || langTpl[category]
      || langTpl.general;

    let result = (text || '').trim();

    // ตัด disclaimer/branding เก่าออกก่อน (กันซ้ำ)
    result = stripExisting(result);

    if (includeDisclaimer) {
      result += '\n\n' + disclaimer;
    }
    if (includeBranding) {
      result += '\n\n' + buildBranding(settings, language);
    }
    return result.trim();
  }

  // ===== ตัด disclaimer/branding เดิมออก เพื่อกัน double-injection =====
  function stripExisting(text) {
    if (!text) return '';
    let out = text;
    const markers = [
      /⚕️[^\n]*?(?:ปรึกษา|consult|berunding)[^\n]*/gi,
      /⚠️[^\n]*?(?:หยุดยา|stop medication|hentikan)[^\n]*/gi,
      /🏥\s*โรงพยาบาล[^\n]*/g,
      /🏥\s*Hospital[^\n]*/g,
      /🏥\s*รพ\.[^\n]*/g,
      /👨‍⚕️[^\n]*/g,
      /📞\s*[\d\-\s]+/g
    ];
    for (const m of markers) out = out.replace(m, '');
    return out.replace(/\n{3,}/g, '\n\n').trim();
  }

  // ===== แนะนำ category อัตโนมัติจากเนื้อหา =====
  function detectCategory(text) {
    if (!text) return 'general';
    const lower = text.toLowerCase();
    if (/ผลข้างเคียง|side effect|adr|stevens|จุดเลือดออก/i.test(lower)) return 'adr-alert';
    if (/ตั้งครรภ์|pregnan|hamil/i.test(lower)) return 'pregnancy';
    if (/(เด็ก|ทารก|child|infant|kanak)/i.test(lower)) return 'pediatric';
    if (/(ผู้สูงอายุ|elderly|warga emas)/i.test(lower)) return 'elderly';
    if (/(วิธีกินยา|ขนาดยา|dose|dosage)/i.test(lower)) return 'drug-knowledge';
    if (/(ป้องกัน|prevent|cegah|วัคซีน)/i.test(lower)) return 'disease-prevention';
    if (/(ออกกำลังกาย|อาหาร|พฤติกรรม)/i.test(lower)) return 'health-behavior';
    if (/(\?|ทำไม|how|why|kenapa)/i.test(text)) return 'qa';
    return 'general';
  }

  return {
    inject,
    stripExisting,
    detectCategory,
    buildBranding,
    TEMPLATES
  };
})();

window.DisclaimerInjector = DisclaimerInjector;
console.log('[DisclaimerInjector] loaded');
