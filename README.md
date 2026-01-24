# Nyx Kryptos Protocol

**Nyx Kryptos** is a sophisticated decentralized custody system that merges **Threshold Cryptography** with **Generative Steganography**. It allows users to secure sensitive payloads (text and files) by splitting the encryption key into multiple "shards," which are then invisibly embedded into AI-generated artwork.

## ❖ Core Concept

Unlike traditional password managers or vaults that rely on a single database entry, Nyx decentralizes trust.
1.  **Encryption**: Data is encrypted using AES-256.
2.  **Sharding**: The master key is split using **Shamir's Secret Sharing**. A specific threshold (e.g., 3 out of 5) of shards is required to reconstruct the key.
3.  **Steganography**: Each shard is embedded into the pixels of a unique, AI-generated image (Artifact) using bit-manipulation.
4.  **Distribution**: These artifacts are distributed to trusted "Guardians." To unlock the vault, guardians must present their digital artifacts.

## ❖ Features

*   **Hybrid Payloads**: Secure both secret text messages and file attachments in a single vault.
*   **Threshold Consensus**: Define how many guardians are needed to unlock the data (e.g., "Need 3 keys out of 5 guardians").
*   **AI Art Generation**: Uses Google's Gemini API to create unique cover art for every key shard.
*   **Invisible Ink**: Key data is hidden in the Least Significant Bits (LSB) of the image data, making it invisible to the naked eye.
*   **Premium Experience**: A high-fidelity UI with glassmorphism, fluid animations, and interactive physics-based backgrounds.

## ❖ Technical Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **Cryptography**: `crypto-js` (AES-256, HMAC-SHA256)
*   **AI Model**: Google Gemini API (`gemini-2.5-flash-image`, `gemini-3-flash-preview`)
*   **Mathematics**: Finite Field Arithmetic for Polynomial Interpolation (Shamir's Secret Sharing)
*   **Styling**: Custom CSS for cursors, scroll-snapping, and canvas interactions.

## ❖ Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set your API Key: `export API_KEY=your_google_gemini_api_key`
4.  Run the application: `npm start`

---

*“Divide your secrets into digital artifacts. Distribute them to the ones you trust.”*
