# 📖 คู่มือการใช้งาน RH Pharma v0.10.0

> AI สื่อสุขภาพ + คลังสื่อ + ตารางโพสต์ + Podcast
> สำหรับเภสัชกร / พยาบาล / บุคลากรการแพทย์ — รพ.รัฐ

---

## 📑 สารบัญ

1. [Extension ทำอะไรได้บ้าง](#1-extension-ทำอะไรได้บ้าง)
2. [การติดตั้ง](#2-การติดตั้ง)
3. [การตั้งค่าครั้งแรก](#3-การตั้งค่าครั้งแรก)
4. [ภาพรวม UI](#4-ภาพรวม-ui)
5. [คู่มือแต่ละแท็บ](#5-คู่มือแต่ละแท็บ)
6. [Workflow ตัวอย่าง 5 แบบ](#6-workflow-ตัวอย่าง)
7. [คำถามที่พบบ่อย](#7-คำถามที่พบบ่อย)
8. [Troubleshooting](#8-troubleshooting)
9. [สำหรับ Developer](#9-สำหรับ-developer)

---

## 1. Extension ทำอะไรได้บ้าง

### ฟีเจอร์หลัก 8 ตัว

| ฟีเจอร์ | ใช้ทำอะไร |
|---|---|
| ✨ **สร้างแบบ** | สร้างรูปสื่อให้คำปรึกษา (เภสัชกร + ยา) ส่งไป Google Flow / Nano Banana |
| 📊 **Infographic** | สร้าง infographic ความรู้สุขภาพ |
| 🎬 **วิดีโอ** | สร้างคลิป 4 ฉาก (Hook → Problem → Solution → Closing) ส่งไป Flow Veo |
| 📦 **คลังสื่อ** | เก็บสื่อรอโพสต์ (200 ชิ้น) — รูป/วิดีโอ/เสียง |
| 📅 **ซีรีส์** | สร้างชุดความรู้ต่อเนื่อง (7 templates เช่น "รู้จักยา 7 วัน") |
| ⏰ **ตารางโพสต์** | นัดเวลาโพสต์อัตโนมัติ |
| 🎙️ **Podcast** | สร้างเสียงสื่อสุขภาพ (สำหรับผู้สูงอายุ/ตาบอด) |
| 🛡️ **ตรวจสอบ** | เช็คคำต้องห้ามตาม พ.ร.บ. ยา + PDPA + อย. |

### Workflow มาตรฐาน
```
ตั้งหัวข้อ → AI gen เนื้อหา → ตรวจคำต้องห้าม → แทรก disclaimer
   → เก็บคลังสื่อ → นัดเวลา → โพสต์ FB/TikTok (มี approval)
```

---

## 2. การติดตั้ง

### วิธีที่ 1: จาก ZIP/RAR

1. ดาวน์โหลด `rh-pharma-v0.10.0.rar` หรือ `.zip`
2. แตกไฟล์ → จะได้โฟลเดอร์ `rh-pharma/`
3. เปิด Chrome → พิมพ์ `chrome://extensions` ใน address bar
4. เปิด **Developer mode** (มุมขวาบน toggle เป็นสีฟ้า)
5. กดปุ่ม **Load unpacked** (มุมซ้ายบน)
6. เลือกโฟลเดอร์ `rh-pharma` (ต้องมี `manifest.json` ข้างใน)
7. RH Pharma จะปรากฏในรายการ extension

### วิธีที่ 2: จาก GitHub
```bash
git clone https://github.com/meenrx/RH-pharma.git
```
แล้วโหลด unpacked ที่โฟลเดอร์ `RH-pharma` (วิธีนี้อัปเดตด้วย `git pull` ได้)

### ปักหมุดไอคอน
1. คลิกไอคอน 🧩 (Extensions) บน toolbar ขวาบน
2. หา **RH Pharma** → คลิก 📌 ปักหมุด
3. ตอนนี้ไอคอน 💊 RH Pharma จะอยู่ที่ toolbar

### เปิด Side Panel
- คลิกไอคอน 💊 RH Pharma บน toolbar
- Side panel จะเปิดทางขวา

---

## 3. การตั้งค่าครั้งแรก

### Step 1: ตั้ง API Key (AI Provider)

คลิกไอคอน ⚙️ มุมขวาบนของ side panel → จะเปิด Settings modal

#### OpenAI (แนะนำสำหรับการเริ่มต้น)
1. ไปที่ https://platform.openai.com/api-keys
2. สร้าง API key (รูปแบบ `sk-proj-...`)
3. Copy → กลับมา Settings → tab **OpenAI**
4. Paste key → กด **บันทึก**
5. กด **เช็คสถานะ** เพื่อยืนยันว่า key ใช้ได้
6. เลือก model: `gpt-4o-mini` (ราคาถูก) หรือ `gpt-4o` (คุณภาพดี)

#### Gemini (Google) — ฟรี
1. ไปที่ https://aistudio.google.com/apikey
2. Get API key → Copy
3. Paste → บันทึก
4. Model แนะนำ: `gemini-2.5-flash`

#### Claude (Anthropic) — คุณภาพสูง
1. ไปที่ https://console.anthropic.com
2. API keys → Create → Copy
3. Paste → บันทึก
4. Model แนะนำ: `claude-haiku-4-5` (เร็ว) หรือ `claude-sonnet-4-6` (ฉลาด)

### Step 2: ตั้ง Branding

ใน Settings → ส่วน **Branding**:
- **ชื่อ รพ.** เช่น "โรงพยาบาลรือเสาะ"
- **กลุ่มงาน** เช่น "กลุ่มงานเภสัชกรรม"
- **เบอร์โทร** เช่น "073-571-444"
- **Hashtag** เช่น "#รพรือเสาะ #เภสัชกรรม"
- **Disclaimer** ข้อความที่จะแทรกท้ายโพสต์ทุกครั้ง

> 💡 รพ. อื่นเอาไปใช้: แค่เปลี่ยน 5 ฟิลด์นี้ — extension จะใช้ branding ของ รพ. คุณทุกที่

### Step 3: เปิด Safety (default = ON)

- ✅ **Approval Mode** — บังคับ approve ก่อนโพสต์จริง
- ✅ **Content Validator** — เช็คคำต้องห้าม
- ✅ **Auto Disclaimer** — แทรก disclaimer อัตโนมัติ
- ✅ **Auto Branding** — แทรก branding รพ. อัตโนมัติ

ห้ามปิด — ถ้าเป็นการโพสต์ของ รพ. รัฐ

### Step 4: เลือก Theme

- 🌞 Light / 🌙 Dark / 🔄 Auto (ตามระบบ)
- ค่าเริ่มต้น: Dark

---

## 4. ภาพรวม UI

### Header (บนสุด)
- โลโก้ + ชื่อ รพ.
- ⚙️ Settings (มุมขวา)

### AI Mode Toggle
- ⚡ **ไม่ใช้ AI** — สร้างเองทั้งหมด
- 🤖 **ใช้ AI** — AI ช่วยสร้าง/ขยายเนื้อหา

### แท็บหลัก (จากซ้ายไปขวา)

| | แท็บ | ทำอะไร |
|---|---|---|
| ✨ | สร้างแบบ | สร้างรูปสื่อให้คำปรึกษา |
| 📊 | Infographic | สร้าง infographic |
| 🎬 | วิดีโอ | สร้างคลิป 4 ฉาก |
| 📦 | คลังสื่อ | จัดการสื่อรอโพสต์ |
| 📅 | ซีรีส์ | สร้างชุดความรู้ |
| ⏰ | ตาราง | นัดเวลาโพสต์ |
| 🎙️ | Podcast | สร้างเสียง |
| 🛡️ | ตรวจสอบ | เช็คคำต้องห้าม |

---

## 5. คู่มือแต่ละแท็บ

### 5.1 ✨ สร้างแบบ (Model Creation)

**ใช้ทำอะไร:** สร้างรูปสื่อให้คำปรึกษา 1 รูป ที่ใบหน้าเภสัชกรเหมือนเดิม 100%

**ขั้นตอน:**
1. **อัพรูปนายแบบ/นางแบบ** (เภสัชกร) — จะ lock ใบหน้า
2. **อัพรูปสินค้า** (ยา/อาหารเสริม)
3. **เลือกตัวเลือก:**
   - ใส่ข้อความบนปก (option) — AI gen headline ให้
   - เปลี่ยนชุดตัวละครหลัก (option)
   - คนเดียว / มีคู่สนทนา
4. **เลือก รายละเอียดภาพ:**
   - สไตล์ภาพ (Realistic / Cartoon / Cinematic / ...)
   - มุมกล้อง (closeup / half-body / full-body)
   - พื้นหลัง (ห้องยา / ห้อง OPD / บ้าน / ...)
   - วิชาชีพตัวละครหลัก (เภสัชกร / พยาบาล / แพทย์ / ...)
5. **เลือก อัตราส่วน + จำนวนภาพ** (1:1, 9:16, 16:9, ...)
6. **(option) กด "ดู prompt ก่อนสร้าง"** — แก้ prompt ได้
7. **กด "✨ สร้างแบบ → ส่งไป Flow"**
8. Flow tab เปิดขึ้น → กด Start ใน Flow → เลือกรูปนายแบบ
9. รอ Flow gen เสร็จ → ดาวน์โหลดรูป
10. (Optional) เพิ่มลง 📦 คลังสื่อ เพื่อรอโพสต์

### 5.2 📊 Infographic

**ใช้ทำอะไร:** สร้าง infographic ความรู้สุขภาพ

**ขั้นตอน:**
1. **พิมพ์หัวข้อ** เช่น "ยาความดัน 3 ข้อต้องระวัง"
2. **(Option) กด "🤖 AI ช่วยขยายเนื้อหา"** — AI จะค้นข้อมูลและเขียน outline ให้
3. **เลือก กลุ่มเป้าหมาย:** ประชาชน / พยาบาล / แพทย์ / เภสัชกร / HCP
4. **เลือก สไตล์ + ธีม:**
   - สไตล์ภาพ (Cartoon / Realistic / Pastel / Islamic / ...)
   - ธีม/พื้นหลัง (เว้นว่างได้ — AI จัดเอง)
5. **เลือก อัตราส่วน + จำนวน**
6. **กด "✨ สร้าง Infographic → ส่งไป Flow"**

### 5.3 🎬 วิดีโอ

**ใช้ทำอะไร:** สร้างคลิป 4 ฉากต่อเนื่อง (Hook → Problem → Solution → Closing)

**ขั้นตอน:**
1. **พิมพ์เนื้อหาเรื่อง** เช่น "อธิบายการกินยาความดัน เน้นต้องกินทุกวัน"
2. **(option) คีย์เวิร์ดสำคัญ** เช่น "Benicardine, ความดัน, ห้ามหยุดเอง"
3. **เลือก กลุ่มเป้าหมาย/คู่สนทนา**
4. **(option) Solo Mode** — ตัวละครหลักพูดต่อเนื่อง 4 บท (ไม่มีคู่สนทนา)
5. **เลือก ภาษา/สำเนียง:** ไทยกลาง / ไทยใต้ / มลายูปัตตานี
6. **เลือก เพศตัวละครหลัก + เพศคู่สนทนา**
7. **เลือก Visual DNA preset** — ใช้ตามรูปนายแบบที่จะแนบใน Flow
8. **เลือก สไตล์วิดีโอ + อัตราส่วน + จำนวนคลิป**
9. **กด "✨ AI สร้างบทพูด + อารมณ์ + มุมกล้อง (4 ฉาก)"**
10. AI จะสร้าง 4 ฉาก พร้อมบทพูด/อารมณ์/มุมกล้อง — แก้ไขได้
11. กดปุ่ม "ส่งฉากที่ X" ทีละฉาก → Flow tab เปิด → เลือกรูปนายแบบ → gen วิดีโอ

### 5.4 📦 คลังสื่อ (Clip Warehouse)

**ใช้ทำอะไร:** เก็บสื่อที่สร้างแล้ว รอ approve และโพสต์

**สิ่งที่เห็น:**
- **Stat bar 5 ช่อง:** รอ / อนุมัติ / นัด / โพสต์แล้ว / ล้มเหลว
- **Filter chips:** ทั้งหมด / รอ / อนุมัติ / นัด / โพสต์แล้ว
- **รายการสื่อ:** thumbnail + ชื่อ + ป้ายสถานะ + ปุ่ม action

**Action ต่อรายการ:**
- 👁️ **ดู** — preview รูป/วิดีโอ + caption
- 📘 **โพสต์ FB** — เปิด Facebook Composer + auto-fill + ให้ approve
- 🎵 **TikTok** — เปิด TikTok Studio (เฉพาะวิดีโอ)
- ⏰ **นัด** — ตั้งเวลาโพสต์อัตโนมัติ
- ⬇️ **ดาวน์โหลด** — save ไฟล์ลงเครื่อง
- 🗑️ **ลบ**

**ปุ่มล่าง:**
- 🧹 **ลบที่โพสต์แล้ว** — cleanup รายการ status = posted
- 🗑️ **ล้างทั้งคลัง** — ลบทุกอย่าง (ระวัง!)

> 💡 คลังเก็บได้สูงสุด 200 ชิ้น (รูป/วิดีโอ/เสียง) — เก็บใน IndexedDB ของ browser ไม่ต้องส่ง server

### 5.5 📅 ซีรีส์ (Story Series)

**ใช้ทำอะไร:** สร้างชุดความรู้ต่อเนื่องหลายตอน

**Templates พร้อมใช้ 7 แบบ:**

| Template | ตอน | เหมาะกับ |
|---|---|---|
| 💊 รู้จักยา 7 วัน | 7 | ยา 1 ตัว ลึก ครบทุกแง่มุม |
| 🩹 ดูแลตัวเองหลังผ่าตัด 5 วัน | 5 | คนไข้ที่เพิ่งกลับบ้าน |
| 🌬️ พ่นยา MDI ถูกวิธี 3 ตอน | 3 | สอน technique |
| 🌙 รอมฎอน + ยาเรื้อรัง | 4 | คนไข้มุสลิม |
| 🤰 ดูแลตัวเองรายเดือน 9 ตอน | 9 | หญิงตั้งครรภ์ |
| 👴 ผู้สูงอายุ + ยาหลายตัว 14 วัน | 14 | คนไข้ polypharmacy |
| 🦠 ใช้ยาฆ่าเชื้อให้ถูก 5 ตอน | 5 | AMR campaign |

**ขั้นตอน:**
1. **เลือก template** หรือใส่หัวข้อ custom
2. **ใส่ชื่อยา/หัวข้อ** เช่น "Metformin", "ความดันโลหิตสูง"
3. **เลือก กลุ่มเป้าหมาย + ภาษา**
4. **กด "✨ สร้างซีรีส์"**
5. AI จะสร้างเนื้อหาทุกตอนพร้อม:
   - Cover headline
   - เนื้อหาหลัก
   - Take-home message
   - Tease ตอนถัดไป
6. กด **"👁️ ดูเนื้อหา"** เพื่อ review
7. กด **"🚀 ตั้ง campaign"** เพื่อ schedule ทยอยโพสต์

### 5.6 ⏰ ตารางโพสต์ (Schedule Queue)

**ใช้ทำอะไร:** ดูคิวโพสต์ที่นัดไว้ + ประวัติ

**สิ่งที่เห็น:**
- 🟢 **คิวที่จะโพสต์** — เรียงตามเวลา
- 📜 **ประวัติ** — รายการที่ posted/failed/canceled

**Action:**
- ❌ **ยกเลิก** คิวที่ยังไม่ถึงเวลา

> 💡 เมื่อถึงเวลานัด — Chrome จะส่ง notification เตือนให้เปิด side panel มา approve โพสต์
> ⚠️ **Chrome ต้องเปิดอยู่** ขณะถึงเวลา — ไม่งั้น alarm ไม่ทำงาน

### 5.7 🎙️ Podcast

**ใช้ทำอะไร:** สร้างเสียง audio สื่อสุขภาพ — เหมาะกับ:
- 👴 ผู้สูงอายุที่อ่านไม่สะดวก
- 👁️‍🗨️ ผู้ป่วยตาบอด/สายตาเลือนราง
- 🚗 เปิดฟังตอนทำกับข้าว/ขับรถ
- 📲 กระจายผ่าน LINE OA / FB voice clip

**ขั้นตอน:**
1. **ใส่เนื้อหา** ในกล่อง textarea
2. **เลือก น้ำเสียง:**
   - 👩‍⚕️ เภสัชกรหญิงไทย (อ่อนโยน)
   - 👨‍⚕️ เภสัชกรชายไทย (น่าเชื่อถือ)
   - 👴 อ่านช้าๆ สำหรับผู้สูงอายุ
   - 🧸 เสียงอบอุ่นสำหรับเด็ก
   - 🇲🇾 หญิงมลายู
   - 🇬🇧 English clinical
3. **เลือก ความยาว:** 1 / 2 / 3 / 5 นาที
4. **เลือก วิธีสร้าง:**
   - **Browser TTS** (ฟรี) — เล่นได้แต่ไม่ได้ไฟล์
   - **OpenAI TTS** (มี API key) — ได้ไฟล์ MP3 คุณภาพดี
5. **เลือก กลุ่มเป้าหมาย**
6. **กด "🎙️ สร้าง Podcast"**
7. AI จะ:
   - แปลงเนื้อหาเป็นสคริปต์ podcast (intro/body/take-home/CTA)
   - สร้างไฟล์ MP3 (ถ้าเลือก OpenAI)
8. ฟัง preview → ดาวน์โหลด MP3 → upload ขึ้น LINE OA / FB

### 5.8 🛡️ ตรวจสอบ (Content Validator)

**ใช้ทำอะไร:** เช็คคำต้องห้ามก่อนโพสต์ — ป้องกันผิด พ.ร.บ. ยา + PDPA

**3 ระดับความรุนแรง:**

| ระดับ | ความหมาย | ตัวอย่าง |
|---|---|---|
| 🛑 BLOCK | ห้ามใช้เด็ดขาด — โพสต์ไม่ได้ | "หายขาด", "100%", "รักษามะเร็ง", เลขบัตรประชาชน |
| ⚠️ WARN | ควรหลีกเลี่ยง | "การันตี", "เห็นผลทันที", "ลดน้ำหนัก" |
| ℹ️ INFO | ข้อเสนอแนะ | "ซื้อได้ที่", "ราคาถูก" |

**ขั้นตอน:**
1. **วาง/พิมพ์ข้อความ** ที่จะตรวจ
2. **กด "🛡️ ตรวจสอบ"**
3. ผลลัพธ์จะแสดงเป็น:
   - ✅ เขียว — ไม่มีปัญหา
   - ⚠️ เหลือง — มีคำควรปรับ
   - 🛑 แดง — มีคำต้องห้าม (block)
4. **ถ้ามี BLOCK** — กด "✨ AI ช่วยแก้" → AI จะเขียนใหม่ให้ตามกฎ

**ดูรายการคำทั้งหมด:** กดที่ "ดูรายการคำทั้งหมด" — 49 คำ พร้อมเหตุผล

---

## 6. Workflow ตัวอย่าง

### Workflow 1: โพสต์ความรู้ยาวันละครั้ง (ขั้นพื้นฐาน)

```
1. แท็บ 📊 Infographic → พิมพ์หัวข้อ → AI gen → ส่งไป Flow
2. รอ Flow gen รูป → save รูป
3. แท็บ 🛡️ Validator → paste caption → ตรวจ → แก้ถ้ามี
4. แท็บ 📦 คลังสื่อ → เพิ่มรูป (ผ่าน UI ในอนาคต)
5. กด "📘 โพสต์ FB" → approve → โพสต์
```

### Workflow 2: Campaign 7 วัน (รู้จักยา 1 ตัว)

```
1. แท็บ 📅 ซีรีส์ → template "💊 รู้จักยา 7 วัน"
2. ใส่ "Metformin" → กลุ่ม "ประชาชน" → ภาษา "ไทย"
3. กด "✨ สร้างซีรีส์" → รอ AI gen 7 ตอน
4. กด "👁️ ดูเนื้อหา" → review ทุกตอน
5. กด "🚀 ตั้ง campaign" → เลือกเวลาเริ่ม (เช่น พรุ่งนี้ 9:00)
6. เลือกระยะห่าง 24 ชั่วโมง → confirm
7. ทุกวัน 9:00 Chrome จะเตือน → คุณเปิด side panel → approve → โพสต์
```

### Workflow 3: Podcast สำหรับผู้สูงอายุ (LINE OA)

```
1. แท็บ 🎙️ Podcast → ใส่เนื้อหา "การกินยาความดัน..."
2. น้ำเสียง: "👴 อ่านช้าๆ สำหรับผู้สูงอายุ"
3. ความยาว: 2 นาที → วิธี: OpenAI TTS
4. กลุ่ม: "ผู้สูงอายุ"
5. กด "🎙️ สร้าง Podcast"
6. AI gen script + MP3 → preview → ดาวน์โหลด
7. Upload MP3 ขึ้น LINE OA → ส่งให้ผู้ป่วย
```

### Workflow 4: เตือนภัย ADR เร่งด่วน

```
1. แท็บ 📊 Infographic → หัวข้อ "อาการแพ้ยา Allopurinol รุนแรง"
2. สไตล์: เตือนภัย → กลุ่ม: ประชาชน
3. AI gen → ส่งไป Flow → save รูป
4. แท็บ 🛡️ Validator → paste caption → ตรวจ
   (ระวัง: อย่าใช้คำว่า "อันตรายถึงชีวิต" บ่อยเกิน)
5. กด "📘 โพสต์ FB" ทันที (ไม่ schedule)
```

### Workflow 5: หลายภาษา (ไทย + มลายู สำหรับ จชต.)

```
1. แท็บ 🎬 วิดีโอ → ภาษา "มลายูปัตตานี"
2. ใส่เนื้อหา + คีย์เวิร์ด → AI gen 4 ฉาก
3. ส่งไป Flow ทีละฉาก → gen วิดีโอ
4. ดาวน์โหลด → เก็บคลัง
5. สร้างเวอร์ชันไทยใต้คู่กัน → โพสต์ทั้ง 2 ภาษา
```

---

## 7. คำถามที่พบบ่อย

### Q: ค่า API คิดยังไง?
**A:** ขึ้นกับ provider:
- **OpenAI gpt-4o-mini:** ~$0.15 ต่อ 1M tokens (≈ 750,000 คำ) — ถูก
- **OpenAI gpt-4o:** ~$5 ต่อ 1M tokens — แพง แต่ฉลาด
- **Gemini 2.5 Flash:** ฟรี 15 requests/min, 1500/day
- **Claude Haiku:** ~$0.25 ต่อ 1M tokens — สมดุล
- **OpenAI TTS:** $15 ต่อ 1M characters (≈ 60 ชม. เสียง) — ถูก

แนะนำเริ่มจาก **Gemini (ฟรี)** ก่อน

### Q: ปลอดภัยมั้ย? API key เก็บที่ไหน?
**A:** API key เก็บใน `chrome.storage.local` ของ browser คุณเท่านั้น **ไม่ส่งไปไหน**
- Extension นี้ไม่มี server ของผมเอง
- ทุก request ไปตรงจาก browser → OpenAI/Gemini/Claude
- ผมเห็น traffic ของคุณไม่ได้

### Q: รพ. อื่นเอาไปใช้ได้ไหม?
**A:** **ได้เลย — ไม่มี license** เปลี่ยน branding 5 ฟิลด์ใน Settings:
1. ชื่อ รพ.
2. กลุ่มงาน
3. เบอร์โทร
4. Hashtag
5. Disclaimer

ก็จะกลายเป็น extension ของ รพ. คุณ

### Q: ใช้ในเครื่อง offline ได้ไหม?
**A:** **ไม่ได้** — ทุก feature ที่ใช้ AI ต้องมี internet
- ตัว extension เอง offline ได้
- ฟีเจอร์ Validator + Disclaimer + Cover styles offline ได้
- แต่ AI gen / Flow / TTS ต้อง internet

### Q: ทำไม Schedule alarm ไม่ทำงาน?
**A:** เพราะ:
1. Chrome ต้องเปิดอยู่ขณะถึงเวลา (alarm จะ trigger เฉพาะ Chrome alive)
2. ต้องอนุญาต notification ตอน install ครั้งแรก
3. ลอง reload extension ที่ `chrome://extensions`

### Q: Facebook auto-post แล้วโดน ban ไหม?
**A:** **ความเสี่ยงต่ำมาก** เพราะ:
- ใช้ humanize delay พิมพ์เหมือนคน
- ต้อง approve ก่อนโพสต์ทุกครั้ง (default ON)
- โพสต์เพจของ รพ. เอง (ไม่ใช่ spam ไปหน้าคนอื่น)
- ปริมาณน้อย (1-7 โพสต์/วัน)

แต่ระวัง: **ห้ามปิด Approval Mode** + **ห้ามใช้ schedule ตัวเดียวกัน โพสต์เกิน 10 ครั้ง/วัน**

### Q: ทำงานบน Firefox/Edge ได้ไหม?
**A:** ลองได้แต่ไม่รับประกัน — extension ใช้ Manifest V3 + Chrome-specific API
- **Edge:** น่าจะใช้ได้ (engine เดียวกับ Chrome)
- **Firefox:** อาจมีฟีเจอร์บางอันใช้ไม่ได้ (chrome.sidePanel)

### Q: ผู้พัฒนาคือใคร?
**A:** Meen (MeenRx) — เภสัชกร รพ.รือเสาะ จ.นราธิวาส
- GitHub: https://github.com/meenrx/RH-pharma

---

## 8. Troubleshooting

### ❌ ปัญหา: Side panel เปิดขึ้นแต่ว่างเปล่า

**สาเหตุ:** Script ไม่โหลดสำเร็จ

**แก้:**
1. คลิกขวาบน side panel → **Inspect** → tab **Console**
2. ดู error สีแดง
3. ที่ `chrome://extensions` → กด 🔄 Reload ที่ RH Pharma
4. ปิด-เปิด side panel ใหม่
5. ถ้ายังไม่ได้ → ลบ extension แล้ว Load unpacked ใหม่

### ❌ ปัญหา: AI gen ไม่ได้

**สาเหตุ:** API key ผิด/หมดเครดิต/network

**แก้:**
1. Settings → tab provider → กด **เช็คสถานะ**
2. ถ้า ❌ — ตรวจสอบ:
   - Key copy-paste มาถูกไหม (กัน whitespace/อักษรพิเศษ)
   - บัญชี OpenAI มี credit?
   - VPN/proxy block?
3. ลอง provider อื่น

### ❌ ปัญหา: Validator block ผิด

**สาเหตุ:** คำในรายการ banned words ตรงกับคำที่ใช้บริบทถูกต้อง

**แก้:** ตอนนี้ extension ไม่มี UI override — ต้องแก้ caption ให้เลี่ยงคำนั้น
หรือไปแก้ในไฟล์ `popup/content-validator.js` ลบ rule ที่ไม่ต้องการ

### ❌ ปัญหา: Facebook auto-post หาปุ่ม Post ไม่เจอ

**สาเหตุ:** Facebook UI เปลี่ยน หรือยังไม่ login

**แก้:**
1. ตรวจว่า login Facebook แล้ว
2. เปิดเพจที่จะโพสต์ใน tab อื่นก่อน
3. ลองโพสต์ด้วยมือใน Composer ครั้งหนึ่ง เพื่อให้ tab อยู่ใน state ที่ถูกต้อง
4. ถ้ายังไม่ได้ → คลังสื่อ → **⬇️ ดาวน์โหลด** แล้วโพสต์มือ

### ❌ ปัญหา: คลังสื่อหายหมด

**สาเหตุ:** ลบ extension หรือ Clear browsing data (IndexedDB)

**แก้:** น่าเสียดาย — สื่อหายไป backup ไม่ได้ ระวัง:
- อย่ากด "ล้างทั้งคลัง" ถ้าไม่ได้ตั้งใจ
- ระยะยาว → ดาวน์โหลดไฟล์เก็บที่เครื่องไว้

### ❌ ปัญหา: Podcast ไม่ได้ยินเสียง (Browser TTS)

**สาเหตุ:** Browser ไม่รองรับเสียงไทย หรือเสียงปิดอยู่

**แก้:**
- ลอง Chrome (รองรับดีสุด)
- เช็คเสียงระบบ Windows ไม่ปิด
- ลอง provider OpenAI TTS แทน — ได้ไฟล์ MP3 จริง

---

## 9. สำหรับ Developer

### โครงสร้างโฟลเดอร์
```
rh-pharma/
├── manifest.json                    # Chrome extension manifest v3
├── README.md
├── UPGRADE_v0.10.0.md
├── MANUAL_th.md                     # ← คู่มือนี้
├── assets/                          # Icons + logo
├── background/
│   └── service-worker.js            # Background service worker
├── content/                         # Content scripts (inject ในหน้าเว็บ)
│   ├── blur-overlay.js              # เบลอหน้าจอตอนสาธิต
│   ├── gemini-autofill.js           # Auto-fill Gemini
│   ├── flow-autofill.js             # Auto-fill Google Flow
│   ├── facebook-autopost.js         # Auto-post FB Page
│   └── tiktok-studio-autopost.js    # Auto-post TikTok Studio
└── popup/                           # Side panel UI
    ├── sidepanel.html               # HTML หลัก
    ├── sidepanel.css                # Style เดิม
    ├── v10-ui.css                   # Style ของแท็บใหม่
    ├── sidepanel.js                 # Logic เดิม (v0.9.x)
    ├── sidepanel-v10.js             # UI ของแท็บใหม่
    ├── ai-helper.js                 # Wrapper เรียก OpenAI/Gemini/Claude
    ├── templates.js                 # Templates เนื้อหา
    ├── model-options.js             # Style/Camera/Background presets
    ├── clip-warehouse.js            # IndexedDB คลังสื่อ
    ├── content-validator.js         # เช็คคำต้องห้าม
    ├── disclaimer-injector.js       # แทรก disclaimer + branding
    ├── pharma-prompt-library.js     # Drug class prompts
    ├── cover-text-styles.js         # 10 สไตล์ headline
    ├── story-series.js              # Series templates + generator
    ├── schedule-queue.js            # chrome.alarms scheduler
    ├── podcast-generator.js         # Web Speech + OpenAI TTS
    ├── humanize-delay.js            # Mini anti-detect
    └── rh-toolbox.js                # Integration layer
```

### API ใช้งานผ่าน console
เปิด DevTools ของ side panel — เรียกได้:
```js
// Validator
ContentValidator.validate('text')           // เช็ค
ContentValidator.suggestRewrite(text, issues) // AI แก้
ContentValidator.formatReport(result)       // format ข้อความ

// Disclaimer
DisclaimerInjector.inject(text, { category, language, settings })
DisclaimerInjector.detectCategory(text)
DisclaimerInjector.buildBranding(settings, lang)

// Warehouse
ClipWarehouse.addItem({ blob, mediaType, ... })
ClipWarehouse.getAll({ status: 'waiting' })
ClipWarehouse.getStats()

// Series
StorySeries.generateSeries({ templateId, drugName, audience, language })
StorySeries.saveSeries(series)
StorySeries.loadAllSeries()

// Schedule
ScheduleQueue.schedule({ clipId, target, scheduledAt })
ScheduleQueue.listUpcoming()
ScheduleQueue.cancel(queueId)

// Podcast
PodcastGenerator.generatePodcast(content, { voicePresetId, method, ... })

// Toolbox (pipeline)
RHToolbox.preparePost({ caption, category, language })
RHToolbox.publishFlow({ blob, caption, mediaType, target, scheduleAt })
RHToolbox.publishSeriesAsCampaign({ series, startAt, intervalHours, target })
RHToolbox.quickTest()    // self-test
```

### Storage Keys
```
chrome.storage.local
├── rhPharmaSettings        # ค่า settings ทั้งหมด
├── rhPharmaTopics          # หัวข้อที่สร้าง
├── rhPharmaPosts           # โพสต์
├── rhPharmaSeries          # ซีรีส์ที่ generate
└── rhPharmaScheduledPosts  # คิวตารางโพสต์

IndexedDB: RHPharmaWarehouse
└── store "media"           # สื่อในคลัง (รูป/วิดีโอ/เสียง blob)
```

### ปรับแต่งเพิ่มเติม

**เพิ่ม banned word:**
แก้ `popup/content-validator.js` — array `BANNED_WORDS`:
```js
{ word: 'คำที่ต้องการเพิ่ม', level: 'WARN', reason: 'เหตุผล' }
```

**เพิ่ม series template:**
แก้ `popup/story-series.js` — object `SERIES_TEMPLATES`:
```js
'my-template-id': {
  label: '🎯 ชื่อ template',
  episodes: 5,
  arc: [
    { day: 1, theme: 'ตอนที่ 1', focus: 'ประเด็น' },
    ...
  ]
}
```

**เพิ่ม drug class:**
แก้ `popup/pharma-prompt-library.js` — object `DRUG_CLASSES`

**เพิ่ม voice preset:**
แก้ `popup/podcast-generator.js` — object `VOICE_PRESETS`

### Git workflow
```bash
git clone https://github.com/meenrx/RH-pharma.git
cd RH-pharma

# แก้โค้ด
git add .
git commit -m "เพิ่ม X"
git push

# Pull เครื่องอื่น
git pull
# → Reload extension ที่ chrome://extensions
```

---

## 📝 License & Credits

**License:** เปิดให้ใช้ฟรี ไม่มี license restriction
**ผู้พัฒนา:** Meen (MeenRx) — กลุ่มงานเภสัชกรรม รพ.รือเสาะ
**Repo:** https://github.com/meenrx/RH-pharma
**Help with:** Claude Opus 4.7 (1M context)

---

**Made with 💙 by MeenRx** · รพ.รือเสาะ · ใครเอาไปใช้ก็ได้
