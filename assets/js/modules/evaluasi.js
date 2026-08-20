/**
 * ============================================================
 * COMMUNITY DEVELOPMENT
 * Evaluasi Program
 * ============================================================
 *
 * Module : Evaluasi
 * Layer  : Frontend
 *
 * Responsibilities
 * - Load master program
 * - Load riwayat evaluasi
 * - Mapping program
 * - Search
 * - Filter program
 * - Filter desa
 * - Filter status
 * - Summary
 * - Render table
 * - Detail evaluasi
 *
 * API
 * - getProgram
 * - getEvaluasi
 * ============================================================
 */

const Evaluasi = (() => {
  /* ==========================================================
     STATE
  ========================================================== */

  const state = {
    data: [],

    filtered: [],

    program: [],

    initialized: false,

    loading: false,
  };

  /* ==========================================================
     INIT
  ========================================================== */

  async function init() {
    if (state.initialized) {
      return;
    }

    state.initialized = true;

    console.log("[EVALUASI] Init");

    bindEvents();

    await loadMaster();

    await load();
  }

  /* ==========================================================
     BIND EVENTS
  ========================================================== */

  function bindEvents() {
    const search = document.getElementById("evaluasiSearch");

    const programFilter = document.getElementById("evaluasiProgramFilter");

    const desaFilter = document.getElementById("evaluasiDesaFilter");

    const statusFilter = document.getElementById("evaluasiStatusFilter");

    /* SEARCH */

    if (search) {
      search.addEventListener("input", applyFilter);
    }

    /* PROGRAM */

    if (programFilter) {
      programFilter.addEventListener("change", applyFilter);
    }

    /* DESA */

    if (desaFilter) {
      desaFilter.addEventListener("change", applyFilter);
    }

    /* STATUS */

    if (statusFilter) {
      statusFilter.addEventListener("change", applyFilter);
    }
  }

  /* ==========================================================
     LOAD MASTER PROGRAM
  ========================================================== */

  async function loadMaster() {
    try {
      console.log("[EVALUASI] Loading master program...");

      const response = await API.get("getProgram");

      state.program = normalizeArray(response);

      console.log("[EVALUASI] Master Program:", state.program);

      populateProgramFilter();
    } catch (error) {
      console.error("[EVALUASI] Load master error:", error);

      state.program = [];

      populateProgramFilter();
    }
  }

  /* ==========================================================
     LOAD EVALUASI
  ========================================================== */

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    showLoading();

    try {
      console.log("[EVALUASI] Loading data...");

      const response = await API.get("getEvaluasi");

      console.log("[EVALUASI] Response:", response);

      state.data = normalizeArray(response);

      state.filtered = [...state.data];

      populateDesaFilter();

      renderSummary();

      applyFilter();

      console.log("[EVALUASI] Loaded:", state.data.length);
    } catch (error) {
      console.error("[EVALUASI] Load error:", error);

      state.data = [];

      state.filtered = [];

      renderSummary();

      renderEmpty(error?.message || "Gagal memuat data evaluasi.");

      showError(error?.message || "Gagal memuat data evaluasi.");
    } finally {
      state.loading = false;
    }
  }

  /* ==========================================================
     NORMALIZE RESPONSE
  ========================================================== */

  function normalizeArray(response) {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && Array.isArray(response.data)) {
      return response.data;
    }

    if (response && Array.isArray(response.result)) {
      return response.result;
    }

    return [];
  }

  /* ==========================================================
     POPULATE PROGRAM FILTER
  ========================================================== */

  function populateProgramFilter() {
    const select = document.getElementById("evaluasiProgramFilter");

    if (!select) {
      return;
    }

    const current = select.value;

    const programs = [...state.program].sort((a, b) => {
      const namaA = String(a.NAMA_PROGRAM || a.NAMA || a.ID_PROGRAM || "");

      const namaB = String(b.NAMA_PROGRAM || b.NAMA || b.ID_PROGRAM || "");

      return namaA.localeCompare(namaB, "id");
    });

    select.innerHTML = `
      <option value="">
        Semua Program
      </option>

      ${programs
        .map((program) => {
          const id = String(program.ID_PROGRAM || "").trim();

          if (!id) {
            return "";
          }

          const nama = String(
            program.NAMA_PROGRAM || program.NAMA || id,
          ).trim();

          return `
            <option value="${escapeHtml(id)}">
              ${escapeHtml(nama)}
            </option>
          `;
        })
        .join("")}
    `;

    if (
      current &&
      [...select.options].some((option) => option.value === current)
    ) {
      select.value = current;
    }
  }

  /* ==========================================================
     POPULATE DESA FILTER
  ========================================================== */

  function populateDesaFilter() {
    const select = document.getElementById("evaluasiDesaFilter");

    if (!select) {
      return;
    }

    const current = select.value;

    const desaSet = new Set();

    state.data.forEach((row) => {
      const desa = String(row?.DESA || "").trim();

      if (desa) {
        desaSet.add(desa);
      }
    });

    const desaList = [...desaSet].sort((a, b) => a.localeCompare(b, "id"));

    select.innerHTML = `
      <option value="">
        Semua Desa
      </option>

      ${desaList
        .map(
          (desa) => `
            <option value="${escapeHtml(desa)}">
              ${escapeHtml(desa)}
            </option>
          `,
        )
        .join("")}
    `;

    if (
      current &&
      [...select.options].some((option) => option.value === current)
    ) {
      select.value = current;
    }
  }

  /* ==========================================================
     APPLY FILTER
  ========================================================== */

  function applyFilter() {
    const search =
      document.getElementById("evaluasiSearch")?.value?.trim().toLowerCase() ||
      "";

    const program =
      document.getElementById("evaluasiProgramFilter")?.value?.trim() || "";

    const desa =
      document.getElementById("evaluasiDesaFilter")?.value?.trim() || "";

    const status = normalizeStatus(
      document.getElementById("evaluasiStatusFilter")?.value,
    );

    state.filtered = state.data.filter((row) => {
      const idEvaluasi = String(row?.ID_EVALUASI || "")
        .trim()
        .toLowerCase();

      const idProgram = String(row?.ID_PROGRAM || "")
        .trim()
        .toLowerCase();

      const namaProgram = getProgramName(row?.ID_PROGRAM).toLowerCase();

      const namaDesa = String(row?.DESA || "")
        .trim()
        .toLowerCase();

      const periode = String(row?.PERIODE || "")
        .trim()
        .toLowerCase();

      const catatan = String(row?.CATATAN || "")
        .trim()
        .toLowerCase();

      /* ====================================================
           SEARCH
        ==================================================== */

      if (search) {
        const searchable = [
          idEvaluasi,
          idProgram,
          namaProgram,
          namaDesa,
          periode,
          catatan,
        ]
          .filter(Boolean)
          .join(" ");

        if (!searchable.includes(search)) {
          return false;
        }
      }

      /* ====================================================
           PROGRAM
        ==================================================== */

      if (program && String(row?.ID_PROGRAM || "").trim() !== program) {
        return false;
      }

      /* ====================================================
           DESA
        ==================================================== */

      if (desa && String(row?.DESA || "").trim() !== desa) {
        return false;
      }

      /* ====================================================
           STATUS
        ==================================================== */

      if (status && normalizeStatus(row?.STATUS) !== status) {
        return false;
      }

      return true;
    });

    renderTable();
  }

  /* ==========================================================
     SUMMARY
  ========================================================== */

  function renderSummary() {
    const total = state.data.length;

    const selesai = state.data.filter(
      (row) => normalizeStatus(row?.STATUS) === "SELESAI",
    ).length;

    const programs = new Set(
      state.data
        .map((row) => String(row?.ID_PROGRAM || "").trim())
        .filter(Boolean),
    );

    const periodeList = state.data
      .map((row) => String(row?.PERIODE || "").trim())
      .filter(Boolean);

    const periode = getLatestValue(periodeList);

    setText("evaluasiTotal", formatNumber(total));

    setText("evaluasiSelesai", formatNumber(selesai));

    setText("evaluasiProgram", formatNumber(programs.size));

    setText("evaluasiPeriode", periode || "-");
  }

  /* ==========================================================
     RENDER TABLE
  ========================================================== */

  function renderTable() {
    const tbody = document.getElementById("evaluasiTableBody");

    if (!tbody) {
      return;
    }

    if (!state.filtered.length) {
      renderEmpty(
        state.data.length
          ? "Tidak ada data evaluasi yang sesuai dengan filter."
          : "Belum ada data evaluasi.",
      );

      return;
    }

    tbody.innerHTML = state.filtered
      .map((row, index) => renderRow(row, index))
      .join("");

    refreshIcons();
  }

  /* ==========================================================
     RENDER ROW
  ========================================================== */

  function renderRow(row, index) {
    const idEvaluasi = String(row?.ID_EVALUASI || "-").trim();

    const idProgram = String(row?.ID_PROGRAM || "-").trim();

    const namaProgram = getProgramName(idProgram);

    const desa = String(row?.DESA || "-").trim();

    const periode = String(row?.PERIODE || "-").trim();

    const tanggal = formatDate(row?.TGL_EVALUASI);

    const totalPenduduk = formatNumber(row?.TOTAL_PENDUDUK);

    const totalMemenuhi = formatNumber(row?.TOTAL_MEMENUHI);

    const totalTidakMemenuhi = formatNumber(row?.TOTAL_TIDAK_MEMENUHI);

    const status = normalizeStatus(row?.STATUS);

    return `
      <tr>

        <!-- NO -->

        <td data-label="No">
          ${index + 1}
        </td>

        <!-- ID EVALUASI -->

        <td data-label="ID Evaluasi">

          <strong class="text-primary">
            ${escapeHtml(idEvaluasi)}
          </strong>

        </td>

        <!-- PROGRAM -->

        <td data-label="Program">

          <div class="evaluasi-program-cell">

            <strong>
              ${escapeHtml(namaProgram)}
            </strong>

            <small>
              ${escapeHtml(idProgram)}
            </small>

          </div>

        </td>

        <!-- DESA -->

        <td data-label="Desa">
          ${escapeHtml(desa)}
        </td>

        <!-- PERIODE -->

        <td data-label="Periode">
          ${escapeHtml(periode)}
        </td>

        <!-- TGL EVALUASI -->

        <td data-label="Tgl Evaluasi">
          ${escapeHtml(tanggal)}
        </td>

        <!-- PENDUDUK -->

        <td data-label="Penduduk">
          ${escapeHtml(totalPenduduk)}
        </td>

        <!-- MEMENUHI -->

        <td data-label="Memenuhi">

          <span
            class="evaluasi-count-success"
          >
            ${escapeHtml(totalMemenuhi)}
          </span>

        </td>

        <!-- TIDAK MEMENUHI -->

        <td data-label="Tidak Memenuhi">

          <span
            class="evaluasi-count-danger"
          >
            ${escapeHtml(totalTidakMemenuhi)}
          </span>

        </td>

        <!-- STATUS -->

        <td data-label="Status">

          ${renderStatus(status)}

        </td>

        <!-- AKSI -->

        <td data-label="Aksi">

          <div class="table-actions">

            <button
              type="button"
              class="btn btn-secondary btn-sm"
              onclick="Evaluasi.detail('${escapeJs(idEvaluasi)}')"
              title="Lihat detail evaluasi"
            >

              <i
                data-lucide="eye"
                style="
                  width:15px;
                  height:15px;
                "
              ></i>

              <span>Lihat</span>

            </button>

          </div>

        </td>

      </tr>
    `;
  }

  /* ==========================================================
     RENDER STATUS
  ========================================================== */

  function renderStatus(status) {
    const normalized = normalizeStatus(status);

    let className = "status-badge";

    if (normalized === "SELESAI") {
      className += " status-active";
    } else if (normalized === "PROSES") {
      className += " status-warning";
    } else {
      className += " status-inactive";
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
     DETAIL
  ========================================================== */

  function detail(idEvaluasi) {
    const target = String(idEvaluasi ?? "").trim();

    const row = state.data.find(
      (item) => String(item?.ID_EVALUASI ?? "").trim() === target,
    );

    if (!row) {
      showError("Data evaluasi tidak ditemukan.");

      return;
    }

    const namaProgram = getProgramName(row.ID_PROGRAM);

    const content = `
      <div class="evaluasi-detail">

        <!-- ==========================================
             DETAIL INFORMATION
        =========================================== -->

        <div class="evaluasi-detail-grid">

          <div>
            <span class="stat-label">
              ID Evaluasi
            </span>

            <strong>
              ${escapeHtml(row.ID_EVALUASI || "-")}
            </strong>
          </div>

          <div>
            <span class="stat-label">
              Program
            </span>

            <strong>
              ${escapeHtml(namaProgram)}
            </strong>

            <small>
              ${escapeHtml(row.ID_PROGRAM || "-")}
            </small>
          </div>

          <div>
            <span class="stat-label">
              Desa
            </span>

            <strong>
              ${escapeHtml(row.DESA || "-")}
            </strong>
          </div>

          <div>
            <span class="stat-label">
              Periode
            </span>

            <strong>
              ${escapeHtml(row.PERIODE || "-")}
            </strong>
          </div>

          <div>
            <span class="stat-label">
              Tanggal Evaluasi
            </span>

            <strong>
              ${escapeHtml(formatDate(row.TGL_EVALUASI))}
            </strong>
          </div>

          <div>
            <span class="stat-label">
              Status
            </span>

            ${renderStatus(row.STATUS)}
          </div>

        </div>

        <!-- ==========================================
             SUMMARY
        =========================================== -->

        <div
          class="evaluasi-detail-summary"
        >

          <div>
            <span>
              Total Penduduk
            </span>

            <strong>
              ${formatNumber(row.TOTAL_PENDUDUK)}
            </strong>
          </div>

          <div>
            <span>
              Memenuhi
            </span>

            <strong>
              ${formatNumber(row.TOTAL_MEMENUHI)}
            </strong>
          </div>

          <div>
            <span>
              Tidak Memenuhi
            </span>

            <strong>
              ${formatNumber(row.TOTAL_TIDAK_MEMENUHI)}
            </strong>
          </div>

        </div>

        <!-- ==========================================
             NOTE
        =========================================== -->

        <div
          class="evaluasi-detail-note"
        >

          <strong>
            Catatan
          </strong>

          <p>
            ${escapeHtml(row.CATATAN || "Tidak ada catatan.")}
          </p>

        </div>

      </div>
    `;

    /* ========================================================
       GLOBAL MODAL ENGINE
    ======================================================== */

    if (typeof Modal !== "undefined" && typeof Modal.open === "function") {
      Modal.open({
        title: `Detail Evaluasi ${row.ID_EVALUASI}`,
        content,
      });

      refreshIcons();

      return;
    }

    /* ========================================================
       FALLBACK
    ======================================================== */

    alert(
      `Evaluasi ${row.ID_EVALUASI}\n\n` +
        `Program : ${namaProgram}\n` +
        `Desa : ${row.DESA || "-"}\n` +
        `Periode : ${row.PERIODE || "-"}\n` +
        `Tanggal : ${formatDate(row.TGL_EVALUASI)}\n` +
        `Total Penduduk : ${formatNumber(row.TOTAL_PENDUDUK)}\n` +
        `Memenuhi : ${formatNumber(row.TOTAL_MEMENUHI)}\n` +
        `Tidak Memenuhi : ${formatNumber(row.TOTAL_TIDAK_MEMENUHI)}\n` +
        `Status : ${row.STATUS || "-"}`,
    );
  }

  /* ==========================================================
     RESET FILTER
  ========================================================== */

  function resetFilter() {
    const search = document.getElementById("evaluasiSearch");

    const program = document.getElementById("evaluasiProgramFilter");

    const desa = document.getElementById("evaluasiDesaFilter");

    const status = document.getElementById("evaluasiStatusFilter");

    if (search) {
      search.value = "";
    }

    if (program) {
      program.value = "";
    }

    if (desa) {
      desa.value = "";
    }

    if (status) {
      status.value = "";
    }

    applyFilter();
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  function showLoading() {
    const tbody = document.getElementById("evaluasiTableBody");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = `
      <tr>

        <td
          colspan="11"
          class="table-empty"
        >
          Memuat data evaluasi...
        </td>

      </tr>
    `;
  }

  /* ==========================================================
     EMPTY
  ========================================================== */

  function renderEmpty(message) {
    const tbody = document.getElementById("evaluasiTableBody");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = `
      <tr>

        <td
          colspan="11"
          class="table-empty"
        >
          ${escapeHtml(message)}
        </td>

      </tr>
    `;
  }

  /* ==========================================================
     GET PROGRAM NAME
  ========================================================== */

  function getProgramName(idProgram) {
    const id = String(idProgram || "").trim();

    if (!id) {
      return "-";
    }

    const program = state.program.find(
      (row) => String(row?.ID_PROGRAM || "").trim() === id,
    );

    if (!program) {
      return id;
    }

    return String(program.NAMA_PROGRAM || program.NAMA || id).trim();
  }

  /* ==========================================================
     NORMALIZE STATUS
  ========================================================== */

  function normalizeStatus(value) {
    return String(value || "")
      .trim()
      .toUpperCase();
  }

  /* ==========================================================
     FORMAT NUMBER
  ========================================================== */

  function formatNumber(value) {
    if (value === null || value === undefined || value === "") {
      return "0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0";
    }

    return number.toLocaleString("id-ID");
  }

  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const text = String(value).trim();

    /* -----------------------------------------------
       YYYY-MM-DD
    ----------------------------------------------- */

    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      const year = Number(match[1]);

      const month = Number(match[2]);

      const day = Number(match[3]);

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      if (month >= 1 && month <= 12) {
        return `${day} ${months[month - 1]} ${year}`;
      }
    }

    /* -----------------------------------------------
       ISO DATE / DATETIME
    ----------------------------------------------- */

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    }

    return text;
  }

  /* ==========================================================
     GET LATEST VALUE
  ========================================================== */

  function getLatestValue(values) {
    if (!Array.isArray(values) || !values.length) {
      return "";
    }

    return [...values].sort((a, b) => String(b).localeCompare(String(a)))[0];
  }

  /* ==========================================================
     SET TEXT
  ========================================================== */

  function setText(id, value) {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    element.textContent = value;
  }

  /* ==========================================================
     REFRESH ICONS
  ========================================================== */

  function refreshIcons() {
    if (
      typeof lucide !== "undefined" &&
      typeof lucide.createIcons === "function"
    ) {
      lucide.createIcons();
    }
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
     ESCAPE JS
  ========================================================== */

  function escapeJs(value) {
    return String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r");
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  function showError(message) {
    if (typeof UI !== "undefined" && typeof UI.toast === "function") {
      UI.toast(message, "error");

      return;
    }

    if (typeof Toast !== "undefined" && typeof Toast.error === "function") {
      Toast.error(message);

      return;
    }

    console.error("[EVALUASI]", message);
  }

  /* ==========================================================
     PUBLIC API
  ========================================================== */

  return {
    init,

    load,

    resetFilter,

    detail,

    applyFilter,
  };
})();
