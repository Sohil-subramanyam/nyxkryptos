# Nyx Kryptos - Decentralized Steganographic Vault

**Nyx Kryptos** is a sophisticated decentralized custody system that merges **Threshold Cryptography** with **Generative Steganography**. It allows users to secure sensitive payloads (text and files) by splitting the encryption key into multiple "shards," which are then invisibly embedded into AI-generated artwork.

## ❖ Core Concept

Unlike traditional password managers or vaults that rely on a single database entry, Nyx decentralizes trust:

1. **Encryption**: Data is encrypted using AES-256 with HMAC-SHA256 verification
2. **Sharding**: The master key is split using **Shamir's Secret Sharing** with finite field arithmetic
3. **Steganography**: Each shard is embedded into the pixels of unique AI-generated images using LSB (Least Significant Bit) manipulation
4. **Distribution**: These artifacts are distributed to trusted "Guardians." To unlock the vault, the required threshold of guardians must present their digital artifacts

## ❖ Features

- **Hybrid Payloads**: Secure both secret text messages and file attachments in a single vault
- **Threshold Consensus**: Define how many guardians are needed to unlock the data (e.g., "Need 3 keys out of 5 guardians")
- **AI Art Generation**: Uses Google's Gemini API to create unique cover art for every key shard
- **Invisible Encryption**: Key data is hidden in the Least Significant Bits (LSB) of image data
- **Premium UX**: High-fidelity UI with glassmorphism, fluid animations, and interactive physics-based backgrounds
- **Client-Side Encryption**: All cryptography happens in the browser - keys never leave your device

## ❖ Technical Stack

- **Frontend Framework**: Next.js 16, React 19, TypeScript
- **Cryptography**: `crypto-js` (AES-256-CBC, HMAC-SHA256, Shamir's Secret Sharing)
- **AI Integration**: Google Generative AI API (Gemini 2.0 Flash)
- **Mathematics**: Finite Field Arithmetic (Mersenne Prime 2^521 - 1) for polynomial interpolation
- **Styling**: Tailwind CSS with custom animations and canvas effects
- **Storage**: Browser localStorage (demo) / Supabase (production)

## ❖ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd nyx-kryptos

# Install dependencies
npm install
```

### Configuration

Create a `.env.local` file:
```
API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_NAME=Nyx Kryptos
```

### Development

```bash
npm run dev
# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## ❖ Deployment

### Deploy to Vercel (Recommended)

```bash
vercel
```

### Deploy to Supabase

1. Create a Supabase project
2. Add environment variables
3. Deploy via Vercel with Supabase integration

## ❖ How It Works

### Creating a Vault
1. User provides secret data (text + files)
2. System generates a random 256-bit AES key
3. Data is encrypted with AES-256-CBC
4. Key is split into N shares using Shamir's Secret Sharing
5. Each share is embedded into a unique AI-generated image via LSB steganography
6. Master artifact is downloaded by creator
7. Guardian artifacts are securely stored/transmitted

### Unlocking a Vault
1. User logs in and views their vaults
2. Downloads required guardian artifacts
3. Uploads artifacts (system extracts shards via steganography)
4. Once K shares are collected, Lagrange interpolation reconstructs the master key
5. Data is decrypted and displayed
6. HMAC verification ensures integrity

## ❖ Architecture

### File Structure
```
nyx-kryptos/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main app
│   └── globals.css                   # Global styles
├── components/
│   ├── Dashboard.tsx                 # Vault management
│   ├── VaultCreate.tsx               # Creation wizard
│   ├── Login.tsx                     # Auth form
│   ├── LandingPage.tsx               # Public intro
│   ├── CustomCursor.tsx              # Animated cursor
│   └── InteractiveBackground.tsx     # Canvas effects
├── context/
│   └── AuthContext.tsx               # Auth state
├── services/
│   ├── storageService.ts             # Data persistence
│   └── geminiService.ts              # AI integration
├── utils/
│   ├── crypto.ts                     # Encryption & Shamir's
│   └── steganography.ts              # LSB operations
├── types/
│   └── index.ts                      # TypeScript types
└── package.json
```

## ❖ Security

✅ End-to-end encrypted (client-side only)
✅ Key derivation via finite field arithmetic
✅ HMAC-SHA256 integrity verification
✅ Steganographic obfuscation in artwork
✅ Threshold consensus protection
✅ No single point of failure

## ❖ API Reference

```typescript
// Crypto
generateMasterKey(): string
encryptData(secret: string, key: string): { iv, ciphertext, hmac }
decryptData(vault: VaultData, key: string): string | null
splitKey(secret: string, n: number, k: number): Share[]
reconstructKey(shares: Share[]): string | null

// Steganography
embedDataInImage(base64: string, data: string): Promise<string>
extractDataFromImage(file: File): Promise<string | null>

// Storage
storageService.createVault(vault: VaultData): void
storageService.getVaultsForUser(email: string): VaultData[]
storageService.uploadShare(share: StoredShare): void
storageService.getSharesForVault(vaultId: string): StoredShare[]
```

## ❖ License

MIT License

---

*"Divide your secrets into digital artifacts. Distribute them to the ones you trust."*
