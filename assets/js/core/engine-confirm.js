/* =========================================
   CONFIRM ENGINE
========================================= */

const Confirm = {
  container: null,

  /* =====================================
     INIT
  ===================================== */

  init() {
    if (document.getElementById("confirmContainer")) return;

    const container = document.createElement("div");

    container.id = "confirmContainer";

    document.body.appendChild(container);

    this.container = container;
  },

  /* =====================================
     OPEN
  ===================================== */

  open(options = {}) {
    this.init();

    const {
      title = "Konfirmasi",
      message = "",
      type = "warning",
      confirmText = "Ya",
      cancelText = "Batal",
      onConfirm = () => {},
      onCancel = () => {},
      closeOnOutside = true,
    } = options;

    const icons = {
      danger: "trash-2",
      warning: "triangle-alert",
      success: "circle-check-big",
      info: "info",
    };

    this.container.innerHTML = `

      <div class="confirm-overlay">

        <div class="confirm confirm-${type}">

            <div class="confirm-icon">

                <i data-lucide="${icons[type]}"></i>

            </div>

            <div class="confirm-title">

                ${title}

            </div>

            <div class="confirm-message">

                ${message}

            </div>

            <div class="confirm-footer">

                <button
                    class="btn btn-outline confirm-cancel">

                    ${cancelText}

                </button>

                <button
                    class="btn btn-primary confirm-ok">

                    ${confirmText}

                </button>

            </div>

        </div>

      </div>

    `;

    lucide.createIcons();

    const overlay = this.container.querySelector(".confirm-overlay");

    overlay.querySelector(".confirm-ok").onclick = () => {
      onConfirm();

      this.close();
    };

    overlay.querySelector(".confirm-cancel").onclick = () => {
      onCancel();

      this.close();
    };

    if (closeOnOutside) {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          onCancel();

          this.close();
        }
      };
    }

    document.onkeydown = (e) => {
      if (e.key === "Escape") {
        onCancel();

        this.close();
      }
    };
  },

  /* =====================================
     CLOSE
  ===================================== */

  close() {
    this.container.innerHTML = "";

    document.onkeydown = null;
  },
};
