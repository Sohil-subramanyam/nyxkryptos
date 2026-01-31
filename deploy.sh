#!/bin/bash

# Nyx Kryptos Deployment to Vercel with Supabase
# Complete automated setup script

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔐 NYX KRYPTOS - VERCEL + SUPABASE DEPLOYMENT WIZARD 🔐  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step counter
STEP=1

step() {
    echo ""
    echo -e "${BLUE}[STEP $STEP]${NC} $1"
    ((STEP++))
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Check Prerequisites
step "Checking Prerequisites"

if ! command -v node &> /dev/null; then
    error "Node.js not installed. Visit https://nodejs.org"
    exit 1
fi
success "Node.js $(node --version) installed"

if ! command -v npm &> /dev/null; then
    error "npm not found"
    exit 1
fi
success "npm $(npm --version) installed"

if ! command -v git &> /dev/null; then
    warning "Git not found - deployment will be manual"
else
    success "Git installed"
fi

# 2. Install Dependencies
step "Installing Dependencies"
npm install
success "Dependencies installed"

# 3. Environment Setup
step "Environment Configuration"

if [ ! -f ".env.local" ]; then
    echo "NEXT_PUBLIC_APP_NAME=Nyx Kryptos" > .env.local
    echo "API_KEY=" >> .env.local
    success "Created .env.local"
else
    success ".env.local already exists"
fi

read -p "Enter your Google Gemini API key: " GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    warning "No API key provided. Get one at https://aistudio.google.com/app/apikey"
else
    sed -i.bak "s/API_KEY=/API_KEY=$GEMINI_API_KEY/" .env.local
    success "API key configured"
fi

# 4. Build Check
step "Building for Production"
npm run build
success "Build completed successfully"

# 5. Vercel Setup
step "Vercel Deployment"

if command -v vercel &> /dev/null; then
    success "Vercel CLI found"
    read -p "Deploy to Vercel now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel --prod
        success "Deployed to Vercel!"
    fi
else
    warning "Vercel CLI not installed"
    echo "Install with: npm i -g vercel"
    echo "Then run: vercel --prod"
fi

# 6. Supabase Setup
step "Supabase Configuration (Optional)"
read -p "Setup Supabase backend? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    warning "Visit https://supabase.com to create project"
    
    read -p "Enter Supabase Project URL: " SUPABASE_URL
    read -p "Enter Supabase Service Role Key: " SUPABASE_KEY
    
    if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
        echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> .env.local
        echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_KEY" >> .env.local
        success "Supabase credentials saved"
    fi
fi

# 7. Final Steps
step "Deployment Complete!"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    NEXT STEPS                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "1️⃣  Test Locally:"
echo "   npm run dev"
echo "   Open http://localhost:3000"
echo ""
echo "2️⃣  Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "3️⃣  Add Environment Variables (Vercel Dashboard):"
echo "   - API_KEY: Your Gemini API key"
echo "   - NEXT_PUBLIC_APP_NAME: Nyx Kryptos"
echo ""
echo "4️⃣  Optional Supabase Setup:"
echo "   - Create project at supabase.com"
echo "   - Add credentials to Vercel"
echo "   - Run migrations"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo "📚 For all changes, see COMPLETE.md"
echo ""
success "Setup complete! 🎉"
