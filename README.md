# ⚡ Optidropper

> **Air-gapped, light-speed data transfer — AirDrop, but powered purely by light & computer vision.**

Ever wanted to beam data to your phone instantly just by pointing your camera at your computer screen? That’s **Optidropper**. 

Static QR codes are too small and slow. Optidropper takes QR technology, puts it on steroids, and turns any screen into a full-resolution visual transmitter while turning mobile cameras into real-time decoders. **No Wi-Fi, no Bluetooth, no pairing—just pure light.**

---

## 🚀 Key Features

- 📸 **Air-Gapped Communication**: Completely network-free optical data transmission.
- 📐 **Full-Screen Utilization**: Uses 100% of your screen area instead of fixed 1:1 square QR codes.
- ⚡ **High-Density Animated Matrices**: Streams sequential binary grid frames at 8–30 FPS with real-time error checking (CRC-8).
- 📱 **Sleek Mobile App (APK)**: Built with a glassmorphic dark theme and automated CI/CD build pipeline via GitHub Actions.
- 🏗️ **SOLID Monorepo Architecture**: Clean separation of core computer-vision logic from UI.

---

## 🛠️ Project Architecture

```text
OptiDropper/
├── packages/
│   └── core/                    # Pure computer vision & encoding engine (Zero UI dependencies)
│       └── src/
│           ├── protocol/        # Types, constants, CRC-8 checksums
│           ├── encoder/         # UTF-8 Text → Binary stream → Grid Frames
│           └── decoder/         # Otsu thresholding → Anchor detection → Grid sampling → Assembler
├── apps/
│   ├── encoder-web/             # Desktop Web App: Generates dynamic screen light stream
│   └── decoder-mobile/          # Mobile APK (Capacitor + React): Real-time camera scanner
└── .github/
    └── workflows/
        └── android-build.yml    # CI/CD: Automated APK compiler on git push
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Web Encoder (PC Screen)
```bash
npm run dev:encoder
# Open http://localhost:5173
```

### 3. Run the Mobile Decoder App (Browser Preview)
```bash
npm run dev:decoder
# Open http://localhost:5174
```

---

## 📦 How to get the Android APK

The repository has an automated **GitHub Action** setup. 

1. Every time you push to `main`, GitHub Actions compiles the Android APK in the cloud.
2. Go to the **Actions** tab on GitHub → Click the latest workflow run.
3. Download **`s2c-decoder-debug`** under the **Artifacts** section!

---

## 🧠 Tech Stack & Concepts

- **Frontend**: React 19, Vite, Vanilla CSS (Glassmorphic dark design system)
- **Native Wrapper**: Capacitor JS (Native Android Camera integration)
- **Core Engine**: TypeScript, UTF-8 Binary Serialization, Otsu Thresholding, Quadrant Bullseye Anchor Tracking
- **CI/CD**: GitHub Actions + Gradle Android toolchain
