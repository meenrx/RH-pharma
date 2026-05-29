// =====================================================
// RH Pharma — Content Validator (v0.10.0)
// =====================================================
// เช็คคำต้องห้ามทางเภสัช/การแพทย์ ก่อนโพสต์
// อิงตาม:
//   - พ.ร.บ. ยา พ.ศ. 2510 (ห้ามโฆษณายาเกินจริง)
//   - พ.ร.บ. อาหาร พ.ศ. 2522 (ห้ามอวดอ้างสรรพคุณรักษาโรค)
//   - ประกาศ อย. เรื่องการโฆษณายา
//   - guideline สื่อสุขภาพ รพ.รัฐ
// =====================================================

const ContentValidator = (() => {

  // ===== ระดับความรุนแรง =====
  // BLOCK = ห้ามใช้เด็ดขาด (โพสต์ไม่ได้)
  // WARN  = ควรหลีกเลี่ยง (เตือน แต่โพสต์ได้)
  // INFO  = แนะนำให้ปรับ (ข้อเสนอแนะ)

  const BANNED_WORDS = [
    // ===== โอ้อวดสรรพคุณเกินจริง (BLOCK) =====
    { word: 'หายขาด',          level: 'BLOCK', reason: 'อ้างว่ารักษาให้หายขาด — ผิด พ.ร.บ. ยา' },
    { word: 'หายเด็ดขาด',      level: 'BLOCK', reason: 'อ้างรักษาหาย — ผิด พ.ร.บ. ยา' },
    { word: 'รักษาให้หาย',     level: 'BLOCK', reason: 'อ้างรักษาให้หาย — ผิดกฎ' },
    { word: 'รักษาได้ 100%',   level: 'BLOCK', reason: 'อ้างประสิทธิภาพ 100% — ผิดกฎ' },
    { word: 'ปลอดภัย 100%',    level: 'BLOCK', reason: 'ไม่มียาใดปลอดภัย 100% — ผิดกฎ' },
    { word: 'ไม่มีผลข้างเคียง', level: 'BLOCK', reason: 'อ้างไม่มี ADR — ไม่ตรงข้อเท็จจริง' },
    { word: 'ปาฏิหาริย์',      level: 'BLOCK', reason: 'อ้างผลปาฏิหาริย์ — ผิดกฎ' },
    { word: 'มหัศจรรย์',       level: 'BLOCK', reason: 'อ้างสรรพคุณมหัศจรรย์ — ผิดกฎ' },
    { word: 'อัศจรรย์',        level: 'BLOCK', reason: 'อ้างสรรพคุณอัศจรรย์ — ผิดกฎ' },
    { word: 'ดีที่สุด',        level: 'BLOCK', reason: 'อ้างว่าดีที่สุด — เปรียบเทียบเกินจริง' },
    { word: 'ดีกว่ายา',        level: 'BLOCK', reason: 'เปรียบเทียบกับยาอื่น — ผิดจริยธรรม' },
    { word: 'แทนยาได้',        level: 'BLOCK', reason: 'อ้างทดแทนยา — อันตราย' },
    { word: 'ไม่ต้องกินยา',   level: 'BLOCK', reason: 'อ้างเลิกยาได้ — อันตรายต่อผู้ป่วย' },
    { word: 'หยุดยาได้',      level: 'BLOCK', reason: 'แนะนำหยุดยาเองได้ — อันตราย (ผู้ป่วยควรปรึกษาแพทย์)' },

    // ===== สรรพคุณเกินจริง / โรคที่อ้างไม่ได้ตามประกาศ อย. =====
    { word: 'รักษามะเร็ง',    level: 'BLOCK', reason: 'ห้ามอ้างรักษามะเร็ง (ประกาศ อย.)' },
    { word: 'รักษาเอดส์',     level: 'BLOCK', reason: 'ห้ามอ้างรักษา HIV/AIDS' },
    { word: 'รักษาเบาหวานหาย', level: 'BLOCK', reason: 'เบาหวานไม่หาย — อ้างไม่ได้' },
    { word: 'รักษาความดันหาย', level: 'BLOCK', reason: 'HT ไม่หายขาด — อ้างไม่ได้' },
    { word: 'รักษาเอชไอวี',   level: 'BLOCK', reason: 'ห้ามอ้างรักษา HIV' },

    // ===== คำชวนเชื่อ / เกินจริง (WARN) =====
    { word: 'การันตี',         level: 'WARN', reason: 'การันตีผล — ไม่เหมาะกับสื่อวิชาการ' },
    { word: 'รับรอง',          level: 'WARN', reason: 'คำว่ารับรอง ต้องระวัง — ใช้เฉพาะที่ อย./ราชวิทยาลัยรับรองจริง' },
    { word: 'เห็นผลทันที',     level: 'WARN', reason: 'อ้างผลทันทีเกินจริง' },
    { word: 'เห็นผลภายใน',     level: 'WARN', reason: 'อ้างกรอบเวลาแน่นอน ระวังเกินจริง' },
    { word: 'ลดน้ำหนัก',       level: 'WARN', reason: 'ระวังการอวดอ้างผลิตภัณฑ์ลดน้ำหนัก (ผิด พ.ร.บ. อาหาร)' },
    { word: 'ผอมเร็ว',         level: 'WARN', reason: 'อ้างลดน้ำหนักเร็ว — เสี่ยงผิดกฎ' },
    { word: 'ขาวใส',           level: 'WARN', reason: 'ระวังอวดอ้างสรรพคุณเครื่องสำอาง' },
    { word: 'สวยทันที',        level: 'WARN', reason: 'อวดอ้างผลทันที' },
    { word: 'ฟรี',             level: 'WARN', reason: 'คำว่า "ฟรี" อาจถูกตีว่าโฆษณาเชิงพาณิชย์' },
    { word: 'โปรโมชั่น',       level: 'WARN', reason: 'รพ.รัฐไม่ควรใช้คำเชิงการตลาด' },

    // ===== ระบุชื่อยาเชิงพาณิชย์ในบริบทไม่เหมาะ (INFO) =====
    { word: 'ซื้อได้ที่',     level: 'INFO', reason: 'หากเป็นยา อย่าระบุจุดจำหน่าย — อาจถูกตีว่าโฆษณา' },
    { word: 'สั่งซื้อ',       level: 'INFO', reason: 'รพ.ไม่ควรชวนซื้อ — ใช้ "ปรึกษา/รับยาที่ห้องยา" แทน' },
    { word: 'ราคาถูก',        level: 'INFO', reason: 'ไม่ควรใช้คำเชิงพาณิชย์' },

    // ===== คำที่อาจสร้างความตื่นตระหนก (WARN) =====
    { word: 'อันตรายถึงชีวิต',  level: 'WARN', reason: 'ใช้ในบริบทถูกต้องได้ — ระวังสร้างความตื่นตระหนกเกินไป' },
    { word: 'ห้ามใช้เด็ดขาด',  level: 'INFO', reason: 'พิจารณาว่าจำเป็นต้องเข้มขนาดนี้ไหม' },

    // ===== คำที่เสี่ยงเรื่อง PDPA (BLOCK) =====
    { word: 'เลขผู้ป่วย',     level: 'BLOCK', reason: 'อาจเปิดเผยข้อมูลผู้ป่วย — ผิด PDPA' },
    { word: 'HN ',             level: 'BLOCK', reason: 'อาจเปิดเผย HN ผู้ป่วย — ผิด PDPA' },
    { word: 'เลขบัตรประชาชน', level: 'BLOCK', reason: 'ห้ามเผยแพร่ — ผิด PDPA' }
  ];

  // ===== Pattern พิเศษ (regex) =====
  const PATTERNS = [
    {
      pattern: /\b\d{13}\b/,
      level: 'BLOCK',
      reason: 'พบเลข 13 หลัก (อาจเป็นเลขบัตรประชาชน) — ผิด PDPA'
    },
    {
      pattern: /HN\s*[:\-]?\s*\d{4,}/i,
      level: 'BLOCK',
      reason: 'พบรูปแบบ HN ผู้ป่วย — ผิด PDPA'
    },
    {
      pattern: /AN\s*[:\-]?\s*\d{4,}/i,
      level: 'BLOCK',
      reason: 'พบรูปแบบ AN ผู้ป่วย — ผิด PDPA'
    },
    {
      pattern: /(ลด|เพิ่ม|รักษา)\s*\d+\s*%/,
      level: 'WARN',
      reason: 'อ้างเปอร์เซ็นต์ตัวเลขเฉพาะ — ต้องมีแหล่งอ้างอิงและเงื่อนไข'
    },
    {
      pattern: /(ภายใน|แค่)\s*\d+\s*(วัน|ชั่วโมง|นาที|สัปดาห์)/,
      level: 'WARN',
      reason: 'อ้างกรอบเวลาเห็นผล — ระวังเกินจริง'
    }
  ];

  // ===== ตรวจสอบเนื้อหา =====
  function validate(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return { ok: true, issues: [], summary: { block: 0, warn: 0, info: 0 } };
    }

    const issues = [];
    const lower = text.toLowerCase();

    // เช็คคำต้องห้าม
    for (const entry of BANNED_WORDS) {
      const w = entry.word.toLowerCase();
      const idx = lower.indexOf(w);
      if (idx !== -1) {
        const before = text.substring(Math.max(0, idx - 20), idx);
        const after = text.substring(idx + entry.word.length, idx + entry.word.length + 20);
        issues.push({
          level: entry.level,
          word: entry.word,
          reason: entry.reason,
          context: `...${before}【${text.substr(idx, entry.word.length)}】${after}...`
        });
      }
    }

    // เช็ค regex patterns
    for (const p of PATTERNS) {
      const match = text.match(p.pattern);
      if (match) {
        issues.push({
          level: p.level,
          word: match[0],
          reason: p.reason,
          context: `...พบ "${match[0]}"...`
        });
      }
    }

    const summary = {
      block: issues.filter(i => i.level === 'BLOCK').length,
      warn:  issues.filter(i => i.level === 'WARN').length,
      info:  issues.filter(i => i.level === 'INFO').length
    };

    return {
      ok: summary.block === 0,
      canPost: summary.block === 0,
      shouldWarn: summary.warn > 0,
      issues,
      summary
    };
  }

  // ===== สร้างข้อความสรุปสำหรับโชว์ใน UI =====
  function formatReport(result) {
    if (!result.issues.length) {
      return '✅ ตรวจสอบเรียบร้อย — ไม่พบคำต้องห้าม';
    }
    let report = '';
    if (result.summary.block > 0) {
      report += `🛑 พบคำต้องห้าม ${result.summary.block} จุด (โพสต์ไม่ได้):\n`;
      result.issues.filter(i => i.level === 'BLOCK').forEach(i => {
        report += `  • "${i.word}" — ${i.reason}\n`;
      });
    }
    if (result.summary.warn > 0) {
      report += `⚠️ ควรหลีกเลี่ยง ${result.summary.warn} จุด:\n`;
      result.issues.filter(i => i.level === 'WARN').forEach(i => {
        report += `  • "${i.word}" — ${i.reason}\n`;
      });
    }
    if (result.summary.info > 0) {
      report += `ℹ️ ข้อเสนอแนะ ${result.summary.info} จุด:\n`;
      result.issues.filter(i => i.level === 'INFO').forEach(i => {
        report += `  • "${i.word}" — ${i.reason}\n`;
      });
    }
    return report.trim();
  }

  // ===== แนะนำคำทดแทน (AI-assist hook) =====
  async function suggestRewrite(text, issues) {
    if (!window.RHAI) {
      throw new Error('ต้องมี AI helper (RHAI) ก่อนใช้ฟีเจอร์แก้คำ');
    }
    const issuesText = issues.map(i => `- "${i.word}" (${i.reason})`).join('\n');
    const prompt = `เนื้อหาสื่อสุขภาพต่อไปนี้มีคำที่ผิดกฎ/ไม่เหมาะสมตามด้านล่าง

ข้อความเดิม:
"""${text}"""

ปัญหาที่พบ:
${issuesText}

ภารกิจ: เขียนใหม่โดย
- ปรับคำที่ผิดให้ถูกต้องตามกฎ พ.ร.บ. ยา/อาหาร และจริยธรรมสื่อสุขภาพ รพ.รัฐ
- คงสาระและน้ำเสียงเดิมไว้
- ห้ามใช้คำที่ระบุในรายการอีก
- ถ้าจำเป็นใช้ "ช่วยควบคุม/บรรเทาอาการ" แทน "รักษา/หาย"
- ตอบเฉพาะข้อความที่แก้ไขแล้ว ไม่ต้องอธิบาย`;

    const result = await window.RHAI.callAI(prompt, {
      temperature: 0.3,
      maxTokens: 800,
      systemPrompt: 'คุณเป็นบรรณาธิการสื่อสุขภาพ รพ.รัฐ ที่เชี่ยวชาญด้านจริยธรรมการสื่อสารและกฎหมายการโฆษณายา'
    });
    return result.text.trim();
  }

  return {
    validate,
    formatReport,
    suggestRewrite,
    BANNED_WORDS,
    PATTERNS
  };
})();

window.ContentValidator = ContentValidator;
console.log('[ContentValidator] loaded —', ContentValidator.BANNED_WORDS.length, 'banned words');
