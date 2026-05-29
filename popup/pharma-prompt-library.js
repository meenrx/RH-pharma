// =====================================================
// RH Pharma — Pharma Prompt Library (v0.10.0)
// =====================================================
// Library prompt สำเร็จรูปแยกตาม:
//   - กลุ่มยา (drug class) — 25+ กลุ่ม
//   - หัวข้อเฉพาะ (counseling, ADR, DDI, special population)
//   - คนใช้ (เภสัชกร / พยาบาล / ประชาชน)
// อ้างอิงแนวคิด KruBank prompt templates (250 KB) — แต่เขียนใหม่ทั้งหมดให้เหมาะกับงานเภสัช รพ.รัฐ
// =====================================================

const PharmaPromptLibrary = (() => {

  // ===== กลุ่มยา (Drug Classes) =====
  const DRUG_CLASSES = {
    'antihypertensive': {
      label: '💧 ยาลดความดันโลหิต',
      examples: ['Enalapril', 'Amlodipine', 'Losartan', 'Hydrochlorothiazide', 'Atenolol'],
      counselingPoints: [
        'กินสม่ำเสมอทุกวัน แม้ความดันลงปกติแล้ว',
        'ห้ามหยุดยาเองโดยไม่ปรึกษา',
        'ระวังลุกเร็ว — อาจมึนงง (โดยเฉพาะตอนเช้า)',
        'วัดความดันที่บ้านสัปดาห์ละ 2-3 ครั้ง',
        'ลดเค็ม ออกกำลังกาย ควบคุมน้ำหนัก'
      ],
      commonADR: ['ไอแห้ง (ACEI)', 'บวมข้อเท้า (CCB)', 'มึน', 'อ่อนเพลีย', 'ใจสั่น'],
      monitoringPoints: ['ความดันโลหิต', 'K+ (ACEI/ARB)', 'creatinine', 'อาการบวม']
    },
    'antidiabetic': {
      label: '🩸 ยารักษาเบาหวาน',
      examples: ['Metformin', 'Glipizide', 'Insulin', 'Sitagliptin', 'Empagliflozin'],
      counselingPoints: [
        'กินยาตรงเวลา ตามอาหาร',
        'รู้จักอาการน้ำตาลต่ำ (เหงื่อแตก ใจสั่น หิว) — มีน้ำตาล/ลูกอมติดตัว',
        'ตรวจน้ำตาลปลายนิ้วตามนัด',
        'ดูแลเท้า — ห้ามเดินเท้าเปล่า ตรวจเท้าทุกวัน',
        'ฉีดอินซูลินสับเปลี่ยนตำแหน่ง'
      ],
      commonADR: ['น้ำตาลต่ำ', 'ท้องเสีย (Metformin)', 'ติดเชื้อทางเดินปัสสาวะ (SGLT2)', 'น้ำหนักขึ้น'],
      monitoringPoints: ['FPG', 'HbA1c', 'creatinine', 'น้ำหนัก', 'ความดันโลหิต']
    },
    'lipid-lowering': {
      label: '🟡 ยาลดไขมัน (Statin)',
      examples: ['Simvastatin', 'Atorvastatin', 'Rosuvastatin', 'Gemfibrozil', 'Ezetimibe'],
      counselingPoints: [
        'กินก่อนนอน (statin หลายตัวออกฤทธิ์ตอนกลางคืน)',
        'หากปวดกล้ามเนื้อรุนแรง ปัสสาวะสีโคล่า — หยุดยา + พบแพทย์ทันที',
        'หลีกเลี่ยงน้ำเกรปฟรุต (Simvastatin/Atorvastatin)',
        'ตรวจไขมันทุก 3-6 เดือน',
        'ปรับอาหาร + ออกกำลังกายควบคู่'
      ],
      commonADR: ['ปวดกล้ามเนื้อ', 'ตับอักเสบ', 'ท้องอืด'],
      monitoringPoints: ['LDL', 'HDL', 'TG', 'AST/ALT', 'CK (เมื่อสงสัย myopathy)']
    },
    'antibiotic': {
      label: '🦠 ยาปฏิชีวนะ',
      examples: ['Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Cephalexin', 'Doxycycline'],
      counselingPoints: [
        'กินให้ครบตามจำนวนวันที่แพทย์สั่ง แม้อาการดีขึ้น',
        'กินตรงเวลา (ทุก 6/8/12 ชั่วโมง)',
        'แจ้งหากเคยแพ้ยา (โดยเฉพาะ penicillin)',
        'ไม่กินยาคนอื่น/ไม่ให้คนอื่นกิน',
        'หลีกเลี่ยงนม/ยาลดกรดร่วม (tetracycline, quinolone)'
      ],
      commonADR: ['ท้องเสีย', 'ผื่นแพ้', 'C. diff (long course)', 'photosensitivity (tetracycline)'],
      monitoringPoints: ['อาการดีขึ้นใน 48-72 ชม.', 'ผื่นแพ้', 'ท้องเสียรุนแรง']
    },
    'analgesic': {
      label: '💊 ยาแก้ปวด/ลดไข้',
      examples: ['Paracetamol', 'Ibuprofen', 'Naproxen', 'Tramadol', 'Diclofenac'],
      counselingPoints: [
        'Paracetamol ไม่เกิน 4 กรัม/วัน (8 เม็ด 500 mg)',
        'NSAID กินหลังอาหารทันที — ระวังโรคกระเพาะ ไต',
        'หากปวดเรื้อรัง > 3 วัน ให้พบแพทย์',
        'ห้ามใช้ NSAID ในผู้ป่วยไตเรื้อรัง/หัวใจวาย',
        'Tramadol — ห้ามขับรถหลังกิน'
      ],
      commonADR: ['ปวดท้อง (NSAID)', 'ตับอักเสบ (PCM เกินขนาด)', 'เลือดออกในกระเพาะ', 'ง่วง'],
      monitoringPoints: ['อาการปวดลดลงหรือไม่', 'อาการข้างเคียงทางเดินอาหาร', 'creatinine (NSAID เรื้อรัง)']
    },
    'anticoagulant': {
      label: '🩸 ยาต้านการแข็งตัวของเลือด',
      examples: ['Warfarin', 'Rivaroxaban', 'Apixaban', 'Dabigatran', 'Aspirin', 'Clopidogrel'],
      counselingPoints: [
        'หลีกเลี่ยงผักใบเขียวเยอะ (Warfarin)',
        'ระวังจุดเลือดออกผิดปกติ — ปัสสาวะแดง อุจจาระดำ ฟกช้ำ',
        'แจ้งทันตแพทย์/ศัลยแพทย์ก่อนผ่าตัด',
        'ตรวจ INR ตามนัด (Warfarin)',
        'ห้าม NSAID/aspirin โดยไม่ปรึกษา'
      ],
      commonADR: ['เลือดออกผิดปกติ', 'ฟกช้ำง่าย', 'เลือดออกในระบบทางเดินอาหาร'],
      monitoringPoints: ['INR (Warfarin target 2-3)', 'Hb', 'จุดเลือดออก', 'CrCl (NOAC)']
    },
    'gastric': {
      label: '🍽️ ยารักษาโรคกระเพาะ',
      examples: ['Omeprazole', 'Pantoprazole', 'Ranitidine', 'Famotidine', 'Antacid'],
      counselingPoints: [
        'PPI กินก่อนอาหาร 30-60 นาที',
        'Antacid กินห่างจากยาอื่น 2 ชั่วโมง',
        'ระวัง PPI ใช้ยาว — เสี่ยง B12 ต่ำ, แมกนีเซียมต่ำ',
        'ปรับพฤติกรรม — ลดเผ็ด เปรี้ยว ของทอด',
        'งดสูบบุหรี่ แอลกอฮอล์'
      ],
      commonADR: ['ท้องผูก (Al-antacid)', 'ท้องเสีย (Mg-antacid)', 'ปวดหัว (PPI)', 'B12 ต่ำ (PPI ระยะยาว)'],
      monitoringPoints: ['อาการแสบจุก', 'อุจจาระดำ', 'Mg/Ca/B12 (long-term)']
    },
    'asthma-copd': {
      label: '🌬️ ยาหอบหืด/ปอดอุดกั้น',
      examples: ['Salbutamol MDI', 'Budesonide', 'Tiotropium', 'Salmeterol', 'Theophylline'],
      counselingPoints: [
        'เขย่ายาก่อนพ่นทุกครั้ง',
        'ICS (steroid พ่น) ให้บ้วนปากหลังพ่น — กันเชื้อรา',
        'พ่นถูกเทคนิค — ใช้ spacer ในเด็ก',
        'พกยาฉุกเฉิน (SABA) ติดตัวเสมอ',
        'หลีกเลี่ยง trigger — ฝุ่น ควัน แมว'
      ],
      commonADR: ['ใจสั่น มือสั่น (SABA)', 'เชื้อราในปาก (ICS)', 'เสียงแหบ (ICS)'],
      monitoringPoints: ['ความถี่การใช้ SABA', 'PEFR', 'การกลับนอน รพ.', 'เทคนิคพ่นยา']
    },
    'thyroid': {
      label: '🦋 ยารักษาไทรอยด์',
      examples: ['Levothyroxine', 'PTU', 'Methimazole'],
      counselingPoints: [
        'Levothyroxine กินตอนท้องว่าง 30-60 นาทีก่อนอาหารเช้า',
        'ห่างจากแคลเซียม/เหล็ก/ยาลดกรด 4 ชั่วโมง',
        'ไม่หยุดยาเอง — ผลกระทบหัวใจ/พัฒนาการ',
        'ตรวจ TSH ทุก 6-12 เดือน',
        'PTU/MMI — ระวังเจ็บคอ ไข้ (agranulocytosis)'
      ],
      commonADR: ['ใจสั่น น้ำหนักลด (overdose)', 'เม็ดเลือดขาวต่ำ (PTU/MMI)'],
      monitoringPoints: ['TSH', 'FT4', 'CBC (PTU/MMI)']
    },
    'psych': {
      label: '🧠 ยาจิตเวช',
      examples: ['Fluoxetine', 'Sertraline', 'Risperidone', 'Olanzapine', 'Lithium', 'Lorazepam'],
      counselingPoints: [
        'SSRI ออกฤทธิ์เต็มที่ 4-6 สัปดาห์ — อย่าหยุดเอง',
        'Lithium ดื่มน้ำเพียงพอ ไม่ปรับเกลือกะทันหัน',
        'Antipsychotic — ระวัง EPS (กล้ามเนื้อกระตุก)',
        'BZD — ระวังติดยา ไม่ขับรถ',
        'แจ้งทันทีหากคิดทำร้ายตัวเอง'
      ],
      commonADR: ['คลื่นไส้ (SSRI สัปดาห์แรก)', 'น้ำหนักขึ้น (Olanzapine)', 'แห้งปาก ง่วง', 'EPS'],
      monitoringPoints: ['อาการ depression/psychosis', 'Lithium level', 'น้ำหนัก', 'metabolic profile']
    },
    'pediatric-suspension': {
      label: '👶 ยาน้ำเด็ก',
      examples: ['Paracetamol syrup', 'Amoxicillin dry syrup', 'Cefixime susp', 'Salbutamol syrup'],
      counselingPoints: [
        'เขย่าขวดก่อนใช้ทุกครั้ง',
        'วัดด้วย syringe — ไม่ใช่ช้อนกาแฟ',
        'ดูฉลากระบุน้ำหนัก/อายุเด็ก',
        'Dry syrup ผสมน้ำต้มสุกเย็น — ใช้ภายใน 7-14 วัน',
        'เก็บในตู้เย็น (ตามที่เภสัชกรแจ้ง)'
      ],
      commonADR: ['ท้องเสีย', 'ผื่น', 'อาเจียน'],
      monitoringPoints: ['น้ำหนักเด็ก', 'ไข้ลด', 'การกินอาหาร', 'ผื่น/ผิดปกติ']
    },
    'contraceptive': {
      label: '🌸 ยาคุมกำเนิด',
      examples: ['Oral contraceptive pill', 'Levonorgestrel', 'Medroxyprogesterone inj.'],
      counselingPoints: [
        'กินเวลาเดิมทุกวัน',
        'ลืมกิน < 12 ชม. → กินทันที | > 12 ชม. → ใช้คอนดอมเสริม 7 วัน',
        'ระวังปัจจัยเสี่ยง thrombosis (อ้วน สูบบุหรี่ > 35 ปี)',
        'ฉุกเฉิน (Levo): ภายใน 72 ชม. (เร็วยิ่งดี)',
        'ไม่ป้องกัน STD — ใช้คอนดอมเสริม'
      ],
      commonADR: ['คลื่นไส้', 'เลือดออกกะปริดกะปรอย', 'เจ็บเต้านม', 'อารมณ์แปรปรวน'],
      monitoringPoints: ['ความดันโลหิต', 'อาการขาบวม/เจ็บอก (DVT/PE)']
    },
    'anti-tb': {
      label: '🫁 ยาวัณโรค (Anti-TB)',
      examples: ['Isoniazid', 'Rifampicin', 'Pyrazinamide', 'Ethambutol'],
      counselingPoints: [
        'กินตรงเวลาทุกวัน — DOT (Direct Observed Therapy)',
        'Rifampicin ทำให้ฉี่ น้ำตา เหงื่อเป็นสีส้ม (ปกติ)',
        'Rifampicin ลดผลคุมกำเนิด — ใช้วิธีอื่นเสริม',
        'INH ทานวิตามิน B6 ร่วม (ป้องกัน neuropathy)',
        'Ethambutol — ตรวจตาทุก 1-2 เดือน'
      ],
      commonADR: ['ตับอักเสบ', 'ตามัว (Ethambutol)', 'ปลายประสาทอักเสบ (INH)', 'ผื่น'],
      monitoringPoints: ['LFT', 'การมองเห็น (Ethambutol)', 'น้ำหนัก', 'sputum AFB']
    },
    'antiviral-hiv': {
      label: '🦠 ยาต้านไวรัส (ARV)',
      examples: ['Tenofovir', 'Emtricitabine', 'Efavirenz', 'Dolutegravir'],
      counselingPoints: [
        'กินตรงเวลาเป๊ะ — adherence > 95% สำคัญที่สุด',
        'Efavirenz — กินก่อนนอน (ป้องกัน CNS effect)',
        'ห้ามขาดยา — เกิดเชื้อดื้อยา',
        'ปกปิดสถานะตามต้องการ — กิจกรรม peer support ที่ รพ.',
        'ใช้คอนดอมแม้ undetectable'
      ],
      commonADR: ['คลื่นไส้ (สัปดาห์แรก)', 'ฝันแปลก (Efavirenz)', 'ปวดศีรษะ', 'ผื่นแพ้รุนแรง (Abacavir)'],
      monitoringPoints: ['CD4', 'Viral load', 'creatinine (Tenofovir)', 'lipid']
    },
    'cardiac': {
      label: '❤️ ยาหัวใจ',
      examples: ['Digoxin', 'Amiodarone', 'Carvedilol', 'Furosemide', 'Spironolactone'],
      counselingPoints: [
        'Furosemide กินเช้า — ป้องกันตื่นกลางคืน',
        'ชั่งน้ำหนักทุกวันเวลาเดิม — ขึ้น > 2 kg/สัปดาห์ → แจ้งแพทย์',
        'Digoxin — ระวังคลื่นไส้ ตามัวเป็นสีเหลือง',
        'Beta-blocker ห้ามหยุดทันที — ค่อยๆ ลด',
        'จำกัดน้ำ/เกลือตามแพทย์สั่ง'
      ],
      commonADR: ['ฉี่บ่อย', 'K+ ต่ำ (Furosemide)', 'หัวใจเต้นช้า (Beta-blocker)', 'พิษ Digoxin'],
      monitoringPoints: ['น้ำหนัก', 'K+/Na+', 'BUN/Cr', 'EKG (Amiodarone)']
    }
  };

  // ===== Audience presets =====
  const AUDIENCE_TONES = {
    'public': {
      label: 'ประชาชน',
      readingLevel: 'ป.6',
      avoidJargon: true,
      analogies: true,
      length: '3-5 ประโยค สั้นกระชับ',
      voice: 'เป็นกันเอง อบอุ่น เหมือนเภสัชกรร้านยาในชุมชน'
    },
    'elderly': {
      label: 'ผู้สูงอายุ',
      readingLevel: 'ป.4',
      avoidJargon: true,
      analogies: true,
      length: '2-3 ประโยค สั้นมาก อ่านง่าย',
      voice: 'อ่อนน้อม ค่อยๆ อธิบาย ใช้คำที่คุ้นหู',
      visualNote: 'ตัวอักษรใหญ่ คอนทราสต์สูง'
    },
    'pediatric-parent': {
      label: 'ผู้ปกครองเด็ก',
      readingLevel: 'ม.ต้น',
      avoidJargon: false,
      analogies: true,
      length: '4-6 ประโยค ครอบคลุมความกังวล',
      voice: 'อบอุ่น เห็นใจ ให้กำลังใจพ่อแม่'
    },
    'pregnancy': {
      label: 'หญิงตั้งครรภ์/ให้นมบุตร',
      readingLevel: 'ม.ปลาย',
      avoidJargon: false,
      length: '4-6 ประโยค + เน้น "ปลอดภัยต่อทารก"',
      voice: 'เห็นใจ ระมัดระวัง ให้ข้อมูลครบ'
    },
    'nurse': {
      label: 'พยาบาล',
      readingLevel: 'มืออาชีพ',
      avoidJargon: false,
      length: 'mini-CPG 5-8 bullet',
      voice: 'ตรงประเด็น ใช้ศัพท์การแพทย์ได้',
      focusOn: ['monitoring', 'assessment', 'patient education']
    },
    'doctor': {
      label: 'แพทย์',
      readingLevel: 'expert',
      avoidJargon: false,
      length: 'clinical pearl 3-5 ข้อ',
      voice: 'concise, evidence-based',
      focusOn: ['PK/PD', 'DDI', 'special population', 'evidence']
    },
    'pharmacist': {
      label: 'เภสัชกร',
      readingLevel: 'expert',
      avoidJargon: false,
      length: 'counseling checklist + clinical pearls',
      voice: 'clinical pharmacy mindset',
      focusOn: ['DDI', 'dose adjustment', 'ADR monitoring', 'counseling points', 'formulary']
    },
    'hcp': {
      label: 'บุคลากรการแพทย์ (รวม)',
      readingLevel: 'intermediate',
      avoidJargon: false,
      length: 'overview 5-7 ข้อ',
      voice: 'multidisciplinary friendly'
    }
  };

  // ===== Special populations =====
  const SPECIAL_POP_NOTES = {
    pregnancy: {
      label: '🤰 หญิงตั้งครรภ์',
      consider: ['FDA pregnancy category', 'teratogenicity', 'placental transfer', 'trimester risk'],
      alternativeApproach: 'แนะนำ non-pharm ก่อนเสมอ'
    },
    lactation: {
      label: '🤱 ให้นมบุตร',
      consider: ['relative infant dose', 'oral bioavailability ในทารก', 'time peak (รอ peak ผ่านก่อนให้นม)'],
      alternativeApproach: 'เลือกยาที่ secrete ในน้ำนมน้อย'
    },
    pediatric: {
      label: '👶 เด็ก',
      consider: ['น้ำหนัก (mg/kg)', 'อายุ', 'รูปแบบยาเหมาะ', 'รสชาติ', 'ปริมาตร'],
      alternativeApproach: 'หา syrup/dry suspension ก่อน tablet'
    },
    elderly: {
      label: '👴 ผู้สูงอายุ',
      consider: ['CrCl ลด', 'polypharmacy', 'fall risk', 'cognitive', 'Beers criteria'],
      alternativeApproach: 'start low go slow'
    },
    ckd: {
      label: '🫘 โรคไตเรื้อรัง',
      consider: ['CrCl-based dosing', 'หลีกเลี่ยง nephrotoxic', 'electrolyte'],
      alternativeApproach: 'ปรับขนาดตาม CrCl'
    },
    cld: {
      label: '🫀 โรคตับ',
      consider: ['Child-Pugh', 'หลีกเลี่ยง hepatotoxic', 'drug metabolism'],
      alternativeApproach: 'หลีกเลี่ยง CYP-metabolized drug'
    }
  };

  // ===== Visual prompt templates สำหรับสร้างรูปสื่อสุขภาพ =====
  const VISUAL_PROMPTS = {
    'pharmacist-counseling': {
      label: '💊 เภสัชกรให้คำปรึกษา',
      promptEn: 'A friendly Thai pharmacist in white coat at hospital pharmacy counter, counseling a patient with medication in hand, warm clinical lighting, professional yet approachable, photorealistic',
      promptTh: 'เภสัชกรไทย ใส่เสื้อกาวน์ขาว ยืนที่เคาน์เตอร์ห้องยา รพ. กำลังอธิบายเรื่องยาให้คนไข้ แสงคลินิกอบอุ่น ดูเป็นมิตร'
    },
    'patient-medication-routine': {
      label: '⏰ คนไข้กินยาตามเวลา',
      promptEn: 'Elderly Thai patient at home taking medication with water glass, morning sunlight, family setting, calm and routine atmosphere',
      promptTh: 'ผู้สูงอายุชาวไทย กำลังกินยาที่บ้านพร้อมแก้วน้ำ แสงเช้า บรรยากาศครอบครัว สงบ'
    },
    'pharmacy-counter-rueso': {
      label: '🏥 ห้องยา รพ.รือเสาะ',
      promptEn: 'Modern hospital pharmacy counter in southern Thailand community hospital, organized medication shelves, bright clean lighting, Muslim-friendly design with subtle Islamic patterns',
      promptTh: 'ห้องยา รพ.ชุมชน ภาคใต้ของไทย ชั้นวางยาเป็นระเบียบ แสงสว่างสะอาด ออกแบบเข้ากับวัฒนธรรมมุสลิม'
    },
    'home-medication-storage': {
      label: '🏠 การเก็บยาที่บ้าน',
      promptEn: 'Organized home medication storage in a tray, pill organizer with days labeled, glasses of water nearby, clean kitchen counter, warm home atmosphere',
      promptTh: 'การจัดเก็บยาที่บ้านอย่างเป็นระเบียบ กล่องแบ่งยาตามวัน แก้วน้ำใกล้ๆ บนเคาน์เตอร์ห้องครัวสะอาด'
    },
    'mother-with-child-medication': {
      label: '👶 แม่ป้อนยาลูก',
      promptEn: 'Thai Muslim mother carefully measuring liquid medication with syringe to give to her child, soft kitchen lighting, gentle expression, hijab',
      promptTh: 'แม่มุสลิมไทย กำลังตวงยาน้ำด้วย syringe เพื่อให้ลูก ในห้องครัว แสงนุ่ม ใส่ฮิญาบ สีหน้าใจดี'
    },
    'community-pharmacy-rural': {
      label: '🌾 ร้านยาในชุมชน',
      promptEn: 'Rural southern Thailand community pharmacy, friendly pharmacist consulting locals, warm tropical sunlight through open shop front, palm trees outside',
      promptTh: 'ร้านยาในชุมชนชนบทภาคใต้ เภสัชกรเป็นกันเองให้คำปรึกษาชาวบ้าน แสงแดดร้อนชื้น มะพร้าวด้านนอก'
    },
    'hospital-ward-medication-round': {
      label: '🏥 พยาบาลให้ยาที่หอผู้ป่วย',
      promptEn: 'Thai nurse on medication round in hospital ward with medication trolley, checking patient identification carefully, clean ward setting',
      promptTh: 'พยาบาลไทยที่หอผู้ป่วย กำลัง round ยาด้วยรถเข็นยา ตรวจสอบชื่อผู้ป่วยอย่างละเอียด'
    },
    'family-doctor-visit': {
      label: '👨‍⚕️ ครอบครัวมาพบเภสัชกร',
      promptEn: 'Three-generation Thai family at hospital outpatient pharmacy window, pharmacist explaining medication patiently to elderly grandmother',
      promptTh: 'ครอบครัวไทย 3 รุ่น ที่ช่องจ่ายยา OPD เภสัชกรอธิบายยาให้คุณยายอย่างใจเย็น'
    }
  };

  // ===== Helper: build counseling prompt =====
  function buildCounselingPrompt(drugClass, audience, language = 'th') {
    const cls = DRUG_CLASSES[drugClass];
    const aud = AUDIENCE_TONES[audience] || AUDIENCE_TONES.public;
    if (!cls) throw new Error('ไม่รู้จัก drug class: ' + drugClass);

    const langInstruction = {
      th: 'เขียนเป็นภาษาไทยล้วน',
      ms: 'TULIS DALAM BAHASA MELAYU (selatan Thailand)',
      en: 'Write in English'
    }[language] || 'เขียนเป็นภาษาไทย';

    return `${langInstruction}

ภารกิจ: สร้าง content "counseling" ยากลุ่ม ${cls.label}
กลุ่มเป้าหมาย: ${aud.label} (${aud.voice})
ความยาว: ${aud.length}
ระดับภาษา: ${aud.readingLevel}

ยาในกลุ่มนี้: ${cls.examples.join(', ')}

ประเด็น counseling ที่สำคัญ:
${cls.counselingPoints.map(p => '- ' + p).join('\n')}

ADR ที่ต้องพูดถึง: ${cls.commonADR.join(', ')}

ข้อบังคับ:
- ห้ามใช้คำว่า "หายขาด", "รักษาให้หาย", "100%", "ปลอดภัย 100%"
- เน้น "ช่วยควบคุม/บรรเทา" แทน "รักษา"
- จบด้วย "ปรึกษาเภสัชกร" เสมอ
- ห้ามมี preamble เริ่มเนื้อหาเลย`;
  }

  return {
    DRUG_CLASSES,
    AUDIENCE_TONES,
    SPECIAL_POP_NOTES,
    VISUAL_PROMPTS,
    buildCounselingPrompt,
    listClasses: () => Object.keys(DRUG_CLASSES).map(k => ({ id: k, ...DRUG_CLASSES[k] }))
  };
})();

window.PharmaPromptLibrary = PharmaPromptLibrary;
console.log('[PharmaPromptLibrary] loaded —', Object.keys(PharmaPromptLibrary.DRUG_CLASSES).length, 'drug classes');
