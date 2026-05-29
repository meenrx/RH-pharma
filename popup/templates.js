// =====================================================
// RH Pharma - Content Templates
// =====================================================
// 6 Templates สำหรับงานเภสัช + auto-fill ตัวแปร {{xxx}} ด้วย AI
// =====================================================

const RHTemplates = {

  // =====================================================
  // TEMPLATE DEFINITIONS
  // =====================================================
  TEMPLATES: {

    'drug-knowledge': {
      id: 'drug-knowledge',
      name: '💊 ความรู้เรื่องยา',
      description: 'แนะนำยา 1 ตัว ใช้รักษาอะไร วิธีใช้ ข้อควรระวัง',
      icon: '💊',
      category: 'ยา',

      // เทมเพลตในภาษาต่างๆ
      content: {
        th: `🌟 รู้จักยา {{drug_name}}

📍 ใช้รักษา: {{indication}}
💊 วิธีใช้: {{dosage}}
⚠️ ข้อควรระวัง: {{warning}}
🩺 ผลข้างเคียงที่พบบ่อย: {{side_effect}}

มีข้อสงสัย ปรึกษาเภสัชกร รพ.รือเสาะ ได้ทุกวัน
{{hashtag}}`,

        ms: `🌟 Mengenali Ubat {{drug_name}}

📍 Untuk merawat: {{indication}}
💊 Cara guna: {{dosage}}
⚠️ Perhatian: {{warning}}
🩺 Kesan sampingan biasa: {{side_effect}}

Ada soalan? Sila berjumpa dengan ahli farmasi Hospital Rueso
{{hashtag}}`,

        en: `🌟 Get to Know {{drug_name}}

📍 Used to treat: {{indication}}
💊 How to use: {{dosage}}
⚠️ Warning: {{warning}}
🩺 Common side effects: {{side_effect}}

Got questions? Consult a pharmacist at Rueso Hospital
{{hashtag}}`
      },

      // ตัวแปรที่ต้องเติม + คำอธิบายให้ AI
      variables: [
        { key: 'drug_name', label: 'ชื่อยา', hint: 'ชื่อสามัญ + ชื่อการค้า เช่น "Paracetamol (Sara, Tylenol)"' },
        { key: 'indication', label: 'ข้อบ่งใช้', hint: 'ใช้รักษาอะไร — สั้น กระชับ' },
        { key: 'dosage', label: 'ขนาดยา', hint: 'ขนาดยาในผู้ใหญ่ + ความถี่' },
        { key: 'warning', label: 'ข้อควรระวัง', hint: 'ที่สำคัญที่สุด 1-2 ข้อ' },
        { key: 'side_effect', label: 'ผลข้างเคียง', hint: 'ที่พบบ่อย 2-3 อาการ' }
      ]
    },

    'adr-alert': {
      id: 'adr-alert',
      name: '⚠️ เตือนภัย ADR',
      description: 'เตือนผลข้างเคียงรุนแรง อาการที่ควรหยุดยาทันที',
      icon: '⚠️',
      category: 'เตือนภัย',

      content: {
        th: `⚠️ ข้อควรระวัง: ยา {{drug_name}}

อาการที่ควรหยุดยา + พบแพทย์ทันที:
🔴 {{symptom_1}}
🔴 {{symptom_2}}
🔴 {{symptom_3}}

ถ้าพบอาการเหล่านี้ ห้ามหยุดยาเอง โดยไม่ปรึกษา

📞 ห้องยา รพ.รือเสาะ
{{phone_number}}
{{hashtag}}`,

        ms: `⚠️ Awas: Ubat {{drug_name}}

Simptom yang perlu hentikan ubat + jumpa doktor segera:
🔴 {{symptom_1}}
🔴 {{symptom_2}}
🔴 {{symptom_3}}

Jangan hentikan ubat sendiri tanpa berunding

📞 Farmasi Hospital Rueso
{{phone_number}}
{{hashtag}}`,

        en: `⚠️ ALERT: {{drug_name}}

STOP medication and seek medical care if you experience:
🔴 {{symptom_1}}
🔴 {{symptom_2}}
🔴 {{symptom_3}}

Do not stop medication without consulting

📞 Rueso Hospital Pharmacy
{{phone_number}}
{{hashtag}}`
      },

      variables: [
        { key: 'drug_name', label: 'ชื่อยา', hint: 'ชื่อสามัญของยา' },
        { key: 'symptom_1', label: 'อาการ 1', hint: 'อาการรุนแรง ที่ต้องหยุดยา' },
        { key: 'symptom_2', label: 'อาการ 2', hint: 'อาการรุนแรง อันที่ 2' },
        { key: 'symptom_3', label: 'อาการ 3', hint: 'อาการรุนแรง อันที่ 3' },
        { key: 'phone_number', label: 'เบอร์โทร', hint: '073-571-444 (เบอร์ห้องยา รพ.รือเสาะ)' }
      ]
    },

    'qa': {
      id: 'qa',
      name: '❓ Q&A',
      description: 'คำถามที่พบบ่อย + คำตอบสั้นและละเอียด',
      icon: '❓',
      category: 'คำถาม-ตอบ',

      content: {
        th: `❓ {{question}}

✅ คำตอบสั้นๆ: {{answer_summary}}

📝 รายละเอียด:
{{answer_detail}}

{{hashtag}}`,

        ms: `❓ {{question}}

✅ Jawapan ringkas: {{answer_summary}}

📝 Penjelasan:
{{answer_detail}}

{{hashtag}}`,

        en: `❓ {{question}}

✅ Quick answer: {{answer_summary}}

📝 Details:
{{answer_detail}}

{{hashtag}}`
      },

      variables: [
        { key: 'question', label: 'คำถาม', hint: 'คำถามที่ผู้ป่วย/ประชาชนถามบ่อย' },
        { key: 'answer_summary', label: 'คำตอบสั้น', hint: 'คำตอบใน 1 ประโยค ใจความหลัก' },
        { key: 'answer_detail', label: 'รายละเอียด', hint: 'อธิบายเพิ่ม 2-3 ประโยค' }
      ]
    },

    'how-to': {
      id: 'how-to',
      name: '📝 วิธีใช้ยา (How-to)',
      description: '5 ขั้นตอนการใช้ยา/ทำอะไรอย่างถูกต้อง',
      icon: '📝',
      category: 'วิธีใช้',

      content: {
        th: `📝 วิธีใช้ยา {{drug_name}} ที่ถูกต้อง

1️⃣ {{step_1}}

2️⃣ {{step_2}}

3️⃣ {{step_3}}

4️⃣ {{step_4}}

5️⃣ {{step_5}}

⚠️ ข้อควรระวัง: {{warning}}

{{hashtag}}`,

        ms: `📝 Cara Guna Ubat {{drug_name}} Dengan Betul

1️⃣ {{step_1}}

2️⃣ {{step_2}}

3️⃣ {{step_3}}

4️⃣ {{step_4}}

5️⃣ {{step_5}}

⚠️ Perhatian: {{warning}}

{{hashtag}}`,

        en: `📝 How to Use {{drug_name}} Correctly

1️⃣ {{step_1}}

2️⃣ {{step_2}}

3️⃣ {{step_3}}

4️⃣ {{step_4}}

5️⃣ {{step_5}}

⚠️ Warning: {{warning}}

{{hashtag}}`
      },

      variables: [
        { key: 'drug_name', label: 'ชื่อยา/หัวข้อ', hint: 'ชื่อยา หรือหัวข้อ how-to' },
        { key: 'step_1', label: 'ขั้นตอน 1', hint: 'ขั้นแรก' },
        { key: 'step_2', label: 'ขั้นตอน 2', hint: 'ขั้นที่ 2' },
        { key: 'step_3', label: 'ขั้นตอน 3', hint: 'ขั้นที่ 3' },
        { key: 'step_4', label: 'ขั้นตอน 4', hint: 'ขั้นที่ 4' },
        { key: 'step_5', label: 'ขั้นตอน 5', hint: 'ขั้นสุดท้าย' },
        { key: 'warning', label: 'ข้อควรระวัง', hint: 'สั้นๆ 1 บรรทัด' }
      ]
    },

    'comparison': {
      id: 'comparison',
      name: '⚖️ เปรียบเทียบยา',
      description: 'เปรียบเทียบยา 2 ตัว — ข้อดี/ข้อเสีย',
      icon: '⚖️',
      category: 'เปรียบเทียบ',

      content: {
        th: `🔍 {{drug_a}} vs {{drug_b}}

🅰️ {{drug_a}}:
✅ {{a_point_1}}
✅ {{a_point_2}}
❌ {{a_point_3}}

🅱️ {{drug_b}}:
✅ {{b_point_1}}
✅ {{b_point_2}}
❌ {{b_point_3}}

💡 เลือกใช้: {{recommendation}}

{{hashtag}}`,

        ms: `🔍 {{drug_a}} vs {{drug_b}}

🅰️ {{drug_a}}:
✅ {{a_point_1}}
✅ {{a_point_2}}
❌ {{a_point_3}}

🅱️ {{drug_b}}:
✅ {{b_point_1}}
✅ {{b_point_2}}
❌ {{b_point_3}}

💡 Pilihan: {{recommendation}}

{{hashtag}}`,

        en: `🔍 {{drug_a}} vs {{drug_b}}

🅰️ {{drug_a}}:
✅ {{a_point_1}}
✅ {{a_point_2}}
❌ {{a_point_3}}

🅱️ {{drug_b}}:
✅ {{b_point_1}}
✅ {{b_point_2}}
❌ {{b_point_3}}

💡 Recommendation: {{recommendation}}

{{hashtag}}`
      },

      variables: [
        { key: 'drug_a', label: 'ยา A', hint: 'ยาตัวแรก' },
        { key: 'drug_b', label: 'ยา B', hint: 'ยาตัวที่ 2' },
        { key: 'a_point_1', label: 'A: ข้อดี 1', hint: 'ข้อดีของยา A' },
        { key: 'a_point_2', label: 'A: ข้อดี 2', hint: 'ข้อดีอีก' },
        { key: 'a_point_3', label: 'A: ข้อเสีย', hint: 'ข้อเสียหลัก' },
        { key: 'b_point_1', label: 'B: ข้อดี 1', hint: 'ข้อดีของยา B' },
        { key: 'b_point_2', label: 'B: ข้อดี 2', hint: 'ข้อดีอีก' },
        { key: 'b_point_3', label: 'B: ข้อเสีย', hint: 'ข้อเสียหลัก' },
        { key: 'recommendation', label: 'คำแนะนำ', hint: 'ใครเหมาะใช้ตัวไหน' }
      ]
    },

    'hospital-news': {
      id: 'hospital-news',
      name: '🏥 ข่าวสาร รพ.',
      description: 'ประกาศจากโรงพยาบาล — กิจกรรม คลินิก บริการใหม่',
      icon: '🏥',
      category: 'ข่าวสาร',

      content: {
        th: `🏥 ข่าวจาก รพ.รือเสาะ

📌 {{title}}

📅 วันที่: {{date}}
📍 สถานที่: {{location}}

ℹ️ รายละเอียด:
{{details}}

📞 ติดต่อ: {{contact}}

{{hashtag}}`,

        ms: `🏥 Berita Hospital Rueso

📌 {{title}}

📅 Tarikh: {{date}}
📍 Lokasi: {{location}}

ℹ️ Maklumat:
{{details}}

📞 Hubungi: {{contact}}

{{hashtag}}`,

        en: `🏥 Rueso Hospital News

📌 {{title}}

📅 Date: {{date}}
📍 Location: {{location}}

ℹ️ Details:
{{details}}

📞 Contact: {{contact}}

{{hashtag}}`
      },

      variables: [
        { key: 'title', label: 'หัวข้อ', hint: 'หัวข้อข่าว' },
        { key: 'date', label: 'วันที่', hint: 'เช่น 15 พ.ค. 2569' },
        { key: 'location', label: 'สถานที่', hint: 'เช่น ห้องประชุม รพ.รือเสาะ' },
        { key: 'details', label: 'รายละเอียด', hint: 'เนื้อหาข่าว 2-3 ประโยค' },
        { key: 'contact', label: 'ติดต่อ', hint: 'ชื่อ/เบอร์โทร' }
      ]
    },

    // =====================================================
    // Viral Video Script — สร้าง prompt วิดีโอ 9:16 4 ฉาก
    // ผลลัพธ์: prompt ภาษาอังกฤษพร้อมก็อปไป Flow/Gemini
    // =====================================================
    'viral-video-script': {
      id: 'viral-video-script',
      name: '🎬 Viral Video Script',
      description: 'สร้าง prompt วิดีโอแนวตั้ง 4 ฉาก × 8 วิ — เภสัช + คู่สนทนา (ตาม audience)',
      icon: '🎬',
      category: 'วิดีโอ',

      // Output ของ template นี้คือ "prompt ภาษาอังกฤษ" สำหรับ Flow/Gemini
      // — ไม่ใช่โพสต์โซเชียล content จึงเป็น English เสมอ
      // (ภาษาที่เลือกใน UI จะใช้แค่กำหนดภาษาของบทพูดในแต่ละ scene)
      content: {
        th: `=== CHARACTER LOCK (use in every scene) ===

CHARACTER A — {{character_a_name}}:
{{character_a_desc}}

CHARACTER B — {{character_b_name}}:
{{character_b_desc}}

SETTING:
{{setting}}

TONE: Fun, engaging, viral-style. Pharmacy education made approachable.

=== SCENE 1 (8 sec) — Speaker: {{scene1_speaker}} only ===
[Visual]: {{scene1_visual}}
[Action]: {{scene1_action}}
[Dialogue]: "{{scene1_dialogue}}"
[Camera]: 9:16 vertical, eye-level, slow push-in.

=== SCENE 2 (8 sec) — Speaker: {{scene2_speaker}} only ===
[Visual]: {{scene2_visual}}
[Action]: {{scene2_action}}
[Dialogue]: "{{scene2_dialogue}}"
[Camera]: 9:16 vertical, eye-level.

=== SCENE 3 (8 sec) — Speaker: {{scene3_speaker}} only ===
[Visual]: {{scene3_visual}}
[Action]: {{scene3_action}}
[Dialogue]: "{{scene3_dialogue}}"
[Camera]: 9:16 vertical, medium shot.

=== SCENE 4 (8 sec) — Speaker: {{scene4_speaker}} only ===
[Visual]: {{scene4_visual}}
[Action]: {{scene4_action}}
[Dialogue]: "{{scene4_dialogue}}"
[Camera]: 9:16 vertical, eye-level, slow pull-out.

=== RULES ===
- Each scene = 1 speaker only. The other character stays silent.
- Maintain CHARACTER LOCK across all 4 scenes (same outfit, hair, age).
- Vertical 9:16 aspect ratio.
- Educational pharmacy content, accurate medication info.
- Avoid specific brand names; use generic drug names.

{{hashtag}}`,

        // ms/en ใช้ format เดียวกับ th — output ของ template นี้เป็น prompt ภาษาอังกฤษเสมอ
        // ภาษาของ "บทพูด" ถูกกำหนดผ่านตัวแปร scene_dialogue
        get ms() { return this.th; },
        get en() { return this.th; }
      },

      // ตัวแปรเรียงตาม "ขั้นการแก้" — ตัวละครก่อน ฉากหลังกลาง บทพูดตามฉาก
      variables: [
        // === ตัวละคร ===
        { key: 'character_a_name', label: '👤 ชื่อตัวละคร A', hint: 'เช่น "Pharmacist Min" หรือ "เภสัชกรมีน"' },
        { key: 'character_a_desc', label: '👤 รายละเอียดตัวละคร A (เภสัชกร)',
          hint: 'อายุ เพศ ชุด สิ่งของในมือ — ภาษาอังกฤษ เพื่อ lock ใน Flow/Gemini' },
        { key: 'character_b_name', label: '👥 ชื่อตัวละคร B', hint: 'เช่น "Patient Somchai", "Nurse Noi"' },
        { key: 'character_b_desc', label: '👥 รายละเอียดตัวละคร B (คู่สนทนา)',
          hint: 'คู่สนทนาตาม audience: ผู้ป่วย/พยาบาล/แพทย์/เภสัชกร/บุคลากร' },

        // === ฉากหลัง ===
        { key: 'setting', label: '🏥 ฉากหลัง',
          hint: 'เช่น Rueso Hospital pharmacy counter, community drugstore, OPD waiting area' },

        // === SCENE 1 ===
        { key: 'scene1_speaker', label: '🎬 SCENE 1: ผู้พูด',
          hint: '"Character A" หรือ "Character B" เท่านั้น (ห้ามทั้งคู่)' },
        { key: 'scene1_visual', label: 'SCENE 1: ภาพ',
          hint: 'อธิบายภาพเป็นภาษาอังกฤษ — มุมกล้อง ท่าทาง สิ่งของ' },
        { key: 'scene1_action', label: 'SCENE 1: การกระทำ',
          hint: 'ผู้พูดกำลังทำอะไรขณะพูด เช่น holding pill bottle, pointing to label' },
        { key: 'scene1_dialogue', label: 'SCENE 1: บทพูด',
          hint: 'ภาษาตามที่ผู้ใช้เลือก — สั้น ตรงประเด็น เหมาะกับ 8 วินาที' },

        // === SCENE 2 ===
        { key: 'scene2_speaker', label: '🎬 SCENE 2: ผู้พูด', hint: '"Character A" หรือ "Character B"' },
        { key: 'scene2_visual', label: 'SCENE 2: ภาพ', hint: 'อธิบายภาพเป็นภาษาอังกฤษ' },
        { key: 'scene2_action', label: 'SCENE 2: การกระทำ', hint: 'ผู้พูดทำอะไรขณะพูด' },
        { key: 'scene2_dialogue', label: 'SCENE 2: บทพูด', hint: 'ตอบรับ/ถามต่อจาก scene 1' },

        // === SCENE 3 ===
        { key: 'scene3_speaker', label: '🎬 SCENE 3: ผู้พูด', hint: '"Character A" หรือ "Character B"' },
        { key: 'scene3_visual', label: 'SCENE 3: ภาพ', hint: 'อธิบายภาพเป็นภาษาอังกฤษ' },
        { key: 'scene3_action', label: 'SCENE 3: การกระทำ', hint: 'ผู้พูดทำอะไรขณะพูด' },
        { key: 'scene3_dialogue', label: 'SCENE 3: บทพูด', hint: 'พัฒนาเรื่อง / ขมวดข้อมูลสำคัญ' },

        // === SCENE 4 ===
        { key: 'scene4_speaker', label: '🎬 SCENE 4: ผู้พูด', hint: '"Character A" หรือ "Character B"' },
        { key: 'scene4_visual', label: 'SCENE 4: ภาพ', hint: 'อธิบายภาพเป็นภาษาอังกฤษ' },
        { key: 'scene4_action', label: 'SCENE 4: การกระทำ', hint: 'ผู้พูดทำอะไรขณะพูด' },
        { key: 'scene4_dialogue', label: 'SCENE 4: บทพูด', hint: 'จบ — call to action ปรึกษาเภสัชกร' }
      ]
    },

    // =====================================================
    // Custom — ผู้ใช้กรอกรายละเอียดเองช่องเดียว
    // =====================================================
    'custom': {
      id: 'custom',
      name: '✏️ กำหนดเอง',
      description: 'เขียนเองอิสระ ใส่รายละเอียดที่ต้องการ',
      icon: '✏️',
      category: 'อิสระ',

      content: {
        th: `{{details}}

{{hashtag}}`,

        ms: `{{details}}

{{hashtag}}`,

        en: `{{details}}

{{hashtag}}`
      },

      variables: [
        { key: 'details', label: 'เนื้อหาทั้งหมด', hint: 'ใส่ข้อความที่ต้องการโพสต์ได้เลย — เขียนเอง หรือกด AI ช่วยเขียนก็ได้' }
      ]
    }
  },

  // =====================================================
  // GENERATE: ใช้ AI เติมตัวแปรในเทมเพลต
  // =====================================================
  async generateContent(templateId, topic, audience = 'public', language = 'th') {
    const tmpl = this.TEMPLATES[templateId];
    if (!tmpl) throw new Error(`ไม่พบเทมเพลต: ${templateId}`);

    const langContent = tmpl.content[language] || tmpl.content.th;
    const aud = window.RHAI.AUDIENCE_PROMPTS[audience] || window.RHAI.AUDIENCE_PROMPTS.public;

    const langInstruction = language === 'ms'
      ? 'Tulis nilai dalam Bahasa Melayu'
      : language === 'en'
      ? 'Write values in English'
      : 'เขียนค่าเป็นภาษาไทย';

    // สร้าง JSON example ให้ AI เลียนแบบ — ป้องกัน hallucination
    const exampleObj = {};
    tmpl.variables.forEach(v => {
      exampleObj[v.key] = `<${v.label}>`;
    });
    exampleObj.hashtag = '#tag1 #tag2';
    const exampleJson = JSON.stringify(exampleObj, null, 2);

    const variableList = tmpl.variables.map(v =>
      `- "${v.key}": ${v.label} — ${v.hint}`
    ).join('\n');

    // ===== Special guidance สำหรับ viral-video-script =====
    // ผูกตัวละคร B ตาม audience + บอก rules พิเศษของวิดีโอ
    let videoGuidance = '';
    let maxTokensForCall = 1500;

    if (templateId === 'viral-video-script') {
      maxTokensForCall = 3500;  // 4 ฉาก + ตัวละคร 2 ตัว ใช้ token เยอะ

      const characterBByAudience = {
        public:     'ผู้ป่วยชาวบ้าน อายุ 50s ใส่เสื้อเชิ้ตลายสก๊อตหรือเสื้อม่อฮ่อม ถือถุงยาในมือ',
        nurse:      'พยาบาลวิชาชีพหญิง อายุ 30s ใส่ชุดพยาบาลสีขาว มีหมวก ป้ายชื่อ',
        doctor:     'แพทย์ชาย อายุ 40s ใส่เสื้อกาวน์สีขาวทับเสื้อเชิ้ต มี stethoscope',
        pharmacist: 'เภสัชกรหญิง อายุ 30s ใส่เสื้อกาวน์สีขาวทับเสื้อสีฟ้า ป้ายชื่อ',
        hcp:        'บุคลากรสหวิชาชีพ (กายภาพ/แล็บ/X-ray) ใส่ชุดฟอร์มประจำสาขา'
      };

      const dialogueLanguage = language === 'ms'
        ? 'บทพูดทุก scene ต้องเขียนเป็น **ภาษามลายูถิ่นปัตตานี/นราธิวาส** (Bahasa Melayu Patani) — ใช้คำที่คนใต้ชายแดนใช้จริง'
        : language === 'en'
        ? 'บทพูดทุก scene เขียนเป็น **English** ใช้ภาษาง่าย เป็นกันเอง'
        : 'บทพูดทุก scene เขียนเป็น **ภาษาไทยกลาง** ใช้คำพูดธรรมชาติ เป็นกันเอง';

      videoGuidance = `

🎬 ===== VIDEO SCRIPT SPECIAL RULES =====
- **CHARACTER A** = เภสัชกร รพ.รือเสาะ (ใส่เสื้อกาวน์ขาว ทับเสื้อสีฟ้า/เขียวอ่อน มีป้ายชื่อ)
- **CHARACTER B** = ${characterBByAudience[audience] || characterBByAudience.public}
- **Tone**: สนุก เข้าถึงง่าย แบบไวรัล TikTok แต่ข้อมูลเภสัชกรรมต้องถูกต้อง
- **บทพูดต้องเหมาะกับเวลา 8 วินาที** (ประมาณ 15-25 คำต่อ scene)
- **${dialogueLanguage}**

⚠️ กฎที่ห้ามผิด:
1. character_a_desc และ character_b_desc ต้องเขียน **เป็นภาษาอังกฤษ** เพื่อ lock ให้ Flow/Gemini สร้างต่อเนื่อง
2. scene_visual และ scene_action ต้องเขียน **เป็นภาษาอังกฤษ** เช่นกัน
3. scene_dialogue เท่านั้นที่ใช้ภาษาตามที่ผู้ใช้เลือก
4. scene_speaker ต้องเป็นคำว่า "Character A" หรือ "Character B" เท่านั้น
5. **1 ฉาก = 1 speaker** เท่านั้น — ห้ามทั้งคู่พูดในฉากเดียวกัน
6. โฟลว์ที่แนะนำ: scene1 = A เปิดประเด็น, scene2 = B ถาม/สงสัย, scene3 = A อธิบาย, scene4 = A สรุป + call to action
7. หลีกเลี่ยงชื่อยา brand-name (ใช้ generic name แทน เช่น Paracetamol ไม่ใช่ Sara/Tylenol)
`;
    }

    const prompt = `
หัวข้อ: "${topic.title}"
รายละเอียด: ${topic.details || '(ไม่มี)'}
กลุ่มเป้าหมาย: ${aud.label} (${aud.style})
ภาษา: ${langInstruction}
เทมเพลต: ${tmpl.name}
${videoGuidance}
ภารกิจ: เติมค่าตัวแปรเหล่านี้ทั้งหมด:
${variableList}

⚠️ สำคัญมาก:
1. ตอบเป็น JSON object เปล่าๆ เท่านั้น (ไม่ต้องใส่ \`\`\`json หรือ markdown)
2. ใช้ key ตามด้านบนเท่านั้น ห้ามเพิ่ม "topic", "template", "qa_list", หรือ key อื่น
3. ทุก value ต้องเป็น string เท่านั้น (ไม่ใช่ array หรือ object)
4. ต้องมี key "hashtag" ด้วย

ตอบในรูปแบบนี้เป๊ะๆ:
${exampleJson}

JSON ตอบเลย:`.trim();

    const result = await window.RHAI.callAI(prompt, {
      temperature: 0.7,
      maxTokens: maxTokensForCall,
      json: true,
      systemPrompt: `คุณเป็นเภสัชกร รพ.รือเสาะ ตอบเป็น JSON object เปล่าๆ ไม่มี markdown ไม่มี \`\`\` ใช้ key ที่กำหนดเท่านั้น รองรับภาษา ${language === 'ms' ? 'มลายู' : language === 'en' ? 'อังกฤษ' : 'ไทย'}`
    });

    // Parse JSON — ลองหลายวิธีเผื่อ AI ตอบไม่ตรง spec
    const variables = this.parseAIJson(result.text);
    if (!variables) {
      throw new Error('AI ส่งข้อมูลที่ parse ไม่ได้ ลองใหม่อีกครั้ง หรือเปลี่ยน AI provider\n\nResponse: ' + result.text.slice(0, 200));
    }

    // เติมค่าลงในเทมเพลต
    let filled = langContent;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      // value อาจเป็น array หรือ object → แปลงเป็น string
      let strValue = value;
      if (Array.isArray(value)) {
        strValue = value.map(v => typeof v === 'object' ? Object.values(v).join(' - ') : v).join('\n');
      } else if (typeof value === 'object' && value !== null) {
        strValue = Object.values(value).join(' ');
      }
      filled = filled.split(placeholder).join(String(strValue || ''));
    }

    // เคลียร์ตัวแปรที่ไม่ได้ตอบ ออกจาก output
    filled = filled.replace(/\{\{[^}]+\}\}/g, '');

    return {
      content: filled,
      variables: variables,
      template: tmpl,
      provider: result.provider,
      model: result.model
    };
  },

  // =====================================================
  // PARSE: แยก JSON จาก AI response แบบ robust
  // (AI บางตัวห่อ markdown/preamble — ต้องเคลียร์)
  // =====================================================
  parseAIJson(text) {
    if (!text) return null;

    // ลอง 1: parse ตรงๆ
    try {
      return JSON.parse(text);
    } catch (e) { /* ลองต่อไป */ }

    // ลอง 2: ถอด markdown ```json ... ``` หรือ ``` ... ```
    let cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) { /* ลองต่อไป */ }

    // ลอง 3: หา JSON object ที่ valid ในข้อความ (regex)
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) { /* ลองต่อไป */ }
    }

    // ลอง 4: ถ้ามี "qa_list" หรือ array — flatten เป็น variables
    try {
      const obj = JSON.parse(match ? match[0] : cleaned);
      if (obj && typeof obj === 'object') {
        return this.flattenAIResponse(obj);
      }
    } catch (e) { /* ลองต่อไป */ }

    return null;  // parse ไม่ได้จริงๆ
  },

  // ถ้า AI ตอบมาแบบไม่ตรง spec — พยายามทำให้ใช้งานได้
  flattenAIResponse(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        // เช่น qa_list → join เป็น string
        result[key] = value.map(v =>
          typeof v === 'object' ? Object.values(v).join(': ') : v
        ).join('\n');
      } else if (typeof value === 'object' && value !== null) {
        result[key] = Object.values(value).join(' ');
      } else {
        result[key] = String(value);
      }
    }
    return result;
  },

  // =====================================================
  // PREVIEW: render template ด้วยตัวอย่าง (ไม่เรียก AI)
  // =====================================================
  preview(templateId, language = 'th') {
    const tmpl = this.TEMPLATES[templateId];
    if (!tmpl) return '';
    return tmpl.content[language] || tmpl.content.th;
  }
};

window.RHTemplates = RHTemplates;
console.log('[RHTemplates] Templates loaded:', Object.keys(RHTemplates.TEMPLATES).length);
