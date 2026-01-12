# 🚀 Quick Start - Testing New Features

**Dev Server**: http://localhost:3001/pain-tracker/  
**Date**: October 3, 2025  
**Status**: ✅ Implementation Complete | ⏳ Testing Pending

---

## ⚡ 5-Minute Quick Test

### 1. Test PDF Export (2 minutes)
1. Open http://localhost:3001/pain-tracker/
2. Click **Analytics** tab
3. Click **Export Clinical PDF** button (compact, in toolbar)
4. Fill the patient information form:
   - Patient Name: `Test User`
   - Date of Birth: `1985-01-01`
   - PHN: `1234567890`
   - Click **Generate Report**
5. ✅ **Success if**: PDF downloads automatically

### 2. Test Keyboard Navigation (2 minutes)
1. Refresh page
2. Press **Tab** key
3. ✅ **Success if**: "Skip to main content" link appears
4. Keep pressing **Tab**
5. ✅ **Success if**: Focus moves through all navigation items

### 3. Test Screen Reader (1 minute)
1. Enable Windows Narrator: **Win+Ctrl+Enter**
2. Press **Tab** through navigation
3. ✅ **Success if**: Narrator announces button labels

---

## 📋 What Was Built

### 1. Clinical PDF Exporter
- **New Components**: 
  - Patient info form modal
  - Chart capture utilities
  - Export button integration
- **Location**: Analytics tab → "Export Clinical PDF" button
- **Features**: WorkSafe BC compliant reports with patient demographics

### 2. Accessibility Infrastructure
- **New Utilities**:
  - Screen reader announcements
  - Focus management system
  - Keyboard navigation helpers
  - ARIA validation tools
- **Global Features**:
  - Skip links for keyboard users
  - Auto-labeling missing ARIA attributes
  - Keyboard shortcuts (Ctrl+/)
  - Route change announcements

### 3. Analytics Integration
- **Updated**: TraumaInformedPainTrackerLayout
- **Added**: AnalyticsDashboard with 6 sub-components
- **Export**: Integrated PDF export into analytics view

---

## 🎯 Key Testing Priorities

### High Priority (Do First)
- [ ] **PDF Export Workflow**: Can you generate a PDF?
- [ ] **Keyboard Navigation**: Can you navigate without mouse?
- [ ] **Form Validation**: Does validation work with gentle messages?

### Medium Priority
- [ ] **Screen Reader**: Does Narrator/NVDA announce properly?
- [ ] **Focus Management**: Does focus trap in modals?
- [ ] **Chart Capture**: Are charts included in PDF?

### Low Priority (Nice to Have)
- [ ] **Performance**: How fast is PDF generation?
- [ ] **Browser Compatibility**: Test in Firefox
- [ ] **Mobile**: Test on mobile device

---

## 🐛 If Something Breaks

### PDF Export Not Working
1. Open DevTools Console (F12)
2. Look for errors
3. Check if jsPDF loaded: `console.log(typeof jsPDF)`
4. Verify patient info form appears when clicking button

### Accessibility Features Not Working
1. Check console for errors
2. Verify skip link appears on first Tab press
3. Try keyboard navigation with Tab/Shift+Tab
4. Check if `useGlobalAccessibility` hook is called in App.tsx

### Charts Not Appearing in PDF
1. Make sure you have pain entries (add some test data)
2. Navigate to Analytics view first
3. Wait for charts to render (2-3 seconds)
4. Then click export button

---

## 📊 Current Test Status

### Automated Tests
- **Total**: 356 tests
- **Passing**: 347 (97.5%)
- **Failing**: 4 (unrelated to new features)
- **Command**: `npm run test`

### Manual Tests
- **PDF Export**: ⏳ Not tested yet
- **Accessibility**: ⏳ Not tested yet
- **Integration**: ⏳ Not tested yet

---

## 📚 Full Documentation

For comprehensive testing procedures, see:
- **Full Testing Guide**: `docs/engineering/MANUAL_TESTING_GUIDE.md` (26 detailed test cases)
- **Feature Summary**: `docs/planning/FEATURE_COMPLETION_SUMMARY.md` (technical details)

---

## 🎓 Quick Keyboard Shortcuts

- **Tab**: Move focus forward
- **Shift+Tab**: Move focus backward
- **Enter/Space**: Activate button/link
- **Escape**: Close modal
- **Ctrl+/**: Show keyboard shortcuts help (new!)

---

## ✅ Success Criteria

You'll know it's working if:
1. ✅ PDF downloads when you click export
2. ✅ Skip link appears when you press Tab
3. ✅ All navigation reachable by keyboard
4. ✅ Form validation shows gentle error messages
5. ✅ Charts appear in exported PDF

---

## 🆘 Need Help?

1. **Check Console**: Open DevTools (F12) and look for errors
2. **Review Docs**: See full testing guide for detailed steps
3. **Check Server**: Ensure dev server running on port 3001
4. **Restart**: Try `Ctrl+C` then `npm run dev` if issues persist

---

**Ready to test?** Open http://localhost:3001/pain-tracker/ and start with the 5-minute quick test above! 🚀
