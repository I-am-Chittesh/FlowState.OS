# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-19

### Added
- PWA (Progressive Web App) support - app now installable on both Chrome and Samsung Internet
- Service worker registration for offline support
- Enhanced manifest configuration with proper icons and metadata
- Proper auth state persistence across browser sessions

### Fixed
- **Critical Auth Flow Fix**: App now properly loads login page first before checking for existing sessions
- **Chrome PWA Installation**: Chrome now recognizes app as installable and opens as standalone app
- **Session Persistence**: User sessions now properly persist when browser is closed/reopened
- **Dashboard Loading Issue**: Removed double auth checks that were causing dashboard to load before login verification
- Fixed mobile-web-app-capable meta tags for proper PWA behavior
- Fixed manifest start_url to properly handle auth routing

### Changed
- Improved authentication flow with proper `onAuthStateChange()` listener
- Updated service worker to properly handle PWA requirements
- Refactored MobileShell to remove redundant auth checks
- Removed hardcoded metadataBase URL for better Vercel deployment

### Technical Details
- Service worker now registers on app load
- Auth state changes properly trigger redirects
- PWA manifest includes proper icons (192x192 and 512x512 SVG)
- Metadata properly injected through Next.js metadata API
- Support for both light and dark theme installation on mobile

---

## [1.0.0] - 2026-01-18

### Added
- New timer functionality with Pomodoro support
- Dashboard with task overview
- Settings page for user preferences

### Fixed
- Fixed timer countdown accuracy issue
- Fixed mobile responsiveness on small screens
- Fixed deadline calculation bugs
- Fixed the auth flow
- Fixed the naming issue in the dashboard

### Changed
- Improved UI/UX for task creation
- Updated navigation bar styling
- Optimized performance for dashboard loading

### Removed
- Deprecated legacy timer component