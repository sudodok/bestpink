# Pink Team Finance (ระบบบริหารจัดการเงินคณะสีชมพู)

ระบบบริหารจัดการบัญชีรับ-จ่ายและใบเบิกสวัสดิการแบบเรียลไทม์ สำหรับคณะสีชมพู (Pink Team) ในมหกรรมการแข่งขันกีฬา เพื่อให้สามารถตรวจสอบความโปร่งใสและควบคุมการใช้จ่ายงบประมาณภายในแต่ละฝ่ายได้อย่างปลอดภัย รวดเร็ว และไม่มีข้อผิดพลาด

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism Design & CSS Variables), JavaScript (ES6+)
- **Cloud Database & Backend**: Google Firebase Firestore (Realtime Synchronized Database)
- **Security & Session Auth**: Firebase Authentication (Email/Password & Anonymous Sessions)
- **Deployment Platform**: Vercel (Static Web Hosting)

---

## 🔒 ฟีเจอร์ระบบความปลอดภัย (Security Features)

1. **Authentication**:
   - สำหรับประธานและผู้ดูแลระบบ: เข้าระบบด้วยรหัสผ่านความปลอดภัยผ่าน **Firebase Auth (Email/Password)** โดยขจัดรหัสผ่าน plaintext ออกจากซอร์สโค้ดของ Client-side ทั้งหมดอย่างถาวร
   - สำหรับสมาชิกทั่วไป: เข้าระบบด้วยเลขประจำตัวนักเรียนและสิทธิยืนยันตัวตนแบบ **Anonymous Session** เพื่อสิทธิความปลอดภัยของ Session ประจำเครื่อง
2. **XSS Protection**:
   - มีระบบทำความสะอาดและล้างอักขระพิเศษ (HTML Escaping) ในฟิลด์รายละเอียด ข้อความ หรือบันทึกหมายเหตุที่ป้อนเข้ามาโดยผู้ใช้ ป้องกันปัญหา Stored Cross-Site Scripting (XSS) ในการเรนเดอร์เนื้อหาตาราง
3. **Database Security Rules**:
   - ล็อคกฎความปลอดภัย (Security Rules) บน Firebase Firestore เพื่ออนุญาตให้อ่านและสร้างคำขอเฉพาะผู้ใช้งานที่ผ่านการยืนยันตัวตนแล้วเท่านั้น และให้สิทธิการแก้ไขปรับปรุงตัวเลขการเงินเฉพาะบัญชีประธานสวัสดิการ
4. **Mobile Zoom Support**:
   - รองรับการทำ Accessibility ซูมย่อ-ขยายหน้าจอเพื่อตรวจสอบความชัดเจนของใบเสร็จบนบราวเซอร์มือถือ

---

## 📦 โครงสร้างโฟลเดอร์โครงการ

- `index.html`: โครงสร้างหน้าเว็บ หน้ากากดาวน์โหลด และโมเดลหน้าต่างตอบรับทั้งหมด
- `style.css`: ระบบดีไซน์ของสีชมพูพรีเมียม (CSS Variables, Sticky Headers, Responsive Table Scroller)
- `app.js`: ตรรกะระบบ การดึงข้อมูลแบบ Realtime Sync, กลไกความปลอดภัย และการทำธุรกรรมร่วมกับ Firebase
- `.gitignore`: ป้องกันการอัปโหลดไฟล์ชั่วคราวและโฟลเดอร์สำหรับเขียนสคริปต์สำรอง (`scratch/`) ขึ้น Git Hub

---

## 🚀 วิธีเปิดใช้งาน

1. โคลน Repository นี้ลงในเครื่องของคุณ:
   ```bash
   git clone https://github.com/sudodok/bestpink.git
   ```
2. ดับเบิ้ลคลิกไฟล์ `index.html` หรือรันคำสั่งเซิร์ฟเวอร์จำลองในเครื่องของคุณเพื่อเริ่มต้นใช้งานได้ทันที!
