# BioLab Interactive: ชีววิทยา ม.ปลาย เทอม 2
## อาณาจักรมอเนอรา (Kingdom Monera) และ อาณาจักรโพรติสตา (Kingdom Protista)

เว็บแอปพลิเคชันสำหรับเรียนรู้ด้วยตนเองแบบโต้ตอบ (Interactive Self-Learning Platform) ระดับมืออาชีพ พัฒนาขึ้นโดยแปลงเนื้อหาจากเอกสารประกอบการเรียน 2 ไฟล์ (รวม 55 สไลด์) ให้กลายเป็นระบบการเรียนรู้เชิงลึกด้วย Cognitive Science, Active Recall และ Spaced Repetition รองรับการใช้งานทั้งบน iPad, Tablet ทุกขนาด, สมาร์ตโฟน และคอมพิวเตอร์

---

### คุณสมบัติเด่น (Key Features)

1. **เนื้อหาครบถ้วน 100% (55 สไลด์):**
   - Kingdom Monera (31 สไลด์)
   - Kingdom Protista (24 สไลด์)
   - สกัดและวิเคราะห์ทั้งข้อความ ตาราง แผนภาพ และข้อมูลในรูปภาพอย่างละเอียด

2. **ระบบ 4 มิติการเรียนรู้ (4-Box Quadrant):**
   - 📘 **Original Content:** เนื้อหาจากสไลด์ต้นฉบับครบ 100%
   - 🔬 **Deep Explanation:** คำอธิบายหลักการเบื้องหลังทางชีวเคมีและวิวัฒนาการ
   - 🌍 **Real-World Examples:** กรณีศึกษาและตัวอย่างในชีวิตจริง
   - 💡 **Pro Tips & Notes:** ข้อสังเกต เทคนิคจำ และจุดเน้นข้อสอบ

3. **ศูนย์ฝึกความจำระดับโปร (Memory Training Studio):**
   - 🃏 **Flashcards:** บัตรคำ 98 ใบ พร้อมระบบจัดตารางทบทวน Leitner 5 กล่อง
   - ✏️ **Fill in the Blanks:** แบบฝึกหัดเติมคำ 34 ข้อจากเนื้อหาจริง
   - 🧠 **Free Recall:** ฝึกนึกและเขียนประเด็นความจำพร้อมเปิด Cues ทีละขั้น
   - 🔀 **Sequence Memory:** เรียงลำดับ 6 กระบวนการชีววิทยาสำคัญ
   - 👁️ **Visual Memory:** ศึกษาและจำตำแหน่งแผนภาพกายวิภาค 6 แผนภาพ
   - 📑 **Slide-by-Slide Walkthrough:** โหมดเดินตามสไลด์ตั้งแต่หน้าแรกจนถึงหน้าสุดท้าย

4. **การออกแบบสำหรับ iPad & Tablet (Apple-like UX/UI):**
   - Modern Minimalist ด้วย Apple Design System
   - รองรับ Safe Area Insets (`env(safe-area-inset-*)`)
   - ป้องกัน Horizontal Overflow 100%
   - Dynamic Viewport Height (`100dvh`)
   - รองรับ Dark Mode และ Light Mode
   - Touch Target ขั้นต่ำ 44x44px

---

### วิธีการเปิดใช้งาน (How to Run)

#### วิธีที่ 1: เปิดผ่านเบราว์เซอร์โดยตรง (Standalone)
ดับเบิลคลิกเปิดไฟล์ `index.html` ผ่าน Google Chrome, Microsoft Edge, หรือ Safari ได้ทันทีโดยไม่ต้องติดตั้งโปรแกรมเพิ่มเติม

#### วิธีที่ 2: รันผ่าน Local Web Server
เปิด Terminal / PowerShell ในโฟลเดอร์โปรเจกต์ แล้วรันคำสั่ง:
```bash
python -m http.server 8080
```
จากนั้นเปิดเบราว์เซอร์ไปที่: `http://localhost:8080/index.html`

#### วิธีที่ 3: เผยแพร่ผ่าน Vercel (Public on Vercel)
โปรเจกต์นี้ได้รับการปรับแต่งไฟล์ `vercel.json` และโครงสร้างเรียบร้อยแล้ว:
1. เข้าไปที่ [Vercel Dashboard](https://vercel.com/new)
2. นำเข้า (Import) Repository `Newwee/BioTerm2`
3. กด **Deploy** ได้ทันทีโดยไม่ต้องตั้งค่า Build Command เพิ่มเติม ระบบจะ Deploy ขึ้นเป็น Public Website ทันที

