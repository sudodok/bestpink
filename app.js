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
        props: 0
    },
    requests: [],        // [{id, name, department, item, amount, category, memo, receipt, productPhoto, qrcode, transferSlip, status, rejectReason, approvedBy, date}]
    logs: []             // [{id, date, type, desc, actor}]
};

// Standard Departments mapping
const DEPARTMENTS = {
    stand: { name: '🎨 ฝ่ายสแตนด์เชียร์', color: 'var(--dept-stand)' },
    leaders: { name: '💃 ฝ่ายเชียร์ลีดเดอร์', color: 'var(--dept-leaders)' },
    parade: { name: '🎺 ฝ่ายขบวนพาเหรด', color: 'var(--dept-parade)' },
    welfare: { name: '🍱 ฝ่ายสวัสดิการและอาหาร', color: 'var(--dept-welfare)' },
    props: { name: '🎭 ฝ่ายอุปกรณ์และฉาก', color: 'var(--dept-props)' }
};

// ========== รายชื่อสมาชิกคณะสีชมพู ==========
const MEMBERS = [
    // รายชื่อเดิม
    { id: '40119', firstName: 'ธนโชติ',     lastName: 'แจ้งเลิศ' },
    { id: '40134', firstName: 'ธรรมรัตน์',   lastName: 'อุดรศรี' },
    { id: '40195', firstName: 'ปองคุณ',      lastName: 'อรรคชัยพานิช' },
    { id: '42230', firstName: 'กฤษณ์',       lastName: 'ลือวัฒนานนท์' },
    { id: '42235', firstName: 'คณิศร',       lastName: 'กิ่งกันคำ' },
    { id: '42264', firstName: 'ปกรณ์เกียรติ', lastName: 'เคนจอม' },
    { id: '42272', firstName: 'พงศกร',       lastName: 'อุดเวียง' },
    { id: '42273', firstName: 'พชร',         lastName: 'จักรเงิน' },
    { id: '42280', firstName: 'พีรพัฒน์',    lastName: 'แสนคำวัง' },
    { id: '42281', firstName: 'พีรวัส',      lastName: 'วังหา' },
    { id: '42303', firstName: 'อาทิตย์',     lastName: 'กาญจนกูล' },
    { id: '39954', firstName: 'กฤตภรณ์',    lastName: 'พรินทรากูล' },
    { id: '39976', firstName: 'กัญญาณัฐ',   lastName: 'สุขศิลปชัย' },
    { id: '39979', firstName: 'กัญญารัตน์',   lastName: 'เรื่องขจร' },
    { id: '39988', firstName: 'กาญจนา',     lastName: 'เหมืองจา' },
    { id: '40037', firstName: 'ชนัญชิตา',   lastName: 'สายาจักร' },
    { id: '40054', firstName: 'ชวิศา',      lastName: 'คงคารักษ์' },
    { id: '40057', firstName: 'ชลลิสา',     lastName: 'คำปาแฝง' },
    { id: '40088', firstName: 'ณัฐธิดา',    lastName: 'ไชยยอด' },
    { id: '40104', firstName: 'ตามภรณ์',    lastName: 'ชัยชนะ' },
    { id: '40109', firstName: 'ทักษพร',     lastName: 'อุดร' },
    { id: '40112', firstName: 'ธนิตากานต์', lastName: 'ธนสาร' },
    { id: '40147', firstName: 'ธิดารัตน์',  lastName: 'วิเชียรกันทา' },
    { id: '40161', firstName: 'นันท์ชพร',   lastName: 'เสนากูล' },
    { id: '40184', firstName: 'ปภาวรินทร์', lastName: 'บุตรเสน' },
    { id: '40185', firstName: 'ปภาวรินทร์', lastName: 'วังอินทร์' },
    { id: '40232', firstName: 'พรอนงค์',    lastName: 'ยาสุปิ' },
    { id: '40244', firstName: 'พัทธ์ธิดา',  lastName: 'วาสนาโลก' },
    { id: '40267', firstName: 'พิมพ์ลภัส',  lastName: 'วันมหาใจ' },
    { id: '40318', firstName: 'มนัญชยา',    lastName: 'อินต๊ะวงศ์' },
    { id: '40339', firstName: 'วรณัน',      lastName: 'อินต๊ะจัง' },
    { id: '40359', firstName: 'ศกุลตลา',    lastName: 'คชปัญญา' },
    { id: '40404', firstName: 'สุภนิตา',    lastName: 'ถาป้อม' },
    { id: '40424', firstName: 'อัญชิษฐา',   lastName: 'วาปีศิริ' },
    { id: '42240', firstName: 'ฐิตาภา',     lastName: 'คำน้ำปาด' },
    { id: '42243', firstName: 'ณัฐกฤตา',    lastName: 'อุตสม' },
    { id: '42250', firstName: 'ธมลวรรณ',    lastName: 'อินจันทร์' },
    { id: '42276', firstName: 'พัทธ์ธีรา',  lastName: 'ประพัศรางค์' },
    { id: '40281', firstName: 'วุฒินันท์',  lastName: 'นันทะไสย' },
    { id: '42292', firstName: 'วนัชพร',     lastName: 'กาศสนุก' },
    { id: '42932', firstName: 'ภิรพัชร',    lastName: 'หิรัตน์พันธุ์' },

    // รายชื่อใหม่เพิ่มเติม
    { id: '39967', firstName: 'กฤติธี',     lastName: 'แสนคำ' },
    { id: '39998', firstName: 'เกียรติสกุล', lastName: 'กันกา' },
    { id: '40019', firstName: 'จิรัฏฐ์',     lastName: 'บัตริยะ' },
    { id: '40050', firstName: 'ชยุตพงศ์',   lastName: 'ดีคำ' },
    { id: '40059', firstName: 'ชิษณุพงศ์',   lastName: 'ทะจักร์' },
    { id: '40309', firstName: 'ภาวิต',      lastName: 'ภาสสัทธา' },
    { id: '40338', firstName: 'วรนน',       lastName: 'สัจจะนรพันธ์' },
    { id: '40350', firstName: 'วิเชียรรัตน์',  lastName: 'ดอกแก้ว' },
    { id: '39993', firstName: 'กิตพร',      lastName: 'เพชรพัฒนากุล' },
    { id: '40049', firstName: 'ชยาดา',      lastName: 'สมบูรณ์' },
    { id: '40076', firstName: 'ณฤดี',       lastName: 'ศรีเจริญภากร' },
    { id: '40087', firstName: 'ณัฐธยาน์',    lastName: 'แก้วกล้า' },
    { id: '40092', firstName: 'ณัฐภัสสร',    lastName: 'ยศเลิศ' },
    { id: '40122', firstName: 'ธนพร',      lastName: 'ใจยะ' },
    { id: '40132', firstName: 'ธนิสตา',     lastName: 'สีอินทร์' },
    { id: '40179', firstName: 'ปณิตา',      lastName: 'ถุงพลอย' },
    { id: '40200', firstName: 'ปัทมพร',     lastName: 'กาศเกษม' },
    { id: '40202', firstName: 'ปานปั้น',     lastName: 'นุชธิสาร' },
    { id: '40245', firstName: 'พัทธนันท์',    lastName: 'คำลือ' },
    { id: '40266', firstName: 'พิมพ์ลภัส',    lastName: 'แตกฉาน' },
    { id: '40294', firstName: 'ภรภัทร',      lastName: 'ไชยยงยศ' },
    { id: '40352', firstName: 'วิภาดา',     lastName: 'แสนสนั่น' },
    { id: '40363', firstName: 'ศศินิภา',     lastName: 'โปธาตุ' },
    { id: '40376', firstName: 'ศุภรดา',     lastName: 'ศิริบรรพต' },
    { id: '40380', firstName: 'ศุภิสรา',     lastName: 'แก้วมา' },
    { id: '42242', firstName: 'ณัฏฐณิชา',    lastName: 'สมนึก' },
    { id: '42260', firstName: 'นันท์นภัส',   lastName: 'ศรีชมภู' },
    { id: '42283', firstName: 'ไพลิน',      lastName: 'ฤทธิ์สมบูรณ์' }
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

    const filtered = MEMBERS.filter(m =>
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
            <span style="color: var(--text-primary); font-weight: 600;">${m.firstName} ${m.lastName}</span>
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
    // 1. Save to LocalStorage immediately
    localStorage.setItem('pink_team_finance_state_v3', JSON.stringify(state));
    
    // 2. Save to IndexedDB (asynchronous database)
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
    
    // 3. Save to Firebase Firestore if enabled
    if (useFirebase && db) {
        db.collection('settings').doc('pink_team_state').set(state)
            .then(() => console.log("State synced to Firebase Firestore"))
            .catch(err => console.error("Error syncing to Firebase:", err));
    }
}

function loadFromDatabase(callback) {
    if (useFirebase && db) {
        console.log("Attempting to connect to Firebase Firestore...");
        let hasLoaded = false;
        
        // ตั้งเวลา Timeout 3.5 วินาที หากเชื่อมต่อ Firebase ไม่สำเร็จจะดึงข้อมูลเครื่องโลคอลแทนทันที
        const fbTimeout = setTimeout(() => {
            if (!hasLoaded) {
                console.warn("⚠️ Firebase connection timed out. Falling back to local database...");
                // ปิดการใช้ Firebase ชั่วคราวเพื่อให้ระบบออฟไลน์ทำงานแทน
                useFirebase = false; 
                loadLocalData(callback);
            }
        }, 3500);

        // โหลดข้อมูลจาก Firebase Firestore
        db.collection('settings').doc('pink_team_state').get()
            .then(doc => {
                if (hasLoaded) return;
                hasLoaded = true;
                clearTimeout(fbTimeout);

                if (doc.exists) {
                    const currentUser = state.user;
                    state = doc.data();
                    state.user = currentUser;
                    
                    console.log("State loaded successfully from Firebase Firestore");
                    setupFirebaseRealtimeListener();
                    callback();
                } else {
                    console.log("Firebase state document not found, seeding with local data...");
                    loadLocalData(() => {
                        saveToLocalStorage(); 
                        setupFirebaseRealtimeListener();
                        callback();
                    });
                }
            })
            .catch(err => {
                if (hasLoaded) return;
                hasLoaded = true;
                clearTimeout(fbTimeout);
                console.error("Error loading from Firebase, falling back to local database:", err);
                loadLocalData(callback);
            });
    } else {
        loadLocalData(callback);
    }
}

let firebaseListenerUnsubscribe = null;
function setupFirebaseRealtimeListener() {
    if (!useFirebase || !db) return;
    
    if (firebaseListenerUnsubscribe) {
        firebaseListenerUnsubscribe();
    }
    
    firebaseListenerUnsubscribe = db.collection('settings').doc('pink_team_state')
        .onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                const currentUser = state.user;
                state = data;
                state.user = currentUser; // Maintain current session locally
                
                console.log("State synced in real-time from Firebase Firestore");
                if (state.user) {
                    renderAll(); // Renders the active dashboard views
                }
            }
        }, err => {
            console.error("Firebase realtime sync error:", err);
        });
}

function loadLocalData(callback) {
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
}

function loadFromLocalStorageFallback() {
    const saved = localStorage.getItem('pink_team_finance_state_v3');
    if (saved) {
        try {
            state = JSON.parse(saved);
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
    state.allocations = { stand: 0, leaders: 0, parade: 0, welfare: 0, props: 0 };
    state.requests = [];
    state.logs = [];
    saveToLocalStorage();
}

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
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
            roleDisplay = `<i class="fa-solid fa-crown"></i> ประธานสวัสดิการ`;
            document.getElementById('user-avatar').style.background = 'var(--accent-warning)';
            
            // President: Show navigation and financial metrics, but hide request related tabs
            tabNav.style.display = 'flex';
            metricsGrid.style.display = '';
            document.getElementById('tab-request').style.display = 'none';
            document.getElementById('tab-member-history').style.display = 'none';
            document.getElementById('tab-dashboard').style.display = '';
            document.getElementById('tab-pending').style.display = '';
            document.getElementById('tab-logs').style.display = '';
            
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
    } else {
        // President mode
        nameInput.value = '—';
        deptDispInput.value = 'เฉพาะสมาชิกฝ่าย';
        deptInput.value = '';
        
        // Disable request submission
        requestFormWarning.style.display = 'block';
        submitRequestBtn.setAttribute('disabled', 'true');
        
        // Enable income panel for president
        presidentWarning.style.display = 'none';
        incomeFormInputs.forEach(el => el.removeAttribute('disabled'));
        if (incomeActor) incomeActor.value = state.user.name;
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
    
    if (user === 'admin' && pass === '1234') {
        errorMsg.style.display = 'none';
        state.user = {
            name: 'ประธานสวัสดิการ (อภิสิทธิ์)',
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

// UI Rendering Controller
function renderAll() {
    calculateAndRenderMetrics();
    renderDepartmentAllocations();
    renderRecentTransactions();
    renderPendingQueue();
    renderLogsList();
    renderMemberHistory();
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
        'member-history-view': 'tab-member-history'
    };
    document.getElementById(map[viewId]).classList.add('active');
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
                
                <div class="card-images-preview-3way">
                    <div>
                        <div style="font-size: 0.7rem; margin-bottom: 2px; color: var(--text-muted); text-align:center;">1. ใบเสร็จ</div>
                        <img src="${req.receipt || MOCK_RECEIPT_SVG}" onclick="viewImage('${req.receipt || MOCK_RECEIPT_SVG}')" alt="Receipt">
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; margin-bottom: 2px; color: var(--text-muted); text-align:center;">2. รูปสินค้า</div>
                        <img src="${req.productPhoto || MOCK_PRODUCT_SVG}" onclick="viewImage('${req.productPhoto || MOCK_PRODUCT_SVG}')" alt="Product">
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; margin-bottom: 2px; color: var(--text-muted); text-align:center;">3. QR Code</div>
                        <img src="${req.qrcode || MOCK_QRCODE_SVG}" onclick="viewImage('${req.qrcode || MOCK_QRCODE_SVG}')" alt="QR Code">
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
                imageRowMarkup = `
                    <div class="log-thumbs-row">
                        <div class="log-thumb-wrapper">
                            <img src="${req.receipt}" class="log-img-thumb" onclick="viewImage('${req.receipt}')">
                            <span>1. ใบเสร็จ</span>
                        </div>
                        <div class="log-thumb-wrapper">
                            <img src="${req.productPhoto}" class="log-img-thumb" onclick="viewImage('${req.productPhoto}')">
                            <span>2. สินค้า</span>
                        </div>
                        <div class="log-thumb-wrapper">
                            <img src="${req.qrcode}" class="log-img-thumb" onclick="viewImage('${req.qrcode}')">
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

// Image File preview loader
function handleImagePreview(input, previewId) {
    const file = input.files[0];
    const previewContainer = document.getElementById(previewId);
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = previewContainer.querySelector('img');
            img.src = e.target.result;
            previewContainer.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

// Remove Previews
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
        alert('เฉพาะสมาชิกในสีปทุมชาติเท่านั้นที่มีสิทธิ์เบิกจ่ายเงิน');
        return;
    }
    
    const name = state.user.name;
    const department = state.user.department;
    
    const item = document.getElementById('req-item').value;
    const amount = parseFloat(document.getElementById('req-amount').value);
    const category = 'สปอร์ตเดย์'; // Default fallback
    const memo = document.getElementById('req-memo').value.trim();
    
    const receiptImg = document.getElementById('receipt-preview').querySelector('img').src;
    const productImg = document.getElementById('product-preview').querySelector('img').src;
    const qrcodeImg = document.getElementById('qrcode-preview').querySelector('img').src;
    
    const finalReceipt = receiptImg || MOCK_RECEIPT_SVG;
    const finalProduct = productImg || MOCK_PRODUCT_SVG;
    const finalQrcode = qrcodeImg || MOCK_QRCODE_SVG;
    
    const reqId = 'req-' + Date.now();
    const newRequest = {
        id: reqId,
        name: name,
        department: department,
        item: item,
        amount: amount,
        category: category,
        memo: memo,
        receipt: finalReceipt,
        productPhoto: finalProduct,
        qrcode: finalQrcode,
        transferSlip: null,
        status: 'pending',
        rejectReason: '',
        approvedBy: '',
        date: new Date().toISOString()
    };
    
    state.requests.push(newRequest);
    
    // Record log
    state.logs.push({
        id: 'log-' + Date.now(),
        date: new Date().toISOString(),
        type: 'upload',
        requestId: reqId,
        desc: `ส่งคำขอเบิกเงิน: ${item} ยอดเงิน ฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฝ่าย${getDeptDisplayName(department)}`,
        actor: name
    });
    
    saveToLocalStorage();
    renderAll();
    
    // Reset Form
    document.getElementById('reimbursement-form').reset();
    document.getElementById('receipt-preview').style.display = 'none';
    document.getElementById('receipt-preview').querySelector('img').src = '';
    document.getElementById('product-preview').style.display = 'none';
    document.getElementById('product-preview').querySelector('img').src = '';
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
    
    state.logs.push({
        id: 'log-' + Date.now(),
        date: new Date().toISOString(),
        type: 'income',
        desc: `บันทึกเงินรับเข้าคลังสีชมพู: ${desc} ยอด ฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
        actor: actor
    });
    
    saveToLocalStorage();
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
        
        state.logs.push({
            id: 'log-' + Date.now(),
            date: new Date().toISOString(),
            type: 'approve',
            requestId: req.id,
            desc: `อนุมัติการเบิกเงินสำเร็จ: ${req.item} ยอด ฿${req.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} คณะสีชมพู (ฝ่าย${getDeptDisplayName(req.department)})`,
            actor: req.approvedBy
        });
        
        saveToLocalStorage();
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
    
    state.logs.push({
        id: 'log-' + Date.now(),
        date: new Date().toISOString(),
        type: 'reject',
        requestId: req.id,
        desc: `ปฏิเสธใบเบิกเงิน: ${req.item} ยอดเงิน ฿${req.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (ฝ่าย${getDeptDisplayName(req.department)}) เหตุผล: ${reason}`,
        actor: req.approvedBy
    });
    
    saveToLocalStorage();
    renderAll();
    closeRejectModal();
    alert('บันทึกการปฏิเสธใบเบิกเงินลงประวัติสำเร็จ');
}

// Render Member's Personal History
function renderMemberHistory() {
    const tbody = document.getElementById('member-history-table');
    if (!tbody || !state.user || state.user.role !== 'purchaser') return;
    
    tbody.innerHTML = '';
    
    // Filter requests submitted by this logged-in member
    const myRequests = state.requests.filter(req => req.name === state.user.name && req.department === state.user.department);
    
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
                <div style="font-weight: 500;">${req.item}</div>
                ${req.memo ? `<div style="font-size:0.75rem; color:var(--text-secondary);">หมายเหตุ: ${req.memo}</div>` : ''}
            </td>
            <td style="font-weight: 600;">${formatCurrency(req.amount)}</td>
            <td>${statusBadge}</td>
            <td>${slipCell}</td>
        `;
        tbody.appendChild(tr);
    });
}
