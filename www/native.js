/* Daylist DEMO native bridge: haptics, reminders, share, data backup mirror, rating prompt.
   Runs inside the Capacitor app. In a normal browser every call safely falls back.
   This demo build has NO subscriptions and NO billing code: everything in the app is
   unlocked for free, so there is nothing here for Google Play Billing to review. */
(function () {
  // ====== EDIT THESE BEFORE RELEASE ======
  var CFG = {
    packageId: 'com.yourcompany.daylist.demo', // must match capacitor.config.json appId
    shareUrl: 'https://example.com/daylist'    // link people get when they tap Share
  };
  // =======================================
  // Android-only build: this bridge talks to the Android notification and review
  // stack through Capacitor. There is no iOS code path here, and no payment code.

  var C = window.Capacitor;
  var native = !!(C && C.isNativePlatform && C.isNativePlatform());
  var P = (C && C.Plugins) || {};
  var platform = native && C.getPlatform ? C.getPlatform() : 'web';

  var N = {
    native: native, platform: platform, cfg: CFG, configured: false,

    haptic: function (p) {
      if (!native || !P.Haptics) return false;
      try {
        if (Array.isArray(p)) P.Haptics.notification({ type: 'SUCCESS' });
        else if (p <= 15) P.Haptics.impact({ style: 'LIGHT' });
        else P.Haptics.impact({ style: 'MEDIUM' });
      } catch (e) {}
      return true;
    },

    share: function (u) {
      if (!native || !P.Share) return false;
      P.Share.share({ title: u.title, text: u.text, url: CFG.shareUrl, dialogTitle: 'Share Daylist' }).catch(function () {});
      return true;
    },

    // Native text-to-speech (the Android WebView has no working web speech engine).
    speak: function (t) {
      if (!native || !P.TextToSpeech) return false;
      try {
        P.TextToSpeech.speak({ text: t, lang: 'en-US', rate: 0.9, pitch: 1.0, volume: 1.0, category: 'ambient', queueStrategy: 0 }).catch(function () {});
      } catch (e) {}
      return true;
    },
    stopSpeak: function () {
      if (!native || !P.TextToSpeech) return false;
      try { P.TextToSpeech.stop().catch(function () {}); } catch (e) {}
      return true;
    },

    // Mirror saved data to native storage so the OS cannot silently wipe it with the web cache.
    mirror: function (json) {
      if (native && P.Preferences) { try { P.Preferences.set({ key: 'daylist', value: json }); } catch (e) {} }
    },
    restoreData: function () {
      if (!native || !P.Preferences) return Promise.resolve(false);
      var have = null;
      try { have = localStorage.getItem('daylist'); } catch (e) {}
      if (have) return Promise.resolve(false);
      return P.Preferences.get({ key: 'daylist' }).then(function (r) {
        if (r && r.value) { try { localStorage.setItem('daylist', r.value); } catch (e) {} return true; }
        return false;
      }).catch(function () { return false; });
    },

    // Daily reminder at hour:minute. Resolves true if scheduled.
    remind: function (h, m) {
      if (!native || !P.LocalNotifications) return Promise.resolve(false);
      var L = P.LocalNotifications;
      return L.requestPermissions().then(function (r) {
        if (r.display !== 'granted') return false;
        return L.cancel({ notifications: [{ id: 1 }] }).catch(function () {}).then(function () {
          return L.schedule({ notifications: [{
            id: 1, title: 'Daylist', body: 'Time to check in on your habits.',
            schedule: { on: { hour: h, minute: m }, repeats: true, allowWhileIdle: true }
          }] });
        }).then(function () { return true; });
      }).catch(function () { return false; });
    },
    cancelRemind: function () {
      if (native && P.LocalNotifications) { P.LocalNotifications.cancel({ notifications: [{ id: 1 }] }).catch(function () {}); }
    },

    // One-off (non-repeating) reminder fired at a specific moment, e.g. "your streak is at risk tonight".
    // Re-scheduling with the same id replaces whatever was scheduled before.
    remindAt: function (whenMs, id, title, body) {
      if (!native || !P.LocalNotifications) return Promise.resolve(false);
      var L = P.LocalNotifications;
      return L.requestPermissions().then(function (r) {
        if (r.display !== 'granted') return false;
        return L.cancel({ notifications: [{ id: id }] }).catch(function () {}).then(function () {
          return L.schedule({ notifications: [{ id: id, title: title, body: body, schedule: { at: new Date(whenMs) } }] });
        }).then(function () { return true; });
      }).catch(function () { return false; });
    },
    cancelId: function (id) {
      if (native && P.LocalNotifications) { P.LocalNotifications.cancel({ notifications: [{ id: id }] }).catch(function () {}); }
    },

    // Google Play's native "rate this app" prompt (no store page, no review form of our own —
    // this is required: Play policy forbids asking for a specific star rating or only
    // showing the prompt to happy users, so the in-app copy stays neutral and this call
    // goes through Google's own throttled, policy-safe flow). Returns true if a request
    // was made (Google decides whether to actually show anything), false if unavailable.
    requestReview: function () {
      if (!native || !P.InAppReview) return false;
      try { P.InAppReview.requestReview(); } catch (e) { return false; }
      return true;
    },
    // Fallback for when the in-app review plugin isn't present: opens the Play Store
    // listing directly so the person can rate there instead.
    openStoreListing: function () {
      if (!native || !P.App) return false;
      try {
        P.App.openUrl({ url: 'market://details?id=' + CFG.packageId }).catch(function () {
          P.App.openUrl({ url: 'https://play.google.com/store/apps/details?id=' + CFG.packageId }).catch(function () {});
        });
      } catch (e) { return false; }
      return true;
    }
  };
  window.Native = N;
})();
