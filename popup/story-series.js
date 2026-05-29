// =====================================================
// RH Pharma — Health Story Series (v0.10.0)
// =====================================================
// สร้างชุดสื่อสุขภาพต่อเนื่อง (campaign 5-14 ตอน)
// แรงบันดาลใจ KruBank story-mode — แต่บริบทเป็น "การให้ความรู้สุขภาพแบบ series"
// ตัวอย่าง:
//   - "รู้จักยาเบาหวาน 7 วัน 7 ตอน"
//   - "ดูแลตัวเองหลังผ่าตัด 5 วัน"
//   - "เทคนิคพ่นยา MDI 3 ตอน"
//   - "Ramadan & ยาเรื้อรัง — 30 ตอน"
// =====================================================

const StorySeries = (() => {

  // ===== Series Templates =====
  const SERIES_TEMPLATES = {
    'drug-7day': {
      label: '💊 รู้จักยา 1 ตัว ใน 7 วัน',
      episodes: 7,
      arc: [
        { day: 1, theme: 'รู้จักยานี้', focus: 'ชื่อ ใช้รักษาอะไร ออกฤทธิ์ยังไง' },
        { day: 2, theme: 'วิธีกินถูกต้อง', focus: 'เวลา ขนาด ก่อน/หลังอาหาร' },
        { day: 3, theme: 'ผลข้างเคียงที่พบบ่อย', focus: 'อาการเล็กน้อยที่อาจเจอ' },
        { day: 4, theme: 'ผลข้างเคียงที่ต้องระวัง', focus: 'อาการที่ต้องหยุดยา + พบแพทย์' },
        { day: 5, theme: 'ยานี้ห้ามใช้ร่วมกับอะไร', focus: 'DDI ที่สำคัญ + อาหาร' },
        { day: 6, theme: 'ลืมกินยา ทำยังไง?', focus: 'แนวปฏิบัติเมื่อลืม' },
        { day: 7, theme: 'ตรวจอะไรบ้างเมื่อใช้ยานี้', focus: 'Lab + อาการต้อง monitor' }
      ]
    },
    'post-op-5day': {
      label: '🩹 ดูแลตัวเองหลังผ่าตัด 5 วัน',
      episodes: 5,
      arc: [
        { day: 1, theme: 'วันที่ 1 หลังกลับบ้าน', focus: 'การดูแลแผล สัญญาณเตือน' },
        { day: 2, theme: 'อาหารและน้ำดื่ม', focus: 'กินอะไรได้ ห้ามอะไร' },
        { day: 3, theme: 'การกินยาแก้ปวด', focus: 'ยาแก้ปวด + ยา ATB ที่ได้รับ' },
        { day: 4, theme: 'การออกกำลังกาย/ทำกิจกรรม', focus: 'ค่อยๆ ขยับ ห้ามอะไร' },
        { day: 5, theme: 'สัญญาณที่ต้องกลับ รพ.', focus: 'แผลแดง บวม ไข้ ปวดรุนแรง' }
      ]
    },
    'inhaler-technique-3': {
      label: '🌬️ พ่นยา MDI ถูกวิธี 3 ตอน',
      episodes: 3,
      arc: [
        { day: 1, theme: 'เตรียมยา', focus: 'เขย่ายา ถอดฝา ตรวจอุปกรณ์' },
        { day: 2, theme: 'พ่นยา', focus: 'หายใจออกสุด พ่นพร้อมสูดเข้า' },
        { day: 3, theme: 'หลังพ่นยา', focus: 'กลั้นหายใจ 10 วินาที บ้วนปาก' }
      ]
    },
    'ramadan-chronic': {
      label: '🌙 รอมฎอน + ยาเรื้อรัง',
      episodes: 4,
      arc: [
        { day: 1, theme: 'เตรียมตัวก่อนรอมฎอน', focus: 'ปรึกษาเภสัชกรล่วงหน้า ปรับยา' },
        { day: 2, theme: 'ยาเบาหวาน + การถือศีลอด', focus: 'ปรับเวลาฉีดอินซูลิน อาการน้ำตาลต่ำ' },
        { day: 3, theme: 'ยาความดัน/หัวใจ', focus: 'ยาขับปัสสาวะ ปรับเวลา' },
        { day: 4, theme: 'สัญญาณที่ต้องเลิกถือศีลอด', focus: 'หน้ามืด อ่อนแรง น้ำตาลต่ำรุนแรง' }
      ]
    },
    'pregnancy-month': {
      label: '🤰 ดูแลตัวเองเดือนละตอน (9 ตอน)',
      episodes: 9,
      arc: [
        { day: 1, theme: 'เดือนที่ 1 — รู้ว่าตั้งครรภ์', focus: 'หยุดยาที่ teratogenic + folic acid' },
        { day: 2, theme: 'เดือนที่ 2 — แพ้ท้อง', focus: 'อาหาร ยาแก้คลื่นไส้ที่ใช้ได้' },
        { day: 3, theme: 'เดือนที่ 3 — ฝากครรภ์', focus: 'วัคซีน lab' },
        { day: 4, theme: 'เดือนที่ 4-5', focus: 'อาหาร เหล็ก แคลเซียม' },
        { day: 5, theme: 'เดือนที่ 6', focus: 'ลูกดิ้น สัญญาณผิดปกติ' },
        { day: 6, theme: 'เดือนที่ 7', focus: 'อาการครรภ์เป็นพิษ' },
        { day: 7, theme: 'เดือนที่ 8', focus: 'เตรียมตัวคลอด' },
        { day: 8, theme: 'เดือนที่ 9', focus: 'สัญญาณคลอด เจ็บครรภ์จริง vs เตือน' },
        { day: 9, theme: 'หลังคลอด', focus: 'การให้นม ยาที่ใช้ได้ตอนให้นม' }
      ]
    },
    'elderly-polypharmacy-14': {
      label: '👴 ผู้สูงอายุ + ยาหลายตัว 14 วัน',
      episodes: 14,
      arc: [
        { day: 1, theme: 'ทำไมต้องระวัง polypharmacy', focus: 'ยา > 5 ตัว = ความเสี่ยง' },
        { day: 2, theme: 'การจัดยาแบบกล่อง', focus: 'pill organizer แบ่งวัน' },
        { day: 3, theme: 'ยาที่ต้องระวังในผู้สูงอายุ', focus: 'Beers criteria highlights' },
        { day: 4, theme: 'อาการมึน หน้ามืด', focus: 'orthostatic hypotension' },
        { day: 5, theme: 'ฉี่บ่อย กลั้นไม่ได้', focus: 'ยาขับปัสสาวะ ปรับเวลา' },
        { day: 6, theme: 'นอนไม่หลับ', focus: 'BZD risk ในผู้สูงอายุ' },
        { day: 7, theme: 'ท้องผูก', focus: 'ยาที่ทำให้ท้องผูก + อาหาร' },
        { day: 8, theme: 'หกล้ม', focus: 'ยาที่เพิ่ม fall risk' },
        { day: 9, theme: 'ลืมกินยา', focus: 'เทคนิคช่วยจำ' },
        { day: 10, theme: 'การกลืนยา', focus: 'ยาที่บดได้/ไม่ได้' },
        { day: 11, theme: 'ยาเสริม สมุนไพร', focus: 'อันตรายของ self-medication' },
        { day: 12, theme: 'เมื่อต้องเข้า รพ.', focus: 'เตรียมรายการยาให้แพทย์' },
        { day: 13, theme: 'การปรึกษาเภสัชกร', focus: 'medication review' },
        { day: 14, theme: 'สรุป — checklist', focus: 'ผู้สูงอายุที่ใช้ยาปลอดภัย' }
      ]
    },
    'antibiotic-stewardship-5': {
      label: '🦠 ใช้ยาฆ่าเชื้อให้ถูก 5 ตอน',
      episodes: 5,
      arc: [
        { day: 1, theme: 'ยาฆ่าเชื้อคืออะไร', focus: 'ATB ≠ ยาแก้ไข้/แก้หวัด' },
        { day: 2, theme: 'หวัด vs ไข้หวัดใหญ่ vs แบคทีเรีย', focus: 'อันไหนต้องใช้ ATB' },
        { day: 3, theme: 'ทำไมต้องกินครบ', focus: 'ดื้อยา (AMR)' },
        { day: 4, theme: 'อาการแพ้ยา', focus: 'รุนแรง + เล็กน้อย' },
        { day: 5, theme: 'AMR ในไทย', focus: 'สถานการณ์และสิ่งที่ทำได้' }
      ]
    }
  };

  // ===== สร้าง series episodes ด้วย AI =====
  async function generateSeries(opts) {
    const {
      templateId,
      customTopic,
      drugName,
      audience = 'public',
      language = 'th',
      episodes,
      hospitalContext = ''
    } = opts;

    const template = SERIES_TEMPLATES[templateId];
    let arc;
    let totalEps;

    if (template) {
      arc = template.arc;
      totalEps = template.episodes;
    } else {
      // custom series — ให้ AI สร้าง arc เอง
      totalEps = episodes || 5;
      arc = await generateCustomArc(customTopic, totalEps, audience, language);
    }

    if (!window.RHAI) throw new Error('ต้องมี AI helper (RHAI)');

    const aud = (window.PharmaPromptLibrary?.AUDIENCE_TONES?.[audience]) || { label: audience, length: '3-5 ประโยค', voice: 'เป็นกันเอง' };
    const subject = drugName || customTopic || template?.label || 'ยา';

    const results = [];
    for (const ep of arc) {
      const prompt = buildEpisodePrompt({
        subject, ep, audience: aud, language, totalEps, hospitalContext, template
      });
      const result = await window.RHAI.callAI(prompt, {
        temperature: 0.7,
        maxTokens: 700,
        systemPrompt: 'คุณเป็นเภสัชกร รพ.รัฐ ที่เชี่ยวชาญสื่อสารกับประชาชน เขียนกระชับ สุภาพ ตรงประเด็น'
      });
      results.push({
        day: ep.day,
        theme: ep.theme,
        focus: ep.focus,
        content: result.text.trim(),
        provider: result.provider,
        model: result.model,
        seriesId: opts.seriesId || `series_${Date.now()}`,
        totalEpisodes: totalEps,
        language,
        audience
      });
    }
    return {
      seriesId: opts.seriesId || `series_${Date.now()}`,
      title: subject,
      totalEpisodes: totalEps,
      episodes: results,
      template: templateId,
      audience,
      language,
      createdAt: new Date().toISOString()
    };
  }

  function buildEpisodePrompt({ subject, ep, audience, language, totalEps, hospitalContext, template }) {
    const langInstruction = {
      th: 'เขียนเป็นภาษาไทย',
      ms: 'TULIS DALAM BAHASA MELAYU',
      en: 'Write in English'
    }[language];

    return `${langInstruction}

ภารกิจ: เขียนเนื้อหา ตอนที่ ${ep.day}/${totalEps} ของซีรีส์ "${subject}"
${template ? `(Template: ${template.label})` : ''}

ตอนนี้: ${ep.theme}
ประเด็นหลัก: ${ep.focus}

กลุ่มเป้าหมาย: ${audience.label}
น้ำเสียง: ${audience.voice}
ความยาว: ${audience.length}

${hospitalContext ? 'บริบท รพ.: ' + hospitalContext : ''}

โครงสร้างที่ต้องการ:
1. หัวข้อสั้น (≤ 8 คำ) สำหรับใช้เป็น cover headline
2. เนื้อหาหลัก (ตามความยาวที่กำหนด)
3. take-home message 1 ประโยค
4. เชื่อมไปตอนถัดไป (ถ้าไม่ใช่ตอนสุดท้าย) — ขึ้นต้น "พรุ่งนี้..." หรือ "ตอนถัดไป..."

ข้อบังคับ:
- ห้ามใช้ "หายขาด", "รักษาให้หาย", "100%", "ปลอดภัย 100%"
- ใช้ "ช่วยควบคุม/บรรเทา" แทน "รักษา"
- จบด้วย "ปรึกษาเภสัชกร" สำหรับตอนเกี่ยวกับยา

ตอบเป็น JSON:
{
  "cover_headline": "...",
  "body": "...",
  "takehome": "...",
  "next_tease": "..."
}`;
  }

  async function generateCustomArc(topic, episodes, audience, language) {
    if (!window.RHAI) throw new Error('ต้องมี AI helper (RHAI)');
    const prompt = `สร้าง outline ของซีรีส์ความรู้สุขภาพ ${episodes} ตอน เกี่ยวกับ "${topic}"
กลุ่มเป้าหมาย: ${audience}
ภาษา: ${language}

ตอบเป็น JSON array:
[
  { "day": 1, "theme": "หัวข้อตอน 1", "focus": "ประเด็นหลัก" },
  ...
]

แต่ละตอนต้องต่อเนื่อง เริ่มจากพื้นฐาน → เจาะลึก → take-home`;
    const result = await window.RHAI.callAI(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
      json: true,
      systemPrompt: 'คุณเป็น content planner ของสื่อสุขภาพ รพ.รัฐ'
    });
    try {
      const cleaned = result.text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      throw new Error('AI ส่ง arc ที่ parse ไม่ได้: ' + result.text.slice(0, 100));
    }
  }

  // ===== Save / Load series =====
  async function saveSeries(series) {
    const data = await chrome.storage.local.get(['rhPharmaSeries']);
    const list = data.rhPharmaSeries || [];
    const idx = list.findIndex(s => s.seriesId === series.seriesId);
    if (idx >= 0) list[idx] = series;
    else list.push(series);
    await chrome.storage.local.set({ rhPharmaSeries: list });
    return series;
  }

  async function loadAllSeries() {
    const data = await chrome.storage.local.get(['rhPharmaSeries']);
    return data.rhPharmaSeries || [];
  }

  async function loadSeries(seriesId) {
    const all = await loadAllSeries();
    return all.find(s => s.seriesId === seriesId) || null;
  }

  async function deleteSeries(seriesId) {
    const data = await chrome.storage.local.get(['rhPharmaSeries']);
    const list = (data.rhPharmaSeries || []).filter(s => s.seriesId !== seriesId);
    await chrome.storage.local.set({ rhPharmaSeries: list });
  }

  return {
    SERIES_TEMPLATES,
    generateSeries,
    saveSeries,
    loadSeries,
    loadAllSeries,
    deleteSeries,
    listTemplates: () => Object.keys(SERIES_TEMPLATES).map(k => ({ id: k, ...SERIES_TEMPLATES[k] }))
  };
})();

window.StorySeries = StorySeries;
console.log('[StorySeries] loaded —', Object.keys(StorySeries.SERIES_TEMPLATES).length, 'series templates');
