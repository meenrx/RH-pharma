// =====================================================
// RH Pharma - sidepanel.js (Sprint 1: Foundation)
// =====================================================
// บทบาท:
// 1. จัดการ tabs (3 แท็บหลัก + sub-tabs ในแท็บสร้างสื่อ)
// 2. จัดการ Settings modal (AI keys, branding, safety)
// 3. CRUD หัวข้อความรู้ (เพิ่ม/ลบ/list)
// 4. Toast notifications
// =====================================================

console.log('[RH Pharma] Side panel loaded v0.1.0');

// =====================================================
// STATE & CONSTANTS
// =====================================================
const STATE = {
  currentTab: 'topics',
  currentMode: 'image',
  currentAudience: 'public',
  currentRatio: '1:1',
  currentLanguage: 'th',
  settings: null,
  topics: [],
  posts: []
};

const AUDIENCE_LABELS = {
  public: 'ประชาชน',
  nurse: 'พยาบาล',
  doctor: 'แพทย์',
  pharmacist: 'เภสัชกร',
  hcp: 'บุคลากรการแพทย์'
};

const CATEGORY_LABELS = {
  'drug-knowledge': 'ยา',
  'disease-prevention': 'โรค/ป้องกัน',
  'health-behavior': 'พฤติกรรม',
  'hospital-news': 'ข่าวสาร',
  'other': 'อื่นๆ'
};

// =====================================================
// HELPERS
// =====================================================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function showToast(message, type = 'info', duration = 2500) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), duration);
}

async function loadFromStorage() {
  const data = await chrome.storage.local.get([
    'rhPharmaSettings',
    'rhPharmaTopics',
    'rhPharmaPosts'
  ]);

  STATE.settings = data.rhPharmaSettings || {};
  STATE.topics = data.rhPharmaTopics || [];
  STATE.posts = data.rhPharmaPosts || [];

  // อัพเกรด defaults สำหรับ user ที่ติดตั้งเก่า
  let needSave = false;
  if (STATE.settings.blurOnRecord === undefined) {
    STATE.settings.blurOnRecord = true;
    needSave = true;
  }
  if (STATE.settings.antiDetect === undefined) {
    STATE.settings.antiDetect = true;
    needSave = true;
  }
  if (STATE.settings.theme === undefined || STATE.settings.theme === 'auto') {
    STATE.settings.theme = 'dark';   // ✅ default = dark mode (ตามที่พี่ขอ)
    needSave = true;
  }
  if (needSave) await saveSettings();

  console.log('[RH Pharma] โหลดข้อมูล:', STATE);
}

async function saveSettings() {
  await chrome.storage.local.set({ rhPharmaSettings: STATE.settings });
}

async function saveTopics() {
  await chrome.storage.local.set({ rhPharmaTopics: STATE.topics });
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

// =====================================================
// TAB SWITCHING (หลัก)
// =====================================================
function setupTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  STATE.currentTab = tab;
  $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'tab' + capitalize(tab)));

  // refresh ข้อมูลเมื่อสลับ tab
  if (tab === 'create') refreshTopicSelect();
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// =====================================================
// SUB-TABS (ในแท็บสร้างสื่อ)
// =====================================================
function setupSubTabs() {
  // Sprint 3: sub-tabs removed in favor of engine selector — make this safe
  const subTabBtns = $$('.sub-tab-btn');
  if (subTabBtns.length === 0) return;

  subTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      STATE.currentMode = mode;
      $$('.sub-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    });
  });
}

// =====================================================
// LANGUAGE SELECTOR (🇹🇭 ไทย / 🇲🇾 มลายู / 🇬🇧 อังกฤษ)
// =====================================================
function setupLanguageSelector() {
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      STATE.currentLanguage = lang;
      $$('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      // refresh preview ถ้ามี template เลือกอยู่
      if (CURRENT_TEMPLATE_ID) updatePreview();
    });
  });
}

// =====================================================
// AUDIENCE SELECTOR
// =====================================================
function setupAudienceSelector() {
  $$('.audience-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const aud = btn.dataset.audience;
      STATE.currentAudience = aud;
      $$('.audience-btn').forEach(b => b.classList.toggle('active', b.dataset.audience === aud));
    });
  });
}

// =====================================================
// RATIO SELECTOR
// =====================================================
function setupRatioSelector() {
  $$('.ratio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ratio = btn.dataset.ratio;
      STATE.currentRatio = ratio;
      $$('.ratio-btn').forEach(b => b.classList.toggle('active', b.dataset.ratio === ratio));
    });
  });
}

// =====================================================
// AI MODE TOGGLE (สลับใช้ AI / ไม่ใช้)
// =====================================================
function setupAiModeToggle() {
  const toggle = $('#aiModeToggle');
  const labelLeft = $('#aiModeLabel');
  const labelRight = $('#aiProviderLabel');

  if (!toggle) {
    console.warn('[RH Pharma] #aiModeToggle ไม่พบ — skip setupAiModeToggle');
    return;
  }

  toggle.addEventListener('change', async () => {
    STATE.settings.useAI = toggle.checked;
    await saveSettings();
    updateAiModeUI();
  });

  // โหลดค่าจาก storage
  toggle.checked = !!STATE.settings.useAI;
  updateAiModeUI();
}

function updateAiModeUI() {
  const useAI = !!STATE.settings.useAI;
  const labelLeft = $('#aiModeLabel');
  const labelRight = $('#aiProviderLabel');

  if (!labelLeft || !labelRight) return;  // 🛡️ guard

  labelLeft.classList.toggle('active', !useAI);
  labelRight.classList.toggle('active', useAI);

  // อัปเดตข้อความฝั่งขวาตาม provider
  const provider = STATE.settings.aiProvider || 'openai';
  const providerLabels = {
    openai: '⚡ OpenAI',
    gemini: '🔮 Gemini (legacy)',
    claude: '🟣 Claude'
  };
  labelRight.textContent = useAI ? (providerLabels[provider] || '🤖 ใช้ AI') : '🤖 ใช้ AI';
}

// =====================================================
// สร้างแบบ v0.8.5 — STATE (ส่งไป Flow + Nano Banana Pro)
// =====================================================
const MODEL_STATE = {
  // รูปอ้างอิง
  modelImage: null,
  productImage: null,

  // Checkboxes
  addCoverText: false,
  changeOutfit: false,
  soloMode: false,             // 🆕 v0.9.20 — คนเดียว ไม่มีคู่สนทนา

  // 🆕 v0.9.21 — Profession + Custom
  profession: 'pharmacist',    // PROFESSIONS id
  customProfessionDesc: '',    // อธิบาย custom profession
  customOutfitDesc: '',        // อธิบาย custom outfit

  // 🆕 Headline
  coverHeadline: '',           // ข้อความที่ผู้ใช้พิมพ์/AI gen
  drugContext: '',             // ข้อมูลยาที่ผู้ใช้บอก AI
  headlineCandidates: [],      // 3 candidates จาก AI ครั้งล่าสุด
  headlineHistory: [],         // 5 อันล่าสุด

  // Dropdowns (จะถูก set จาก DEFAULTS ใน setupTopicHandlers)
  imageStyle: 'realistic',
  cameraAngle: 'half_body',
  background: 'pharmacy',
  drugPosition: 'hold_show',
  modelPose: 'smile_explain',
  partnerPose: 'listen_nod',
  audience: 'elderly_male_muslim',
  pharmacistOutfit: 'default_white_coat',
  characterPosition: 'ai_decide',  // 🆕

  // Mode + ratio + count
  promptLang: 'en',
  ratio: '9:16',
  count: 2,

  // Edited prompt (ถ้าผู้ใช้แก้จาก modal)
  editedPrompt: null
};

// =====================================================
// สร้างแบบ — SETUP (เรียกครั้งเดียวตอน init)
// =====================================================
function setupTopicHandlers() {
  if (!window.RHModelOptions) {
    console.error('[RH Pharma] RHModelOptions ยังไม่โหลด');
    return;
  }

  const RMO = window.RHModelOptions;
  const D = RMO.DEFAULTS;

  // ใช้ค่า default จาก model-options.js
  Object.assign(MODEL_STATE, {
    addCoverText: D.addCoverText,
    changeOutfit: D.changeOutfit,
    coverHeadline: D.coverHeadline || '',
    drugContext: D.drugContext || '',
    imageStyle: D.imageStyle,
    cameraAngle: D.cameraAngle,
    background: D.background,
    drugPosition: D.drugPosition,
    modelPose: D.modelPose,
    partnerPose: D.partnerPose,
    audience: D.audience,
    pharmacistOutfit: D.pharmacistOutfit,
    characterPosition: D.characterPosition || 'ai_decide',
    promptLang: D.promptLang,
    ratio: D.ratio,
    count: D.count
  });

  // ----- Helper: render dropdown options -----
  function fillSelect(selectId, options, selectedId) {
    const sel = $(selectId);
    if (!sel) return;
    sel.innerHTML = options.map(opt =>
      `<option value="${opt.id}">${opt.icon} ${opt.label}</option>`
    ).join('');
    sel.value = selectedId;
  }

  // 🆕 v0.9.21: fillSelectGrouped — group ตาม `group` field
  function fillSelectGrouped(selectId, options, selectedId, groupLabels) {
    const sel = $(selectId);
    if (!sel) return;
    // จัดกลุ่ม
    const groups = {};
    options.forEach(opt => {
      const g = opt.group || 'ungrouped';
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    });
    let html = '';
    Object.entries(groups).forEach(([g, opts]) => {
      const label = (groupLabels && groupLabels[g]) || g;
      html += `<optgroup label="${label}">`;
      html += opts.map(o => `<option value="${o.id}">${o.icon} ${o.label}</option>`).join('');
      html += `</optgroup>`;
    });
    sel.innerHTML = html;
    sel.value = selectedId;
  }

  fillSelect('#selImageStyle',         RMO.IMAGE_STYLES,        D.imageStyle);
  fillSelect('#selCameraAngle',        RMO.CAMERA_ANGLES,       D.cameraAngle);
  fillSelect('#selBackground',         RMO.BACKGROUNDS,         D.background);
  fillSelect('#selModelPose',          RMO.MODEL_POSES,         D.modelPose);
  fillSelect('#selPartnerPose',        RMO.PARTNER_POSES,       D.partnerPose);
  fillSelect('#selCharacterPosition',  RMO.CHARACTER_POSITIONS, D.characterPosition || 'ai_decide');
  fillSelect('#selAudience',           RMO.AUDIENCES,           D.audience);

  // 🆕 v0.9.21: Grouped dropdowns
  fillSelectGrouped('#selDrugPosition', RMO.ITEM_POSITIONS, MODEL_STATE.drugPosition || 'hold_show', {
    'in_hand': '🤲 ในมือตัวละคร',
    'on_surface': '📋 บนพื้นผิว',
    'on_person': '👤 บนผู้คน/ร่างกาย',
    'on_wall': '🖼️ บนผนัง/พื้นหลัง',
    'in_container': '🛍️ ในภาชนะ',
    'composition': '🎯 มุมกล้อง/Composition',
    'none': '📷 ไม่มี'
  });
  fillSelectGrouped('#selPharmacistOutfit', RMO.PROFESSIONAL_OUTFITS, D.pharmacistOutfit, {
    'pharmacist': '💊 เภสัชกร',
    'nurse': '👩‍⚕️ พยาบาล',
    'doctor': '👨‍⚕️ แพทย์',
    'public_health': '🌾 บุคลากรสาธารณสุข',
    'muslim': '☪️ ชุดมุสลิม',
    'general': '👔 ทั่วไปทุกวิชาชีพ'
  });
  fillSelectGrouped('#selProfession', RMO.PROFESSIONS, MODEL_STATE.profession || 'pharmacist', {
    'main': '🩺 วิชาชีพหลัก',
    'public_health': '🏥 บุคลากรสาธารณสุข',
    'student': '📚 วิชาชีพอื่น',
    'custom': '🎨 Custom'
  });

  // ----- bind dropdown change events -----
  const dropdownMap = {
    '#selImageStyle':         'imageStyle',
    '#selCameraAngle':        'cameraAngle',
    '#selBackground':         'background',
    '#selDrugPosition':       'drugPosition',
    '#selModelPose':          'modelPose',
    '#selPartnerPose':        'partnerPose',
    '#selCharacterPosition':  'characterPosition',
    '#selAudience':           'audience',
    '#selPharmacistOutfit':   'pharmacistOutfit',
    '#selProfession':         'profession'   // 🆕 v0.9.21
  };
  Object.entries(dropdownMap).forEach(([sel, key]) => {
    const el = $(sel);
    if (el) el.addEventListener('change', () => {
      MODEL_STATE[key] = el.value;
      MODEL_STATE.editedPrompt = null;

      // 🆕 v0.9.21: Show/hide custom panels
      if (sel === '#selProfession') {
        const customGroup = $('#customProfessionGroup');
        if (customGroup) customGroup.style.display = (el.value === 'custom') ? 'block' : 'none';
      }
      if (sel === '#selPharmacistOutfit') {
        const customOutfitArea = $('#customOutfitDesc');
        if (customOutfitArea) customOutfitArea.style.display = (el.value === 'custom_outfit') ? 'block' : 'none';
      }
    });
  });

  // 🆕 v0.9.21: Custom Profession description binding
  const customProfTextarea = $('#customProfessionDesc');
  if (customProfTextarea) {
    customProfTextarea.addEventListener('input', () => {
      MODEL_STATE.customProfessionDesc = customProfTextarea.value;
      MODEL_STATE.editedPrompt = null;
    });
  }

  // 🆕 v0.9.21: Custom Outfit description binding
  const customOutfitTextarea = $('#customOutfitDesc');
  if (customOutfitTextarea) {
    customOutfitTextarea.addEventListener('input', () => {
      MODEL_STATE.customOutfitDesc = customOutfitTextarea.value;
      MODEL_STATE.editedPrompt = null;
    });
  }

  // 🆕 v0.9.21: AI Gen Visual DNA button
  const btnAIGenDNA = $('#btnAIGenVisualDNA');
  if (btnAIGenDNA) {
    btnAIGenDNA.addEventListener('click', () => aiGenVisualDNAFromCustom());
  }

  // [v0.9.8] คืน Cover headline event bindings (ย้ายกลับมาจาก Tab "วิดีโอ")
  const cbCover = $('#optAddCoverText');
  const headlineGroup = $('#headlineGroup');
  if (cbCover) cbCover.addEventListener('change', () => {
    MODEL_STATE.addCoverText = cbCover.checked;
    if (headlineGroup) headlineGroup.style.display = cbCover.checked ? 'block' : 'none';
    MODEL_STATE.editedPrompt = null;
  });
  const inpHeadline = $('#coverHeadlineInput');
  if (inpHeadline) inpHeadline.addEventListener('input', () => {
    MODEL_STATE.coverHeadline = inpHeadline.value;
    MODEL_STATE.editedPrompt = null;
  });
  const inpDrugContext = $('#drugContextInput');
  if (inpDrugContext) inpDrugContext.addEventListener('input', () => {
    MODEL_STATE.drugContext = inpDrugContext.value;
  });
  const btnGenHeadline = $('#btnGenerateHeadline');
  if (btnGenHeadline) btnGenHeadline.addEventListener('click', generateHeadlinesWithAI);
  const btnRegen = $('#btnRegenHeadlines');
  if (btnRegen) btnRegen.addEventListener('click', generateHeadlinesWithAI);
  loadHeadlineHistory();

  const cbOutfit = $('#optChangeOutfit');
  const outfitGroup = $('#outfitGroup');
  if (cbOutfit && outfitGroup) {
    cbOutfit.addEventListener('change', () => {
      MODEL_STATE.changeOutfit = cbOutfit.checked;
      outfitGroup.style.display = cbOutfit.checked ? 'block' : 'none';
      MODEL_STATE.editedPrompt = null;
    });
  }

  // 🆕 v0.9.20: solo mode (เภสัชกรคนเดียว)
  const cbSolo = $('#optSoloMode');
  if (cbSolo) {
    cbSolo.addEventListener('change', () => {
      MODEL_STATE.soloMode = cbSolo.checked;
      MODEL_STATE.editedPrompt = null;
      // 🆕 v0.9.21: ซ่อน/แสดง partner section
      const partnerSec = $('#partnerSection');
      if (partnerSec) partnerSec.style.display = cbSolo.checked ? 'none' : 'block';
    });
  }

  // ----- ภาษา prompt (render เป็นปุ่มเหมือน lang-btn) -----
  const langContainer = $('#promptLangOptions');
  if (langContainer) {
    langContainer.innerHTML = RMO.PROMPT_LANGUAGES.map(l => `
      <button class="lang-btn ${l.id === D.promptLang ? 'active' : ''}" data-prompt-lang="${l.id}" title="${l.desc}">
        <span class="lang-flag">${l.icon}</span>
        <span>${l.label}</span>
      </button>
    `).join('');
    langContainer.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        MODEL_STATE.promptLang = btn.dataset.promptLang;
        MODEL_STATE.editedPrompt = null;
        langContainer.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
  }

  // ----- อัตราส่วน (render ปุ่ม) -----
  const ratioContainer = $('#ratioOptions');
  if (ratioContainer) {
    ratioContainer.innerHTML = RMO.RATIOS.map(r => `
      <button class="ratio-btn ${r.id === D.ratio ? 'active' : ''}" data-ratio="${r.id}">
        <span class="ratio-icon">${r.icon}</span>
        <span class="ratio-name">${r.label}</span>
        <span class="ratio-desc">${r.desc}</span>
      </button>
    `).join('');

    // 🆕 v0.9.6: warning สำหรับ 9:16 (Nano Banana ไม่ค่อยคมชัด)
    const ratioWarning = document.createElement('div');
    ratioWarning.id = 'ratioWarning916';
    ratioWarning.className = 'ratio-warning';
    ratioWarning.style.display = (D.ratio === '9:16') ? 'flex' : 'none';
    ratioWarning.innerHTML = `
      <span style="font-size:14px;">💡</span>
      <div>
        <strong>9:16 อาจไม่คมชัดเท่า 16:9 หรือ 1:1</strong><br>
        <span style="opacity:0.85;">แนะนำ: ถ้าเน้นคุณภาพ → เลือก 16:9 แล้ว crop เป็น 9:16 ภายหลัง</span>
      </div>
    `;
    ratioContainer.parentElement.appendChild(ratioWarning);

    ratioContainer.querySelectorAll('.ratio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        MODEL_STATE.ratio = btn.dataset.ratio;
        MODEL_STATE.editedPrompt = null;
        ratioContainer.querySelectorAll('.ratio-btn').forEach(b => b.classList.toggle('active', b === btn));
        // toggle warning
        ratioWarning.style.display = (btn.dataset.ratio === '9:16') ? 'flex' : 'none';
      });
    });
  }

  // ----- จำนวนภาพ (render ปุ่ม) -----
  const countContainer = $('#countOptions');
  if (countContainer) {
    countContainer.innerHTML = RMO.COUNTS.map(c => `
      <button class="count-btn ${c === D.count ? 'active' : ''}" data-count="${c}">x${c}</button>
    `).join('');
    countContainer.querySelectorAll('.count-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        MODEL_STATE.count = parseInt(btn.dataset.count);
        countContainer.querySelectorAll('.count-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
  }

  // ----- 📷 Image upload -----
  setupImageUploads();

  // ----- ปุ่มดู / แก้ prompt -----
  const btnPreview = $('#btnPreviewModelPrompt');
  if (btnPreview) btnPreview.addEventListener('click', openModelPromptModal);

  const btnCloseModal = $('#btnCloseModelPrompt');
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModelPromptModal);

  const btnReset = $('#btnResetModelPrompt');
  if (btnReset) btnReset.addEventListener('click', () => {
    MODEL_STATE.editedPrompt = null;
    const ta = $('#modelPromptText');
    if (ta) ta.value = window.RHModelOptions.buildPrompt(MODEL_STATE);
    showToast('🔄 สร้าง prompt ใหม่จากตัวเลือกแล้ว', 'info', 1500);
  });

  const btnSendFromModal = $('#btnSendModelFromModal');
  if (btnSendFromModal) btnSendFromModal.addEventListener('click', () => {
    const ta = $('#modelPromptText');
    if (ta) MODEL_STATE.editedPrompt = ta.value;
    closeModelPromptModal();
    createModel();
  });

  // ----- ปุ่มสร้างแบบ -----
  const btnCreate = $('#btnCreateModel');
  if (btnCreate) btnCreate.addEventListener('click', createModel);
}

// =====================================================
// Modal — ดู / แก้ prompt
// =====================================================
function openModelPromptModal() {
  const modal = $('#modelPromptModal');
  const ta = $('#modelPromptText');
  if (!modal || !ta || !window.RHModelOptions) return;

  ta.value = MODEL_STATE.editedPrompt || window.RHModelOptions.buildPrompt(MODEL_STATE);
  modal.style.display = 'flex';
}

function closeModelPromptModal() {
  const modal = $('#modelPromptModal');
  if (modal) modal.style.display = 'none';
}

// =====================================================
// 🆕 Headline AI generator (v0.8.5)
// =====================================================
const HEADLINE_HISTORY_KEY = 'rhPharmaHeadlineHistory';
const HEADLINE_HISTORY_MAX = 5;

async function loadHeadlineHistory() {
  try {
    const data = await chrome.storage.local.get([HEADLINE_HISTORY_KEY]);
    MODEL_STATE.headlineHistory = data[HEADLINE_HISTORY_KEY] || [];
    renderHeadlineHistory();
  } catch (e) {
    console.warn('[RH Pharma] โหลด headline history ไม่ได้:', e);
  }
}

async function saveHeadlineToHistory(text) {
  if (!text || !text.trim()) return;
  const trimmed = text.trim();
  // dedupe: ลบของเก่าถ้ามี
  MODEL_STATE.headlineHistory = MODEL_STATE.headlineHistory.filter(h => h !== trimmed);
  // ใส่ไว้บนสุด
  MODEL_STATE.headlineHistory.unshift(trimmed);
  // จำกัด 5 อัน
  MODEL_STATE.headlineHistory = MODEL_STATE.headlineHistory.slice(0, HEADLINE_HISTORY_MAX);
  // save
  try {
    await chrome.storage.local.set({ [HEADLINE_HISTORY_KEY]: MODEL_STATE.headlineHistory });
  } catch (e) {
    console.warn('[RH Pharma] บันทึก history ไม่ได้:', e);
  }
  renderHeadlineHistory();
}

function renderHeadlineHistory() {
  const wrap = $('#headlineHistory');
  const list = $('#headlineHistoryList');
  const count = $('#historyCount');
  if (!wrap || !list) return;

  const history = MODEL_STATE.headlineHistory || [];
  if (history.length === 0) {
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = 'block';
  if (count) count.textContent = `${history.length} รายการ`;

  list.innerHTML = history.map((text, i) => `
    <div class="history-item" data-idx="${i}">
      <span class="history-item-text">${escapeHtml(text)}</span>
      <span class="history-item-use">↑ ใช้</span>
    </div>
  `).join('');

  list.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx);
      const text = MODEL_STATE.headlineHistory[idx];
      if (text) applyHeadline(text);
    });
  });
}

function applyHeadline(text) {
  MODEL_STATE.coverHeadline = text;
  MODEL_STATE.editedPrompt = null;
  const inp = $('#coverHeadlineInput');
  if (inp) inp.value = text;
  showToast('✅ เลือก headline แล้ว', 'success', 1500);
}

function renderHeadlineCandidates(candidates) {
  const wrap = $('#headlineCandidates');
  const list = $('#headlineCandidatesList');
  if (!wrap || !list) return;

  if (!candidates || candidates.length === 0) {
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = 'block';

  list.innerHTML = candidates.map((text, i) => `
    <label class="candidate-radio" data-idx="${i}">
      <input type="radio" name="headline-candidate" value="${i}" />
      <span class="candidate-text">${escapeHtml(text)}</span>
    </label>
  `).join('');

  // bind: เลือก candidate → เติมในช่อง textarea
  list.querySelectorAll('.candidate-radio').forEach(label => {
    label.addEventListener('click', () => {
      const idx = parseInt(label.dataset.idx);
      const text = candidates[idx];
      if (!text) return;

      // highlight selected
      list.querySelectorAll('.candidate-radio').forEach(l => l.classList.toggle('selected', l === label));
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      // เติมในช่อง + save history
      applyHeadline(text);
      saveHeadlineToHistory(text);
    });
  });
}

// 🆕 v0.9.23: AI Gen Audience description (Tab Infographic)
async function aiGenInfoAudience() {
  const btn = $('#btnAIGenInfoAudience');
  const desc = ($('#customInfoAudienceDesc')?.value || '').trim();

  if (!desc) {
    showToast('⚠️ กรุณาอธิบายกลุ่มเป้าหมายก่อน', 'warning', 2500);
    return;
  }
  if (!window.RHAI) {
    showToast('❌ ระบบ AI ยังไม่โหลด', 'error');
    return;
  }
  try {
    const settings = await window.RHAI.getSettings();
    const provider = settings.aiProvider || 'openai';
    const keyMap = { openai: settings.openaiApiKey, claude: settings.claudeApiKey, gemini: settings.geminiApiKey };
    if (!keyMap[provider]) {
      const providerNames = { openai: 'OpenAI', claude: 'Claude', gemini: 'Gemini' };
      showToast(`⚠️ ยังไม่ได้ตั้ง ${providerNames[provider]} API Key`, 'warning', 4500);
      return;
    }
  } catch (e) {}

  const systemPrompt = `You are a Thai infographic designer assistant. The user describes their target audience for a health infographic. Your job: expand the description into a richer, design-friendly Thai paragraph that helps the AI understand:
1. Who they are (age, occupation, lifestyle context)
2. Their concerns and motivations
3. Their visual preferences (colors, complexity level)
4. Reading habits (literacy, attention span)

USER DESCRIPTION:
${desc}

REQUIREMENTS:
- Output ONE Thai paragraph (60-100 words)
- Mix Thai + English keywords for design terms
- Include design hints (e.g., "ใช้สีอบอุ่น", "ตัวอักษรใหญ่", "ภาพประกอบสไตล์...")
- NO quotes, NO labels — just the paragraph

EXAMPLE OUTPUT:
"คุณแม่มือใหม่อายุ 25-35 ปี มักกังวลเรื่องการเลี้ยงลูกในเดือนแรก ใช้เวลาส่วนใหญ่อยู่ที่บ้าน อ่านข้อมูลจากมือถือ ชอบ design โทนอบอุ่นพาสเทล ภาพประกอบนุ่มนวล อ่านง่าย ตัวอักษรขนาดกลาง เน้น tips practical และข้อความให้กำลังใจ"

Now generate the audience description. Output ONLY the paragraph.`;

  if (btn) {
    btn.disabled = true;
    const lastSpan = btn.querySelector('span span:last-child');
    if (lastSpan) lastSpan.textContent = 'กำลัง gen...';
  }

  try {
    const result = await window.RHAI.callAI(systemPrompt, {
      maxTokens: 300,
      temperature: 0.7
    });
    const rawText = (result && typeof result === 'object') ? result.text : String(result || '');
    const cleaned = rawText.trim().replace(/^["']|["']$/g, '');

    if (cleaned.length < 30) {
      showToast('⚠️ AI gen ไม่สำเร็จ ลองอีกครั้ง', 'warning', 2500);
      return;
    }

    const textarea = $('#customInfoAudienceDesc');
    if (textarea) {
      textarea.value = cleaned;
      INFO_STATE.customAudienceDesc = cleaned;
      INFO_STATE.editedPrompt = null;
    }
    showToast('✅ Audience description gen สำเร็จ', 'success', 2500);
  } catch (err) {
    console.error('[AI Gen Audience] error:', err);
    showToast('❌ AI error: ' + (err.message || 'unknown'), 'error', 3000);
  } finally {
    if (btn) {
      btn.disabled = false;
      const lastSpan = btn.querySelector('span span:last-child');
      if (lastSpan) lastSpan.textContent = 'AI ช่วย gen รายละเอียดกลุ่มเป้าหมาย';
    }
  }
}

// 🆕 v0.9.21: AI Gen Visual DNA จาก custom description ใน Tab สร้างแบบ
async function aiGenVisualDNAFromCustom() {
  const btn = $('#btnAIGenVisualDNA');
  const desc = ($('#customProfessionDesc')?.value || '').trim();

  if (!desc) {
    showToast('⚠️ กรุณาอธิบายตัวละครก่อน', 'warning', 2500);
    return;
  }
  if (!window.RHAI) {
    showToast('❌ ระบบ AI ยังไม่โหลด', 'error');
    return;
  }

  // เช็ค API key
  try {
    const settings = await window.RHAI.getSettings();
    const provider = settings.aiProvider || 'openai';
    const keyMap = {
      openai: settings.openaiApiKey,
      claude: settings.claudeApiKey,
      gemini: settings.geminiApiKey
    };
    if (!keyMap[provider]) {
      const providerNames = { openai: 'OpenAI', claude: 'Claude', gemini: 'Gemini' };
      showToast(`⚠️ ยังไม่ได้ตั้ง ${providerNames[provider]} API Key`, 'warning', 4500);
      return;
    }
  } catch (e) {}

  // System prompt: gen Visual DNA แบบไทย+อังกฤษผสม
  const systemPrompt = `You are a Thai-English bilingual visual designer assistant. The user will describe a character (any healthcare profession or generic role). Your job: convert the description into a "Visual DNA" — a single paragraph in MIXED THAI + ENGLISH that describes the character's appearance for AI image generation.

USER DESCRIPTION:
${desc}

REQUIREMENTS:
1. Output ONE paragraph (50-80 words), MIXED Thai + English keywords
2. Keep specific visual keywords in ENGLISH (clothing items, colors, accessories like "white coat", "hijab", "stethoscope", "glasses")
3. Keep general descriptions in THAI (อายุ, สีหน้า, ผิวพรรณ, ความรู้สึก)
4. Format: "[เพศ][เชื้อชาติ][อายุ] อาชีพ [profession in English], [physical features], สวม [outfit details]..."
5. Be specific about: gender, age range, ethnicity (Thai/Thai-Malay/etc), face features, hair, skin, attire, expression
6. NO quotes, NO labels — just the paragraph

EXAMPLE OUTPUT:
"หญิงไทยอายุ 35 อาชีพ pharmacist ผมยาวสีดำมัดรวบ ผิวขาว สีหน้าเป็นมิตรอบอุ่น สวม white pharmacist coat ติด name tag หน้าอกซ้าย ทับ light blue blouse, ใส่ silver-rimmed glasses, มีบุคลิกมั่นใจ มืออาชีพ"

Now generate the Visual DNA for the description above. Output ONLY the paragraph, no markdown, no extra text.`;

  if (btn) {
    btn.disabled = true;
    btn.querySelector('span span:last-child').textContent = 'กำลัง gen...';
  }

  try {
    const result = await window.RHAI.callAI(systemPrompt, {
      maxTokens: 250,
      temperature: 0.7
    });
    const rawText = (result && typeof result === 'object') ? result.text : String(result || '');
    const cleaned = rawText.trim().replace(/^["']|["']$/g, '');

    if (cleaned.length < 20) {
      showToast('⚠️ AI gen ไม่สำเร็จ ลองอีกครั้ง', 'warning', 2500);
      return;
    }

    // ใส่ผลลงใน customProfessionDesc + แสดง toast ให้ user
    const textarea = $('#customProfessionDesc');
    if (textarea) {
      textarea.value = cleaned;
      MODEL_STATE.customProfessionDesc = cleaned;
      MODEL_STATE.editedPrompt = null;
    }
    showToast('✅ Visual DNA gen สำเร็จ', 'success', 2500);
  } catch (err) {
    console.error('[AI Gen Visual DNA] error:', err);
    showToast('❌ AI error: ' + (err.message || 'unknown'), 'error', 3000);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.querySelector('span span:last-child').textContent = 'AI ช่วย gen Visual DNA';
    }
  }
}

async function generateHeadlinesWithAI() {
  const btn = $('#btnGenerateHeadline');
  const loading = $('#headlineLoading');
  const candidates = $('#headlineCandidates');

  // เช็ค RHAI พร้อม
  if (!window.RHAI) {
    showToast('❌ ระบบ AI ยังไม่โหลด', 'error');
    return;
  }

  // เช็ค API key (โดยอ่าน setting + ดูว่า provider หลักมี key ไหม)
  try {
    const settings = await window.RHAI.getSettings();
    const provider = settings.aiProvider || 'openai';
    const keyMap = {
      openai: settings.openaiApiKey,
      claude: settings.claudeApiKey,
      gemini: settings.geminiApiKey
    };
    if (!keyMap[provider]) {
      const providerNames = { openai: 'OpenAI', claude: 'Claude', gemini: 'Gemini' };
      showToast(`⚠️ ยังไม่ได้ตั้ง ${providerNames[provider]} API Key — ไปที่ ⚙️ ตั้งค่า`, 'warning', 4500);
      return;
    }
  } catch (e) {
    console.error('[RH Pharma] เช็ค API key error:', e);
  }

  // หา persona label เพื่อเป็น context ให้ AI
  const RMO = window.RHModelOptions;
  const audOpt = RMO.AUDIENCES.find(a => a.id === MODEL_STATE.audience);
  const audienceLabel = audOpt ? audOpt.label : 'ประชาชนทั่วไป';
  const audiencePersona = audOpt ? audOpt.promptEn : '';

  const drugContext = (MODEL_STATE.drugContext || '').trim();

  // System prompt — อังกฤษ แต่ output ต้องเป็นไทยเท่านั้น
  const systemPrompt = `You are a Thai pharmacy social media copywriter for Rueso Hospital, a community hospital in Narathiwat, southern Thailand. The audience is mostly Thai-Malay Muslim patients.

YOUR TASK:
Create exactly 3 short, attention-grabbing headlines in THAI LANGUAGE ONLY for a social media image about a medicine.

REQUIREMENTS:
- Each headline: 6-8 Thai words maximum
- Output language: THAI ONLY (no English, no transliteration)
- Tone: friendly, easy to understand, NOT clickbait or sensational
- Appropriate for: ${audienceLabel} (${audiencePersona})
- Concise and punchy — designed to grab attention on Facebook/Instagram feed
- Use simple Thai words, avoid heavy medical jargon
- This is HEALTH content for a hospital — must be respectful and accurate

DRUG INFO (from pharmacist):
${drugContext || '(ไม่ได้ระบุ — ให้ใช้บริบททั่วไปของยาและคำแนะนำสุขภาพ)'}

OUTPUT FORMAT (CRITICAL):
Return ONLY a valid JSON array of exactly 3 Thai strings. No markdown, no code fences, no explanation.
Example: ["พาดหัว 1", "พาดหัว 2", "พาดหัว 3"]`;

  // UI: loading
  if (btn) btn.disabled = true;
  if (loading) loading.style.display = 'flex';
  if (candidates) candidates.style.display = 'none';

  try {
    const result = await window.RHAI.callAI(systemPrompt, {
      maxTokens: 300,
      temperature: 0.85
    });

    // RHAI.callAI returns { text, model, provider, usage }
    const rawText = (result && typeof result === 'object') ? result.text : String(result || '');
    console.log('[RH Pharma] AI raw response:', rawText);

    // Parse JSON array (clean markdown ถ้ามี)
    let cleaned = (rawText || '').trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // ลอง extract JSON array จาก text
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch (_) { parsed = null; }
      }
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('AI ตอบกลับไม่ถูกรูปแบบ — ลองใหม่');
    }

    // เก็บ candidates + render
    MODEL_STATE.headlineCandidates = parsed.slice(0, 3);
    renderHeadlineCandidates(MODEL_STATE.headlineCandidates);
    showToast('✅ AI สร้าง headline 3 แบบเรียบร้อย', 'success', 2000);

  } catch (err) {
    console.error('[generateHeadlinesWithAI] error:', err);
    showToast(`❌ ${err.message || 'AI generate ผิดพลาด'}`, 'error', 3500);
  } finally {
    if (btn) btn.disabled = false;
    if (loading) loading.style.display = 'none';
  }
}

// =====================================================
// สร้างแบบ — กดปุ่ม → ส่งไป Flow (Nano Banana Pro)
// =====================================================
async function createModel() {
  const btn = $('#btnCreateModel');
  const hint = $('#createModelHint');

  // ตรวจรูปครบ — ต้องมีทั้งนายแบบและรูปยา
  if (!MODEL_STATE.modelImage || !MODEL_STATE.productImage) {
    hint.textContent = '⚠️ กรุณาเลือกรูปนายแบบ + รูปยาให้ครบ';
    hint.style.color = 'var(--brand-red, #EF4444)';
    showToast('⚠️ ต้องมีทั้งรูปนายแบบและรูปยา', 'warning', 2500);
    return;
  }

  if (!window.RHModelOptions) {
    showToast('❌ ระบบ RHModelOptions ยังไม่โหลด', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ กำลังเตรียม...';
  hint.textContent = '';

  try {
    // ใช้ prompt ที่ผู้ใช้แก้จาก modal ถ้ามี — ถ้าไม่มี สร้างใหม่
    const prompt = MODEL_STATE.editedPrompt || window.RHModelOptions.buildPrompt(MODEL_STATE);

    // เตรียมรูป — ตามลำดับ: นายแบบ (1) → ยา (2). กรอง null/undefined ออก
    const images = [MODEL_STATE.modelImage, MODEL_STATE.productImage].filter(Boolean);

    // เตรียม payload สำหรับ flow-autofill.js
    await chrome.storage.local.set({
      rhPharmaFlowPending: {
        prompt,
        images,
        mode: 'image',
        model: 'nano-banana-pro',
        ratio: MODEL_STATE.ratio,
        count: MODEL_STATE.count,
        autoGenerate: false,           // ❗ ผู้ใช้กด submit เอง
        timestamp: Date.now()
      }
    });

    showToast('🚀 เปิด Flow แล้ว — กรุณากด "+ New project"', 'info', 5000);

    // ตรวจหา Flow tab ที่เปิดอยู่ — ถ้ามีให้ focus, ถ้าไม่มีเปิดใหม่
    const flowTabs = await chrome.tabs.query({ url: ['https://labs.google/fx/tools/flow*'] });
    if (flowTabs.length > 0) {
      const tab = flowTabs[0];
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      // ส่ง message ให้ content script เริ่มทำงาน
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'flowProcessPending' });
      } catch (e) {
        // content script ยังไม่ inject (เช่น Flow เพิ่ง redirect) — reload tab
        console.log('[RH Pharma] Flow content script ยังไม่พร้อม → reload tab');
        await chrome.tabs.reload(tab.id);
      }
    } else {
      // เปิด Flow ใหม่
      await chrome.tabs.create({ url: 'https://labs.google/fx/tools/flow', active: true });
    }

    hint.textContent = `✅ ส่งไป Flow แล้ว — รอรูปโหลดเสร็จ → กด Ctrl+V ในช่อง prompt`;
    hint.style.color = 'var(--text-secondary)';

    // เคลียร์ edited prompt หลังส่งสำเร็จ
    MODEL_STATE.editedPrompt = null;

  } catch (err) {
    console.error('[createModel] error:', err);
    hint.textContent = `❌ ${err.message}`;
    hint.style.color = 'var(--brand-red, #EF4444)';
    showToast(`❌ ${err.message}`, 'error', 3000);
  } finally {
    btn.disabled = false;
    btn.textContent = '✨ สร้างแบบ → ส่งไป Flow';
  }
}

// =====================================================
// IMAGE UPLOAD (รูปแผงยา + นายแบบ/นางแบบ)
// =====================================================
function setupImageUploads() {
  // รูปแผงยา
  const productArea = $('#productImageArea');
  const productInput = $('#productImageInput');
  const btnRemoveProduct = $('#btnRemoveProduct');
  if (productArea && productInput) {
    productArea.addEventListener('click', (e) => {
      if (e.target.id === 'btnRemoveProduct') return;
      if (!CURRENT_PRODUCT_IMAGE) productInput.click();
    });
    productInput.addEventListener('change', (e) => handleImageFile(e, 'product'));
  }
  if (btnRemoveProduct) {
    btnRemoveProduct.addEventListener('click', () => removeImage('product'));
  }

  // รูปนายแบบ
  const modelArea = $('#modelImageArea');
  const modelInput = $('#modelImageInput');
  const btnRemoveModel = $('#btnRemoveModel');
  if (modelArea && modelInput) {
    modelArea.addEventListener('click', (e) => {
      if (e.target.id === 'btnRemoveModel') return;
      if (!CURRENT_MODEL_IMAGE) modelInput.click();
    });
    modelInput.addEventListener('change', (e) => handleImageFile(e, 'model'));
  }
  if (btnRemoveModel) {
    btnRemoveModel.addEventListener('click', () => removeImage('model'));
  }
}

function handleImageFile(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  // เช็คขนาด (ไม่เกิน 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('⚠️ ไฟล์ใหญ่เกิน 5MB', 'warning');
    return;
  }

  // เช็คประเภท
  if (!file.type.startsWith('image/')) {
    showToast('⚠️ ต้องเป็นไฟล์รูปภาพเท่านั้น', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    if (type === 'product') {
      CURRENT_PRODUCT_IMAGE = dataUrl;
      MODEL_STATE.productImage = dataUrl;  // sync ไป MODEL_STATE
      $('#productImagePreview').src = dataUrl;
      $('#productImagePreview').style.display = 'block';
      $('#productImageArea').classList.add('has-image');
      $('#productImageArea').querySelector('.image-upload-empty').style.display = 'none';
      $('#btnRemoveProduct').style.display = 'flex';
    } else {
      CURRENT_MODEL_IMAGE = dataUrl;
      MODEL_STATE.modelImage = dataUrl;  // sync ไป MODEL_STATE
      $('#modelImagePreview').src = dataUrl;
      $('#modelImagePreview').style.display = 'block';
      $('#modelImageArea').classList.add('has-image');
      $('#modelImageArea').querySelector('.image-upload-empty').style.display = 'none';
      $('#btnRemoveModel').style.display = 'flex';
    }
    showToast(`✅ อัปโหลดรูป${type === 'product' ? 'แผงยา' : 'นายแบบ'}แล้ว`, 'success', 1500);
  };
  reader.readAsDataURL(file);

  // เคลียร์ input ให้เลือกรูปเดิมซ้ำได้
  event.target.value = '';
}

function removeImage(type) {
  if (type === 'product') {
    CURRENT_PRODUCT_IMAGE = null;
    MODEL_STATE.productImage = null;
    $('#productImagePreview').src = '';
    $('#productImagePreview').style.display = 'none';
    $('#productImageArea').classList.remove('has-image');
    $('#productImageArea').querySelector('.image-upload-empty').style.display = 'flex';
    $('#btnRemoveProduct').style.display = 'none';
  } else {
    CURRENT_MODEL_IMAGE = null;
    MODEL_STATE.modelImage = null;
    $('#modelImagePreview').src = '';
    $('#modelImagePreview').style.display = 'none';
    $('#modelImageArea').classList.remove('has-image');
    $('#modelImageArea').querySelector('.image-upload-empty').style.display = 'flex';
    $('#btnRemoveModel').style.display = 'none';
  }
}

// =====================================================
// TEMPLATE SYSTEM — ตัวเลือก + Render variables + Preview
// =====================================================

let CURRENT_TEMPLATE_ID = null;     // template ที่เลือกอยู่
let CURRENT_VARIABLES = {};          // ค่าตัวแปรที่กรอก/AI สร้าง
let CURRENT_PRODUCT_IMAGE = null;    // รูปแผงยา (data URL)
let CURRENT_MODEL_IMAGE = null;      // รูปนายแบบ/นางแบบ (data URL)

// แสดง template grid (6 cards)
function renderTemplateGrid() {
  const grid = $('#templateGrid');
  if (!grid) return;  // 🛡️ guard: หน้าใหม่ไม่มี #templateGrid
  if (!window.RHTemplates) {
    grid.innerHTML = '<p class="hint">ระบบ template กำลังโหลด...</p>';
    return;
  }

  const templates = Object.values(window.RHTemplates.TEMPLATES);
  grid.innerHTML = templates.map(t => `
    <button class="template-card" data-template-id="${t.id}">
      <span class="template-card-icon">${t.icon}</span>
      <span class="template-card-name">${escapeHtml(t.name)}</span>
      <span class="template-card-desc">${escapeHtml(t.description)}</span>
    </button>
  `).join('');

  // bind clicks
  grid.querySelectorAll('.template-card').forEach(btn => {
    btn.addEventListener('click', () => selectTemplate(btn.dataset.templateId));
  });
}

// เมื่อผู้ใช้คลิกเลือก template
function selectTemplate(templateId) {
  CURRENT_TEMPLATE_ID = templateId;
  CURRENT_VARIABLES = {};

  // highlight card
  $$('.template-card').forEach(c => c.classList.toggle('active', c.dataset.templateId === templateId));

  // โผล่ section variables + image + preview
  $('#variablesSection').style.display = 'block';
  $('#imageSection').style.display = 'block';
  $('#previewSection').style.display = 'block';

  // render variable inputs
  renderVariableInputs(templateId);
  updatePreview();
}

// สร้างช่องกรอกตัวแปรของเทมเพลตที่เลือก
function renderVariableInputs(templateId) {
  const tmpl = window.RHTemplates.TEMPLATES[templateId];
  if (!tmpl) return;

  const container = $('#variablesContainer');

  // Custom template — ใช้ textarea ใหญ่ช่องเดียว
  if (templateId === 'custom') {
    const v = tmpl.variables[0]; // มีแค่ตัวเดียว
    container.innerHTML = `
      <div class="variable-row">
        <div class="variable-label">
          <span class="variable-label-text">${escapeHtml(v.label)}</span>
          <span class="variable-key">{{${v.key}}}</span>
        </div>
        <textarea
          class="variable-input variable-textarea"
          data-var-key="${v.key}"
          rows="6"
          placeholder="${escapeHtml(v.hint)}"
        ></textarea>
        <p class="variable-hint">${escapeHtml(v.hint)}</p>
      </div>
    `;
  } else {
    // เทมเพลตปกติ — ใช้ input บรรทัดเดียว
    container.innerHTML = tmpl.variables.map(v => `
      <div class="variable-row">
        <div class="variable-label">
          <span class="variable-label-text">${escapeHtml(v.label)}</span>
          <span class="variable-key">{{${v.key}}}</span>
        </div>
        <input type="text" class="variable-input" data-var-key="${v.key}" placeholder="${escapeHtml(v.hint)}" />
        <p class="variable-hint">${escapeHtml(v.hint)}</p>
      </div>
    `).join('');
  }

  // bind input → update preview
  container.querySelectorAll('.variable-input').forEach(input => {
    input.addEventListener('input', () => {
      CURRENT_VARIABLES[input.dataset.varKey] = input.value;
      updatePreview();
    });
  });
}

// อัปเดต preview แบบ real-time
function updatePreview() {
  const previewBox = $('#previewBox');
  if (!previewBox) return;

  if (!CURRENT_TEMPLATE_ID) {
    previewBox.innerHTML = '<div class="preview-empty">เลือก template และกรอกข้อมูล → ผลลัพธ์จะขึ้นที่นี่</div>';
    return;
  }

  const tmpl = window.RHTemplates.TEMPLATES[CURRENT_TEMPLATE_ID];
  const lang = STATE.currentLanguage || 'th';
  let content = tmpl.content[lang] || tmpl.content.th;

  // เติมค่าที่กรอก ลงใน {{xxx}}
  for (const [key, value] of Object.entries(CURRENT_VARIABLES)) {
    const placeholder = `{{${key}}}`;
    const escaped = escapeHtml(value || '');
    content = content.split(placeholder).join(escaped);
  }

  // หาตัวแปรที่ยังไม่กรอก → highlight
  content = content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return `<span class="placeholder-empty">${escapeHtml('{{' + key + '}}')}</span>`;
  });

  // เติม hashtag จาก settings ถ้ายังว่าง
  if (content.includes('{{hashtag}}') && STATE.settings?.hashtag) {
    content = content.split('{{hashtag}}').join(escapeHtml(STATE.settings.hashtag));
  }

  previewBox.innerHTML = content;
}

// =====================================================
// 🪄 AI AUTO-FILL ตัวแปรในเทมเพลต
// =====================================================
async function autoFillVariables() {
  if (!CURRENT_TEMPLATE_ID) {
    showToast('⚠️ เลือก template ก่อน', 'warning');
    return;
  }

  const title = $('#topicTitle').value.trim();
  if (!title || title.length < 3) {
    showToast('⚠️ กรุณาใส่ชื่อเรื่องก่อน (อย่างน้อย 3 ตัวอักษร)', 'warning');
    $('#topicTitle').focus();
    return;
  }

  // เช็ค API key
  const provider = STATE.settings.aiProvider || 'openai';
  const keyMap = {
    openai: STATE.settings.openaiApiKey,
    gemini: STATE.settings.geminiApiKey,
    claude: STATE.settings.claudeApiKey
  };
  const providerNames = { openai: 'OpenAI', gemini: 'Gemini', claude: 'Claude' };
  if (!keyMap[provider]) {
    showToast(`⚠️ ยังไม่ได้ตั้ง ${providerNames[provider]} API Key — ไปที่ ⚙️ ตั้งค่า`, 'warning', 4000);
    return;
  }

  const btn = $('#btnAutoFillVariables');
  const hint = $('#autoFillHint');
  btn.disabled = true;
  btn.classList.add('loading');
  $('.ai-text', btn).textContent = 'กำลังคิด...';
  hint.style.display = 'none';

  try {
    const result = await window.RHTemplates.generateContent(
      CURRENT_TEMPLATE_ID,
      { title: title, details: '' },
      STATE.currentAudience,
      STATE.currentLanguage
    );

    // อัปเดต CURRENT_VARIABLES และ inputs
    CURRENT_VARIABLES = result.variables;
    $$('.variable-input').forEach(input => {
      const key = input.dataset.varKey;
      if (result.variables[key] !== undefined) {
        input.value = result.variables[key];
        input.classList.add('ai-filled');
      }
    });

    updatePreview();

    // แสดง hint
    const langLabel = STATE.currentLanguage === 'ms' ? '🇲🇾 มลายู'
                    : STATE.currentLanguage === 'en' ? '🇬🇧 อังกฤษ'
                    : '🇹🇭 ไทย';
    hint.style.display = 'block';
    hint.innerHTML = `✨ AI เติมข้อมูลให้แล้ว — <strong>${providerNames[result.provider]}</strong> (${result.model}) · ภาษา ${langLabel} · พี่แก้/ปรับเพิ่มได้`;

    showToast('✅ AI เติมข้อมูลให้แล้ว!', 'success');

  } catch (err) {
    console.error('[AI Variables] error:', err);
    showToast(`❌ ${err.message}`, 'error', 4500);
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    $('.ai-text', btn).textContent = 'AI ช่วยเขียน';
  }
}

async function addTopic() {
  const title = $('#topicTitle').value.trim();
  const category = $('#topicCategory').value;

  if (!title) {
    showToast('⚠️ กรุณาใส่ชื่อเรื่อง', 'warning');
    $('#topicTitle').focus();
    return;
  }

  if (!CURRENT_TEMPLATE_ID) {
    showToast('⚠️ กรุณาเลือก Template', 'warning');
    return;
  }

  const tmpl = window.RHTemplates.TEMPLATES[CURRENT_TEMPLATE_ID];

  // เช็คว่ามีตัวแปรว่างไหม
  const emptyVars = tmpl.variables.filter(v => !CURRENT_VARIABLES[v.key]);
  if (emptyVars.length > 0) {
    const list = emptyVars.map(v => v.label).join(', ');
    if (!confirm(`ยังไม่ได้กรอก: ${list}\n\nบันทึกต่อหรือไม่? (สามารถแก้ทีหลังได้)`)) {
      return;
    }
  }

  // เติม hashtag จาก settings ถ้ายังไม่มี
  const variables = { ...CURRENT_VARIABLES };
  if (!variables.hashtag && STATE.settings?.hashtag) {
    variables.hashtag = STATE.settings.hashtag;
  }

  // Render content สำเร็จรูป
  let content = tmpl.content[STATE.currentLanguage] || tmpl.content.th;
  for (const [key, value] of Object.entries(variables)) {
    content = content.split(`{{${key}}}`).join(value || '');
  }
  content = content.replace(/\{\{[^}]+\}\}/g, ''); // เคลียร์ที่เหลือ

  const topic = {
    id: generateId(),
    title,
    category,
    audience: STATE.currentAudience,
    language: STATE.currentLanguage,
    templateId: CURRENT_TEMPLATE_ID,
    templateName: tmpl.name,
    variables: variables,
    content: content.trim(),     // เนื้อหาพร้อมโพสต์
    productImage: CURRENT_PRODUCT_IMAGE,    // รูปแผงยา (data URL)
    modelImage: CURRENT_MODEL_IMAGE,        // รูปนายแบบ (data URL)
    status: 'ready',
    createdAt: new Date().toISOString()
  };

  STATE.topics.unshift(topic);
  await saveTopics();
  renderTopicList();

  // เคลียร์ฟอร์ม
  resetForm();

  showToast('✅ เพิ่มหัวข้อแล้ว — พร้อมโพสต์', 'success');
}

// เคลียร์ฟอร์มหลังบันทึกเสร็จ
function resetForm() {
  $('#topicTitle').value = '';
  CURRENT_TEMPLATE_ID = null;
  CURRENT_VARIABLES = {};
  $$('.template-card').forEach(c => c.classList.remove('active'));
  $('#variablesSection').style.display = 'none';
  $('#imageSection').style.display = 'none';
  $('#previewSection').style.display = 'none';
  $('#autoFillHint').style.display = 'none';

  // เคลียร์รูป
  removeImage('product');
  removeImage('model');
}

function renderTopicList() {
  const list = $('#topicList');
  const count = $('#topicCount');
  const actions = $('#topicActions');

  // 🛡️ Guard: หน้า "สร้างแบบ" v0.8 ไม่มี element เหล่านี้แล้ว — exit gracefully
  if (!list || !count) {
    return;
  }

  count.textContent = STATE.topics.length;

  if (STATE.topics.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>ยังไม่มีหัวข้อ</p>
        <p class="hint">เพิ่มหัวข้อเพื่อเริ่มสร้างสื่อ</p>
      </div>
    `;
    if (actions) actions.style.display = 'none';
    return;
  }

  if (actions) actions.style.display = 'flex';

  const langFlag = { th: '🇹🇭', ms: '🇲🇾', en: '🇬🇧' };

  list.innerHTML = STATE.topics.map(t => `
    <div class="topic-item">
      <div class="topic-info">
        <strong>${escapeHtml(t.title)}</strong>
        <div class="topic-meta">
          ${t.templateName ? `<span class="topic-tag">${escapeHtml(t.templateName)}</span>` : ''}
          <span class="topic-tag">${AUDIENCE_LABELS[t.audience] || t.audience}</span>
          <span>${langFlag[t.language] || ''} ${formatDate(t.createdAt)}</span>
        </div>
      </div>
      <button class="btn-delete" onclick="deleteTopic('${t.id}')" title="ลบ">✕</button>
    </div>
  `).join('');
}

window.deleteTopic = async function(id) {
  STATE.topics = STATE.topics.filter(t => t.id !== id);
  await saveTopics();
  renderTopicList();
  refreshTopicSelect();
  showToast('🗑️ ลบหัวข้อแล้ว', 'info');
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
}

async function exportTopics() {
  const data = JSON.stringify(STATE.topics, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rh-pharma-topics-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 Export แล้ว', 'success');
}

async function importTopics() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      STATE.topics = [...imported, ...STATE.topics];
      await saveTopics();
      renderTopicList();
      showToast(`📥 นำเข้า ${imported.length} รายการแล้ว`, 'success');
    } catch (err) {
      showToast('❌ ไฟล์ไม่ถูกต้อง', 'error');
    }
  };
  input.click();
}

async function clearTopics() {
  if (!confirm('ลบหัวข้อทั้งหมด?')) return;
  STATE.topics = [];
  await saveTopics();
  renderTopicList();
  showToast('🗑️ ล้างทั้งหมดแล้ว', 'info');
}

function refreshTopicSelect() {
  const select = $('#createTopicSelect');
  if (!select) return;

  if (STATE.topics.length === 0) {
    select.innerHTML = '<option value="">-- ยังไม่มีหัวข้อ --</option>';
    return;
  }

  select.innerHTML = '<option value="">-- เลือกหัวข้อ --</option>' +
    STATE.topics.map(t =>
      `<option value="${t.id}">${escapeHtml(t.title)} (${AUDIENCE_LABELS[t.audience] || ''})</option>`
    ).join('');
}

// =====================================================
// INFOGRAPHIC TAB (v0.8.6) — Tab 2 "สร้างสื่อ"
// =====================================================
const INFO_STATE = {
  topic: '',           // เนื้อหา (ผู้ใช้กรอก หรือ AI ขยาย)
  audience: 'working_adult',   // 🆕 v0.9.22 — default = วัยทำงาน
  style: 'flat',
  theme: 'modern_hospital',
  ratio: '16:9',
  count: 1,
  // 🆕 v0.9.23: Custom audience + style
  customAudienceDesc: '',
  customStyleDesc: '',
  customThemeDesc: '',  // 🆕 v0.9.24
  editedPrompt: null
};

function setupCreateTab() {
  if (!window.RHModelOptions) {
    console.error('[RH Pharma] RHModelOptions ยังไม่โหลด — skip Infographic setup');
    return;
  }
  const RMO = window.RHModelOptions;
  const D = RMO.INFOGRAPHIC_DEFAULTS;

  // sync defaults
  Object.assign(INFO_STATE, {
    audience: D.audience,
    style: D.style,
    theme: D.theme,
    ratio: D.ratio,
    count: D.count
  });

  // ----- topic textarea -----
  const inpTopic = $('#infoTopicInput');
  if (inpTopic) inpTopic.addEventListener('input', () => {
    INFO_STATE.topic = inpTopic.value;
    INFO_STATE.editedPrompt = null;
  });

  // ----- ปุ่ม AI ช่วยขยาย -----
  const btnExpand = $('#btnExpandInfoTopic');
  if (btnExpand) btnExpand.addEventListener('click', expandInfoTopicWithAI);

  // ----- 🆕 v0.9.22: Audience grouped (5 groups) + v0.9.23: custom -----
  const audSel = $('#selInfoAudience');
  if (audSel && RMO.AUDIENCES) {
    const groups = {};
    RMO.AUDIENCES.forEach(a => {
      const g = a.group || 'ungrouped';
      if (!groups[g]) groups[g] = [];
      groups[g].push(a);
    });
    const groupLabels = {
      'age': '👶 ตามช่วงวัย',
      'special': '🤰 สถานะพิเศษ',
      'patient': '🏥 ผู้ป่วยเฉพาะ',
      'occupation': '💼 อาชีพ',
      'culture': '🕌 วัฒนธรรม/ชุมชน',
      'staff': '🩺 บุคลากรทางการแพทย์',
      'custom': '🎨 Custom'
    };
    let html = '';
    Object.entries(groups).forEach(([g, opts]) => {
      const label = groupLabels[g] || g;
      html += `<optgroup label="${label}">`;
      html += opts.map(o => {
        const sel = o.id === D.audience ? 'selected' : '';
        return `<option value="${o.id}" ${sel}>${o.icon} ${o.label}</option>`;
      }).join('');
      html += `</optgroup>`;
    });
    audSel.innerHTML = html;
    audSel.value = INFO_STATE.audience || D.audience;
    audSel.addEventListener('change', (e) => {
      INFO_STATE.audience = e.target.value;
      INFO_STATE.editedPrompt = null;
      // 🆕 v0.9.23: Show/hide custom audience panel
      const customGroup = $('#customInfoAudienceGroup');
      if (customGroup) customGroup.style.display = (e.target.value === 'custom_audience') ? 'block' : 'none';
    });
  }

  // 🆕 v0.9.23: Custom audience desc binding
  const customAudTextarea = $('#customInfoAudienceDesc');
  if (customAudTextarea) {
    customAudTextarea.addEventListener('input', () => {
      INFO_STATE.customAudienceDesc = customAudTextarea.value;
      INFO_STATE.editedPrompt = null;
    });
  }

  // 🆕 v0.9.23: AI Gen audience description
  const btnAIGenAud = $('#btnAIGenInfoAudience');
  if (btnAIGenAud) {
    btnAIGenAud.addEventListener('click', () => aiGenInfoAudience());
  }

  // ----- 🆕 v0.9.23: Style grouped (5 groups) + custom -----
  const styleSel = $('#selInfoStyle');
  if (styleSel && RMO.INFOGRAPHIC_STYLES) {
    const styleGroups = {};
    RMO.INFOGRAPHIC_STYLES.forEach(s => {
      const g = s.group || 'illustration';
      if (!styleGroups[g]) styleGroups[g] = [];
      styleGroups[g].push(s);
    });
    const styleGroupLabels = {
      'illustration': '🎨 Illustration / การ์ตูน',
      'modern': '📐 Modern / Tech',
      'realistic': '📷 Realistic / Photo',
      'artistic': '🖼️ Artistic / สไตล์ศิลปะ',
      'custom': '🎨 Custom'
    };
    let styleHtml = '';
    Object.entries(styleGroups).forEach(([g, opts]) => {
      const label = styleGroupLabels[g] || g;
      styleHtml += `<optgroup label="${label}">`;
      styleHtml += opts.map(o => {
        const sel = o.id === D.style ? 'selected' : '';
        return `<option value="${o.id}" ${sel}>${o.icon} ${o.label}</option>`;
      }).join('');
      styleHtml += `</optgroup>`;
    });
    styleSel.innerHTML = styleHtml;
    styleSel.value = INFO_STATE.style || D.style;
    styleSel.addEventListener('change', (e) => {
      INFO_STATE.style = e.target.value;
      INFO_STATE.editedPrompt = null;
      // Show/hide custom style panel
      const customGroup = $('#customInfoStyleGroup');
      if (customGroup) customGroup.style.display = (e.target.value === 'custom_style') ? 'block' : 'none';
    });
  }

  // 🆕 v0.9.23: Custom style desc binding
  const customStyleTextarea = $('#customInfoStyleDesc');
  if (customStyleTextarea) {
    customStyleTextarea.addEventListener('input', () => {
      INFO_STATE.customStyleDesc = customStyleTextarea.value;
      INFO_STATE.editedPrompt = null;
    });
  }

  // ----- 🆕 v0.9.22: dropdown ธีม grouped (7 groups) + v0.9.24: custom -----
  const themeSel = $('#selInfoTheme');
  if (themeSel && RMO.INFOGRAPHIC_THEMES) {
    const themeGroups = {};
    RMO.INFOGRAPHIC_THEMES.forEach(t => {
      const g = t.group || 'general';
      if (!themeGroups[g]) themeGroups[g] = [];
      themeGroups[g].push(t);
    });
    const themeGroupLabels = {
      'general': '🌈 ทั่วไป/พื้นฐาน',
      'art': '🎨 ศิลปะ/Illustration',
      'media': '📰 สื่อสิ่งพิมพ์',
      'medical': '🩺 การแพทย์',
      'lifestyle': '🌿 ไลฟ์สไตล์',
      'culture': '🇹🇭 วัฒนธรรม',
      'audience_specific': '👶 เฉพาะกลุ่มเป้าหมาย',
      'custom': '🎨 Custom'
    };
    let themeHtml = '';
    Object.entries(themeGroups).forEach(([g, opts]) => {
      const label = themeGroupLabels[g] || g;
      themeHtml += `<optgroup label="${label}">`;
      themeHtml += opts.map(o => {
        const sel = o.id === D.theme ? 'selected' : '';
        return `<option value="${o.id}" ${sel}>${o.icon} ${o.label}</option>`;
      }).join('');
      themeHtml += `</optgroup>`;
    });
    themeSel.innerHTML = themeHtml;
    themeSel.value = INFO_STATE.theme || D.theme;
    themeSel.addEventListener('change', (e) => {
      INFO_STATE.theme = e.target.value;
      INFO_STATE.editedPrompt = null;
      // 🆕 v0.9.24: Show/hide custom theme panel
      const customGroup = $('#customInfoThemeGroup');
      if (customGroup) customGroup.style.display = (e.target.value === 'custom_theme') ? 'block' : 'none';
    });
  }

  // 🆕 v0.9.24: Custom theme desc binding
  const customThemeTextarea = $('#customInfoThemeDesc');
  if (customThemeTextarea) {
    customThemeTextarea.addEventListener('input', () => {
      INFO_STATE.customThemeDesc = customThemeTextarea.value;
      INFO_STATE.editedPrompt = null;
    });
  }

  // ----- ratio buttons -----
  const ratioContainer = $('#infoRatioOptions');
  if (ratioContainer) {
    ratioContainer.innerHTML = RMO.INFOGRAPHIC_RATIOS.map(r => `
      <button class="ratio-btn ${r.id === D.ratio ? 'active' : ''}" data-ratio="${r.id}">
        <span class="ratio-icon">${r.icon}</span>
        <span class="ratio-name">${r.label}</span>
        <span class="ratio-desc">${r.desc}</span>
      </button>
    `).join('');
    ratioContainer.querySelectorAll('.ratio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        INFO_STATE.ratio = btn.dataset.ratio;
        INFO_STATE.editedPrompt = null;
        ratioContainer.querySelectorAll('.ratio-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
  }

  // ----- count buttons -----
  const countContainer = $('#infoCountOptions');
  if (countContainer) {
    countContainer.innerHTML = RMO.COUNTS.map(c => `
      <button class="count-btn ${c === D.count ? 'active' : ''}" data-count="${c}">x${c}</button>
    `).join('');
    countContainer.querySelectorAll('.count-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        INFO_STATE.count = parseInt(btn.dataset.count);
        countContainer.querySelectorAll('.count-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
  }

  // ----- ปุ่ม preview prompt -----
  $('#btnPreviewInfoPrompt')?.addEventListener('click', openInfoPromptModal);
  $('#btnCloseInfoPrompt')?.addEventListener('click', closeInfoPromptModal);
  $('#btnResetInfoPrompt')?.addEventListener('click', () => {
    INFO_STATE.editedPrompt = null;
    const ta = $('#infoPromptText');
    if (ta) ta.value = window.RHModelOptions.buildInfographicPrompt(INFO_STATE);
    showToast('🔄 สร้าง prompt ใหม่จากตัวเลือกแล้ว', 'info', 1500);
  });
  $('#btnSendInfoFromModal')?.addEventListener('click', () => {
    const ta = $('#infoPromptText');
    if (ta) INFO_STATE.editedPrompt = ta.value;
    closeInfoPromptModal();
    createInfographic();
  });

  // ----- ปุ่มสร้าง -----
  $('#btnCreateInfo')?.addEventListener('click', createInfographic);
}

function fillInfoSelect(selectId, options, selectedId) {
  const sel = $(selectId);
  if (!sel) return;
  sel.innerHTML = options.map(opt =>
    `<option value="${opt.id}">${opt.icon} ${opt.label}</option>`
  ).join('');
  sel.value = selectedId;
}

// =====================================================
// AI ขยายเนื้อหา infographic
// =====================================================
async function expandInfoTopicWithAI() {
  const inp = $('#infoTopicInput');
  const btn = $('#btnExpandInfoTopic');
  const loading = $('#infoTopicLoading');

  if (!inp) return;

  const userTopic = (inp.value || '').trim();
  if (!userTopic || userTopic.length < 3) {
    showToast('⚠️ กรุณาพิมพ์หัวข้อสั้นๆ ก่อน (อย่างน้อย 3 ตัวอักษร)', 'warning', 3000);
    inp.focus();
    return;
  }

  if (!window.RHAI) {
    showToast('❌ ระบบ AI ยังไม่โหลด', 'error');
    return;
  }

  // เช็ค API key
  try {
    const settings = await window.RHAI.getSettings();
    const provider = settings.aiProvider || 'openai';
    const keyMap = {
      openai: settings.openaiApiKey,
      claude: settings.claudeApiKey,
      gemini: settings.geminiApiKey
    };
    if (!keyMap[provider]) {
      const providerNames = { openai: 'OpenAI', claude: 'Claude', gemini: 'Gemini' };
      showToast(`⚠️ ยังไม่ได้ตั้ง ${providerNames[provider]} API Key — ไปที่ ⚙️ ตั้งค่า`, 'warning', 4500);
      return;
    }
  } catch (e) {
    console.error('[RH Pharma] เช็ค API key error:', e);
  }

  const systemPrompt = `You are a Thai pharmacy educator at Rueso Hospital, a community hospital in Narathiwat, southern Thailand. The audience is mostly Thai-Malay Muslim patients.

YOUR TASK:
Expand the user's brief health/medicine topic into clear, accurate Thai content suitable for a social media infographic.

USER'S TOPIC:
"${userTopic}"

REQUIREMENTS:
- Output language: THAI ONLY (no English, no transliteration)
- Format: 1 title line + 3-5 numbered bullet points
- Each bullet: short headline + brief explanation (1-2 sentences)
- Medically accurate, no exaggeration, evidence-based
- Easy for general public to understand
- Suitable for elderly/Muslim community in southern Thailand
- Tone: friendly, respectful, educational

OUTPUT FORMAT (CRITICAL — return EXACTLY this format, no JSON, no markdown):
หัวข้อ: <ชื่อหัวข้อภาษาไทย>

1. <หัวข้อย่อย 1>
   - <คำอธิบายสั้น>

2. <หัวข้อย่อย 2>
   - <คำอธิบายสั้น>

3. <หัวข้อย่อย 3>
   - <คำอธิบายสั้น>

(เพิ่ม 4-5 ได้ตามความเหมาะสม)`;

  if (btn) btn.disabled = true;
  if (loading) loading.style.display = 'flex';

  try {
    const result = await window.RHAI.callAI(systemPrompt, {
      maxTokens: 800,
      temperature: 0.7
    });
    const rawText = (result && typeof result === 'object') ? result.text : String(result || '');
    console.log('[RH Pharma] AI expand response:', rawText);

    if (!rawText || rawText.trim().length < 10) {
      throw new Error('AI ตอบกลับว่างเปล่า — ลองใหม่');
    }

    // แทนที่ textarea เดิม
    inp.value = rawText.trim();
    INFO_STATE.topic = rawText.trim();
    INFO_STATE.editedPrompt = null;

    showToast('✅ AI ขยายเนื้อหาเรียบร้อย — ตรวจสอบและแก้ได้ก่อนสร้าง', 'success', 2500);

  } catch (err) {
    console.error('[expandInfoTopicWithAI] error:', err);
    showToast(`❌ ${err.message || 'AI ขยายเนื้อหาผิดพลาด'}`, 'error', 3500);
  } finally {
    if (btn) btn.disabled = false;
    if (loading) loading.style.display = 'none';
  }
}

// =====================================================
// Modal — ดู/แก้ Prompt Infographic
// =====================================================
function openInfoPromptModal() {
  const modal = $('#infoPromptModal');
  const ta = $('#infoPromptText');
  if (!modal || !ta || !window.RHModelOptions) return;
  ta.value = INFO_STATE.editedPrompt || window.RHModelOptions.buildInfographicPrompt(INFO_STATE);
  modal.style.display = 'flex';
}

function closeInfoPromptModal() {
  const modal = $('#infoPromptModal');
  if (modal) modal.style.display = 'none';
}

// =====================================================
// สร้าง Infographic — ส่งไป Flow
// =====================================================
async function createInfographic() {
  const btn = $('#btnCreateInfo');
  const hint = $('#createInfoHint');

  if (!window.RHModelOptions) {
    showToast('❌ ระบบ RHModelOptions ยังไม่โหลด', 'error');
    return;
  }

  if (btn) btn.disabled = true;
  if (btn) btn.textContent = '⏳ กำลังเตรียม...';
  if (hint) hint.textContent = '';

  try {
    const prompt = INFO_STATE.editedPrompt || window.RHModelOptions.buildInfographicPrompt(INFO_STATE);

    // ส่งไป Flow โดยไม่มีรูป (Infographic ไม่ต้องอ้างอิงรูปต้นแบบ)
    await chrome.storage.local.set({
      rhPharmaFlowPending: {
        prompt,
        images: [],                  // ⬅️ ไม่มีรูป
        mode: 'image',
        model: 'nano-banana-pro',
        ratio: INFO_STATE.ratio,
        count: INFO_STATE.count,
        autoGenerate: false,
        timestamp: Date.now()
      }
    });

    showToast('🚀 เปิด Flow แล้ว — กรุณากด "+ New project"', 'info', 5000);

    const flowTabs = await chrome.tabs.query({ url: ['https://labs.google/fx/tools/flow*'] });
    if (flowTabs.length > 0) {
      const tab = flowTabs[0];
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'flowProcessPending' });
      } catch (e) {
        console.log('[RH Pharma] Flow content script ยังไม่พร้อม → reload tab');
        await chrome.tabs.reload(tab.id);
      }
    } else {
      await chrome.tabs.create({ url: 'https://labs.google/fx/tools/flow', active: true });
    }

    if (hint) {
      hint.textContent = `✅ ส่งไป Flow แล้ว — เปิดแท็บ Flow และกด Copy Prompt → Ctrl+V`;
      hint.style.color = 'var(--text-secondary)';
    }
    INFO_STATE.editedPrompt = null;

  } catch (err) {
    console.error('[createInfographic] error:', err);
    if (hint) {
      hint.textContent = `❌ ${err.message}`;
      hint.style.color = 'var(--brand-red, #EF4444)';
    }
    showToast(`❌ ${err.message}`, 'error', 3000);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '✨ สร้าง Infographic → ส่งไป Flow';
    }
  }
}

// =====================================================
// 🎬 VIDEO TAB (v0.9.1) — Tab 3 "วิดีโอ"
// =====================================================
const VIDEO_STATE = {
  topic: '',
  keywords: '',
  audience: 'elderly_male_muslim',
  dialect: 'th_central',
  gender: 'male',
  listenerGender: '',
  visualDNAPreset: 'meen_default',
  visualDNA: '',
  style: 'caring_advisor',
  bgMode: 'same',          // 🆕 v0.9.13: 'same' | 'perScene'
  background: 'pharmacy',  // 🆕 v0.9.13: scene-level default
  ratio: '9:16',
  count: 1,
  duration: 8,
  soloMode: false,         // 🆕 v0.9.25: 4 dialogues continuous (no listener)
  scenes: []           // [{speaker, dialogue, emotion, delivery, pharmacistPose?, listenerPose?, background?}]
};

function setupVideoTab() {
  if (!window.RHModelOptions) {
    console.warn('[RH Pharma] RHModelOptions not loaded — skip Video tab');
    return;
  }
  const RMO = window.RHModelOptions;
  const D = RMO.VIDEO_DEFAULTS;

  // sync defaults
  Object.assign(VIDEO_STATE, {
    audience: D.audience,
    dialect: D.dialect,
    gender: D.gender,
    style: D.style,
    ratio: D.ratio,
    count: D.count,
    duration: D.duration
  });

  // 🆕 load saved gender จาก chrome.storage (จำค่าล่าสุด)
  chrome.storage.local.get(['rhVideoGender'], (data) => {
    if (data.rhVideoGender && (data.rhVideoGender === 'male' || data.rhVideoGender === 'female')) {
      VIDEO_STATE.gender = data.rhVideoGender;
      // sync UI ถ้า render เสร็จแล้ว
      const genderContainer = $('#videoGenderOptions');
      if (genderContainer) {
        genderContainer.querySelectorAll('.gender-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.gender === VIDEO_STATE.gender));
      }
    }
  });

  // ----- topic textarea -----
  const inpTopic = $('#videoTopicInput');
  if (inpTopic) inpTopic.addEventListener('input', () => {
    VIDEO_STATE.topic = inpTopic.value;
  });

  // ----- keywords -----
  const inpKw = $('#videoKeywordsInput');
  if (inpKw) inpKw.addEventListener('input', () => {
    VIDEO_STATE.keywords = inpKw.value;
  });

  // ----- audience dropdown -----
  const audSel = $('#selVideoAudience');
  if (audSel) {
    audSel.innerHTML = RMO.AUDIENCES.map(opt =>
      `<option value="${opt.id}">${opt.icon} ${opt.label}</option>`
    ).join('');
    audSel.value = D.audience;
    audSel.addEventListener('change', () => { VIDEO_STATE.audience = audSel.value; });
  }

  // ----- dialect radio buttons -----
  const dialectContainer = $('#videoDialectOptions');
  if (dialectContainer) {
    dialectContainer.innerHTML = RMO.VIDEO_DIALECTS.map(d => `
      <button class="dialect-btn ${d.id === D.dialect ? 'active' : ''}" data-dialect="${d.id}">
        <span class="dialect-icon">${d.icon}</span>
        <span>${d.label}</span>
      </button>
    `).join('');
    dialectContainer.querySelectorAll('.dialect-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        VIDEO_STATE.dialect = btn.dataset.dialect;
        dialectContainer.querySelectorAll('.dialect-btn').forEach(b =>
          b.classList.toggle('active', b === btn));
      });
    });
  }

  // ----- 🆕 gender buttons (v0.9.3) -----
  const genderContainer = $('#videoGenderOptions');
  if (genderContainer) {
    genderContainer.innerHTML = RMO.VIDEO_GENDERS.map(g => `
      <button class="gender-btn ${g.id === VIDEO_STATE.gender ? 'active' : ''}" data-gender="${g.id}">
        <span class="gender-icon">${g.icon}</span>
        <span>${g.label}</span>
        <span class="gender-pronouns">(${g.pronouns})</span>
      </button>
    `).join('');
    genderContainer.querySelectorAll('.gender-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        VIDEO_STATE.gender = btn.dataset.gender;
        genderContainer.querySelectorAll('.gender-btn').forEach(b =>
          b.classList.toggle('active', b === btn));
        chrome.storage.local.set({ rhVideoGender: VIDEO_STATE.gender });
        if (VIDEO_STATE.scenes && VIDEO_STATE.scenes.length > 0) {
          validateScenePronouns();
        }
      });
    });
  }

  // ----- 🆕 v0.9.25: Solo Mode toggle (Tab วิดีโอ) -----
  const cbVideoSolo = $('#optVideoSoloMode');
  if (cbVideoSolo) {
    // Restore state
    chrome.storage.local.get(['rhVideoSoloMode'], (data) => {
      if (data.rhVideoSoloMode) {
        VIDEO_STATE.soloMode = true;
        cbVideoSolo.checked = true;
        applyVideoSoloUI(true);
      }
    });
    cbVideoSolo.addEventListener('change', () => {
      VIDEO_STATE.soloMode = cbVideoSolo.checked;
      chrome.storage.local.set({ rhVideoSoloMode: VIDEO_STATE.soloMode });
      applyVideoSoloUI(cbVideoSolo.checked);
    });
  }

  // Helper: ซ่อน/แสดง UI ตาม Solo mode
  function applyVideoSoloUI(isSolo) {
    const audGrp = $('#videoAudienceFormGroup');
    const lstSec = $('#videoListenerSection');
    if (audGrp) audGrp.style.display = isSolo ? 'none' : 'block';
    if (lstSec) lstSec.style.display = isSolo ? 'none' : 'block';
  }

  // ----- 🆕 v0.9.4: listener gender buttons (บังคับเลือก) -----
  const listenerGenderContainer = $('#videoListenerGenderOptions');
  if (listenerGenderContainer) {
    listenerGenderContainer.innerHTML = RMO.VIDEO_GENDERS.map(g => `
      <button class="gender-btn" data-gender="${g.id}">
        <span class="gender-icon">${g.icon}</span>
        <span>${g.label}</span>
        <span class="gender-pronouns">(${g.pronouns})</span>
      </button>
    `).join('');
    listenerGenderContainer.querySelectorAll('.gender-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        VIDEO_STATE.listenerGender = btn.dataset.gender;
        listenerGenderContainer.querySelectorAll('.gender-btn').forEach(b =>
          b.classList.toggle('active', b === btn));
        chrome.storage.local.set({ rhVideoListenerGender: VIDEO_STATE.listenerGender });
        if (VIDEO_STATE.scenes && VIDEO_STATE.scenes.length > 0) {
          validateScenePronouns();
        }
      });
    });
    chrome.storage.local.get(['rhVideoListenerGender'], (data) => {
      if (data.rhVideoListenerGender && (data.rhVideoListenerGender === 'male' || data.rhVideoListenerGender === 'female')) {
        VIDEO_STATE.listenerGender = data.rhVideoListenerGender;
        listenerGenderContainer.querySelectorAll('.gender-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.gender === VIDEO_STATE.listenerGender));
      }
    });
  }

  // ----- 🆕 v0.9.8: Visual DNA preset dropdown + textarea -----
  const dnaPresetSel = $('#videoVisualDNAPreset');
  const dnaTextArea  = $('#videoVisualDNAText');
  if (dnaPresetSel && RMO.VISUAL_DNA_PRESETS) {
    // build optgroup dropdown
    const presets = RMO.VISUAL_DNA_PRESETS;
    const groups = {
      pharmacist: { label: '🩺 เภสัชกร', items: [] },
      staff:      { label: '👨‍⚕️ บุคลากรอื่น', items: [] },
      patient:    { label: '👴 ผู้ป่วย / ผู้รับคำปรึกษา', items: [] },
      custom:     { label: '✏️ Custom', items: [] }
    };
    presets.forEach(p => {
      if (groups[p.group]) groups[p.group].items.push(p);
    });
    let html = '';
    Object.values(groups).forEach(g => {
      if (g.items.length === 0) return;
      html += `<optgroup label="${g.label}">`;
      g.items.forEach(p => {
        const sel = p.id === VIDEO_STATE.visualDNAPreset ? 'selected' : '';
        html += `<option value="${p.id}" ${sel}>${p.label}</option>`;
      });
      html += `</optgroup>`;
    });
    dnaPresetSel.innerHTML = html;

    // โหลด default DNA ไป textarea
    const defaultPreset = presets.find(p => p.id === VIDEO_STATE.visualDNAPreset);
    if (defaultPreset && dnaTextArea) {
      dnaTextArea.value = defaultPreset.visualDNA || '';
      VIDEO_STATE.visualDNA = defaultPreset.visualDNA || '';
    }

    // change preset → load DNA ไป textarea (overwrite)
    dnaPresetSel.addEventListener('change', () => {
      VIDEO_STATE.visualDNAPreset = dnaPresetSel.value;
      const preset = presets.find(p => p.id === dnaPresetSel.value);
      if (preset && dnaTextArea) {
        dnaTextArea.value = preset.visualDNA || '';
        VIDEO_STATE.visualDNA = preset.visualDNA || '';
      }
      // save
      chrome.storage.local.set({ rhVideoVisualDNAPreset: VIDEO_STATE.visualDNAPreset });
    });

    // edit textarea → update VIDEO_STATE
    if (dnaTextArea) {
      dnaTextArea.addEventListener('input', () => {
        VIDEO_STATE.visualDNA = dnaTextArea.value;
      });
    }

    // load saved preset
    chrome.storage.local.get(['rhVideoVisualDNAPreset'], (data) => {
      if (data.rhVideoVisualDNAPreset) {
        const savedPreset = presets.find(p => p.id === data.rhVideoVisualDNAPreset);
        if (savedPreset) {
          VIDEO_STATE.visualDNAPreset = data.rhVideoVisualDNAPreset;
          dnaPresetSel.value = data.rhVideoVisualDNAPreset;
          if (dnaTextArea) {
            dnaTextArea.value = savedPreset.visualDNA || '';
            VIDEO_STATE.visualDNA = savedPreset.visualDNA || '';
          }
        }
      }
    });
  }

  // ----- style dropdown (v0.9.8 — optgroup) -----
  const styleSel = $('#selVideoStyle');
  if (styleSel) {
    const styles = RMO.VIDEO_STYLES;
    const pharmacy = styles.filter(s => s.group === 'pharmacy');
    const general = styles.filter(s => s.group !== 'pharmacy');
    let html = '';
    if (pharmacy.length > 0) {
      html += '<optgroup label="🩺 Pharmacy Styles (เน้นบริบทเภสัชกรรม)">';
      pharmacy.forEach(opt => {
        html += `<option value="${opt.id}">${opt.icon} ${opt.label}</option>`;
      });
      html += '</optgroup>';
    }
    if (general.length > 0) {
      html += '<optgroup label="🎬 General Styles">';
      general.forEach(opt => {
        html += `<option value="${opt.id}">${opt.icon} ${opt.label}</option>`;
      });
      html += '</optgroup>';
    }
    styleSel.innerHTML = html;
    styleSel.value = D.style;
    styleSel.addEventListener('change', () => { VIDEO_STATE.style = styleSel.value; });
  }

  // ----- ratio buttons -----
  const ratioContainer = $('#videoRatioOptions');
  if (ratioContainer) {
    ratioContainer.innerHTML = RMO.RATIOS.map(r => `
      <button class="ratio-btn ${r.id === D.ratio ? 'active' : ''}" data-ratio="${r.id}">
        <span class="ratio-icon">${r.icon}</span>
        <span class="ratio-name">${r.label}</span>
        <span class="ratio-desc">${r.desc}</span>
      </button>
    `).join('');

    // 🆕 v0.9.6: warning 9:16 (เหมือน Tab สร้างแบบ)
    const videoRatioWarning = document.createElement('div');
    videoRatioWarning.className = 'ratio-warning';
    videoRatioWarning.style.display = (D.ratio === '9:16') ? 'flex' : 'none';
    videoRatioWarning.innerHTML = `
      <span style="font-size:14px;">💡</span>
      <div>
        <strong>9:16 อาจไม่คมชัดเท่า 16:9</strong><br>
        <span style="opacity:0.85;">วิดีโอแนวตั้งคุณภาพต่ำกว่าเล็กน้อย — ถ้าใช้สำหรับ Reel/Story เลือกได้</span>
      </div>
    `;
    ratioContainer.parentElement.appendChild(videoRatioWarning);

    ratioContainer.querySelectorAll('.ratio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        VIDEO_STATE.ratio = btn.dataset.ratio;
        ratioContainer.querySelectorAll('.ratio-btn').forEach(b =>
          b.classList.toggle('active', b === btn));
        videoRatioWarning.style.display = (btn.dataset.ratio === '9:16') ? 'flex' : 'none';
      });
    });
  }

  // ----- count buttons -----
  const countContainer = $('#videoCountOptions');
  if (countContainer) {
    countContainer.innerHTML = RMO.COUNTS.map(c => `
      <button class="count-btn ${c === D.count ? 'active' : ''}" data-count="${c}">x${c}</button>
    `).join('');
    countContainer.querySelectorAll('.count-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        VIDEO_STATE.count = parseInt(btn.dataset.count);
        countContainer.querySelectorAll('.count-btn').forEach(b =>
          b.classList.toggle('active', b === btn));
      });
    });
  }

  // [v0.9.12] ลบ Global Pose dropdowns — ใช้ AI gen ต่อฉากแทน

  // ----- 🆕 v0.9.13: Background mode radios -----
  const bgModeRadios = document.querySelectorAll('input[name="videoBgMode"]');
  bgModeRadios.forEach(radio => {
    if (radio.value === VIDEO_STATE.bgMode) radio.checked = true;
    radio.addEventListener('change', () => {
      if (radio.checked) {
        VIDEO_STATE.bgMode = radio.value;
        chrome.storage.local.set({ rhVideoBgMode: VIDEO_STATE.bgMode });
        // re-render scenes ถ้ามี (เพื่อแสดง/ซ่อน background dropdown)
        if (VIDEO_STATE.scenes.length > 0) {
          renderVideoScenes();
          updateAllScenePromptPreviews();
        }
      }
    });
  });
  // load saved bgMode
  chrome.storage.local.get(['rhVideoBgMode'], (data) => {
    if (data.rhVideoBgMode === 'same' || data.rhVideoBgMode === 'perScene') {
      VIDEO_STATE.bgMode = data.rhVideoBgMode;
      bgModeRadios.forEach(r => { r.checked = (r.value === data.rhVideoBgMode); });
    }
  });

  // ----- ปุ่ม AI สร้าง 4 ฉาก -----
  const btnGen = $('#btnGenerateVideoScenes');
  if (btnGen) btnGen.addEventListener('click', generateVideoScenes);

  const btnRegen = $('#btnRegenAllScenes');
  if (btnRegen) btnRegen.addEventListener('click', generateVideoScenes);
}

// =====================================================
// AI สร้าง 4 ฉาก
// =====================================================
async function generateVideoScenes() {
  const inpTopic = $('#videoTopicInput');
  if (!inpTopic) return;

  const topic = (inpTopic.value || '').trim();
  if (!topic || topic.length < 5) {
    showToast('⚠️ กรุณากรอกเนื้อหาเรื่องก่อน (อย่างน้อย 5 ตัวอักษร)', 'warning', 3000);
    inpTopic.focus();
    return;
  }

  // 🆕 v0.9.4: บังคับเลือกเพศคู่สนทนา (skip ใน Solo mode — v0.9.26)
  if (!VIDEO_STATE.soloMode && !VIDEO_STATE.listenerGender) {
    showToast('⚠️ กรุณาเลือกเพศคู่สนทนา (ผู้รับคำปรึกษา) ก่อน', 'warning', 3500);
    const listenerSection = $('#videoListenerGenderOptions');
    if (listenerSection) {
      listenerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      listenerSection.style.outline = '2px solid #EF4444';
      setTimeout(() => listenerSection.style.outline = '', 2000);
    }
    return;
  }

  if (!window.RHAI) {
    showToast('❌ ระบบ AI ยังไม่โหลด', 'error');
    return;
  }

  // เช็ค API key
  try {
    const settings = await window.RHAI.getSettings();
    const provider = settings.aiProvider || 'openai';
    const keyMap = { openai: settings.openaiApiKey, claude: settings.claudeApiKey, gemini: settings.geminiApiKey };
    if (!keyMap[provider]) {
      const providerNames = { openai: 'OpenAI', claude: 'Claude', gemini: 'Gemini' };
      showToast(`⚠️ ยังไม่ได้ตั้ง ${providerNames[provider]} API Key — ไปที่ ⚙️ ตั้งค่า`, 'warning', 4500);
      return;
    }
  } catch (e) { console.error('[RH Pharma] check API key:', e); }

  const RMO = window.RHModelOptions;
  const dialect = RMO.VIDEO_DIALECTS.find(d => d.id === VIDEO_STATE.dialect) || RMO.VIDEO_DIALECTS[0];
  const pharmGender = RMO.VIDEO_GENDERS.find(g => g.id === VIDEO_STATE.gender) || RMO.VIDEO_GENDERS[0];
  const listenGender = RMO.VIDEO_GENDERS.find(g => g.id === VIDEO_STATE.listenerGender) || RMO.VIDEO_GENDERS[0];
  const audOpt = RMO.AUDIENCES.find(a => a.id === VIDEO_STATE.audience);
  const audienceLabel = audOpt ? audOpt.label : 'ทั่วไป';
  const audiencePersona = audOpt ? audOpt.promptEn : '';
  const keywords = (VIDEO_STATE.keywords || '').trim();

  const dialectInstruction = VIDEO_STATE.dialect === 'th_central'
    ? 'Standard Central Thai — formal-friendly with "ครับ/ค่ะ/นะคะ"'
    : VIDEO_STATE.dialect === 'th_southern'
    ? `Southern Thai dialect (สำเนียงใต้) — naturally as spoken in Narathiwat/Pattani region. Use distinctive Southern Thai vocabulary and grammar where natural (e.g. "หลาว", "บะ", "นะ" — only when fitting). Do NOT use Central Thai disguised as Southern.`
    : `Pattani Malay (Bahasa Melayu Patani / มลายูถิ่น 3 จังหวัด) — the Malay variety spoken by Malay-Muslim community in Narathiwat/Pattani/Yala. This is DIFFERENT from standard Malaysian Malay. Use Pattani Malay vocabulary, particles, and natural spoken grammar. Examples of Pattani Malay distinctive features include words like "ame" (กิน), "ghoyak" (พูด), "demo" (เธอ/พวกคุณ), but use whatever fits naturally. Output in Thai script transliteration if Malay script is uncertain — but native Pattani Malay readers must understand.`;

  // 🆕 v0.9.4: speaker info — เภสัชกร + คู่สนทนา
  const pharmInfo = pharmGender.id === 'male'
    ? 'PHARMACIST (main character) is MALE — uses "ครับ/ผม", never "ค่ะ/ดิฉัน"'
    : 'PHARMACIST (main character) is FEMALE — uses "ค่ะ/ดิฉัน", never "ครับ/ผม"';
  const listenerInfo = listenGender.id === 'male'
    ? `LISTENER (${audienceLabel}) is MALE — uses "ครับ/ผม", never "ค่ะ/ดิฉัน"`
    : `LISTENER (${audienceLabel}) is FEMALE — uses "ค่ะ/ดิฉัน", never "ครับ/ผม"`;

  const isSolo = !!VIDEO_STATE.soloMode;

  const systemPrompt = `You are a professional pharmacy video script writer for Rueso Hospital, a community hospital in Narathiwat, southern Thailand.

YOUR TASK:
Create a 4-scene short educational video script following the Hook → Problem → Solution → Closing arc.${isSolo ? `

🎬 SOLO MODE (CRITICAL — main character speaks alone, NO listener):
- The video has ONLY ONE character (the main character) speaking continuously
- All 4 scenes happen in the SAME SETTING with the SAME framing
- Each scene is a separate clip that will be stitched together for a continuous monologue
- Dialogue must FLOW NATURALLY from scene to scene (like one connected speech, not 4 isolated clips)
- "speaker" field MUST be "pharmacist" for ALL 4 scenes
- "listenerPose" field MUST be set to "listen_nod" (placeholder — will be ignored in solo render)
- Each scene must continue from the previous one, ending naturally so the next scene picks up the topic` : ''}

USER'S TOPIC: "${topic}"
KEYWORDS: "${keywords || '(none specified)'}"
${isSolo ? '(Solo monologue — no audience character)' : `TARGET AUDIENCE: "${audienceLabel}" (${audiencePersona})`}
DIALECT REQUIREMENT (CRITICAL): ${dialectInstruction}

CHARACTERS IN THE VIDEO:
- ${pharmInfo}${isSolo ? '\n- (NO LISTENER — solo monologue mode)' : `\n- ${listenerInfo}`}

SPEAKER PER SCENE (CRITICAL):
${isSolo ? `- ALL 4 scenes have speaker = "pharmacist" (main character speaks alone)
- All pronouns MUST match main character's gender (${pharmGender.label} pronouns)
- Build a smooth narrative arc across the 4 scenes` : `- Each scene has EXACTLY ONE speaker (not both characters)
- Decide based on context:
  * Scene 1 (Hook): usually pharmacist introducing
  * Scene 2 (Problem): could be listener asking, or pharmacist explaining
  * Scene 3 (Solution): usually pharmacist
  * Scene 4 (Closing): usually pharmacist
- "speaker" field MUST be "pharmacist" or "listener"
- Pronouns MUST match speaker's gender:
  * If speaker = "pharmacist", use ${pharmGender.label} pronouns
  * If speaker = "listener", use ${listenGender.label} pronouns`}

🎯 TONE GUIDELINE (CRITICAL — Professional Trustworthy):

Write dialogue like a CONFIDENT KNOWLEDGEABLE ADVISOR speaking on camera.
NOT like casual chat. NOT like reading news. NOT like medical lecture.

✅ GOOD examples (Professional Trustworthy):
- "คุณทราบหรือไม่ครับ ว่ายาพาราเซตามอล หากใช้ผิดวิธี อาจเป็นอันตราย"
- "ปริมาณที่ปลอดภัยคือไม่เกิน 4,000 มิลลิกรัมต่อวัน"
- "หากมีข้อสงสัย ปรึกษาเภสัชกรก่อนใช้ทุกครั้งนะครับ"

❌ BAD examples (Avoid casual filler):
- "เอ่อ... คุณรู้ไหมครับ ยาพาราเนี่ย..." (casual filler)
- "ป้าครับ ระวังนิดนึงนะครับ" (street language)
- "Paracetamol อ่ะ มีข้อควรระวังหนะ" (gossipy tone)

LANGUAGE RULES:
- Use formal-friendly Thai: "ทราบ", "หากใช้", "อาจเป็น", "นะครับ" (formal)
- AVOID filler words: "เอ่อ", "อืม", "อะ", "เนี่ย", "หนะ"
- Use proper verbs: "ใช้" (NOT "กิน" for medicines, unless context is oral pills)
- Use specific numbers/facts where appropriate (4,000 mg, 8 เม็ด, etc.)

For EACH of 4 scenes, generate:
1. speaker: ${isSolo ? '"pharmacist" (always — solo mode)' : '"pharmacist" or "listener"'}
2. dialogue: 8-15 words, natural professional Thai. Pronouns match speaker's gender.
3. emotion: One emotion. Choose from:
   กระตือรือร้น / สงบ / ตื่นเต้น / จริงจัง / เป็นมิตร / ลึกลับ / เศร้า / ร่าเริง / รุนแรง / 
   อบอุ่น (Warm) / เตือน (Warning) / มั่นใจ (Confident) / ครุ่นคิด (Thoughtful) / กังวล (Concerned) / อ่อนน้อม (Humble) / มีความหวัง (Hopeful)
4. delivery: Short ENGLISH bullet points describing HOW to deliver this line.
   Format as 4-6 bullet points (each starts with "- ").
   Include: tone, pace, emphasis, body language, what to avoid.
   Example:
   "- Tone: confident, professional, slightly intriguing
    - Speak clearly and articulately
    - Pause slightly before key drug name
    - Subtle nod for emphasis
    - NO filler words"
5. pharmacistPose: One pose ID for the main character in this scene. Choose from:
   smile_explain / point_explain / hand_over / read_label / thoughtful / warning /
   hold_drug / check_record / emphasize / reassure / reference_book / demonstrate /
   time_indicate / confident_answer
6. listenerPose: ${isSolo ? '"listen_nod" (always — placeholder, ignored in solo render)' : `One pose for the listener. Choose from:
   listen_nod / take_note / hold_rx / curious / worried / thankful / surprised /
   understanding / receive / confused / attentive_lean / pause_gesture / relieved / check_phone

⚠️ CRITICAL — Choose listenerPose that MATCHES the dialogue context:
- If speaker ASKS A QUESTION → listener DOES NOT KNOW yet → use "curious" or "surprised"
- If speaker EXPLAINS A PROBLEM/RISK → listener is concerned → use "worried"
- If speaker GIVES A SOLUTION → listener understands → use "listen_nod" or "understanding"
- If speaker CONCLUDES → listener appreciates → use "thankful" or "relieved"
- DO NOT default to "listen_nod" for every scene`}${
   VIDEO_STATE.bgMode === 'perScene' ? `
7. background: One background ID. Choose from:
   pharmacy / opd / ward / home / mosque / studio / outdoor` : ''}

${isSolo ? `Pose progression for SOLO MODE (build a confident monologue):
- Scene 1 (Hook): smile_explain or emphasize (engaging opener)
- Scene 2 (Problem): warning or thoughtful (raise the stakes)
- Scene 3 (Solution): point_explain or demonstrate or hold_drug (provide the answer)
- Scene 4 (Closing): smile_explain or confident_answer (wrap up confidently)` : `Choose poses that match the scene context:
- Scene 1 (Hook — usually a question): pharmacist (smile_explain or emphasize), listener (curious or surprised)
- Scene 2 (Problem — explanation of risk): pharmacist (warning or thoughtful), listener (worried)
- Scene 3 (Solution): pharmacist (point_explain or demonstrate or hold_drug), listener (listen_nod or understanding)
- Scene 4 (Closing): pharmacist (smile_explain or confident_answer), listener (thankful or relieved)`}

OUTPUT FORMAT (CRITICAL — strict JSON only, no markdown):
[
  {
    "speaker": "pharmacist",
    "dialogue": "...",
    "emotion": "จริงจัง",
    "delivery": "- Tone: confident, professional...\\n- Speak clearly...",
    "pharmacistPose": "smile_explain",
    "listenerPose": "listen_nod"${VIDEO_STATE.bgMode === 'perScene' ? ',\n    "background": "pharmacy"' : ''}
  },
  {"speaker": "${isSolo ? 'pharmacist' : '...'}", "dialogue": "...", "emotion": "...", "delivery": "...", "pharmacistPose": "...", "listenerPose": "..."${VIDEO_STATE.bgMode === 'perScene' ? ', "background": "..."' : ''}},
  {"speaker": "${isSolo ? 'pharmacist' : '...'}", "dialogue": "...", "emotion": "...", "delivery": "...", "pharmacistPose": "...", "listenerPose": "..."${VIDEO_STATE.bgMode === 'perScene' ? ', "background": "..."' : ''}},
  {"speaker": "${isSolo ? 'pharmacist' : '...'}", "dialogue": "...", "emotion": "...", "delivery": "...", "pharmacistPose": "...", "listenerPose": "..."${VIDEO_STATE.bgMode === 'perScene' ? ', "background": "..."' : ''}}
]`;

  const btnGen = $('#btnGenerateVideoScenes');
  const btnRegen = $('#btnRegenAllScenes');
  const loading = $('#videoScenesLoading');
  const container = $('#videoScenesContainer');

  if (btnGen) btnGen.disabled = true;
  if (btnRegen) btnRegen.disabled = true;
  if (loading) loading.style.display = 'flex';

  try {
    const result = await window.RHAI.callAI('Generate the 4-scene script now in JSON format as instructed.', {
      systemPrompt: systemPrompt,
      maxTokens: 1500,
      temperature: 0.85
    });
    const rawText = (result && typeof result === 'object') ? result.text : String(result || '');
    console.log('[RH Pharma] AI video scenes raw response:', rawText);

    // Parse JSON
    let cleaned = (rawText || '').trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // ลองหา [...]
      const arrMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrMatch) {
        try { parsed = JSON.parse(arrMatch[0]); } catch (_) { parsed = null; }
      }
      // legacy: { scenes, headlines }
      if (!parsed) {
        const objMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objMatch) {
          try {
            const obj = JSON.parse(objMatch[0]);
            if (Array.isArray(obj.scenes)) parsed = obj.scenes;
          } catch (_) { parsed = null; }
        }
      }
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('AI ตอบกลับไม่ถูกรูปแบบ — ลองใหม่');
    }

    // Normalize 4 scenes — รวม pose + background (v0.9.13)
    const validPharmPoses = (window.RHModelOptions.MODEL_POSES || []).map(p => p.id);
    const validListenerPoses = (window.RHModelOptions.PARTNER_POSES || []).map(p => p.id);
    const validBackgrounds = (window.RHModelOptions.BACKGROUNDS || []).map(b => b.id);
    const scenes = parsed.slice(0, 4).map(s => ({
      speaker: (s.speaker === 'listener' ? 'listener' : 'pharmacist'),
      dialogue: s.dialogue || '',
      emotion: s.emotion || 'จริงจัง',
      delivery: s.delivery || '',
      pharmacistPose: validPharmPoses.includes(s.pharmacistPose) ? s.pharmacistPose : '',
      listenerPose: validListenerPoses.includes(s.listenerPose) ? s.listenerPose : '',
      background: validBackgrounds.includes(s.background) ? s.background : (VIDEO_STATE.bgMode === 'perScene' ? 'pharmacy' : '')
    }));
    while (scenes.length < 4) scenes.push({ speaker: 'pharmacist', dialogue: '', emotion: 'จริงจัง', delivery: '', pharmacistPose: '', listenerPose: '', background: '' });

    VIDEO_STATE.scenes = scenes;
    renderVideoScenes();
    if (container) container.style.display = 'block';
    showToast('✅ AI สร้าง 4 ฉากเสร็จแล้ว — ตรวจสอบและแก้ได้', 'success', 2500);

    // reset scene-sent state (จาก gen ก่อนหน้า)
    document.querySelectorAll('.scene-send-btn').forEach(b => b.classList.remove('sent'));

  } catch (err) {
    console.error('[generateVideoScenes] error:', err);
    showToast(`❌ ${err.message || 'AI สร้างฉากผิดพลาด'}`, 'error', 3500);
  } finally {
    if (btnGen) btnGen.disabled = false;
    if (btnRegen) btnRegen.disabled = false;
    if (loading) loading.style.display = 'none';
  }
}

// =====================================================
// 🆕 v0.9.11 — Helpers for inline prompt preview
// =====================================================

// สร้าง prompt preview สำหรับ 1 scene (เรียกใช้ตอน render scene cards)
function buildPreviewPrompt(scene, sceneIdx) {
  if (!window.RHModelOptions || !window.RHModelOptions.buildVideoPrompt) return '';
  try {
    return window.RHModelOptions.buildVideoPrompt(VIDEO_STATE, scene, sceneIdx);
  } catch (e) {
    console.warn('[buildPreviewPrompt] error:', e.message);
    return '⚠️ ไม่สามารถสร้าง prompt preview ได้';
  }
}

// อัพเดท prompt preview ของ scene เฉพาะที่แก้ (real-time)
function updateScenePromptPreview(idx) {
  const previewEl = document.querySelector(`.prompt-preview-text[data-idx="${idx}"]`);
  if (!previewEl) return;
  const scene = VIDEO_STATE.scenes[idx];
  if (!scene) return;
  previewEl.textContent = buildPreviewPrompt(scene, idx);
}

// อัพเดท prompt preview ของทุก scene (เมื่อ field ระดับ global เปลี่ยน)
function updateAllScenePromptPreviews() {
  if (!VIDEO_STATE.scenes || VIDEO_STATE.scenes.length === 0) return;
  document.querySelectorAll('.prompt-preview-text').forEach(el => {
    const idx = parseInt(el.dataset.idx);
    if (VIDEO_STATE.scenes[idx]) {
      el.textContent = buildPreviewPrompt(VIDEO_STATE.scenes[idx], idx);
    }
  });
}

function renderVideoScenes() {
  const list = $('#videoScenesList');
  const buttonsContainer = $('#videoSceneButtons');
  if (!list || !buttonsContainer) return;

  const RMO = window.RHModelOptions;
  const scenes = VIDEO_STATE.scenes;
  if (!scenes || scenes.length === 0) {
    list.innerHTML = '';
    buttonsContainer.innerHTML = '';
    return;
  }

  // render scene cards (แก้ไขได้)
  list.innerHTML = scenes.map((s, i) => {
    const isHook = i === 0;
    const speakerEmoji = s.speaker === 'listener' ? '👥' : '🩺';
    const speakerLabel = s.speaker === 'listener' ? 'คู่สนทนา' : 'เภสัชกร';
    const sceneNames = ['Hook', 'Problem', 'Solution', 'Closing'];
    const sceneNameTh = sceneNames[i] || `ฉากที่ ${i + 1}`;
    // 🆕 v0.9.11: Effective poses (scene level — no global)
    const effectivePharmPose = s.pharmacistPose || 'smile_explain';
    const effectiveListenerPose = s.listenerPose || 'listen_nod';
    // 🆕 v0.9.12: pose แสดงเฉพาะของผู้พูด
    const isPharmSpeaker = s.speaker !== 'listener';
    return `
    <div class="scene-card" data-scene-idx="${i}">
      <div class="scene-card-header">
        <span class="scene-num">${i + 1}</span>
        <span>ฉากที่ ${i + 1} (${sceneNameTh})</span>
        <span class="scene-speaker-badge">${speakerEmoji} ${speakerLabel}พูด</span>
      </div>
      <div class="scene-field">
        <label class="scene-field-label">👤 ผู้พูดในฉากนี้</label>
        <select class="scene-speaker" data-idx="${i}">
          <option value="pharmacist" ${s.speaker !== 'listener' ? 'selected' : ''}>🩺 เภสัชกร (ตัวละครหลัก)</option>
          <option value="listener" ${s.speaker === 'listener' ? 'selected' : ''}>👥 คู่สนทนา (ผู้รับคำปรึกษา)</option>
        </select>
      </div>
      <div class="scene-field">
        <label class="scene-field-label">🗣️ บทพูด</label>
        <textarea class="scene-dialogue" rows="2" data-idx="${i}">${escapeHtml(s.dialogue)}</textarea>
      </div>
      <div class="scene-field">
        <label class="scene-field-label">😊 น้ำเสียง</label>
        <select class="scene-emotion" data-idx="${i}">
          ${RMO.VIDEO_EMOTIONS.map(e => {
            const sel = (s.emotion && (s.emotion === e.id || e.label.includes(s.emotion))) ? 'selected' : '';
            return `<option value="${e.label}" ${sel}>${e.icon} ${e.label}</option>`;
          }).join('')}
        </select>
      </div>
      <div class="scene-field">
        <label class="scene-field-label">🚶 ท่าทาง${isPharmSpeaker ? 'เภสัชกร' : 'คู่สนทนา'} (ผู้พูดเท่านั้น)</label>
        ${isPharmSpeaker ? `
          <select class="scene-pharm-pose" data-idx="${i}">
            ${RMO.MODEL_POSES.map(p => {
              const sel = p.id === effectivePharmPose ? 'selected' : '';
              return `<option value="${p.id}" ${sel}>${p.icon || ''} ${p.label}</option>`;
            }).join('')}
          </select>
        ` : `
          <select class="scene-listener-pose" data-idx="${i}">
            ${RMO.PARTNER_POSES.map(p => {
              const sel = p.id === effectiveListenerPose ? 'selected' : '';
              return `<option value="${p.id}" ${sel}>${p.icon || ''} ${p.label}</option>`;
            }).join('')}
          </select>
        `}
      </div>
      ${VIDEO_STATE.bgMode === 'perScene' ? `
      <div class="scene-field">
        <label class="scene-field-label">🌆 พื้นหลังของฉาก</label>
        <select class="scene-background" data-idx="${i}">
          ${RMO.BACKGROUNDS.map(b => {
            const sel = b.id === (s.background || 'pharmacy') ? 'selected' : '';
            return `<option value="${b.id}" ${sel}>${b.icon || ''} ${b.label}</option>`;
          }).join('')}
        </select>
      </div>
      ` : ''}
      ${s.delivery ? `
      <div class="scene-field scene-delivery-preview">
        <label class="scene-field-label">📝 Delivery (AI gen)</label>
        <pre class="delivery-text">${escapeHtml(s.delivery)}</pre>
      </div>
      ` : ''}
      <div class="scene-field scene-prompt-preview">
        <details class="prompt-preview-details">
          <summary class="prompt-preview-summary">👁️ ดู Prompt ที่จะส่งไป Flow</summary>
          <pre class="prompt-preview-text" data-idx="${i}">${escapeHtml(buildPreviewPrompt(s, i))}</pre>
        </details>
      </div>
    </div>
  `;
  }).join('');

  // bind input events
  list.querySelectorAll('.scene-speaker').forEach(el => {
    el.addEventListener('change', () => {
      const idx = parseInt(el.dataset.idx);
      if (VIDEO_STATE.scenes[idx]) {
        VIDEO_STATE.scenes[idx].speaker = el.value;
        renderVideoScenes();
      }
    });
  });
  list.querySelectorAll('.scene-dialogue').forEach(el => {
    el.addEventListener('input', () => {
      const idx = parseInt(el.dataset.idx);
      if (VIDEO_STATE.scenes[idx]) VIDEO_STATE.scenes[idx].dialogue = el.value;
      debounceValidate();
      updateScenePromptPreview(idx);     // 🆕 v0.9.11
    });
  });
  list.querySelectorAll('.scene-emotion').forEach(el => {
    el.addEventListener('change', () => {
      const idx = parseInt(el.dataset.idx);
      if (VIDEO_STATE.scenes[idx]) VIDEO_STATE.scenes[idx].emotion = el.value;
      updateScenePromptPreview(idx);     // 🆕 v0.9.11
    });
  });
  list.querySelectorAll('.scene-camera').forEach(el => {
    el.addEventListener('change', () => {
      const idx = parseInt(el.dataset.idx);
      if (VIDEO_STATE.scenes[idx]) VIDEO_STATE.scenes[idx].camera = el.value;
      updateScenePromptPreview(idx);
    });
  });

  // 🆕 v0.9.11: bind per-scene pose dropdowns
  list.querySelectorAll('.scene-pharm-pose').forEach(el => {
    el.addEventListener('change', () => {
      const idx = parseInt(el.dataset.idx);
      if (VIDEO_STATE.scenes[idx]) VIDEO_STATE.scenes[idx].pharmacistPose = el.value;
      updateScenePromptPreview(idx);
    });
  });
  list.querySelectorAll('.scene-listener-pose').forEach(el => {
    el.addEventListener('change', () => {
      const idx = parseInt(el.dataset.idx);
      if (VIDEO_STATE.scenes[idx]) VIDEO_STATE.scenes[idx].listenerPose = el.value;
      updateScenePromptPreview(idx);
    });
  });

  // 🆕 v0.9.13: bind per-scene background dropdown (เฉพาะ perScene mode)
  list.querySelectorAll('.scene-background').forEach(el => {
    el.addEventListener('change', () => {
      const idx = parseInt(el.dataset.idx);
      if (VIDEO_STATE.scenes[idx]) VIDEO_STATE.scenes[idx].background = el.value;
      updateScenePromptPreview(idx);
    });
  });

  // 🆕 v0.9.13: คลิกปุ่ม "ดู Prompt" → expand + auto-copy + toast
  list.querySelectorAll('.prompt-preview-summary').forEach(summary => {
    summary.addEventListener('click', (ev) => {
      // Note: ไม่ preventDefault — ปล่อยให้ <details> toggle ปกติ
      const details = summary.closest('.prompt-preview-details');
      const previewEl = details?.querySelector('.prompt-preview-text');
      if (!previewEl) return;
      const promptText = previewEl.textContent || '';
      // copy ทันที
      if (navigator.clipboard && promptText.trim()) {
        navigator.clipboard.writeText(promptText).then(() => {
          showToast('📋 คัดลอก prompt แล้ว', 'success', 1800);
        }).catch(err => {
          console.warn('[copy] fail:', err);
          showToast('⚠️ คัดลอกไม่สำเร็จ', 'warning', 1800);
        });
      }
    });
  });

  // [v0.9.8] cover headline + headline candidates bindings removed — ย้ายไป Tab "สร้างแบบ"

  // render 4 send buttons — 🆕 v0.9.4: icon บอกผู้พูด
  buttonsContainer.innerHTML = scenes.map((s, i) => {
    const speakerEmoji = s.speaker === 'listener' ? '👥' : '🩺';
    const speakerLabel = s.speaker === 'listener' ? 'คู่สนทนา' : 'เภสัชกร';
    return `
    <button class="scene-send-btn" data-scene-idx="${i}">
      <span class="scene-send-btn-emoji">${speakerEmoji}</span>
      <span>ฉากที่ ${i + 1}</span>
      <span class="scene-send-btn-num">${speakerLabel}พูด</span>
    </button>
    `;
  }).join('');

  buttonsContainer.querySelectorAll('.scene-send-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.sceneIdx);
      sendVideoSceneToFlow(idx, btn);
    });
  });

  // 🆕 v0.9.3 — auto-validate pronouns ทุกครั้งที่ render
  validateScenePronouns();
}

// =====================================================
// 🆕 v0.9.4 — Validate pronoun ตาม speaker ของแต่ละ scene
//   ฉากที่ speaker=pharmacist → check ตาม VIDEO_STATE.gender
//   ฉากที่ speaker=listener   → check ตาม VIDEO_STATE.listenerGender
// =====================================================
function validateScenePronouns() {
  if (!window.RHModelOptions || !VIDEO_STATE.scenes || VIDEO_STATE.scenes.length === 0) return;

  const RMO = window.RHModelOptions;

  document.querySelectorAll('.scene-card').forEach((card, idx) => {
    const scene = VIDEO_STATE.scenes[idx];
    if (!scene || !scene.dialogue) {
      card.classList.remove('has-pronoun-warning');
      const oldWarn = card.querySelector('.pronoun-warning');
      if (oldWarn) oldWarn.remove();
      return;
    }

    // เลือก gender ตาม speaker ของฉากนี้
    // 🆕 v0.9.26: ใน Solo mode ไม่มี listener — ใช้ pharmacist gender เสมอ
    const isSolo = !!VIDEO_STATE.soloMode;
    const genderId = (!isSolo && scene.speaker === 'listener') ? VIDEO_STATE.listenerGender : VIDEO_STATE.gender;
    const gender = RMO.VIDEO_GENDERS.find(g => g.id === genderId);
    if (!gender) {
      card.classList.remove('has-pronoun-warning');
      return;
    }
    const wrongList = gender.wrongList || [];
    const wrongWords = wrongList.filter(w => scene.dialogue.includes(w));

    // remove old warning
    const oldWarn = card.querySelector('.pronoun-warning');
    if (oldWarn) oldWarn.remove();

    if (wrongWords.length > 0) {
      card.classList.add('has-pronoun-warning');
      const dialogueField = card.querySelector('.scene-dialogue');
      if (dialogueField && dialogueField.parentElement) {
        const speakerLabel = scene.speaker === 'listener' ? 'คู่สนทนา' : 'เภสัชกร';
        const warn = document.createElement('div');
        warn.className = 'pronoun-warning';
        warn.innerHTML = `⚠️ พบคำที่ขัดกับเพศ${speakerLabel} <strong>${gender.label}</strong>: "${wrongWords.join('", "')}" — ตรวจสอบบทพูด`;
        dialogueField.parentElement.appendChild(warn);
      }
    } else {
      card.classList.remove('has-pronoun-warning');
    }
  });
}

// helper: validate ตอน user แก้ dialogue ใน textarea
function debounceValidate() {
  if (debounceValidate._timer) clearTimeout(debounceValidate._timer);
  debounceValidate._timer = setTimeout(validateScenePronouns, 400);
}

// =====================================================
// ส่ง scene N ไป Flow
// =====================================================
async function sendVideoSceneToFlow(sceneIdx, btnElement) {
  if (!window.RHModelOptions) {
    showToast('❌ ระบบยังไม่พร้อม', 'error');
    return;
  }
  const scene = VIDEO_STATE.scenes[sceneIdx];
  if (!scene || !scene.dialogue) {
    showToast('⚠️ ฉากนี้ยังไม่มีบทพูด — กด AI สร้างใหม่', 'warning');
    return;
  }

  // Build prompt
  const prompt = window.RHModelOptions.buildVideoPrompt(VIDEO_STATE, scene, sceneIdx);

  // ตรวจว่าเป็นฉากแรกที่ส่งหรือไม่ (เพื่อตัดสินใจว่าจะ set ratio/count/Video mode หรือไม่)
  const isFirstSend = !VIDEO_STATE._firstSceneSent;
  VIDEO_STATE._firstSceneSent = true;

  if (btnElement) btnElement.disabled = true;

  try {
    await chrome.storage.local.set({
      rhPharmaFlowPending: {
        prompt,
        images: [],                  // ❌ ไม่มีรูป — ผู้ใช้กด Start เลือกใน Flow เอง
        mode: 'video',                // 🎬 บอก content script ว่าเป็น video mode
        ratio: VIDEO_STATE.ratio,
        count: VIDEO_STATE.count,
        duration: VIDEO_STATE.duration,
        autoGenerate: false,
        skipSettings: !isFirstSend,   // ฉาก 2-4 ไม่ต้อง set settings ซ้ำ
        sceneIdx: sceneIdx + 1,
        timestamp: Date.now()
      }
    });

    showToast(`🎬 ส่งฉากที่ ${sceneIdx + 1} ไป Flow แล้ว`, 'info', 2500);

    // เปิด/focus Flow tab
    const flowTabs = await chrome.tabs.query({ url: ['https://labs.google/fx/tools/flow*'] });
    if (flowTabs.length > 0) {
      const tab = flowTabs[0];
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'flowProcessPending' });
      } catch (e) {
        console.log('[RH Pharma] Flow content script ยังไม่พร้อม → reload');
        await chrome.tabs.reload(tab.id);
      }
    } else {
      await chrome.tabs.create({ url: 'https://labs.google/fx/tools/flow', active: true });
    }

    // mark sent
    if (btnElement) btnElement.classList.add('sent');

  } catch (err) {
    console.error('[sendVideoSceneToFlow] error:', err);
    showToast(`❌ ${err.message}`, 'error');
  } finally {
    if (btnElement) btnElement.disabled = false;
  }
}

// =====================================================
// 🆘 RESTORED: ฟังก์ชันที่หายไปจาก refactor v0.8.6 — ใส่กลับ
// =====================================================

// Apply theme (light / dark / auto-from-system)
// v0.10.0 fix: CSS ใช้ selector "body.dark" / "body.auto-theme[data-system-theme=dark]"
// เดิม set data-theme บน html → ไม่ match → สีไม่เปลี่ยน
async function applyTheme(theme) {
  const root = document.documentElement;
  const body = document.body;
  let effective = theme;
  if (theme === 'auto') {
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  // toggle body class ที่ CSS selector อ้างถึง
  body.classList.remove('auto-theme', 'dark', 'light');
  if (theme === 'auto') {
    body.classList.add('auto-theme');
    body.setAttribute('data-system-theme', effective);
  } else {
    body.classList.add(effective);
  }
  root.setAttribute('data-theme', effective);  // backward compat
  if (STATE.settings) STATE.settings.theme = theme;
}

// Listen to system theme changes (only effective when theme === 'auto')
function setupSystemThemeListener() {
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq && typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', () => {
        if (STATE.settings.theme === 'auto') {
          applyTheme('auto');
        }
      });
    }
  } catch (e) {
    console.warn('[RH Pharma] setupSystemThemeListener:', e);
  }
}

// Setup settings panel (gear icon → modal)
function setupSettings() {
  const btnOpen = $('#btnSettings');
  const modal = $('#settingsModal');
  const btnClose = $('#btnCloseSettings');

  // === เปิด/ปิด modal ===
  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      populateSettingsValues();
      modal.style.display = 'flex';
    });
  }
  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  // คลิกพื้นที่นอก modal-content → ปิด
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // === Theme buttons (Light / Dark / Auto) ===
  $$('.theme-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const theme = btn.dataset.theme;
      $$('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
      await applyTheme(theme);
      await saveSettings();
      showToast(`✅ เปลี่ยนเป็น ${theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto'}`, 'success', 1200);
    });
  });

  // === Provider tabs (OpenAI / Claude) — สลับ pane ===
  $$('.provider-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const provider = tab.dataset.provider;
      $$('.provider-tab').forEach(t => t.classList.toggle('active', t.dataset.provider === provider));
      $$('.provider-pane').forEach(pane => {
        const id = pane.id;
        pane.classList.toggle('active', id === `pane${capitalize(provider)}`);
      });
    });
  });

  // === OpenAI: บันทึก / เช็ค / ลบ ===
  // 🆕 v0.9.6: helper sanitize API key — กัน "non ISO-8859-1" error
  const sanitizeApiKey = (raw) => String(raw || '').replace(/[\u0000-\u001F\u007F-\uFFFF]/g, '').trim();

  bindSettingsButton('#btnSaveOpenai', async () => {
    const rawKey = $('#openaiKey')?.value || '';
    const key = sanitizeApiKey(rawKey);
    if (rawKey && rawKey !== key) {
      // ผู้ใช้ paste มามีอักษรพิเศษ → แจ้งเตือน
      showToast('⚠️ พบอักษรพิเศษใน Key — ลบออกแล้วบันทึก', 'warning', 3500);
      const inp = $('#openaiKey');
      if (inp) inp.value = key;
    }
    const model = $('#openaiModel')?.value || 'gpt-4o-mini';
    STATE.settings.openaiApiKey = key;
    STATE.settings.openaiModel = model;
    await saveSettings();
    showToast(key ? '💾 บันทึก OpenAI Key แล้ว' : '🗑️ เคลียร์ OpenAI Key แล้ว', 'success');
  });
  bindSettingsButton('#btnTestOpenai', async () => {
    const rawKey = $('#openaiKey')?.value || STATE.settings.openaiApiKey;
    const key = sanitizeApiKey(rawKey);
    if (!key) { showToast('⚠️ ยังไม่มี API Key', 'warning'); return; }
    showToast('🔍 กำลังเช็คสถานะ...', 'info');
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (res.ok) showToast('✅ OpenAI API Key ใช้ได้', 'success');
      else showToast(`❌ Key ใช้ไม่ได้ (HTTP ${res.status})`, 'error');
    } catch (e) {
      showToast(`❌ ${e.message}`, 'error');
    }
  });
  bindSettingsButton('#btnClearOpenai', async () => {
    if (!confirm('ลบ OpenAI API Key?')) return;
    const inp = $('#openaiKey');
    if (inp) inp.value = '';
    STATE.settings.openaiApiKey = '';
    await saveSettings();
    showToast('🗑️ ลบ OpenAI Key แล้ว', 'info');
  });

  // === Claude: บันทึก / เช็ค / ลบ ===
  bindSettingsButton('#btnSaveClaude', async () => {
    const rawKey = $('#claudeKey')?.value || '';
    const key = sanitizeApiKey(rawKey);
    if (rawKey && rawKey !== key) {
      showToast('⚠️ พบอักษรพิเศษใน Key — ลบออกแล้วบันทึก', 'warning', 3500);
      const inp = $('#claudeKey');
      if (inp) inp.value = key;
    }
    const model = $('#claudeModel')?.value || 'claude-haiku-4-5';
    STATE.settings.claudeApiKey = key;
    STATE.settings.claudeModel = model;
    await saveSettings();
    showToast(key ? '💾 บันทึก Claude Key แล้ว' : '🗑️ เคลียร์ Claude Key แล้ว', 'success');
  });
  bindSettingsButton('#btnTestClaude', async () => {
    const rawKey = $('#claudeKey')?.value || STATE.settings.claudeApiKey;
    const key = sanitizeApiKey(rawKey);
    if (!key) { showToast('⚠️ ยังไม่มี API Key', 'warning'); return; }
    showToast('🔍 กำลังเช็คสถานะ...', 'info');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'hi' }]
        })
      });
      if (res.ok) showToast('✅ Claude API Key ใช้ได้', 'success');
      else {
        const err = await res.json().catch(() => ({}));
        showToast(`❌ ${err.error?.message || 'Key ใช้ไม่ได้'}`, 'error');
      }
    } catch (e) {
      showToast(`❌ ${e.message}`, 'error');
    }
  });
  bindSettingsButton('#btnClearClaude', async () => {
    if (!confirm('ลบ Claude API Key?')) return;
    const inp = $('#claudeKey');
    if (inp) inp.value = '';
    STATE.settings.claudeApiKey = '';
    await saveSettings();
    showToast('🗑️ ลบ Claude Key แล้ว', 'info');
  });

  // === Default Provider dropdown ===
  const dpSel = $('#defaultProvider');
  if (dpSel) dpSel.addEventListener('change', async () => {
    STATE.settings.aiProvider = dpSel.value;
    await saveSettings();
    if (typeof updateAiModeUI === 'function') updateAiModeUI();
    showToast(`✅ ใช้ ${dpSel.value === 'openai' ? 'OpenAI' : 'Claude'} เป็นหลัก`, 'success', 1500);
  });

  // === Anti-Detect: บันทึก ===
  bindSettingsButton('#btnSaveAntiDetect', async () => {
    STATE.settings.blurOnRecord = $('#blurOnRecord')?.checked || false;
    STATE.settings.antiDetect = $('#antiDetect')?.checked || false;
    STATE.settings.delayMin = parseInt($('#delayMin')?.value || '800');
    STATE.settings.delayMax = parseInt($('#delayMax')?.value || '2000');
    await saveSettings();
    showToast('💾 บันทึกการตั้งค่าแล้ว', 'success');
  });

  // ====================================================
  // v0.10.0 fix: handlers ที่หายไปจาก codebase เดิม
  // ====================================================

  // === Branding: บันทึก ===
  bindSettingsButton('#btnSaveBranding', async () => {
    STATE.settings.hospitalName = $('#hospitalName')?.value?.trim() || 'โรงพยาบาลรือเสาะ';
    STATE.settings.department = $('#department')?.value?.trim() || 'กลุ่มงานเภสัชกรรม';
    STATE.settings.hashtag = $('#hashtag')?.value?.trim() || '#รพรือเสาะ #เภสัชกรรม';
    STATE.settings.defaultDisclaimer = $('#defaultDisclaimer')?.value?.trim()
      || 'ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำเฉพาะบุคคล โปรดปรึกษาเภสัชกร/แพทย์';
    await saveSettings();
    showToast('💾 บันทึก Branding เรียบร้อย ✅', 'success', 2000);
  });

  // === Safety Toggles: auto-save บน change ===
  ['#approvalMode', '#contentValidator', '#autoDisclaimer'].forEach(sel => {
    const el = $(sel);
    if (!el) return;
    el.addEventListener('change', async () => {
      const key = sel.slice(1);
      STATE.settings[key] = el.checked;
      await saveSettings();
      showToast(`💾 ${el.checked ? 'เปิด' : 'ปิด'} "${key}"`, 'info', 1200);
    });
  });

  // === Reset all data ===
  bindSettingsButton('#btnResetAll', async () => {
    const confirm1 = confirm('⚠️ จะลบข้อมูลทั้งหมด — API keys, branding, topics, posts, คลังสื่อ, ซีรีส์, ตารางโพสต์\n\nยืนยัน?');
    if (!confirm1) return;
    const confirm2 = confirm('แน่ใจอีกครั้ง? ไม่สามารถกู้คืนได้');
    if (!confirm2) return;
    try {
      // เคลียร์ chrome.storage
      await chrome.storage.local.clear();
      // เคลียร์ IndexedDB (warehouse)
      if (window.ClipWarehouse) {
        try { await window.ClipWarehouse.clearAll(); } catch (e) { /* ignore */ }
      }
      // เคลียร์ alarms
      if (chrome.alarms?.clearAll) {
        await new Promise(res => chrome.alarms.clearAll(res));
      }
      showToast('✅ รีเซ็ตทุกข้อมูลแล้ว — ปิด-เปิด side panel ใหม่', 'success', 4000);
      setTimeout(() => location.reload(), 1500);
    } catch (e) {
      console.error('[RH Pharma] reset:', e);
      showToast('❌ Error: ' + e.message, 'error');
    }
  });
}

// Helper: ใช้ใน setupSettings เพื่อ bind ปุ่มแบบมี null guard
function bindSettingsButton(selector, handler) {
  const btn = $(selector);
  if (btn) btn.addEventListener('click', handler);
}

// Helper: capitalize first letter
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// อ่านค่า settings ทั้งหมดเข้าไปยัง modal field — เรียกตอนเปิด modal
function populateSettingsValues() {
  // Theme buttons
  const currentTheme = STATE.settings.theme || 'auto';
  $$('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === currentTheme);
  });

  // OpenAI
  const openaiKey = $('#openaiKey');
  if (openaiKey) openaiKey.value = STATE.settings.openaiApiKey || '';
  const openaiModel = $('#openaiModel');
  if (openaiModel) openaiModel.value = STATE.settings.openaiModel || 'gpt-4o-mini';

  // Claude
  const claudeKey = $('#claudeKey');
  if (claudeKey) claudeKey.value = STATE.settings.claudeApiKey || '';
  const claudeModel = $('#claudeModel');
  if (claudeModel) claudeModel.value = STATE.settings.claudeModel || 'claude-haiku-4-5';

  // Default provider
  const dpSel = $('#defaultProvider');
  if (dpSel) dpSel.value = STATE.settings.aiProvider || 'openai';

  // Provider tabs — sync กับ default
  const activeProvider = STATE.settings.aiProvider || 'openai';
  $$('.provider-tab').forEach(t => t.classList.toggle('active', t.dataset.provider === activeProvider));
  $$('.provider-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `pane${capitalize(activeProvider)}`);
  });

  // Anti-Detect
  const blurChk = $('#blurOnRecord');
  if (blurChk) blurChk.checked = !!STATE.settings.blurOnRecord;
  const antiChk = $('#antiDetect');
  if (antiChk) antiChk.checked = STATE.settings.antiDetect !== false;  // default true
  const delayMin = $('#delayMin');
  if (delayMin) delayMin.value = STATE.settings.delayMin || 800;
  const delayMax = $('#delayMax');
  if (delayMax) delayMax.value = STATE.settings.delayMax || 2000;

  // ====================================================
  // v0.10.0 fix: populate branding + safety fields
  // ====================================================

  // Branding
  const hosp = $('#hospitalName');
  if (hosp) hosp.value = STATE.settings.hospitalName || 'โรงพยาบาลรือเสาะ';
  const dept = $('#department');
  if (dept) dept.value = STATE.settings.department || 'กลุ่มงานเภสัชกรรม';
  const hash = $('#hashtag');
  if (hash) hash.value = STATE.settings.hashtag || '#รพรือเสาะ #เภสัชกรรม';
  const disc = $('#defaultDisclaimer');
  if (disc) disc.value = STATE.settings.defaultDisclaimer
    || 'ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำเฉพาะบุคคล โปรดปรึกษาเภสัชกร/แพทย์';

  // Safety toggles
  const approval = $('#approvalMode');
  if (approval) approval.checked = STATE.settings.approvalMode !== false;
  const validator = $('#contentValidator');
  if (validator) validator.checked = STATE.settings.contentValidator !== false;
  const autoDisc = $('#autoDisclaimer');
  if (autoDisc) autoDisc.checked = STATE.settings.autoDisclaimer !== false;
}

// =====================================================
// INITIALIZATION
// =====================================================
async function init() {
  // helper: try-catch wrapper เพื่อให้ฟังก์ชันเดียวล้มไม่ทำลายทุกอย่าง
  // v0.10.0 fix: คืน Promise เสมอ เพื่อให้ `await safe(...)` รอจนเสร็จจริง
  const safe = async (label, fn) => {
    try {
      return await fn();
    } catch (e) {
      console.error(`[RH Pharma] ${label} failed:`, e);
    }
  };

  await safe('loadFromStorage', loadFromStorage);

  // กัน STATE.settings เป็น null (กรณี first install + service worker ยังไม่เซ็ต default)
  if (!STATE.settings || typeof STATE.settings !== 'object') {
    STATE.settings = {};
  }

  // ใช้ theme ตามที่บันทึกไว้ (default = dark)
  await safe('applyTheme', () => applyTheme(STATE.settings.theme || 'dark'));

  safe('setupSystemThemeListener', setupSystemThemeListener);
  safe('setupTabs',                setupTabs);
  safe('setupSubTabs',             setupSubTabs);
  safe('setupAudienceSelector',    setupAudienceSelector);
  safe('setupLanguageSelector',    setupLanguageSelector);
  safe('setupRatioSelector',       setupRatioSelector);
  safe('setupAiModeToggle',        setupAiModeToggle);
  safe('setupTopicHandlers',       setupTopicHandlers);   // ← ที่สำคัญ — ห้ามให้อันอื่นมา block
  safe('setupSettings',            setupSettings);
  safe('setupCreateTab',           setupCreateTab);       // Tab 2 — Infographic (v0.8.6)
  safe('setupVideoTab',            setupVideoTab);        // Tab 3 — วิดีโอ (v0.9.1)

  console.log('[RH Pharma] เริ่มทำงานแล้ว ✨');
}

// เริ่มทำงานเมื่อ DOM พร้อม
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
