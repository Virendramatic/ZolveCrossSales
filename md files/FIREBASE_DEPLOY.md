# Firebase Hosting Deployment

## Prerequisites
- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Google account with Firebase project set up

## Setup Instructions

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Deployment

Deploy to Firebase Hosting:
```bash
firebase deploy
```

Your app will be available at: `https://fx-quote-calculator.web.app`

## Local Testing

To test locally before deploying:
```bash
npm run serve
```

Then visit: `http://localhost:5000`

## Project Details

- **Project ID**: fx-quote-calculator
- **Hosting URL**: https://fx-quote-calculator.web.app
- **Firebase Config**: Already configured in the HTML file

## Files

- `firebase.json` - Firebase hosting configuration
- `.firebaserc` - Firebase project configuration
- `package.json` - Node dependencies
- `Quote backcalculation.html` - Main application file
- `zolve_logo.svg` - Logo asset

## Notes

- The HTML file is self-contained with all CSS and JavaScript
- Static hosting only - no backend required
- Firebase Analytics is enabled in the configuration
