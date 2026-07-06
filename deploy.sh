#!/bin/bash

# Zolve CRM - Deployment Script to Firebase Staging
# This script deploys both frontend and backend to Firebase

set -e

echo "🚀 Starting deployment to zolve-cross-sales-staging..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Please install it:${NC}"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Building Backend...${NC}"
cd backend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend built successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${YELLOW}📦 Step 2: Building Frontend...${NC}"
cd Frontend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${YELLOW}🔑 Step 3: Authenticating with Firebase...${NC}"
# Assuming you're already logged in. If not, uncomment:
# firebase login

echo ""
echo -e "${YELLOW}📤 Step 4: Deploying to Firebase...${NC}"
firebase deploy --project zolve-cross-sales-staging

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo ""
    echo "🌐 Your app is now live at:"
    echo "https://zolve-cross-sales-staging.web.app"
    echo ""
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
