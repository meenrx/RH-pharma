// =====================================================
// RH Pharma - AI Helper Module
// =====================================================
// ทำหน้าที่เป็น wrapper เรียก OpenAI / Gemini
// ใช้ทั่วทั้ง Side Panel — ทุก feature ที่ต้องเรียก AI
// =====================================================

const RHAI = {

  // =====================================================
  // CONFIG: ภาษาที่รองรับ
  // =====================================================
  LANGUAGES: {
    th: { label: 'ไทย', code: 'th', name: 'ภาษาไทย' },
    ms: { label: 'มลายู', code: 'ms', name: 'Bahasa Melayu (ภาษามลายู)' },
    en: { label: 'อังกฤษ', code: 'en', name: 'English' }
  },

  // =====================================================
  // CONFIG: prompt template สำหรับแต่ละ audience
  // =====================================================
  AUDIENCE_PROMPTS: {
    public: {
      label: 'ประชาชน',
      style: 'ใช้ภาษาง่าย เข้าใจง่าย หลีกเลี่ยงศัพท์แพทย์ ถ้าจำเป็นให้อธิบายเพิ่ม',
      tone: 'เป็นกันเอง อบอุ่น เหมือนเภสัชกรในร้านยาคุยกับลูกค้า',
      focus: 'เน้นการใช้ยาในชีวิตประจำวัน อาการที่ควรสังเกต ข้อควรระวังพื้นฐาน'
    },
    nurse: {
      label: 'พยาบาล',
      style: 'ใช้ศัพท์การแพทย์พื้นฐานได้ แต่ไม่เน้น pharmacology ลึก',
      tone: 'เป็นทางการพอประมาณ เน้นการนำไปใช้ในการดูแลผู้ป่วย',
      focus: 'การ assess ผู้ป่วย, monitoring, side effects ที่ต้องเฝ้าระวัง, การให้คำแนะนำผู้ป่วย'
    },
    doctor: {
      label: 'แพทย์',
      style: 'ใช้ศัพท์แพทย์เต็มรูป รวม pharmacology, mechanism, kinetics ได้',
      tone: 'เป็นทางการ เป็นข้อมูลวิชาการ',
      focus: 'pharmacokinetics/pharmacodynamics, drug-drug interaction, contraindication, dosing in special population'
    },
    pharmacist: {
      label: 'เภสัชกร',
      style: 'ใช้ศัพท์เภสัชกรรมเต็มรูป รวม IUPAC, ATC, DDD ได้',
      tone: 'เป็นวิชาการ เน้น clinical pharmacy',
      focus: 'DDI, dose adjustment, ADR, monitoring parameters, counseling points, formulary considerations'
    },
    hcp: {
      label: 'บุคลากรการแพทย์',
      style: 'ใช้ศัพท์แพทย์/เภสัชระดับกลาง',
      tone: 'เป็นทางการ มืออาชีพ',
      focus: 'overview ของยา/โรค ที่ multidisciplinary team ต้องรู้ร่วมกัน'
    }
  },

  // =====================================================
  // MAIN: เรียก AI ตาม provider ที่ตั้งไว้
  // =====================================================
  async callAI(prompt, options = {}) {
    const settings = await this.getSettings();
    const provider = options.provider || settings.aiProvider || 'openai';

    if (provider === 'openai') {
      return this.callOpenAI(prompt, settings, options);
    } else if (provider === 'gemini') {
      return this.callGemini(prompt, settings, options);
    } else if (provider === 'claude') {
      return this.callClaude(prompt, settings, options);
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }
  },

  // =====================================================
  // OpenAI API
  // =====================================================
  async callOpenAI(prompt, settings, options = {}) {
    let apiKey = settings.openaiApiKey;
    if (!apiKey) {
      throw new Error('ยังไม่ได้ตั้ง OpenAI API Key — ไปที่ ⚙️ ตั้งค่า');
    }

    // 🆕 v0.9.6: sanitize API key — กัน "non ISO-8859-1" error
    // ลบ whitespace/control char/non-ASCII ที่อาจติดมาตอน paste
    apiKey = String(apiKey).replace(/[\u0000-\u001F\u007F-\uFFFF]/g, '').trim();
    if (!apiKey) {
      throw new Error('OpenAI API Key ไม่ถูกต้อง — มีอักษรพิเศษ กรุณาลบและพิมพ์/วางใหม่');
    }

    const model = options.model || settings.openaiModel || 'gpt-4o-mini';
    const systemPrompt = options.systemPrompt || 'คุณเป็นผู้ช่วยเภสัชกร โรงพยาบาลรือเสาะ ตอบเป็นภาษาไทย';

    console.log(`[RHAI] OpenAI request (${model})`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        response_format: options.json ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return {
      text: text,
      model: model,
      provider: 'openai',
      usage: data.usage
    };
  },

  // =====================================================
  // Gemini API
  // =====================================================
  async callGemini(prompt, settings, options = {}) {
    const apiKey = settings.geminiApiKey;
    if (!apiKey) {
      throw new Error('ยังไม่ได้ตั้ง Gemini API Key — ไปที่ ⚙️ ตั้งค่า');
    }

    const model = options.model || settings.geminiModel || 'gemini-2.5-flash';
    const systemPrompt = options.systemPrompt || 'คุณเป็นผู้ช่วยเภสัชกร โรงพยาบาลรือเสาะ ตอบเป็นภาษาไทย';

    console.log(`[RHAI] Gemini request (${model})`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1000,
        responseMimeType: options.json ? 'application/json' : 'text/plain'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      text: text,
      model: model,
      provider: 'gemini',
      usage: data.usageMetadata
    };
  },

  // =====================================================
  // Claude API (Anthropic)
  // =====================================================
  async callClaude(prompt, settings, options = {}) {
    let apiKey = settings.claudeApiKey;
    if (!apiKey) {
      throw new Error('ยังไม่ได้ตั้ง Claude API Key — ไปที่ ⚙️ ตั้งค่า');
    }

    // 🆕 v0.9.6: sanitize API key — กัน "non ISO-8859-1" error
    apiKey = String(apiKey).replace(/[\u0000-\u001F\u007F-\uFFFF]/g, '').trim();
    if (!apiKey) {
      throw new Error('Claude API Key ไม่ถูกต้อง — มีอักษรพิเศษ กรุณาลบและพิมพ์/วางใหม่');
    }

    const model = options.model || settings.claudeModel || 'claude-haiku-4-5';
    const systemPrompt = options.systemPrompt || 'คุณเป็นผู้ช่วยเภสัชกร โรงพยาบาลรือเสาะ ตอบเป็นภาษาไทย';

    console.log(`[RHAI] Claude request (${model})`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: options.maxTokens ?? 1000,
        temperature: options.temperature ?? 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Claude HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return {
      text: text,
      model: model,
      provider: 'claude',
      usage: data.usage
    };
  },

  // =====================================================
  // FEATURE 1: Auto-fill รายละเอียด/คำสำคัญ จากชื่อเรื่อง
  // (เลียน KruBank ที่พิมพ์ชื่อแล้ว AI generate description ให้)
  // =====================================================
  async autoFillTopicDetails(title, audience = 'public', language = 'th') {
    if (!title || title.trim().length < 3) {
      throw new Error('กรุณาใส่ชื่อเรื่องให้ยาวอย่างน้อย 3 ตัวอักษร');
    }

    const aud = this.AUDIENCE_PROMPTS[audience] || this.AUDIENCE_PROMPTS.public;
    const lang = this.LANGUAGES[language] || this.LANGUAGES.th;

    const langInstruction = language === 'ms'
      ? 'TULIS DALAM BAHASA MELAYU (Malay language). Gunakan istilah perubatan yang biasa di Malaysia/selatan Thailand.'
      : language === 'en'
      ? 'WRITE IN ENGLISH. Use clear, professional medical terminology.'
      : 'เขียนเป็นภาษาไทยครับ ใช้คำที่เข้าใจง่าย';

    const prompt = `
${langInstruction}

หัวข้อ/Topic/Tajuk: "${title}"
กลุ่มเป้าหมาย: ${aud.label}
แนวการเขียน: ${aud.style}
จุดเน้น: ${aud.focus}

ภารกิจ: เขียน "รายละเอียด/คำสำคัญ" สั้นๆ 3-5 บรรทัด สำหรับใช้เป็น brief ให้สร้างสื่อให้ความรู้
- ระบุประเด็นหลัก 3-5 ข้อที่ควรครอบคลุม
- ระบุคำสำคัญที่ควรปรากฏ
- ถ้าเกี่ยวข้องกับยา ระบุชื่อยาเฉพาะที่ควรพูดถึง
- ห้ามเขียนเป็นบทความเต็ม — เป็น brief เท่านั้น

เริ่มเขียน brief เลย ห้ามมี preamble:`.trim();

    const result = await this.callAI(prompt, {
      temperature: 0.8,
      maxTokens: 400,
      systemPrompt: 'คุณเป็นเภสัชกรชำนาญการ ที่เชี่ยวชาญด้านการสื่อสารสุขภาพ ตอบกระชับ ตรงประเด็น รองรับภาษาไทย/มลายู/อังกฤษ'
    });

    return {
      details: result.text.trim(),
      provider: result.provider,
      model: result.model,
      language: language
    };
  },

  // =====================================================
  // FEATURE 2: Generate เนื้อหา 5 slides สำหรับ infographic
  // (จะใช้ใน Sprint 3)
  // =====================================================
  async generateInfographicContent(topic, audience, template) {
    const aud = this.AUDIENCE_PROMPTS[audience] || this.AUDIENCE_PROMPTS.public;

    const templateGuide = {
      'key-facts': '5 ข้อเท็จจริงสำคัญ (Fact 1-5)',
      'qa': '5 คำถาม-คำตอบ (Q&A)',
      'warning': '1 หัวข้อหลัก + 4 ข้อควรระวัง',
      'how-to': '5 ขั้นตอน (Step 1-5)',
      'comparison': '1 หัวข้อ + 2 คอลัมน์เปรียบเทียบ'
    };

    const prompt = `
หัวข้อ: "${topic.title}"
รายละเอียด: ${topic.details || '(ไม่มี)'}
กลุ่มเป้าหมาย: ${aud.label} (${aud.style})
รูปแบบ: ${templateGuide[template] || '5 ข้อสำคัญ'}

สร้างเนื้อหาเป็น JSON ตามโครงสร้าง:
{
  "title": "หัวข้อหลัก ไม่เกิน 50 ตัวอักษร",
  "subtitle": "หัวข้อรอง ไม่เกิน 80 ตัวอักษร",
  "slides": [
    { "heading": "หัว ไม่เกิน 30 ตัวอักษร", "body": "เนื้อหา ไม่เกิน 100 ตัวอักษร" },
    ... (รวม 5 slides)
  ],
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "cta": "Call to action สั้นๆ ไม่เกิน 60 ตัวอักษร"
}

ห้ามมี preamble หรือ markdown — return JSON เท่านั้น`.trim();

    const result = await this.callAI(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
      json: true,
      systemPrompt: 'คุณเป็น content designer ของกลุ่มเภสัชกรรม รพ.รือเสาะ ตอบเป็น JSON ที่ valid เท่านั้น'
    });

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(result.text);
    } catch (e) {
      // Gemini บางครั้งใส่ ```json ทับ JSON
      const cleaned = result.text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e2) {
        throw new Error('AI ส่งข้อมูลที่ parse ไม่ได้: ' + result.text.slice(0, 100));
      }
    }

    return {
      content: parsed,
      provider: result.provider,
      model: result.model
    };
  },

  // =====================================================
  // HELPERS
  // =====================================================
  async getSettings() {
    const data = await chrome.storage.local.get(['rhPharmaSettings']);
    return data.rhPharmaSettings || {};
  }
};

// Export ให้ Side Panel ใช้
window.RHAI = RHAI;
console.log('[RHAI] AI helper loaded');
