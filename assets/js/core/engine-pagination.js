/* =========================================
   PAGINATION ENGINE
========================================= */

const Pagination = {
  /* =====================================
     RENDER
  ===================================== */

  render(options = {}) {
    const {
      target,

      page = 1,

      totalPages = 1,

      onChange = () => {},
    } = options;

    const container = document.querySelector(target);

    if (!container) return;

    container.innerHTML = this.template(page, totalPages);

    this.bind(container, page, totalPages, onChange);
  },

  /* =====================================
     TEMPLATE
  ===================================== */

  /* =====================================
   TEMPLATE
===================================== */

  template(page, totalPages) {
    let html = `

    <div class="pagination">

        <button
            class="pagination-btn prev"
            ${page === 1 ? "disabled" : ""}>

            <i data-lucide="chevron-left"></i>

        </button>

    `;

    const pages = [];

    // halaman pertama
    pages.push(1);

    // ...
    if (page > 4) {
      pages.push("...");
    }

    // halaman sekitar current
    const start = Math.max(2, page - 2);

    const end = Math.min(totalPages - 1, page + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // ...
    if (page < totalPages - 3) {
      pages.push("...");
    }

    // halaman terakhir
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    html += pages
      .map((item) => {
        if (item === "...") {
          return `

                    <span class="pagination-ellipsis">

                        ...

                    </span>

                `;
        }

        return `

                <button
                    class="pagination-btn ${item === page ? "active" : ""}"
                    data-page="${item}">

                    ${item}

                </button>

            `;
      })
      .join("");

    html += `

        <button
            class="pagination-btn next"
            ${page === totalPages ? "disabled" : ""}>

            <i data-lucide="chevron-right"></i>

        </button>

    </div>

    `;

    return html;
  },

  /* =====================================
     EVENTS
  ===================================== */

  bind(container, page, totalPages, onChange) {
    container.querySelectorAll("[data-page]").forEach((btn) => {
      btn.onclick = () => {
        onChange(Number(btn.dataset.page));
      };
    });

    container.querySelector(".prev")?.addEventListener("click", () => {
      if (page > 1) {
        onChange(page - 1);
      }
    });

    container.querySelector(".next")?.addEventListener("click", () => {
      if (page < totalPages) {
        onChange(page + 1);
      }
    });

    lucide.createIcons();
  },
};
