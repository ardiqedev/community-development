/* =========================================
   QEDEV APP
   COMMUNITY DEVELOPMENT
========================================= */

/* =========================================
   APP INIT
========================================= */

document.addEventListener("DOMContentLoaded", initApp);

/* =========================================
   INIT APPLICATION
========================================= */

async function initApp() {
  try {
    /* =====================================
       DEBUG
    ===================================== */

    if (CONFIG.DEBUG) {
      console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
    }

    /* =====================================
       LOAD COMPONENT
    ===================================== */

    await Router.loadComponent("components/sidebar.html", "sidebar");

    await Router.loadComponent("components/navbar.html", "navbar");

    /* =====================================
       CORE INIT
    ===================================== */

    State.init();

    Auth.init();

    await Modal.init();

    /* =====================================
       UI INIT
    ===================================== */

    Sidebar.init();

    /* =====================================
       ROUTER
    ===================================== */

    Router.start();

    /* =====================================
       SUCCESS
    ===================================== */

    if (CONFIG.DEBUG) {
      console.log("[APP] Application initialized");
    }
  } catch (error) {
    console.error("[APP] Application initialization failed:", error);
  }
}
