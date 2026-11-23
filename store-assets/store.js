/**
 * ============================================================
 * CSIT PROJECT SHOWCASE & TECH EXPO PLATFORM
 * CITS Week 2026 • STI College Laoag
 * Central Catalog of Student Web Apps, Mobile Systems & Web Games
 * ============================================================
 */

const APPS_CATALOG = [
    {
        id: 'agriguard',
        name: 'AgriGuard',
        subtitle: 'Smart Crop Protection & AI Monitoring System',
        shortDesc: 'Protects agricultural crops with real-time bird intruder detection and automated acoustic deterrent tracking using Raspberry Pi IoT, computer vision, and alarms.',
        fullDesc: 'AgriGuard is an undergraduate thesis project combining physical IoT hardware and computer vision. Built to detect bird intrusions in farm fields, trigger automated acoustic deterrent alarms, record activity duration, and compute protection effectiveness in real time.',
        developer: 'AgriGuard Research & Development Team',
        degree: 'BSCS / BSIT Undergraduate Thesis',
        category: 'Agriculture & AI',
        platform: 'Mobile App & IoT System',
        platformIcon: 'fa-solid fa-mobile-screen-button',
        status: 'available',
        iconType: 'image',
        iconSrc: 'apps/agriguard/app_logo2.jpeg',
        url: 'apps/agriguard/index.html',
        apkUrl: 'apps/agriguard/AgriGuard.apk',
        badge: 'Live Working System',
        exhibitTrack: 'Smart Agriculture & IoT',
        version: 'v1.0.0 (Release Build)',
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
        name: 'BALDE AGAINST EL NIÑO',
        subtitle: 'One Bucket, One Family — Satirical Survival Web Game',
        shortDesc: 'Satirical Pinoy survival web game where players catch raindrops, assemble a bucket filter kit, and ration 20 liters of water under an intense 43°C Heat Index.',
        fullDesc: 'BALDE AGAINST EL NIÑO: One Bucket, One Family is an interactive satirical web game and civic educational advocacy created by Jaymar Budduan. Inspired by the El Niño drought crisis and official advisories encouraging citizens to "survive with a single bucket," the game features 5 comic stages: Catching Street Rain, 5-Step Bucket Filter Kit Assembly, Household Water Rationing, 43°C Heat Wave Survival, and Long-Term Water Infrastructure Proposals.',
        developer: 'Jaymar Budduan (@j-mar114)',
        degree: 'BSIT / BSCS Web Project',
        category: 'Web Game & Civic Tech',
        platform: 'Interactive Web Game',
        platformIcon: 'fa-solid fa-gamepad',
        status: 'available',
        iconType: 'image',
        iconSrc: 'apps/balde-against-el-nino/balde-logo.svg?v=2',
        url: 'apps/balde-against-el-nino/index.html',
        liveUrl: 'https://j-mar114.github.io/Balde-Against-El-Ni-o/',
        badge: 'Playable Web Game',
        exhibitTrack: 'Game Development & Civic Tech',
        version: 'v1.0.0 (Web Edition)',
        features: [
            'Level 1: Catching Rain in the Street (Evaporation & debris dodging challenge)',
            'Level 2: Assemble the Bucket Filter (5-step family filter kit assembly)',
            'Level 3: Household Water Rationing (Budgeting 20L across family & pets)',
            'Level 4: Heat Wave Survival (Rapid well pumping & hydration maintenance)',
            'Level 5: Long-Term Policy Ending (Advocacy for permanent piped clean water)'
        ],
        techStack: ['HTML5 Canvas', 'Tailwind CSS', 'Vanilla JavaScript', 'Web Audio API', 'LocalStorage Leaderboard']
    },
    {
        id: 'cyberheist',
        name: 'CYBERHEIST',
        subtitle: 'Cybersecurity Arcade & Safe Training Simulation',
        shortDesc: 'A command-driven cybersecurity arcade with five fictional challenges in password hygiene, code breaking, log analysis, incident response, and digital forensics.',
        fullDesc: 'Cyberheist is a browser-based cybersecurity arcade experience built for CSIT. Players complete five randomly selected objectives in an isolated training simulation, using clues and terminal-style commands to practice careful analysis and ethical decision-making. The app emphasizes safe, fictional scenarios and does not access real systems.',
        developer: 'Cyberheist Development Team',
        degree: 'BSIT / BSCS Web Project',
        category: 'Cybersecurity & Education',
        platform: 'Interactive Web App',
        platformIcon: 'fa-solid fa-shield-halved',
        status: 'available',
        iconType: 'image',
        iconSrc: 'apps/cyberheist/cyberheist-logo.svg',
        url: 'apps/cyberheist/index.html',
        liveUrl: 'https://cyberheist12.netlify.app/',
        badge: 'Live Cybersecurity Arcade',
        exhibitTrack: 'Cybersecurity & Ethical Computing',
        version: 'Live Web Edition',
        features: [
            'Password Cracking: identify a weak credential from fictional clues',
            'Code Breaker: decode a message with pattern recognition',
            'Log Analysis: find an anomaly in simulated event data',
            'Security Breach: select an appropriate incident response',
            'Digital Forensics: follow evidence in a fictional investigation'
        ],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase']
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
    initTheme();
    initSplashScreen();
    renderCategories();
    renderApps();
    initSearch();
    initKeyboardShortcuts();
    updateStats();
});

/**
 * Dark / Light Theme Controller
 */
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const savedTheme = localStorage.getItem('csit_store_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    updateThemeIcon();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('csit_store_theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
    syncSplashTheme();
}

function updateThemeIcon() {
    const icon = document.getElementById('themeToggleIcon');
    if (!icon) return;
    if (document.documentElement.classList.contains('dark')) {
        icon.className = 'fa-solid fa-sun text-amber-400 text-sm';
    } else {
        icon.className = 'fa-solid fa-moon text-slate-600 dark:text-slate-300 text-sm';
    }
}

/**
 * Keyboard shortcuts ('/' or 'Ctrl+K' focuses search)
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
            hideSplash();
            closeQuickView();
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
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold border-indigo-600 scale-[1.02]' 
            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 font-medium';

        const countBadgeColor = isActive
            ? 'bg-white/20 text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';

        return `
            <button onclick="setCategoryFilter('${cat.id}')" 
                    class="px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 border transition-all duration-150 cursor-pointer whitespace-nowrap tap-effect ${activeClasses}">
                <i class="${cat.icon} text-xs"></i>
                <span>${cat.name}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full ${countBadgeColor}">${count}</span>
            </button>
        `;
    }).join('');
}

function setCategoryFilter(categoryId) {
    currentFilter = categoryId;
    renderCategories();
    renderApps();

    const appsSection = document.getElementById('apps');
    if (appsSection && window.scrollY < appsSection.offsetTop - 150) {
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
        resultCount.textContent = `Displaying ${filtered.length} of ${APPS_CATALOG.length} exhibited project${APPS_CATALOG.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 px-4 text-center">
                <div class="w-16 h-16 bg-indigo-50 dark:bg-slate-900 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4 border border-indigo-100 dark:border-slate-800">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <h3 class="text-base font-bold text-slate-800 dark:text-white">No exhibited projects match your criteria</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    We couldn't find anything matching "<strong>${escapeHtml(searchQuery)}</strong>" in this category.
                </p>
                <div class="mt-4 flex items-center justify-center gap-2">
                    <button onclick="resetFilters()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition">
                        <i class="fa-solid fa-rotate-left mr-1.5"></i> Clear Search & Filters
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
 * Generate Individual Project Card HTML (Exhibit / Showcase Standard)
 */
function renderAppCard(app) {
    const iconHtml = `<img src="${app.iconSrc}" alt="${app.name} Icon" class="w-full h-full object-contain p-1">`;

    const badgeColor = app.id === 'balde-against-el-nino'
        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700'
        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80';

    const badgeHtml = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor} badge-shimmer">
            <i class="fa-solid fa-circle-check text-[9px]"></i>
            <span>${app.badge}</span>
        </span>
    `;

    const exploreBtn = app.id === 'balde-against-el-nino'
        ? `<a href="${app.url}" class="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-900 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black text-center shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 tap-effect">
                <i class="fa-solid fa-gamepad text-xs"></i>
                <span>Explore Game Showcase</span>
           </a>`
        : `<a href="${app.url}" class="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 tap-effect">
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                <span>Explore Project Showcase</span>
           </a>`;

    const cardBorder = 'border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-xl';

    return `
        <article class="store-card bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border ${cardBorder} flex flex-col justify-between h-full">
            <div>
                <!-- Top Identity Bar -->
                <div class="flex items-start gap-4">
                    <div class="w-16 h-16 sm:w-20 sm:h-20 app-squircle overflow-hidden flex-shrink-0 relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center">
                        ${iconHtml}
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-1">
                            <span class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                                ${app.category}
                            </span>
                            ${badgeHtml}
                        </div>
                        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate leading-snug">
                            ${app.name}
                        </h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            ${app.developer}
                        </p>
                    </div>
                </div>

                <!-- App Subtitle & Summary -->
                <div class="mt-4">
                    <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mb-1">
                        ${app.subtitle}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-9">
                        ${app.shortDesc}
                    </p>
                </div>

                <!-- Academic Specs & Platform Row -->
                <div class="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <div class="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                        <i class="${app.platformIcon || 'fa-solid fa-layer-group'} text-xs"></i>
                        <span>${app.platform}</span>
                    </div>
                    <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                        <i class="fa-solid fa-graduation-cap text-[10px]"></i>
                        <span class="truncate max-w-[120px]">${app.degree.split(' ')[0]}</span>
                    </div>
                    <div class="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                        <span>${app.version.split(' ')[0]}</span>
                    </div>
                </div>
            </div>

            <!-- Action CTA Area -->
            <div class="mt-5 pt-3 flex items-center gap-2">
                ${exploreBtn}
                <button onclick="openQuickView('${app.id}')" aria-label="View specifications for ${app.name}" title="View project abstract" class="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs transition tap-effect">
                    <i class="fa-solid fa-circle-info"></i>
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
        `<span class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">${t}</span>`
    ).join('');

    const featuresList = (app.features || []).map(f =>
        `<li class="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <span class="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px]">
                <i class="fa-solid fa-check"></i>
            </span>
            <span>${f}</span>
        </li>`
    ).join('');

    const primaryAction = app.liveUrl
        ? `<div class="grid grid-cols-2 gap-2 w-full">
                <a href="${app.url}" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-3 rounded-xl text-xs text-center shadow-lg transition tap-effect flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-book-open text-xs"></i>
                    <span>Showcase Info</span>
                </a>
                <a href="${app.liveUrl}" target="_blank" rel="noopener noreferrer" class="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-3 rounded-xl text-xs text-center shadow-lg transition tap-effect flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-gamepad text-xs"></i>
                    <span>Play Live Game</span>
                </a>
           </div>`
        : `<a href="${app.url}" class="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm text-center shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition tap-effect">
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                <span>Open Project Exhibit &amp; Download</span>
           </a>`;

    content.innerHTML = `
        <div class="flex items-start gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="w-16 h-16 sm:w-20 sm:h-20 app-squircle overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center">
                ${iconHtml}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">${app.category}</span>
                    <span class="text-slate-300 dark:text-slate-700">•</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">${app.platform}</span>
                </div>
                <h2 class="text-xl font-black text-slate-900 dark:text-white leading-tight truncate">${app.name}</h2>
                <p class="text-xs text-indigo-700 dark:text-indigo-300 font-medium truncate mt-0.5">${app.subtitle}</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${app.developer} • ${app.degree}</p>
            </div>
        </div>

        <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">Project Abstract</h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${app.fullDesc}</p>
        </div>

        <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Key Gameplay &amp; Stages</h4>
            <ul class="space-y-2">${featuresList}</ul>
        </div>

        <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Technology &amp; Architecture</h4>
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
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}

/**
 * ============================================================
 * ANIMATED CITS SPLASH SCREEN CONTROLLER
 * ============================================================
 */
let splashTimeout = null;

function initSplashScreen() {
    const splash = document.getElementById('cits-splash');
    if (!splash) return;

    syncSplashTheme();

    splash.classList.add('animate-active');

    const statusEl = document.getElementById('splash-status');
    const steps = [
        { time: 600, text: 'Calibrating CITS Expo Exhibits...' },
        { time: 1300, text: 'Synchronizing Student Web Projects...' },
        { time: 2000, text: 'Ready! Launching CSIT Expo Hub...' }
    ];

    steps.forEach(step => {
        setTimeout(() => {
            if (statusEl && !splash.classList.contains('splash-hidden')) {
                statusEl.textContent = step.text;
            }
        }, step.time);
    });

    splashTimeout = setTimeout(() => {
        hideSplash();
    }, 2500);

    splash.addEventListener('click', () => {
        hideSplash();
    });
}

function hideSplash() {
    const splash = document.getElementById('cits-splash');
    if (!splash || splash.classList.contains('splash-hidden')) return;

    if (splashTimeout) clearTimeout(splashTimeout);

    splash.classList.add('splash-hidden');

    setTimeout(() => {
        splash.style.display = 'none';
    }, 750);
}

function syncSplashTheme() {
    const splash = document.getElementById('cits-splash');
    if (!splash) return;
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        splash.classList.remove('light-theme');
    } else {
        splash.classList.add('light-theme');
    }
}
