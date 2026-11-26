/**
 * ============================================================
 * CSIT PROJECT SHOWCASE & TECH EXPO PLATFORM
 * CITS Week 2026 • STI College Laoag
 * Clean Academic & Student Exhibition Directory
 * ============================================================
 */

const APPS_CATALOG = [
    {
        id: 'agriguard',
        name: 'AgriGuard',
        subtitle: 'Smart Crop Protection & AI Monitoring System',
        shortDesc: 'Automated field protection system combining computer vision bird intrusion detection, acoustic deterrent alarms, and real-time protection analytics.',
        fullDesc: 'AgriGuard is an undergraduate engineering thesis combining physical IoT hardware and computer vision. Built to safeguard agricultural fields by detecting bird intrusions via camera modules, triggering automated acoustic deterrents, recording intrusion timestamps, and providing farm owners with actionable analytics.',
        developer: 'AgriGuard Research & Development Team',
        degree: 'BSCS / BSIT Undergraduate Thesis',
        category: 'Agriculture & AI',
        platform: 'Mobile App & IoT System',
        platformIcon: 'fa-solid fa-mobile-screen-button',
        status: 'Live Working System',
        iconType: 'image',
        iconSrc: 'apps/agriguard/app_logo2.jpeg',
        url: 'apps/agriguard/index.html',
        apkUrl: 'apps/agriguard/AgriGuard.apk',
        badge: 'Live IoT System',
        exhibitTrack: 'Smart Agriculture & IoT',
        version: 'v1.0.0 Release',
        features: [
            'Real-time bird intruder detection using field camera module',
            'Smart automated acoustic deterrent system with field speaker',
            'Event logging of bird intrusion duration & frequencies',
            'Field protection analytics & effectiveness scoring dashboard'
        ],
        techStack: ['Android Kotlin', 'OpenCV / YOLO', 'Python / Flask', 'Raspberry Pi 4', 'SQLite']
    },
    {
        id: 'balde-against-el-nino',
        name: 'Balde Against El Niño',
        subtitle: 'One Bucket, One Family — Civic Survival Web Game',
        shortDesc: 'Interactive satirical web game where players catch street rain, assemble family water filter kits, and budget 20 liters of water under an intense 43°C Heat Index.',
        fullDesc: 'Balde Against El Niño: One Bucket, One Family is an educational civic advocacy web game created by Jaymar Budduan. Inspired by the El Niño drought crisis, it challenges players through 5 stages: Catching Street Rain, 5-Step Bucket Filter Kit Assembly, Household Water Rationing, 43°C Heat Wave Survival, and Civic Policy Reform.',
        developer: 'Jaymar Budduan (@j-mar114)',
        degree: 'BSIT / BSCS Web Project',
        category: 'Web Game & Civic Tech',
        platform: 'Interactive Web Game',
        platformIcon: 'fa-solid fa-gamepad',
        status: 'Playable Web Game',
        iconType: 'image',
        iconSrc: 'apps/balde-against-el-nino/balde-logo.svg?v=2',
        url: 'apps/balde-against-el-nino/index.html',
        liveUrl: 'https://j-mar114.github.io/Balde-Against-El-Ni-o/',
        badge: 'Playable Web Game',
        exhibitTrack: 'Game Development & Civic Tech',
        version: 'v1.0.0 Web Edition',
        features: [
            'Level 1: Street Rain Catching (Evaporation & debris dodging)',
            'Level 2: Assemble the Bucket Filter (5-step family filter kit)',
            'Level 3: Household Water Rationing (Budgeting 20L across family & pets)',
            'Level 4: Heat Wave Survival (Well pumping & hydration management)',
            'Level 5: Long-Term Policy Ending (Advocacy for clean municipal water)'
        ],
        techStack: ['HTML5 Canvas', 'Tailwind CSS', 'Vanilla JavaScript', 'Web Audio API', 'LocalStorage']
    },
    {
        id: 'cyberheist',
        name: 'Cyberheist',
        subtitle: 'Cybersecurity Arcade & Ethical Training Simulation',
        shortDesc: 'A browser-based training arcade with five realistic challenges in password hygiene, code breaking, event log analysis, incident response, and forensics.',
        fullDesc: 'Cyberheist is a command-driven cybersecurity training arcade built for CSIT. Players complete five interactive objectives in an isolated simulation environment, practicing analytical thinking, ethical judgment, and security triage without touching live infrastructure.',
        developer: 'Cyberheist Development Team',
        degree: 'BSIT / BSCS Web Project',
        category: 'Cybersecurity & Education',
        platform: 'Interactive Web App',
        platformIcon: 'fa-solid fa-shield-halved',
        status: 'Live Web Simulation',
        iconType: 'image',
        iconSrc: 'apps/cyberheist/cyberheist-logo.svg',
        url: 'apps/cyberheist/index.html',
        liveUrl: 'https://cyberheist12.netlify.app/',
        badge: 'Live Web Simulation',
        exhibitTrack: 'Cybersecurity & Ethical Computing',
        version: 'Live Web Edition',
        features: [
            'Password Cracking: Identify weak credentials from contextual clues',
            'Code Breaker: Decode structured messages with cryptographic patterns',
            'Log Analysis: Pinpoint anomalies in simulated server event logs',
            'Security Breach: Formulate rapid incident response playbooks',
            'Digital Forensics: Trace digital evidence in simulated investigations'
        ],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase']
    },
    {
        id: 'aim-high-with-sti',
        name: 'Aim High with STI',
        subtitle: 'Official Academic Aviation Arcade & Student Flyer',
        shortDesc: 'A retro aviation arcade game celebrating STI College Laoag. Pilot through academic hurdles, collect honors shields, and generate shareable Latin honor diplomas.',
        fullDesc: 'Aim High with STI is a high-performance Canvas 2D web flight simulator created by Jaymar Budduan. Players navigate the Laoag skyline featuring the Sinking Bell Tower and windmills, dodging academic challenges, gathering coffee boosts, and earning diplomas ranging from Freshman Flyer to Summa Cum Laude.',
        developer: 'Jaymar Budduan (@j-mar114)',
        degree: 'BSIT / BSCS Web Project',
        category: 'Web Game & Civic Tech',
        platform: 'Interactive Web Game',
        platformIcon: 'fa-solid fa-gamepad',
        status: 'Playable Web Game',
        iconType: 'image',
        iconSrc: 'apps/aim-high-with-sti/app_logo.svg',
        url: 'apps/aim-high-with-sti/index.html',
        liveUrl: 'https://j-mar114.github.io/AimHighWithSTI/',
        badge: 'Playable Web Game',
        exhibitTrack: 'Game Development & Academic Media',
        version: 'v1.2.0 Laoag Edition',
        features: [
            'Procedural Web Audio API Synthesizer with zero audio file downloads',
            'Laoag Heritage Parallax (Sinking Bell Tower, Paoay dunes, Bangui windmills)',
            'Latin Honors Academic Grading System (Freshman Flyer to Summa Cum Laude)',
            'Instant 800x1040 PNG Student Flyer Certificate generator for social media',
            'Fluid 60 FPS Canvas 2D engine with touch, keyboard, and mouse controls'
        ],
        techStack: ['HTML5 Canvas', 'Tailwind CSS', 'Vanilla JavaScript (ES6+)', 'Web Audio API', 'LocalStorage']
    }
];

const CATEGORIES = [
    { id: 'all', name: 'All Exhibits', icon: 'fa-solid fa-shapes' },
    { id: 'Agriculture & AI', name: 'Agriculture & AI', icon: 'fa-solid fa-seedling' },
    { id: 'Web Game & Civic Tech', name: 'Web Game & Civic Tech', icon: 'fa-solid fa-gamepad' },
    { id: 'Cybersecurity & Education', name: 'Cybersecurity & Education', icon: 'fa-solid fa-shield-halved' }
];

let currentFilter = 'all';
let searchQuery = '';

/**
 * Initialize on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Ensure dark mode class is never active
    document.documentElement.classList.remove('dark');
    try {
        localStorage.removeItem('csit_store_theme');
    } catch (e) {}

    renderCategories();
    renderApps();
    initSearch();
    initKeyboardShortcuts();
    updateStats();
});

/**
 * Keyboard shortcuts ('/' focuses search, Esc closes modals)
 */
function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput') || document.getElementById('mobileSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        if (e.key === 'Escape') {
            closeQuickView();
            closeSubmissionModal();
        }
    });
}

/**
 * Category Count Helper
 */
function getCategoryCount(catId) {
    if (catId === 'all') return APPS_CATALOG.length;
    return APPS_CATALOG.filter(app => {
        return app.category.toLowerCase().includes(catId.toLowerCase());
    }).length;
}

/**
 * Render Category Filter Pills
 */
function renderCategories() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
        const isActive = cat.id === currentFilter;
        const count = getCategoryCount(cat.id);
        
        const activeClasses = isActive 
            ? 'bg-[#0047AB] text-white shadow-sm font-semibold border-[#0047AB]' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300 font-medium';

        const countBadgeColor = isActive
            ? 'bg-white/25 text-white'
            : 'bg-slate-100 text-slate-600';

        return `
            <button onclick="setCategoryFilter('${cat.id}')" 
                    class="px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 border transition-all duration-150 cursor-pointer whitespace-nowrap tap-effect ${activeClasses}">
                <i class="${cat.icon} text-xs"></i>
                <span>${cat.name}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold ${countBadgeColor}">${count}</span>
            </button>
        `;
    }).join('');
}

function setCategoryFilter(categoryId) {
    currentFilter = categoryId;
    renderCategories();
    renderApps();

    const appsSection = document.getElementById('apps');
    if (appsSection && window.scrollY < appsSection.offsetTop - 120) {
        appsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Search functionality with input sync
 */
function initSearch() {
    const searchInputs = [
        document.getElementById('searchInput'),
        document.getElementById('mobileSearchInput')
    ];
    const clearBtns = [
        document.getElementById('clearSearchBtn'),
        document.getElementById('clearMobileSearchBtn')
    ];

    searchInputs.forEach(input => {
        if (!input) return;
        input.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            
            searchInputs.forEach(otherInput => {
                if (otherInput && otherInput !== input) {
                    otherInput.value = e.target.value;
                }
            });

            clearBtns.forEach(btn => {
                if (btn) btn.classList.toggle('hidden', searchQuery.length === 0);
            });

            renderApps();
        });
    });

    clearBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            searchInputs.forEach(input => { if (input) input.value = ''; });
            searchQuery = '';
            clearBtns.forEach(b => { if (b) b.classList.add('hidden'); });
            renderApps();
        });
    });
}

/**
 * Filter & Render Applications
 */
function renderApps() {
    const grid = document.getElementById('appGrid');
    const resultCount = document.getElementById('resultCount');
    if (!grid) return;

    const filtered = APPS_CATALOG.filter(app => {
        const matchesCategory = currentFilter === 'all' || 
            app.category.toLowerCase().includes(currentFilter.toLowerCase());

        const matchesSearch = searchQuery === '' ||
            app.name.toLowerCase().includes(searchQuery) ||
            app.subtitle.toLowerCase().includes(searchQuery) ||
            app.shortDesc.toLowerCase().includes(searchQuery) ||
            app.developer.toLowerCase().includes(searchQuery) ||
            app.category.toLowerCase().includes(searchQuery) ||
            app.platform.toLowerCase().includes(searchQuery) ||
            (app.techStack && app.techStack.some(t => t.toLowerCase().includes(searchQuery)));

        return matchesCategory && matchesSearch;
    });

    if (resultCount) {
        resultCount.textContent = `Showing ${filtered.length} of ${APPS_CATALOG.length} project${APPS_CATALOG.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-14 px-4 text-center bg-white rounded-2xl border border-slate-200">
                <div class="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mx-auto text-xl mb-3">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <h3 class="text-sm font-bold text-slate-800">No projects match your search</h3>
                <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    We couldn't find any student project matching "<strong>${escapeHtml(searchQuery)}</strong>".
                </p>
                <div class="mt-4 flex items-center justify-center">
                    <button onclick="resetFilters()" class="px-3.5 py-1.5 bg-[#0047AB] hover:bg-[#00388a] active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition">
                        <i class="fa-solid fa-rotate-left mr-1.5"></i> Clear Filters
                    </button>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(app => renderAppCard(app)).join('');
}

function resetFilters() {
    currentFilter = 'all';
    searchQuery = '';
    const searchInputs = [document.getElementById('searchInput'), document.getElementById('mobileSearchInput')];
    searchInputs.forEach(inp => { if (inp) inp.value = ''; });
    const clearBtns = [document.getElementById('clearSearchBtn'), document.getElementById('clearMobileSearchBtn')];
    clearBtns.forEach(btn => { if (btn) btn.classList.add('hidden'); });
    renderCategories();
    renderApps();
}

/**
 * Generate Individual Project Card HTML (Consistent Professional Design)
 */
function renderAppCard(app) {
    const iconHtml = `<img src="${app.iconSrc}" alt="${app.name} Icon" class="w-full h-full object-contain p-1">`;

    return `
        <article class="store-card p-5 sm:p-6 flex flex-col justify-between h-full bg-white border border-slate-200">
            <div>
                <!-- Top Identity Bar -->
                <div class="flex items-start gap-3.5">
                    <div class="w-16 h-16 sm:w-18 sm:h-18 app-squircle overflow-hidden flex-shrink-0 relative border border-slate-200 bg-slate-50 flex items-center justify-center">
                        ${iconHtml}
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-1 mb-1">
                            <span class="text-[10px] font-bold text-[#0047AB] uppercase tracking-wider truncate">
                                ${app.category}
                            </span>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span class="truncate">${app.badge}</span>
                            </span>
                        </div>
                        <h3 class="text-base font-extrabold text-slate-900 truncate leading-snug">
                            ${app.name}
                        </h3>
                        <p class="text-xs text-slate-500 truncate mt-0.5">
                            ${app.developer}
                        </p>
                    </div>
                </div>

                <!-- App Subtitle & Summary -->
                <div class="mt-3.5">
                    <p class="text-xs font-semibold text-slate-800 line-clamp-1 mb-1">
                        ${app.subtitle}
                    </p>
                    <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed h-9">
                        ${app.shortDesc}
                    </p>
                </div>

                <!-- Academic Specs & Platform Row -->
                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div class="flex items-center gap-1.5 font-semibold text-[#0047AB]">
                        <i class="${app.platformIcon || 'fa-solid fa-layer-group'} text-xs"></i>
                        <span>${app.platform}</span>
                    </div>
                    <div class="flex items-center gap-1 text-slate-500 font-medium">
                        <i class="fa-solid fa-graduation-cap text-[11px]"></i>
                        <span class="truncate max-w-[120px]">${app.degree.split(' ')[0]}</span>
                    </div>
                    <div class="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                        <span>${app.version.split(' ')[0]}</span>
                    </div>
                </div>
            </div>

            <!-- Action CTA Area (Consistent STI Blue Buttons) -->
            <div class="mt-5 pt-2 flex items-center gap-2">
                <a href="${app.url}" class="flex-1 bg-[#0047AB] hover:bg-[#00388a] active:scale-[0.98] text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center shadow-sm transition-all flex items-center justify-center gap-2 tap-effect">
                    <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                    <span>Open Showcase</span>
                </a>
                <button onclick="openQuickView('${app.id}')" aria-label="View specifications for ${app.name}" title="View project abstract" class="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 flex items-center justify-center text-slate-700 text-xs transition tap-effect">
                    <i class="fa-solid fa-circle-info text-sm"></i>
                </button>
            </div>
        </article>
    `;
}

/**
 * Quick View Modal Generator
 */
function openQuickView(appId) {
    const app = APPS_CATALOG.find(a => a.id === appId);
    if (!app) return;

    const modal = document.getElementById('quickViewModal');
    const content = document.getElementById('quickViewContent');
    if (!modal || !content) return;

    const iconHtml = `<img src="${app.iconSrc}" alt="${app.name}" class="w-full h-full object-contain p-1">`;

    const techPills = (app.techStack || []).map(t => 
        `<span class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">${t}</span>`
    ).join('');

    const featuresList = (app.features || []).map(f =>
        `<li class="flex items-start gap-2.5 text-xs text-slate-600">
            <span class="w-4 h-4 rounded-full bg-blue-50 text-[#0047AB] flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold">
                <i class="fa-solid fa-check"></i>
            </span>
            <span>${f}</span>
        </li>`
    ).join('');

    const primaryAction = app.liveUrl
        ? `<div class="grid grid-cols-2 gap-2 w-full">
                <a href="${app.url}" class="bg-[#0047AB] hover:bg-[#00388a] text-white font-bold py-2.5 px-3 rounded-xl text-xs text-center shadow-sm transition tap-effect flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-book-open text-xs"></i>
                    <span>Showcase Docs</span>
                </a>
                <a href="${app.liveUrl}" target="_blank" rel="noopener noreferrer" class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 px-3 rounded-xl text-xs text-center shadow-sm transition tap-effect flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-gamepad text-xs"></i>
                    <span>Play Live Demo</span>
                </a>
           </div>`
        : `<a href="${app.url}" class="w-full bg-[#0047AB] hover:bg-[#00388a] active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm text-center shadow-sm flex items-center justify-center gap-2 transition tap-effect">
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                <span>Open Project Exhibit &amp; Files</span>
           </a>`;

    content.innerHTML = `
        <div class="flex items-start gap-4 pb-3 border-b border-slate-100">
            <div class="w-16 h-16 sm:w-20 sm:h-20 app-squircle overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-50 flex items-center justify-center">
                ${iconHtml}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-[#0047AB] uppercase tracking-wider">${app.category}</span>
                    <span class="text-slate-300">•</span>
                    <span class="text-xs text-slate-500 font-medium">${app.platform}</span>
                </div>
                <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight truncate">${app.name}</h2>
                <p class="text-xs text-slate-600 font-medium truncate mt-0.5">${app.subtitle}</p>
                <p class="text-[11px] text-slate-400 mt-1">${app.developer} • ${app.degree}</p>
            </div>
        </div>

        <div>
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Project Abstract</h4>
            <p class="text-xs text-slate-600 leading-relaxed">${app.fullDesc}</p>
        </div>

        <div>
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Key Highlights &amp; Features</h4>
            <ul class="space-y-2">${featuresList}</ul>
        </div>

        <div>
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Technology &amp; Architecture</h4>
            <div class="flex flex-wrap gap-1.5">${techPills}</div>
        </div>

        <div class="pt-2">
            ${primaryAction}
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * Submission Modal Controller (Replaces cheap browser alert)
 */
function openSubmissionModal() {
    const modal = document.getElementById('submissionModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSubmissionModal() {
    const modal = document.getElementById('submissionModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * Update dynamic counts
 */
function updateStats() {
    const totalAppsEl = document.getElementById('statTotalApps');
    const totalCatsEl = document.getElementById('statTotalCats');
    if (totalAppsEl) totalAppsEl.textContent = APPS_CATALOG.length;
    if (totalCatsEl) totalCatsEl.textContent = CATEGORIES.length - 1; // Exclude 'all'
}

/**
 * HTML Escaper
 */
function escapeHtml(string) {
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '&gt;': '>',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}
