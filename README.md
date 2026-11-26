# 📱 CSIT App Store

Official repository and showcase of undergraduate thesis mobile applications developed by **Bachelor of Science in Computer Science (BSCS)** and **Bachelor of Science in Information Technology (BSIT)** students.

---

## 🏛️ Project Overview

The **CSIT App Store** provides a unified Play Store-style hub where faculty panelists, student researchers, and the academic community can discover, evaluate, and directly sideload Android packages (`.apk`) from verified undergraduate capstone and thesis defenses.

All catalog metadata is client-rendered with pure **HTML5, CSS3 (Tailwind CSS CDN), and vanilla JavaScript**, requiring no server or backend database.

---

## 📂 Project Architecture

```text
web_download/
├── index.html                      # CSIT App Store Homepage (The Main Hub)
├── store-assets/                   # Shared platform styling & store engine
│   ├── store-logo.jpg              # Official CSIT App Store Logo
│   ├── store.css                   # Custom styles, animations, dark mode
│   └── store.js                    # APPS_CATALOG, search, category filters
│
├── apps/                           # Student project showcases
│   ├── agriguard/                  # AgriGuard download & thesis showcase
│   ├── aim-high-with-sti/          # Aim High with STI academic arcade web game
│   ├── balde-against-el-nino/      # Civic-education web game
│   └── cyberheist/                 # Cybersecurity arcade showcase & live-app captures
│       ├── index.html              # Cyberheist project showcase
│       ├── cyberheist-logo.svg     # Project logo
│       └── cyberheist-*.png        # Live app screenshots
│
├── CSIT App Store Logo.jpg         # Original logo archive
├── robots.txt                      # Crawler directives
├── sitemap.xml                     # Search engine sitemap
└── README.md                       # Project documentation
```

---

## 🌟 Featured & Cataloged Applications

| Application | Category | Status | Version | Tech Stack |
| :--- | :--- | :--- | :--- | :--- |
| **AgriGuard** | Agriculture & AI | **Available** | `v1.0.0` | Kotlin, OpenCV, YOLO, Flask, Raspberry Pi 4 |
| **Aim High with STI** | Web Game & Civic Tech | **Available** | `v1.2.0 (Laoag Edition)` | HTML5 Canvas, Tailwind, Vanilla JS, Web Audio API |
| **BALDE AGAINST EL NIÑO** | Web Game & Civic Tech | **Available** | `v1.0.0` | HTML5 Canvas, Tailwind, Vanilla JS, Web Audio API |
| **CYBERHEIST** | Cybersecurity & Education | **Available** | `Live Web Edition` | React, TypeScript, Vite, Tailwind CSS, Supabase |

---

## 🚀 How to Add a New Thesis App

Adding a new thesis mobile application takes only 2 simple steps:

### Step 1: Create the App Folder
1. Create a new directory under `apps/` with your app slug:
   ```text
   apps/your-app-name/
   ├── index.html       (Your application showcase & download page)
   ├── your-app.apk     (Your APK build)
   ├── icon.png         (App logo)
   └── screenshots/     (UI previews)
   ```
2. In your app's `index.html`, add a **Back to Store** button pointing to `../../index.html`.

### Step 2: Register in `store-assets/store.js`
Open `store-assets/store.js` and add an object entry to `APPS_CATALOG`:

```javascript
{
    id: 'your-app-name',
    name: 'Your App Name',
    subtitle: 'One-line thesis punchline',
    shortDesc: 'Brief 1-2 sentence description for the store card.',
    fullDesc: 'Comprehensive thesis abstract...',
    developer: 'Your Thesis Group Name',
    degree: 'BSCS / BSIT Thesis Project',
    category: 'Healthcare', // e.g. 'Agriculture & AI', 'Healthcare', 'Education', 'Environment', 'Smart City'
    status: 'available',    // Change to 'available' when live
    iconType: 'image',
    iconSrc: 'apps/your-app-name/icon.png',
    url: 'apps/your-app-name/index.html',
    rating: 5.0,
    reviews: 1,
    version: 'v1.0.0',
    size: '18 MB',
    downloads: '100+',
    badge: 'Thesis Verified',
    techStack: ['Android Kotlin', 'TensorFlow Lite', 'Firebase']
}
```

The new card will immediately show up in the store grid, support search, and respond to category filters automatically!

---

## 🎨 Features & Capabilities

- **Responsive Mobile-First Interface**: Adapts seamlessly to smartphone screens, tablets, and desktop displays.
- **Client-Side Real-Time Search**: Search instantaneously across application titles, descriptions, developers, and tags.
- **Interactive Quick View Modal**: Inspect project abstracts, feature breakdowns, and tech stacks without leaving the store.
- **Dark / Light Mode**: Theme switcher with local storage persistence and system preference detection.
- **Zero-Dependency Core**: Powered purely by standard web browsers with CDN delivery.

---

## 📄 License & Credits

Developed with ❤️ for the **College of Computer Studies and Information Technology (CSIT)** thesis archive. All rights reserved by respective student authors and research teams.
