/**
 * ============================================================
 * QEDEV PUBLIC APP
 * Dieng Stay PMS
 * ============================================================
 *
 * Layer  : Public
 * Module : Application Bootstrap
 *
 * Responsibility:
 * - Bootstrap halaman public
 * - Menentukan module berdasarkan halaman
 * - Menjalankan module public
 * - Tidak mengandung API request
 * - Tidak mengandung dummy data
 * - Tidak mengandung business logic
 *
 * Dependency:
 * - CONFIG
 * - API
 * - Public modules
 * ============================================================
 */

const PublicApp = (() => {
  /* ========================================================
       STATE
    ======================================================== */

  let initialized = false;

  /* ========================================================
       GET PAGE
    ======================================================== */

  function getPage() {
    const path = window.location.pathname.toLowerCase();

    if (path.endsWith("/penginapan.html")) {
      return "penginapan";
    }

    if (path.endsWith("/") || path.endsWith("/index.html")) {
      return "home";
    }

    if (path.endsWith("/explore.html")) {
      return "explore";
    }

    if (path.endsWith("/booking.html")) {
      return "booking";
    }

    return null;
  }

  /* ========================================================
       INIT PAGE
    ======================================================== */

  async function initPage() {
    const page = getPage();

    if (!page) {
      console.warn(
        "[PublicApp] Halaman public tidak dikenali:",
        window.location.pathname,
      );

      return;
    }

    try {
      switch (page) {
        /* ============================================
                   HOME
                   ============================================ */

        case "home":
          if (
            typeof HomePublic !== "undefined" &&
            typeof HomePublic.init === "function"
          ) {
            await HomePublic.init();
          }

          break;

        /* ============================================
                   PENGINAPAN
                   ============================================ */

        case "penginapan":
          if (
            typeof PenginapanPublic !== "undefined" &&
            typeof PenginapanPublic.init === "function"
          ) {
            await PenginapanPublic.init();
          }

          break;

        /* ============================================
                   EXPLORE
                   ============================================ */

        case "explore":
          if (
            typeof ExplorePublic !== "undefined" &&
            typeof ExplorePublic.init === "function"
          ) {
            await ExplorePublic.init();
          }

          break;

        /* ============================================
                   BOOKING
                   ============================================ */

        case "booking":
          if (
            typeof BookingPublic !== "undefined" &&
            typeof BookingPublic.init === "function"
          ) {
            await BookingPublic.init();
          }

          break;

        default:
          console.warn("[PublicApp] Tidak ada module untuk:", page);
      }
    } catch (error) {
      console.error(`[PublicApp] Gagal menjalankan halaman "${page}":`, error);

      handleError(error);
    }
  }

  /* ========================================================
       ERROR HANDLER
       ======================================================== */

  function handleError(error) {
    const message = error?.message || "Terjadi kesalahan saat memuat halaman.";

    console.error("[PublicApp]", message);

    /*
     * Jangan paksa render error ke seluruh halaman.
     * Module masing-masing bertanggung jawab terhadap UI.
     */
  }

  /* ========================================================
       INIT
    ======================================================== */

  async function init() {
    if (initialized) {
      return;
    }

    initialized = true;

    await initPage();
  }

  /* ========================================================
       PUBLIC API
       ======================================================== */

  return {
    init,
    initPage,
    getPage,
  };
})();

/* ============================================================
   BOOTSTRAP
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  PublicApp.init();
});
