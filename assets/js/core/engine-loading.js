/* =========================================
   LOADING ENGINE
========================================= */

const Loading = {
  overlay: null,

  /* =====================================
     INIT
  ===================================== */

  init() {
    if (document.getElementById("loadingOverlay")) return;

    const overlay = document.createElement("div");

    overlay.id = "loadingOverlay";

    overlay.className = "loading-overlay";

    overlay.innerHTML = `

        <div class="loading-box">

            <i
                data-lucide="loader-circle"
                class="loading-icon">
            </i>

            <div
                id="loadingText"
                class="loading-text">

                Memuat...

            </div>

        </div>

    `;

    document.body.appendChild(overlay);

    lucide.createIcons();

    this.overlay = overlay;
  },

  /* =====================================
     SHOW
  ===================================== */

  show(text = "Memuat...") {
    this.init();

    document.getElementById("loadingText").textContent = text;

    this.overlay.classList.add("show");

    document.body.style.overflow = "hidden";
  },

  /* =====================================
     HIDE
  ===================================== */

  hide() {
    if (!this.overlay) return;

    this.overlay.classList.remove("show");

    document.body.style.overflow = "";
  },

  /* =====================================
     TOGGLE
  ===================================== */

  toggle(state, text = "Memuat...") {
    state ? this.show(text) : this.hide();
  },
};
