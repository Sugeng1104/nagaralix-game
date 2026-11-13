/* NARAGALIX — shared authentication utilities for register, login and character pages */
(function () {
  'use strict';
  const SESSION_KEY = 'naragalix_session_v1';
  const API_TIMEOUT_MS = 30000;

  function storageGet(storage) {
    try { return storage.getItem(SESSION_KEY) || ''; } catch (_) { return ''; }
  }
  function storageRemove(storage) {
    try { storage.removeItem(SESSION_KEY); } catch (_) { /* storage unavailable */ }
  }

  window.NGL = {
    api: async function (action, data = {}) {
      const url = String(window.NARAGALIX_API_URL || '').trim();
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(url)) {
        throw new Error('URL Web App belum diatur. Periksa config.js.');
      }
      if (!action || typeof action !== 'string') throw new Error('Aksi API tidak valid.');

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      try {
        // text/plain prevents unnecessary CORS preflight with Apps Script.
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ ...data, action }),
          redirect: 'follow',
          signal: controller.signal,
          cache: 'no-store'
        });
        if (!response.ok) throw new Error('Server tidak merespons (HTTP ' + response.status + ').');
        const raw = await response.text();
        let result;
        try { result = JSON.parse(raw); }
        catch (_) { throw new Error('Respons server bukan JSON. Periksa izin dan deployment Web App.'); }
        if (!result || result.ok !== true) throw new Error(result?.error || 'Permintaan ditolak oleh server.');
        return result;
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('Koneksi terlalu lama. Periksa internet lalu coba lagi.');
        if (error instanceof TypeError) throw new Error('Tidak dapat menghubungi Web App. Periksa URL deployment dan akses Anyone.');
        throw error;
      } finally {
        clearTimeout(timer);
      }
    },
    getToken: function () {
      return storageGet(sessionStorage) || storageGet(localStorage);
    },
    save: function (token, remember) {
      if (typeof token !== 'string' || !token) throw new Error('Token login tidak valid.');
      storageRemove(sessionStorage);
      storageRemove(localStorage);
      try { (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, token); }
      catch (_) { throw new Error('Penyimpanan sesi browser tidak tersedia.'); }
    },
    clear: function () {
      storageRemove(sessionStorage);
      storageRemove(localStorage);
    },
    escape: function (value) {
      return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[char]);
    }
  };
})();
