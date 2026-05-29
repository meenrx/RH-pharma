# 💊 RH Pharma — Sprint 1.1: Foundation + Branding

> AI สร้างสื่อให้ความรู้สุขภาพ + โพสต์ลงเพจอัตโนมัติ
> โดย กลุ่มงานเภสัชกรรม รพ.รือเสาะ

**เวอร์ชัน:** 0.1.1
**สถานะ:** Foundation + Branding รพ.รือเสาะ + Dark Mode

---

## ✨ สิ่งใหม่ใน v0.1.1

### 🎨 Logo รพ.รือเสาะของจริง
- Icon เป็นบ้าน + RH + กากบาท สีทอง-ฟ้า
- Header แสดงโลโก้บนพื้นขาว (กลมๆ)
- Crop อัตโนมัติเฉพาะส่วน icon ไม่มีตัวอักษร "โรงพยาบาล" หลุดเข้ามา

### 🌙 Dark Mode สมบูรณ์
- **3 โหมด:** Light / Dark / Auto (ตามระบบ)
- ตั้งค่าได้ที่ Settings → 🎨 ธีม
- Auto mode สลับอัตโนมัติเมื่อระบบเปลี่ยนโหมดมืด
- สีทุกตัวปรับให้อ่านง่ายในทั้ง 2 โหมด

### 🎨 Color Palette ใหม่
ใช้สีจากโลโก้ รพ.รือเสาะ:
- **น้ำตาลทอง:** `#B8975B` (border-left ของหัวข้อ, "MeenRx" credit)
- **ฟ้า:** `#4A8FB5` (header, primary buttons, accents)
- **ฟ้าเข้ม:** `#2E6E92` (gradient หัวเรื่อง, modal header)

### ✍️ "Made with 💙 by MeenRx"
- ที่ footer ทุกหน้า
- ตัวอักษร MeenRx เป็นสีทอง

---

## ✅ Features Sprint 1 (รวมทั้งหมด)

### UI พื้นฐาน
- ✅ Side Panel เปิดทางขวาของ Chrome
- ✅ Header สีฟ้า + โลโก้ รพ.รือเสาะของจริง
- ✅ Toggle "ไม่ใช้ AI / ใช้ AI"
- ✅ 3 แท็บหลัก: 📚 หัวข้อ | 🎨 สร้างสื่อ | 📤 โพสต์
- ✅ Sub-tabs: รูปเดี่ยว / วิดีโอ / รูป+วิดีโอ
- ✅ Footer "Made with 💙 by **MeenRx**"

### Settings
- ✅ 🎨 Theme: Light / Dark / Auto
- ✅ 🤖 AI Provider: OpenAI + Gemini (ใส่ key, เช็คสถานะ, ลบ)
- ✅ 🔒 Safety: Approve mode / Validator / Disclaimer
- ✅ 🏥 Branding: ชื่อ รพ./กลุ่มงาน/Hashtag/Disclaimer
- ✅ ⚠️ Reset all data

### Topic Manager
- ✅ เพิ่มหัวข้อ + audience (5 กลุ่ม) + หมวดหมู่
- ✅ ลบหัวข้อทีละอัน / ล้างทั้งหมด
- ✅ Export / Import JSON

---

## 📦 โครงสร้างไฟล์

```
rh-pharma/
├── manifest.json
├── README.md
├── assets/
│   ├── icon16.png       ← icon Chrome
│   ├── icon48.png
│   ├── icon128.png
│   ├── logo-icon.png    ← icon ใน header (โปร่งใส)
│   └── logo-full.png    ← โลโก้เต็ม (เผื่อใช้ใน infographic Sprint 3)
├── background/
│   └── service-worker.js
├── popup/
│   ├── sidepanel.html
│   ├── sidepanel.css    ← มี Light + Dark theme
│   └── sidepanel.js     ← มี applyTheme()
├── content/    (Sprint 5+)
└── config/     (Sprint 2+)
```

---

## 🛠️ วิธีติดตั้ง

1. **ดาวน์โหลด ZIP** → แตกออก
2. เปิด `chrome://extensions` → เปิด **Developer mode**
3. **Load unpacked** → เลือกโฟลเดอร์ `rh-pharma`
4. คลิกไอคอน RH Pharma บน toolbar → Side Panel เปิด

### ถ้าเคยติดตั้ง v0.1.0 อยู่แล้ว
- ที่ `chrome://extensions` กด 🔄 รีเฟรชที่ extension
- หรือลบเก่าก่อนแล้ว Load unpacked ใหม่

---

## 🧪 ทดสอบ Dark Mode

1. คลิก ⚙️ มุมขวาบน
2. ส่วน "🎨 ธีม" → กด **Dark**
3. UI จะสลับเป็นพื้นหลังน้ำเงินเข้ม + ตัวอักษรสว่าง
4. กด **Light** → กลับมาสว่าง
5. กด **Auto** → ตามโหมดของ Windows/Mac
   - ลองเปลี่ยน System theme บน Windows: Settings → Personalization → Colors → Dark
   - Side Panel จะสลับให้ทันที!

---

## 🎨 Color Tokens

ใน CSS มี variables ครบเซ็ต ใช้ในไฟล์ template ของ infographic ได้:

```css
/* Brand */
--brand-gold: #B8975B
--brand-blue: #4A8FB5

/* Adaptive */
--bg-card           (white / dark blue)
--text-primary      (dark / light)
--border-color      (light gray / dark border)
```

---

## 🐛 Debug

### Side Panel
- คลิกขวาที่ panel → "Inspect"
- ดู Console log ขึ้นต้นด้วย `[RH Pharma]`

### Service Worker
- `chrome://extensions` → คลิก "service worker" ใต้ extension

### Reset
- Settings → Danger Zone → 🔄 รีเซ็ตข้อมูลทั้งหมด

---

## ➡️ Sprint ถัดไป

| Sprint | สิ่งที่จะเพิ่ม |
|---|---|
| **Sprint 2** | เชื่อม OpenAI/Gemini API จริง — สร้างเนื้อหาตาม audience |
| **Sprint 3** | Infographic Engine (HTML→PNG) + 5 templates |
| **Sprint 4** | Carousel + Video slideshow |
| **Sprint 5** | Facebook Auto-Post (Content Script) |
| **Sprint 6** | Schedule Queue + Approval Flow |
| **Sprint 7** | TikTok Integration |
| **Sprint 8** | Polish + Anti-Detect + Validator |

---

**Made with 💙 by MeenRx** · กลุ่มงานเภสัชกรรม รพ.รือเสาะ
