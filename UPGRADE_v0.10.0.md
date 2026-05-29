# 💊 RH Pharma v0.10.0 — Health Media Production Suite

> เอาข้อดีของ KruBank Auto Gen มาใช้ในบริบทสื่อสุขภาพทั้งหมด
> **ไม่มี license** — ใครเอาไปใช้ก็ได้ ฟรี

**สถานะ:** v0.10.0 — Foundation + 10 modules ใหม่
**ผู้พัฒนา:** Meen / กลุ่มงานเภสัชกรรม รพ.รือเสาะ

---

## ✨ มีอะไรใหม่ใน v0.10.0

### 10 โมดูลใหม่ (เพิ่มเข้าไป — ไม่กระทบของเดิม)

| # | โมดูล | ไฟล์ | ฟีเจอร์หลัก |
|---|---|---|---|
| 1 | 📦 **Clip Warehouse** | `popup/clip-warehouse.js` | IndexedDB คลังสื่อ เก็บได้ 200 ชิ้น — รูป/วิดีโอ/เสียง สถานะ waiting/approved/scheduled/posted |
| 2 | ⚖️ **Content Validator** | `popup/content-validator.js` | เช็คคำต้องห้าม ~50 คำตาม พ.ร.บ. ยา + อย. + PDPA — block/warn/info 3 ระดับ |
| 3 | 📜 **Disclaimer Injector** | `popup/disclaimer-injector.js` | แทรก disclaimer + branding รพ. 3 ภาษา ตาม category อัตโนมัติ |
| 4 | 💊 **Pharma Prompt Library** | `popup/pharma-prompt-library.js` | 15 drug classes + 8 audience tones + 6 special populations + 8 visual prompts |
| 5 | 🎨 **Cover Text Styles** | `popup/cover-text-styles.js` | 10 สไตล์ headline สื่อสุขภาพ (เตือนภัย/ทิป/Q&A/ลิสต์เลข/เปรียบเทียบ/...) |
| 6 | 📅 **Story Series** | `popup/story-series.js` | 7 templates series (รู้จักยา 7 วัน / ดูแลหลังผ่าตัด / รอมฎอน + ยาเรื้อรัง / ผู้สูงอายุ polypharmacy 14 ตอน...) |
| 7 | ⏰ **Schedule Queue** | `popup/schedule-queue.js` | จัดตารางโพสต์ล่วงหน้า ใช้ chrome.alarms ส่งโพสต์ตามเวลา |
| 8 | 🎙️ **Podcast Generator** | `popup/podcast-generator.js` | สร้าง audio podcast สื่อสุขภาพ (Browser TTS หรือ OpenAI TTS) 6 voice presets |
| 9 | 🤖 **Humanize Delay** | `popup/humanize-delay.js` | พิมพ์/คลิกแบบเหมือนคน — กัน FB/TikTok ตีเป็น bot |
| 10 | 🧰 **RH Toolbox** | `popup/rh-toolbox.js` | Integration layer — รวม validate + disclaimer + warehouse + post เข้าเป็น pipeline เดียว |

### Content Scripts ใหม่
- `content/facebook-autopost.js` — auto-post Facebook Page (Composer)
- `content/tiktok-studio-autopost.js` — auto-post TikTok Studio

### Background ที่เพิ่ม
- รองรับ `chrome.alarms` ตั้งเวลาโพสต์
- รองรับ `chrome.notifications` แจ้งเตือนเมื่อถึงเวลา
- Message routing สำหรับ `postToFacebookViaTab` / `postToTikTokViaTab`

---

## 🔥 ความแตกต่างจาก KruBank Auto Gen

| ฟีเจอร์ | KruBank | RH Pharma v0.10.0 |
|---|---|---|
| Clip Warehouse | ✅ commercial, obfuscated | ✅ open, อ่านโค้ดได้ |
| Anti-detect | ✅ fingerprint spoofing | ⚖️ แค่ humanize delay (เพียงพอสำหรับเพจของตัวเอง) |
| License | ✅ มี (license.js 80 KB) | ❌ **ไม่มี — ฟรี ใครก็ใช้ได้** |
| Story Mode | ✅ for TikTok ขายของ | ✅ for ซีรีส์สุขภาพ (7 templates พร้อมใช้) |
| Prompt Library | ✅ image/video commercial style | ✅ pharma-specific (drug class + counseling) |
| Cover Styles | ✅ 105 KB เน้นโฆษณา | ✅ 10 สไตล์สื่อสุขภาพ (รวม Islamic, gentle care) |
| Content Validator | ❌ ไม่มี | ✅ **เฉพาะของเรา** — เช็ค พ.ร.บ. ยา + PDPA |
| Disclaimer | ❌ ไม่มี | ✅ **เฉพาะของเรา** — 3 ภาษา + 10 categories |
| Podcast | ✅ commercial | ✅ 6 voice presets สุขภาพ |
| FB Auto-post | ❌ ไม่มี | ✅ FB Page Composer (Sprint 5) |
| TikTok auto-post | ✅ TikTok Studio | ✅ TikTok Studio (สื่อสุขภาพ) |
| Schedule Queue | ⚠️ จำกัด | ✅ chrome.alarms ครบ |

---

## 🛠️ วิธีอัปเกรดจาก v0.9.x

### ถ้ายังไม่เคยติดตั้ง
1. ดาวน์โหลด/clone โฟลเดอร์ `rh-pharma`
2. เปิด `chrome://extensions` → เปิด Developer mode
3. Load unpacked → เลือกโฟลเดอร์ `rh-pharma`

### ถ้าติดตั้งเวอร์ชันเก่าอยู่
1. ที่ `chrome://extensions` กดปุ่ม 🔄 รีเฟรชที่ extension RH Pharma
2. เปิด side panel — ดู console จะมี log:
   ```
   [ClipWarehouse] loaded
   [ContentValidator] loaded — 50+ banned words
   [DisclaimerInjector] loaded
   [PharmaPromptLibrary] loaded — 15 drug classes
   [CoverTextStyles] loaded — 10 styles
   [StorySeries] loaded — 7 series templates
   [ScheduleQueue] loaded
   [PodcastGenerator] loaded — 6 voices
   [HumanizeDelay] loaded
   [RHToolbox] loaded
   ```
3. รันทดสอบใน console ของ side panel:
   ```js
   RHToolbox.quickTest()
   ```

---

## 🧪 ตัวอย่างการใช้งาน

### 1. ตรวจคำต้องห้ามก่อนโพสต์
```js
// เปิด console ของ side panel
const result = ContentValidator.validate('ยานี้รักษาความดันให้หายขาด 100%');
console.log(result.summary);  // { block: 3, warn: 0, info: 0 }
console.log(ContentValidator.formatReport(result));
// 🛑 พบคำต้องห้าม 3 จุด (โพสต์ไม่ได้):
//   • "หายขาด" — อ้างว่ารักษาให้หายขาด ผิด พ.ร.บ. ยา
//   • "100%" — อ้างประสิทธิภาพ 100% ผิดกฎ
//   ...
```

### 2. แทรก disclaimer อัตโนมัติ
```js
const settings = await chrome.storage.local.get('rhPharmaSettings');
const final = DisclaimerInjector.inject(
  'การกินยาความดันสม่ำเสมอช่วยควบคุมโรค',
  { category: 'drug-knowledge', language: 'th', settings: settings.rhPharmaSettings }
);
// → ข้อความ + ⚕️ disclaimer + 🏥 รพ.รือเสาะ + #hashtag
```

### 3. สร้างซีรีส์ "รู้จักยาเบาหวาน 7 วัน 7 ตอน"
```js
const series = await StorySeries.generateSeries({
  templateId: 'drug-7day',
  drugName: 'Metformin',
  audience: 'public',
  language: 'th'
});
await StorySeries.saveSeries(series);
// → จะได้ series object 7 ตอน พร้อม content แต่ละตอน
```

### 4. ทยอยโพสต์ซีรีส์ทุกวัน 9:00
```js
const startAt = new Date();
startAt.setHours(9, 0, 0, 0);
startAt.setDate(startAt.getDate() + 1); // เริ่มพรุ่งนี้ 9:00

await RHToolbox.publishSeriesAsCampaign({
  series,
  startAt: startAt.toISOString(),
  intervalHours: 24,
  target: 'facebook'
});
// → 7 ตอน × ทุก 24 ชม. = 7 alarms ตั้งไว้
```

### 5. สร้าง podcast สำหรับผู้สูงอายุ
```js
const podcast = await PodcastGenerator.generatePodcast(
  'การกินยาความดันสม่ำเสมอเป็นสิ่งสำคัญ...',
  {
    voicePresetId: 'elderly-friendly-slow',
    method: 'openai',         // ใช้ OpenAI TTS (ต้องมี API key)
    audience: 'elderly',
    language: 'th',
    durationMinutes: 2,
    topicTitle: 'ยาความดันสำหรับผู้สูงอายุ'
  }
);
// → ได้ audio blob + บันทึกใน Warehouse อัตโนมัติ
```

### 6. เปิดคลังสื่อ
```js
const stats = await ClipWarehouse.getStats();
// { total: 12, waiting: 5, approved: 3, scheduled: 2, posted: 2, failed: 0 }

const waiting = await ClipWarehouse.getAll({ status: 'waiting' });
console.table(waiting);
```

---

## 🛡️ Safety guarantees

ทุกโพสต์ผ่าน `RHToolbox.publishFlow()` จะถูกตรวจ:

1. ✅ **Content Validator** เช็คคำต้องห้าม (พ.ร.บ. ยา/PDPA/อย.)
2. ✅ **Auto-rewrite** ด้วย AI ถ้ามี BLOCK words (option)
3. ✅ **Disclaimer + Branding** แทรกอัตโนมัติ
4. ✅ **Approval Modal** ก่อนกด post จริง (default ON)
5. ✅ **Humanize Delay** กัน FB/TikTok detect bot

ตั้งค่าได้ใน Settings:
- `approvalMode` (default: true) — บังคับ approve ก่อนโพสต์
- `contentValidator` (default: true) — เช็คคำต้องห้าม
- `autoDisclaimer` (default: true) — แทรก disclaimer
- `autoBranding` (default: true) — แทรก branding รพ.

---

## 📦 โครงสร้างไฟล์ v0.10.0

```
rh-pharma/
├── manifest.json                          [v0.10.0]
├── README.md
├── UPGRADE_v0.10.0.md                     ← เอกสารนี้
├── assets/                                [ของเดิม]
├── background/
│   └── service-worker.js                  [+alarms, +notifications]
├── content/                               [ของเดิม + ใหม่ 2 ไฟล์]
│   ├── blur-overlay.js
│   ├── gemini-autofill.js
│   ├── flow-autofill.js
│   ├── facebook-autopost.js               🆕
│   └── tiktok-studio-autopost.js          🆕
└── popup/
    ├── sidepanel.html                     [+ script tags ใหม่]
    ├── sidepanel.css                      [ของเดิม]
    ├── sidepanel.js                       [ของเดิม]
    ├── ai-helper.js                       [ของเดิม]
    ├── templates.js                       [ของเดิม]
    ├── model-options.js                   [ของเดิม]
    ├── clip-warehouse.js                  🆕
    ├── content-validator.js               🆕
    ├── disclaimer-injector.js             🆕
    ├── pharma-prompt-library.js           🆕
    ├── cover-text-styles.js               🆕
    ├── story-series.js                    🆕
    ├── schedule-queue.js                  🆕
    ├── podcast-generator.js               🆕
    ├── humanize-delay.js                  🆕
    └── rh-toolbox.js                      🆕  ← integration layer
```

---

## 🎯 Next steps (สำหรับการพัฒนา UI ต่อ)

โมดูลพร้อมใช้แล้ว แต่ยังไม่มี **UI surface** ใน side panel
ขั้นถัดไปคือเพิ่มแท็บใหม่ใน `sidepanel.html`:

- 🆕 **แท็บ "📦 คลังสื่อ"** — แสดง warehouse, ปุ่ม post/schedule/delete
- 🆕 **แท็บ "📅 ซีรีส์"** — เลือก template, gen series, schedule campaign
- 🆕 **แท็บ "⏰ ตารางโพสต์"** — แสดง upcoming, history
- 🆕 **แท็บ "🎙️ Podcast"** — สร้าง audio
- 🆕 **Settings → Validator panel** — เปิด/ปิด rules

ตัวอย่าง pattern: ดู `sidepanel.html` เดิม → copy `<section class="tab-pane">` มาแก้

---

## 🐛 Debug & Troubleshooting

### Side panel ไม่โหลดโมดูลใหม่
- กดปุ่ม 🔄 รีเฟรชที่ `chrome://extensions`
- ปิด-เปิด side panel
- ดู console ของ side panel — ควรเห็น log ทุกโมดูล

### Schedule alarm ไม่ทำงาน
- เช็คว่ามี permission "alarms" + "notifications" ใน manifest
- เปิด `chrome://extensions` → คลิก "service worker" → ดู log
- alarm ทำงานเฉพาะเมื่อ Chrome เปิดอยู่ (background)

### Facebook auto-post ไม่ขึ้น approval dialog
- ตรวจว่าอยู่ในหน้า `business.facebook.com/latest/composer` หรือ `www.facebook.com`
- content script `facebook-autopost.js` ต้อง load สำเร็จ (ดู console)
- บางครั้งต้อง refresh tab Facebook

### ContentValidator block ผิด
- เพิ่ม/ปรับ rules ใน `popup/content-validator.js` — array `BANNED_WORDS`
- หรือเรียก `validate(text, { ignore: ['คำที่ต้องการ'] })` (ยังไม่ implement — เพิ่มเองได้)

---

**Made with 💙 by MeenRx** · กลุ่มงานเภสัชกรรม รพ.รือเสาะ · **เปิดให้ใช้ฟรี ไม่มี license**
