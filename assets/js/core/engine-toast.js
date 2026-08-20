/* =========================================
   TOAST ENGINE
========================================= */

const Toast = {
  container: null,

  /* =====================================
     INIT
  ===================================== */

  init() {
    if (document.getElementById("toastContainer")) return;

    const container = document.createElement("div");

    container.id = "toastContainer";

    container.className = "toast-container";

    document.body.appendChild(container);

    this.container = container;
  },

  /* =====================================
     SHOW
  ===================================== */

  show({ type = "info", title = "", message = "", duration = 3000 }) {
    this.init();

    const icons = {
      success: "check-circle-2",

      error: "circle-x",

      warning: "triangle-alert",

      info: "info",
    };

    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    toast.innerHTML = `

        <div class="toast-icon">

            <i data-lucide="${icons[type]}"></i>

        </div>

        <div class="toast-content">

            <div class="toast-title">

                ${title}

            </div>

            <div class="toast-message">

                ${message}

            </div>

            <div
                class="toast-progress"
                style="animation-duration:${duration}ms">

            </div>

        </div>

        <button
            class="toast-close">

            <i data-lucide="x"></i>

        </button>

    `;

    this.container.appendChild(toast);

    lucide.createIcons();

    toast.querySelector(".toast-close").addEventListener("click", () => {
      this.remove(toast);
    });

    setTimeout(() => {
      this.remove(toast);
    }, duration);
  },

  /* =====================================
     REMOVE
  ===================================== */

  remove(toast) {
    if (!toast) return;

    toast.classList.add("toast-hide");

    setTimeout(() => toast.remove(), 250);
  },

  /* =====================================
     HELPERS
  ===================================== */

  success(message, duration = 3000) {
    this.show({
      type: "success",

      title: "Berhasil",

      message,

      duration,
    });
  },

  error(message, duration = 3000) {
    this.show({
      type: "error",

      title: "Gagal",

      message,

      duration,
    });
  },

  warning(message, duration = 3000) {
    this.show({
      type: "warning",

      title: "Peringatan",

      message,

      duration,
    });
  },

  info(message, duration = 3000) {
    this.show({
      type: "info",

      title: "Informasi",

      message,

      duration,
    });
  },
};
