/* =========================================
   DIENG NET
   PUBLIC — HOME
========================================= */

const PublicHome = (() => {
  /* =========================================
       CONFIG
    ========================================= */

  const CONFIG = {
    limit: 6,
    status: "Aktif",
  };

  /* =========================================
       STATE
    ========================================= */

  let state = {
    rows: [],
    loading: false,
  };

  /* =========================================
       ELEMENT
    ========================================= */

  function getStayList() {
    return document.getElementById("homeStayList");
  }

  /* =========================================
       INIT
    ========================================= */

  async function init() {
    console.log("[PublicPenginapan] Init");

    const list = getListElement();

    if (!list) {
      console.warn("[PublicPenginapan] #stayList tidak ditemukan.");

      return;
    }

    renderLoading();

    bindFilterEvents();

    await loadDesa();

    await load();
  }

  /* =========================================
       LOAD
    ========================================= */

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    renderLoading();

    try {
      console.log("[PublicHome] Load penginapan");

      const result = await API.post("penginapan.list", {
        page: state.page,
        limit: state.limit,
        keyword: state.keyword,
        status: state.status,
        desa: state.desa,
      });

      console.log("[PublicHome] Result", result);

      const data = result?.data || {};

      state.rows = Array.isArray(data.rows) ? data.rows : [];

      console.log("[PublicHome] Rows", state.rows);

      render();
    } catch (error) {
      console.error("[PublicHome] Load error", error);

      renderError(error?.message || "Gagal memuat penginapan.");
    } finally {
      state.loading = false;
    }
  }

  /* =========================================
       RENDER
    ========================================= */

  function render() {
    const container = getStayList();

    if (!container) {
      return;
    }

    if (!state.rows.length) {
      renderEmpty();

      return;
    }

    container.innerHTML = state.rows.map((item) => renderCard(item)).join("");
  }

  /* =========================================
       CARD
    ========================================= */

  function renderCard(item = {}) {
    const name = escapeHtml(item.nama || "Penginapan Dieng");

    const location = escapeHtml(
      item.alamat || item.lokasi || "Dieng, Wonosobo",
    );

    const description = escapeHtml(
      item.deskripsi || "Nikmati pengalaman menginap di Dieng.",
    );

    const image = getImageUrl(item);

    const detailUrl = getDetailUrl(item);

    return `
            <article class="stay-card">

                <a
                    href="${detailUrl}"
                    class="stay-image"
                    aria-label="Lihat ${name}"
                >

                    ${
                      image
                        ? `
                                <img
                                    src="${image}"
                                    alt="${name}"
                                    loading="lazy"
                                >
                            `
                        : `
                                <div
                                    class="stay-image-placeholder"
                                    aria-hidden="true"
                                ></div>
                            `
                    }

                </a>


                <div class="stay-content">

                    <span class="stay-location">
                        ${location}
                    </span>


                    <h3>
                        ${name}
                    </h3>


                    ${
                      description
                        ? `
                                <p>
                                    ${description}
                                </p>
                            `
                        : ""
                    }


                    <a
                        href="${detailUrl}"
                        class="text-link"
                    >
                        Explore stay
                        <span>→</span>
                    </a>

                </div>

            </article>
        `;
  }

  /* =========================================
       IMAGE
    ========================================= */
  /* =========================================
   IMAGE
========================================= */

  function getImageUrl(item = {}) {
    const candidates = [
      item.coverUrl,
      item.cover_url,
      item.imageUrl,
      item.image_url,
      item.fotoUrl,
      item.foto_url,
      item.thumbnailUrl,
      item.thumbnail_url,
    ];

    const source = candidates.find(
      (value) => typeof value === "string" && value.trim() !== "",
    );

    if (!source) {
      return "";
    }

    return normalizeImageUrl(source);
  }

  /* =========================================
   NORMALIZE IMAGE URL
========================================= */

  function normalizeImageUrl(url) {
    const value = String(url).trim();

    if (!value) {
      return "";
    }

    /* =====================================
     GOOGLE DRIVE - QUERY ID
     
     Contoh:
     https://drive.google.com/uc?export=view&id=XXXXX
  ===================================== */

    try {
      const parsed = new URL(value);

      const driveId = parsed.searchParams.get("id");

      if (driveId) {
        return (
          "https://drive.google.com/thumbnail" +
          "?id=" +
          encodeURIComponent(driveId) +
          "&sz=w1200"
        );
      }
    } catch (error) {
      console.warn("[PublicPenginapan] URL tidak valid:", value);
    }

    /* =====================================
     GOOGLE DRIVE - FILE ID
     
     Contoh:
     https://drive.google.com/file/d/XXXXX/view
  ===================================== */

    const fileMatch = value.match(/drive\.google\.com\/file\/d\/([^/]+)/);

    if (fileMatch) {
      return (
        "https://drive.google.com/thumbnail" +
        "?id=" +
        encodeURIComponent(fileMatch[1]) +
        "&sz=w1200"
      );
    }

    /* =====================================
     GOOGLE DRIVE - OPEN
     
     Contoh:
     https://drive.google.com/open?id=XXXXX
  ===================================== */

    const openMatch = value.match(/drive\.google\.com\/open\?id=([^&]+)/);

    if (openMatch) {
      return (
        "https://drive.google.com/thumbnail" +
        "?id=" +
        encodeURIComponent(openMatch[1]) +
        "&sz=w1200"
      );
    }

    /* =====================================
     SUDAH THUMBNAIL
  ===================================== */

    if (value.includes("drive.google.com/thumbnail")) {
      return value;
    }

    /* =====================================
     URL BIASA
  ===================================== */

    return value;
  }
  /* =========================================
   NORMALIZE IMAGE URL
========================================= */

  function normalizeImageUrl(url) {
    const value = String(url).trim();

    if (!value) {
      return "";
    }

    /* =====================================
     GOOGLE DRIVE - QUERY ID
     
     Contoh:
     https://drive.google.com/uc?export=view&id=XXXXX
  ===================================== */

    try {
      const parsed = new URL(value);

      const driveId = parsed.searchParams.get("id");

      if (driveId) {
        return (
          "https://drive.google.com/thumbnail" +
          "?id=" +
          encodeURIComponent(driveId) +
          "&sz=w1200"
        );
      }
    } catch (error) {
      console.warn("[PublicPenginapan] URL tidak valid:", value);
    }

    /* =====================================
     GOOGLE DRIVE - FILE ID
     
     Contoh:
     https://drive.google.com/file/d/XXXXX/view
  ===================================== */

    const fileMatch = value.match(/drive\.google\.com\/file\/d\/([^/]+)/);

    if (fileMatch) {
      return (
        "https://drive.google.com/thumbnail" +
        "?id=" +
        encodeURIComponent(fileMatch[1]) +
        "&sz=w1200"
      );
    }

    /* =====================================
     GOOGLE DRIVE - OPEN
     
     Contoh:
     https://drive.google.com/open?id=XXXXX
  ===================================== */

    const openMatch = value.match(/drive\.google\.com\/open\?id=([^&]+)/);

    if (openMatch) {
      return (
        "https://drive.google.com/thumbnail" +
        "?id=" +
        encodeURIComponent(openMatch[1]) +
        "&sz=w1200"
      );
    }

    /* =====================================
     SUDAH THUMBNAIL
  ===================================== */

    if (value.includes("drive.google.com/thumbnail")) {
      return value;
    }

    /* =====================================
     URL BIASA
  ===================================== */

    return value;
  }

  /* =========================================
   NORMALIZE IMAGE URL
========================================= */

  function normalizeImageUrl(url) {
    const value = String(url).trim();

    if (!value) {
      return "";
    }

    /* =====================================
     GOOGLE DRIVE
  ===================================== */

    let match;

    /* -------------------------------------
     drive.google.com/file/d/FILE_ID/view
  ------------------------------------- */

    match = value.match(/drive\.google\.com\/file\/d\/([^/]+)/);

    if (match) {
      return (
        "https://drive.google.com/thumbnail?id=" +
        encodeURIComponent(match[1]) +
        "&sz=w1200"
      );
    }

    /* -------------------------------------
     drive.google.com/open?id=FILE_ID
  ------------------------------------- */

    match = value.match(/drive\.google\.com\/open\?id=([^&]+)/);

    if (match) {
      return (
        "https://drive.google.com/thumbnail?id=" +
        encodeURIComponent(match[1]) +
        "&sz=w1200"
      );
    }

    /* -------------------------------------
     drive.google.com/uc?id=FILE_ID
  ------------------------------------- */

    match = value.match(/drive\.google\.com\/uc\?(?:[^#]*&)?id=([^&]+)/);

    if (match) {
      return (
        "https://drive.google.com/thumbnail?id=" +
        encodeURIComponent(match[1]) +
        "&sz=w1200"
      );
    }

    /* -------------------------------------
     Sudah thumbnail Drive
  ------------------------------------- */

    if (value.includes("drive.google.com/thumbnail")) {
      return value;
    }

    /* =====================================
     URL BIASA
  ===================================== */

    return value;
  }

  /* =========================================
       DETAIL URL
    ========================================= */

  function getDetailUrl(item = {}) {
    const slug = item.slug || item.id || "";

    if (!slug) {
      return "penginapan.html";
    }

    return "penginapan-detail.html?slug=" + encodeURIComponent(slug);
  }

  /* =========================================
       LOADING
    ========================================= */

  function renderLoading() {
    const container = getStayList();

    if (!container) {
      return;
    }

    container.innerHTML = `

            <div class="stay-loading">

                <div class="stay-loading-card"></div>

                <div class="stay-loading-card"></div>

                <div class="stay-loading-card"></div>

            </div>

        `;
  }

  /* =========================================
       EMPTY
    ========================================= */

  function renderEmpty() {
    const container = getStayList();

    if (!container) {
      return;
    }

    container.innerHTML = `

            <div class="stay-empty">

                <h3>
                    No stays available
                </h3>

                <p>
                    Belum ada penginapan yang
                    tersedia saat ini.
                </p>

            </div>

        `;
  }

  /* =========================================
       ERROR
    ========================================= */

  function renderError(message) {
    const container = getStayList();

    if (!container) {
      return;
    }

    container.innerHTML = `

            <div class="stay-error">

                <h3>
                    Penginapan belum dapat dimuat
                </h3>

                <p>
                    ${escapeHtml(message)}
                </p>

                <button
                    type="button"
                    class="stay-retry-btn"
                >
                    Coba Lagi
                </button>

            </div>

        `;

    const retryButton = container.querySelector(".stay-retry-btn");

    if (retryButton) {
      retryButton.addEventListener("click", load);
    }
  }

  /* =========================================
       ESCAPE HTML
    ========================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")

      .replaceAll("<", "&lt;")

      .replaceAll(">", "&gt;")

      .replaceAll('"', "&quot;")

      .replaceAll("'", "&#039;");
  }

  /* =========================================
       ESCAPE ATTRIBUTE
    ========================================= */

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  /* =========================================
       REFRESH
    ========================================= */

  async function refresh() {
    await load();
  }

  /* =========================================
       PUBLIC API
    ========================================= */

  return {
    init,

    load,

    refresh,

    getState: () => ({
      ...state,
      rows: [...state.rows],
    }),
  };
})();

/* =========================================
   AUTO INIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  PublicHome.init();
});
