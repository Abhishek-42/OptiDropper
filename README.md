# S2C Transfer — Screen-to-Camera Optical Data Transfer

A system for transferring text data optically from a screen to a phone camera, using animated high-density visual grids. Think of it as a supercharged QR code that uses the **entire screen** and **multiple frames** to transfer more data.

## Project Structure

```
s2c-project/
├── packages/
│   └── core/                    # Pure protocol logic (zero UI dependencies)
│       └── src/
│           ├── protocol/        # Types, constants, checksum utilities
│           ├── encoder/         # Text → binary → grid frames
│           └── decoder/         # Camera frame → grid → binary → text
├── apps/
│   ├── encoder-web/             # Desktop web app: generates the visual animation
│   └── decoder-mobile/          # Mobile app (Capacitor APK): scans and decodes
└── .github/
    └── workflows/
        └── android-build.yml    # CI: auto-builds APK on push
```

## Quick Start

```bash
# Install all dependencies
npm install

# Run the encoder (desktop browser)
npm run dev:encoder

# Run the decoder (mobile preview in browser)
npm run dev:decoder
```

## How It Works

1. **Encoder**: Type text into the web encoder → it converts the text to binary, splits it into chunks, and renders each chunk as a black-and-white grid with corner anchors.
2. **Decoder**: Point your phone camera at the screen → the app captures frames, locates the anchor patterns, samples the grid cells, and reassembles the original text.

## Building the APK

Push to the `main` branch on GitHub. The CI workflow will automatically build a debug APK and upload it as a downloadable artifact.

## Tech Stack

- **Core**: TypeScript (no dependencies)
- **Encoder Web**: React + Vite
- **Decoder Mobile**: React + Vite + Capacitor
- **CI/CD**: GitHub Actions
