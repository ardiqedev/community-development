/**
 * ============================================================
 * COMMUNITY DEVELOPMENT
 * MODULE : REPORT
 * ============================================================
 *
 * Laporan Penerima Manfaat
 *
 * FILTER:
 * - Desa
 * - Program
 * - Tahun
 *
 * FLOW:
 * Filter
 *   ↓
 * getReport
 *   ↓
 * Table
 *   ↓
 * Preview Cetak
 *
 * ============================================================
 */

const Report = (() => {
  /* ==========================================================
     CONFIG
  ========================================================== */

  const CONFIG = {
    PAGE_SIZE: 10,

    DEFAULT_YEAR: new Date().getFullYear(),
  };

  /* ==========================================================
     STATE
  ========================================================== */

  const state = {
    initialized: false,

    loading: false,

    masterLoading: false,

    data: [],

    currentPage: 1,

    pageSize: CONFIG.PAGE_SIZE,

    total: 0,

    summary: {
      total: 0,

      desa: 0,

      program: 0,

      periode: "",
    },

    filter: {
      DESA: "",

      ID_PROGRAM: "",

      PERIODE: String(CONFIG.DEFAULT_YEAR),
    },

    desa: [],

    program: [],
  };

  /* ==========================================================
     INIT
  ========================================================== */

  async function init() {
    console.log("[REPORT] Init");

    /*
     * Pastikan halaman Report
     * memang sudah ter-render.
     */

    const desaSelect = document.getElementById("reportDesaFilter");

    if (!desaSelect) {
      console.warn("[REPORT] DOM belum siap.");

      return;
    }

    /*
     * Jangan load ulang master
     * setiap masuk halaman.
     */

    if (!state.initialized) {
      state.initialized = true;

      bindEvents();

      setDefaultYear();

      await loadMaster();

      renderEmpty();

      console.log("[REPORT] Ready");
    } else {
      /*
       * Saat kembali ke halaman Report,
       * pertahankan filter dan hasil.
       */

      syncFilterFromUI();

      renderTable();
    }
  }

  /* ==========================================================
     LOAD MASTER
  ========================================================== */

  async function loadMaster() {
    if (state.masterLoading) {
      return;
    }

    state.masterLoading = true;

    try {
      /*
       * ================================================
       * DESA
       * ================================================
       */

      const desaResponse = await API.get("getDistinctFieldValues", {
        FIELD: "DESA",
      });

      if (desaResponse && desaResponse.success === true) {
        state.desa = Array.isArray(desaResponse.data) ? desaResponse.data : [];
      } else {
        state.desa = [];
      }

      /*
       * ================================================
       * PROGRAM
       * ================================================
       */

      const programResponse = await API.get("getProgram");

      if (Array.isArray(programResponse)) {
        state.program = programResponse;
      } else if (programResponse && Array.isArray(programResponse.data)) {
        state.program = programResponse.data;
      } else {
        state.program = [];
      }

      /*
       * ================================================
       * RENDER FILTER
       * ================================================
       */

      renderDesaFilter();

      renderProgramFilter();

      setDefaultYear();

      console.log("[REPORT] Desa:", state.desa.length);

      console.log("[REPORT] Program:", state.program.length);
    } catch (error) {
      console.error("[REPORT] loadMaster:", error);

      state.desa = [];

      state.program = [];

      Toast.error(error?.message || "Gagal memuat filter laporan.");
    } finally {
      state.masterLoading = false;
    }
  }

  /* ==========================================================
     RENDER DESA FILTER
  ========================================================== */

  function renderDesaFilter() {
    const select = document.getElementById("reportDesaFilter");

    if (!select) {
      return;
    }

    const current = state.filter.DESA;

    const options = state.desa
      .map(function (desa) {
        const value = String(desa || "").trim();

        if (!value) {
          return "";
        }

        const selected = value === current ? "selected" : "";

        return `

            <option
              value="${escapeHtml(value)}"
              ${selected}
            >
              ${escapeHtml(value)}
            </option>

          `;
      })
      .join("");

    select.innerHTML = `

      <option value="">
        Semua Desa
      </option>

      ${options}

    `;

    select.value = current;
  }

  /* ==========================================================
     RENDER PROGRAM FILTER
  ========================================================== */

  function renderProgramFilter() {
    const select = document.getElementById("reportProgramFilter");

    if (!select) {
      return;
    }

    const current = state.filter.ID_PROGRAM;

    const options = state.program
      .map(function (program) {
        const id = String(program.ID_PROGRAM || "").trim();

        const nama = String(program.NAMA_PROGRAM || "").trim();

        if (!id) {
          return "";
        }

        const selected = id === current ? "selected" : "";

        return `

            <option
              value="${escapeHtml(id)}"
              ${selected}
            >
              ${escapeHtml(nama || id)}
            </option>

          `;
      })
      .join("");

    select.innerHTML = `

      <option value="">
        Semua Program
      </option>

      ${options}

    `;

    select.value = current;
  }

  /* ==========================================================
     DEFAULT YEAR
  ========================================================== */

  function setDefaultYear() {
    const select = document.getElementById("reportTahunFilter");

    if (!select) {
      return;
    }

    const current = state.filter.PERIODE || String(CONFIG.DEFAULT_YEAR);

    /*
     * Buat pilihan tahun:
     * tahun sekarang + 4 tahun sebelumnya.
     */

    const currentYear = CONFIG.DEFAULT_YEAR;

    const years = [];

    for (let year = currentYear; year >= currentYear - 4; year--) {
      years.push(String(year));
    }

    select.innerHTML = years
      .map(function (year) {
        const selected = year === current ? "selected" : "";

        return `

            <option
              value="${year}"
              ${selected}
            >
              ${year}
            </option>

          `;
      })
      .join("");

    /*
     * Kalau tahun lama tidak ada
     * dalam option, gunakan tahun berjalan.
     */

    if (years.includes(current)) {
      select.value = current;
    } else {
      select.value = String(currentYear);

      state.filter.PERIODE = String(currentYear);
    }
  }

  /* ==========================================================
     LOAD REPORT
  ========================================================== */

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    try {
      syncFilterFromUI();

      console.log("[REPORT] Filter:", state.filter);

      showLoading();

      const response = await API.get("getReport", {
        DESA: state.filter.DESA,

        ID_PROGRAM: state.filter.ID_PROGRAM,

        PERIODE: state.filter.PERIODE,
      });

      console.log("[REPORT] Response:", response);

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Gagal mengambil laporan.");
      }

      /*
       * ==============================================
       * DATA
       * ==============================================
       */

      state.data = Array.isArray(response.data) ? response.data : [];

      state.total = Number(response.total) || state.data.length;

      state.summary = response.summary || {
        total: state.total,

        desa: 0,

        program: 0,

        periode: state.filter.PERIODE,
      };

      state.currentPage = 1;

      /*
       * ==============================================
       * RENDER
       * ==============================================
       */

      renderResultDescription();

      renderTable();

      renderPagination();

      updatePreviewButton();
    } catch (error) {
      console.error("[REPORT] Load failed:", error);

      state.data = [];

      state.total = 0;

      state.summary = {
        total: 0,

        desa: 0,

        program: 0,

        periode: state.filter.PERIODE,
      };

      renderResultDescription();

      renderEmpty(error?.message || "Gagal mengambil laporan.");

      renderPagination();

      updatePreviewButton();

      Toast.error(error?.message || "Gagal mengambil laporan.");
    } finally {
      state.loading = false;

      hideLoading();
    }
  }

  /* ==========================================================
     SYNC FILTER
  ========================================================== */

  function syncFilterFromUI() {
    const desa = document.getElementById("reportDesaFilter");

    const program = document.getElementById("reportProgramFilter");

    const tahun = document.getElementById("reportTahunFilter");

    state.filter.DESA = desa ? String(desa.value || "").trim() : "";

    state.filter.ID_PROGRAM = program ? String(program.value || "").trim() : "";

    state.filter.PERIODE = tahun
      ? String(tahun.value || "").trim()
      : String(CONFIG.DEFAULT_YEAR);
  }

  /* ==========================================================
     TABLE
  ========================================================== */

  function renderTable() {
    const tbody = document.getElementById("reportTableBody");

    if (!tbody) {
      console.warn("[REPORT] #reportTableBody tidak ditemukan.");

      return;
    }

    if (!state.data.length) {
      renderEmpty();

      return;
    }

    const start = (state.currentPage - 1) * state.pageSize;

    const end = start + state.pageSize;

    const rows = state.data.slice(start, end);

    tbody.innerHTML = rows
      .map(function (row, index) {
        const number = start + index + 1;

        const nama = escapeHtml(row.NAMA || "-");

        const nik = escapeHtml(row.NIK || "-");

        const desa = escapeHtml(row.DESA || "-");

        const program = escapeHtml(row.NAMA_PROGRAM || "-");

        const status = String(row.STATUS || "NONAKTIF")
          .trim()
          .toUpperCase();

        return `

            <tr>

                <td>
                ${number}
                </td>

                <td>
                <strong>
                    ${nama}
                </strong>
                </td>

                <td>
                ${nik}
                </td>

                <td>
                ${desa}
                </td>

                <td>
                ${program}
                </td>

                <td>
                ${renderStatus(status)}
                </td>

                <td>
                <button
                    type="button"
                    class="report-detail-btn"
                    data-report-detail="${escapeHtml(row.ID_PENERIMA || "")}"
                    title="Lihat detail penerima"
                >
                    Detail
                </button>
                </td>

            </tr>

            `;
      })
      .join("");

    renderPagination();
  }

  /* ==========================================================
     STATUS BADGE
  ========================================================== */

  function renderStatus(status) {
    const normalized = String(status || "")
      .trim()
      .toUpperCase();

    let className = "badge badge-secondary";

    if (normalized === "AKTIF") {
      className = "badge badge-success";
    }

    if (normalized === "NONAKTIF") {
      className = "badge badge-danger";
    }

    return `

      <span
        class="${className}"
      >
        ${escapeHtml(normalized || "-")}
      </span>

    `;
  }

  /* ==========================================================
     EMPTY TABLE
  ========================================================== */

  function renderEmpty(message = "Belum ada laporan yang ditampilkan.") {
    const tbody = document.getElementById("reportTableBody");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="table-empty"
        >
          ${escapeHtml(message)}
        </td>

      </tr>

    `;

    const info = document.getElementById("reportPaginationInfo");

    if (info) {
      info.textContent = "Menampilkan 0 data";
    }
  }

  /* ==========================================================
     RESULT DESCRIPTION
  ========================================================== */

  function renderResultDescription() {
    const element = document.getElementById("reportResultDescription");

    if (!element) {
      return;
    }

    const total = state.total;

    const desa = state.filter.DESA ? state.filter.DESA : "Semua Desa";

    const program = getProgramName(state.filter.ID_PROGRAM);

    const tahun = state.filter.PERIODE || "-";

    element.innerHTML = `

      Menampilkan
      <strong>
        ${number(total)}
      </strong>
      penerima manfaat
      ·
      ${escapeHtml(desa)}
      ·
      ${escapeHtml(program)}
      ·
      Tahun ${escapeHtml(tahun)}

    `;
  }

  /* ==========================================================
     PAGINATION
  ========================================================== */

  function renderPagination() {
    const container = document.getElementById("reportPagination");

    const info = document.getElementById("reportPaginationInfo");

    if (!container) {
      return;
    }

    const total = state.data.length;

    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    if (info) {
      if (!total) {
        info.textContent = "Menampilkan 0 data";
      } else {
        const start = (state.currentPage - 1) * state.pageSize + 1;

        const end = Math.min(state.currentPage * state.pageSize, total);

        info.textContent = `Menampilkan ${number(start)}–${number(end)} dari ${number(total)} data`;
      }
    }

    if (total <= state.pageSize) {
      container.innerHTML = "";

      return;
    }

    let html = "";

    /*
     * PREVIOUS
     */

    html += `

      <button
        type="button"
        class="pagination-btn"
        data-report-page="${state.currentPage - 1}"
        ${state.currentPage === 1 ? "disabled" : ""}
      >
        ‹
      </button>

    `;

    /*
     * PAGE NUMBERS
     */

    for (let page = 1; page <= totalPages; page++) {
      /*
       * Jangan render terlalu banyak
       * tombol halaman.
       */

      if (
        totalPages > 7 &&
        page !== 1 &&
        page !== totalPages &&
        Math.abs(page - state.currentPage) > 1
      ) {
        if (page === 2 || page === totalPages - 1) {
          html += `

            <span
              class="pagination-ellipsis"
            >
              …
            </span>

          `;
        }

        continue;
      }

      html += `

        <button
          type="button"
          class="pagination-btn ${page === state.currentPage ? "active" : ""}"
          data-report-page="${page}"
        >
          ${page}
        </button>

      `;
    }

    /*
     * NEXT
     */

    html += `

      <button
        type="button"
        class="pagination-btn"
        data-report-page="${state.currentPage + 1}"
        ${state.currentPage === totalPages ? "disabled" : ""}
      >
        ›
      </button>

    `;

    container.innerHTML = html;
  }

  /* ==========================================================
     CHANGE PAGE
  ========================================================== */

  function changePage(page) {
    const totalPages = Math.max(
      1,
      Math.ceil(state.data.length / state.pageSize),
    );

    const target = Number(page);

    if (!Number.isFinite(target) || target < 1 || target > totalPages) {
      return;
    }

    state.currentPage = target;

    renderTable();
  }

  /* ==========================================================
     PREVIEW BUTTON
  ========================================================== */

  function updatePreviewButton() {
    const button = document.getElementById("reportPreviewButton");

    if (!button) {
      return;
    }

    button.disabled = state.data.length === 0;
  }

  /* ==========================================================
   DETAIL
========================================================== */

  /* ==========================================================
   DETAIL
========================================================== */

  /* ==========================================================
   DETAIL
========================================================== */

  function openDetail(idPenerima) {
    console.log("[REPORT] Open detail:", idPenerima);

    /* ========================================================
     CARI DATA
  ======================================================== */

    const row = state.data.find(function (item) {
      return (
        String(item.ID_PENERIMA || "").trim() ===
        String(idPenerima || "").trim()
      );
    });

    if (!row) {
      console.warn("[REPORT] Data penerima tidak ditemukan:", idPenerima);

      Toast.error("Data penerima tidak ditemukan.");

      return;
    }

    console.log("[REPORT] Detail penerima:", row);

    /* ========================================================
     DATA
  ======================================================== */

    const nama = escapeHtml(row.NAMA || "-");

    const nik = escapeHtml(row.NIK || "-");

    const desa = escapeHtml(row.DESA || "-");

    const program = escapeHtml(row.NAMA_PROGRAM || "-");

    const periode = escapeHtml(row.PERIODE || "-");

    const idPenerimaValue = escapeHtml(row.ID_PENERIMA || "-");

    const idPenduduk = escapeHtml(row.ID_PENDUDUK || "-");

    const idProgram = escapeHtml(row.ID_PROGRAM || "-");

    const status = String(row.STATUS || "AKTIF")
      .trim()
      .toUpperCase();

    const tanggalPenetapan = formatReportDate(row.TGL_PENETAPAN);

    const catatan = escapeHtml(row.CATATAN || "-");

    /* ========================================================
     STATUS
  ======================================================== */

    const statusClass = status === "AKTIF" ? "aktif" : "nonaktif";

    const statusHtml = `

    <span
      class="report-detail-status ${statusClass}"
    >

      <span
        class="report-detail-status-dot"
      ></span>

      ${escapeHtml(status)}

    </span>

  `;

    /* ========================================================
     BODY
  ======================================================== */

    const body = `

    <div class="report-detail">

      <!-- ==================================================
           IDENTITY
      =================================================== -->

      <div class="report-detail-identity">

        <div class="report-detail-avatar">

          <i
            data-lucide="user-round"
          ></i>

        </div>


        <div class="report-detail-identity-content">

          <div class="report-detail-label">
            Penerima Manfaat
          </div>

          <div class="report-detail-name">
            ${nama}
          </div>

          <div class="report-detail-nik">
            NIK ${nik}
          </div>

        </div>


        <div class="report-detail-identity-status">

          ${statusHtml}

        </div>

      </div>


      <!-- ==================================================
           PROGRAM
      =================================================== -->

      <div class="report-detail-section">

        <div class="report-detail-section-title">

          <i
            data-lucide="target"
          ></i>

          Informasi Program

        </div>


        <div class="report-detail-grid">

          <div class="report-detail-field">

            <div class="report-detail-field-label">
              Program
            </div>

            <div class="report-detail-field-value">
              ${program}
            </div>

          </div>


          <div class="report-detail-field">

            <div class="report-detail-field-label">
              Periode
            </div>

            <div class="report-detail-field-value">
              ${periode}
            </div>

          </div>


          <div class="report-detail-field">

            <div class="report-detail-field-label">
              Desa
            </div>

            <div class="report-detail-field-value">
              ${desa}
            </div>

          </div>


          <div class="report-detail-field">

            <div class="report-detail-field-label">
              Tanggal Penetapan
            </div>

            <div class="report-detail-field-value">
              ${tanggalPenetapan}
            </div>

          </div>

        </div>

      </div>


      <!-- ==================================================
           IDENTIFIER
      =================================================== -->

      <div class="report-detail-section">

        <div class="report-detail-section-title">

          <i
            data-lucide="fingerprint"
          ></i>

          Identitas Data

        </div>


        <div class="report-detail-grid">

          <div class="report-detail-field">

            <div class="report-detail-field-label">
              ID Penerima
            </div>

            <div class="report-detail-field-value report-detail-code">
              ${idPenerimaValue}
            </div>

          </div>


          <div class="report-detail-field">

            <div class="report-detail-field-label">
              ID Penduduk
            </div>

            <div class="report-detail-field-value report-detail-code">
              ${idPenduduk}
            </div>

          </div>


          <div class="report-detail-field">

            <div class="report-detail-field-label">
              ID Program
            </div>

            <div class="report-detail-field-value report-detail-code">
              ${idProgram}
            </div>

          </div>


          <div class="report-detail-field">

            <div class="report-detail-field-label">
              Status
            </div>

            <div class="report-detail-field-value">
              ${statusHtml}
            </div>

          </div>

        </div>

      </div>


      <!-- ==================================================
           CATATAN
      =================================================== -->

      <div class="report-detail-section">

        <div class="report-detail-section-title">

          <i
            data-lucide="file-text"
          ></i>

          Catatan

        </div>


        <div class="report-detail-note">

          ${catatan}

        </div>

      </div>

    </div>

  `;

    /* ========================================================
     FOOTER
  ======================================================== */

    const footer = `

        <button
            type="button"
            class="btn btn-secondary"
            onclick="Modal.close()"
        >
            Tutup
        </button>


        <button
            type="button"
            class="btn btn-primary"
            onclick="Report.printDetail('${escapeHtml(row.ID_PENERIMA || "")}')"
        >
            <span class="btn-icon">▣</span>
            Cetak Detail
        </button>

        `;

    /* ========================================================
     OPEN GLOBAL MODAL
  ======================================================== */

    Modal.open({
      title: "Detail Penerima Manfaat",

      body: body,

      footer: footer,

      size: "lg",
    });
  }

  /* ==========================================================
   PRINT DETAIL PENERIMA
========================================================== */

  /* ==========================================================
   PRINT KARTU PENERIMA MANFAAT
========================================================== */

  function printDetail(idPenerima) {
    console.log("[REPORT] Print kartu:", idPenerima);

    /* ========================================================
     CARI DATA
  ======================================================== */

    const row = state.data.find(function (item) {
      return (
        String(item.ID_PENERIMA || "").trim() ===
        String(idPenerima || "").trim()
      );
    });

    if (!row) {
      Toast.error("Data penerima tidak ditemukan.");

      return;
    }

    /* ========================================================
     DATA
  ======================================================== */

    const status = String(row.STATUS || "")
      .trim()
      .toUpperCase();

    const statusClass = status === "AKTIF" ? "aktif" : "nonaktif";

    const tanggalPenetapan = formatReportDate(row.TGL_PENETAPAN);

    const tanggalCetak = formatPrintDate(new Date());

    /* ========================================================
     REMOVE OLD CONTAINER
  ======================================================== */

    const oldContainer = document.getElementById("reportDetailPrintContainer");

    if (oldContainer) {
      oldContainer.remove();
    }

    /* ========================================================
     CREATE PRINT CONTAINER
  ======================================================== */

    const container = document.createElement("div");

    container.id = "reportDetailPrintContainer";

    container.innerHTML = `

    <div class="report-card-print-page">

      <!-- ==================================================
           LEFT HALF — KARTU
      =================================================== -->

      <div class="report-benefit-card">

        <!-- ================================================
             HEADER
        ================================================= -->

        <div class="benefit-card-header">

          <div class="benefit-card-brand">

            <div class="benefit-card-brand-title">
              COMMUNITY DEVELOPMENT
            </div>

            <div class="benefit-card-brand-subtitle">
              KARTU PENERIMA MANFAAT
            </div>

          </div>

        </div>


        <!-- ================================================
             IDENTITY
        ================================================= -->

        <div class="benefit-card-identity">

          <div class="benefit-card-identity-label">
            PENERIMA MANFAAT
          </div>


          <div class="benefit-card-identity-row">

            <div class="benefit-card-person">

              <div class="benefit-card-name">
                ${escapeHtml(row.NAMA || "-")}
              </div>

              <div class="benefit-card-nik">
                NIK ${escapeHtml(row.NIK || "-")}
              </div>

            </div>


            <div
              class="
                benefit-card-status
                ${statusClass}
              "
            >

              <span
                class="benefit-card-status-dot"
              ></span>

              ${escapeHtml(status || "-")}

            </div>

          </div>

        </div>


        <!-- ================================================
             PROGRAM INFORMATION
        ================================================= -->

        <div class="benefit-card-section">

          <div class="benefit-card-section-title">
            INFORMASI PROGRAM
          </div>


          <div class="benefit-card-grid">

            <div class="benefit-card-field">

              <span>
                Program
              </span>

              <strong>
                ${escapeHtml(row.NAMA_PROGRAM || "-")}
              </strong>

            </div>


            <div class="benefit-card-field">

              <span>
                Periode
              </span>

              <strong>
                ${escapeHtml(row.PERIODE || "-")}
              </strong>

            </div>


            <div class="benefit-card-field">

              <span>
                Desa
              </span>

              <strong>
                ${escapeHtml(row.DESA || "-")}
              </strong>

            </div>


            <div class="benefit-card-field">

              <span>
                Tanggal Penetapan
              </span>

              <strong>
                ${tanggalPenetapan}
              </strong>

            </div>

          </div>

        </div>


        <!-- ================================================
             FOOTER CARD
        ================================================= -->

        <div class="benefit-card-footer">

          <div class="benefit-card-id">

            <span>
              ID PENERIMA
            </span>

            <strong>
              ${escapeHtml(row.ID_PENERIMA || "-")}
            </strong>

          </div>


          <div class="benefit-card-signature">

            <span>
              Community Development
            </span>

            <div class="benefit-card-sign-line"></div>

            <small>
              Administrator
            </small>

          </div>

        </div>


        <!-- ================================================
             PRINT INFO
        ================================================= -->

        <div class="benefit-card-print-info">

          Dicetak ${tanggalCetak}

        </div>

      </div>


      <!-- ==================================================
           RIGHT HALF — KOSONG
      =================================================== -->

      <div class="report-card-print-empty"></div>

    </div>

  `;

    document.body.appendChild(container);

    /* ========================================================
     PRINT
  ======================================================== */

    window.setTimeout(function () {
      window.print();
    }, 150);

    /* ========================================================
     CLEANUP
  ======================================================== */

    const cleanup = function () {
      if (container) {
        container.remove();
      }

      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
  }

  /* ==========================================================
     PREVIEW
     ----------------------------------------------------------
     Sementara placeholder.
     Modal akan kita bangun setelah table stabil.
  ========================================================== */

  /* ==========================================================
   PREVIEW CETAK
========================================================== */

  function preview() {
    console.log("[REPORT] Preview cetak");

    /* ========================================================
     VALIDASI DATA
  ======================================================== */

    if (!state.data || !state.data.length) {
      Toast.error("Tidak ada data yang dapat dicetak.");

      return;
    }

    /* ========================================================
     FILTER
  ======================================================== */

    const desa = document.getElementById("reportDesaFilter")?.value || "";

    const programSelect = document.getElementById("reportProgramFilter");

    const periode = document.getElementById("reportTahunFilter")?.value || "";

    const program = programSelect
      ? programSelect.options[programSelect.selectedIndex]?.text ||
        "Semua Program"
      : "Semua Program";

    const desaLabel = desa || "Semua Desa";

    const periodeLabel = periode || "Semua Tahun";

    /* ========================================================
     TANGGAL CETAK
  ======================================================== */

    const now = new Date();

    const tanggalCetak = formatPrintDate(now);

    /* ========================================================
     SUMMARY
  ======================================================== */

    const totalPenerima = state.data.length;

    const desaSet = new Set(
      state.data.map((item) => String(item.DESA || "").trim()).filter(Boolean),
    );

    const programSet = new Set(
      state.data
        .map((item) => String(item.NAMA_PROGRAM || "").trim())
        .filter(Boolean),
    );

    const penerimaAktif = state.data.filter(
      (item) =>
        String(item.STATUS || "")
          .trim()
          .toUpperCase() === "AKTIF",
    ).length;

    /* ========================================================
     TABLE
  ======================================================== */

    const tableRows = state.data
      .map(function (row, index) {
        const status = String(row.STATUS || "")
          .trim()
          .toUpperCase();

        return `

            <tr>

              <td class="print-no">
                ${index + 1}
              </td>

              <td class="print-name">
                ${escapeHtml(row.NAMA || "-")}
              </td>

              <td>
                ${escapeHtml(row.NIK || "-")}
              </td>

              <td>
                ${escapeHtml(row.DESA || "-")}
              </td>

              <td>
                ${escapeHtml(row.NAMA_PROGRAM || "-")}
              </td>

              <td>
                <span
                  class="
                    print-status
                    ${
                      status === "AKTIF"
                        ? "print-status-active"
                        : "print-status-other"
                    }
                  "
                >
                  ${escapeHtml(status || "-")}
                </span>
              </td>

            </tr>

          `;
      })
      .join("");

    /* ========================================================
     PREVIEW BODY
  ======================================================== */

    const body = `

    <div class="report-print-preview">

      <!-- ================================================
           PAPER
      ================================================= -->

      <div class="report-print-paper">

        <!-- ==============================================
             HEADER
        =============================================== -->

        <div class="print-header">

          <div class="print-logo">

            <div class="print-logo-icon">
              <i data-lucide="landmark"></i>
            </div>

          </div>


          <div class="print-title">

            <div class="print-title-main">
              COMMUNITY DEVELOPMENT
            </div>

            <div class="print-title-sub">
              LAPORAN PENERIMA MANFAAT
            </div>

          </div>

        </div>


        <!-- ==============================================
             FILTER INFO
        =============================================== -->

        <div class="print-information">

          <div class="print-information-row">

            <span>
              Program
            </span>

            <strong>
              : ${escapeHtml(program)}
            </strong>

          </div>


          <div class="print-information-row">

            <span>
              Desa
            </span>

            <strong>
              : ${escapeHtml(desaLabel)}
            </strong>

          </div>


          <div class="print-information-row">

            <span>
              Periode
            </span>

            <strong>
              : ${escapeHtml(periodeLabel)}
            </strong>

          </div>


          <div class="print-information-row">

            <span>
              Tanggal Cetak
            </span>

            <strong>
              : ${tanggalCetak}
            </strong>

          </div>

        </div>


        <!-- ==============================================
             SUMMARY
        =============================================== -->

        <div class="print-section-title">
          Ringkasan
        </div>


        <div class="print-summary">

          <div class="print-summary-card">

            <div class="print-summary-label">
              Total Penerima
            </div>

            <div class="print-summary-value">
              ${totalPenerima}
            </div>

            <div class="print-summary-unit">
              Jiwa
            </div>

          </div>


          <div class="print-summary-card">

            <div class="print-summary-label">
              Desa Terlibat
            </div>

            <div class="print-summary-value">
              ${desaSet.size}
            </div>

            <div class="print-summary-unit">
              Desa
            </div>

          </div>


          <div class="print-summary-card">

            <div class="print-summary-label">
              Total Program
            </div>

            <div class="print-summary-value">
              ${programSet.size}
            </div>

            <div class="print-summary-unit">
              Program
            </div>

          </div>


          <div class="print-summary-card">

            <div class="print-summary-label">
              Penerima Aktif
            </div>

            <div class="print-summary-value">
              ${penerimaAktif}
            </div>

            <div class="print-summary-unit">
              Jiwa
            </div>

          </div>

        </div>


        <!-- ==============================================
             TABLE TITLE
        =============================================== -->

        <div class="print-section-title">
          Daftar Penerima Manfaat
        </div>


        <!-- ==============================================
             TABLE
        =============================================== -->

        <table class="print-table">

          <thead>

            <tr>

              <th style="width: 35px">
                No
              </th>

              <th>
                Nama
              </th>

              <th>
                NIK
              </th>

              <th>
                Desa
              </th>

              <th>
                Program
              </th>

              <th style="width: 65px">
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            ${tableRows}

          </tbody>

        </table>


        <!-- ==============================================
             FOOTER
        =============================================== -->

        <div class="print-footer">

          <span>
            Dokumen ini dibuat secara otomatis oleh
            sistem Community Development.
          </span>

          <span>
            ${tanggalCetak}
          </span>

        </div>

      </div>

    </div>

  `;

    /* ========================================================
     FOOTER MODAL
  ======================================================== */

    const footer = `

    <button
      type="button"
      class="btn btn-secondary"
      onclick="Modal.close()"
    >
      Tutup
    </button>


    <button
      type="button"
      class="btn btn-primary"
      onclick="Report.print()"
    >
      <span class="btn-icon">▣</span>
      Cetak Laporan
    </button>

  `;

    /* ========================================================
     OPEN MODAL
  ======================================================== */

    Modal.open({
      title: "Preview Laporan",

      body: body,

      footer: footer,

      size: "xl",
    });
  }

  /* ==========================================================
     EVENTS
  ========================================================== */

  function bindEvents() {
    /*
     * FILTER CHANGE
     */

    const desa = document.getElementById("reportDesaFilter");

    const program = document.getElementById("reportProgramFilter");

    const tahun = document.getElementById("reportTahunFilter");

    if (desa) {
      desa.addEventListener("change", function () {
        state.filter.DESA = String(desa.value || "").trim();
      });
    }

    if (program) {
      program.addEventListener("change", function () {
        state.filter.ID_PROGRAM = String(program.value || "").trim();
      });
    }

    if (tahun) {
      tahun.addEventListener("change", function () {
        state.filter.PERIODE = String(tahun.value || "").trim();
      });
    }

    /*
     * PAGINATION
     */

    const pagination = document.getElementById("reportPagination");

    if (pagination) {
      pagination.addEventListener("click", function (event) {
        const button = event.target.closest("[data-report-page]");

        if (!button) {
          return;
        }

        if (button.disabled) {
          return;
        }

        changePage(button.dataset.reportPage);
      });
    }

    /* ==========================================================
   DETAIL
========================================================== */

    if (!state.detailEventBound) {
      document.addEventListener("click", function (event) {
        const button = event.target.closest("[data-report-detail]");

        if (!button) {
          return;
        }

        const idPenerima = button.getAttribute("data-report-detail");

        console.log("[REPORT] Detail button clicked:", idPenerima);

        if (!idPenerima) {
          console.warn("[REPORT] ID_PENERIMA kosong.");

          return;
        }

        openDetail(idPenerima);
      });

      state.detailEventBound = true;
    }
  }

  /* ==========================================================
     HELPERS
  ========================================================== */

  function getProgramName(idProgram) {
    if (!idProgram) {
      return "Semua Program";
    }

    const program = state.program.find(function (item) {
      return String(item.ID_PROGRAM || "").trim() === String(idProgram).trim();
    });

    return program ? program.NAMA_PROGRAM || idProgram : idProgram;
  }

  function number(value) {
    return Number(value || 0).toLocaleString("id-ID");
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showLoading() {
    if (typeof Loading !== "undefined" && Loading.show) {
      Loading.show();
    }
  }

  function hideLoading() {
    if (typeof Loading !== "undefined" && Loading.hide) {
      Loading.hide();
    }
  }

  /* ==========================================================
   FORMAT REPORT DATE
========================================================== */

  function formatReportDate(value) {
    if (value === undefined || value === null || value === "") {
      return "-";
    }

    const text = String(value).trim();

    /*
     * Format YYYY-MM-DD
     */

    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      const year = Number(match[1]);

      const month = Number(match[2]);

      const day = Number(match[3]);

      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      return `${day} ${months[month - 1]} ${year}`;
    }

    return escapeHtml(text);
  }

  /* ==========================================================
   FORMAT PRINT DATE
========================================================== */

  function formatPrintDate(date) {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return `${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()} ${String(date.getHours()).padStart(
      2,
      "0",
    )}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  /* ==========================================================
   PRINT
========================================================== */

  function print() {
    console.log("[REPORT] Print laporan");

    window.print();
  }

  /* ==========================================================
     PUBLIC API
  ========================================================== */

  return {
    init,

    load,

    preview,

    print,

    openDetail,

    printDetail,
  };
})();
