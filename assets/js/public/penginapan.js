/* ============================================================
   DIENG NET
   PUBLIC — PENGINAPAN
   ============================================================

   Responsibility:
   - Load penginapan aktif
   - Search penginapan
   - Filter desa
   - Filter jenis penginapan
   - Render listing
   - Loading state
   - Empty state
   - Mobile menu
   - Navigation detail

   Architecture:

   PublicPenginapan
        ↓
      API.post()
        ↓
   penginapan.list
        ↓
   Router
        ↓
   PenginapanController
        ↓
   PenginapanService
        ↓
   PenginapanRepository
        ↓
   Spreadsheet

   IMPORTANT:
   - Tidak menggunakan Dummy
   - Tidak menggunakan PenginapanService langsung
   - Tidak membuat endpoint desa baru
   ============================================================ */

const PublicPenginapan = (() => {
  /* ==========================================================
     CONFIG
  ========================================================== */

  const config = {
    page: 1,

    limit: 100,

    status: "Aktif",
  };

  /* ==========================================================
     STATE
  ========================================================== */

  const state = {
    page: config.page,

    limit: config.limit,

    keyword: "",

    desa: "",

    jenis: "",

    status: config.status,

    rows: [],

    total: 0,

    totalPages: 1,

    loading: false,
  };

  /* ==========================================================
     DOM
  ========================================================== */

  const dom = {};

  /* ==========================================================
     INIT
  ========================================================== */

  async function init() {
    console.log("[PublicPenginapan] Init");

    cacheDom();

    bindEvents();

    initMobileMenu();

    renderLoading();

    await load();
  }

  /* ==========================================================
     CACHE DOM
  ========================================================== */

  function cacheDom() {
    dom.list = document.getElementById("stayList");

    dom.count = document.getElementById("stayCount");

    dom.empty = document.getElementById("listingEmpty");

    dom.loading = document.getElementById("listingLoading");

    dom.search = document.getElementById("searchPenginapan");

    /*
     * Lokasi public = DESA
     */

    dom.desa = document.getElementById("filterDesa");

    /*
     * Jenis penginapan
     */

    dom.jenis = document.getElementById("filterTipe");

    /*
     * Tombol search
     */

    dom.filterButton = document.getElementById("filterButton");

    /*
     * Mobile menu
     */

    dom.mobileMenuBtn = document.getElementById("mobileMenuBtn");

    dom.mobileMenu = document.getElementById("mobileMenu");
  }

  /* ==========================================================
     EVENTS
  ========================================================== */

  function bindEvents() {
    /* ========================================================
       SEARCH BUTTON
       ======================================================== */

    if (dom.filterButton) {
      dom.filterButton.addEventListener("click", applyFilter);
    }

    /* ========================================================
       SEARCH ENTER
       ======================================================== */

    if (dom.search) {
      dom.search.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();

        applyFilter();
      });
    }

    /* ========================================================
       FILTER DESA
       ======================================================== */

    if (dom.desa) {
      dom.desa.addEventListener("change", applyFilter);
    }

    /* ========================================================
       FILTER JENIS
       ======================================================== */

    if (dom.jenis) {
      dom.jenis.addEventListener("change", applyFilter);
    }
  }

  /* ==========================================================
     LOAD
  ========================================================== */

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    renderLoading();

    try {
      console.log("[PublicPenginapan] Request:", {
        page: state.page,
        limit: state.limit,
        keyword: state.keyword,
        status: state.status,
      });

      /*
       * Public TIDAK mengakses PenginapanService.
       *
       * Semua request melalui API engine.
       */

      const result = await API.post("penginapan.list", {
        page: state.page,

        limit: state.limit,

        keyword: state.keyword,

        status: state.status,
      });

      console.log("[PublicPenginapan] Result:", result);

      /*
       * Response backend:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *     rows: [],
       *     page: 1,
       *     limit: 100,
       *     total: 3,
       *     totalPages: 1
       *   }
       * }
       */

      const data = result?.data || {};

      state.rows = Array.isArray(data.rows) ? data.rows : [];

      state.total = Number(data.total || state.rows.length);

      state.totalPages = Number(data.totalPages || 1);

      state.page = Number(data.page || state.page);

      console.log("[PublicPenginapan] Rows:", state.rows);

      /*
       * Setelah data berhasil dimuat,
       * bangun option Desa dan Jenis.
       */

      renderDesaOptions();

      renderJenisOptions();

      /*
       * Render listing.
       */

      render();
    } catch (error) {
      console.error("[PublicPenginapan] Load error:", error);

      state.rows = [];

      state.total = 0;

      state.totalPages = 1;

      renderError(error?.message || "Gagal memuat data penginapan.");
    } finally {
      state.loading = false;

      hideLoading();
    }
  }

  /* ==========================================================
     APPLY FILTER
  ========================================================== */

  function applyFilter() {
    state.keyword = dom.search?.value?.trim() || "";

    state.desa = dom.desa?.value?.trim() || "";

    state.jenis = dom.jenis?.value?.trim() || "";

    state.page = 1;

    console.log("[PublicPenginapan] Filter:", {
      keyword: state.keyword,
      desa: state.desa,
      jenis: state.jenis,
    });

    render();
  }

  /* ==========================================================
     GET FILTERED ROWS
  ========================================================== */

  function getFilteredRows() {
    const keyword = String(state.keyword || "")
      .trim()
      .toLowerCase();

    const desa = String(state.desa || "")
      .trim()
      .toLowerCase();

    const jenis = String(state.jenis || "")
      .trim()
      .toLowerCase();

    return state.rows.filter((item) => {
      /* ====================================================
           SEARCH
           ==================================================== */

      const searchableText = [
        item.nama,

        item.jenis,

        item.kategori,

        item.desa,

        item.kecamatan,

        item.kabupaten,

        item.provinsi,

        item.alamat,

        item.deskripsi,
      ]
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value))
        .join(" ")
        .toLowerCase();

      const matchKeyword = !keyword || searchableText.includes(keyword);

      /* ====================================================
           DESA
           ==================================================== */

      const itemDesa = String(item.desa || "")
        .trim()
        .toLowerCase();

      const matchDesa = !desa || itemDesa === desa;

      /* ====================================================
           JENIS
           ==================================================== */

      const itemJenis = String(item.jenis || item.kategori || "")
        .trim()
        .toLowerCase();

      const matchJenis = !jenis || itemJenis === jenis;

      /* ====================================================
           FINAL
           ==================================================== */

      return matchKeyword && matchDesa && matchJenis;
    });
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  function render() {
    if (!dom.list) {
      console.warn("[PublicPenginapan] #stayList tidak ditemukan.");

      return;
    }

    const rows = getFilteredRows();

    updateCount(rows.length);

    if (!rows.length) {
      renderEmpty();

      return;
    }

    hideEmpty();

    dom.list.innerHTML = rows.map((item) => renderCard(item)).join("");
  }

  /* ==========================================================
     RENDER CARD
  ========================================================== */

  function renderCard(item = {}) {
    const id = item.id || "";

    const nama = item.nama || "Penginapan Dieng";

    const jenis = item.jenis || item.kategori || "Penginapan";

    const lokasi = formatLocation(item);

    const deskripsi =
      item.deskripsi || "Temukan tempat menginap yang nyaman di kawasan Dieng.";

    const image = resolveImage(item);

    const detailUrl = getDetailUrl(item);

    return `

      <article
        class="stay-card"
        data-id="${escapeAttribute(id)}"
      >


        <!-- =========================================
             IMAGE
        ========================================== -->

        <a
          href="${detailUrl}"
          class="stay-image"
          aria-label="Lihat ${escapeAttribute(nama)}"
        >

          ${
            image
              ? `
                <img
                  src="${escapeAttribute(image)}"
                  alt="${escapeAttribute(nama)}"
                  loading="lazy"
                />
              `
              : `
                <div
                  class="stay-image-placeholder"
                  aria-hidden="true"
                ></div>
              `
          }

        </a>


        <!-- =========================================
             CONTENT
        ========================================== -->

        <div class="stay-content">


          <span class="stay-location">

            ${escapeHtml(lokasi)}

          </span>


          <h3>

            ${escapeHtml(nama)}

          </h3>


          ${
            deskripsi
              ? `
                <p>

                  ${escapeHtml(deskripsi)}

                </p>
              `
              : ""
          }


          <div class="stay-card-footer">


            <span class="stay-price">

              ${escapeHtml(jenis)}

            </span>


            <a
              href="${detailUrl}"
              class="text-link"
            >

              View stay

              <span>→</span>

            </a>


          </div>


        </div>


      </article>

    `;
  }

  /* ==========================================================
     LOCATION
  ========================================================== */

  function formatLocation(item = {}) {
    const parts = [];

    if (item.desa) {
      parts.push(item.desa);
    }

    if (item.kecamatan) {
      parts.push(item.kecamatan);
    }

    if (!parts.length && item.kabupaten) {
      parts.push(item.kabupaten);
    }

    if (!parts.length && item.provinsi) {
      parts.push(item.provinsi);
    }

    if (!parts.length) {
      return "Dieng, Wonosobo";
    }

    return parts.join(", ");
  }

  /* ==========================================================
     DESA OPTIONS
  ========================================================== */

  function renderDesaOptions() {
    if (!dom.desa) {
      return;
    }

    /*
     * Simpan value yang sedang dipilih.
     */

    const currentValue = state.desa;

    /*
     * Ambil desa dari rows.
     */

    const desaList = [
      ...new Set(
        state.rows

          .map((item) => String(item.desa || "").trim())

          .filter(Boolean),
      ),
    ];

    /*
     * Urutkan alfabetis.
     */

    desaList.sort((a, b) => a.localeCompare(b, "id"));

    dom.desa.innerHTML = `

      <option value="">
        All locations
      </option>

    `;

    desaList.forEach((desa) => {
      const option = document.createElement("option");

      option.value = desa;

      option.textContent = desa;

      if (desa === currentValue) {
        option.selected = true;
      }

      dom.desa.appendChild(option);
    });
  }

  /* ==========================================================
     JENIS OPTIONS
  ========================================================== */

  function renderJenisOptions() {
    if (!dom.jenis) {
      return;
    }

    const currentValue = state.jenis;

    const jenisList = [
      ...new Set(
        state.rows

          .map((item) => String(item.jenis || item.kategori || "").trim())

          .filter(Boolean),
      ),
    ];

    jenisList.sort((a, b) => a.localeCompare(b, "id"));

    dom.jenis.innerHTML = `

      <option value="">
        All types
      </option>

    `;

    jenisList.forEach((jenis) => {
      const option = document.createElement("option");

      option.value = jenis;

      option.textContent = jenis;

      if (jenis === currentValue) {
        option.selected = true;
      }

      dom.jenis.appendChild(option);
    });
  }

  /* ==========================================================
     DETAIL URL
  ========================================================== */

  function getDetailUrl(item = {}) {
    const slug = item.slug || item.id || "";

    if (!slug) {
      return "#";
    }

    return "penginapan-detail.html?slug=" + encodeURIComponent(slug);
  }

  /* =========================================
   DRIVE IMAGE URL
========================================= */

  function resolveDriveImage(url) {
    if (!url) {
      return "";
    }

    const match = url.match(/[?&]id=([^&]+)/);

    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }

    return url;
  }

  /* ==========================================================
     IMAGE
  ========================================================== */

  function resolveImage(item = {}) {
    const candidates = [
      item.coverUrl,
      item.cover_url,
      item.imageUrl,
      item.image_url,
      item.fotoUrl,
      item.foto_url,
      item.thumbnailUrl,
      item.thumbnail_url,
      item.cover?.url,
      item.cover?.downloadUrl,
      item.logoUrl,
      item.logo?.url,
    ];

    const image = candidates.find(
      (value) => typeof value === "string" && value.trim() !== "",
    );

    return image ? resolveDriveImage(image.trim()) : "";
  }
  /* ==========================================================
     LOADING
  ========================================================== */

  function renderLoading() {
    if (dom.loading) {
      dom.loading.hidden = false;
    }

    if (dom.list) {
      dom.list.innerHTML = `

        <div
          class="stay-loading"
          aria-label="Memuat penginapan"
        >

          <div
            class="stay-loading-card"
          ></div>

          <div
            class="stay-loading-card"
          ></div>

          <div
            class="stay-loading-card"
          ></div>

        </div>

      `;
    }
  }

  /* ==========================================================
     HIDE LOADING
  ========================================================== */

  function hideLoading() {
    if (dom.loading) {
      dom.loading.hidden = true;
    }
  }

  /* ==========================================================
     EMPTY
  ========================================================== */

  function renderEmpty() {
    if (!dom.list) {
      return;
    }

    dom.list.innerHTML = `

      <div class="stay-empty">

        <div
          class="stay-empty-icon"
          aria-hidden="true"
        >
          🏡
        </div>


        <h3>
          No stays found.
        </h3>


        <p>
          Try changing your search
          or filter.
        </p>

      </div>

    `;

    hideEmpty();
  }

  /* ==========================================================
     HIDE EMPTY
  ========================================================== */

  function hideEmpty() {
    if (dom.empty) {
      dom.empty.hidden = true;
    }
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  function renderError(message) {
    if (!dom.list) {
      return;
    }

    dom.list.innerHTML = `

      <div class="stay-error">

        <h3>
          Penginapan belum dapat dimuat
        </h3>


        <p>

          ${escapeHtml(message)}

        </p>


        <button
          type="button"
          class="btn btn-dark stay-retry-btn"
        >

          Coba Lagi

        </button>

      </div>

    `;

    hideEmpty();

    const retryButton = dom.list.querySelector(".stay-retry-btn");

    if (retryButton) {
      retryButton.addEventListener("click", load);
    }
  }

  /* ==========================================================
     COUNT
  ========================================================== */

  function updateCount(count) {
    if (!dom.count) {
      return;
    }

    dom.count.textContent = `${count} ${count === 1 ? "stay" : "stays"}`;
  }

  /* ==========================================================
     REFRESH
  ========================================================== */

  async function refresh() {
    state.page = 1;

    await load();
  }

  /* ==========================================================
     MOBILE MENU
  ========================================================== */

  function initMobileMenu() {
    const button = dom.mobileMenuBtn;

    const menu = dom.mobileMenu;

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");

      button.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");

        button.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ==========================================================
     ESCAPE HTML
  ========================================================== */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");
  }

  /* ==========================================================
     ESCAPE ATTRIBUTE
  ========================================================== */

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  /* ==========================================================
     PUBLIC API
  ========================================================== */

  return {
    init,

    load,

    refresh,

    applyFilter,

    render,

    getState() {
      return {
        ...state,

        rows: [...state.rows],
      };
    },
  };
})();

/* ============================================================
   BOOTSTRAP
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  PublicPenginapan.init();
});
