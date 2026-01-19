# FlowState.OS v1.1.0 Release Notes

**Release Date:** January 19, 2026

## 🎉 What's New

### PWA Support - Install as App
Your app is now a full PWA (Progressive Web App)! Users can now:
- **Install on Chrome mobile**: Add to home screen → Opens as standalone app
- **Install on Samsung Internet**: Full app experience without browser UI
- **Offline Ready**: Service worker registered and ready for offline support

### Authentication Flow Overhaul
The most critical fix in this release:
- ✅ App now loads **login page first** on fresh start
- ✅ Previous sessions are properly **detected and persisted**
- ✅ No more dashboard loading before auth check
- ✅ Seamless redirect to dashboard for logged-in users

## 🐛 Bug Fixes

| Issue | Status |
|-------|--------|
| Chrome not recognizing as installable app | ✅ Fixed |
| Dashboard loading before login check | ✅ Fixed |
| Session not persisting across browser close | ✅ Fixed |
| Mobile web app meta tags missing | ✅ Fixed |
| Service worker not registered | ✅ Fixed |

## 📋 Technical Changes

### Authentication (`src/app/page.tsx`)
- Added `onAuthStateChange()` listener for proper session persistence
- Service worker registration on app load
- Proper error handling for auth checks

### PWA Configuration
- Updated manifest with proper start URL: `/`
- Added 192x192 and 512x512 SVG icons
- Enhanced metadata with proper PWA declarations
- Fixed mobile-web-app-capable meta tags

### Layout & Shell
- Removed redundant auth checks from MobileShell
- Cleaned up root layout metadata
- Proper meta tag injection via Next.js API

## 🚀 Installation & Testing

### For Desktop (Vercel)
1. Visit your Vercel deployment link
2. Chrome should now show "Add FlowState to Home screen" option
3. Open the installed app - it launches fullscreen without browser UI

### For Mobile
1. Open Vercel link in Chrome/Samsung Internet
2. Tap menu → "Add to home screen"
3. Open from home screen - launches as native-like app
4. Session persists when you close and reopen the app

## 📦 Files Modified

```
src/app/page.tsx                 - Auth flow & SW registration
src/app/layout.tsx               - PWA metadata & icons
src/components/layout/MobileShell.tsx - Removed auth checks
public/manifest.json             - Updated start_url & icons
public/sw.js                     - Proper service worker
public/icon-192.svg              - New app icon (192x192)
public/icon-512.svg              - New app icon (512x512)
```

## ✨ Known Limitations

- Service worker currently doesn't cache requests (ready for future offline support)
- Requires HTTPS in production (localhost exempt for testing)

## 🔄 Upgrade Instructions

For existing users:
1. Clear browser cache/site data
2. Hard refresh (Ctrl+Shift+R)
3. Your existing session will be detected and restored
4. Login again if needed

## 🎯 Next Steps

- [ ] Implement offline support in service worker
- [ ] Add PWA update notifications
- [ ] Create app store listings
- [ ] Monitor installation analytics

---

**Download:** [FlowState.OS v1.1.0](https://github.com/yourrepo/releases/tag/v1.1.0)

