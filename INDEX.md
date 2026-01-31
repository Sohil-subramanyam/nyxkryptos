# Nyx Kryptos - Complete Setup & Deployment Guide

Welcome to Nyx Kryptos! Your decentralized steganographic vault is ready to deploy. This index will guide you through everything.

## 📋 Documentation Index

### Quick Start (5 minutes)
1. **[README.md](./README.md)** - Start here for an overview
   - What is Nyx Kryptos?
   - Feature overview
   - Quick start instructions

### Setup & Fixes (Important!)
2. **[COMPLETE.md](./COMPLETE.md)** - All fixes and what was changed
   - Detailed list of all fixes
   - Before/after comparison
   - Current status verification

### Running Locally
3. **[start.sh](./start.sh)** - Quick local development setup
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   Or manually:
   ```bash
   npm install
   npm run dev
   # Visit http://localhost:3000
   ```

### Deployment (Production)
4. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Step-by-step production guide
   - Deploy to Vercel (recommended)
   - Optional Supabase backend setup
   - Environment variable configuration
   - Troubleshooting guide
   - Security best practices

### Automated Deployment
5. **[deploy.sh](./deploy.sh)** - Automated deployment wizard
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
   Handles:
   - Dependency installation
   - Environment setup
   - Production build
   - Vercel deployment
   - Supabase configuration

## 🚀 Quick Start (3 Steps)

### Step 1: Get an API Key (2 minutes)
```
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Get API Key"
3. Copy the key
```

### Step 2: Run Locally (1 minute)
```bash
npm install
# Add your API key to .env.local
npm run dev
# Visit http://localhost:3000
```

### Step 3: Deploy to Vercel (1 minute)
```bash
npm i -g vercel
vercel
# Follow prompts to connect GitHub and deploy
```

Then add your API key to Vercel dashboard environment variables.

## 📁 File Structure

```
nyx-kryptos/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with auth
│   ├── page.tsx                 # Main app component
│   └── globals.css              # Global styles
├── components/                  # React components
│   ├── Dashboard.tsx            # Vault management
│   ├── VaultCreate.tsx          # Vault creation wizard
│   ├── Login.tsx                # Login form
│   ├── LandingPage.tsx          # Landing page
│   ├── CustomCursor.tsx         # Animated cursor
│   └── InteractiveBackground.tsx # Canvas effects
├── context/                     # React context
│   └── AuthContext.tsx          # Auth state management
├── services/                    # Business logic
│   ├── storageService.ts        # Data persistence
│   └── geminiService.ts         # AI integration
├── utils/                       # Utility functions
│   ├── crypto.ts                # Encryption & key splitting
│   └── steganography.ts         # Image steganography
├── types/                       # TypeScript types
│   └── index.ts                 # All interfaces
├── public/                      # Static assets
├── scripts/                     # Database migrations
├── .env.local                   # Environment variables (local)
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
├── next.config.ts              # Next.js config
│
├── README.md                    # Main documentation
├── COMPLETE.md                  # All fixes & changes
├── DEPLOYMENT.md                # Deployment guide
├── FIXES.md                     # Fixes summary
├── INDEX.md                     # This file
├── start.sh                     # Local setup script
└── deploy.sh                    # Deploy automation
```

## 🔧 Technology Stack

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Cryptography**: CryptoJS (AES-256-CBC + HMAC-SHA256)
- **Key Splitting**: Shamir's Secret Sharing (finite field arithmetic)
- **Steganography**: LSB image embedding
- **AI**: Google Generative AI (Gemini)
- **Database**: Browser localStorage (demo) / Supabase (production)
- **Deployment**: Vercel

## 🔐 Features

✅ **End-to-End Encryption**
- AES-256-CBC encryption
- HMAC-SHA256 integrity verification
- All crypto happens client-side

✅ **Secret Sharing**
- Shamir's Secret Sharing algorithm
- Finite field arithmetic (2^521 - 1)
- K-of-N threshold consensus

✅ **Steganography**
- LSB (Least Significant Bit) embedding
- Invisible to human eye
- Unique for each artifact

✅ **Premium UI/UX**
- Glassmorphism design
- Interactive particle background
- Custom cursor trails
- Smooth animations
- Responsive layout

✅ **Vault Management**
- Create vaults with text/files
- Invite guardians
- Set threshold
- Auto-unlock when ready
- Download/share artifacts

## 🎯 Your Deployment Path

```
Local Development
       ↓
Run: npm run dev
    └─→ Test at http://localhost:3000
       ↓
Production Build
       ↓
Run: npm run build
    └─→ Creates optimized build
       ↓
Deploy to Vercel
       ↓
vercel --prod
    └─→ Get production URL
       ↓
Configure Environment Variables
       ↓
Add API_KEY to Vercel dashboard
    └─→ Redeploy or wait for rebuild
       ↓
Optional: Add Supabase Backend
       ↓
Production URL Ready!
```

## 📝 Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run linter

# Deployment
vercel                  # Deploy to Vercel (staging)
vercel --prod           # Deploy to production

# Environment
npm i -g vercel         # Install Vercel CLI
chmod +x start.sh       # Make start script executable
chmod +x deploy.sh      # Make deploy script executable

# Utilities
./start.sh             # Run local setup wizard
./deploy.sh            # Run deployment wizard
```

## 🔑 Required API Keys

### Google Gemini API (Required)
- **Where**: https://aistudio.google.com/app/apikey
- **Purpose**: Generate AI artwork for steganography
- **Cost**: Free tier available
- **Setup**: Add to `.env.local` as `API_KEY`

### Supabase (Optional)
- **Where**: https://supabase.com
- **Purpose**: Persistent backend database
- **Cost**: Free tier available
- **Setup**: Add credentials to Vercel environment

## ✅ Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Repository cloned locally
- [ ] Google Gemini API key obtained
- [ ] `.env.local` file created with API key
- [ ] `npm install` completed successfully
- [ ] `npm run dev` runs without errors
- [ ] App loads at http://localhost:3000
- [ ] Can create test vault
- [ ] Artifacts generate successfully
- [ ] GitHub repository set up (for Vercel)
- [ ] Vercel account created
- [ ] Production build succeeds: `npm run build`

## 🚨 Troubleshooting

### App won't start
- Check Node.js version: `node --version` (need 18+)
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check .env.local exists with API_KEY

### "API_KEY is not set"
- Add to .env.local: `API_KEY=your_key_here`
- Get key from: https://aistudio.google.com/app/apikey

### Deployment fails
- Check build succeeds locally: `npm run build`
- Verify all dependencies installed: `npm install`
- Check environment variables in Vercel dashboard

### See DEPLOYMENT.md for more troubleshooting

## 📞 Support Resources

📖 **Documentation**
- README.md - Feature overview
- DEPLOYMENT.md - Production guide
- COMPLETE.md - All fixes
- FIXES.md - Summary of changes

🔗 **External Resources**
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Google Gemini: https://ai.google.dev

## 🎓 Learning Resources

**Understanding the Tech:**
1. **Encryption**: See `/utils/crypto.ts` for AES-256 implementation
2. **Secret Sharing**: See `/utils/crypto.ts` for Shamir's algorithm
3. **Steganography**: See `/utils/steganography.ts` for LSB embedding
4. **UI Components**: Check `/components/` for React examples
5. **API Integration**: See `/services/geminiService.ts`

## 🎉 Success Criteria

You'll know it's working when:
- ✅ App loads at http://localhost:3000
- ✅ Can log in with any email/username
- ✅ Can create a vault with secrets
- ✅ Artifacts generate automatically
- ✅ Can unlock vault with threshold
- ✅ Can view decrypted secrets
- ✅ File downloads work
- ✅ No console errors

## 🔐 Security Notes

- All encryption happens in browser
- Keys never sent to servers
- HMAC ensures data integrity
- Threshold consensus prevents single point failure
- Steganography hides keys in artwork
- Use HTTPS in production (Vercel auto-enables)

## 🚀 Next Steps After Deployment

1. **Test Production**
   - Visit your deployed URL
   - Create a test vault
   - Verify all features work

2. **Optional Enhancements**
   - Add Supabase backend
   - Set up error tracking (Sentry)
   - Enable analytics
   - Configure custom domain

3. **Security Hardening**
   - Review DEPLOYMENT.md security section
   - Set up monitoring
   - Enable backups
   - Rotate API keys regularly

4. **Share & Use**
   - Invite users
   - Collect feedback
   - Plan improvements
   - Scale infrastructure as needed

---

## 📞 Need Help?

1. **Check DEPLOYMENT.md** - Most questions answered there
2. **Review COMPLETE.md** - See what was fixed
3. **Check console** - Browser dev tools often show errors
4. **Read code comments** - Implementation details explained
5. **Review TypeScript types** - IntelliSense helps in editor

---

## 🎯 You're All Set!

Your Nyx Kryptos deployment is ready. Choose your path:

**👨‍💻 For Local Development:**
```bash
npm run dev
```

**🚀 For Vercel Deployment:**
```bash
vercel --prod
```

**🤖 For Automated Setup:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

*"Divide your secrets into digital artifacts. Distribute them to the ones you trust."*

**Happy Deploying! 🔐**
