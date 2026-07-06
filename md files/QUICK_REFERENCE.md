# Quick Reference - Zolve Quote System

## 🚀 Deploy in 5 Minutes

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Deploy
firebase deploy
```

**Live URL:** https://fx-quote-calculator.firebaseapp.com

---

## 📍 Key Pages

| Page | URL | Access |
|------|-----|--------|
| Login | `/` | Public |
| Calculator | `/calculator` | Logged in users |
| Admin Portal | `/admin` | Admin only |

---

## 👥 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| user@test.com | testpass123 | User |
| admin@test.com | testpass123 | Admin |

*(Create your own accounts or use Google OAuth)*

---

## 🔐 Admin Actions

- **View all quotes:** All Quotes tab
- **Filter quotes:** By email, name, date range
- **Download PDF:** PDF button on any quote
- **Delete quote:** Delete button with confirmation
- **Add admin:** Email Management tab
- **Remove admin:** Remove button on admin
- **Delete user:** User Management tab
- **View stats:** Dashboard cards

---

## 📊 User Actions

- **Generate quote:** Fill form, click "Generate Quote"
- **Auto-save:** Happens automatically
- **View quotes:** All Quotes tab
- **Edit quote:** Load quote, modify, regenerate
- **Delete quote:** Delete button with confirmation
- **Download PDF:** PDF button on quote
- **Logout:** Logout button in header

---

## 🛠 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Clear cache, check credentials |
| Admin not working | Verify role in Firestore |
| PDF not downloading | Check firestore quote data |
| Page not loading | Check firebase.json rewrites |
| Slow performance | Create Firestore indexes |

---

## 📁 Important Files

```
Core:
- index.html (login)
- calculator.html (user app)
- admin.html (admin portal)

Logic:
- js/auth.js (authentication)
- js/firestore.js (database)
- js/admin.js (admin features)

Styles:
- css/admin-styles.css
- css/responsive.css

Config:
- firebase.json (hosting)
- firestore.rules (security)
```

---

## 💻 Commands

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only rules
firebase deploy --only firestore:rules

# Check project
firebase use

# View hosting channels
firebase hosting:channel:list

# Rollback deployment
firebase hosting:rollback
```

---

## 🔍 Firebase Console

**Project ID:** fx-quote-calculator

Quick links:
- [Firebase Console](https://console.firebase.google.com/project/fx-quote-calculator/overview)
- [Firestore Database](https://console.firebase.google.com/project/fx-quote-calculator/firestore)
- [Authentication](https://console.firebase.google.com/project/fx-quote-calculator/authentication)
- [Hosting](https://console.firebase.google.com/project/fx-quote-calculator/hosting)

---

## 📞 Support URLs

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## ✨ Features Summary

✅ Email/Password authentication
✅ Google OAuth login
✅ Quote generation with auto-save
✅ Quote management (view, edit, delete)
✅ PDF download
✅ Admin portal with dashboard
✅ User management
✅ Admin management
✅ Advanced filtering
✅ Responsive design (mobile-friendly)
✅ Real-time Firestore sync
✅ Secure with role-based access

---

## 📈 Performance Targets

- Page load: < 2s
- Quote save: < 1s
- PDF generation: < 3s
- Admin dashboard: < 2s
- Firestore queries: < 500ms

---

## 🔒 Security Checklist

- ✅ HTTPS enabled
- ✅ Firestore rules deployed
- ✅ User isolation enforced
- ✅ Admin role verification
- ✅ Confirmation dialogs for delete
- ✅ No API keys in client code
- ✅ CORS configured
- ✅ XSS prevention in place

---

## 🎨 Design System Quick Reference

```css
Colors:
--primary: #2563eb (Blue)
--success: #10b981 (Green)
--warning: #f59e0b (Amber)
--danger: #dc2626 (Red)

Spacing:
1rem = 16px base
Use multiples: 0.5rem, 1rem, 1.5rem, 2rem, 3rem

Border Radius:
6px (sm), 8px (md), 12px (lg), 16px (xl)

Typography:
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI'
Weights: 400 (normal), 600 (semibold), 700 (bold), 800 (black)
```

---

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Desktop | 1400px+ | Full |
| Tablet | 768px | 2 cols → 1 col |
| Mobile | 480px | Single column |
| Small Mobile | 320px | Minimal UI |

---

## 📋 Checklists

### Pre-Deployment
- [ ] All features working
- [ ] Tests passed
- [ ] Security rules deployed
- [ ] No sensitive data exposed
- [ ] Responsive design tested
- [ ] Performance acceptable

### Post-Deployment
- [ ] All pages loading
- [ ] Auth working
- [ ] Quotes saving
- [ ] Admin portal accessible
- [ ] PDF downloading
- [ ] No console errors

### Monitoring
- [ ] Firestore usage
- [ ] Error logs
- [ ] Performance metrics
- [ ] User feedback

---

## 🎯 Common Tasks

**Create an admin user:**
1. User signs up normally
2. In Firestore, find user document
3. Change role from "user" to "admin"
4. User sees admin portal on next login

**Reset a user's quotes:**
1. In Firestore, filter quotes by userId
2. Select and delete matching quote docs
3. Dashboard stats auto-update

**View quote details:**
1. Admin → All Quotes tab
2. Filter if needed
3. Click "View" button
4. See all quote details in modal

**Backup Firestore:**
1. Firebase Console → Firestore
2. Click menu (⋮) → Export Collections
3. Save to Google Cloud Storage

---

## 📞 Getting Help

1. Check TESTING_CHECKLIST.md for test cases
2. Check DEPLOYMENT_GUIDE.md for deployment help
3. Check browser Console (F12) for errors
4. Check Firebase Console logs
5. Review Firestore security rules
6. Check firebase.json configuration

---

## 🚀 Next Steps

1. ✅ Deploy to production
2. ✅ Create admin account
3. ✅ Test all features
4. ✅ Share with users
5. ✅ Monitor performance
6. ⭐ Plan feature updates

---

## Version History

- **v1.0.0** - Initial release (June 2026)
  - All features complete
  - 6 phases delivered
  - Production ready

---

**Last Updated:** June 2026
**Status:** ✅ Production Ready
**Project:** Zolve Remittance Quote System
