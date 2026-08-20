/* =========================================
   SKELETON ENGINE
========================================= */

const Skeleton = {
  /* =====================================
     TABLE
  ===================================== */

  table(target, rows = 8) {
    const el = document.querySelector(target);

    if (!el) return;

    let html = `

      <div class="skeleton-table">

    `;

    for (let i = 0; i < rows; i++) {
      html += `

        <div class="skeleton-row">

            <div class="skeleton skeleton-lg"></div>

            <div class="skeleton"></div>

            <div class="skeleton"></div>

            <div class="skeleton"></div>

            <div class="skeleton-sm"></div>

        </div>

      `;
    }

    html += `</div>`;

    el.innerHTML = html;
  },

  /* =====================================
     CARD
  ===================================== */

  card(target, total = 4) {
    const el = document.querySelector(target);

    if (!el) return;

    let html = "";

    for (let i = 0; i < total; i++) {
      html += `

      <div class="card">

          <div class="card-body">

              <div class="skeleton skeleton-title"></div>

              <div class="skeleton skeleton-text"></div>

              <div class="skeleton skeleton-text"></div>

          </div>

      </div>

      `;
    }

    el.innerHTML = html;
  },

  /* =====================================
     LIST
  ===================================== */

  list(target, total = 6) {
    const el = document.querySelector(target);

    if (!el) return;

    let html = "";

    for (let i = 0; i < total; i++) {
      html += `

      <div class="skeleton-list">

          <div class="skeleton-avatar"></div>

          <div>

              <div class="skeleton skeleton-title"></div>

              <div class="skeleton skeleton-text"></div>

          </div>

      </div>

      `;
    }

    el.innerHTML = html;
  },

  /* =====================================
     HIDE
  ===================================== */

  hide(target) {
    const el = document.querySelector(target);

    if (!el) return;

    el.innerHTML = "";
  },
};
