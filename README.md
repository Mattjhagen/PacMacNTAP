# PacMac Mobile — Modern Wireless & PackieAI

[![Vite](https://img.shields.io/badge/Vite-6.x-blueviolet.svg?style=flat-decay)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg?style=flat-decay)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-v4.0-38bdf8.svg?style=flat-decay)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Support-green.svg?style=flat-decay)](#pwa-support)

PacMac Mobile is a cinematic, modern wireless brand built for real people. By combining affordable connectivity, minimalist aesthetics, and advanced call-screening technology, PacMac reimagines what a mobile service provider should feel like.

The experience is centered around **PacMac Mobile** (the wireless brand) and **PackieAI** (the network-level call assistant that screens spam in real time).

---

## 📱 Core Brand & Product Positioning

### 1. PacMac Mobile (The MNO/MVNO Carrier)
* **Demographic**: Digital natives, developers, and tech-focused consumers who want a reliable, simple, and beautifully designed network layer.
* **Pricing & Value**: Simple, no-contract, affordable pricing that targets utility and transparency rather than bloated packages.
* **Support Model**: Approachable, community-centric helpdesk integration that cuts out corporate wait times.

### 2. PackieAI (The Intelligent Call Assistant)
* **Network-Level Filtering**: Runs as a low-latency account setting in the PacMac database. Spam is intercepted before the user's phone even rings.
* **Natural Conversational Screener**: Engages robocallers in interactive dialogs using natural personas (e.g., "Beatrice"), wasting scammers' time and keeping users undisturbed.
* **Bypass Safe List**: Legitimate business or medical calls (e.g., doctor appointments) bypass the assistant smoothly using real-time context analysis.

---

## ✨ Features & Interface

* **Cinematic Minimalist Design**: Premium dark-mode aesthetic utilizing Apple-level whitespace, custom gray scales, glassmorphism, and radial backlight flares.
* **Interactive Particle Starfield**: HTML5 Canvas particle system reacting dynamically to cursor movement and gravity.
* **Live Call Terminal Demo**: Live-simulating dashboard of real-time spam interceptions showing call routing, scammer minutes wasted, and active network screening.
* **PWA & Add to Homescreen**: Full PWA support with installable manifest, custom app favicons, touch-icons, and offline service worker caching.
* **Launch Countdown & Waitlist**: Fully-functional registration workflow that simulates secure queue reservations.

---

## 🛠️ Technical Stack

* **Client Core**: React 19, TypeScript, HTML5 Canvas
* **Styling**: Tailwind CSS v4.0 (utilizing the new `@theme` engine and utility class mappings)
* **Animations**: Framer Motion (`motion/react`) for smooth reveals, layout changes, and interactive mouse-glow trackers
* **Bundler**: Vite
* **Asset Storage**: Portable PWA icon set generated inside `/public`

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v20.x` or `v22.x` is recommended.

### Installation
1. Clone the repository and navigate to the directory:
   ```bash
   git clone https://github.com/Mattjhagen/PacMacNTAP.git
   cd PacMacNTAP
   ```
2. Install the node packages:
   ```bash
   npm install
   ```

### Run Locally
Start the development server (runs by default at `http://localhost:3000`):
```bash
npm run dev
```

### Production Build
Build and optimize the project for production deployment:
```bash
npm run build
```
This generates a production-ready static bundle under the `dist/` directory.

---

## 📡 MVNO Strategic Pitch & Carrier Advantages
*Why major Mobile Network Operators (MNOs) should sign a wholesale agreement with PacMac Mobile:*

| The Challenge | PacMac Solution | Carrier Business Value |
| :--- | :--- | :--- |
| **High Network Signaling Overhead** | **PackieAI Network Filter** | Diverts robocall traffic before it reaches base stations, reducing radio link congestion. |
| **High Customer Care Costs** | **Community-First Help Desk** | Self-organizing support and modern UX reduce support tickets by up to 35%. |
| **Churn to Cheap Competitors** | **Proprietary Sticky Tech** | Free built-in AI call screener increases subscriber retention and brand loyalty. |
| **Saturated Millennial/Gen-Z Market** | **Tech-Start Polish & Brand** | Attracts premium, high-lifetime-value digital natives who reject legacy carrier branding. |

By partnering with PacMac, MNOs gain access to a highly engaged demographic and offload customer acquisition and care costs, while maintaining peak network efficiency via intelligent voice routing.

---

## 📄 License
This project is proprietary. All rights reserved.
