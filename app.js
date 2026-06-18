// ========== FIREBASE CONFIGURATION ==========
const firebaseConfig = {
  apiKey: "AIzaSyBd_pyErc9_R8khJ_C7-T0MH9YeP9fMChw",
  authDomain: "pink-team-sports-86e69.firebaseapp.com",
  projectId: "pink-team-sports-86e69",
  storageBucket: "pink-team-sports-86e69.firebasestorage.app",
  messagingSenderId: "629781285829",
  appId: "1:629781285829:web:9c91cdaac966a16ce359ac",
  measurementId: "G-PK1JSB9T32"
};

let db = null;
let useFirebase = false;

// เริ่มต้นใช้งาน Firebase
if (typeof firebase !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        useFirebase = true;
        console.log("🔥 Firebase initialized successfully! Connected to Firestore Database.");
    } catch (e) {
        console.error("Firebase init failed, running in local database mode:", e);
    }
}

// Placeholder SVGs to use as mock default images
const MOCK_RECEIPT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260" style="background-color:%23f1f5f9;font-family:sans-serif;"><rect width="180" height="240" x="10" y="10" rx="5" fill="white" stroke="%23cbd5e1" stroke-width="2"/><line x1="25" y1="40" x2="175" y2="40" stroke="%23334155" stroke-width="2" stroke-dasharray="4"/><text x="25" y="65" fill="%231e293b" font-size="14" font-weight="bold">RECEIPT</text><text x="25" y="85" fill="%2364748b" font-size="10">Pink Team Sports Day</text><text x="25" y="120" fill="%23334155" font-size="11">Purchased Item</text><text x="25" y="140" fill="%2364748b" font-size="10">Tax invoice included</text><line x1="25" y1="180" x2="175" y2="180" stroke="%23cbd5e1" stroke-width="1"/><text x="25" y="205" fill="%231e293b" font-size="14" font-weight="bold">TOTAL</text><text x="110" y="205" fill="%23ec4899" font-size="14" font-weight="bold">Reimburse</text></svg>`;

const MOCK_PRODUCT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" style="background-color:%23fce7f3;font-family:sans-serif;"><rect width="180" height="180" x="10" y="10" rx="8" fill="white" stroke="%23f472b6" stroke-width="2"/><circle cx="100" cy="90" r="40" fill="%23f472b6" opacity="0.3"/><rect width="30" height="50" x="85" y="75" fill="%23ec4899" rx="3"/><text x="45" y="160" fill="%23db2777" font-size="12" font-weight="bold">PRODUCT IMAGE</text></svg>`;

const MOCK_QRCODE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" style="background-color:%23e0f2fe;font-family:sans-serif;"><rect width="180" height="180" x="10" y="10" rx="10" fill="white" stroke="%230284c7" stroke-width="2"/><rect width="40" height="40" x="25" y="25" fill="%230f172a"/><rect width="20" height="20" x="35" y="35" fill="white"/><rect width="40" height="40" x="135" y="25" fill="%230f172a"/><rect width="20" height="20" x="145" y="35" fill="white"/><rect width="40" height="40" x="25" y="135" fill="%230f172a"/><rect width="20" height="20" x="35" y="145" fill="white"/><rect width="20" height="20" x="85" y="85" fill="%230f172a"/><rect width="20" height="20" x="105" y="105" fill="%230f172a"/><text x="60" y="180" fill="%230284c7" font-size="11" font-weight="bold">PROMPTPAY QR</text></svg>`;

const MOCK_SLIP_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260" style="background-color:%23dcfce7;font-family:sans-serif;"><rect width="180" height="240" x="10" y="10" rx="12" fill="white" stroke="%2322c55e" stroke-width="3"/><circle cx="100" cy="55" r="25" fill="%2322c55e" opacity="0.2"/><path d="M90 55 L97 62 L112 47" fill="none" stroke="%2322c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="50" y="105" fill="%23166534" font-size="14" font-weight="bold">E-SLIP SUCCESS</text><text x="30" y="135" fill="%234b5563" font-size="10">Sender: Welfare Pres.</text><text x="30" y="155" fill="%234b5563" font-size="10">Bank: PromptPay App</text><line x1="25" y1="180" x2="175" y2="180" stroke="%23e5e7eb" stroke-width="1"/><text x="30" y="210" fill="%23111827" font-size="13" font-weight="bold">AMOUNT</text><text x="110" y="210" fill="%2322c55e" font-size="13" font-weight="bold">TRANSFERED</text></svg>`;

// App State (Dedicated to Pink Team, completely empty initial values)
let state = {
    user: null,          // Logged in user {name, department, role}
    incomes: [],         // [{id, desc, amount, date, actor}]
    allocations: {       // Department budget allocations
        stand: 0,
        leaders: 0,
        parade: 0,
        welfare: 0,
        props: 0,
        sports: 0
    },
    requests: [],        // [{id, name, department, item, amount, category, memo, receipt, productPhoto, qrcode, transferSlip, status, rejectReason, approvedBy, date}]
    logs: [],            // [{id, date, type, desc, actor}]
    issues: [],          // [{id, title, category, reporterName, reporterRole, desc, status, date, reply}]
    members: []          // Dynamic member list [{id, firstName, lastName}]
};

// Standard Departments mapping
const DEPARTMENTS = {
    stand: { name: '🎨 ฝ่ายสแตนด์เชียร์', color: 'var(--dept-stand)' },
    leaders: { name: '💃 ฝ่ายเชียร์ลีดเดอร์', color: 'var(--dept-leaders)' },
    parade: { name: '🎺 ฝ่ายขบวนพาเหรด', color: 'var(--dept-parade)' },
    welfare: { name: '🍱 ฝ่ายสวัสดิการและอาหาร', color: 'var(--dept-welfare)' },
    props: { name: '🎭 ฝ่ายอุปกรณ์และฉาก', color: 'var(--dept-props)' },
    sports: { name: '👟 ฝ่ายนักกีฬา', color: 'var(--dept-sports)' }
};

// ========== รายชื่อสมาชิกคณะสีชมพู ==========
const MEMBERS = [
    // 5/1 (จากรูปภาพน้องอาม)
    { id: '39967', firstName: 'กฤติธี',     lastName: 'แสนคำ',       room: '5/1' },
    { id: '39998', firstName: 'เกียรติสกุล', lastName: 'กันกา',       room: '5/1' },
    { id: '40019', firstName: 'จิรัฏฐ์',     lastName: 'บัตริยะ',     room: '5/1' },
    { id: '40050', firstName: 'จยุตพงศ์',   lastName: 'ดีคำ',        room: '5/1' },
    { id: '40059', firstName: 'ชิษณุพงศ์',   lastName: 'ทะจักร์',     room: '5/1' },
    { id: '40206', firstName: 'ปาลปวีณ์',   lastName: 'สินมณี',      room: '5/1' },
    { id: '40309', firstName: 'ภาวิต',      lastName: 'ภาสสัทธา',    room: '5/1' },
    { id: '40338', firstName: 'วรนน',       lastName: 'สัจจะนรพันธ์', room: '5/1' },
    { id: '40350', firstName: 'วิเชียรรัตน์',  lastName: 'ดอกแก้ว',     room: '5/1' },
    { id: '39993', firstName: 'กิตพร',      lastName: 'เพชรพัฒนากุล', room: '5/1' },
    { id: '40049', firstName: 'ชญาดา',      lastName: 'สมบูรณ์',     room: '5/1' },
    { id: '40076', firstName: 'ณฤดี',       lastName: 'ศรีเจริญภากร',  room: '5/1' },
    { id: '40087', firstName: 'ณัฐชยาน์',    lastName: 'แก้วกล้า',     room: '5/1' },
    { id: '40092', firstName: 'ณัฐภัสสร',    lastName: 'ยศเลิศ',      room: '5/1' },
    { id: '40122', firstName: 'ธนพร',      lastName: 'ใจยะ',       room: '5/1' },
    { id: '40132', firstName: 'ธนิสตา',     lastName: 'สีอินทร์',     room: '5/1' },
    { id: '40179', firstName: 'ปณิตา',      lastName: 'ถุงพลอย',     room: '5/1' },
    { id: '40200', firstName: 'ปัทมพร',     lastName: 'กาดเกษม',     room: '5/1' },
    { id: '40202', firstName: 'ปานปั้น',     lastName: 'นุชธิสาร',     room: '5/1' },
    { id: '40245', firstName: 'พัทธนันท์',    lastName: 'คำลือ',       room: '5/1' },
    { id: '40266', firstName: 'พิมพ์ลภัส',    lastName: 'แตกฉาน',      room: '5/1' },
    { id: '40294', firstName: 'ภรภัทร',      lastName: 'ไชยยงยศ',     room: '5/1' },
    { id: '40352', firstName: 'วิภาดา',     lastName: 'แสนสนั่น',     room: '5/1' },
    { id: '40363', firstName: 'ศศินิภา',     lastName: 'โปธาตุ',      room: '5/1' },
    { id: '40376', firstName: 'ศุภรดา',     lastName: 'ศิริบรรพต',    room: '5/1' },
    { id: '40380', firstName: 'ศุภิสรา',     lastName: 'แก้วมา',      room: '5/1' },
    { id: '42242', firstName: 'ณัฏฐณิชา',    lastName: 'สมนึก',       room: '5/1' },
    { id: '42260', firstName: 'นันท์นภัส',   lastName: 'ศรีชมภู',     room: '5/1' },
    { id: '42283', firstName: 'ไพลิน',      lastName: 'ฤทธิ์สมบูรณ์', room: '5/1' },

    // 5/8 (รายชื่อคณะสีชมพูที่เหลือทั้งหมด)
    { id: '40119', firstName: 'ธนโชติ',     lastName: 'แจ้งเลิศ',     room: '5/8' },
    { id: '40134', firstName: 'ธรรมรัตน์',   lastName: 'อุดรศรี',      room: '5/8' },
    { id: '40195', firstName: 'ปองคุณ',      lastName: 'อรรคชัยพานิช',  room: '5/8' },
    { id: '42230', firstName: 'กฤษณ์',       lastName: 'ลือวัฒนานนท์', room: '5/8' },
    { id: '42235', firstName: 'คณิศร',       lastName: 'กิ่งกันคำ',     room: '5/8' },
    { id: '42264', firstName: 'ปกรณ์เกียรติ', lastName: 'เคนจอม',      room: '5/8' },
    { id: '42272', firstName: 'พงศกร',       lastName: 'อุดเวียง',      room: '5/8' },
    { id: '42273', firstName: 'พชร',         lastName: 'จักรเงิน',      room: '5/8' },
    { id: '42280', firstName: 'พีรพัฒน์',    lastName: 'แสนคำวัง',     room: '5/8' },
    { id: '42281', firstName: 'พีรวัส',      lastName: 'วังหา',       room: '5/8' },
    { id: '42303', firstName: 'อาทิตย์',     lastName: 'กาญจนกูล',     room: '5/8' },
    { id: '39954', firstName: 'กฤตภรณ์',    lastName: 'พรินทรากูล',   room: '5/8' },
    { id: '39976', firstName: 'กัญญาณัฐ',   lastName: 'สุขศิลปชัย',    room: '5/8' },
    { id: '39979', firstName: 'กัญญารัตน์',   lastName: 'เรื่องขจร',     room: '5/8' },
    { id: '39988', firstName: 'กาญจนา',     lastName: 'เหมืองจา',     room: '5/8' },
    { id: '40037', firstName: 'ชนัญชิตา',   lastName: 'สายาจักร',     room: '5/8' },
    { id: '40054', firstName: 'ชวิศา',      lastName: 'คงคารักษ์',     room: '5/8' },
    { id: '40057', firstName: 'ชลลิสา',     lastName: 'คำปาแฝง',     room: '5/8' },
    { id: '40088', firstName: 'ณัฐธิดา',    lastName: 'ไชยยอด',      room: '5/8' },
    { id: '40104', firstName: 'ตามภรณ์',    lastName: 'ชัยชนะ',      room: '5/8' },
    { id: '40109', firstName: 'ทักษพร',     lastName: 'อุดร',        room: '5/8' },
    { id: '40112', firstName: 'ธนิตากานต์', lastName: 'ธนสาร',       room: '5/8' },
    { id: '40147', firstName: 'ธิดารัตน์',  lastName: 'วิเชียรกันทา',   room: '5/8' },
    { id: '40161', firstName: 'นันท์ชพร',   lastName: 'เสนากูล',      room: '5/8' },
    { id: '40184', firstName: 'ปภาวรินทร์', lastName: 'บุตรเสน',      room: '5/8' },
    { id: '40185', firstName: 'ปภาวรินทร์', lastName: 'วังอินทร์',     room: '5/8' },
    { id: '40232', firstName: 'พรอนงค์',    lastName: 'ยาสุปิ',       room: '5/8' },
    { id: '40244', firstName: 'พัทธ์ธิดา',  lastName: 'วาสนาโลก',     room: '5/8' },
    { id: '40267', firstName: 'พิมพ์ลภัส',  lastName: 'วันมหาใจ',     room: '5/8' },
    { id: '40318', firstName: 'มนัญชยา',    lastName: 'อินต๊ะวงศ์',    room: '5/8' },
    { id: '40339', firstName: 'วรณัน',      lastName: 'อินต๊ะจัง',     room: '5/8' },
    { id: '40359', firstName: 'ศกุลตลา',    lastName: 'คชปัญญา',     room: '5/8' },
    { id: '40404', firstName: 'สุภนิตา',    lastName: 'ถาป้อม',       room: '5/8' },
    { id: '40424', firstName: 'อัญชิษฐา',   lastName: 'วาปีศิริ',      room: '5/8' },
    { id: '42240', firstName: 'ฐิตาภา',     lastName: 'คำน้ำปาด',     room: '5/8' },
    { id: '42243', firstName: 'ณัฐกฤตา',    lastName: 'อุตสม',       room: '5/8' },
    { id: '42250', firstName: 'ธมลวรรณ',    lastName: 'อินจันทร์',     room: '5/8' },
    { id: '42276', firstName: 'พัทธ์ธีรา',  lastName: 'ประพัศรางค์',   room: '5/8' },
    { id: '40281', firstName: 'วุฒินันท์',  lastName: 'นันทะไสย',     room: '5/8' },
    { id: '42292', firstName: 'วนัชพร',     lastName: 'กาศสนุก',      room: '5/8' },
    { id: '42932', firstName: 'ภิรพัชร',    lastName: 'หิรัตน์พันธุ์',   room: '5/8' }
];

// ========== Autocomplete: ค้นหาสมาชิกจากชื่อ/นามสกุล ==========
function handleMemberSearch(query) {
    const list = document.getElementById('member-suggest-list');
    const q = query.trim();

    if (q.length === 0) {
        // ซ่อนรายชื่อเมื่อยังไม่ได้พิมพ์ค้นหา
        list.style.display = 'none';
        return;
    }

    const filtered = state.members.filter(m =>
        m.firstName.includes(q) ||
        m.lastName.includes(q) ||
        (m.firstName + m.lastName).includes(q) ||
        (m.firstName + ' ' + m.lastName).includes(q) ||
        m.id.includes(q)
    );
    renderSuggestions(filtered);
}

function renderSuggestions(members) {
    const list = document.getElementById('member-suggest-list');
    if (members.length === 0) {
        list.style.display = 'none';
        return;
    }
    list.style.display = 'block';
    list.innerHTML = members.map(m => `
        <div onclick="selectMember('${m.id}', '${m.firstName}', '${m.lastName}')"
             style="padding: 0.6rem 1rem; cursor: pointer; border-bottom: 1px solid var(--border-color);
                    transition: background 0.15s; font-size: 0.9rem;"
             onmouseover="this.style.background='var(--accent-primary-alpha, rgba(236,72,153,0.12))'"
             onmouseout="this.style.background='transparent'">
            <span style="color: var(--text-primary); font-weight: 600;">${m.firstName} ${m.lastName} (${m.room || '5/8'})</span>
        </div>
    `).join('');
}

function selectMember(id, firstName, lastName) {
    document.getElementById('login-member-name').value = firstName + ' ' + lastName;
    document.getElementById('login-member-id').value = id;
    document.getElementById('member-suggest-list').style.display = 'none';
}

// ปิด dropdown เมื่อคลิกที่อื่น
document.addEventListener('click', function(e) {
    const nameInput = document.getElementById('login-member-name');
    const list = document.getElementById('member-suggest-list');
    if (list && nameInput && !nameInput.contains(e.target) && !list.contains(e.target)) {
        list.style.display = 'none';
    }
});


// Helper: Format currency
function formatCurrency(amount) {
    return '฿' + amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper: Format Date Time
function formatDateTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('th-TH') + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

// Helper: Convert Dept code to Display text
function getDeptDisplayName(deptCode) {
    return DEPARTMENTS[deptCode] ? DEPARTMENTS[deptCode].name : deptCode || 'ไม่ระบุฝ่าย';
}

// Database-supported Save & Load Handlers (Firebase, IndexedDB & LocalStorage fallback)
function saveToLocalStorage() {
    // 1. Save to LocalStorage immediately with try-catch to handle quota limits
    try {
        localStorage.setItem('pink_team_finance_state_v3', JSON.stringify(state));
    } catch (e) {
        console.error("LocalStorage save failed:", e);
        if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            alert("⚠️ บันทึกข้อมูลลงเบราว์เซอร์ไม่สำเร็จเนื่องจากขนาดรูปภาพใหญ่เกินขีดจำกัด (Quota Exceeded) ระบบจะพยายามบันทึกลงฐานข้อมูลสำรอง IndexedDB แทน");
        }
    }
    
    // 2. Save to IndexedDB (asynchronous database)
    try {
        const request = indexedDB.open('pink_team_finance_db', 1);
        request.onupgradeneeded = (e) => {
            const dbObj = e.target.result;
            if (!dbObj.objectStoreNames.contains('app_state')) {
                dbObj.createObjectStore('app_state');
            }
        };
        request.onsuccess = (e) => {
            const dbObj = e.target.result;
            try {
                const tx = dbObj.transaction('app_state', 'readwrite');
                const store = tx.objectStore('app_state');
                store.put(state, 'current_state');
            } catch(err) {
                console.error("IndexedDB write error:", err);
            }
        };
    } catch (e) {
        console.warn("IndexedDB not supported or blocked on this protocol:", e);
    }
}

// Helper: Sync single item to Firestore
function syncItemToFirebase(collectionName, itemId, data) {
    if (useFirebase && db) {
        db.collection(collectionName).doc(itemId).set(data)
            .then(() => console.log(`🔥 Synced document: ${collectionName}/${itemId}`))
            .catch(err => console.error(`Firebase sync error for ${collectionName}/${itemId}:`, err));
    }
}

// Helper: Seed Firebase from local cache
function seedFirebaseFromLocal() {
    if (!useFirebase || !db) return;
    console.log("Seeding Firebase Firestore from local data...");
    
    state.requests.forEach(req => syncItemToFirebase('requests', req.id, req));
    state.incomes.forEach(inc => syncItemToFirebase('incomes', inc.id, inc));
    state.logs.forEach(log => syncItemToFirebase('logs', log.id, log));
    state.issues.forEach(issue => syncItemToFirebase('issues', issue.id, issue));
    syncItemToFirebase('settings', 'allocations', state.allocations);
    syncItemToFirebase('settings', 'members', { list: state.members });
}

function sanitizeState() {
    if (!state) {
        state = {
            user: null,
            incomes: [],
            allocations: { stand: 0, leaders: 0, parade: 0, welfare: 0, props: 0, sports: 0 },
            requests: [],
            logs: [],
            issues: [],
            members: [...MEMBERS]
        };
        return;
    }
    if (!state.incomes) state.incomes = [];
    if (!state.allocations) {
        state.allocations = { stand: 0, leaders: 0, parade: 0, welfare: 0, props: 0, sports: 0 };
    } else {
        const depts = ['stand', 'leaders', 'parade', 'welfare', 'props', 'sports'];
        depts.forEach(d => {
            if (state.allocations[d] === undefined) {
                state.allocations[d] = 0;
            }
        });
    }
    if (!state.requests) state.requests = [];
    if (!state.logs) state.logs = [];
    if (!state.issues) state.issues = [];
    if (!state.members || state.members.length === 0) {
        state.members = [...MEMBERS];
    } else {
        // ตรวจสอบว่าเคยอัปเกรดข้อมูลห้องเรียนไปแล้วหรือยัง (เช็คว่ามีสมาชิกที่มีข้อมูลห้องเรียนอยู่แล้วหรือไม่)
        const hasRooms = state.members.some(m => m.room !== undefined);
        
        if (!hasRooms) {
            // อัปเกรดข้อมูลห้องเรียนและแก้ไขตัวสะกดให้ถูกต้องเฉพาะในครั้งแรกเท่านั้น
            const ids_5_1 = [
                '39967', '39998', '40019', '40050', '40059', '40206', '40309', '40338', '40350',
                '39993', '40049', '40076', '40087', '40092', '40122', '40132', '40179', '40200',
                '40202', '40245', '40266', '40294', '40352', '40363', '40376', '40380', '42242',
                '42260', '42283'
            ];
            
            const nameMap = {
                '40050': { firstName: 'จยุตพงศ์', lastName: 'ดีคำ' },
                '40049': { firstName: 'ชญาดา', lastName: 'สมบูรณ์' },
                '40087': { firstName: 'ณัฐชยาน์', lastName: 'แก้วกล้า' },
                '40200': { firstName: 'ปัทมพร', lastName: 'กาดเกษม' }
            };
            
            // เพิ่ม 40206 (ปาลปวีณ์ สินมณี) เข้าไปในระบบหากยังไม่มี
            if (!state.members.some(m => m.id === '40206')) {
                state.members.push({ id: '40206', firstName: 'ปาลปวีณ์', lastName: 'สินมณี', room: '5/1' });
            }
            
            state.members.forEach(m => {
                m.room = ids_5_1.includes(m.id) ? '5/1' : '5/8';
                if (nameMap[m.id]) {
                    m.firstName = nameMap[m.id].firstName;
                    m.lastName = nameMap[m.id].lastName;
                }
            });
            
            // บันทึกและซิงก์ข้อมูลทันทีหลังอัปเกรด
            saveToLocalStorage();
            if (useFirebase && db) {
                syncItemToFirebase('settings', 'members', { list: state.members });
            }
        }
    }
}

function loadFromDatabase(callback) {
    if (useFirebase && db) {
        console.log("Attempting to connect to Firebase Firestore (collection-based schema)...");
        let hasLoaded = false;
        
        // Timeout 3.5 seconds
        const fbTimeout = setTimeout(() => {
            if (!hasLoaded) {
                console.warn("⚠️ Firebase connection timed out. Falling back to local database...");
                useFirebase = false; 
                loadLocalData(callback);
            }
        }, 3500);

        // Fetch all collections
        Promise.all([
            db.collection('requests').get(),
            db.collection('incomes').get(),
            db.collection('logs').get(),
            db.collection('issues').get(),
            db.collection('settings').doc('allocations').get(),
            db.collection('settings').doc('members').get()
        ]).then(([requestsSnap, incomesSnap, logsSnap, issuesSnap, allocationsSnap, membersSnap]) => {
            if (hasLoaded) return;
            hasLoaded = true;
            clearTimeout(fbTimeout);

            const currentUser = state.user;
            
            // Check if Firebase is completely brand-new / empty
            if (requestsSnap.empty && incomesSnap.empty && logsSnap.empty && issuesSnap.empty) {
                console.log("Firebase contains no collection data. Seeding with local state...");
                loadLocalData(() => {
                    seedFirebaseFromLocal();
                    setupFirebaseRealtimeListener();
                    callback();
                });
            } else {
                state.requests = [];
                requestsSnap.forEach(doc => state.requests.push(doc.data()));
                
                state.incomes = [];
                incomesSnap.forEach(doc => state.incomes.push(doc.data()));
                
                state.logs = [];
                logsSnap.forEach(doc => state.logs.push(doc.data()));
                
                state.issues = [];
                issuesSnap.forEach(doc => state.issues.push(doc.data()));
                
                if (allocationsSnap.exists) {
                    state.allocations = allocationsSnap.data();
                } else {
                    state.allocations = { stand: 0, leaders: 0, parade: 0, welfare: 0, props: 0, sports: 0 };
                }

                if (membersSnap && membersSnap.exists) {
                    state.members = membersSnap.data().list || [];
                }
                
                state.user = currentUser;
                sanitizeState();
                
                console.log("State loaded successfully from Firebase Firestore Collections.");
                saveToLocalStorage();
                setupFirebaseRealtimeListener();
                callback();
            }
        }).catch(err => {
            if (hasLoaded) return;
            hasLoaded = true;
            clearTimeout(fbTimeout);
            console.error("Error loading from Firebase Collections, falling back to local database:", err);
            loadLocalData(callback);
        });
    } else {
        loadLocalData(callback);
    }
}

let firebaseListeners = [];
function setupFirebaseRealtimeListener() {
    if (!useFirebase || !db) return;
    
    // Clear existing listeners
    if (firebaseListeners.length > 0) {
        firebaseListeners.forEach(unsub => unsub());
        firebaseListeners = [];
    }
    
    console.log("Setting up multi-collection Firestore realtime listeners...");
    
    // 1. Listen to requests
    const unsubRequests = db.collection('requests').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const docData = change.doc.data();
            const idx = state.requests.findIndex(r => r.id === docData.id);
            if (change.type === 'added' || change.type === 'modified') {
                if (idx > -1) {
                    state.requests[idx] = docData;
                } else {
                    state.requests.push(docData);
                }
            } else if (change.type === 'removed') {
                if (idx > -1) {
                    state.requests.splice(idx, 1);
                }
            }
        });
        saveToLocalStorage();
        if (state.user) renderAll();
    }, err => console.error("Realtime requests sync error:", err));
    firebaseListeners.push(unsubRequests);

    // 2. Listen to incomes
    const unsubIncomes = db.collection('incomes').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const docData = change.doc.data();
            const idx = state.incomes.findIndex(i => i.id === docData.id);
            if (change.type === 'added' || change.type === 'modified') {
                if (idx > -1) {
                    state.incomes[idx] = docData;
                } else {
                    state.incomes.push(docData);
                }
            } else if (change.type === 'removed') {
                if (idx > -1) {
                    state.incomes.splice(idx, 1);
                }
            }
        });
        saveToLocalStorage();
        if (state.user) renderAll();
    }, err => console.error("Realtime incomes sync error:", err));
    firebaseListeners.push(unsubIncomes);

    // 3. Listen to logs
    const unsubLogs = db.collection('logs').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const docData = change.doc.data();
            const idx = state.logs.findIndex(l => l.id === docData.id);
            if (change.type === 'added' || change.type === 'modified') {
                if (idx > -1) {
                    state.logs[idx] = docData;
                } else {
                    state.logs.push(docData);
                }
            } else if (change.type === 'removed') {
                if (idx > -1) {
                    state.logs.splice(idx, 1);
                }
            }
        });
        saveToLocalStorage();
        if (state.user) renderAll();
    }, err => console.error("Realtime logs sync error:", err));
    firebaseListeners.push(unsubLogs);

    // 4. Listen to issues
    const unsubIssues = db.collection('issues').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const docData = change.doc.data();
            const idx = state.issues.findIndex(i => i.id === docData.id);
            if (change.type === 'added' || change.type === 'modified') {
                if (idx > -1) {
                    state.issues[idx] = docData;
                } else {
                    state.issues.push(docData);
                }
            } else if (change.type === 'removed') {
                if (idx > -1) {
                    state.issues.splice(idx, 1);
                }
            }
        });
        saveToLocalStorage();
        if (state.user) renderAll();
    }, err => console.error("Realtime issues sync error:", err));
    firebaseListeners.push(unsubIssues);

    // 5. Listen to allocations
    const unsubAllocations = db.collection('settings').doc('allocations').onSnapshot(doc => {
        if (doc.exists) {
            state.allocations = doc.data();
            saveToLocalStorage();
            if (state.user) renderAll();
        }
    }, err => console.error("Realtime allocations sync error:", err));
    firebaseListeners.push(unsubAllocations);

    // 6. Listen to members
    const unsubMembers = db.collection('settings').doc('members').onSnapshot(doc => {
        if (doc.exists) {
            state.members = doc.data().list || [];
            saveToLocalStorage();
            if (state.user) {
                renderAll();
                const presidentMembersPanel = document.getElementById('president-members-panel');
                if (presidentMembersPanel && presidentMembersPanel.style.display === 'block') {
                    renderAdminMembersList();
                }
            }
        }
    }, err => console.error("Realtime members sync error:", err));
    firebaseListeners.push(unsubMembers);
}

// Clear all data from Firebase Firestore
function clearFirebaseDatabase() {
    if (!useFirebase || !db) return Promise.resolve();
    
    console.log("Purging all Firestore collections...");
    
    const pRequests = db.collection('requests').get().then(snap => {
        const batch = db.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
    });
    
    const pIncomes = db.collection('incomes').get().then(snap => {
        const batch = db.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
    });

    const pLogs = db.collection('logs').get().then(snap => {
        const batch = db.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
    });

    const pIssues = db.collection('issues').get().then(snap => {
        const batch = db.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
    });

    const pSettings = db.collection('settings').doc('allocations').delete();
    const pMembers = db.collection('settings').doc('members').delete();

    // Also delete the old flat state doc to clean up the user's DB
    const pOldDoc = db.collection('settings').doc('pink_team_state').delete();

    return Promise.all([pRequests, pIncomes, pLogs, pIssues, pSettings, pOldDoc, pMembers]);
}

// Handle system database reset click
function handleSystemReset() {
    if (!state.user || state.user.role !== 'president' || state.user.username !== 'admin') {
        alert("เฉพาะผู้ดูแลระบบหลัก (username: admin) เท่านั้นที่มีสิทธิ์ล้างฐานข้อมูลระบบได้");
        return;
    }
    
    if (!confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมดในระบบ? การกระทำนี้จะลบใบเบิก รายรับ บันทึกเหตุการณ์ และการแจ้งปัญหาทั้งหมด ทั้งในเครื่องนี้และในคลัง Firebase (ถ้าเชื่อมต่ออยู่) และไม่สามารถกู้คืนได้!")) {
        return;
    }
    
    const confirmText = prompt("พิมพ์คำว่า 'RESET' เพื่อยืนยันการล้างข้อมูลระบบ:");
    if (confirmText !== 'RESET') {
        alert("ยกเลิกการรีเซ็ตระบบเนื่องจากยืนยันข้อความไม่ถูกต้อง");
        return;
    }
    
    alert("กำลังรีเซ็ตและล้างฐานข้อมูลระบบ... กรุณารอสักครู่");
    
    clearFirebaseDatabase().then(() => {
        state.incomes = [];
        state.requests = [];
        state.logs = [];
        state.issues = [];
        state.allocations = { stand: 0, leaders: 0, parade: 0, welfare: 0, props: 0, sports: 0 };
        
        saveToLocalStorage();
        
        try {
            const req = indexedDB.deleteDatabase('pink_team_finance_db');
            req.onsuccess = () => {
                localStorage.removeItem('pink_team_finance_state_v3');
                alert("ล้างข้อมูลและรีเซ็ตระบบเสร็จสิ้นแล้ว! หน้าเว็บจะรีโหลดใหม่");
                window.location.reload();
            };
            req.onerror = () => {
                localStorage.removeItem('pink_team_finance_state_v3');
                alert("ล้างข้อมูลและรีเซ็ตระบบเสร็จสิ้นแล้ว! หน้าเว็บจะรีโหลดใหม่");
                window.location.reload();
            };
        } catch(e) {
            localStorage.removeItem('pink_team_finance_state_v3');
            window.location.reload();
        }
    }).catch(err => {
        console.error("Purge failure:", err);
        alert("รีเซ็ตระบบผิดพลาด: " + err.message);
    });
}

function loadLocalData(callback) {
    try {
        const request = indexedDB.open('pink_team_finance_db', 1);
        
        request.onupgradeneeded = (e) => {
            const dbObj = e.target.result;
            if (!dbObj.objectStoreNames.contains('app_state')) {
                dbObj.createObjectStore('app_state');
            }
        };
        
        request.onsuccess = (e) => {
            const dbObj = e.target.result;
            try {
                const tx = dbObj.transaction('app_state', 'readonly');
                const store = tx.objectStore('app_state');
                const req = store.get('current_state');
                
                req.onsuccess = () => {
                    if (req.result) {
                        state = req.result;
                        sanitizeState();
                        console.log("State loaded successfully from IndexedDB Database");
                        callback();
                    } else {
                        loadFromLocalStorageFallback();
                        callback();
                    }
                };
                req.onerror = () => {
                    loadFromLocalStorageFallback();
                    callback();
                };
            } catch(err) {
                console.error("IndexedDB transaction error:", err);
                loadFromLocalStorageFallback();
                callback();
            }
        };
        
        request.onerror = (e) => {
            console.error("IndexedDB open error during load:", e.target.error);
            loadFromLocalStorageFallback();
            callback();
        };
    } catch (e) {
        console.warn("IndexedDB open failed, falling back to LocalStorage:", e);
        loadFromLocalStorageFallback();
        callback();
    }
}

function loadFromLocalStorageFallback() {
    const saved = localStorage.getItem('pink_team_finance_state_v3');
    if (saved) {
        try {
            state = JSON.parse(saved);
            sanitizeState();
            console.log("State loaded from LocalStorage fallback");
            saveToLocalStorage();
        } catch(e) {
            console.error("Error parsing localStorage fallback, resetting...", e);
            resetState();
        }
    } else {
        resetState();
    }
}

function resetState() {
    state.user = null;
    state.incomes = [];
    state.allocations = { stand: 0, leaders: 0, parade: 0, welfare: 0, props: 0, sports: 0 };
    state.requests = [];
    state.logs = [];
    state.issues = [];
    state.members = [...MEMBERS];
    saveToLocalStorage();
}

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme
    const savedTheme = localStorage.getItem('pink_theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    // Force-clear login fields to override browser autofill (Chrome fills AFTER DOMContentLoaded)
    setTimeout(() => {
        const nameInput = document.getElementById('login-member-name');
        const codeInput = document.getElementById('login-member-code');
        const idInput = document.getElementById('login-member-id');
        if (nameInput) nameInput.value = '';
        if (codeInput) codeInput.value = '';
        if (idInput) idInput.value = '';
    }, 150);

    loadFromDatabase(() => {
        checkSession();
    });
});

// Check Session & Toggle between Login screen and Dashboard
function checkSession() {
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    const userStatusArea = document.getElementById('user-status-area');
    
    if (state.user) {
        // Show dashboard, hide login
        loginSection.style.display = 'none';
        mainContent.style.display = 'block';
        userStatusArea.style.display = 'flex';
        
        // Render user badge details
        document.getElementById('user-display-name').textContent = state.user.name;
        
        let roleDisplay = '';
        const tabNav = document.querySelector('.tab-navigation');
        const metricsGrid = document.querySelector('.metrics-grid');
        
        if (state.user.role === 'president') {
            if (state.user.username === 'admin') {
                roleDisplay = `<i class="fa-solid fa-user-shield"></i> ผู้ดูแลระบบ`;
            } else if (state.user.username === 'km789') {
                roleDisplay = `<i class="fa-solid fa-crown"></i> รองประธานสวัสดิการ`;
            } else {
                roleDisplay = `<i class="fa-solid fa-crown"></i> ประธานสวัสดิการ`;
            }
            document.getElementById('user-avatar').style.background = 'var(--accent-warning)';
            
            // President: Show navigation and financial metrics, but hide request related tabs
            tabNav.style.display = 'flex';
            metricsGrid.style.display = '';
            document.getElementById('tab-request').style.display = 'none';
            document.getElementById('tab-member-history').style.display = 'none';
            document.getElementById('tab-dashboard').style.display = '';
            document.getElementById('tab-pending').style.display = '';
            document.getElementById('tab-logs').style.display = '';
            
            // All users with president role (admin, Aom, km789) can manage members
            document.getElementById('tab-members').style.display = '';
            
            // Default view for President
            switchTab('pending-view');
        } else {
            roleDisplay = getDeptDisplayName(state.user.department);
            document.getElementById('user-avatar').style.background = 'var(--accent-primary)';
            
            // Member: Show navigation, but only show request and personal history tabs. Hide metrics grid.
            tabNav.style.display = 'flex';
            metricsGrid.style.display = 'none';
            document.getElementById('tab-request').style.display = '';
            document.getElementById('tab-member-history').style.display = '';
            document.getElementById('tab-dashboard').style.display = 'none';
            document.getElementById('tab-pending').style.display = 'none';
            document.getElementById('tab-logs').style.display = 'none';
            document.getElementById('tab-members').style.display = 'none';
            
            // Default view for Member
            switchTab('request-view');
        }
        document.getElementById('user-display-role').innerHTML = roleDisplay;
        
        // Autofill forms and values
        autofillUserForms();
        

        
        // Render UI
        renderAll();
    } else {
        // Show login, hide dashboard
        loginSection.style.display = 'flex';
        mainContent.style.display = 'none';
        userStatusArea.style.display = 'none';
    }
}

// Autofill details based on active session user
function autofillUserForms() {
    const nameInput = document.getElementById('req-name');
    const deptDispInput = document.getElementById('req-dept-disp');
    const deptInput = document.getElementById('req-dept');
    
    const requestFormWarning = document.getElementById('form-role-warning');
    const submitRequestBtn = document.getElementById('submit-request-btn');
    
    const presidentWarning = document.getElementById('president-only-warning');
    const incomeFormInputs = document.querySelectorAll('#income-form input, #submit-income-btn');
    const incomeActor = document.getElementById('inc-actor');
    
    // Autofill issue reporter info
    const issueReporterInput = document.getElementById('issue-reporter');
    if (issueReporterInput && state.user) {
        const displayRoleName = state.user.username === 'admin' ? 'ผู้ดูแลระบบ' : (state.user.role === 'president' ? 'ประธาน' : 'สมาชิก');
        issueReporterInput.value = `${state.user.name} (${displayRoleName})`;
    }
    
    const presidentSettingsPanel = document.getElementById('president-settings-panel');
    
    if (state.user.role === 'purchaser') {
        // Fill reimbursement form
        nameInput.value = state.user.name;
        deptDispInput.value = getDeptDisplayName(state.user.department);
        deptInput.value = state.user.department;
        
        // Enable request submission
        requestFormWarning.style.display = 'none';
        submitRequestBtn.removeAttribute('disabled');
        
        // Disable income panel for members
        presidentWarning.style.display = 'block';
        incomeFormInputs.forEach(el => el.setAttribute('disabled', 'true'));
        if (incomeActor) incomeActor.value = '';
        
        // Hide president settings and members panel
        if (presidentSettingsPanel) presidentSettingsPanel.style.display = 'none';
        const presidentMembersPanel = document.getElementById('president-members-panel');
        if (presidentMembersPanel) presidentMembersPanel.style.display = 'none';
    } else {
        // President mode
        nameInput.value = '—';
        deptDispInput.value = 'เฉพาะสมาชิกฝ่าย';
        deptInput.value = '';
        
        // Disable request submission
        requestFormWarning.style.display = 'block';
        const displayRoleName = state.user.username === 'admin' ? 'ผู้ดูแลระบบ' : (state.user.username === 'km789' ? 'รองประธานสวัสดิการ' : 'ประธานสวัสดิการ');
        requestFormWarning.innerHTML = `<i class="fa-solid fa-circle-info"></i> คุณเข้าสู่ระบบด้วยสิทธิ์ "${displayRoleName}" ซึ่งไม่สามารถยื่นเบิกเงินได้`;
        submitRequestBtn.setAttribute('disabled', 'true');
        
        // Enable income panel for president
        presidentWarning.style.display = 'none';
        incomeFormInputs.forEach(el => el.removeAttribute('disabled'));
        if (incomeActor) incomeActor.value = state.user.name;
        
        // Show president settings only for admin, but show members panel for all presidents
        const presidentMembersPanel = document.getElementById('president-members-panel');
        if (presidentSettingsPanel && presidentMembersPanel) {
            if (state.user.username === 'admin') {
                presidentSettingsPanel.style.display = 'block';
            } else {
                presidentSettingsPanel.style.display = 'none';
            }
            presidentMembersPanel.style.display = 'block';
            renderAdminMembersList();
        }
    }
}

// Switch Login tab
function switchLoginTab(type) {
    const memberBtn = document.getElementById('login-tab-member');
    const presidentBtn = document.getElementById('login-tab-president');
    const memberForm = document.getElementById('member-login-form');
    const presidentForm = document.getElementById('president-login-form');
    
    if (type === 'member') {
        memberBtn.classList.add('active');
        presidentBtn.classList.remove('active');
        memberForm.style.display = 'block';
        presidentForm.style.display = 'none';
    } else {
        memberBtn.classList.remove('active');
        presidentBtn.classList.add('active');
        memberForm.style.display = 'none';
        presidentForm.style.display = 'block';
    }
    document.getElementById('login-error-msg').style.display = 'none';
}

// Handle Member Login
function handleMemberLogin(event) {
    event.preventDefault();
    const name = document.getElementById('login-member-name').value.trim();
    const memberId = document.getElementById('login-member-id').value.trim();
    const enteredCode = document.getElementById('login-member-code').value.trim();
    const dept = document.getElementById('login-member-dept').value;
    const codeError = document.getElementById('member-code-error');

    if (!name) return;

    // ต้องเลือกชื่อจาก list
    if (!memberId) {
        alert('กรุณาเลือกชื่อจากรายชื่อที่แนะนำ');
        document.getElementById('login-member-name').focus();
        return;
    }

    // ตรวจสอบรหัสประจำตัว
    if (enteredCode !== memberId) {
        codeError.style.display = 'block';
        document.getElementById('login-member-code').focus();
        return;
    }

    codeError.style.display = 'none';

    state.user = {
        id: memberId,
        name: name,
        department: dept,
        role: 'purchaser'
    };

    saveToLocalStorage();
    checkSession();
    switchTab('request-view');
}


// Handle President Login
function handlePresidentLogin(event) {
    event.preventDefault();
    const user = document.getElementById('login-pres-user').value.trim();
    const pass = document.getElementById('login-pres-pass').value.trim();
    const errorMsg = document.getElementById('login-error-msg');
    
    if (
        (user === 'Aom' && pass === 'Aom456789') || 
        (user === 'km789' && pass === 'Q32544') ||
        (user === 'admin' && pass === 'adminnaja123')
    ) {
        errorMsg.style.display = 'none';
        
        const displayName = user === 'admin'
            ? 'ผู้ดูแลระบบ'
            : (user === 'km789' ? 'รองประธานสวัสดิการ' : 'ประธานสวัสดิการ');
            
        state.user = {
            username: user,
            name: displayName,
            department: null,
            role: 'president'
        };
        
        saveToLocalStorage();
        checkSession();
        
        // Open pending tab by default
        switchTab('pending-view');
    } else {
        errorMsg.style.display = 'block';
    }
}

// Handle Logout
function handleLogout() {
    state.user = null;
    saveToLocalStorage();
    checkSession();
    
    // Clear forms
    document.getElementById('member-login-form').reset();
    document.getElementById('president-login-form').reset();
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const icon = btnEl.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// UI Rendering Controller
function renderAll() {
    calculateAndRenderMetrics();
    renderDepartmentAllocations();
    renderRecentTransactions();
    renderPendingQueue();
    renderLogsList();
    renderMemberHistory();
    renderIssuesList();
}

// Switch View Tabs
function switchTab(viewId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(viewId).classList.add('active');
    
    const map = {
        'dashboard-view': 'tab-dashboard',
        'request-view': 'tab-request',
        'pending-view': 'tab-pending',
        'logs-view': 'tab-logs',
        'member-history-view': 'tab-member-history',
        'issues-view': 'tab-issues',
        'members-view': 'tab-members'
    };
    document.getElementById(map[viewId]).classList.add('active');
    
    if (viewId === 'members-view') {
        renderAdminMembersList();
    }
}

// Calculation and Metrics Rendering
function calculateAndRenderMetrics() {
    const totalIncome = state.incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const approvedExpenses = state.requests
        .filter(req => req.status === 'approved')
        .reduce((acc, curr) => acc + curr.amount, 0);
    const remainingBalance = totalIncome - approvedExpenses;
    
    document.getElementById('metric-balance').textContent = formatCurrency(remainingBalance);
    document.getElementById('metric-income').textContent = formatCurrency(totalIncome);
    document.getElementById('metric-expenses').textContent = formatCurrency(approvedExpenses);
    
    // Update Pending queue count in tab label
    const pendingCount = state.requests.filter(req => req.status === 'pending').length;
    document.getElementById('pending-count').textContent = pendingCount;
}

// Check department budget limits remaining
function getDepartmentBudgetDetails(deptCode) {
    const allocated = state.allocations[deptCode] || 0;
    const spent = state.requests
        .filter(req => req.status === 'approved' && req.department === deptCode)
        .reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = allocated - spent;
    return { allocated, spent, remaining };
}

// Render department budget spent amounts
function renderDepartmentAllocations() {
    const container = document.getElementById('department-budget-list');
    container.innerHTML = '';
    
    Object.keys(DEPARTMENTS).forEach(deptKey => {
        const dept = DEPARTMENTS[deptKey];
        const { spent } = getDepartmentBudgetDetails(deptKey);
        
        const block = document.createElement('div');
        block.className = 'dept-progress-block';
        block.innerHTML = `
            <div class="progress-header" style="justify-content: space-between; align-items: center; font-size: 0.95rem;">
                <span class="progress-title" style="color: ${dept.color};">
                    <span class="dept-dot" style="background-color: ${dept.color};"></span>
                    ${dept.name}
                </span>
                <span class="progress-values" style="color: var(--text-primary); font-weight: 500;">
                    ใช้ไป <strong>${formatCurrency(spent)}</strong>
                </span>
            </div>
        `;
        container.appendChild(block);
    });
}

// Live Budget Warning check in reimbursement form
function checkFormBudgetWarning() {
    const amountVal = parseFloat(document.getElementById('req-amount').value);
    const warningDiv = document.getElementById('form-budget-warning');
    
    if (!amountVal || state.user.role !== 'purchaser') {
        warningDiv.style.display = 'none';
        return;
    }
    
    const approvedExpenses = state.requests
        .filter(req => req.status === 'approved')
        .reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = state.incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const remainingBalance = totalIncome - approvedExpenses;
    
    if (amountVal > remainingBalance) {
        warningDiv.style.display = 'block';
    } else {
        warningDiv.style.display = 'none';
    }
}

// Render recent transactions table
function renderRecentTransactions() {
    const tbody = document.getElementById('recent-transactions-table');
    tbody.innerHTML = '';
    
    const txList = [];
    
    state.incomes.forEach(inc => {
        txList.push({
            date: inc.date,
            desc: inc.desc,
            type: 'income',
            amount: inc.amount,
            slip: null
        });
    });
    
    state.requests.forEach(req => {
        if (req.status === 'approved') {
            txList.push({
                date: req.date,
                desc: `${req.item} (${getDeptDisplayName(req.department)})`,
                type: 'expense',
                amount: req.amount,
                slip: req.transferSlip
            });
        }
    });
    
    // Sort transactions by date descending
    txList.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const limit = Math.min(txList.length, 5);
    if (limit === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">ไม่มีประวัติธุรกรรมล่าสุด</td></tr>`;
        return;
    }
    
    for (let i = 0; i < limit; i++) {
        const tx = txList[i];
        const tr = document.createElement('tr');
        
        const amountColor = tx.type === 'income' ? 'var(--accent-success)' : 'var(--text-primary)';
        const amountPrefix = tx.type === 'income' ? '+' : '-';
        
        let slipCell = `<span style="color:var(--text-muted);">—</span>`;
        if (tx.type === 'expense' && tx.slip) {
            slipCell = `<button class="btn" style="width:auto; padding:0.25rem 0.5rem; font-size:0.75rem; background:rgba(236,72,153,0.1); color:var(--accent-primary);" onclick="viewImage('${tx.slip}')"><i class="fa-solid fa-file-image"></i> ดูสลิป</button>`;
        }
        
        tr.innerHTML = `
            <td style="font-size: 0.8rem; color: var(--text-muted);">${formatDateTime(tx.date)}</td>
            <td>
                <div style="font-weight: 500;">${tx.desc}</div>
                <div style="font-size:0.7rem; color:var(--text-muted);">${tx.type === 'income' ? 'นำเข้าคลังสี' : 'เบิกจ่ายคืนสมาชิก'}</div>
            </td>
            <td style="font-weight: 600; color: ${amountColor}">${amountPrefix}${formatCurrency(tx.amount)}</td>
            <td>${slipCell}</td>
        `;
        tbody.appendChild(tr);
    }
}

// Render approvals requests queue
function renderPendingQueue() {
    const container = document.getElementById('pending-list');
    container.innerHTML = '';
    
    const pendings = state.requests.filter(req => req.status === 'pending');
    
    if (pendings.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 1rem; width: 100%;">
                <i class="fa-solid fa-circle-check" style="font-size: 2.5rem; color: var(--accent-success); margin-bottom: 1rem;"></i>
                <p>ไม่มีรายการเบิกค้างส่งอนุมัติในสีชมพู</p>
            </div>
        `;
        return;
    }
    
    pendings.forEach(req => {
        const card = document.createElement('div');
        card.className = 'request-card';
        
        // Show Warning Badge if exceeds remaining total treasury budget
        const approvedExpenses = state.requests
            .filter(r => r.status === 'approved')
            .reduce((acc, curr) => acc + curr.amount, 0);
        const totalIncome = state.incomes.reduce((acc, curr) => acc + curr.amount, 0);
        const remainingBalance = totalIncome - approvedExpenses;
        const isOverBudget = req.amount > remainingBalance;
        const budgetWarningBadge = isOverBudget
            ? `<span class="badge badge-rejected" style="margin-left:0.5rem;"><i class="fa-solid fa-triangle-exclamation"></i> เกินงบคลัง</span>`
            : '';
        
        const userActionButtons = state.user.role === 'president'
            ? `<div class="card-footer-actions">
                    <button class="btn btn-success" style="font-size: 0.8rem; padding: 0.5rem;" onclick="openApproveModal('${req.id}')">
                        <i class="fa-solid fa-check"></i> โอนเงิน & อนุมัติ
                    </button>
                    <button class="btn btn-danger" style="font-size: 0.8rem; padding: 0.5rem;" onclick="openRejectModal('${req.id}')">
                        <i class="fa-solid fa-xmark"></i> ปฏิเสธ
                    </button>
               </div>`
            : `<div style="font-size: 0.8rem; text-align: center; background: rgba(245, 158, 11, 0.1); color: var(--accent-warning); padding: 0.5rem; border-radius: 0.5rem; margin-top: auto;">
                    <i class="fa-solid fa-lock"></i> สิทธิ์ประธานสวัสดิการในการตรวจอนุมัติ
               </div>`;

        const memoDisplay = req.memo 
            ? `<div style="background:rgba(255,255,255,0.02); padding:0.5rem; border-radius:0.35rem; font-size:0.8rem; color:var(--text-secondary); margin-top:0.25rem;">
                <strong>หมายเหตุ:</strong> ${req.memo}
               </div>` 
            : '';

                const receiptsList = req.receipts || [req.receipt || MOCK_RECEIPT_SVG];
                const productsList = req.productPhotos || [req.productPhoto || MOCK_PRODUCT_SVG];
                
                const receiptsHtml = receiptsList.map((src, i) => `
                    <div style="width: 64px; height: 64px; border: 1px solid var(--border-color); border-radius: 0.35rem; overflow: hidden;">
                        <img src="${src}" onclick="viewImage('${src}')" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" alt="Receipt ${i+1}">
                    </div>
                `).join('');
                
                const productsHtml = productsList.map((src, i) => `
                    <div style="width: 64px; height: 64px; border: 1px solid var(--border-color); border-radius: 0.35rem; overflow: hidden;">
                        <img src="${src}" onclick="viewImage('${src}')" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" alt="Product ${i+1}">
                    </div>
                `).join('');

                card.innerHTML = `
                    <div class="card-header">
                        <div>
                            <span class="dept-tag dept-${req.department}"><span class="dept-dot"></span>${getDeptDisplayName(req.department)}</span>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">${formatDateTime(req.date)}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="card-amount">${formatCurrency(req.amount)}</div>
                            ${budgetWarningBadge}
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <div>สินค้า: <span>${req.item}</span></div>
                        <div>ผู้ขอเบิก: <span>${req.name}</span></div>
                        ${memoDisplay}
                        
                        <div style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;">
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">📄 ใบเสร็จ (${receiptsList.length} รูป):</div>
                                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                                    ${receiptsHtml}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">🛍️ รูปสินค้า (${productsList.length} รูป):</div>
                                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                                    ${productsHtml}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">📱 QR Code รับเงิน:</div>
                                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                                    <div style="width: 64px; height: 64px; border: 1px solid var(--border-color); border-radius: 0.35rem; overflow: hidden;">
                                        <img src="${req.qrcode || MOCK_QRCODE_SVG}" onclick="viewImage('${req.qrcode || MOCK_QRCODE_SVG}')" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" alt="QR Code">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${userActionButtons}
                `;
        container.appendChild(card);
    });
}

// Render Logs List
function renderLogsList() {
    const list = document.getElementById('system-logs');
    list.innerHTML = '';
    
    const sortedLogs = [...state.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedLogs.length === 0) {
        list.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">ไม่มีประวัติและ Audit Logs ในระบบ</div>`;
        return;
    }
    
    sortedLogs.forEach(log => {
        const item = document.createElement('div');
        let classType = '';
        if (log.type === 'approve') classType = 'log-approve';
        else if (log.type === 'reject') classType = 'log-reject';
        else if (log.type === 'income') classType = 'log-income';
        
        item.className = `log-item ${classType}`;
        
        // Render logs image files if it corresponds to an approved request with receipts
        let imageRowMarkup = '';
        if (log.requestId) {
            const req = state.requests.find(r => r.id === log.requestId);
            if (req) {
                const receiptsList = req.receipts || [req.receipt || MOCK_RECEIPT_SVG];
                const productsList = req.productPhotos || [req.productPhoto || MOCK_PRODUCT_SVG];
                
                let receiptsThumbs = receiptsList.map(src => `
                    <img src="${src}" class="log-img-thumb" onclick="viewImage('${src}')">
                `).join('');
                
                let productsThumbs = productsList.map(src => `
                    <img src="${src}" class="log-img-thumb" onclick="viewImage('${src}')">
                `).join('');

                imageRowMarkup = `
                    <div class="log-thumbs-row">
                        <div class="log-thumb-wrapper">
                            <div style="display:flex; gap:2px; flex-wrap:wrap; margin-bottom:2px;">${receiptsThumbs}</div>
                            <span>1. ใบเสร็จ</span>
                        </div>
                        <div class="log-thumb-wrapper">
                            <div style="display:flex; gap:2px; flex-wrap:wrap; margin-bottom:2px;">${productsThumbs}</div>
                            <span>2. สินค้า</span>
                        </div>
                        <div class="log-thumb-wrapper">
                            <img src="${req.qrcode || MOCK_QRCODE_SVG}" class="log-img-thumb" onclick="viewImage('${req.qrcode || MOCK_QRCODE_SVG}')">
                            <span>3. QR รับเงิน</span>
                        </div>
                        ${req.transferSlip ? `
                        <div class="log-thumb-wrapper">
                            <img src="${req.transferSlip}" class="log-img-thumb" style="border-color:var(--accent-success);" onclick="viewImage('${req.transferSlip}')">
                            <span style="color:var(--accent-success); font-weight:600;">4. สลิปโอน</span>
                        </div>
                        ` : ''}
                    </div>
                `;
            }
        }
        
        item.innerHTML = `
            <div class="log-time"><i class="fa-solid fa-clock"></i> ${formatDateTime(log.date)}</div>
            <div class="log-desc">${log.desc}</div>
            ${imageRowMarkup}
            <div class="log-actor">
                <span>บันทึกโดย: ${log.actor}</span>
                <span class="badge badge-${log.type === 'approve' ? 'approved' : log.type === 'reject' ? 'rejected' : 'pending'}">${log.type.toUpperCase()}</span>
            </div>
        `;
        list.appendChild(item);
    });
}

// Trigger Input Click
function triggerUpload(elemId) {
    document.getElementById(elemId).click();
}

// Image compression utility
function compressImage(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Export to JPEG with quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            callback(compressedDataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Draft State for reimbursement request uploads
let requestDraftImages = {
    receipts: [],
    productPhotos: [],
    qrcode: ""
};

// Multiple Image File preview loader with compression
function handleMultipleImagePreview(input, listId, type) {
    const files = Array.from(input.files);
    if (files.length === 0) return;
    
    let loadedCount = 0;
    
    files.forEach(file => {
        compressImage(file, 1024, 1024, 0.7, (compressedDataUrl) => {
            if (type === 'receipt') {
                requestDraftImages.receipts.push(compressedDataUrl);
            } else if (type === 'product') {
                requestDraftImages.productPhotos.push(compressedDataUrl);
            }
            loadedCount++;
            if (loadedCount === files.length) {
                renderDraftImages(listId, type);
                input.value = ''; // Reset input to allow re-uploading same file
            }
        });
    });
}

// Render drafts
function renderDraftImages(listId, type) {
    const listContainer = document.getElementById(listId);
    listContainer.innerHTML = '';
    
    const arr = type === 'receipt' ? requestDraftImages.receipts : requestDraftImages.productPhotos;
    
    arr.forEach((src, idx) => {
        const item = document.createElement('div');
        item.style.position = 'relative';
        item.style.width = '64px';
        item.style.height = '64px';
        item.style.borderRadius = '0.35rem';
        item.style.border = '1px solid var(--border-color)';
        item.style.overflow = 'hidden';
        
        item.innerHTML = `
            <img src="${src}" class="draft-img-thumb" onclick="viewImage('${src}')" style="width:100%; height:100%; object-fit:cover;" title="คลิกเพื่อดูรูปขนาดเต็ม">
            <button type="button" onclick="removeDraftImage('${listId}', '${type}', ${idx})" style="
                position:absolute; top:-2px; right:-2px;
                background:var(--accent-danger); color:white;
                border:none; border-radius:50%; width:18px; height:18px;
                font-size:10px; cursor:pointer; display:flex;
                align-items:center; justify-content:center; line-height:1;
                z-index: 10;
            ">&times;</button>
        `;
        listContainer.appendChild(item);
    });
}

// Remove single draft image
function removeDraftImage(listId, type, index) {
    if (type === 'receipt') {
        requestDraftImages.receipts.splice(index, 1);
    } else if (type === 'product') {
        requestDraftImages.productPhotos.splice(index, 1);
    }
    renderDraftImages(listId, type);
}

// Single QR Code preview loaders with compression
function handleQrcodePreview(input, previewId) {
    const file = input.files[0];
    const previewContainer = document.getElementById(previewId);
    
    if (file) {
        compressImage(file, 800, 800, 0.7, (compressedDataUrl) => {
            requestDraftImages.qrcode = compressedDataUrl;
            const img = previewContainer.querySelector('img');
            img.src = compressedDataUrl;
            previewContainer.style.display = 'block';
        });
    }
}

function removeQrcodeImage(event, fileInputId, previewId) {
    event.stopPropagation();
    document.getElementById(fileInputId).value = '';
    requestDraftImages.qrcode = '';
    const container = document.getElementById(previewId);
    container.style.display = 'none';
    container.querySelector('img').src = '';
}

// President Transfer Slip preview loader with compression
function handleImagePreview(input, previewId) {
    const file = input.files[0];
    const previewContainer = document.getElementById(previewId);
    
    if (file) {
        compressImage(file, 1024, 1024, 0.7, (compressedDataUrl) => {
            const img = previewContainer.querySelector('img');
            img.src = compressedDataUrl;
            previewContainer.style.display = 'block';
        });
    }
}

function removeImage(event, fileInputId, previewId) {
    event.stopPropagation();
    document.getElementById(fileInputId).value = '';
    const container = document.getElementById(previewId);
    container.style.display = 'none';
    container.querySelector('img').src = '';
}

// Handle Reimbursement Request Submit
function handleRequestSubmit(event) {
    event.preventDefault();
    
    if (!state.user || state.user.role !== 'purchaser') {
        alert('เฉพาะสมาชิกในสีชมพูเท่านั้นที่มีสิทธิ์เบิกจ่ายเงิน');
        return;
    }
    
    const name = state.user.name;
    const department = state.user.department;
    
    const item = document.getElementById('req-item').value;
    const amount = parseFloat(document.getElementById('req-amount').value);
    const category = 'สปอร์ตเดย์'; // Default fallback
    const memo = document.getElementById('req-memo').value.trim();
    
    const finalReceipts = requestDraftImages.receipts.length > 0 ? [...requestDraftImages.receipts] : [MOCK_RECEIPT_SVG];
    const finalProducts = requestDraftImages.productPhotos.length > 0 ? [...requestDraftImages.productPhotos] : [MOCK_PRODUCT_SVG];
    const finalQrcode = requestDraftImages.qrcode || MOCK_QRCODE_SVG;
    
    const reqId = 'req-' + Date.now();
    const newRequest = {
        id: reqId,
        name: name,
        department: department,
        item: item,
        amount: amount,
        category: category,
        memo: memo,
        receipts: finalReceipts,
        productPhotos: finalProducts,
        // Backward compatibility properties for single images
        receipt: finalReceipts[0],
        productPhoto: finalProducts[0],
        qrcode: finalQrcode,
        transferSlip: null,
        status: 'pending',
        rejectReason: '',
        approvedBy: '',
        date: new Date().toISOString()
    };
    
    state.requests.push(newRequest);
    
    // Record log
    const newLog = {
        id: 'log-' + Date.now(),
        date: new Date().toISOString(),
        type: 'upload',
        requestId: reqId,
        desc: `ส่งคำขอเบิกเงิน: ${item} ยอดเงิน ฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฝ่าย${getDeptDisplayName(department)}`,
        actor: name
    };
    state.logs.push(newLog);
    
    saveToLocalStorage();
    syncItemToFirebase('requests', newRequest.id, newRequest);
    syncItemToFirebase('logs', newLog.id, newLog);
    renderAll();
    
    // Reset Form and Draft State
    document.getElementById('reimbursement-form').reset();
    requestDraftImages = {
        receipts: [],
        productPhotos: [],
        qrcode: ""
    };
    document.getElementById('receipt-preview-list').innerHTML = '';
    document.getElementById('product-preview-list').innerHTML = '';
    document.getElementById('qrcode-preview').style.display = 'none';
    document.getElementById('qrcode-preview').querySelector('img').src = '';
    
    document.getElementById('form-budget-warning').style.display = 'none';
    
    alert('ส่งใบเบิกเข้าคลังสวัสดิการสำเร็จเรียบร้อย! ประธานสวัสดิการสีชมพูจะสแกนโอนเงินตามลำดับคิว');
    switchTab('request-view');
}

// Handle Add Income Submit
function handleIncomeSubmit(event) {
    event.preventDefault();
    
    if (!state.user || state.user.role !== 'president') {
        alert('เฉพาะประธานสวัสดิการเท่านั้นที่บันทึกรายรับของสีชมพูได้');
        return;
    }
    
    const desc = document.getElementById('inc-desc').value;
    const amount = parseFloat(document.getElementById('inc-amount').value);
    const actor = state.user.name;
    
    const newIncome = {
        id: 'inc-' + Date.now(),
        desc: desc,
        amount: amount,
        date: new Date().toISOString(),
        actor: actor
    };
    
    state.incomes.push(newIncome);
    
    const newLog = {
        id: 'log-' + Date.now(),
        date: new Date().toISOString(),
        type: 'income',
        desc: `บันทึกเงินรับเข้าคลังสีชมพู: ${desc} ยอด ฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
        actor: actor
    };
    state.logs.push(newLog);
    
    saveToLocalStorage();
    syncItemToFirebase('incomes', newIncome.id, newIncome);
    syncItemToFirebase('logs', newLog.id, newLog);
    renderAll();
    
    document.getElementById('income-form').reset();
    document.getElementById('inc-actor').value = state.user.name;
    alert('บันทึกยอดเงินรับเข้าคลังเรียบร้อย!');
}

// Quota allocation features removed as per configuration updates

// View Full Size Image
function viewImage(imgSrc) {
    const modal = document.getElementById('image-modal');
    document.getElementById('modal-img-element').src = imgSrc;
    modal.classList.add('active');
}

function closeImageModal() {
    document.getElementById('image-modal').classList.remove('active');
}

// Open Approval Modal
function openApproveModal(reqId) {
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    
    document.getElementById('approve-request-id').value = reqId;
    
    const detailsContainer = document.getElementById('approve-details');
    detailsContainer.innerHTML = `
        <p><strong>รายการเบิก:</strong> ${req.item}</p>
        <p><strong>จำนวนเงิน:</strong> <span style="font-size: 1.25rem; font-weight: 700; color: var(--accent-primary);">${formatCurrency(req.amount)}</span></p>
        <p><strong>ผู้รับเงิน:</strong> ${req.name} (ฝ่าย${getDeptDisplayName(req.department)})</p>
        <div style="display:flex; justify-content:center; margin-top: 1rem;">
            <img src="${req.qrcode}" style="max-height: 150px; border-radius: 0.5rem; border: 1px solid var(--border-color);" alt="Transfer QR Code">
        </div>
    `;
    
    // Reset file input and preview
    document.getElementById('upload-transfer-slip').value = '';
    document.getElementById('transfer-slip-preview').style.display = 'none';
    document.getElementById('transfer-slip-preview').querySelector('img').src = '';
    
    // Hide progress elements
    document.getElementById('transfer-progress-bar').style.display = 'none';
    document.getElementById('transfer-progress-fill').style.width = '0%';
    document.getElementById('transfer-status-text').style.display = 'none';
    document.getElementById('approve-modal-buttons').style.display = 'flex';
    document.getElementById('president-slip-upload-group').style.display = 'block';
    
    document.getElementById('approve-modal').classList.add('active');
}

function closeApproveModal() {
    document.getElementById('approve-modal').classList.remove('active');
}

// Confirm Approve - Prompts Simulated bank transfer
function confirmApprove() {
    const reqId = document.getElementById('approve-request-id').value;
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    
    // Get attached transfer slip or fallback to simulated slip
    const transferSlipSrc = document.getElementById('transfer-slip-preview').querySelector('img').src;
    const finalTransferSlip = transferSlipSrc || MOCK_SLIP_SVG;
    
    // Hide buttons, show progress bar
    document.getElementById('approve-modal-buttons').style.display = 'none';
    document.getElementById('president-slip-upload-group').style.display = 'none';
    document.getElementById('transfer-progress-bar').style.display = 'block';
    document.getElementById('transfer-status-text').style.display = 'block';
    
    // Animate progress bar fill
    setTimeout(() => {
        document.getElementById('transfer-progress-fill').style.width = '100%';
    }, 50);
    // Save state changes after animation completes (1.3 seconds)
    setTimeout(() => {
        req.status = 'approved';
        req.approvedBy = state.user.name;
        req.transferSlip = finalTransferSlip;
        req.date = new Date().toISOString(); // Update to approval timestamp for transaction log
        
        const newLog = {
            id: 'log-' + Date.now(),
            date: new Date().toISOString(),
            type: 'approve',
            requestId: req.id,
            desc: `อนุมัติการเบิกเงินสำเร็จ: ${req.item} ยอด ฿${req.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} คณะสีชมพู (ฝ่าย${getDeptDisplayName(req.department)})`,
            actor: req.approvedBy
        };
        state.logs.push(newLog);
        
        saveToLocalStorage();
        syncItemToFirebase('requests', req.id, req);
        syncItemToFirebase('logs', newLog.id, newLog);
        renderAll();
        closeApproveModal();
        alert('อนุมัติการจ่ายเงินคืนเรียบร้อย! ข้อมูลถูกบันทึกลงระบบพร้อมสลิปแนบหลักฐานเรียบร้อยแล้ว');
    }, 1300);
}

// Open Rejection Dialog Modal
function openRejectModal(reqId) {
    document.getElementById('reject-request-id').value = reqId;
    document.getElementById('reject-reason').value = '';
    document.getElementById('reject-modal').classList.add('active');
}

function closeRejectModal() {
    document.getElementById('reject-modal').classList.remove('active');
}

// Confirm Reject
function confirmReject() {
    const reqId = document.getElementById('reject-request-id').value;
    const reason = document.getElementById('reject-reason').value.trim();
    
    if (!reason) {
        alert('กรุณากรอกระบุเหตุผลการปฏิเสธการชำระเงิน');
        return;
    }
    
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    
    req.status = 'rejected';
    req.rejectReason = reason;
    req.approvedBy = state.user.name;
    
    const newLog = {
        id: 'log-' + Date.now(),
        date: new Date().toISOString(),
        type: 'reject',
        requestId: req.id,
        desc: `ปฏิเสธใบเบิกเงิน: ${req.item} ยอดเงิน ฿${req.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (ฝ่าย${getDeptDisplayName(req.department)}) เหตุผล: ${reason}`,
        actor: req.approvedBy
    };
    state.logs.push(newLog);
    
    saveToLocalStorage();
    syncItemToFirebase('requests', req.id, req);
    syncItemToFirebase('logs', newLog.id, newLog);
    renderAll();
    closeRejectModal();
    alert('บันทึกการปฏิเสธใบเบิกเงินลงประวัติสำเร็จ');
}

// Render Member's Personal History
function renderMemberHistory() {
    const tbody = document.getElementById('member-history-table');
    if (!tbody || !state.user || state.user.role !== 'purchaser') return;
    
    tbody.innerHTML = '';
    
    // Filter requests submitted by this logged-in member (by name only, ignoring department)
    const myRequests = state.requests.filter(req => req.name === state.user.name);
    
    // Sort by date descending
    myRequests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (myRequests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">คุณยังไม่มีประวัติการส่งเบิกเงิน</td></tr>`;
        return;
    }
    
    myRequests.forEach(req => {
        const tr = document.createElement('tr');
        
        let statusBadge = '';
        if (req.status === 'pending') {
            statusBadge = `<span class="badge badge-pending">รอพิจารณา</span>`;
        } else if (req.status === 'approved') {
            statusBadge = `<span class="badge badge-approved">โอนเงินสำเร็จ</span>`;
        } else {
            statusBadge = `<span class="badge badge-rejected" title="${req.rejectReason}">ปฏิเสธ (ชี้เพื่อดูเหตุผล)</span>
                           <div style="font-size:0.75rem; color:var(--accent-danger); margin-top:2px;">เหตุผล: ${req.rejectReason}</div>`;
        }
        
        let slipCell = `<span style="color:var(--text-muted);">—</span>`;
        if (req.status === 'approved' && req.transferSlip) {
            slipCell = `<button class="btn" style="width:auto; padding:0.25rem 0.5rem; font-size:0.75rem; background:rgba(236,72,153,0.1); color:var(--accent-primary);" onclick="viewImage('${req.transferSlip}')">
                            <i class="fa-solid fa-file-image"></i> ดูสลิปประธาน
                        </button>`;
        }
        tr.innerHTML = `
            <td style="font-size: 0.8rem; color: var(--text-muted);">${formatDateTime(req.date)}</td>
            <td>
                <div style="font-weight: 500;">[${getDeptDisplayName(req.department)}] ${req.item}</div>
                ${req.memo ? `<div style="font-size:0.75rem; color:var(--text-secondary);">หมายเหตุ: ${req.memo}</div>` : ''}
            </td>
            <td style="font-weight: 600;">${formatCurrency(req.amount)}</td>
            <td>${statusBadge}</td>
            <td>${slipCell}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ========== THEME TOGGLE LOGIC ==========
function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-theme');
    const themeBtn = document.getElementById('theme-toggle');
    
    if (isLight) {
        localStorage.setItem('pink_theme', 'light');
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        localStorage.setItem('pink_theme', 'dark');
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

// ========== ISSUE TRACKING SYSTEM ==========
function handleIssueSubmit(event) {
    event.preventDefault();
    if (!state.user) {
        alert('กรุณาเข้าสู่ระบบก่อนแจ้งปัญหา');
        return;
    }
    
    const title = document.getElementById('issue-title').value.trim();
    const category = document.getElementById('issue-category').value;
    const desc = document.getElementById('issue-desc').value.trim();
    const reporterName = state.user.name;
    const reporterRole = state.user.username === 'admin' ? 'ผู้ดูแลระบบ' : (state.user.role === 'president' ? 'ประธาน' : 'สมาชิก');
    
    const newIssue = {
        id: 'issue-' + Date.now(),
        title: title,
        category: category,
        reporterName: reporterName,
        reporterRole: reporterRole,
        desc: desc,
        status: 'pending',
        date: new Date().toISOString(),
        reply: ''
    };
    
    state.issues.push(newIssue);
    saveToLocalStorage();
    syncItemToFirebase('issues', newIssue.id, newIssue);
    renderAll();
    
    // Reset Form
    document.getElementById('issue-report-form').reset();
    if (document.getElementById('issue-reporter')) {
        const displayRoleName = state.user.username === 'admin' ? 'ผู้ดูแลระบบ' : (state.user.role === 'president' ? 'ประธาน' : 'สมาชิก');
        document.getElementById('issue-reporter').value = `${state.user.name} (${displayRoleName})`;
    }
    
    alert('ส่งรายงานปัญหา/ข้อเสนอแนะสำเร็จ! ทีมงาน/ประธานจะดำเนินการตรวจสอบและตอบกลับครับ');
}

// Login Page Issue Modal Controls
function openLoginIssueModal() {
    document.getElementById('login-issue-form').reset();
    document.getElementById('login-issue-modal').classList.add('active');
}

function closeLoginIssueModal() {
    document.getElementById('login-issue-modal').classList.remove('active');
}

function handleLoginIssueSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('login-issue-title').value.trim();
    const category = document.getElementById('login-issue-category').value;
    const desc = document.getElementById('login-issue-desc').value.trim();
    const reporterName = document.getElementById('login-issue-reporter').value.trim();
    
    const newIssue = {
        id: 'issue-' + Date.now(),
        title: title,
        category: category,
        reporterName: reporterName,
        reporterRole: 'ผู้แจ้งภายนอก',
        desc: desc,
        status: 'pending',
        date: new Date().toISOString(),
        reply: ''
    };
    
    state.issues.push(newIssue);
    saveToLocalStorage();
    syncItemToFirebase('issues', newIssue.id, newIssue);
    renderAll();
    
    closeLoginIssueModal();
    alert('ส่งรายงานปัญหา/ข้อเสนอแนะสำเร็จ! ทีมงาน/ประธานจะดำเนินการตรวจสอบและตอบกลับครับ');
}

function renderIssuesList() {
    const list = document.getElementById('issues-list');
    if (!list) return;
    list.innerHTML = '';
    
    // Sort issues by date descending
    const sortedIssues = [...state.issues].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update count indicator
    const pendingCount = state.issues.filter(i => i.status === 'pending').length;
    const countBadge = document.getElementById('issues-count');
    if (countBadge) countBadge.textContent = pendingCount;
    
    if (sortedIssues.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">ไม่มีประวัติการแจ้งปัญหาหรือคำแนะนำในระบบ</div>`;
        return;
    }
    
    const categoryNames = {
        ui_bug: '🐞 บั๊กหน้าเว็บ / ระบบค้าง',
        finance_error: '💰 ปัญหายอดเงิน / โอนเงินผิดพลาด',
        general_suggestion: '💡 ข้อเสนอแนะทั่วไป',
        others: '❓ อื่น ๆ'
    };
    
    sortedIssues.forEach(issue => {
        const card = document.createElement('div');
        card.className = 'issue-card';
        
        let statusBadge = issue.status === 'pending' 
            ? `<span class="badge badge-pending">รอตรวจรับ</span>` 
            : `<span class="badge badge-approved">แก้ไขแล้ว</span>`;
            
        let actionButtons = '';
        if (state.user && state.user.role === 'president') {
            actionButtons = `
                <div style="display:flex; gap: 0.35rem; margin-top: 0.5rem;">
                    ${issue.status === 'pending' ? `
                        <button class="btn btn-success" style="font-size: 0.75rem; padding: 0.35rem 0.5rem; width: auto;" onclick="resolveIssue('${issue.id}')">
                            <i class="fa-solid fa-check"></i> ทำเครื่องหมายแก้ไขแล้ว
                        </button>
                    ` : ''}
                    <button class="btn" style="font-size: 0.75rem; padding: 0.35rem 0.5rem; width: auto; background: var(--bg-tertiary);" onclick="replyIssue('${issue.id}')">
                        <i class="fa-solid fa-reply"></i> ${issue.reply ? 'แก้ไขคำตอบ' : 'ตอบกลับผู้แจ้ง'}
                    </button>
                </div>
            `;
        }
        
        let replyHtml = issue.reply 
            ? `<div class="issue-reply-box">
                <strong>✍️ ประธานตอบกลับ:</strong> ${issue.reply}
               </div>`
            : '';
            
        card.innerHTML = `
            <div class="issue-header">
                <div>
                    <span class="issue-title-text">${issue.title}</span>
                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
                        หมวดหมู่: ${categoryNames[issue.category] || issue.category}
                    </div>
                </div>
                ${statusBadge}
            </div>
            <div class="issue-body-text">${issue.desc}</div>
            ${replyHtml}
            <div class="issue-footer">
                <span>โดย: ${issue.reporterName} (${issue.reporterRole})</span>
                <span>${formatDateTime(issue.date)}</span>
            </div>
            ${actionButtons}
        `;
        list.appendChild(card);
    });
}

function resolveIssue(issueId) {
    const issue = state.issues.find(i => i.id === issueId);
    if (!issue) return;
    
    issue.status = 'resolved';
    
    // Record log
    const newLog = {
        id: 'log-' + Date.now(),
        date: new Date().toISOString(),
        type: 'approve',
        desc: `แก้ไขและปิดเคสแจ้งปัญหา: "${issue.title}" ของคุณ${issue.reporterName}`,
        actor: state.user.name
    };
    state.logs.push(newLog);
    
    saveToLocalStorage();
    syncItemToFirebase('issues', issue.id, issue);
    syncItemToFirebase('logs', newLog.id, newLog);
    renderAll();
    alert('บันทึกสถานะการแก้ไขปัญหาเรียบร้อย!');
}

function replyIssue(issueId) {
    const issue = state.issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const replyText = prompt('กรอกข้อความตอบกลับ:', issue.reply || '');
    if (replyText === null) return; // user cancelled
    
    issue.reply = replyText.trim();
    saveToLocalStorage();
    syncItemToFirebase('issues', issue.id, issue);
    renderAll();
    alert('ส่งข้อความตอบกลับเรียบร้อย!');
}

// ========== ADMIN: MEMBER MANAGEMENT SYSTEM ==========
function renderAdminMembersList() {
    const list = document.getElementById('admin-members-list');
    if (!list) return;
    list.innerHTML = '';
    
    // ค้นหารายชื่อจากช่อง input ค้นหาสมาชิก
    const searchInput = document.getElementById('admin-member-search');
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    let filteredMembers = state.members;
    if (q) {
        filteredMembers = state.members.filter(m => 
            m.id.toLowerCase().includes(q) ||
            m.firstName.toLowerCase().includes(q) ||
            m.lastName.toLowerCase().includes(q) ||
            (m.firstName + ' ' + m.lastName).toLowerCase().includes(q) ||
            (m.room || '5/8').toLowerCase().includes(q)
        );
    }
    
    // Sort members by Room first, then by Name (Thai locale)
    const sortedMembers = [...filteredMembers].sort((a, b) => {
        const roomA = a.room || '5/8';
        const roomB = b.room || '5/8';
        const roomCompare = roomA.localeCompare(roomB);
        if (roomCompare !== 0) return roomCompare;
        
        const nameA = a.firstName || '';
        const nameB = b.firstName || '';
        return nameA.localeCompare(nameB, 'th');
    });
    
    sortedMembers.forEach(m => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--border-color)';
        row.innerHTML = `
            <td style="padding: 0.5rem; font-family: monospace; font-weight: bold; color: var(--text-secondary);">${m.id}</td>
            <td style="padding: 0.5rem; color: var(--text-primary);">${m.firstName} ${m.lastName}</td>
            <td style="padding: 0.5rem; color: var(--text-secondary);">${m.room || '5/8'}</td>
            <td style="padding: 0.5rem; text-align: right; display: flex; justify-content: flex-end; gap: 0.35rem;">
                <button class="btn" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: var(--accent-primary); color: white; border: none; border-radius: 0.25rem; width: auto;" onclick="startEditMember('${m.id}')">
                    <i class="fa-solid fa-edit"></i> แก้ไข
                </button>
                <button class="btn" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: var(--accent-danger); color: white; border: none; border-radius: 0.25rem; width: auto;" onclick="deleteMember('${m.id}')">
                    <i class="fa-solid fa-trash-can"></i> ลบ
                </button>
            </td>
        `;
        list.appendChild(row);
    });
}

function startEditMember(id) {
    const member = state.members.find(m => m.id === id);
    if (!member) return;
    
    document.getElementById('manage-member-mode').value = 'edit';
    document.getElementById('manage-member-id').value = member.id;
    document.getElementById('manage-member-id').setAttribute('readonly', 'true');
    document.getElementById('manage-member-id').style.backgroundColor = 'var(--bg-tertiary)';
    document.getElementById('manage-member-firstname').value = member.firstName;
    document.getElementById('manage-member-lastname').value = member.lastName;
    document.getElementById('manage-member-room').value = member.room || '5/8';
    
    const saveBtn = document.getElementById('btn-save-member');
    saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> บันทึกการแก้ไข';
    saveBtn.className = 'btn btn-success';
    
    document.getElementById('btn-cancel-edit-member').style.display = 'inline-block';
}

function cancelEditMember() {
    document.getElementById('member-manage-form').reset();
    document.getElementById('manage-member-mode').value = 'add';
    
    const idInput = document.getElementById('manage-member-id');
    idInput.removeAttribute('readonly');
    idInput.style.backgroundColor = '';
    
    const saveBtn = document.getElementById('btn-save-member');
    saveBtn.innerHTML = '<i class="fa-solid fa-plus-circle"></i> เพิ่มสมาชิกใหม่';
    saveBtn.className = 'btn btn-primary';
    
    document.getElementById('btn-cancel-edit-member').style.display = 'none';
}

function handleSaveMember(event) {
    event.preventDefault();
    
    const mode = document.getElementById('manage-member-mode').value;
    const id = document.getElementById('manage-member-id').value.trim();
    const firstName = document.getElementById('manage-member-firstname').value.trim();
    const lastName = document.getElementById('manage-member-lastname').value.trim();
    const room = document.getElementById('manage-member-room').value;
    
    if (!id || !firstName || !lastName) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    let logMsg = '';
    
    if (mode === 'add') {
        const exists = state.members.some(m => m.id === id);
        if (exists) {
            alert('❌ รหัสประจำตัวนี้มีอยู่ในระบบแล้ว');
            return;
        }
        state.members.push({ id, firstName, lastName, room });
        logMsg = `เพิ่มสมาชิกใหม่: ${firstName} ${lastName} (รหัส: ${id}, ห้อง: ${room})`;
    } else {
        const member = state.members.find(m => m.id === id);
        if (member) {
            const oldDetails = `${member.firstName} ${member.lastName} (ห้อง: ${member.room || '5/8'})`;
            member.firstName = firstName;
            member.lastName = lastName;
            member.room = room;
            logMsg = `แก้ไขข้อมูลสมาชิก: จาก "${oldDetails}" เป็น "${firstName} ${lastName} (ห้อง: ${room})"`;
        }
    }
    
    // บันทึก Log
    if (logMsg) {
        const newLog = {
            id: 'log-' + Date.now(),
            date: new Date().toISOString(),
            type: mode === 'add' ? 'member_add' : 'member_edit',
            desc: logMsg,
            actor: state.user ? state.user.name : 'ระบบ'
        };
        state.logs.push(newLog);
        syncItemToFirebase('logs', newLog.id, newLog);
    }
    
    saveToLocalStorage();
    syncItemToFirebase('settings', 'members', { list: state.members });
    
    renderAdminMembersList();
    cancelEditMember();
    alert('บันทึกข้อมูลสมาชิกเรียบร้อย!');
}

function deleteMember(id) {
    const member = state.members.find(m => m.id === id);
    if (!member) return;
    
    if (!confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก "${member.firstName} ${member.lastName}" (รหัส: ${member.id}) ออกจากระบบ?`)) {
        return;
    }
    
    const details = `${member.firstName} ${member.lastName} (รหัส: ${member.id}, ห้อง: ${member.room || '5/8'})`;
    state.members = state.members.filter(m => m.id !== id);
    
    // บันทึก Log การลบ
    const newLog = {
        id: 'log-' + Date.now(),
        date: new Date().toISOString(),
        type: 'member_delete',
        desc: `ลบสมาชิกออกจากระบบ: ${details}`,
        actor: state.user ? state.user.name : 'ระบบ'
    };
    state.logs.push(newLog);
    syncItemToFirebase('logs', newLog.id, newLog);
    
    saveToLocalStorage();
    syncItemToFirebase('settings', 'members', { list: state.members });
    
    renderAdminMembersList();
    alert('ลบรายชื่อสมาชิกเรียบร้อย!');
}
