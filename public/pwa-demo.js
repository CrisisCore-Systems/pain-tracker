/**
 * PWA Demo Script - Demonstrates PWA functionality
 * Run this to test PWA features in the browser console
 */

// SECURITY DISCLAIMER: This script is for demonstration/testing only.
// It may use direct localStorage and unencrypted operations for clarity.
// Do NOT store sensitive data here; production code paths use secureStorage.

// Test PWA functionality
window.testPWA = async function() {
  console.log('🔧 PWA Test Suite Starting...');
  
  try {
    // Test 1: Service Worker Registration
    console.log('\n📝 Test 1: Service Worker Registration');
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log('✅ Service Worker is registered:', registration.scope);
      } else {
        console.log('❌ Service Worker not registered');
      }
    } else {
      console.log('❌ Service Worker not supported');
    }

    // Test 2: PWA Manager
    console.log('\n📱 Test 2: PWA Manager');
    if (window.pwaManager) {
      console.log('✅ PWA Manager available');
      try {
        const isInstalled = await window.pwaManager.isAppInstalled();
        console.log('📱 App installed:', isInstalled);
      } catch (error) {
        console.log('⚠️ Could not check install status:', error.message);
      }
    } else {
      console.log('❌ PWA Manager not available');
    }

    // Test 3: Offline Storage
    console.log('\n💾 Test 3: Offline Storage');
    if (window.offlineStorage) {
      console.log('✅ Offline Storage available');
      try {
        // Test storing data
        const testData = { id: Date.now(), message: 'PWA Test Data' };
        await window.offlineStorage.storeData('test-entry', testData);
        console.log('✅ Test data stored successfully');
        
        // Test retrieving data
        const retrieved = await window.offlineStorage.getData('test-entry', testData.id);
        if (retrieved) {
          console.log('✅ Test data retrieved successfully:', retrieved);
        } else {
          console.log('⚠️ Test data not found');
        }
      } catch (error) {
        console.log('❌ Offline storage test failed:', error.message);
      }
    } else {
      console.log('❌ Offline Storage not available');
    }

    // Test 4: Background Sync
    console.log('\n🔄 Test 4: Background Sync');
    if (window.backgroundSync) {
      console.log('✅ Background Sync available');
      try {
        const pendingCount = await window.backgroundSync.getPendingItemsCount();
        console.log('📊 Pending sync items:', pendingCount);
      } catch (error) {
        console.log('⚠️ Could not get pending count:', error.message);
      }
    } else {
      console.log('❌ Background Sync not available');
    }

    // Test 5: Network Status
    console.log('\n🌐 Test 5: Network Status');
    console.log('📶 Online status:', navigator.onLine);
    console.log('🌍 Connection type:', navigator.connection?.effectiveType || 'unknown');

    // Test 6: Storage Quota
    console.log('\n💿 Test 6: Storage Quota');
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = Math.round((estimate.usage || 0) / 1024 / 1024 * 100) / 100;
        const quota = Math.round((estimate.quota || 0) / 1024 / 1024 * 100) / 100;
        console.log(`💾 Storage used: ${used} MB of ${quota} MB`);
      } catch (error) {
        console.log('⚠️ Could not get storage estimate:', error.message);
      }
    } else {
      console.log('❌ Storage API not available');
    }

    // Test 7: Add test pain entry
    console.log('\n🩺 Test 7: Pain Entry Offline');
    if (window.addPainEntryOffline) {
      try {
        const testEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          painLevel: 5,
          location: 'Test Location',
          description: 'PWA Test Entry',
          symptoms: ['Test Symptom']
        };
        
        const result = await window.addPainEntryOffline(testEntry);
        if (result) {
          console.log('✅ Test pain entry saved offline successfully');
        } else {
          console.log('❌ Failed to save test pain entry');
        }
      } catch (error) {
        console.log('❌ Pain entry test failed:', error.message);
      }
    } else {
      console.log('❌ Offline pain entry function not available');
    }

    console.log('\n🎉 PWA Test Suite Complete!');
    console.log('\n📋 Summary:');
    console.log('- Use window.testPWA() to run this test again');
    console.log('- Use window.forcePWASync() to force sync when online');
    console.log('- Check Application tab in DevTools for PWA details');
    console.log('- Go offline/online to test offline functionality');

  } catch (error) {
    console.error('❌ PWA Test Suite failed:', error);
  }
};

// Add test data function
window.addTestPainData = async function() {
  console.log('🩺 Adding test pain data...');
  
  const testEntries = [
    {
      id: Date.now() + 1,
      date: new Date().toISOString(),
      painLevel: 7,
      location: 'Lower Back',
      description: 'Sharp pain after sitting for long periods',
      symptoms: ['Sharp Pain', 'Muscle Tension', 'Limited Mobility']
    },
    {
      id: Date.now() + 2,
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      painLevel: 4,
      location: 'Right Knee',
      description: 'Dull ache, worse in the morning',
      symptoms: ['Dull Ache', 'Stiffness', 'Swelling']
    },
    {
      id: Date.now() + 3,
      date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
      painLevel: 6,
      location: 'Neck',
      description: 'Tension headache radiating from neck',
      symptoms: ['Tension', 'Headache', 'Neck Stiffness']
    }
  ];

  let successCount = 0;
  for (const entry of testEntries) {
    try {
      if (window.addPainEntryOffline) {
        const result = await window.addPainEntryOffline(entry);
        if (result) successCount++;
      }
    } catch (error) {
      console.error('Failed to add test entry:', error);
    }
  }

  console.log(`✅ Added ${successCount}/${testEntries.length} test entries`);
  
  if (successCount > 0 && !navigator.onLine) {
    console.log('📡 Entries queued for sync when online');
  }
};

// PWA status checker
window.checkPWAStatus = function() {
  console.log('📊 PWA Status Check:');
  console.log('🌐 Online:', navigator.onLine);
  console.log('📱 PWA Manager:', !!window.pwaManager);
  console.log('💾 Offline Storage:', !!window.offlineStorage);
  console.log('🔄 Background Sync:', !!window.backgroundSync);
  console.log('🩺 Pain Entry Function:', !!window.addPainEntryOffline);
  console.log('🔧 Force Sync Function:', !!window.forcePWASync);
  
  // Check localStorage status
  const pendingSync = localStorage.getItem('pwa-pending-sync') || '0';
  const isSyncing = localStorage.getItem('pwa-is-syncing') === 'true';
  const isInstalled = localStorage.getItem('pwa-is-installed') === 'true';
  const canInstall = localStorage.getItem('pwa-can-install') === 'true';
  
  console.log('📊 Sync Status:');
  console.log('  - Pending items:', pendingSync);
  console.log('  - Currently syncing:', isSyncing);
  console.log('  - App installed:', isInstalled);
  console.log('  - Can install:', canInstall);
};

// Auto-run when loaded
console.log('🎯 PWA Demo Script Loaded!');
console.log('Available commands:');
console.log('- window.testPWA() - Run PWA test suite');
console.log('- window.addTestPainData() - Add sample pain data');
console.log('- window.checkPWAStatus() - Check current PWA status');
console.log('- window.forcePWASync() - Force sync when online');

// Auto-check status after initialization
setTimeout(() => {
  window.checkPWAStatus();
  
  // Suggest running the test
  console.log('\n💡 Tip: Run window.testPWA() to test all PWA features!');
}, 2000);
