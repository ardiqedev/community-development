/* =========================================
   SIDEBAR MODULE
========================================= */

const Sidebar = {
  currentPage: "dashboard",

  /* =====================================
     INIT
  ===================================== */

  init() {
    this.restoreLastPage();

    this.restoreSidebarState();

    this.bindEvents();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    document.addEventListener("click", (e) => {
      /* =================================
         SIDEBAR TOGGLE
      ================================= */

      const sidebarButton = e.target.closest("#btnSidebar");

      if (sidebarButton) {
        this.toggle();

        return;
      }

      /* =================================
         MOBILE BACKDROP
      ================================= */

      const backdrop = e.target.closest("#sidebarBackdrop");

      if (backdrop) {
        this.closeMobile();

        return;
      }

      /* =================================
         MENU
      ================================= */

      const menu = e.target.closest(".menu-item");

      if (!menu) {
        return;
      }

      const page = menu.dataset.page;

      if (!page) {
        return;
      }

      /*
       * Mobile → tutup sidebar
       */

      if (window.innerWidth <= 768) {
        this.closeMobile();
      }

      this.changePage(page);
    });

    /* =================================
       ESC → CLOSE MOBILE SIDEBAR
    ================================= */

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") {
        return;
      }

      if (window.innerWidth <= 768) {
        this.closeMobile();
      }
    });
  },

  /* =====================================
     SIDEBAR TOGGLE
  ===================================== */

  toggle() {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) {
      console.warn("[SIDEBAR] Element #sidebar tidak ditemukan.");

      return;
    }

    /*
     * ==========================================
     * MOBILE
     * ==========================================
     */

    if (window.innerWidth <= 768) {
      const show = !sidebar.classList.contains("show");

      if (show) {
        sidebar.classList.add("show");
      } else {
        sidebar.classList.remove("show");
      }

      this.syncMobileBackdrop(show);

      console.log("[SIDEBAR] Mobile show:", show);

      return;
    }

    /*
     * ==========================================
     * DESKTOP / TABLET
     * ==========================================
     */

    sidebar.classList.toggle("collapsed");

    const collapsed = sidebar.classList.contains("collapsed");

    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");

    console.log("[SIDEBAR] Collapsed:", collapsed);
  },

  /* =====================================
     CLOSE MOBILE
  ===================================== */

  closeMobile() {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) {
      return;
    }

    sidebar.classList.remove("show");

    this.syncMobileBackdrop(false);

    console.log("[SIDEBAR] Mobile closed");
  },

  /* =====================================
     MOBILE BACKDROP
  ===================================== */

  syncMobileBackdrop(show) {
    const backdrop = document.getElementById("sidebarBackdrop");

    if (!backdrop) {
      return;
    }

    backdrop.classList.toggle("show", show);
  },

  /* =====================================
     RESTORE SIDEBAR STATE
  ===================================== */

  restoreSidebarState() {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) {
      return;
    }

    const collapsed = localStorage.getItem("sidebarCollapsed") === "1";

    sidebar.classList.toggle("collapsed", collapsed);

    console.log("[SIDEBAR] Restored:", collapsed);
  },

  /* =====================================
     CHANGE PAGE
  ===================================== */

  changePage(page) {
    this.currentPage = page;

    this.setActive(page);

    localStorage.setItem("lastPage", page);

    Router.navigate(page);
  },

  /* =====================================
     ACTIVE MENU
  ===================================== */

  setActive(page) {
    document.querySelectorAll(".menu-item").forEach((menu) => {
      menu.classList.remove("active");

      if (menu.dataset.page === page) {
        menu.classList.add("active");
      }
    });
  },

  /* =====================================
     RESTORE LAST PAGE
  ===================================== */

  restoreLastPage() {
    const page = localStorage.getItem("lastPage") || "dashboard";

    this.currentPage = page;

    this.setActive(page);

    Router.navigate(page);
  },
};
