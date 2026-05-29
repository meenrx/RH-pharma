// =====================================================
// RH Pharma — Model Creation Options (สร้างแบบ)
// =====================================================
// Templates สำหรับ dropdown ทั้งหมดในหน้า "สร้างแบบ"
// บริบท: บุคลากรทางการแพทย์ + รพ.รือเสาะ (ผู้ป่วยมุสลิม จ.นราธิวาส)
// =====================================================

(function () {
  'use strict';

  // ===== สไตล์รูปภาพ =====
  const IMAGE_STYLES = [
    // ที่มี (6)
    { id: 'realistic',     icon: '📷', label: 'Realistic photo (ภาพถ่ายจริง)',
      promptEn: 'photorealistic photograph, natural lighting, high detail, sharp focus',
      promptTh: 'ภาพถ่ายเสมือนจริง แสงธรรมชาติ คมชัด รายละเอียดสูง' },
    { id: 'cinematic',     icon: '🎬', label: 'Cinematic (สไตล์ภาพยนตร์)',
      promptEn: 'cinematic photograph, dramatic lighting, shallow depth of field, film grain',
      promptTh: 'ภาพสไตล์ภาพยนตร์ แสงมีมิติ โฟกัสตื้น มีเกรนฟิล์มเล็กน้อย' },
    { id: 'soft_warm',     icon: '☀️', label: 'Soft & warm tone (โทนอุ่น สบายตา)',
      promptEn: 'soft warm tone, golden hour lighting, gentle and inviting mood',
      promptTh: 'โทนอุ่น แสงทอง บรรยากาศเป็นมิตร อบอุ่น' },
    { id: 'professional',  icon: '💼', label: 'Professional / Clinical (ดูทางการ)',
      promptEn: 'clean professional clinical photography, bright even lighting, hospital quality',
      promptTh: 'ภาพทางการ สะอาด แสงเสมอ คุณภาพระดับโรงพยาบาล' },
    { id: 'illustration',  icon: '🎨', label: 'Illustration / Cartoon (วาดการ์ตูน)',
      promptEn: 'friendly flat illustration style, vibrant colors, clean lines, infographic-like',
      promptTh: 'ภาพวาดสไตล์การ์ตูน เส้นสะอาด สีสดใส น่ารัก' },
    { id: 'documentary',   icon: '📺', label: 'Documentary (สารคดี)',
      promptEn: 'documentary photography style, candid, natural, journalistic',
      promptTh: 'สไตล์สารคดี เป็นธรรมชาติ ไม่จัดฉาก' },
    // 🆕 v0.9.20: 12 ใหม่
    { id: 'hd_4k',         icon: '✨', label: 'HD Photorealistic 4K (คมชัดสูง)',
      promptEn: 'ultra high-definition 4K photorealistic image, exceptional sharpness, vivid colors, professional grade',
      promptTh: 'ภาพ 4K คมชัดสูงระดับมืออาชีพ สีสดเข้ม' },
    { id: 'movie_poster',  group: 'media', icon: '🎞️', label: 'Movie poster (โปสเตอร์หนัง)',
      promptEn: 'epic movie poster style, dramatic composition, bold lighting, cinematic atmosphere',
      promptTh: 'สไตล์โปสเตอร์หนัง การจัดวางดราม่า แสงโดดเด่น บรรยากาศภาพยนตร์' },
    { id: 'editorial',     group: 'media', icon: '📰', label: 'Editorial magazine (นิตยสาร)',
      promptEn: 'editorial magazine photography, polished, sophisticated composition, fashion magazine quality',
      promptTh: 'สไตล์นิตยสาร เรียบหรู การจัดวางมีระดับ' },
    { id: 'social_media',  group: 'media', icon: '📱', label: 'Social media (Instagram look)',
      promptEn: 'Instagram-optimized photography, trendy aesthetic, vibrant social media look',
      promptTh: 'ภาพสำหรับโซเชียลมีเดีย สไตล์ Instagram ทันสมัย' },
    { id: 'pastel_modern', icon: '🌸', label: 'Pastel modern (โทนพาสเทล)',
      promptEn: 'soft pastel color palette, modern minimalist aesthetic, dreamy soft mood',
      promptTh: 'โทนสีพาสเทลนุ่มนวล มินิมอล บรรยากาศนุ่มฟุ้ง' },
    { id: 'thai_aesthetic',icon: '🇹🇭', label: 'Thai cultural aesthetic',
      promptEn: 'Thai cultural visual aesthetic with traditional motifs, warm earth tones, respectful tone',
      promptTh: 'สไตล์ความเป็นไทย ลายเส้นไทย โทนสีดินเผา ดูสุภาพ' },
    { id: 'islamic_art',   icon: '☪️', label: 'Islamic geometric art',
      promptEn: 'Islamic geometric art style, intricate patterns, modest aesthetic, refined design',
      promptTh: 'สไตล์อิสลาม ลายเรขาคณิต ดูสุภาพ มีระดับ' },
    { id: 'wellness',      icon: '🌿', label: 'Wellness lifestyle',
      promptEn: 'wellness lifestyle photography, natural and healthy mood, soft greenery, calm atmosphere',
      promptTh: 'สไตล์ wellness ชีวิตสุขภาพดี โทนธรรมชาติ บรรยากาศสงบ' },
    { id: 'anime_health',  icon: '🎌', label: 'Anime healthcare style',
      promptEn: 'Japanese anime art style with healthcare theme, friendly characters, cel-shaded look',
      promptTh: 'สไตล์อนิเมะญี่ปุ่นธีมสุขภาพ ตัวละครเป็นมิตร' },
    { id: 'kawaii',        icon: '🐤', label: 'Cute kawaii (สำหรับเด็ก)',
      promptEn: 'cute kawaii cartoon style, child-friendly, rounded shapes, bright happy colors',
      promptTh: 'สไตล์การ์ตูนน่ารัก kawaii สำหรับเด็ก รูปทรงโค้งมน สีสดใส' },
    { id: 'theatrical',    group: 'art', icon: '🎭', label: 'Theatrical dramatic',
      promptEn: 'theatrical dramatic lighting, stage-like composition, expressive character moment',
      promptTh: 'แสงดราม่าแบบละครเวที การจัดวางสไตล์เวที' },
    { id: 'photojournalism', group: 'media', icon: '📸', label: 'Photojournalism',
      promptEn: 'photojournalism style, candid moment, real-life storytelling, news-quality',
      promptTh: 'สไตล์ภาพข่าว/สารคดี เก็บโมเมนต์จริง คุณภาพระดับสื่อ' },
    { id: 'botanical',     icon: '🌱', label: 'Soft botanical aesthetic',
      promptEn: 'soft botanical aesthetic with plant elements, natural greenery, calm zen mood',
      promptTh: 'สไตล์ botanical อ่อนโยน มีต้นไม้ ใบไม้ ความเขียว สงบ' }
  ];

  // ===== มุมกล้อง =====
  const CAMERA_ANGLES = [
    { id: 'closeup',     icon: '👤', label: 'Close-up (ใบหน้าใกล้)',
      promptEn: 'close-up shot, head and shoulders framing',
      promptTh: 'มุมใกล้ เห็นใบหน้าและไหล่' },
    { id: 'half_body',   icon: '🧍', label: 'ครึ่งตัว (Half-body)',
      promptEn: 'half-body shot, waist-up framing',
      promptTh: 'มุมครึ่งตัว เห็นจากเอวขึ้นไป' },
    { id: 'knee_up',     icon: '🦵', label: 'ครึ่งตัวถึงเข่า (Knee-up)',
      promptEn: 'knee-up shot, three-quarter framing',
      promptTh: 'มุมครึ่งตัวถึงเข่า' },
    { id: 'full_body',   icon: '🚶', label: 'เต็มตัว (Full-body)',
      promptEn: 'full body shot, head to toe visible',
      promptTh: 'มุมเต็มตัว เห็นตั้งแต่หัวจรดเท้า' },
    { id: 'wide',        icon: '👥', label: 'Wide shot (ฉากกว้าง)',
      promptEn: 'wide establishing shot, full scene visible with environment',
      promptTh: 'มุมกว้าง เห็นบรรยากาศโดยรอบ' },
    { id: 'over_shoulder', icon: '📐', label: 'Over-the-shoulder (มุมคู่สนทนา)',
      promptEn: 'over-the-shoulder shot from behind the listener',
      promptTh: 'มุมข้ามไหล่ของคู่สนทนา' }
  ];

  // ===== สไตล์พื้นหลัง =====
  const BACKGROUNDS = [
    // ที่มี (7)
    { id: 'pharmacy',  icon: '💊', label: 'ห้องยา รพ.รือเสาะ (Pharmacy counter)',
      promptEn: 'Rueso Hospital pharmacy counter, shelves of medicines in background, bright clinical lighting, Thai community hospital',
      promptTh: 'เคาน์เตอร์ห้องจ่ายยา รพ.รือเสาะ ชั้นวางยาด้านหลัง แสงสว่างจ้าแบบโรงพยาบาลชุมชน' },
    { id: 'opd',       icon: '🏥', label: 'OPD / ห้องตรวจผู้ป่วย',
      promptEn: 'outpatient clinic examination room, examination bed, medical equipment, soft daylight',
      promptTh: 'ห้องตรวจผู้ป่วยนอก เตียงตรวจ อุปกรณ์การแพทย์ แสงนวล' },
    { id: 'ward',      icon: '🛏️', label: 'Ward / ห้องผู้ป่วยใน',
      promptEn: 'hospital inpatient ward, patient bed, IV stand, calm clinical environment',
      promptTh: 'หอผู้ป่วยใน เตียงคนไข้ ขาแขวนน้ำเกลือ บรรยากาศโรงพยาบาล' },
    { id: 'home',      icon: '🏠', label: 'บ้าน / ที่อยู่อาศัย',
      promptEn: 'cozy home interior, living room, warm domestic atmosphere',
      promptTh: 'ภายในบ้าน ห้องนั่งเล่น บรรยากาศอบอุ่นแบบครอบครัว' },
    { id: 'mosque',    icon: '🕌', label: 'มัสยิด / ชุมชนมุสลิม',
      promptEn: 'Thai-Malay Muslim community setting near a mosque, southern Thailand village atmosphere',
      promptTh: 'บรรยากาศชุมชนมุสลิมใกล้มัสยิด หมู่บ้านไทยมลายู ภาคใต้' },
    { id: 'studio',    icon: '🎨', label: 'Plain studio (พื้นเรียบ)',
      promptEn: 'plain solid color studio backdrop, minimalist, focus on subject',
      promptTh: 'พื้นหลังสตูดิโอสีเรียบ มินิมอล เน้นตัวบุคคล' },
    { id: 'outdoor',   icon: '🌿', label: 'Nature / outdoor',
      promptEn: 'natural outdoor setting, soft daylight, green foliage',
      promptTh: 'กลางแจ้ง บรรยากาศเป็นธรรมชาติ แสงนวล มีต้นไม้' },
    // 🆕 v0.9.20: 13 ใหม่
    { id: 'er',        icon: '🚑', label: 'ห้องฉุกเฉิน (ER)',
      promptEn: 'hospital emergency room with monitors, urgent atmosphere, bright lights',
      promptTh: 'ห้องฉุกเฉิน ER มีจอภาพ บรรยากาศเร่งด่วน แสงสว่างจ้า' },
    { id: 'icu',       icon: '💉', label: 'ICU / ห้องผู้ป่วยวิกฤต',
      promptEn: 'intensive care unit with ventilators, monitors, sterile clinical environment',
      promptTh: 'ห้องผู้ป่วยวิกฤต ICU มีเครื่องช่วยหายใจ จอภาพ บรรยากาศปลอดเชื้อ' },
    { id: 'lab',       icon: '🧪', label: 'ห้องแล็บ / Compounding',
      promptEn: 'pharmaceutical laboratory with glassware, fume hood, lab benches, scientific atmosphere',
      promptTh: 'ห้องปฏิบัติการเภสัช เครื่องแก้ว ตู้ดูดควัน บรรยากาศวิทยาศาสตร์' },
    { id: 'conference', icon: '📚', label: 'ห้องประชุม/อบรม',
      promptEn: 'conference or training room with projector screen, chairs in rows, professional meeting setting',
      promptTh: 'ห้องประชุม/อบรม จอ projector เก้าอี้เป็นแถว บรรยากาศประชุม' },
    { id: 'consultation_room', icon: '🪟', label: 'ห้องให้คำปรึกษา',
      promptEn: 'private pharmacy consultation room with a small desk, two chairs, warm lighting',
      promptTh: 'ห้องให้คำปรึกษาส่วนตัว โต๊ะเล็ก เก้าอี้สองตัว แสงนุ่ม' },
    { id: 'hallway',   icon: '🚪', label: 'ทางเดินโรงพยาบาล',
      promptEn: 'long hospital corridor with patient room doors, fluorescent lighting, clinical atmosphere',
      promptTh: 'ทางเดินยาวในโรงพยาบาล ประตูห้องคนไข้ แสงนีออน บรรยากาศคลินิก' },
    { id: 'community_drugstore', icon: '🏪', label: 'ร้านยาชุมชน',
      promptEn: 'small community pharmacy storefront with shelves of OTC medicines, friendly local atmosphere',
      promptTh: 'ร้านยาชุมชนเล็กๆ ชั้นวางยาทั่วไป บรรยากาศเป็นกันเอง' },
    { id: 'rural_clinic', icon: '🌾', label: 'คลินิกชนบท / รพ.สต.',
      promptEn: 'rural sub-district health promoting hospital, modest clinic in countryside',
      promptTh: 'รพ.สต. คลินิกชนบทเล็กๆ ในต่างจังหวัด' },
    { id: 'school',    icon: '🏫', label: 'โรงเรียน (อบรมนักเรียน)',
      promptEn: 'school classroom or hall, students seated, educational outreach setting',
      promptTh: 'ห้องเรียน/หอประชุมโรงเรียน นักเรียนนั่งฟัง บรรยากาศอบรม' },
    { id: 'clinic_thai', icon: '🌅', label: 'คลินิกสไตล์ไทย',
      promptEn: 'modern Thai-style clinic with traditional decorative elements, warm tones',
      promptTh: 'คลินิกสไตล์ไทยทันสมัย มีของตกแต่งไทย โทนอบอุ่น' },
    { id: 'office',    icon: '💼', label: 'ออฟฟิศ / ห้องทำงาน',
      promptEn: 'modern office with desk, computer, professional workspace',
      promptTh: 'ออฟฟิศ/ห้องทำงานทันสมัย โต๊ะ คอมพิวเตอร์ บรรยากาศมืออาชีพ' },
    { id: 'kitchen',   icon: '🍳', label: 'ห้องครัวบ้าน',
      promptEn: 'home kitchen interior, daily life setting, taking medicine context',
      promptTh: 'ห้องครัวภายในบ้าน บรรยากาศชีวิตประจำวัน เกี่ยวข้องกับการกินยา' },
    { id: 'bedroom',   icon: '🛏️', label: 'ห้องนอน',
      promptEn: 'home bedroom interior, calm domestic setting, taking bedtime medication',
      promptTh: 'ห้องนอนภายในบ้าน บรรยากาศสงบ เกี่ยวข้องกับยาก่อนนอน' },
    { id: 'park',      icon: '🌳', label: 'สวนสาธารณะ',
      promptEn: 'public park with green trees, walking path, daylight outdoor wellness setting',
      promptTh: 'สวนสาธารณะ ต้นไม้เขียว ทางเดิน บรรยากาศกลางแจ้งดีต่อสุขภาพ' }
  ];

  // ===== 🆕 v0.9.21: ตำแหน่งของสิ่งที่จะแนะนำในเฟรม (25 ตัว, 7 groups) =====
  // group: 'in_hand' | 'on_surface' | 'on_person' | 'on_wall' | 'in_container' | 'composition' | 'none'
  const ITEM_POSITIONS = [
    // 🤲 ในมือตัวละคร (5)
    { id: 'hold_show', group: 'in_hand', icon: '🤲', label: 'ถือชูในมือ (eye-level)',
      promptEn: 'character holding the item up clearly visible at eye-level to the camera',
      promptTh: 'ตัวละครถือสิ่งของชูระดับสายตาให้กล้องเห็นชัด' },
    { id: 'point_at_item', group: 'in_hand', icon: '👉', label: 'ชี้ไปที่สิ่งของ',
      promptEn: 'character pointing at the item while explaining its purpose',
      promptTh: 'ตัวละครชี้ไปที่สิ่งของขณะอธิบาย' },
    { id: 'hand_to_partner', group: 'in_hand', icon: '🤝', label: 'ส่งให้คู่สนทนา',
      promptEn: 'main character handing the item to the partner with both hands',
      promptTh: 'ส่งให้คู่สนทนาด้วยสองมือ' },
    { id: 'hold_close', group: 'in_hand', icon: '🤏', label: 'ถือใกล้กล้อง (close to camera)',
      promptEn: 'item held close to the camera in hand for clear visibility',
      promptTh: 'ถือสิ่งของใกล้กล้อง เห็นรายละเอียดชัด' },
    { id: 'read_label_close', group: 'in_hand', icon: '🔍', label: 'อ่านฉลาก/รายละเอียดใกล้',
      promptEn: 'item label or details examined closely in hand',
      promptTh: 'ฉลาก/รายละเอียดสิ่งของถูกตรวจสอบใกล้ๆ' },

    // 📋 บนพื้นผิว (4)
    { id: 'on_counter', group: 'on_surface', icon: '📋', label: 'วางบนเคาน์เตอร์/โต๊ะหน้า',
      promptEn: 'item placed on the counter or front desk in foreground',
      promptTh: 'สิ่งของวางบนเคาน์เตอร์/โต๊ะด้านหน้า' },
    { id: 'on_tray', group: 'on_surface', icon: '📦', label: 'วางบนถาด',
      promptEn: 'items arranged neatly on a tray',
      promptTh: 'สิ่งของจัดเรียงบนถาด' },
    { id: 'beside_bed', group: 'on_surface', icon: '🛏️', label: 'วางข้างเตียงคนไข้',
      promptEn: 'item placed on the bedside table next to a patient bed',
      promptTh: 'สิ่งของวางบนโต๊ะข้างเตียง' },
    { id: 'in_glass_cabinet', group: 'on_surface', icon: '🪟', label: 'ในตู้กระจก/ตู้ยา',
      promptEn: 'items displayed inside a glass cabinet or medicine cabinet',
      promptTh: 'สิ่งของอยู่ในตู้กระจก/ตู้ยา' },

    // 👤 บนผู้คน/ใช้กับร่างกาย (2)
    { id: 'point_body_part', group: 'on_person', icon: '👤', label: 'ชี้บริเวณร่างกาย',
      promptEn: 'character pointing at a specific body part to indicate where the item applies',
      promptTh: 'ชี้บริเวณร่างกายที่เกี่ยวข้องกับการใช้สิ่งของ' },
    { id: 'demonstrate_use', group: 'on_person', icon: '🏥', label: 'สาธิตการใช้กับร่างกาย',
      promptEn: 'demonstrating how to use the item on the body (proper application)',
      promptTh: 'สาธิตวิธีใช้สิ่งของกับร่างกาย' },

    // 🖼️ บนผนัง/พื้นหลัง (3)
    { id: 'on_wall_poster', group: 'on_wall', icon: '🖼️', label: 'Poster/แผ่นพับติดผนัง',
      promptEn: 'a poster or pamphlet about the item visible on the wall in background',
      promptTh: 'โปสเตอร์/แผ่นพับเกี่ยวกับสิ่งของติดบนผนังด้านหลัง' },
    { id: 'on_screen', group: 'on_wall', icon: '📊', label: 'หน้าจอ/TV แสดงข้อมูล',
      promptEn: 'item information displayed on a screen or TV in the background',
      promptTh: 'ข้อมูลของสิ่งของแสดงบนจอ/TV ด้านหลัง' },
    { id: 'on_digital_signage', group: 'on_wall', icon: '📺', label: 'Digital signage ขนาดใหญ่',
      promptEn: 'item shown on a large digital signage display in background',
      promptTh: 'สิ่งของแสดงบนป้ายดิจิทัลขนาดใหญ่' },

    // 🛍️ ในภาชนะ (5)
    { id: 'in_bag', group: 'in_container', icon: '🛍️', label: 'ในถุง/กระเป๋า',
      promptEn: 'item placed inside a bag or shopping bag',
      promptTh: 'สิ่งของในถุง/กระเป๋า' },
    { id: 'in_dish', group: 'in_container', icon: '🍱', label: 'ในจาน/ชาม (อาหาร)',
      promptEn: 'food item served in a dish or bowl',
      promptTh: 'อาหารจัดในจาน/ชาม' },
    { id: 'in_glass', group: 'in_container', icon: '🥛', label: 'ในแก้ว (เครื่องดื่ม)',
      promptEn: 'beverage in a clear glass cup',
      promptTh: 'เครื่องดื่มในแก้ว' },
    { id: 'in_pill_organizer', group: 'in_container', icon: '💊', label: 'ในตลับแบ่งยา',
      promptEn: 'medications organized in a 7-day pill organizer with multiple compartments',
      promptTh: 'ยาในตลับ 7 วัน หลายช่อง' },
    { id: 'in_product_box', group: 'in_container', icon: '📦', label: 'ในกล่องสินค้า',
      promptEn: 'product shown in original packaging or box',
      promptTh: 'ผลิตภัณฑ์ในกล่องบรรจุภัณฑ์เดิม' },

    // 🎯 มุมกล้อง/Composition (5)
    { id: 'foreground_closeup', group: 'composition', icon: '🔍', label: 'Close-up foreground (เด่น)',
      promptEn: 'item shown in close-up foreground with sharp focus, character behind softly',
      promptTh: 'สิ่งของอยู่ foreground ใกล้กล้อง โฟกัสชัด ตัวละครอยู่หลัง' },
    { id: 'background_blur', group: 'composition', icon: '🌫️', label: 'พื้นหลัง blur (เน้นคน)',
      promptEn: 'item visible but blurred in soft background, character in sharp focus',
      promptTh: 'สิ่งของอยู่หลัง เบลอ เน้นโฟกัสที่ตัวละคร' },
    { id: 'center_frame', group: 'composition', icon: '🎯', label: 'กลางเฟรม เด่น',
      promptEn: 'item placed centrally in the frame, equally prominent with character',
      promptTh: 'สิ่งของอยู่กลางเฟรม โดดเด่นพอกับตัวละคร' },
    { id: 'top_left_overlay', group: 'composition', icon: '↖️', label: 'มุมบนซ้าย (overlay style)',
      promptEn: 'item displayed in the top-left corner overlay style',
      promptTh: 'สิ่งของแสดงมุมบนซ้าย แบบ overlay' },
    { id: 'bottom_right', group: 'composition', icon: '↘️', label: 'มุมล่างขวา',
      promptEn: 'item placed in the bottom-right area of the frame',
      promptTh: 'สิ่งของวางมุมล่างขวาของเฟรม' },

    // 📷 ไม่มี (1)
    { id: 'none', group: 'none', icon: '📷', label: 'ไม่มีสิ่งของในเฟรม (เน้นบทพูด/ตัวคน)',
      promptEn: 'no item visible in frame, focus entirely on the character and dialogue',
      promptTh: 'ไม่มีสิ่งของในเฟรม เน้นบทพูดและตัวละคร' }
  ];

  // backward compatibility alias
  const DRUG_POSITIONS = ITEM_POSITIONS;

  // ===== ท่าทางนายแบบ (เภสัชกร) =====
  const MODEL_POSES = [
    // ที่มีอยู่ (ปรับ wording ลบ "speaking" trigger)
    { id: 'smile_explain', icon: '😊', label: 'ยิ้มแย้ม อธิบาย',
      promptEn: 'warm friendly smile, gentle hand gesture',
      promptTh: 'ยิ้มแย้มเป็นกันเอง ใช้มือประกอบ' },
    { id: 'point_explain', icon: '👉', label: 'ชี้อธิบายข้างยา',
      promptEn: 'pointing at the medicine package, professional posture',
      promptTh: 'ชี้ไปที่ซองยา ดูเป็นมืออาชีพ' },
    { id: 'hand_over',     icon: '🤝', label: 'ส่งยาให้คนไข้',
      promptEn: 'handing the medicine package with both hands, polite gesture',
      promptTh: 'ส่งยาด้วยสองมือ ดูสุภาพ' },
    { id: 'read_label',    icon: '📖', label: 'อ่านฉลากให้ฟัง',
      promptEn: 'looking at the medicine label, holding it up clearly',
      promptTh: 'มองที่ฉลากยา ยกขึ้นให้เห็นชัด' },
    { id: 'thoughtful',    icon: '🤔', label: 'ครุ่นคิด (ความระมัดระวัง)',
      promptEn: 'thoughtful concerned facial expression with focused eyes',
      promptTh: 'สีหน้าครุ่นคิด ดวงตาจดจ่อ' },
    { id: 'warning',       icon: '⚠️', label: 'เตือน/ห้าม (สำหรับ warning)',
      promptEn: 'serious facial expression, raising hand with palm out indicating caution',
      promptTh: 'สีหน้าจริงจัง ยกมือชะลอ' },
    // 🆕 v0.9.18: 8 ใหม่
    { id: 'hold_drug',     icon: '💊', label: 'ถือยาแสดง',
      promptEn: 'holding up a medicine bottle or blister pack to show clearly',
      promptTh: 'ยกขวดยาหรือแผงยาขึ้นให้เห็นชัด' },
    { id: 'check_record',  icon: '📋', label: 'ตรวจประวัติ/แฟ้ม',
      promptEn: 'reviewing a clipboard or patient record carefully',
      promptTh: 'ตรวจดูแฟ้มประวัติคนไข้อย่างละเอียด' },
    { id: 'emphasize',     icon: '🎯', label: 'เน้นย้ำสำคัญ',
      promptEn: 'emphatic hand gesture with index finger raised, focused expression',
      promptTh: 'ยกนิ้วชี้ขึ้นเน้นย้ำ สีหน้ามุ่งมั่น' },
    { id: 'reassure',      icon: '🤲', label: 'ปลอบใจ ให้กำลังใจ',
      promptEn: 'gentle reassuring posture, hand placed warmly near patient with calm expression',
      promptTh: 'ท่าปลอบใจ ยื่นมือเข้าใกล้คนไข้อย่างอ่อนโยน' },
    { id: 'reference_book',icon: '📚', label: 'ดูหนังสืออ้างอิง',
      promptEn: 'looking down at an open reference book or tablet, focused',
      promptTh: 'มองที่หนังสืออ้างอิงหรือ tablet ที่เปิดอยู่' },
    { id: 'demonstrate',   icon: '💉', label: 'สาธิตวิธีใช้',
      promptEn: 'demonstrating how to use the medication with both hands, clear motion',
      promptTh: 'สาธิตวิธีใช้ยาด้วยสองมือ ทำท่าชัดเจน' },
    { id: 'time_indicate', icon: '⏰', label: 'ชี้เวลา/นาฬิกา',
      promptEn: 'pointing at wrist or clock, indicating timing or schedule',
      promptTh: 'ชี้ที่ข้อมือหรือนาฬิกา บอกเวลา' },
    { id: 'confident_answer', icon: '👍', label: 'ตอบมั่นใจ',
      promptEn: 'confident upright posture with thumbs up gesture, assured expression',
      promptTh: 'ยืนตรงมั่นใจ ทำท่ายกนิ้วโป้ง สีหน้ามั่นใจ' }
  ];

  // ===== 🆕 จัดวางตัวละคร (Position in frame) =====
  const CHARACTER_POSITIONS = [
    { id: 'ai_decide', icon: '🤖', label: 'ให้ AI จัดเอง (default)',
      promptEn: '',  // ไม่ใส่ในprompt — ปล่อย AI คิดเอง
      promptTh: '' },
    { id: 'pharm_left_patient_right', icon: '⬅️➡️', label: 'เภสัชกรซ้าย — คนไข้ขวา',
      promptEn: 'Pharmacist on the left side of the frame, patient on the right side',
      promptTh: 'เภสัชกรอยู่ทางซ้ายของเฟรม คู่สนทนาอยู่ทางขวา' },
    { id: 'pharm_right_patient_left', icon: '➡️⬅️', label: 'เภสัชกรขวา — คนไข้ซ้าย',
      promptEn: 'Pharmacist on the right side of the frame, patient on the left side',
      promptTh: 'เภสัชกรอยู่ทางขวาของเฟรม คู่สนทนาอยู่ทางซ้าย' },
    { id: 'face_to_face', icon: '👥', label: 'หันหน้าเข้าหากัน',
      promptEn: 'Both characters facing each other in profile view, pharmacist holding medicine between them',
      promptTh: 'ตัวละครทั้งสองหันหน้าเข้าหากัน เห็นด้านข้าง เภสัชกรถือยาระหว่างกัน' },
    { id: 'pharm_center_alone', icon: '👤', label: 'เภสัชกรกลางเฟรม (คนเดียว)',
      promptEn: 'Pharmacist alone in the center of the frame, no patient visible, addressing the camera directly',
      promptTh: 'เภสัชกรอยู่กลางเฟรมคนเดียว ไม่มีคู่สนทนา พูดกับกล้องโดยตรง' },
    { id: 'pharm_foreground_patient_bg', icon: '🔍', label: 'เภสัชกรหน้า — คนไข้หลัง (blur)',
      promptEn: 'Pharmacist in foreground sharp focus, patient slightly behind in soft focus',
      promptTh: 'เภสัชกรอยู่ด้านหน้าโฟกัสคมชัด คู่สนทนาอยู่ด้านหลังเบลอเล็กน้อย' }
  ];

  // ===== ท่าทางคู่สนทนา =====
  const PARTNER_POSES = [
    // ที่มีอยู่ (ปรับ wording ลบ "asking question" trigger)
    { id: 'listen_nod', icon: '👂', label: 'ตั้งใจฟัง พยักหน้า',
      promptEn: 'attentive facial expression with slight nodding, interested look',
      promptTh: 'สีหน้าตั้งใจฟัง พยักหน้าเล็กน้อย ดูสนใจ' },
    { id: 'take_note',  icon: '📝', label: 'จดบันทึก',
      promptEn: 'looking down at a small notepad, writing notes',
      promptTh: 'ก้มมองสมุดโน้ตเล็ก จดบันทึก' },
    { id: 'hold_rx',    icon: '🤲', label: 'ถือใบสั่งยา/ซองยา',
      promptEn: 'holding a prescription or medicine bag in both hands, looking at it',
      promptTh: 'ถือใบสั่งยาหรือซองยาในสองมือ มองดู' },
    { id: 'curious',    icon: '❓', label: 'สงสัย หน้าฉงน',
      promptEn: 'curious facial expression with raised eyebrows, head still',
      promptTh: 'สีหน้าสงสัย ยักคิ้ว ศีรษะนิ่ง' },
    { id: 'worried',    icon: '😟', label: 'กังวล (สำหรับ ADR/warning)',
      promptEn: 'worried concerned facial expression, hand near chin or chest',
      promptTh: 'สีหน้ากังวล มือจับคางหรือหน้าอก' },
    { id: 'thankful',   icon: '🙏', label: 'ขอบคุณ',
      promptEn: 'grateful facial expression, hands pressed together in Thai wai gesture',
      promptTh: 'สีหน้าซาบซึ้ง ยกมือไหว้แบบไทย' },
    // 🆕 v0.9.18: 8 ใหม่
    { id: 'surprised',  icon: '😯', label: 'ตกใจ ประหลาดใจ',
      promptEn: 'surprised facial expression with widened eyes, hand near mouth',
      promptTh: 'สีหน้าตกใจ ตาเบิกกว้าง มือใกล้ปาก' },
    { id: 'understanding', icon: '💡', label: 'เข้าใจแล้ว (มีไอเดีย)',
      promptEn: 'enlightened facial expression with raised eyebrows, eyes brightening showing realization',
      promptTh: 'สีหน้าเข้าใจ ยักคิ้ว ดวงตาสว่างขึ้นแสดงรู้สึกเข้าใจ' },
    { id: 'receive',    icon: '🤲', label: 'รับยา/เอกสาร',
      promptEn: 'receiving medicine or document with both hands, respectful gesture',
      promptTh: 'รับยาหรือเอกสารด้วยสองมือ ดูสุภาพ' },
    { id: 'confused',   icon: '😐', label: 'งง ยังไม่เข้าใจ',
      promptEn: 'confused puzzled facial expression with furrowed brows',
      promptTh: 'สีหน้างง ขมวดคิ้ว' },
    { id: 'attentive_lean', icon: '🙇', label: 'ตั้งใจฟังจดจ่อ',
      promptEn: 'intensely focused attentive facial expression, eyes locked on speaker',
      promptTh: 'สีหน้าจดจ่อตั้งใจฟัง ดวงตาจ้องที่ผู้พูด' },
    { id: 'pause_gesture', icon: '✋', label: 'ขอเวลาคิด',
      promptEn: 'raising one hand palm up gesture, thoughtful expression',
      promptTh: 'ยกมือฝ่ามือขึ้นขอเวลา สีหน้าครุ่นคิด' },
    { id: 'relieved',   icon: '😌', label: 'โล่งใจ',
      promptEn: 'relieved facial expression with soft smile, shoulders relaxed',
      promptTh: 'สีหน้าโล่งใจ ยิ้มเล็กน้อย ไหล่ผ่อนคลาย' },
    { id: 'check_phone',icon: '📱', label: 'ดูโน้ตในมือถือ',
      promptEn: 'looking at smartphone screen, checking notes',
      promptTh: 'ก้มมองหน้าจอมือถือ ตรวจโน้ต' }
  ];

  // ===== กลุ่มเป้าหมาย / Persona ของคู่สนทนา (25 ตัว, group ตามช่วงวัย/สถานะ) =====
  // group: 'age' | 'special' | 'patient' | 'occupation' | 'culture' | 'staff'
  const AUDIENCES = [
    // ตามช่วงวัย (7)
    { id: 'infant', group: 'age', icon: '👶', label: 'ทารก (0-1 ปี)',
      promptEn: 'Thai infant 0-1 years old, held by parent, peaceful sleeping or alert face',
      promptTh: 'ทารกไทย 0-1 ขวบ พ่อแม่อุ้มไว้ สีหน้าสงบหรือตื่นตัว' },
    { id: 'preschool_child', group: 'age', icon: '🧸', label: 'เด็กก่อนวัยเรียน',
      promptEn: 'Thai preschool child 3-5 years old, curious cheerful face',
      promptTh: 'เด็กก่อนวัยเรียนไทย 3-5 ขวบ สีหน้าอยากรู้อยากเห็น' },
    { id: 'primary_school', group: 'age', icon: '🧒', label: 'เด็กประถม',
      promptEn: 'Thai primary school child 6-12 years old in school uniform, attentive friendly face',
      promptTh: 'เด็กประถมไทย 6-12 ปี ชุดนักเรียน สีหน้าตั้งใจฟัง' },
    { id: 'secondary_school', group: 'age', icon: '👦', label: 'นักเรียนมัธยม',
      promptEn: 'Thai secondary school student 13-18 years old in school uniform, focused expression',
      promptTh: 'นักเรียนมัธยมไทย 13-18 ปี ชุดนักเรียน สีหน้าตั้งใจ' },
    { id: 'university_student', group: 'age', icon: '🎓', label: 'นักศึกษา',
      promptEn: 'Thai university student in their 18-22, casual smart attire, engaged expression',
      promptTh: 'นักศึกษามหาวิทยาลัยไทย 18-22 ปี ชุดสุภาพ ตั้งใจ' },
    { id: 'working_adult', group: 'age', icon: '👨‍💼', label: 'วัยทำงาน',
      promptEn: 'Thai working adult in their 30s-50s in office attire, professional friendly',
      promptTh: 'ผู้ใหญ่วัยทำงานไทย 30-50 ปี ชุดออฟฟิศ สีหน้ามืออาชีพเป็นมิตร' },
    { id: 'elderly_60_plus', group: 'age', icon: '🧓', label: 'ผู้สูงอายุ (60+)',
      promptEn: 'Thai elderly person 60+ years old, kind face with wrinkles, modest attire',
      promptTh: 'ผู้สูงอายุไทย 60+ ปี สีหน้าใจดีมีริ้วรอย ชุดสุภาพ' },

    // สถานะพิเศษ (4)
    { id: 'pregnant_woman', group: 'special', icon: '🤰', label: 'หญิงตั้งครรภ์',
      promptEn: 'pregnant Thai woman in her 20s-30s, gentle expression, hand on belly',
      promptTh: 'หญิงไทยตั้งครรภ์ 20-30 ปี สีหน้าอ่อนโยน มือวางบนท้อง' },
    { id: 'breastfeeding', group: 'special', icon: '🤱', label: 'หญิงให้นมบุตร',
      promptEn: 'Thai breastfeeding mother in her 20s-30s, calm warm expression with infant',
      promptTh: 'แม่ให้นมบุตร 20-30 ปี สีหน้าอบอุ่นกับทารก' },
    { id: 'disabled_person', group: 'special', icon: '♿', label: 'ผู้พิการ',
      promptEn: 'Thai person with mobility disability using a wheelchair, dignified expression',
      promptTh: 'ผู้พิการไทยนั่งรถเข็น สีหน้าเป็นปกติ' },
    { id: 'mother_child', group: 'special', icon: '👨‍👩‍👧', label: 'ครอบครัว (พ่อแม่ลูก)',
      promptEn: 'Thai family group: parents with one or two children, warm family atmosphere',
      promptTh: 'ครอบครัวไทย พ่อแม่ลูก 1-2 คน บรรยากาศอบอุ่น' },

    // ผู้ป่วยเฉพาะ (4)
    { id: 'patient_dm', group: 'patient', icon: '🩸', label: 'ผู้ป่วยเบาหวาน (DM)',
      promptEn: 'Thai diabetes patient in middle-age, with glucose meter or insulin pen visible',
      promptTh: 'ผู้ป่วยเบาหวานไทย วัยกลางคน อาจมีเครื่องวัดน้ำตาลหรือปากกาอินซูลิน' },
    { id: 'patient_ht', group: 'patient', icon: '❤️', label: 'ผู้ป่วยความดัน (HT)',
      promptEn: 'Thai hypertension patient in their 50s-60s, perhaps with BP cuff',
      promptTh: 'ผู้ป่วยความดันไทย วัย 50-60 ปี อาจมีเครื่องวัดความดัน' },
    { id: 'patient_ckd', group: 'patient', icon: '🫘', label: 'ผู้ป่วยโรคไต (CKD)',
      promptEn: 'Thai chronic kidney disease patient, slightly tired but composed expression',
      promptTh: 'ผู้ป่วยโรคไตเรื้อรังไทย สีหน้าเหนื่อยเล็กน้อยแต่สงบ' },
    { id: 'patient_chronic', group: 'patient', icon: '🏥', label: 'ผู้ป่วยเรื้อรังทั่วไป',
      promptEn: 'Thai chronic disease patient, calm patient expression',
      promptTh: 'ผู้ป่วยโรคเรื้อรังไทยทั่วไป สีหน้าสงบ' },

    // อาชีพ (5)
    { id: 'farmer', group: 'occupation', icon: '👩‍🌾', label: 'เกษตรกร',
      promptEn: 'Thai farmer with sun-tanned skin, wearing simple work clothes, hat, weathered hands',
      promptTh: 'เกษตรกรไทย ผิวคล้ำแดด เสื้อทำงานเรียบ หมวก มือกร้าน' },
    { id: 'athlete', group: 'occupation', icon: '🏃', label: 'นักกีฬา',
      promptEn: 'Thai athletic person in athletic wear, fit and active appearance',
      promptTh: 'นักกีฬาไทย ชุดกีฬา รูปร่างฟิตและกระฉับกระเฉง' },
    { id: 'office_worker', group: 'occupation', icon: '💼', label: 'พนักงานออฟฟิศ',
      promptEn: 'Thai office worker in business casual attire, professional appearance',
      promptTh: 'พนักงานออฟฟิศไทย ชุดทำงานทันสมัย ดูเป็นมืออาชีพ' },
    { id: 'driver', group: 'occupation', icon: '🚗', label: 'พนักงานขับรถ',
      promptEn: 'Thai driver/transport worker in uniform, focused friendly look',
      promptTh: 'คนขับรถไทย ชุดยูนิฟอร์ม สีหน้าเป็นมิตร' },
    { id: 'homemaker', group: 'occupation', icon: '🏠', label: 'แม่บ้าน',
      promptEn: 'Thai homemaker in her 30s-50s, casual home attire, warm caring expression',
      promptTh: 'แม่บ้านไทย 30-50 ปี ชุดบ้านสบาย สีหน้าอบอุ่น' },

    // วัฒนธรรม/ชุมชน (3)
    { id: 'muslim_community', group: 'culture', icon: '🕌', label: 'ชุมชนมุสลิม',
      promptEn: 'Thai-Malay Muslim person in modest attire (kopiah for men, hijab for women), respectful tone',
      promptTh: 'คนไทยมุสลิม สวมกะปิเยาะห์/ฮิญาบ ชุดสุภาพ' },
    { id: 'buddhist_community', group: 'culture', icon: '🛕', label: 'ชุมชนพุทธ',
      promptEn: 'Thai Buddhist person, friendly approachable face, may wear Thai-style clothing',
      promptTh: 'คนไทยพุทธ สีหน้าเป็นมิตร อาจสวมชุดไทย' },
    { id: 'foreign_patient', group: 'culture', icon: '🌍', label: 'ผู้ป่วยต่างชาติ',
      promptEn: 'foreign patient from Asia or other regions, polite friendly expression',
      promptTh: 'ผู้ป่วยต่างชาติ จากเอเชียหรือภูมิภาคอื่น สีหน้าสุภาพ' },

    // บุคลากรสาธารณสุข (10) — v0.9.23 expanded
    { id: 'nurse_general', group: 'staff', icon: '🩺', label: 'พยาบาลทั่วไป (ชุดขาว)',
      promptEn: 'Thai female nurse in her 20s-30s wearing standard white nurse uniform with white nurse cap, name tag pinned on chest, neat hair tied back',
      promptTh: 'พยาบาลหญิงไทย 20-30 ปี ชุดพยาบาลขาว หมวกพยาบาล ป้ายชื่อ ผมรวบเรียบ' },
    { id: 'nurse_muslim', group: 'staff', icon: '🌙', label: 'พยาบาลมุสลิม',
      promptEn: 'Thai-Malay Muslim female nurse in her 20s-30s wearing modest white nurse uniform with long sleeves and white hijab',
      promptTh: 'พยาบาลมุสลิมไทย 20-30 ปี ชุดพยาบาลขาวแขนยาว ฮิญาบขาว' },
    { id: 'doctor_male', group: 'staff', icon: '👨‍⚕️', label: 'แพทย์ชาย',
      promptEn: 'Thai male physician in his 30s-50s wearing white coat with stethoscope, professional appearance',
      promptTh: 'แพทย์ชายไทย 30-50 ปี ชุดกาวน์ขาว หูฟังคล้องคอ ดูเป็นมืออาชีพ' },
    { id: 'doctor_female', group: 'staff', icon: '👩‍⚕️', label: 'แพทย์หญิง',
      promptEn: 'Thai female physician in her 30s-50s wearing white coat with stethoscope, professional appearance',
      promptTh: 'แพทย์หญิงไทย 30-50 ปี ชุดกาวน์ขาว หูฟังคล้องคอ ดูเป็นมืออาชีพ' },
    { id: 'pharmacist_target', group: 'staff', icon: '💊', label: 'เภสัชกร',
      promptEn: 'Thai pharmacist in their 30s wearing white pharmacist coat, friendly professional appearance',
      promptTh: 'เภสัชกรไทย วัย 30 ปี ชุดกาวน์เภสัช สีหน้าเป็นมิตร มืออาชีพ' },
    { id: 'dentist_target', group: 'staff', icon: '🦷', label: 'ทันตแพทย์',
      promptEn: 'Thai dentist in their 30s wearing dental clinical attire, professional appearance',
      promptTh: 'ทันตแพทย์ไทย 30 ปี ชุดทันตคลินิก ดูเป็นมืออาชีพ' },
    { id: 'medical_tech', group: 'staff', icon: '🧪', label: 'นักเทคนิคการแพทย์',
      promptEn: 'Thai medical technologist in lab coat with safety glasses, working in laboratory',
      promptTh: 'นักเทคนิคการแพทย์ไทย ชุดกาวน์แล็บ แว่นนิรภัย ทำงานในห้องแล็บ' },
    { id: 'public_health_worker', group: 'staff', icon: '📋', label: 'นักวิชาการสาธารณสุข',
      promptEn: 'Thai public health worker in government uniform with ID badge',
      promptTh: 'นักวิชาการสาธารณสุขไทย ชุดข้าราชการ ป้ายชื่อ' },
    { id: 'osm_target', group: 'staff', icon: '🌾', label: 'อสม. (อาสาสมัครสาธารณสุข)',
      promptEn: 'Thai village health volunteer wearing red OSM vest, community-friendly appearance',
      promptTh: 'อสม. เสื้อแดง สีหน้าเป็นมิตรแบบชุมชน' },
    { id: 'medical_staff_general', group: 'staff', icon: '🏥', label: 'บุคลากรทางการแพทย์ทั่วไป',
      promptEn: 'Thai healthcare professional in clinical attire, generic medical staff appearance',
      promptTh: 'บุคลากรทางการแพทย์ไทย ชุดคลินิก ดูเป็นมืออาชีพ' },

    // 🆕 v0.9.23: Custom audience (ผู้ใช้อธิบายเอง)
    { id: 'custom_audience', group: 'custom', icon: '🎨', label: 'Custom (กำหนดเอง — AI ช่วย gen)',
      promptEn: '',
      promptTh: '' }
  ];

  // ===== 🆕 v0.9.21: วิชาชีพของตัวละครหลัก =====
  // Group: 'main' | 'public_health' | 'student' | 'custom'
  const PROFESSIONS = [
    // 🩺 วิชาชีพหลัก
    { id: 'pharmacist',     group: 'main', icon: '💊', label: 'เภสัชกร',
      promptEn: 'pharmacist', promptTh: 'เภสัชกร' },
    { id: 'nurse',          group: 'main', icon: '👩‍⚕️', label: 'พยาบาล',
      promptEn: 'nurse', promptTh: 'พยาบาล' },
    { id: 'doctor',         group: 'main', icon: '👨‍⚕️', label: 'แพทย์',
      promptEn: 'doctor / physician', promptTh: 'แพทย์' },
    { id: 'dentist',        group: 'main', icon: '🦷', label: 'ทันตแพทย์',
      promptEn: 'dentist', promptTh: 'ทันตแพทย์' },
    { id: 'physiotherapist',group: 'main', icon: '🦴', label: 'นักกายภาพบำบัด',
      promptEn: 'physiotherapist', promptTh: 'นักกายภาพบำบัด' },
    { id: 'med_tech',       group: 'main', icon: '🧪', label: 'นักเทคนิคการแพทย์',
      promptEn: 'medical technologist', promptTh: 'นักเทคนิคการแพทย์' },
    { id: 'radiologic_tech',group: 'main', icon: '📡', label: 'นักรังสีการแพทย์',
      promptEn: 'radiologic technologist', promptTh: 'นักรังสีการแพทย์' },
    { id: 'nutritionist',   group: 'main', icon: '🥗', label: 'นักโภชนาการ',
      promptEn: 'nutritionist / dietitian', promptTh: 'นักโภชนาการ' },
    { id: 'psychologist',   group: 'main', icon: '🧠', label: 'นักจิตวิทยา/สุขภาพจิต',
      promptEn: 'psychologist / mental health professional', promptTh: 'นักจิตวิทยา' },
    { id: 'midwife',        group: 'main', icon: '👶', label: 'พยาบาลผดุงครรภ์',
      promptEn: 'midwife', promptTh: 'พยาบาลผดุงครรภ์' },
    // 🏥 บุคลากรสาธารณสุข
    { id: 'public_health_officer', group: 'public_health', icon: '📋', label: 'นักวิชาการสาธารณสุข (นวก.สธ.)',
      promptEn: 'public health technical officer', promptTh: 'นักวิชาการสาธารณสุข' },
    { id: 'community_health', group: 'public_health', icon: '🏘️', label: 'เจ้าพนักงานสาธารณสุขชุมชน',
      promptEn: 'community health officer', promptTh: 'เจ้าพนักงานสาธารณสุขชุมชน' },
    { id: 'osm',            group: 'public_health', icon: '🌾', label: 'อาสาสมัครสาธารณสุข (อสม.)',
      promptEn: 'village health volunteer (OSM)', promptTh: 'อาสาสมัครสาธารณสุขประจำหมู่บ้าน (อสม.)' },
    { id: 'sso_officer',    group: 'public_health', icon: '🏛️', label: 'สาธารณสุขอำเภอ (สสอ.)',
      promptEn: 'district public health officer', promptTh: 'สาธารณสุขอำเภอ' },
    { id: 'hospital_director', group: 'public_health', icon: '🏨', label: 'ผู้บริหาร/ผอ.รพ.',
      promptEn: 'hospital administrator / director', promptTh: 'ผู้บริหารโรงพยาบาล' },
    // 📚 วิชาชีพอื่น
    { id: 'student',        group: 'student', icon: '🎓', label: 'นักศึกษาแพทย์/เภสัช/พยาบาล',
      promptEn: 'medical / pharmacy / nursing student', promptTh: 'นักศึกษาวิชาชีพสาธารณสุข' },
    { id: 'lecturer',       group: 'student', icon: '👨‍🏫', label: 'อาจารย์/วิทยากร',
      promptEn: 'lecturer / instructor', promptTh: 'อาจารย์/วิทยากร' },
    { id: 'custom',         group: 'custom', icon: '🎨', label: 'Custom (กำหนดเอง — AI ช่วย gen)',
      promptEn: '', promptTh: '' }
  ];

  // ===== 🆕 v0.9.21: ชุดวิชาชีพ (35 ชุด, 6 groups) =====
  const PROFESSIONAL_OUTFITS = [
    // 💊 เภสัชกร (5)
    { id: 'default_white_coat', group: 'pharmacist', icon: '🥼', label: 'กาวน์ขาว + เชิ้ตเขียวเข้ม',
      promptEn: 'wearing a clean white pharmacist lab coat with sleeves rolled up, dark green button-up shirt underneath',
      promptTh: 'สวมเสื้อกาวน์เภสัชกรสีขาวพับแขน เสื้อเชิ้ตด้านในสีเขียวเข้ม' },
    { id: 'white_coat_white', group: 'pharmacist', icon: '🥼', label: 'กาวน์ขาว + เชิ้ตขาว',
      promptEn: 'wearing a clean white pharmacist lab coat over a white button-up shirt',
      promptTh: 'สวมเสื้อกาวน์เภสัชกรสีขาว เสื้อเชิ้ตด้านในสีขาว' },
    { id: 'white_coat_tie', group: 'pharmacist', icon: '👔', label: 'กาวน์ขาว + เนคไท',
      promptEn: 'wearing a white pharmacist lab coat over a white dress shirt with dark blue tie, formal',
      promptTh: 'สวมเสื้อกาวน์ขาวทับเชิ้ตขาว ผูกเนคไทสีน้ำเงินเข้ม ดูเป็นทางการ' },
    { id: 'white_coat_stethoscope', group: 'pharmacist', icon: '🩺', label: 'กาวน์ขาว + หูฟัง',
      promptEn: 'wearing a white pharmacist lab coat with a stethoscope around the neck',
      promptTh: 'สวมเสื้อกาวน์ขาว มีหูฟังคล้องคอ ดูเป็นคลินิก' },
    { id: 'apron_compound', group: 'pharmacist', icon: '🧪', label: 'ผ้ากันเปื้อนเภสัช',
      promptEn: 'wearing a clean apron over uniform with safety glasses, for compounding/preparation work',
      promptTh: 'สวมผ้ากันเปื้อนทับชุด + แว่นตานิรภัย สำหรับงานเตรียมยา' },

    // 👩‍⚕️ พยาบาล (6)
    { id: 'nurse_white_cap', group: 'nurse', icon: '👩‍⚕️', label: 'ชุดพยาบาลขาว + หมวก',
      promptEn: 'traditional Thai nurse uniform: clean white dress with white nurse cap',
      promptTh: 'ชุดพยาบาลขาวคลาสสิก พร้อมหมวกพยาบาลสีขาว' },
    { id: 'scrub_blue', group: 'nurse', icon: '🩺', label: 'สครับสีฟ้า',
      promptEn: 'wearing light blue medical scrub uniform, clean and professional',
      promptTh: 'สวมชุดสครับสีฟ้าอ่อน สะอาด ดูเป็นมืออาชีพ' },
    { id: 'scrub_green', group: 'nurse', icon: '🩺', label: 'สครับสีเขียว',
      promptEn: 'wearing green medical scrub uniform, clean and professional',
      promptTh: 'สวมชุดสครับสีเขียว สะอาด ดูเป็นมืออาชีพ' },
    { id: 'scrub_pink', group: 'nurse', icon: '🩺', label: 'สครับสีชมพู (พยาบาลเด็ก)',
      promptEn: 'wearing pink scrub uniform, friendly pediatric nurse style',
      promptTh: 'สวมชุดสครับสีชมพู สำหรับพยาบาลเด็ก ดูเป็นมิตร' },
    { id: 'pediatric_nurse', group: 'nurse', icon: '🧒', label: 'พยาบาลเด็ก (ลายการ์ตูน)',
      promptEn: 'wearing nurse uniform with friendly cartoon pattern, pediatric ward',
      promptTh: 'ชุดพยาบาลลายการ์ตูนน่ารัก สำหรับเด็ก' },
    { id: 'midwife_uniform', group: 'nurse', icon: '👶', label: 'ชุดผดุงครรภ์',
      promptEn: 'midwife uniform with apron, gentle warm appearance for maternity care',
      promptTh: 'ชุดผดุงครรภ์ พร้อมผ้ากันเปื้อน ดูอบอุ่นสำหรับงานคลอด' },

    // 👨‍⚕️ แพทย์ (4)
    { id: 'doctor_coat_steth', group: 'doctor', icon: '🩺', label: 'กาวน์แพทย์ + หูฟัง',
      promptEn: 'doctor white coat with stethoscope around neck, professional medical appearance',
      promptTh: 'กาวน์แพทย์ขาว พร้อมหูฟังคล้องคอ ดูเป็นมืออาชีพ' },
    { id: 'doctor_coat_tie', group: 'doctor', icon: '👔', label: 'กาวน์แพทย์ + เนคไท',
      promptEn: 'doctor white coat over white shirt and tie, formal professional',
      promptTh: 'กาวน์แพทย์ ทับเชิ้ตและเนคไท ดูเป็นทางการ' },
    { id: 'surgeon_scrub', group: 'doctor', icon: '🔬', label: 'ชุดผ่าตัด (Scrub OR)',
      promptEn: 'surgeon scrub uniform with surgical cap and mask, OR ready style',
      promptTh: 'ชุดผ่าตัด พร้อมหมวกและหน้ากาก สำหรับห้องผ่าตัด' },
    { id: 'doctor_pediatric', group: 'doctor', icon: '👨‍⚕️', label: 'หมอเด็ก',
      promptEn: 'pediatrician white coat with friendly accessories like character pin or colorful tie',
      promptTh: 'กาวน์หมอเด็ก พร้อมเครื่องประดับน่ารัก' },

    // 🌾 บุคลากรสาธารณสุข (5)
    { id: 'osm_red_vest', group: 'public_health', icon: '🌾', label: 'เสื้อ อสม. แดง',
      promptEn: 'red OSM (Village Health Volunteer) vest with logo, simple casual local style',
      promptTh: 'เสื้อ อสม. สีแดง พร้อมโลโก้ ดูเรียบง่ายแบบชุมชน' },
    { id: 'sso_uniform', group: 'public_health', icon: '🏛️', label: 'ชุดข้าราชการ สสอ.',
      promptEn: 'Thai government civil servant uniform with rank insignia, district health office style',
      promptTh: 'ชุดข้าราชการ สสอ. พร้อมเครื่องหมายตำแหน่ง' },
    { id: 'pho_uniform', group: 'public_health', icon: '📋', label: 'ชุดสาสุข เครื่องแบบ',
      promptEn: 'public health officer uniform: collar shirt with epaulettes, official appearance',
      promptTh: 'ชุดเจ้าหน้าที่สาธารณสุข พร้อมอินทรธนู ดูเป็นทางการ' },
    { id: 'community_field', group: 'public_health', icon: '🏘️', label: 'ชุดเดินตรวจชุมชน',
      promptEn: 'casual community health worker outfit with ID badge, walking field bag',
      promptTh: 'ชุดเจ้าหน้าที่ชุมชนแบบสบาย พร้อมป้ายชื่อและกระเป๋าสนาม' },
    { id: 'rueso_uniform', group: 'public_health', icon: '👕', label: 'ชุดยูนิฟอร์ม รพ.รือเสาะ',
      promptEn: 'Rueso Hospital staff uniform (polo-style shirt with hospital logo)',
      promptTh: 'ชุดเจ้าหน้าที่ รพ.รือเสาะ (โปโลพร้อมโลโก้)' },

    // ☪️ ชุดมุสลิม (4)
    { id: 'hijab_white_coat', group: 'muslim', icon: '🌙', label: 'ฮิญาบขาว + กาวน์',
      promptEn: 'wearing a white hijab with white lab coat over modest long-sleeved blouse',
      promptTh: 'สวมฮิญาบขาว + เสื้อกาวน์ + เสื้อแขนยาวสุภาพ' },
    { id: 'hijab_dark_coat', group: 'muslim', icon: '🌙', label: 'ฮิญาบดำ + กาวน์',
      promptEn: 'wearing a black or dark navy hijab with white lab coat, professional',
      promptTh: 'สวมฮิญาบสีดำหรือกรมท่า + เสื้อกาวน์ขาว ดูเป็นมืออาชีพ' },
    { id: 'kopiah_white_coat', group: 'muslim', icon: '☪️', label: 'กะปิเยาะห์ + กาวน์',
      promptEn: 'wearing a white kopiah (Islamic skull cap) with white lab coat',
      promptTh: 'สวมกะปิเยาะห์สีขาว + เสื้อกาวน์ขาว' },
    { id: 'muslim_modest', group: 'muslim', icon: '🌙', label: 'ชุดสุภาพมุสลิม + กาวน์',
      promptEn: 'modest Muslim attire (long sleeves, modest collar) under white lab coat',
      promptTh: 'ชุดสุภาพแบบมุสลิม (แขนยาว คอปิด) ทับด้วยเสื้อกาวน์ขาว' },

    // 👔 ทั่วไปทุกวิชาชีพ (11)
    { id: 'ppe_full', group: 'general', icon: '😷', label: 'ชุด PPE เต็มชุด',
      promptEn: 'full personal protective equipment: white gown, surgical mask, gloves, hair cap',
      promptTh: 'ชุด PPE เต็มชุด: เสื้อกาวน์ หน้ากาก ถุงมือ หมวกคลุมผม' },
    { id: 'thai_traditional', group: 'general', icon: '🇹🇭', label: 'ชุดไทยพื้นเมือง',
      promptEn: 'traditional Thai cultural attire (silk shirt with Thai pattern)',
      promptTh: 'ชุดไทยพื้นเมือง (เสื้อผ้าไหมลายไทย)' },
    { id: 'graduation_robe', group: 'general', icon: '👨‍🎓', label: 'ชุดวิชาการ/ครุย',
      promptEn: 'academic graduation robe with hood and cap',
      promptTh: 'ชุดครุยวิชาการ พร้อมหมวก' },
    { id: 'formal_suit', group: 'general', icon: '🤵', label: 'สูทเป็นทางการ',
      promptEn: 'dark formal business suit with white shirt and tie, executive look',
      promptTh: 'สูททำงานสีเข้ม เชิ้ตขาวผูกเนคไท ดูเป็นผู้บริหาร' },
    { id: 'jacket_id_lanyard', group: 'general', icon: '🧥', label: 'แจ็คเก็ต + ป้ายชื่อ',
      promptEn: 'navy blue hospital jacket with ID lanyard and name badge',
      promptTh: 'แจ็คเก็ต รพ. สีน้ำเงินเข้ม + สายคล้องป้ายชื่อ' },
    { id: 'collar_shirt_only', group: 'general', icon: '👕', label: 'เสื้อเชิ้ตคอปก',
      promptEn: 'clean light blue button-up collar shirt, smart casual',
      promptTh: 'เสื้อเชิ้ตคอปกสีฟ้าอ่อน สุภาพไม่เป็นทางการมาก' },
    { id: 'high_vis_field', group: 'general', icon: '🦺', label: 'เสื้อสะท้อนแสง (สนาม)',
      promptEn: 'high-visibility safety vest over uniform, for fieldwork',
      promptTh: 'เสื้อกั๊กสะท้อนแสง สำหรับงานภาคสนาม' },
    { id: 'lab_coat', group: 'general', icon: '🧪', label: 'ชุด lab + แว่นตานิรภัย',
      promptEn: 'long laboratory coat with safety goggles, lab work appearance',
      promptTh: 'เสื้อกาวน์แล็บยาว พร้อมแว่นตานิรภัย สำหรับงานแล็บ' },
    { id: 'sportswear', group: 'general', icon: '🏃', label: 'ชุดออกกำลังกาย',
      promptEn: 'modern athletic sportswear, healthy active lifestyle',
      promptTh: 'ชุดกีฬาทันสมัย ดูสุขภาพดี active' },
    { id: 'sport_team_jersey', group: 'general', icon: '⚽', label: 'ชุดทีมกีฬา',
      promptEn: 'sports team jersey with athletic shorts, energetic appearance',
      promptTh: 'เสื้อทีมกีฬา + กางเกงกีฬา ดูกระฉับกระเฉง' },
    { id: 'custom_outfit', group: 'general', icon: '🎨', label: 'Custom (ตามที่อธิบาย)',
      promptEn: '', promptTh: 'ตามที่ผู้ใช้อธิบาย' }
  ];

  // backward compatibility alias
  const PHARMACIST_OUTFITS = PROFESSIONAL_OUTFITS;

  // ===== อัตราส่วน =====
  const RATIOS = [
    { id: '1:1',  icon: '⬜',  label: '1:1', desc: 'FB/IG Feed' },
    { id: '4:5',  icon: '📱',  label: '4:5', desc: 'IG Portrait' },
    { id: '9:16', icon: '📲',  label: '9:16', desc: 'Story/Reel/TikTok' },
    { id: '16:9', icon: '🖥️', label: '16:9', desc: 'YouTube/แนวนอน' }
  ];

  // ===== จำนวนภาพ =====
  const COUNTS = [1, 2, 3, 4];

  // =====================================================
  // 🎬 VIDEO TAB (v0.9.1) — Tab 3 "วิดีโอ"
  // =====================================================

  // ===== ภาษา/สำเนียงบทพูด =====
  const VIDEO_DIALECTS = [
    { id: 'th_central', icon: '🇹🇭', label: 'ไทยกลาง',
      promptDescEn: 'standard Thai (Central Thai dialect)',
      promptHint: 'ภาษาไทยทางการ เป็นมิตร เช่น "ครับ" "ค่ะ" "นะคะ"' },
    { id: 'th_southern', icon: '🌴', label: 'ไทยใต้',
      promptDescEn: 'Southern Thai dialect (used in Narathiwat/Pattani)',
      promptHint: 'สำเนียงใต้ที่ชาวรือเสาะ-นราธิวาสใช้ มีคำเฉพาะถิ่น เช่น "หลาว" "บะ"' },
    { id: 'malay_patani', icon: '🕌', label: 'มลายูถิ่น 3 จังหวัด',
      promptDescEn: 'Bahasa Melayu Patani (Pattani Malay) — used by Malay-Muslim community in Narathiwat/Pattani/Yala, NOT standard Malaysian Malay',
      promptHint: 'ภาษามลายูถิ่นปัตตานี (Pattani Malay) ที่ใช้ในชุมชนมุสลิม 3 จังหวัด ไม่ใช่ Bahasa Melayu มาตรฐานของมาเลเซีย' }
  ];

  // ===== สไตล์วิดีโอ =====
  const VIDEO_STYLES = [
    // 🩺 Pharmacy Styles (v0.9.8) — เน้นบริบทเภสัชกรรม
    { id: 'caring_advisor',     icon: '🩺', label: 'The Caring Advisor (ที่ปรึกษาอบอุ่น)',
      group: 'pharmacy',
      promptEn: 'The Caring Advisor — cinematic, soft pharmacy lighting, warm golden tone, photorealistic 4K, gentle empathetic atmosphere like a family doctor explaining' },
    { id: 'safety_alert',       icon: '⚠️', label: 'The Safety Alert (เตือนความปลอดภัย)',
      group: 'pharmacy',
      promptEn: 'The Safety Alert — cinematic, professional clinical lighting, photorealistic 4K, slight serious tone, evidence-based authoritative atmosphere' },
    { id: 'approachable_expert',icon: '💬', label: 'The Approachable Expert (มืออาชีพเข้าถึงง่าย)',
      group: 'pharmacy',
      promptEn: 'The Approachable Expert — cinematic, casual natural lighting, photorealistic 4K, relaxed yet professional atmosphere, knowledgeable yet friendly' },
    // 🎬 General Styles
    { id: 'cinematic',     icon: '🎬', label: 'Cinematic (แบบหนัง)',
      group: 'general',
      promptEn: 'cinematic style, film-like quality, dramatic lighting, professional cinematography' },
    { id: 'documentary',   icon: '📺', label: 'Documentary style (สารคดี)',
      group: 'general',
      promptEn: 'documentary style, realistic, observational, natural lighting' },
    { id: 'slow_motion',   icon: '🐢', label: 'Slow motion (สโลโม)',
      group: 'general',
      promptEn: 'slow motion, smooth fluid movement, dreamy atmosphere' },
    { id: 'anime',         icon: '🎌', label: 'Anime style',
      group: 'general',
      promptEn: 'Japanese anime style, animated, vibrant colors, expressive characters' },
    { id: 'hyperrealistic', icon: '📷', label: 'Hyperrealistic (สมจริงสุด)',
      group: 'general',
      promptEn: 'hyperrealistic, ultra-detailed, photorealistic 4K quality' },
    { id: '3d_render',     icon: '🎮', label: '3D render / CGI',
      group: 'general',
      promptEn: '3D render, CGI animation, high-quality computer graphics' },
    { id: 'vfx',           icon: '✨', label: 'VFX (visual effects)',
      group: 'general',
      promptEn: 'visual effects (VFX), dynamic special effects, polished post-production' },
    { id: 'pixar',         icon: '🧸', label: 'Pixar cartoon style',
      group: 'general',
      promptEn: 'Pixar-style 3D cartoon, friendly characters, warm colors, family-friendly animation' }
  ];

  // ===== อารมณ์/น้ำเสียง (AI ใส่เอง — ไว้สำหรับ dropdown แก้) =====
  const VIDEO_EMOTIONS = [
    { id: 'enthusiastic', icon: '🔥', label: 'กระตือรือร้น (Enthusiastic)' },
    { id: 'calm',         icon: '😌', label: 'สงบ (Calm)' },
    { id: 'excited',      icon: '🤩', label: 'ตื่นเต้น (Excited)' },
    { id: 'serious',      icon: '😐', label: 'จริงจัง (Serious)' },
    { id: 'friendly',     icon: '😊', label: 'เป็นมิตร (Friendly)' },
    { id: 'mysterious',   icon: '🔮', label: 'ลึกลับ (Mysterious)' },
    { id: 'sad',          icon: '😢', label: 'เศร้า (Sad)' },
    { id: 'cheerful',     icon: '🎉', label: 'ร่าเริง (Cheerful)' },
    { id: 'intense',      icon: '⚡', label: 'รุนแรง (Intense)' },
    // 🆕 v0.9.18: 7 ใหม่
    { id: 'warm',         icon: '🤝', label: 'อบอุ่น เห็นใจ (Warm/Empathetic)' },
    { id: 'warning',      icon: '⚠️', label: 'เตือน เข้มงวด (Warning/Strict)' },
    { id: 'confident',    icon: '💡', label: 'มั่นใจ (Confident)' },
    { id: 'thoughtful',   icon: '🤔', label: 'ครุ่นคิด (Thoughtful)' },
    { id: 'concerned',    icon: '😟', label: 'กังวล (Concerned)' },
    { id: 'humble',       icon: '🙏', label: 'อ่อนน้อม (Humble/Respectful)' },
    { id: 'hopeful',      icon: '✨', label: 'มีความหวัง (Hopeful)' }
  ];

  // ===== มุมกล้อง =====
  const VIDEO_CAMERAS = [
    { id: 'wide',          icon: '🌅', label: 'Wide shot (ฉากกว้าง)' },
    { id: 'long',          icon: '🏞️', label: 'Long shot' },
    { id: 'medium',        icon: '🧍', label: 'Medium shot (ครึ่งตัว)' },
    { id: 'closeup',       icon: '👤', label: 'Close-up (ใกล้)' },
    { id: 'low_angle',     icon: '⬆️', label: 'Low angle (มุมต่ำ)' },
    { id: 'pov',           icon: '👁️', label: 'POV (Point of view)' },
    { id: 'pan',           icon: '↔️', label: 'Pan (กล้องส่ายข้าง)' },
    { id: 'tilt',          icon: '↕️', label: 'Tilt (กล้องส่ายขึ้นลง)' },
    { id: 'zoom',          icon: '🔍', label: 'Zoom' },
    { id: 'tracking',      icon: '🎥', label: 'Tracking shot (ติดตาม)' },
    { id: 'crane',         icon: '🏗️', label: 'Crane (มุมสูง)' },
    { id: 'handheld',      icon: '✋', label: 'Handheld (กล้องมือถือ)' },
    { id: 'orbit',         icon: '🔄', label: 'Orbit shot (กล้องวง)' }
  ];

  // ===== เพศตัวละครหลัก =====
  const VIDEO_GENDERS = [
    { id: 'male',   icon: '👨', label: 'ชาย',  pronouns: 'ครับ/ผม', wrongList: ['ค่ะ', 'คะ', 'ดิฉัน', 'หนู'] },
    { id: 'female', icon: '👩', label: 'หญิง', pronouns: 'ค่ะ/ดิฉัน', wrongList: ['ครับ', 'ผม', 'นาย'] }
  ];

  // ===== Defaults Video =====
  const VIDEO_DEFAULTS = {
    topic: '',
    keywords: '',
    audience: 'elderly_male_muslim',
    dialect: 'th_central',
    gender: 'male',
    listenerGender: '',
    visualDNAPreset: 'meen_default',
    visualDNA: '',
    style: 'caring_advisor',
    bgMode: 'same',         // 🆕 v0.9.13 — 'same' (ตามรูป Flow) | 'perScene' (AI gen)
    background: 'pharmacy', // 🆕 v0.9.13 — default scene background
    ratio: '9:16',
    count: 1,
    duration: 8
  };

  // =====================================================
  // 🧬 VISUAL DNA PRESETS (v0.9.8) — Master Prompt Edition
  // 15 presets: 5 เภสัชกร + 3 บุคลากร + 6 ผู้ป่วย + 1 Custom
  // ทุกตัวยาว ~40-55 คำภาษาอังกฤษ
  // =====================================================
  const VISUAL_DNA_PRESETS = [
    // ───── 🩺 PHARMACISTS ─────
    {
      id: 'meen_default',
      group: 'pharmacist',
      label: '⭐ Meen — เภสัชกรชายไทย ผมรองทรง แว่นกลม (Default)',
      visualDNA: `Asian Thai male pharmacist in his late 20s, medium-length straight black hair styled with side-parted fringe, wearing round thin-frame glasses, smooth fair skin, gentle calm expression with slight smile, wearing white pharmacist coat with name tag on left chest over dark olive-green collared polo shirt buttoned up.`
    },
    {
      id: 'th_male_pharm_short',
      group: 'pharmacist',
      label: '🩺 เภสัชกรชายไทย ผมสั้น ไม่ใส่แว่น',
      visualDNA: `Asian Thai male pharmacist in his early 30s, short cropped black hair neatly combed, no glasses, clean-shaven, fair complexion, friendly confident expression, wearing white pharmacist coat over light blue collared shirt with hospital name tag on chest.`
    },
    {
      id: 'th_female_pharm',
      group: 'pharmacist',
      label: '🩺 เภสัชกรหญิงไทย ผมรวบ',
      visualDNA: `Asian Thai female pharmacist in her late 20s, long straight black hair tied back in low ponytail, oval face with light natural makeup, kind warm eyes, wearing white pharmacist coat with name tag on left chest over modest collared blouse.`
    },
    {
      id: 'th_female_muslim_pharm',
      group: 'pharmacist',
      label: '🩺 เภสัชกรหญิงมุสลิม สวมฮิญาบขาว',
      visualDNA: `Asian Thai-Malay female Muslim pharmacist in her late 20s, wearing white hijab covering hair neatly, oval face with natural light makeup, kind warm eyes, gentle smile, wearing white pharmacist coat with name tag over modest long-sleeved blouse, professional appearance.`
    },
    {
      id: 'th_male_muslim_pharm',
      group: 'pharmacist',
      label: '🩺 เภสัชกรชายมุสลิม สวมกะปิเยาะห์',
      visualDNA: `Asian Thai-Malay male Muslim pharmacist in his early 30s, wearing white kopiah (Islamic skull cap), short neat black hair, well-groomed beard, fair complexion, calm confident expression, wearing white pharmacist coat with name tag over collared shirt buttoned up.`
    },

    // ───── 👨‍⚕️ HEALTHCARE STAFF ─────
    {
      id: 'th_male_doctor',
      group: 'staff',
      label: '👨‍⚕️ หมอชายไทย เนคไท + กาวน์',
      visualDNA: `Asian Thai male doctor in his mid-30s, short professional black hair, clean-shaven, fair complexion, intellectual confident expression behind thin-frame glasses, wearing white doctor coat with stethoscope around neck over white dress shirt with dark blue tie.`
    },
    {
      id: 'th_female_nurse',
      group: 'staff',
      label: '👩‍⚕️ พยาบาลหญิงไทย ชุดขาว + หมวก',
      visualDNA: `Asian Thai female nurse in her late 20s, long black hair pulled back neatly, traditional white nurse cap, oval face with light makeup, kind compassionate eyes, gentle smile, wearing white nurse uniform with hospital name tag and watch pinned on chest.`
    },
    {
      id: 'th_female_muslim_nurse',
      group: 'staff',
      label: '👩‍⚕️ พยาบาลหญิงมุสลิม ฮิญาบ + ชุดพยาบาล',
      visualDNA: `Asian Thai-Malay female Muslim nurse in her late 20s, wearing white hijab tucked neatly under white nurse uniform collar, oval face with light makeup, warm caring eyes, professional smile, hospital name tag pinned on chest.`
    },

    // ───── 👴 PATIENTS / TARGET AUDIENCE ─────
    {
      id: 'elderly_male_muslim',
      group: 'patient',
      label: '👴 ผู้สูงอายุชายมุสลิม สวมกะปิเยาะห์',
      visualDNA: `Asian Thai-Malay elderly male Muslim in his late 60s, wearing white kopiah (Islamic skull cap), gray short hair underneath, weathered tan skin with gentle wrinkles, full white beard neatly trimmed, kind wise eyes, wearing modest long-sleeved buttoned shirt in earth tone.`
    },
    {
      id: 'elderly_female_muslim',
      group: 'patient',
      label: '👵 ผู้สูงอายุหญิงมุสลิม สวมฮิญาบสีพื้น',
      visualDNA: `Asian Thai-Malay elderly female Muslim in her late 60s, wearing solid color hijab in soft tone covering hair completely, oval face with gentle wrinkles, warm wise eyes, gentle smile showing experience, wearing modest long-sleeved traditional Muslim attire.`
    },
    {
      id: 'working_male_muslim',
      group: 'patient',
      label: '👨 ชายวัยทำงานไทยมุสลิม',
      visualDNA: `Asian Thai-Malay male Muslim in his mid-30s, short neat black hair, well-groomed short beard, tan complexion, alert intelligent eyes, casual friendly expression, wearing collared button-up shirt in neutral color, professional yet approachable appearance.`
    },
    {
      id: 'working_female_muslim',
      group: 'patient',
      label: '👩 หญิงวัยทำงานมุสลิม สวมฮิญาบ',
      visualDNA: `Asian Thai-Malay female Muslim in her early 30s, wearing modern fashionable hijab in soft pastel color, oval face with subtle natural makeup, bright intelligent eyes, gentle confident smile, wearing modest long-sleeved professional blouse.`
    },
    {
      id: 'pregnant_muslim',
      group: 'patient',
      label: '🤰 หญิงตั้งครรภ์มุสลิม สวมฮิญาบ',
      visualDNA: `Asian Thai-Malay pregnant female Muslim in her late 20s, wearing soft-toned hijab covering hair gently, glowing oval face with natural pregnancy radiance, warm gentle eyes, soft smile, wearing modest loose-fitting long dress accommodating pregnancy.`
    },
    {
      id: 'child_with_mother',
      group: 'patient',
      label: '👶 เด็กไทย + แม่มุสลิม',
      visualDNA: `Asian Thai-Malay young mother in her late 20s wearing soft hijab, holding her 5-year-old child with chubby cheeks and short black hair, both with warm gentle expressions, mother in modest long-sleeved attire, child in colorful casual clothing.`
    },

    // ───── ✏️ CUSTOM ─────
    {
      id: 'custom',
      group: 'custom',
      label: '✏️ Custom — เขียน Visual DNA เอง',
      visualDNA: ''  // ผู้ใช้กรอกเอง
    }
  ];

  // =====================================================
  // 🎬 buildVideoPrompt v0.9.14 — Compact Reusable Format
  // เปลี่ยนจาก v0.9.13:
  //   - กระชับ ~50% (จาก ~4,800 → ~2,500 chars)
  //   - Format: Base part (เหมือนกันทุกฉาก) + Scene-specific (เด่น แก้ง่าย)
  //   - 🎙️ AUDIO section นุ่มลง (แก้ Veo "Audio failed" error)
  //   - ลบ "ABSOLUTELY NO MUSIC" → "Clean voice, minimal background"
  // scene = { speaker, dialogue, emotion, delivery?, pharmacistPose?, listenerPose?, background? }
  // =====================================================
  // 🆕 v0.9.34: Simple Thai prompt (validated by Meen — works perfectly with Veo)
  function buildVideoPrompt(state, scene, sceneIdx) {
    const find = (arr, id) => arr.find(o => o.id === id) || arr[0];
    const pharmGender = find(VIDEO_GENDERS, state.gender);
    const listenGender = VIDEO_GENDERS.find(g => g.id === state.listenerGender) || pharmGender;
    const isSolo = !!state.soloMode;

    // Speaker context
    const speaker = scene.speaker || 'pharmacist';
    const audOpt  = AUDIENCES.find(a => a.id === state.audience);
    // ถ้าไม่เจอ audience → fallback "คู่สนทนา"
    const audienceShort = audOpt ? audOpt.label.replace(/\s*\([^)]*\)/g, '').trim() : 'คู่สนทนา';

    // Emotion (น้ำเสียง) — extract Thai-only label
    const emotionRaw = scene.emotion || 'จริงจัง';
    // ตัด " (English)" ออก เหลือไทยล้วน
    const emotion = emotionRaw.replace(/\s*\([^)]*\)/g, '').trim();

    // Poses
    const pharmPoseId = scene.pharmacistPose || 'smile_explain';
    const listenerPoseId = scene.listenerPose || 'listen_nod';
    const pharmPoseObj = MODEL_POSES.find(p => p.id === pharmPoseId) || MODEL_POSES[0];
    const listenerPoseObj = PARTNER_POSES.find(p => p.id === listenerPoseId) || PARTNER_POSES[0];
    const speakerPoseDesc = (speaker === 'pharmacist' ? pharmPoseObj : listenerPoseObj).promptTh || '';
    const listenerPoseDesc = (speaker === 'pharmacist' ? listenerPoseObj : pharmPoseObj).promptTh || '';

    // Identify speaker (LEFT/RIGHT — Thai)
    let speakerLocator;
    if (isSolo) {
      speakerLocator = 'ตัวละครรูปที่แนบ';
    } else {
      speakerLocator = (speaker === 'pharmacist')
        ? 'ตัวละครรูปที่แนบ เฉพาะคนทางซ้าย (เภสัชกร)'
        : `ตัวละครรูปที่แนบ เฉพาะคนทางขวา (${audienceShort})`;
    }

    const lines = [];
    // 1. ผู้พูด + น้ำเสียง + บทพูด
    lines.push(`${speakerLocator} พูดเป็นภาษาไทยด้วยน้ำเสียง${emotion} คำว่า`);
    lines.push(`"${scene.dialogue || ''}"`);
    lines.push(``);

    // 2. ท่าทางผู้พูด
    if (speakerPoseDesc) {
      lines.push(`ผู้พูดมี${speakerPoseDesc}`);
    }

    // 3. คู่สนทนา (ถ้ามี) — อยู่นิ่งๆ
    if (!isSolo) {
      const nonSpeakerSide = speaker === 'pharmacist' ? 'ทางขวา' : 'ทางซ้าย';
      const nonSpeakerName = speaker === 'pharmacist' ? audienceShort : 'เภสัชกร';
      const desc = listenerPoseDesc ? `มี${listenerPoseDesc} — ` : '';
      lines.push(`${nonSpeakerName}${nonSpeakerSide} ${desc}อยู่นิ่งๆ ไม่พูด ไม่พยักหน้า ไม่ขยับศีรษะ ไม่ขยับร่างกาย`);
    }
    lines.push(``);

    // 4. Face lock
    lines.push(`ใบหน้าของทุกคนต้องเหมือนรูปที่แนบ 100% ตา จมูก ปาก ทรงผม ห้ามเปลี่ยน`);
    lines.push(`ฟันเรียงสวย เป็นระเบียบ ผิวเนียนเรียบ`);
    lines.push(``);

    // 5. Negatives
    lines.push(`ห้ามมีตัวอักษรบนคลิปวีดีโอ`);
    lines.push(`ห้ามมีเสียงดนตรีประกอบ`);

    return lines.join('\n');
  }


  // ===== ภาษา prompt =====
  const PROMPT_LANGUAGES = [
    { id: 'en', icon: '🇬🇧', label: 'English (แนะนำ)', desc: 'Nano Banana เข้าใจดีที่สุด' },
    { id: 'th', icon: '🇹🇭', label: 'ภาษาไทย', desc: 'แก้ง่าย แต่อาจตีความไม่แม่น' }
  ];

  // =====================================================
  // 🆕 INFOGRAPHIC OPTIONS (Tab "สร้างสื่อ")
  // =====================================================

  // ===== สไตล์ภาพ Infographic =====
  const INFOGRAPHIC_STYLES = [
    // 🎨 Illustration (8)
    { id: 'flat', group: 'illustration', icon: '🎨', label: 'Flat illustration (วาดเรียบ infographic)',
      promptTh: 'สไตล์ flat illustration วาดเรียบ ทันสมัย เน้นความชัดเจน เหมาะกับ infographic' },
    { id: '3d_cartoon', group: 'illustration', icon: '🧸', label: '3D การ์ตูน (น่ารัก สดใส)',
      promptTh: 'สไตล์ 3D การ์ตูน ภาพแนวสดใสน่ารัก เป็นมิตร สีสันสว่าง' },
    { id: 'hand_drawn', group: 'illustration', icon: '✏️', label: 'Hand-drawn / Doodle',
      promptTh: 'สไตล์ลายเส้นวาดมือ doodle เป็นกันเอง ไม่เป็นทางการ' },
    { id: 'watercolor_style', group: 'illustration', icon: '🖌️', label: 'Watercolor (สีน้ำ)',
      promptTh: 'สไตล์สีน้ำ นุ่มนวล สีสันอ่อน อ่อนโยน' },
    { id: 'sketch_pencil', group: 'illustration', icon: '✏️', label: 'Sketch pencil (ดินสอ)',
      promptTh: 'สไตล์ภาพสเก็ตช์ดินสอ ลายเส้นเรียบง่าย ดูศิลปะ' },
    { id: 'comic_style', group: 'illustration', icon: '💬', label: 'Comic style (การ์ตูน)',
      promptTh: 'สไตล์การ์ตูน comic มี speech bubbles ภาพประกอบสนุก' },
    { id: 'storybook', group: 'illustration', icon: '📖', label: 'Storybook (หนังสือนิทาน)',
      promptTh: 'สไตล์หนังสือนิทาน ภาพประกอบอบอุ่น เหมาะสำหรับเด็ก/ครอบครัว' },
    { id: 'cute_chibi', group: 'illustration', icon: '🧸', label: 'Cute chibi (น่ารักหัวโต)',
      promptTh: 'สไตล์ chibi การ์ตูนหัวโต น่ารัก เหมาะสำหรับเด็ก' },

    // 📐 Modern/Tech (5)
    { id: 'minimal', group: 'modern', icon: '📐', label: 'Minimal / Geometric',
      promptTh: 'สไตล์ minimal เรียบ ทันสมัย ใช้รูปทรงเรขาคณิต ไม่รก' },
    { id: 'corporate', group: 'modern', icon: '📊', label: 'Corporate clean (ทางการ)',
      promptTh: 'สไตล์ corporate clean ทางการ น่าเชื่อถือ เหมาะกับเอกสารสุขภาพ' },
    { id: 'tech_modern', group: 'modern', icon: '💻', label: 'Tech modern (ทันสมัย)',
      promptTh: 'สไตล์ tech modern ใช้สีฟ้า/ม่วง gradient ดูทันสมัย hi-tech' },
    { id: 'isometric_3d', group: 'modern', icon: '🧊', label: 'Isometric 3D',
      promptTh: 'สไตล์ isometric 3D มีมิติสามเหลี่ยม ดูทันสมัย' },
    { id: 'vector_2d', group: 'modern', icon: '🟦', label: 'Vector 2D',
      promptTh: 'สไตล์ vector 2D เส้นคมชัด สีเรียบ เหมาะกับ logo และ icon' },

    // 📷 Realistic (4)
    { id: 'realistic', group: 'realistic', icon: '🎬', label: 'Realistic photo + กราฟิก',
      promptTh: 'ภาพถ่ายจริงผสมกราฟิก infographic ดูสมจริงและเป็นมืออาชีพ' },
    { id: 'photo_realistic', group: 'realistic', icon: '📷', label: 'Photo realistic (ภาพถ่ายจริง)',
      promptTh: 'ภาพถ่ายจริง 100% photorealistic คมชัดสูง ดูเป็น editorial' },
    { id: 'documentary_style', group: 'realistic', icon: '📺', label: 'Documentary style',
      promptTh: 'สไตล์สารคดี ภาพจริงแบบ candid ไม่จัดฉาก สื่อความจริง' },
    { id: 'medical_diagram', group: 'realistic', icon: '🩺', label: 'Medical diagram (แผนผังการแพทย์)',
      promptTh: 'แผนผังการแพทย์ที่แม่นยำ เช่น anatomy diagram, drug pathway' },

    // 🎨 Artistic (5)
    { id: 'pop_art', group: 'artistic', icon: '🌈', label: 'Pop art (สีสด ป๊อป)',
      promptTh: 'สไตล์ pop art สีสด ตัดเส้นเข้ม สดใส' },
    { id: 'retro_vintage', group: 'artistic', icon: '📻', label: 'Retro vintage (ย้อนยุค)',
      promptTh: 'สไตล์ย้อนยุค โทนสีเก่า มีกลิ่นอายวินเทจ 70s-80s' },
    { id: 'origami_paper', group: 'artistic', icon: '📄', label: 'Origami / Paper craft',
      promptTh: 'สไตล์งานกระดาษ origami มีมิติเหมือนกระดาษพับ เหมาะกับสื่อ DIY' },
    { id: 'risograph', group: 'artistic', icon: '🎭', label: 'Risograph print (พิมพ์โทนเฉพาะ)',
      promptTh: 'สไตล์ Risograph สีโทนเฉพาะ 2-3 สี ดูเป็นศิลปะ indie' },
    { id: 'collage', group: 'artistic', icon: '🖼️', label: 'Collage (ภาพปะติด)',
      promptTh: 'สไตล์ collage ภาพปะติด ผสมหลาย texture สดใส' },

    // 🎨 Custom
    { id: 'custom_style', group: 'custom', icon: '🎨', label: 'Custom (อธิบายเอง)',
      promptTh: '' }
  ];

  // ===== ธีม / พื้นหลัง Infographic =====
  const INFOGRAPHIC_THEMES = [
    // ที่มี (8) + ใหม่ (22) = 30 ธีม
    { id: 'modern_hospital', group: 'general', icon: '🏥', label: 'Modern hospital (โรงพยาบาลทันสมัย)',
      promptTh: 'ธีมโรงพยาบาลทันสมัย โทนฟ้า-ขาว สะอาด มืออาชีพ' },
    { id: 'islamic',         group: 'culture', icon: '🌙', label: 'Islamic geometric (ลายอิสลาม)',
      promptTh: 'ธีมลายอิสลาม geometric pattern โทนเขียว-ทอง เหมาะกับชุมชนมุสลิม' },
    { id: 'thai_traditional', group: 'culture', icon: '🏛️', label: 'ลายไทย / โขน รามเกียรติ์',
      promptTh: 'ธีมลายไทยโบราณ โขน รามเกียรติ์ สีทอง-แดง วัฒนธรรมไทย' },
    { id: 'nature',          group: 'lifestyle', icon: '🌿', label: 'Nature / Botanical (ธรรมชาติ)',
      promptTh: 'ธีมธรรมชาติ ใบไม้ ดอกไม้ โทนเขียว สดชื่น ผ่อนคลาย' },
    { id: 'pastel',          group: 'general', icon: '🎨', label: 'Pastel minimal',
      promptTh: 'ธีมโทนพาสเทล สีอ่อนนุ่ม minimal ทันสมัย น่ารัก' },
    { id: 'gradient',        group: 'general', icon: '🌊', label: 'Soft gradient (ไล่สี)',
      promptTh: 'พื้นหลังไล่สีนุ่มนวล gradient หลายโทน ดูทันสมัย' },
    { id: 'plain_white',     group: 'general', icon: '⚪', label: 'Plain white (ขาวเรียบ)',
      promptTh: 'พื้นหลังสีขาวเรียบ minimal เน้นเนื้อหาเป็นหลัก' },
    { id: 'dark',            group: 'general', icon: '🌃', label: 'Dark mode (พื้นเข้ม)',
      promptTh: 'พื้นหลังโทนมืด ตัวอักษรสว่าง ดูทันสมัย เท่' },

    // 🆕 v0.9.21: 22 ใหม่
    { id: 'corporate_blue',  group: 'general', icon: '💼', label: 'Corporate blue (ทางการ)',
      promptTh: 'ธีมโทนน้ำเงินทางการ ใช้สำหรับเอกสารราชการ มีระดับ' },
    { id: 'kawaii',          group: 'art', icon: '🐤', label: 'Kawaii (น่ารักสำหรับเด็ก)',
      promptTh: 'ธีมการ์ตูนน่ารัก สีสดใส รูปทรงโค้งมน เหมาะสำหรับเด็ก' },
    { id: 'retro',           group: 'media', icon: '📻', label: 'Retro vintage (ย้อนยุค)',
      promptTh: 'ธีมย้อนยุค โทนสีเก่า มีกลิ่นอายวินเทจ' },
    { id: 'newspaper',       group: 'media', icon: '📰', label: 'Newspaper (สไตล์หนังสือพิมพ์)',
      promptTh: 'ธีมหนังสือพิมพ์ ขาว-ดำ headline เด่น มีเส้นแบ่งคอลัมน์' },
    { id: 'magazine',        group: 'media', icon: '📖', label: 'Magazine editorial (นิตยสาร)',
      promptTh: 'ธีมนิตยสาร layout มีระดับ ภาพใหญ่เด่น typography สวย' },
    { id: 'comic_book',      group: 'art', icon: '💥', label: 'Comic book (การ์ตูนอเมริกัน)',
      promptTh: 'ธีมการ์ตูน comic book มี speech bubbles และ effects ดราม่า' },
    { id: 'watercolor',      group: 'art', icon: '🎨', label: 'Watercolor (สีน้ำ)',
      promptTh: 'ธีมสีน้ำ texture แบบศิลปะ นุ่มนวล อ่อนโยน' },
    { id: 'flat_2d',         group: 'art', icon: '🟦', label: 'Flat 2D illustration',
      promptTh: 'ภาพประกอบ flat 2D สไตล์ infographic สมัยใหม่' },
    { id: 'isometric',       group: 'art', icon: '🧊', label: 'Isometric 3D',
      promptTh: 'ธีม isometric 3D มีมิติสามเหลี่ยม ดูทันสมัย' },
    { id: 'medical_clinical',group: 'medical', icon: '💉', label: 'Clinical medical (คลินิกแพทย์)',
      promptTh: 'ธีมคลินิกการแพทย์ โทนเขียวอ่อน-ขาว เป็นทางการ มีไอคอนแพทย์' },
    { id: 'pharmacy_themed', group: 'medical', icon: '💊', label: 'Pharmacy themed (เน้นเภสัช)',
      promptTh: 'ธีมร้านยา/ห้องยา มีเม็ดยา blister โครงสร้างโมเลกุล โทนเขียว-ฟ้า' },
    { id: 'wellness_spa',    group: 'lifestyle', icon: '🧘', label: 'Wellness/Spa (ผ่อนคลาย)',
      promptTh: 'ธีม wellness/spa โทนเขียวอ่อน เบจ ผ่อนคลาย เน้นสุขภาพ' },
    { id: 'fitness_sport',   group: 'lifestyle', icon: '💪', label: 'Fitness/Sport (กีฬา)',
      promptTh: 'ธีมกีฬาออกกำลังกาย โทนสีสด พลังงานสูง' },
    { id: 'food_nutrition',  group: 'lifestyle', icon: '🥗', label: 'Food/Nutrition (อาหาร)',
      promptTh: 'ธีมอาหารโภชนาการ โทนเขียว-ส้ม สดใส เห็นภาพอาหาร' },
    { id: 'kids_education',  group: 'audience_specific', icon: '🧒', label: 'Kids education (สำหรับเด็ก)',
      promptTh: 'ธีมการศึกษาสำหรับเด็ก สีสดใส รูปการ์ตูน อ่านง่าย' },
    { id: 'elderly_friendly',group: 'audience_specific', icon: '👴', label: 'Elderly-friendly (สำหรับผู้สูงอายุ)',
      promptTh: 'ธีมเหมาะสำหรับผู้สูงอายุ ตัวอักษรใหญ่ คอนทราสต์สูง อ่านง่าย' },
    { id: 'public_health',   group: 'medical', icon: '📊', label: 'Public health stats (สถิติสาธารณสุข)',
      promptTh: 'ธีมสถิติสาธารณสุข มีกราฟ chart ตัวเลข ดูเป็นทางการ' },
    { id: 'emergency',       group: 'medical', icon: '🚨', label: 'Emergency / Alert (ฉุกเฉิน)',
      promptTh: 'ธีมฉุกเฉิน โทนแดง-เหลือง warning เด่นชัด' },
    { id: 'thai_modern',     group: 'culture', icon: '🇹🇭', label: 'Thai modern (ไทยร่วมสมัย)',
      promptTh: 'ธีมไทยร่วมสมัย ผสมสมัยใหม่กับลายไทย ดูทันสมัยแต่มีความเป็นไทย' },
    { id: 'green_eco',       group: 'lifestyle', icon: '🌱', label: 'Green eco (สิ่งแวดล้อม)',
      promptTh: 'ธีมสิ่งแวดล้อมสีเขียว ยั่งยืน eco-friendly' },
    { id: 'royal_thai',      group: 'culture', icon: '👑', label: 'Royal Thai (ราชสำนักไทย)',
      promptTh: 'ธีมราชสำนักไทย โทนทอง-แดง สูงส่ง พระบรมราชูปถัมภ์' },
    { id: 'medical_research',group: 'medical', icon: '🔬', label: 'Medical research (งานวิจัย)',
      promptTh: 'ธีมงานวิจัยการแพทย์ มี molecule DNA chart ดูเป็นวิทยาศาสตร์' },
    // 🆕 v0.9.24: Custom theme
    { id: 'custom_theme', group: 'custom', icon: '🎨', label: 'Custom (อธิบายเอง)',
      promptTh: '' }
  ];

  // ===== อัตราส่วน Infographic (เพิ่ม 16:9 เป็น default) =====
  const INFOGRAPHIC_RATIOS = [
    { id: '1:1',  icon: '⬜',  label: '1:1', desc: 'FB/IG Feed' },
    { id: '4:5',  icon: '📱',  label: '4:5', desc: 'IG Portrait' },
    { id: '9:16', icon: '📲',  label: '9:16', desc: 'Story/Reel' },
    { id: '16:9', icon: '🖥️', label: '16:9', desc: 'YouTube/แนวนอน' }
  ];

  // ===== Default values สำหรับ Infographic =====
  const INFOGRAPHIC_DEFAULTS = {
    topic: '',           // ผู้ใช้พิมพ์เอง
    audience: 'working_adult',   // 🆕 v0.9.22 — default = วัยทำงาน
    style: 'flat',
    theme: 'modern_hospital',
    ratio: '16:9',
    count: 1
  };

  // =====================================================
  // 🆕 buildInfographicPrompt — สร้าง prompt สำหรับ Infographic
  //   v0.9.12: เพิ่ม audience targeting
  // =====================================================
  function buildInfographicPrompt(state) {
    const find = (arr, id) => arr.find(o => o.id === id) || arr[0];
    const style = find(INFOGRAPHIC_STYLES, state.style);
    const theme = find(INFOGRAPHIC_THEMES, state.theme);
    const audOpt = AUDIENCES.find(a => a.id === state.audience);
    const ratio = state.ratio || '16:9';
    const topic = (state.topic || '').trim();
    const isCustomAudience = state.audience === 'custom_audience';
    const isCustomStyle = state.style === 'custom_style';
    const isCustomTheme = state.theme === 'custom_theme';

    const lines = [];
    lines.push(`สร้างภาพอินโฟกราฟิกสำหรับสื่อให้ความรู้ทางสุขภาพและยา`);
    lines.push(`อัตราส่วน ${ratio}`);
    lines.push(``);

    // 🆕 v0.9.23: Custom audience overrides preset
    if (isCustomAudience && state.customAudienceDesc) {
      lines.push(`กลุ่มเป้าหมาย (custom): ${state.customAudienceDesc}`);
      lines.push(`👉 ออกแบบให้เหมาะกับกลุ่มนี้ตามที่อธิบายไว้`);
      lines.push(``);
    } else if (audOpt) {
      // Audience targeting (preset)
      const audienceShort = audOpt.label.replace(/\s*\([^)]*\)/g, '').trim();
      lines.push(`กลุ่มเป้าหมาย: ${audienceShort}`);
      lines.push(`ลักษณะกลุ่ม: ${audOpt.promptTh}`);
      lines.push(`👉 ออกแบบให้เหมาะกับกลุ่มนี้:`);

      const aGroup = audOpt.group;
      const aId = audOpt.id;

      if (aId === 'elderly_60_plus' || aId === 'elderly_male_muslim' || aId === 'elderly_female_muslim') {
        lines.push(`- ตัวอักษรขนาดใหญ่ อ่านง่าย (สำหรับผู้สูงอายุ)`);
        lines.push(`- สีสันชัดเจน contrast สูง`);
        lines.push(`- ใช้คำง่ายๆ ไม่ใช้ศัพท์การแพทย์ซับซ้อน`);
      } else if (aGroup === 'age' && (aId === 'infant' || aId === 'preschool_child' || aId === 'primary_school')) {
        lines.push(`- โทนสดใส สีสันสนุก น่ารัก เหมาะสำหรับเด็ก`);
        lines.push(`- ภาพประกอบการ์ตูน รูปทรงโค้งมน`);
        lines.push(`- คำง่ายๆ พ่อแม่ใช้สอนได้`);
      } else if (aId === 'secondary_school' || aId === 'university_student') {
        lines.push(`- ดีไซน์ทันสมัย เหมาะกับวัยรุ่น/นักศึกษา`);
        lines.push(`- ใช้ social media style + emoji`);
        lines.push(`- เนื้อหากระชับ เข้าใจเร็ว`);
      } else if (aGroup === 'special' && (aId === 'pregnant_woman' || aId === 'breastfeeding' || aId === 'mother_child')) {
        lines.push(`- โทนอบอุ่น สีพาสเทล`);
        lines.push(`- ภาพประกอบเกี่ยวกับแม่และเด็ก`);
        lines.push(`- เนื้อหาเน้นความปลอดภัยและอ่อนโยน`);
      } else if (aGroup === 'patient') {
        lines.push(`- โทนสบายตา สงบ`);
        lines.push(`- เน้นเนื้อหาเฉพาะโรค practical tips`);
        lines.push(`- ภาพประกอบเข้าใจง่าย ไม่น่ากลัว`);
        lines.push(`- ใช้ตัวเลข/ค่าเป้าหมายชัดเจน`);
      } else if (aGroup === 'staff') {
        lines.push(`- โทนมืออาชีพ clinical`);
        lines.push(`- ใช้ศัพท์การแพทย์มาตรฐาน`);
        lines.push(`- ตารางหรือ flowchart สำหรับ reference`);
        lines.push(`- แม่นยำ evidence-based`);
      } else if (aGroup === 'culture' && aId === 'muslim_community') {
        lines.push(`- ภาพประกอบเป็นมิตรกับศาสนาอิสลาม (เช่น เสี้ยวจันทร์ ลายอิสลาม)`);
        lines.push(`- สีเขียว/ทอง โทนสุภาพ`);
        lines.push(`- หลีกเลี่ยงภาพที่ขัดกับหลักศาสนา`);
      } else if (aGroup === 'culture' && aId === 'buddhist_community') {
        lines.push(`- ภาพประกอบสะท้อนวัฒนธรรมไทยพุทธ`);
        lines.push(`- โทนทอง/ขาว ดูสุภาพ`);
      } else if (aGroup === 'occupation') {
        lines.push(`- ดีไซน์ practical เน้น actionable tips`);
        lines.push(`- ภาพประกอบสะท้อนอาชีพนี้`);
        lines.push(`- เนื้อหาประยุกต์ใช้ในงานจริง`);
      } else if (aId === 'working_adult') {
        lines.push(`- ดีไซน์ modern เข้ากับวัยทำงาน`);
        lines.push(`- เนื้อหากระชับ เข้าใจเร็ว`);
        lines.push(`- เน้น actionable tips`);
      } else {
        lines.push(`- ดีไซน์ทั่วไป สดใส อ่านง่าย เข้าถึงทุกวัย`);
      }
      lines.push(``);
    }

    lines.push(`เน้นความถูกต้องของเนื้อหาด้านสุขภาพ`);
    lines.push(``);

    if (topic) {
      lines.push(`หัวข้อและเนื้อหา:`);
      lines.push(`"""`);
      lines.push(topic);
      lines.push(`"""`);
    } else {
      lines.push(`หัวข้อ: (AI จะค้นหาและสรุปเนื้อหาความรู้ทั่วไปด้านสุขภาพ)`);
      lines.push(`โดยค้นหาความรู้ที่ถูกต้อง สรุปเป็นหัวข้อย่อยที่เข้าใจง่าย ไม่ซับซ้อน`);
    }
    lines.push(``);

    // 🆕 v0.9.23: Custom style overrides preset
    if (isCustomStyle && state.customStyleDesc) {
      lines.push(`สไตล์ภาพ (custom): ${state.customStyleDesc}`);
    } else {
      lines.push(`สไตล์ภาพ: ${style.promptTh}`);
    }
    // 🆕 v0.9.24: Custom theme overrides preset
    if (isCustomTheme && state.customThemeDesc) {
      lines.push(`ธีม / พื้นหลัง (custom): ${state.customThemeDesc}`);
    } else {
      lines.push(`ธีม / พื้นหลัง: ${theme.promptTh}`);
    }
    lines.push(``);

    lines.push(`ภาพแนวสดใส น่ารัก อ่านง่าย เป็นมิตร เหมาะสำหรับสื่อสุขภาพ`);
    lines.push(`สีสันสบายตา ไม่ฉูดฉาดเกินไป`);
    lines.push(`ความคมชัด 4K`);
    lines.push(`จัด layout ให้เนื้อหาทุกข้ออ่านได้ครบ ไม่บัง`);
    lines.push(``);

    lines.push(`ภาษาในภาพ (สำคัญมาก): ภาษาไทย ตัวอักษรชัด อ่านง่าย`);
    lines.push(`การสะกดภาษาไทยต้องถูกต้อง 100% — ทุกพยัญชนะ สระ วรรณยุกต์ ครบถ้วน อ่านได้เป็นภาษาไทยจริง`);
    lines.push(`ห้ามมีตัวอักษรไทยที่เพี้ยน ห้ามตัวอักษรหลอกที่ดูเหมือนภาษาไทยแต่ไม่ใช่`);
    lines.push(`ห้ามคำสะกดผิด — เจ้าของภาษาไทยต้องอ่านได้โดยไม่สับสน`);
    lines.push(`ลายเซ็นต์ขนาดเล็ก: "รพ.รือเสาะ • กลุ่มงานเภสัชกรรม" มุมบนซ้าย`);
    lines.push(``);

    lines.push(`NEGATIVE:`);
    lines.push(`- ห้ามตัวอักษรไทยเพี้ยน ห้ามคำสะกดผิดภาษาไทย ห้ามตัวอักษรหลอกที่ดูคล้ายภาษาไทย`);
    lines.push(`- ห้ามมีลายน้ำ ห้ามโลโก้ของยี่ห้ออื่น`);
    lines.push(`- ข้อมูลทางการแพทย์ต้องถูกต้อง ไม่กล่าวอ้างเกินจริง`);
    lines.push(`- ไม่มี AI artifacts, ไม่มีตัวอักษรเหลือเป็นเส้นเลือนๆ`);

    return lines.join('\n');
  }

  // ===== Default values =====
  const DEFAULTS = {
    imageStyle: 'realistic',
    cameraAngle: 'half_body',
    background: 'pharmacy',
    drugPosition: 'hold_show',
    modelPose: 'smile_explain',
    partnerPose: 'listen_nod',
    audience: 'elderly_male_muslim',
    pharmacistOutfit: 'default_white_coat',
    characterPosition: 'ai_decide',
    addCoverText: false,
    coverHeadline: '',           // 🆕 ข้อความบนปก
    drugContext: '',             // 🆕 ข้อมูลยา (สำหรับให้ AI คิด headline)
    changeOutfit: false,
    promptLang: 'en',
    ratio: '9:16',
    count: 2
  };

  // =====================================================
  // 🆕 buildPrompt v0.9.5 — ไทยล้วน + เน้นความคมชัด deep focus
  //   - ใช้ promptTh ทุกตัว (แทน promptEn)
  //   - เพิ่มคำสั่งคมชัดใน Quality + ห้ามเบลอ
  // =====================================================
  function buildPrompt(state) {
    const find = (arr, id) => arr.find(o => o.id === id) || arr[0];
    const style    = find(IMAGE_STYLES,        state.imageStyle);
    const angle    = find(CAMERA_ANGLES,       state.cameraAngle);
    const bg       = find(BACKGROUNDS,         state.background);
    const itemPos  = find(ITEM_POSITIONS,      state.drugPosition);  // alias: drugPosition still used as state field
    const mPose    = find(MODEL_POSES,         state.modelPose);
    const pPose    = find(PARTNER_POSES,       state.partnerPose);
    const aud      = find(AUDIENCES,           state.audience);
    const outfit   = find(PROFESSIONAL_OUTFITS, state.pharmacistOutfit);
    // 🆕 v0.9.21: profession (ถ้าไม่มี = pharmacist default)
    const prof     = find(PROFESSIONS,         state.profession || 'pharmacist');
    const isCustomProfession = (state.profession === 'custom');

    // Audience — ตัด (...) ออกให้กระชับ
    const audienceShort = aud.label.replace(/\s*\([^)]*\)/g, '').trim();
    // 🆕 v0.9.21: profLabel — ใช้ label ของ profession (custom = ดู customDesc)
    const profLabel = isCustomProfession ? 'Custom' : (prof.promptTh || 'ตัวละครหลัก');

    const lines = [];
    // 🆕 v0.9.21: ตัวละครหลัก (ใช้คำกลางๆ + ระบุวิชาชีพถ้ามี)
    lines.push(`ตัวละครที่ 1 (ตัวละครหลัก — ${profLabel}): ใบหน้าตามรูปอ้างอิงที่ 1 — lock 100%`);
    if (isCustomProfession && state.customProfessionDesc) {
      lines.push(`   รายละเอียดตัวละคร: ${state.customProfessionDesc}`);
    }
    if (state.changeOutfit) {
      lines.push(`   เครื่องแต่งกาย: ${outfit.promptTh}`);
      // ถ้าเลือก custom_outfit + มี customOutfitDesc → ใช้ที่ผู้ใช้อธิบาย
      if (state.pharmacistOutfit === 'custom_outfit' && state.customOutfitDesc) {
        lines.push(`   รายละเอียดชุด: ${state.customOutfitDesc}`);
      }
    } else {
      lines.push(`   เครื่องแต่งกาย: ตามรูปอ้างอิงที่ 1 (คงชุดเดิม)`);
    }
    lines.push(`   ท่าทาง: ${mPose.promptTh}`);
    lines.push(``);

    // 🆕 v0.9.20: Solo mode — ไม่มีคู่สนทนา
    if (!state.soloMode) {
      lines.push(`ตัวละครที่ 2 (คู่สนทนา): ${audienceShort}`);
      lines.push(`   ลักษณะ: ${aud.promptTh}`);
      lines.push(`   ใบหน้า: ใบหน้าใหม่หลากหลาย (random unique appearance) — ไม่ซ้ำกับครั้งก่อน แต่ยังอยู่ในบริบท ${audienceShort}`);
      lines.push(`   ท่าทาง: ${pPose.promptTh}`);
      // 🆕 v0.9.21: characterPosition (ถ้าไม่ใช่ ai_decide)
      if (state.characterPosition && state.characterPosition !== 'ai_decide') {
        const charPos = find(CHARACTER_POSITIONS, state.characterPosition);
        if (charPos && charPos.promptTh) {
          lines.push(`   จัดวาง: ${charPos.promptTh}`);
        }
      }
      lines.push(``);
    }

    // 🆕 v0.9.21: "ยา" → "สิ่งที่จะแนะนำ" (รองรับ ยา / สินค้า / อาหารเสริม / ฯลฯ)
    if (state.drugPosition !== 'none') {
      lines.push(`สิ่งที่จะแนะนำ: ตามรูปอ้างอิงที่ 2 (ฉลาก สี รูปทรง — ห้ามเปลี่ยน)`);
      lines.push(`   ตำแหน่งในเฟรม: ${itemPos.promptTh}`);
      lines.push(``);
    }

    lines.push(`พื้นหลัง: ${bg.promptTh}`);
    lines.push(`มุมกล้อง: ${angle.promptTh}`);
    lines.push(`สไตล์: ${style.promptTh}`);
    lines.push(`อัตราส่วน: ${state.ratio}`);
    lines.push(``);

    // 🆕 v0.9.6: Vertical optimization สำหรับ 9:16 (Nano Banana ทำได้ไม่ดีตามปกติ)
    if (state.ratio === '9:16') {
      lines.push(`Vertical/portrait composition (9:16):`);
      lines.push(`- ตัวละครจัดกึ่งกลาง มีระยะปลอดภัยจากขอบ`);
      lines.push(`- shot with 85mm prime lens, f/8 aperture (deep focus)`);
      lines.push(`- DSLR/mirrorless camera quality, ultra-high-resolution vertical photography`);
      lines.push(`- ห้าม subject ถูก crop ตรงขอบ`);
      lines.push(``);
    }

    // 🆕 v0.9.8: Cover headline (ย้ายกลับมา Tab "สร้างแบบ")
    if (state.addCoverText) {
      const headline = (state.coverHeadline || '').trim();
      lines.push(`📝 ข้อความบนปก (ตัวอักษรไทย bold บนภาพ):`);
      if (headline) {
        lines.push(`   "${headline}"`);
      } else {
        lines.push(`   ใส่ headline สั้นๆ (4-8 คำ) ภาษาไทย เกี่ยวข้องกับยาในรูป ดึงดูดความสนใจ`);
      }
      lines.push(`   ตำแหน่ง: บนหรือล่าง 20% ของเฟรม สีเหลืองสด หรือ สีขาวขอบดำ`);
      lines.push(`   ตัวอักษร: bold ใหญ่ อ่านง่าย — สะกดถูก 100% ห้ามตัวอักษรไทยเพี้ยน`);
      lines.push(``);
    }

    lines.push(`Quality: ภาพคมชัดสูง 4K ทุกจุดในเฟรมต้องชัด ไม่มีจุดเบลอ ไม่มี depth-of-field, deep focus ทุกระยะ ใบหน้าคมชัด พื้นหลังคมชัด ไม่มี soft focus`);
    lines.push(`ห้าม: เปลี่ยนใบหน้าเภสัชกร, เปลี่ยนยา${state.addCoverText ? '' : ', ตัวอักษรบนรูป'}, ตัวอักษรไทยเพี้ยน, ภาพเบลอ, motion blur, background blur`);

    return lines.join('\n');
  }

  // =====================================================
  // Export ไป global เพื่อให้ sidepanel.js เรียกใช้
  // =====================================================
  window.RHModelOptions = {
    IMAGE_STYLES,
    CAMERA_ANGLES,
    BACKGROUNDS,
    DRUG_POSITIONS,           // alias for backward compat
    ITEM_POSITIONS,            // 🆕 v0.9.21
    MODEL_POSES,
    PARTNER_POSES,
    CHARACTER_POSITIONS,
    AUDIENCES,
    PHARMACIST_OUTFITS,        // alias for backward compat
    PROFESSIONAL_OUTFITS,      // 🆕 v0.9.21
    PROFESSIONS,               // 🆕 v0.9.21
    RATIOS,
    COUNTS,
    PROMPT_LANGUAGES,
    DEFAULTS,
    buildPrompt,

    // 🆕 Infographic
    INFOGRAPHIC_STYLES,
    INFOGRAPHIC_THEMES,
    INFOGRAPHIC_RATIOS,
    INFOGRAPHIC_DEFAULTS,
    buildInfographicPrompt,

    // 🎬 Video
    VIDEO_DIALECTS,
    VIDEO_STYLES,
    VIDEO_EMOTIONS,
    VIDEO_CAMERAS,
    VIDEO_GENDERS,
    VIDEO_DEFAULTS,
    VISUAL_DNA_PRESETS,    // 🆕 v0.9.8
    buildVideoPrompt
  };

  console.log('[RH Pharma] model-options.js loaded — options:', {
    styles: IMAGE_STYLES.length,
    angles: CAMERA_ANGLES.length,
    backgrounds: BACKGROUNDS.length,
    audiences: AUDIENCES.length,
    outfits: PHARMACIST_OUTFITS.length
  });
})();
