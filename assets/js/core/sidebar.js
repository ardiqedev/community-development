/* =========================================
   SIDEBAR MODULE
========================================= */
const Sidebar = {
  currentPage: "dashboard",

  init() {
    this.restoreLastPage();

    this.bindEvents();
  },

  /* =====================================
       BIND EVENTS
    ===================================== */

  bindEvents() {
    document.addEventListener("click", (e) => {
      const menu = e.target.closest(".menu-item");

      if (!menu) return;

      const page = menu.dataset.page;

      if (!page) return;

      this.changePage(page);
    });
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
