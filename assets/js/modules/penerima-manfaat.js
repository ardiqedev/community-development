/**
 * ============================================================
 * COMMUNITY DEVELOPMENT
 * PENERIMA MANFAAT
 * ============================================================
 *
 * Module : PenerimaManfaat
 * Layer  : Frontend
 *
 * FINAL VERSION
 *
 * FLOW
 * ------------------------------------------------------------
 * Master Penduduk
 *        ↓
 * Pilih Desa
 *        ↓
 * Pilih Program
 *        ↓
 * Evaluasi / Eligible Penduduk
 *        ↓
 * Calon Penerima
 *        ↓
 * Checkbox
 *        ↓
 * Tetapkan sebagai Penerima
 *        ↓
 * createPenerima
 *        ↓
 * Sheet PENERIMA_MANFAAT
 *
 * ============================================================
 */

const PenerimaManfaat = (() => {
  /* ==========================================================
     CONFIG
  ========================================================== */

  const CONFIG = {
    DEFAULT_DESA: "Kawasi",

    DEFAULT_PERIODE: new Date().getFullYear(),

    CALON_PAGE_SIZE: 50,

    PENERIMA_PAGE_SIZE: 5,
  };

  /* ==========================================================
     STATE
  ========================================================== */

  const state = {
    /* --------------------------------------------------------
     DESA
  -------------------------------------------------------- */

    desa: CONFIG.DEFAULT_DESA,

    /* --------------------------------------------------------
     MASTER
  -------------------------------------------------------- */

    penduduk: [],

    pendudukLookup: new Map(),

    pendudukDesaTotal: 0,

    program: [],

    /* --------------------------------------------------------
     PENERIMA
  -------------------------------------------------------- */

    data: [],

    filtered: [],

    /* --------------------------------------------------------
     CALON
  -------------------------------------------------------- */

    calon: [],

    calonFiltered: [],

    selectedCalon: new Set(),

    calonTotal: 0,

    calonTotalPages: 0,

    calonHasNext: false,

    calonHasPrevious: false,

    /* --------------------------------------------------------
     PROGRAM AKTIF
  -------------------------------------------------------- */

    selectedProgramId: "",

    /* --------------------------------------------------------
     PAGINATION
  -------------------------------------------------------- */

    calonPage: 1,

    penerimaPage: 1,

    /* --------------------------------------------------------
     INNER TAB
  -------------------------------------------------------- */

    innerTab: "penerima",

    /* --------------------------------------------------------
     STATUS
  -------------------------------------------------------- */

    initialized: false,

    loading: false,

    candidateLoading: false,

    submitting: false,
  };

  /* ==========================================================
     INIT
  ========================================================== */

  async function init() {
    console.log("[PENERIMA MANFAAT] Init");

    /* ========================================================
     PASTIKAN DOM SUDAH TERPASANG
  ======================================================== */

    const programSelect = document.getElementById("penerimaProgramSelect");

    if (!programSelect) {
      console.warn("[PENERIMA MANFAAT] DOM belum siap.");

      return;
    }

    /* ========================================================
     FIRST LOAD
     
     MASTER + DATA hanya sekali.
  ======================================================== */

    if (!state.initialized) {
      state.initialized = true;

      await loadMaster();

      await load();

      bindEvents();
    } else {
      /* ======================================================
       MASUK KEMBALI KE MENU PENERIMA MANFAAT
       
       Jangan reload API.
       Cukup reset pilihan program.
    ====================================================== */

      resetProgramSelection();
    }

    /* ========================================================
     RENDER UI
     
     Tetap dilakukan setiap kali view masuk.
  ======================================================== */

    renderProgramSelector();

    renderInitialCandidateState();
  }

  /* ==========================================================
     BIND EVENTS
  ========================================================== */

  function bindEvents() {
    /* --------------------------------------------------------
       PROGRAM SELECT
    -------------------------------------------------------- */

    document.addEventListener("change", async (event) => {
      const programSelect = event.target.closest("#penerimaProgramSelect");

      if (!programSelect) {
        return;
      }

      const id = normalizeId(programSelect.value);

      console.log("[PENERIMA MANFAAT] Program changed:", id);

      await selectProgram(id);
    });

    /* --------------------------------------------------------
       RIGHT SEARCH
    -------------------------------------------------------- */

    const search = document.getElementById("penerimaSearch");

    if (search) {
      search.addEventListener("input", () => {
        state.penerimaPage = 1;

        applyPenerimaFilter();
      });
    }

    /* --------------------------------------------------------
       RIGHT STATUS
    -------------------------------------------------------- */

    const status = document.getElementById("penerimaStatusFilter");

    if (status) {
      status.addEventListener("change", () => {
        state.penerimaPage = 1;

        applyPenerimaFilter();
      });
    }

    /* --------------------------------------------------------
       LEGACY PROGRAM FILTER
       Hidden by current HTML.
    -------------------------------------------------------- */

    const legacyProgram = document.getElementById("penerimaProgramFilter");

    if (legacyProgram) {
      legacyProgram.addEventListener("change", () => {
        applyPenerimaFilter();
      });
    }

    /* --------------------------------------------------------
       LEGACY PERIODE FILTER
    -------------------------------------------------------- */

    const legacyPeriode = document.getElementById("penerimaPeriodeFilter");

    if (legacyPeriode) {
      legacyPeriode.addEventListener("change", () => {
        applyPenerimaFilter();
      });
    }

    /* --------------------------------------------------------
       CANDIDATE SEARCH
    -------------------------------------------------------- */

    const calonSearch = document.getElementById("penerimaCalonSearch");

    if (calonSearch) {
      calonSearch.addEventListener("input", () => {
        state.calonPage = 1;

        applyCalonFilter();
      });
    }

    /* --------------------------------------------------------
       SELECT ALL HEADER
    -------------------------------------------------------- */

    const selectAll = document.getElementById("penerimaCalonSelectAll");

    if (selectAll) {
      selectAll.addEventListener("change", () => {
        toggleSelectAllCurrentPage(selectAll.checked);
      });
    }

    /* --------------------------------------------------------
       CANDIDATE CHECKBOX
    -------------------------------------------------------- */

    const calonBody = document.getElementById("penerimaCalonTableBody");

    if (calonBody) {
      calonBody.addEventListener("change", (event) => {
        const checkbox = event.target.closest("[data-calon-checkbox]");

        if (!checkbox) {
          return;
        }

        const id = normalizeId(checkbox.dataset.id);

        if (!id) {
          return;
        }

        if (checkbox.checked) {
          state.selectedCalon.add(id);
        } else {
          state.selectedCalon.delete(id);
        }

        updateSelectionUI();
      });
    }

    /* --------------------------------------------------------
       VILLAGE TABS
    -------------------------------------------------------- */

    document.querySelectorAll(".penerima-village-tab").forEach((button) => {
      button.addEventListener("click", async () => {
        const desa = String(button.dataset.desa || "").trim();

        await changeDesa(desa);
      });
    });
  }

  /* ==========================================================
     LOAD MASTER
  ========================================================== */

  async function loadMaster() {
    try {
      /* ======================================================
       LOAD MASTER PROGRAM
    ====================================================== */

      const programResponse = await API.get("getProgram");

      /* ======================================================
       PROGRAM
    ====================================================== */

      state.program = extractArray(programResponse);

      console.log("[PENERIMA MANFAAT] Master Program:", state.program.length);

      /* ======================================================
       RESET LOOKUP
    ====================================================== */

      state.pendudukLookup = new Map();

      /* ======================================================
       UI
    ====================================================== */

      populateProgramFilter();

      renderProgramSelector();
    } catch (error) {
      console.error("[PENERIMA MANFAAT] loadMaster:", error);

      state.program = [];

      state.pendudukLookup = new Map();
    }
  }

  /* ==========================================================
     LOAD PENERIMA
     ========================================================== */

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    showLoading();

    try {
      const programId = normalizeId(state.selectedProgramId);

      if (!programId) {
        state.data = [];
        state.filtered = [];
        state.pendudukLookup = new Map();

        renderPenerimaEmpty("Pilih program terlebih dahulu.");

        return;
      }

      /* ================================================
       1. TOTAL PENDUDUK DESA
    ================================================= */

      await loadPendudukDesaCount();

      /* ================================================
       2. PENERIMA PROGRAM
    ================================================= */

      const response = await API.get("getPenerima", {
        ID_PROGRAM: programId,
      });

      if (!response || response.success !== true) {
        throw new Error(
          response?.message || "Gagal mengambil data penerima manfaat.",
        );
      }

      /* ================================================
       3. DATA PENERIMA
    ================================================= */

      state.data = Array.isArray(response.data) ? response.data : [];

      console.log("[PENERIMA MANFAAT] Loaded:", state.data.length);

      /* ================================================
       4. LOOKUP MASTER PENDUDUK
    ================================================= */

      await buildPenerimaPendudukLookup();

      /* ================================================
       5. FILTER + TABLE
    ================================================= */

      applyPenerimaFilter();

      /* ================================================
       6. SUMMARY
    ================================================= */

      updateSummary();

      updateProgramSummary();

      /* ================================================
       7. CALON PENERIMA
    ================================================= */

      await loadCalon();
    } catch (error) {
      console.error("[PENERIMA MANFAAT] load:", error);

      state.data = [];

      state.filtered = [];

      state.pendudukLookup = new Map();

      renderPenerimaEmpty(
        error?.message || "Gagal memuat data penerima manfaat.",
      );
    } finally {
      state.loading = false;
    }
  }

  async function loadPendudukDesaCount() {
    const desa = String(state.desa || "").trim();

    if (!desa) {
      state.pendudukDesaTotal = 0;
      return 0;
    }

    try {
      const response = await API.get("getPendudukCountByDesa", {
        DESA: desa,
      });

      console.log("[PENERIMA MANFAAT] Penduduk desa count:", response);

      if (!response || response.success !== true) {
        throw new Error(
          response?.message || "Gagal mengambil total penduduk desa.",
        );
      }

      const total = Number(response?.data?.total) || 0;

      state.pendudukDesaTotal = total;

      return total;
    } catch (error) {
      console.error("[PENERIMA MANFAAT] loadPendudukDesaCount:", error);

      state.pendudukDesaTotal = 0;

      throw error;
    }
  }

  /* ==========================================================
     SELECT PROGRAM
  ========================================================== */

  async function selectProgram(idProgram) {
    const id = normalizeId(idProgram);

    console.log("[PENERIMA MANFAAT] Program changed:", id);

    state.selectedProgramId = id;

    /* --------------------------------------------------------
     RESET CALON
  -------------------------------------------------------- */

    state.selectedCalon.clear();

    state.calon = [];

    state.calonFiltered = [];

    state.calonPage = 1;

    state.calonTotal = 0;

    state.calonTotalPages = 0;

    state.calonHasNext = false;

    state.calonHasPrevious = false;

    /* --------------------------------------------------------
     RESET PENERIMA
  -------------------------------------------------------- */

    state.data = [];

    state.filtered = [];

    /* --------------------------------------------------------
     UPDATE DESCRIPTION
  -------------------------------------------------------- */

    const program = getProgram(id);

    setText("penerimaProgramCode", id || "-");

    setText(
      "penerimaProgramDescription",
      program
        ? getProgramDescription(program)
        : "Pilih program untuk melihat deskripsi program.",
    );

    /* --------------------------------------------------------
     EMPTY PROGRAM
  -------------------------------------------------------- */

    if (!id) {
      renderCalonEmpty("Pilih program terlebih dahulu.");

      renderPenerimaEmpty("Pilih program terlebih dahulu.");

      return;
    }

    /* --------------------------------------------------------
     LOAD PROGRAM
  -------------------------------------------------------- */

    console.log("[PENERIMA MANFAAT] Loading program:", id);

    await load();
  }

  /* ==========================================================
     LOAD CALON
  ========================================================== */

  /* ==========================================================
   LOAD CALON PENERIMA
   SOURCE:
   ProgramKriteria.evaluateProgramPage()
========================================================== */

  async function loadCalon() {
    /* --------------------------------------------------------
     VALIDASI PROGRAM
  -------------------------------------------------------- */

    if (!state.selectedProgramId) {
      state.calon = [];

      state.calonFiltered = [];

      state.calonTotal = 0;

      state.calonTotalPages = 0;

      state.calonHasNext = false;

      state.calonHasPrevious = false;

      renderCalonEmpty("Pilih program terlebih dahulu.");

      updateCandidateUI();

      return;
    }

    /* --------------------------------------------------------
     CEGAH DOUBLE REQUEST
  -------------------------------------------------------- */

    if (state.candidateLoading) {
      return;
    }

    state.candidateLoading = true;

    renderCalonLoading();

    try {
      const programId = normalizeId(state.selectedProgramId);

      /* ------------------------------------------------------
       PAGINATION
    ------------------------------------------------------ */

      const page = Math.max(1, Number(state.calonPage) || 1);

      const pageSize = Math.max(1, Number(CONFIG.CALON_PAGE_SIZE) || 50);

      /* ======================================================
       DEBUG
    ====================================================== */

      console.log("[PENERIMA MANFAAT] =================================");

      console.log("[PENERIMA MANFAAT] Evaluate program page");

      console.log("[PENERIMA MANFAAT] ID_PROGRAM:", programId);

      console.log("[PENERIMA MANFAAT] Page:", page);

      console.log("[PENERIMA MANFAAT] Page size:", pageSize);

      /* ======================================================
       REQUEST
    ====================================================== */

      const response = await ProgramKriteria.evaluateProgramPage(
        programId,
        page,
        pageSize,
      );

      /* ======================================================
       DEBUG RESPONSE
    ====================================================== */

      console.log("[PENERIMA MANFAAT] evaluateProgramPage response:", response);

      /* ======================================================
       VALIDASI RESPONSE
    ====================================================== */

      if (!response) {
        throw new Error("Tidak ada response dari server.");
      }

      if (response.success !== true) {
        throw new Error(response.message || "Gagal mengevaluasi program.");
      }

      /* ======================================================
       SYNC CURRENT PAGE
    ====================================================== */

      state.calonPage = Number(response.page) || page;

      /* ======================================================
       METADATA PAGINATION
    ====================================================== */

      state.calonTotal = Number(response.total) || 0;

      state.calonTotalPages = Number(response.totalPages) || 0;

      state.calonHasNext = Boolean(response.hasNext);

      state.calonHasPrevious = Boolean(response.hasPrevious);

      /* ======================================================
       DATA PAGE
    ====================================================== */

      const rows = Array.isArray(response.data) ? response.data : [];

      console.log("[PENERIMA MANFAAT] Page data:", rows);

      console.log("[PENERIMA MANFAAT] Page count:", rows.length);

      console.log("[PENERIMA MANFAAT] Total penduduk:", state.calonTotal);

      console.log("[PENERIMA MANFAAT] Total pages:", state.calonTotalPages);

      /* ======================================================
       NORMALIZE
    ====================================================== */

      state.calon = normalizeEligibleRows(rows);

      /* ======================================================
       HAPUS PENERIMA AKTIF
    ====================================================== */

      removeAlreadySelected();

      /* ======================================================
       BERSIHKAN SELECTION YANG SUDAH TIDAK ADA
    ====================================================== */

      state.selectedCalon = new Set(
        [...state.selectedCalon].filter(function (id) {
          return state.calon.some(function (row) {
            return normalizeId(row.ID_PENDUDUK) === normalizeId(id);
          });
        }),
      );

      /* ======================================================
       FILTER
       
       FILTER HANYA TERHADAP PAGE AKTIF
       ====================================================== */

      applyCalonFilter();

      /* ======================================================
       UPDATE UI
    ====================================================== */

      updateCandidateUI();

      /* ======================================================
       DEBUG FINAL
    ====================================================== */

      console.log("[PENERIMA MANFAAT] Calon page:", state.calon);

      console.log("[PENERIMA MANFAAT] Current page:", state.calonPage);

      console.log("[PENERIMA MANFAAT] =================================");
    } catch (error) {
      console.error("[PENERIMA MANFAAT] loadCalon:", error);

      state.calon = [];

      state.calonFiltered = [];

      state.calonTotal = 0;

      state.calonTotalPages = 0;

      state.calonHasNext = false;

      state.calonHasPrevious = false;

      renderCalonEmpty(error?.message || "Gagal memuat calon penerima.");

      updateCandidateUI();
    } finally {
      state.candidateLoading = false;
    }
  }

  /* ==========================================================
   NORMALIZE ELIGIBLE
   ----------------------------------------------------------
   Backend evaluatePage() sudah membawa data penduduk.
   Frontend TIDAK lagi mengambil state.penduduk.
========================================================== */

  function normalizeEligibleRows(rows) {
    if (!Array.isArray(rows)) {
      return [];
    }

    return (
      rows

        .map((row) => {
          if (!row || typeof row !== "object") {
            return null;
          }

          /* ----------------------------------------------------
         ID PENDUDUK
      ---------------------------------------------------- */

          const id = getEligiblePendudukId(row);

          if (!normalizeId(id)) {
            return null;
          }

          /* ----------------------------------------------------
         DATA PENDUDUK
      ---------------------------------------------------- */

          const nama = getPendudukName(row);

          const nik = getPendudukNik(row);

          const jenisKelamin = getPendudukGender(row);

          const usia = getPendudukAge(row);

          const alamat = getPendudukAddress(row);

          const desa = getPendudukDesa(row);

          const statusPenduduk = getPendudukStatus(row);

          /* ----------------------------------------------------
         NORMALIZED ROW
      ---------------------------------------------------- */

          return {
            ...row,

            ID_PENDUDUK: id,

            namaPenduduk: nama,

            nik: nik,

            jenisKelamin: jenisKelamin,

            usia: usia,

            alamat: alamat,

            desa: desa,

            statusPenduduk: statusPenduduk,

            kelayakan: row.eligible === true ? "MEMENUHI" : "TIDAK MEMENUHI",
          };
        })

        /* ----------------------------------------------------
       HANYA YANG MEMENUHI SEMUA KRITERIA
    ---------------------------------------------------- */

        .filter(
          (row) => row && normalizeId(row.ID_PENDUDUK) && row.eligible === true,
        )
    );
  }
  /* ==========================================================
     REMOVE ALREADY SELECTED
  ========================================================== */

  function removeAlreadySelected() {
    const programId = state.selectedProgramId;

    const periode = String(CONFIG.DEFAULT_PERIODE);

    const activeIds = new Set(
      state.data

        .filter(
          (item) =>
            normalizeId(item.ID_PROGRAM) === programId &&
            String(item.PERIODE || "").trim() === periode &&
            normalizeStatus(item.STATUS) === "AKTIF",
        )

        .map((item) => normalizeId(item.ID_PENDUDUK)),
    );

    state.calon = state.calon.filter(
      (row) => !activeIds.has(normalizeId(row.ID_PENDUDUK)),
    );
  }

  /* ==========================================================
   BUILD PENERIMA PENDUDUK LOOKUP
   ----------------------------------------------------------
   Hanya mengambil penduduk yang memang digunakan oleh
   data penerima manfaat.
========================================================== */

  async function buildPenerimaPendudukLookup() {
    /* ======================================================
     AMBIL ID PENDUDUK
  ====================================================== */

    const ids = [
      ...new Set(
        state.data.map((item) => normalizeId(item.ID_PENDUDUK)).filter(Boolean),
      ),
    ];

    console.log("[PENERIMA MANFAAT] Penduduk IDs:", ids);

    /* ======================================================
     RESET LOOKUP
  ====================================================== */

    state.pendudukLookup = new Map();

    if (ids.length === 0) {
      console.log("[PENERIMA MANFAAT] Penduduk Lookup: 0");

      return;
    }

    /* ======================================================
     GET PENDUDUK
     
     getPendudukByIds() SUDAH mengembalikan ARRAY
  ====================================================== */

    const rows = await getPendudukByIds(ids);

    console.log("[PENERIMA MANFAAT] Penduduk rows:", rows);

    /* ======================================================
     VALIDASI
  ====================================================== */

    if (!Array.isArray(rows)) {
      console.error("[PENERIMA MANFAAT] Data penduduk bukan array:", rows);

      return;
    }

    /* ======================================================
     BUILD LOOKUP
  ====================================================== */

    rows.forEach(function (person) {
      if (!person || typeof person !== "object") {
        return;
      }

      const id = normalizeId(person.ID_PENDUDUK);

      if (!id) {
        return;
      }

      state.pendudukLookup.set(id, person);
    });

    console.log(
      "[PENERIMA MANFAAT] Penduduk Lookup:",
      state.pendudukLookup.size,
    );

    /* ======================================================
     ENRICH STATE.DATA
  ====================================================== */

    state.data = state.data.map(function (item) {
      const id = normalizeId(item.ID_PENDUDUK);

      const person = state.pendudukLookup.get(id);

      /* --------------------------------------------------
         DATA PENDUDUK TIDAK DITEMUKAN
      -------------------------------------------------- */

      if (!person) {
        return item;
      }

      /* --------------------------------------------------
         GABUNG DATA
      -------------------------------------------------- */

      return {
        ...item,

        /* ================================================
           IDENTITAS PENDUDUK
        ================================================ */

        ID_PENDUDUK: id,

        NAMA: person.NAMA ?? person.NAMA_PENDUDUK ?? person.NAMA_LENGKAP ?? "",

        NIK: person.NIK ?? person.NO_NIK ?? "",

        NO_KK: person.NO_KK ?? "",

        /* ================================================
           DATA PENDUDUK
        ================================================ */

        USIA: person.USIA ?? "",

        JENIS_KELAMIN: person.JENIS_KELAMIN ?? "",

        ALAMAT: person.ALAMAT ?? person.ALAMAT_LENGKAP ?? "",

        DESA: person.DESA ?? "",

        DESA_PENDUDUK: person.DESA ?? "",

        STATUS_PENDUDUK: person.STATUS_PENDUDUK ?? person.STATUS ?? "",

        /* ================================================
           DATA PENERIMA
           
           Tetap ambil dari state.data awal
        ================================================ */

        ID_PROGRAM: item.ID_PROGRAM ?? "",

        TGL_PENETAPAN: item.TGL_PENETAPAN ?? "",

        STATUS: item.STATUS ?? "AKTIF",
      };
    });

    /* ======================================================
     DEBUG FINAL
  ====================================================== */

    console.log("[PENERIMA MANFAAT] Enriched data:", state.data);
  }

  /* ==========================================================
   GET TOTAL PENDUDUK BY DESA
========================================================== */

  async function getPendudukCountByDesa(desa) {
    const targetDesa = String(desa || "").trim();

    if (!targetDesa) {
      return 0;
    }

    const response = await API.get("getPendudukCountByDesa", {
      DESA: targetDesa,
    });

    console.log("[PENERIMA MANFAAT] Penduduk count response:", response);

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal mengambil total penduduk desa.",
      );
    }

    return Number(response?.data?.total) || 0;
  }

  /* ==========================================================
     APPLY CALON FILTER
  ========================================================== */

  function applyCalonFilter() {
    const input = document.getElementById("penerimaCalonSearch");

    const search = String(input?.value || "")
      .trim()
      .toLowerCase();

    /* ======================================================
     FILTER PAGE AKTIF
  ====================================================== */

    state.calonFiltered = state.calon.filter(function (person) {
      if (!search) {
        return true;
      }

      const text = [
        person.ID_PENDUDUK,

        person.NAMA,

        person.NAMA_PENDUDUK,

        person.NAMA_LENGKAP,

        person.NIK,

        person.NO_KK,

        person.ALAMAT,

        person.RT,

        person.RW,

        person.STATUS,

        person.STATUS_PENDUDUK,

        person.DESA,
      ]

        .filter(function (value) {
          return value !== undefined && value !== null && value !== "";
        })

        .join(" ")

        .toLowerCase();

      return text.includes(search);
    });

    /* ======================================================
     JANGAN UBAH state.calonPage
     
     Pagination sekarang dikontrol server.
  ====================================================== */

    /* ======================================================
     RENDER
  ====================================================== */

    renderCalonTable();

    renderCalonPagination();

    updateCandidateUI();
  }

  /* ==========================================================
     RENDER CALON TABLE
  ========================================================== */

  function renderCalonTable() {
    const tbody = document.getElementById("penerimaCalonTableBody");

    if (!tbody) {
      return;
    }

    /* ======================================================
     VALIDASI PROGRAM
  ====================================================== */

    if (!state.selectedProgramId) {
      renderCalonEmpty("Pilih program terlebih dahulu.");

      return;
    }

    /* ======================================================
     DATA PAGE AKTIF
  ====================================================== */

    const rows = Array.isArray(state.calonFiltered) ? state.calonFiltered : [];

    if (rows.length === 0) {
      renderCalonEmpty("Tidak ada penduduk yang memenuhi kriteria.");

      return;
    }

    /* ======================================================
     RENDER
  ====================================================== */

    tbody.innerHTML = rows
      .map(function (person) {
        const id = normalizeId(person.ID_PENDUDUK);

        const checked = state.selectedCalon.has(id);

        const name = getPendudukName(person);

        const nik = getPendudukNik(person);

        const age = getPendudukAge(person);

        const address = getPendudukAddress(person);

        const status = getPendudukStatus(person) || "AKTIF";

        return `

        <tr>

          <td class="col-check">

            <input
              type="checkbox"
              data-calon-checkbox
              data-id="${escapeHtml(id)}"
              ${checked ? "checked" : ""}
            />

          </td>


          <td>
            <div class="penerima-person">
              <strong>
                ${escapeHtml(name || "-")}
              </strong>
            </div>
          </td>


          <td>
            ${escapeHtml(nik || "-")}
          </td>


          <td>
            ${escapeHtml(age ? `${age} Th` : "-")}
          </td>


          <td>
            ${escapeHtml(address || "-")}
          </td>


          <td>

            <span
              class="status-badge status-active"
            >
              ${escapeHtml(status)}
            </span>

          </td>


          <td class="col-action">

            <button
              type="button"
              class="penerima-row-detail"
              onclick="
                PenerimaManfaat.detailCalon?.(
                  '${escapeJs(id)}'
                )
              "
              title="Detail"
            >
              ›
            </button>

          </td>

        </tr>

      `;
      })
      .join("");

    /* ======================================================
     UPDATE SELECT ALL
  ====================================================== */

    updateHeaderSelectAll();
  }

  /* ==========================================================
     CALON PAGINATION
  ========================================================== */

  function renderCalonPagination() {
    const container = document.getElementById("penerimaCalonPagination");

    const info = document.getElementById("penerimaCalonPaginationInfo");

    /* ======================================================
     SERVER PAGINATION
  ====================================================== */

    const total = Number(state.calonTotal) || 0;

    const totalPages = Math.max(1, Number(state.calonTotalPages) || 1);

    const page = Math.max(
      1,
      Math.min(Number(state.calonPage) || 1, totalPages),
    );

    const size = Math.max(1, Number(CONFIG.CALON_PAGE_SIZE) || 50);

    /* ======================================================
     RANGE DATA PAGE AKTIF
  ====================================================== */

    const start = total === 0 ? 0 : (page - 1) * size + 1;

    const end = total === 0 ? 0 : Math.min(page * size, total);

    /* ======================================================
     INFO
  ====================================================== */

    if (info) {
      info.textContent =
        total === 0
          ? "Menampilkan 0 data"
          : `Menampilkan ${start} - ${end} dari ${total} data`;
    }

    /* ======================================================
     CONTAINER
  ====================================================== */

    if (!container) {
      return;
    }

    /* ======================================================
     RENDER PAGINATION
  ====================================================== */

    container.innerHTML = buildPagination(page, totalPages, "calon");
  }

  /* ==========================================================
     CHANGE CALON PAGE
  ========================================================== */
  async function changeCalonPage(page) {
    /* ======================================================
     VALIDASI TOTAL PAGE
  ====================================================== */

    const totalPages = Math.max(1, Number(state.calonTotalPages) || 1);

    /* ======================================================
     NORMALIZE PAGE
  ====================================================== */

    const next = Math.max(1, Math.min(Number(page) || 1, totalPages));

    /* ======================================================
     TIDAK PERLU REQUEST JIKA PAGE SAMA
  ====================================================== */

    if (next === Number(state.calonPage) && !state.candidateLoading) {
      return;
    }

    /* ======================================================
     SET PAGE
  ====================================================== */

    state.calonPage = next;

    /* ======================================================
     LOAD PAGE DARI SERVER
  ====================================================== */

    await loadCalon();
  }

  /* ==========================================================
     SELECT ALL CURRENT PAGE
  ========================================================== */

  function toggleSelectAllCurrentPage(checked) {
    const start = (state.calonPage - 1) * CONFIG.CALON_PAGE_SIZE;

    const rows = state.calonFiltered.slice(
      start,
      start + CONFIG.CALON_PAGE_SIZE,
    );

    rows.forEach((person) => {
      const id = normalizeId(person.ID_PENDUDUK);

      if (!id) {
        return;
      }

      if (checked) {
        state.selectedCalon.add(id);
      } else {
        state.selectedCalon.delete(id);
      }
    });

    renderCalonTable();

    updateSelectionUI();
  }

  /* ==========================================================
     SELECT ALL CALON
  ========================================================== */

  function selectAllCalon() {
    if (state.calonFiltered.length === 0) {
      return;
    }

    const allSelected = state.calonFiltered.every((person) =>
      state.selectedCalon.has(normalizeId(person.ID_PENDUDUK)),
    );

    if (allSelected) {
      state.calonFiltered.forEach((person) => {
        state.selectedCalon.delete(normalizeId(person.ID_PENDUDUK));
      });
    } else {
      state.calonFiltered.forEach((person) => {
        state.selectedCalon.add(normalizeId(person.ID_PENDUDUK));
      });
    }

    renderCalonTable();

    updateSelectionUI();
  }

  /* ==========================================================
     HEADER SELECT ALL STATE
  ========================================================== */

  function updateHeaderSelectAll() {
    const checkbox = document.getElementById("penerimaCalonSelectAll");

    if (!checkbox) {
      return;
    }

    const start = (state.calonPage - 1) * CONFIG.CALON_PAGE_SIZE;

    const rows = state.calonFiltered.slice(
      start,
      start + CONFIG.CALON_PAGE_SIZE,
    );

    if (rows.length === 0) {
      checkbox.checked = false;

      checkbox.indeterminate = false;

      return;
    }

    const selected = rows.filter((person) =>
      state.selectedCalon.has(normalizeId(person.ID_PENDUDUK)),
    ).length;

    checkbox.checked = selected === rows.length;

    checkbox.indeterminate = selected > 0 && selected < rows.length;
  }

  /* ==========================================================
     UPDATE SELECTION UI
  ========================================================== */

  function updateSelectionUI() {
    const count = state.selectedCalon.size;

    setText("penerimaSelectedCount", `(${count})`);

    setText("penerimaCalonSelectAllCount", ` (${state.calonFiltered.length}) `);

    const button = document.querySelector(".penerima-set-btn");

    if (button) {
      button.disabled =
        count === 0 || !state.selectedProgramId || state.submitting;
    }

    updateHeaderSelectAll();
  }

  /* ==========================================================
     UPDATE CANDIDATE UI
  ========================================================== */

  function updateCandidateUI() {
    setText("penerimaCalonBadge", state.calonFiltered.length);

    setText("penerimaCalonSelectAllCount", ` (${state.calonFiltered.length}) `);

    updateSelectionUI();
  }

  /* ==========================================================
     TETAPKAN PENERIMA
     ========================================================== */

  async function tetapkanPenerima() {
    if (state.submitting) {
      return;
    }

    const programId = normalizeId(state.selectedProgramId);

    if (!programId) {
      showError("Pilih program terlebih dahulu.");
      return;
    }

    const selectedIds = [...state.selectedCalon]
      .map((id) => normalizeId(id))
      .filter(Boolean);

    if (selectedIds.length === 0) {
      showError("Pilih minimal satu penduduk.");
      return;
    }

    const program = getProgram(programId);

    const periode = String(CONFIG.DEFAULT_PERIODE);

    /* ======================================================
     CONFIRM CUSTOM ENGINE
  ====================================================== */

    Confirm.open({
      title: "Konfirmasi Penetapan",

      type: "info",

      confirmText: "Tetapkan",

      cancelText: "Batal",

      message: `
      <p>
        Tetapkan
        <strong>${selectedIds.length} penduduk</strong>
        sebagai penerima manfaat?
      </p>

      <div class="confirm-detail">

        <div>
          <span>Program</span>
          <strong>
            ${escapeHtml(getProgramName(program))}
          </strong>
        </div>

        <div>
          <span>Desa</span>
          <strong>
            ${escapeHtml(state.desa || "-")}
          </strong>
        </div>

        <div>
          <span>Periode</span>
          <strong>
            ${escapeHtml(periode)}
          </strong>
        </div>

      </div>
    `,

      /* ====================================================
       JIKA USER KLIK TETAPKAN
    ==================================================== */

      onConfirm: async () => {
        state.submitting = true;

        updateSelectionUI();

        let successCount = 0;

        let failedCount = 0;

        const errors = [];

        try {
          /* ==================================================
           IMPORTANT

           Jangan Promise.all.

           Backend generate PM001, PM002, dst.
           Sequential lebih aman terhadap collision.
        ================================================== */

          for (const idPenduduk of selectedIds) {
            const payload = {
              ID_PENDUDUK: idPenduduk,

              ID_PROGRAM: programId,

              DESA: state.desa,

              PERIODE: periode,

              STATUS: "AKTIF",

              CATATAN: "",
            };

            console.log("[PENERIMA MANFAAT] Create:", payload);

            try {
              const response = await API.post("createPenerima", payload);

              console.log("[PENERIMA MANFAAT] Create response:", response);

              if (!response || response.success !== true) {
                throw new Error(
                  response?.message || "Gagal menetapkan penerima.",
                );
              }

              successCount++;
            } catch (error) {
              failedCount++;

              errors.push(`${idPenduduk}: ${error?.message || "Gagal"}`);

              console.error(
                "[PENERIMA MANFAAT] Create failed:",
                idPenduduk,
                error,
              );
            }
          }

          /* ==================================================
           RESULT
        ================================================== */

          if (successCount > 0) {
            showSuccess(
              `${successCount} penduduk berhasil ditetapkan sebagai penerima.`,
            );
          }

          if (failedCount > 0) {
            console.warn("[PENERIMA MANFAAT] Sebagian gagal:", errors);

            showError(`${failedCount} penduduk gagal ditetapkan.`);
          }

          /* ==================================================
           RESET
        ================================================== */

          state.selectedCalon.clear();

          /* ==================================================
           RELOAD
        ================================================== */

          await load();

          await loadCalon();

          applyPenerimaFilter();
        } catch (error) {
          console.error("[PENERIMA MANFAAT] tetapkanPenerima:", error);

          showError(error?.message || "Gagal menetapkan penerima manfaat.");
        } finally {
          state.submitting = false;

          updateSelectionUI();
        }
      },

      /* ====================================================
       JIKA BATAL
    ==================================================== */

      onCancel: () => {
        console.log("[PENERIMA MANFAAT] Penetapan dibatalkan.");
      },
    });
  }

  /* ==========================================================
     APPLY PENERIMA FILTER
  ========================================================== */

  function applyPenerimaFilter() {
    const search = String(
      document.getElementById("penerimaSearch")?.value || "",
    )
      .trim()
      .toLowerCase();

    const status = normalizeStatus(
      document.getElementById("penerimaStatusFilter")?.value,
    );

    const legacyProgram = normalizeId(
      document.getElementById("penerimaProgramFilter")?.value,
    );

    const legacyPeriode = String(
      document.getElementById("penerimaPeriodeFilter")?.value || "",
    ).trim();

    state.filtered = state.data.filter((item) => {
      /* --------------------------------------------------
       PROGRAM
    -------------------------------------------------- */

      if (legacyProgram && normalizeId(item.ID_PROGRAM) !== legacyProgram) {
        return false;
      }

      /* --------------------------------------------------
       PERIODE
    -------------------------------------------------- */

      if (
        legacyPeriode &&
        String(item.PERIODE || "").trim() !== legacyPeriode
      ) {
        return false;
      }

      /* --------------------------------------------------
       STATUS
    -------------------------------------------------- */

      const itemStatus = normalizeStatus(item.STATUS);

      /*
       * Default hanya AKTIF.
       *
       * Jika filter status dipilih,
       * gunakan status tersebut.
       */
      if (status) {
        if (itemStatus !== status) {
          return false;
        }
      } else {
        if (itemStatus !== "AKTIF") {
          return false;
        }
      }

      /* --------------------------------------------------
       SEARCH
    -------------------------------------------------- */

      if (search) {
        const person = getPenduduk(item.ID_PENDUDUK);

        const program = getProgram(item.ID_PROGRAM);

        const text = [
          item.ID_PENERIMA,

          item.ID_PENDUDUK,

          item.ID_PROGRAM,

          item.DESA,

          item.PERIODE,

          item.STATUS,

          item.CATATAN,

          getPendudukName(person),

          getPendudukNik(person),

          getPendudukNoKK(person),

          getProgramName(program),

          getProgramCategory(program),
        ]

          .filter(Boolean)

          .join(" ")

          .toLowerCase();

        if (!text.includes(search)) {
          return false;
        }
      }

      return true;
    });

    state.penerimaPage = 1;

    renderPenerimaTable();

    renderPenerimaPagination();
  }

  /* ==========================================================
     RENDER PENERIMA TABLE
  ========================================================== */

  function renderPenerimaTable() {
    const tbody = document.getElementById("penerimaTableBody");

    if (!tbody) {
      return;
    }

    if (state.filtered.length === 0) {
      renderPenerimaEmpty(
        state.selectedProgramId
          ? "Belum ada penerima manfaat untuk program ini."
          : "Belum ada data penerima manfaat.",
      );

      return;
    }

    const start = (state.penerimaPage - 1) * CONFIG.PENERIMA_PAGE_SIZE;

    const rows = state.filtered.slice(start, start + CONFIG.PENERIMA_PAGE_SIZE);

    tbody.innerHTML = rows
      .map((item, index) => {
        const person = getPenduduk(item.ID_PENDUDUK);

        /* ======================================================
         NAMA
      ====================================================== */

        const nama =
          getPendudukName(person) || item.NAMA || item.NAMA_PENDUDUK || "-";

        /* ======================================================
         NIK
      ====================================================== */

        const nik = getPendudukNik(person) || item.NIK || "-";

        /* ======================================================
         STATUS
      ====================================================== */

        const status = normalizeStatus(item.STATUS);

        const statusClass =
          status === "AKTIF" ? "status-active" : "status-inactive";

        /* ======================================================
         NOMOR
      ====================================================== */

        const globalIndex = start + index + 1;

        /* ======================================================
         RENDER
      ====================================================== */

        return `

        <tr>

          <!-- NO -->

          <td data-label="No">
            ${globalIndex}
          </td>


          <!-- NAMA PENDUDUK -->

          <td data-label="Nama Penduduk">

            <div class="penerima-person">

              <div>
                <strong>
                  ${escapeHtml(nama)}
                </strong>
              </div>

            </div>

          </td>


          <!-- NIK -->

          <td data-label="NIK">
            ${escapeHtml(nik)}
          </td>


          <!-- TGL PENETAPAN -->

          <td data-label="Tgl Penetapan">
            ${formatDate(item.TGL_PENETAPAN)}
          </td>


          <!-- STATUS -->

          <td data-label="Status">

            <span
              class="status-badge ${statusClass}"
            >
              ${escapeHtml(status || "-")}
            </span>

          </td>


          <!-- AKSI -->

          <td data-label="Aksi">

            <div class="penerima-row-actions">

              <button
                type="button"
                class="penerima-action-view"
                onclick="
                  PenerimaManfaat.openDetail?.(
                    '${escapeJs(item.ID_PENERIMA)}'
                  )
                "
                title="Detail"
              >
                ◉
              </button>

              <button
                type="button"
                class="penerima-action-cancel"
                onclick="
                  PenerimaManfaat.remove?.(
                    '${escapeJs(item.ID_PENERIMA)}'
                  )
                "
                title="Batalkan Penerima"
                aria-label="Batalkan Penerima"
              >
                ↶
              </button>

            </div>

          </td>

        </tr>

      `;
      })
      .join("");
  }

  /* ==========================================================
     PENERIMA PAGINATION
  ========================================================== */

  function renderPenerimaPagination() {
    const container = document.getElementById("penerimaPagination");

    const info = document.querySelector(".penerima-pagination-info");

    /* ======================================================
     TOTAL DATA
  ====================================================== */

    const total = Array.isArray(state.filtered) ? state.filtered.length : 0;

    /* ======================================================
     PAGE SIZE
  ====================================================== */

    const size = Math.max(1, Number(CONFIG.PENERIMA_PAGE_SIZE) || 10);

    /* ======================================================
     TOTAL PAGES
  ====================================================== */

    const totalPages = total > 0 ? Math.ceil(total / size) : 0;

    /* ======================================================
     CURRENT PAGE
  ====================================================== */

    let page = Number(state.penerimaPage) || 1;

    if (totalPages === 0) {
      page = 1;
    } else {
      page = Math.max(1, Math.min(page, totalPages));
    }

    state.penerimaPage = page;

    /* ======================================================
     RANGE
  ====================================================== */

    const start = total === 0 ? 0 : (page - 1) * size + 1;

    const end = total === 0 ? 0 : Math.min(page * size, total);

    /* ======================================================
     INFO
  ====================================================== */

    if (info) {
      info.textContent =
        total === 0
          ? "Menampilkan 0 data"
          : `Menampilkan ${start} - ${end} dari ${total} data`;
    }

    /* ======================================================
     PAGINATION
  ====================================================== */

    if (container) {
      if (totalPages <= 1) {
        container.innerHTML = "";
      } else {
        container.innerHTML = buildPagination(page, totalPages, "penerima");
      }
    }
  }

  /* ==========================================================
     CHANGE PENERIMA PAGE
  ========================================================== */

  function changePenerimaPage(page) {
    const total = Array.isArray(state.filtered) ? state.filtered.length : 0;

    const size = Math.max(1, Number(CONFIG.PENERIMA_PAGE_SIZE) || 10);

    const totalPages = total > 0 ? Math.ceil(total / size) : 0;

    if (totalPages === 0) {
      state.penerimaPage = 1;

      renderPenerimaTable();

      renderPenerimaPagination();

      return;
    }

    const nextPage = Math.max(1, Math.min(Number(page) || 1, totalPages));

    if (nextPage === Number(state.penerimaPage)) {
      return;
    }

    state.penerimaPage = nextPage;

    renderPenerimaTable();

    renderPenerimaPagination();
  }

  /* ==========================================================
     BUILD PAGINATION
  ========================================================== */

  function buildPagination(current, total, type) {
    if (total <= 1) {
      return "";
    }

    const pages = [];

    pages.push(paginationButton(current - 1, "‹", current <= 1, type));

    const visible = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        visible.push(i);
      }
    } else {
      visible.push(1);

      if (current > 4) {
        visible.push("...");
      }

      const start = Math.max(2, current - 1);

      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        visible.push(i);
      }

      if (current < total - 3) {
        visible.push("...");
      }

      visible.push(total);
    }

    visible.forEach((page) => {
      if (page === "...") {
        pages.push(`<span class="pagination-ellipsis">…</span>`);

        return;
      }

      pages.push(paginationButton(page, page, false, type, page === current));
    });

    pages.push(paginationButton(current + 1, "›", current >= total, type));

    return pages.join("");
  }

  /* ==========================================================
     PAGINATION BUTTON
  ========================================================== */

  function paginationButton(page, label, disabled, type, active = false) {
    return `

      <button
        type="button"
        class="pagination-btn ${active ? "active" : ""}"
        ${disabled ? "disabled" : ""}
        onclick="PenerimaManfaat.changePage?.('${type}', ${page})"
      >
        ${label}
      </button>

    `;
  }

  /* ==========================================================
     GENERIC CHANGE PAGE
  ========================================================== */

  function changePage(type, page) {
    if (type === "calon") {
      changeCalonPage(page);

      return;
    }

    changePenerimaPage(page);
  }

  /* ==========================================================
     SUMMARY
  ========================================================== */

  function updateSummary() {
    const total = state.data.length;

    const aktif = state.data.filter(
      (item) => normalizeStatus(item.STATUS) === "AKTIF",
    ).length;

    const programs = new Set(
      state.data.map((item) => normalizeId(item.ID_PROGRAM)).filter(Boolean),
    );

    const periods = new Set(
      state.data
        .map((item) => String(item.PERIODE || "").trim())
        .filter(Boolean),
    );

    setText("penerimaTotal", total);

    setText("penerimaAktif", aktif);

    setText("penerimaProgramTotal", programs.size);

    setText("penerimaPeriode", [...periods].sort().pop() || "-");

    setText("penerimaListBadge", state.filtered.length);
  }

  /* ==========================================================
     PROGRAM SUMMARY
  ========================================================== */

  function updateProgramSummary() {
    const programId = state.selectedProgramId;

    if (!programId) {
      setText("penerimaCalonTotal", 0);

      setText("penerimaTotal", state.data.length);

      setText("penerimaTidakMemenuhi", 0);

      setText("penerimaPendudukTotal", state.pendudukDesaTotal);

      return;
    }

    const recipients = state.data.filter(
      (item) =>
        normalizeId(item.ID_PROGRAM) === normalizeId(programId) &&
        normalizeStatus(item.STATUS) === "AKTIF",
    );

    const totalPenduduk = state.pendudukDesaTotal;

    const calon = state.calon.length;

    const ditentukan = recipients.length;

    const tidakMemenuhi = Math.max(0, totalPenduduk - calon - ditentukan);

    setText("penerimaCalonTotal", calon);

    setText("penerimaTotal", ditentukan);

    setText("penerimaTidakMemenuhi", tidakMemenuhi);

    setText("penerimaPendudukTotal", totalPenduduk);

    setText("penerimaListBadge", recipients.length);
  }

  /* ==========================================================
     CHANGE DESA
  ========================================================== */

  async function changeDesa(desa) {
    const target = String(desa || "").trim();

    if (!target) {
      return;
    }

    if (state.desa === target) {
      updateVillageTabs();

      return;
    }

    state.desa = target;

    state.selectedCalon.clear();

    state.calon = [];

    state.calonFiltered = [];

    updateVillageTabs();

    updateVillageHeader();

    await load();
  }

  /* ==========================================================
     UPDATE VILLAGE TABS
  ========================================================== */

  function updateVillageTabs() {
    document.querySelectorAll(".penerima-village-tab").forEach((button) => {
      const active = String(button.dataset.desa || "").trim() === state.desa;

      button.classList.toggle("active", active);
    });
  }

  /* ==========================================================
     UPDATE VILLAGE HEADER
  ========================================================== */

  function updateVillageHeader() {
    setText("penerimaDesaTitle", state.desa);

    setText(
      "penerimaDesaDescription",
      `Daftar penerima manfaat dari Desa ${state.desa}`,
    );
  }

  /* ==========================================================
     PROGRAM SELECTOR
  ========================================================== */

  function renderProgramSelector() {
    const select = document.getElementById("penerimaProgramSelect");

    if (!select) {
      return;
    }

    const current = state.selectedProgramId;

    console.log("[PENERIMA MANFAAT] Render Program Selector");

    console.log("[PENERIMA MANFAAT] state.program:", state.program);

    const programs = [...state.program]
      .filter(function (program) {
        console.log("[PENERIMA MANFAAT] Program filter:", {
          ID_PROGRAM: program.ID_PROGRAM,
          NAMA_PROGRAM: program.NAMA_PROGRAM,
          STATUS: program.STATUS,
          normalizedStatus: normalizeStatus(program.STATUS),
        });

        return normalizeStatus(program.STATUS) !== "NONAKTIF";
      })
      .sort(function (a, b) {
        return normalizeId(a.ID_PROGRAM).localeCompare(
          normalizeId(b.ID_PROGRAM),
          undefined,
          {
            numeric: true,
          },
        );
      });

    console.log("[PENERIMA MANFAAT] Programs setelah filter:", programs);

    select.innerHTML = `

    <option value="">
      Pilih Program
    </option>

    ${programs
      .map(function (program) {
        const id = normalizeId(program.ID_PROGRAM);

        const name = getProgramName(program);

        const category = getProgramCategory(program);

        const label = category ? `${name} - ${category}` : name;

        return `

          <option
            value="${escapeHtml(id)}"
            ${id === current ? "selected" : ""}
          >
            ${escapeHtml(label)}
          </option>

        `;
      })
      .join("")}

  `;

    console.log("[PENERIMA MANFAAT] Option count:", select.options.length);

    if (current) {
      const program = getProgram(current);

      setText("penerimaProgramCode", current);

      setText(
        "penerimaProgramDescription",
        program
          ? getProgramDescription(program)
          : "Pilih program untuk melihat deskripsi program.",
      );
    } else {
      setText("penerimaProgramCode", "-");

      setText(
        "penerimaProgramDescription",
        "Pilih program untuk melihat deskripsi program.",
      );
    }
  }

  /* ==========================================================
     LEGACY PROGRAM FILTER
  ========================================================== */

  function populateProgramFilter() {
    const select = document.getElementById("penerimaProgramFilter");

    if (!select) {
      return;
    }

    const current = select.value;

    select.innerHTML = `

      <option value="">
        Semua Program
      </option>

      ${state.program
        .map((program) => {
          const id = normalizeId(program.ID_PROGRAM);

          const name = getProgramName(program);

          return `

                <option
                  value="${escapeHtml(id)}"
                >
                  ${escapeHtml(name)}
                </option>

              `;
        })
        .join("")}

    `;

    if (
      state.program.some(
        (program) => normalizeId(program.ID_PROGRAM) === normalizeId(current),
      )
    ) {
      select.value = current;
    }
  }

  /* ==========================================================
     INITIAL CANDIDATE STATE
  ========================================================== */

  function renderInitialCandidateState() {
    if (!state.selectedProgramId) {
      renderCalonEmpty("Pilih program terlebih dahulu.");

      updateCandidateUI();
    }
  }

  /* ==========================================================
     INNER TAB
  ========================================================== */

  function changeInnerTab(tab) {
    state.innerTab = tab === "evaluasi" ? "evaluasi" : "penerima";

    document.querySelectorAll(".penerima-inner-tab").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === state.innerTab);
    });

    const penerimaContent = document.getElementById("penerimaTabContent");

    const evaluasiContent = document.getElementById("penerimaEvaluasiContent");

    if (penerimaContent) {
      penerimaContent.hidden = state.innerTab !== "penerima";
    }

    if (evaluasiContent) {
      evaluasiContent.hidden = state.innerTab !== "evaluasi";
    }

    if (state.innerTab === "evaluasi") {
      loadEvaluasiHistory();
    }
  }

  /* ==========================================================
     LOAD EVALUATION HISTORY
  ========================================================== */

  async function loadEvaluasiHistory() {
    const tbody = document.getElementById("penerimaEvaluasiTableBody");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="table-empty"
        >
          Memuat riwayat evaluasi...
        </td>

      </tr>

    `;

    /* --------------------------------------------------------
       Belum dikunci ke endpoint tertentu.

       Kita coba endpoint getEvaluasi.
    -------------------------------------------------------- */

    try {
      const response = await API.get("getEvaluasi", {
        DESA: state.desa,

        ID_PROGRAM: state.selectedProgramId || "",

        PERIODE: String(CONFIG.DEFAULT_PERIODE),
      });

      const rows = extractArray(response);

      if (rows.length === 0) {
        tbody.innerHTML = `

          <tr>

            <td
              colspan="7"
              class="table-empty"
            >
              Belum ada riwayat evaluasi.
            </td>

          </tr>

        `;

        return;
      }

      tbody.innerHTML = rows
        .map(
          (row) => `

              <tr>

                <td>
                  ${escapeHtml(row.ID_EVALUASI || "-")}
                </td>

                <td>
                  ${escapeHtml(row.PERIODE || "-")}
                </td>

                <td>
                  ${formatDate(row.TGL_EVALUASI)}
                </td>

                <td>
                  ${escapeHtml(row.TOTAL_PENDUDUK ?? 0)}
                </td>

                <td>
                  ${escapeHtml(row.MEMENUHI ?? 0)}
                </td>

                <td>
                  ${escapeHtml(row.TIDAK_MEMENUHI ?? 0)}
                </td>

                <td>
                  ${escapeHtml(row.STATUS || "-")}
                </td>

              </tr>

            `,
        )
        .join("");
    } catch (error) {
      console.warn("[PENERIMA MANFAAT] getEvaluasi:", error);

      tbody.innerHTML = `

        <tr>

          <td
            colspan="7"
            class="table-empty"
          >
            Belum ada riwayat evaluasi.
          </td>

        </tr>

      `;
    }
  }

  /* ==========================================================
     LIHAT KRITERIA
     ========================================================== */

  function lihatKriteria() {
    if (!state.selectedProgramId) {
      showError("Pilih program terlebih dahulu.");

      return;
    }

    window.location.href = `?page=program-kriteria&id=${encodeURIComponent(
      state.selectedProgramId,
    )}`;
  }

  /* ==========================================================
     DETAIL CALON
  ========================================================== */

  function detailCalon(id) {
    const target = normalizeId(id);

    if (!target) {
      return;
    }

    const person =
      state.calon.find((row) => normalizeId(row.ID_PENDUDUK) === target) ||
      null;

    if (!person) {
      showError("Data penduduk tidak ditemukan pada halaman aktif.");

      return;
    }

    const name = getPendudukName(person);

    const nik = getPendudukNik(person);

    alert(
      `Penduduk\n\n` +
        `Nama: ${name || "-"}\n` +
        `ID: ${target || "-"}\n` +
        `NIK: ${nik || "-"}\n` +
        `Desa: ${getPendudukDesa(person) || "-"}`,
    );
  }

  /* ==========================================================
     OPEN DETAIL PENERIMA
  ========================================================== */

  function openDetail(id) {
    const row = state.data.find(
      (item) => normalizeId(item.ID_PENERIMA) === normalizeId(id),
    );

    if (!row) {
      showError("Data penerima tidak ditemukan.");

      return;
    }

    const person = getPenduduk(row.ID_PENDUDUK);

    const program = getProgram(row.ID_PROGRAM);

    const name = getPendudukName(person);

    const programName = getProgramName(program);

    alert(
      `Penerima Manfaat\n\n` +
        `ID Penerima : ${row.ID_PENERIMA || "-"}\n` +
        `Penduduk    : ${name || "-"}\n` +
        `Program     : ${programName || "-"}\n` +
        `Desa        : ${row.DESA || "-"}\n` +
        `Periode     : ${row.PERIODE || "-"}\n` +
        `Status      : ${row.STATUS || "-"}`,
    );
  }

  /* ==========================================================
     REMOVE
  ========================================================== */

  async function remove(id) {
    if (!id) {
      return;
    }

    const row = state.data.find(
      (item) => normalizeId(item.ID_PENERIMA) === normalizeId(id),
    );

    if (!row) {
      showError("Data penerima tidak ditemukan.");

      return;
    }

    const confirmed = window.confirm(
      `Batalkan penerima ${id}?\n\n` +
        `Status penerima akan diubah menjadi NONAKTIF.\n` +
        `Data tidak akan dihapus dan dapat ditetapkan kembali.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await API.post("cancelPenerima", {
        ID_PENERIMA: row.ID_PENERIMA,
      });

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Gagal membatalkan penerima.");
      }

      showSuccess(response.message || "Penerima berhasil dibatalkan.");

      await load();
    } catch (error) {
      console.error("[PENERIMA MANFAAT] cancel:", error);

      showError(error?.message || "Gagal membatalkan penerima.");
    }
  }

  /* ==========================================================
     OPEN CREATE
     ========================================================== */

  function openCreate() {
    if (state.selectedProgramId) {
      showError("Penetapan penerima dilakukan melalui daftar calon penerima.");

      return;
    }

    showError("Pilih program terlebih dahulu.");
  }

  /* ==========================================================
     OPEN EDIT
     ========================================================== */

  function openEdit(id) {
    console.log("[PENERIMA MANFAAT] openEdit:", id);
  }

  /* ==========================================================
     RESET FILTER
  ========================================================== */

  function resetFilter() {
    const search = document.getElementById("penerimaSearch");

    const status = document.getElementById("penerimaStatusFilter");

    const program = document.getElementById("penerimaProgramFilter");

    const periode = document.getElementById("penerimaPeriodeFilter");

    if (search) {
      search.value = "";
    }

    if (status) {
      status.value = "";
    }

    if (program) {
      program.value = "";
    }

    if (periode) {
      periode.value = "";
    }

    state.penerimaPage = 1;

    applyPenerimaFilter();
  }

  /* ==========================================================
     TOGGLE CALON FILTER
  ========================================================== */

  function toggleCalonFilter() {
    const input = document.getElementById("penerimaCalonSearch");

    if (input) {
      input.focus();
    }
  }

  /* ==========================================================
     RESET / RELOAD
  ========================================================== */

  async function refresh() {
    await load();
  }

  /* ==========================================================
     SHOW LOADING
  ========================================================== */

  function showLoading() {
    const tbody = document.getElementById("penerimaTableBody");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="table-empty"
        >
          Memuat data penerima manfaat...
        </td>

      </tr>

    `;
  }

  /* ==========================================================
     CALON LOADING
  ========================================================== */

  function renderCalonLoading() {
    const tbody = document.getElementById("penerimaCalonTableBody");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="table-empty"
        >
          Memuat calon penerima...
        </td>

      </tr>

    `;
  }

  /* ==========================================================
     CALON EMPTY
  ========================================================== */

  function renderCalonEmpty(message) {
    const tbody = document.getElementById("penerimaCalonTableBody");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="table-empty"
        >
          ${escapeHtml(message)}
        </td>

      </tr>

    `;

    renderCalonPagination();
  }

  /* ==========================================================
     PENERIMA EMPTY
  ========================================================== */

  function renderPenerimaEmpty(message) {
    const tbody = document.getElementById("penerimaTableBody");

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
  }

  /* ==========================================================
   GET PENDUDUK
   ----------------------------------------------------------
   Lookup hanya dari penduduk yang memang dibutuhkan
   oleh halaman Penerima Manfaat.
========================================================== */

  function getPenduduk(id) {
    const target = normalizeId(id);

    if (!target) {
      return null;
    }

    return state.pendudukLookup?.get(target) || null;
  }

  /* ==========================================================
     GET PROGRAM
  ========================================================== */

  function getProgram(id) {
    const target = normalizeId(id);

    if (!target) {
      return null;
    }

    return (
      state.program.find(
        (program) => normalizeId(program.ID_PROGRAM) === target,
      ) || null
    );
  }

  /* ==========================================================
     GET PENDUDUK ID
  ========================================================== */

  function getPendudukId(person) {
    if (!person) {
      return "";
    }

    return String(
      person.ID_PENDUDUK ?? person.idPenduduk ?? person.ID ?? person.id ?? "",
    ).trim();
  }

  /* ==========================================================
     GET ELIGIBLE ID
  ========================================================== */

  function getEligiblePendudukId(row) {
    if (!row) {
      return "";
    }

    return String(
      row.ID_PENDUDUK ??
        row.idPenduduk ??
        row.PENDUDUK_ID ??
        row.ID ??
        row.id ??
        "",
    ).trim();
  }

  /* ==========================================================
     GET NAME
  ========================================================== */

  function getPendudukName(person) {
    if (!person) {
      return "";
    }

    return String(
      person.NAMA ??
        person.NAMA_PENDUDUK ??
        person.NAMA_LENGKAP ??
        person.NAMA_WARGA ??
        person.NAMA_PENERIMA ??
        "",
    ).trim();
  }

  /* ==========================================================
     GET NIK
  ========================================================== */

  function getPendudukNik(person) {
    if (!person) {
      return "";
    }

    return String(person.NIK ?? person.NO_NIK ?? person.NOMOR_NIK ?? "").trim();
  }

  /* ==========================================================
     GET NO KK
  ========================================================== */

  function getPendudukNoKK(person) {
    if (!person) {
      return "";
    }

    return String(person.NO_KK ?? person.NOMOR_KK ?? person.KK ?? "").trim();
  }

  /* ==========================================================
     GET GENDER
  ========================================================== */

  function getPendudukGender(person) {
    if (!person) {
      return "";
    }

    return String(
      person.JENIS_KELAMIN ?? person.GENDER ?? person.JK ?? "",
    ).trim();
  }

  /* ==========================================================
     GET DESA
  ========================================================== */

  function getPendudukDesa(person) {
    if (!person) {
      return "";
    }

    return String(
      person.DESA ??
        person.NAMA_DESA ??
        person.KELURAHAN ??
        person.DESAKELURAHAN ??
        "",
    ).trim();
  }

  /* ==========================================================
     GET STATUS PENDUDUK
  ========================================================== */

  function getPendudukStatus(person) {
    if (!person) {
      return "";
    }

    return String(
      person.STATUS ?? person.STATUS_PENDUDUK ?? person.STATUS_WARGA ?? "",
    )
      .trim()
      .toUpperCase();
  }

  /* ==========================================================
     GET AGE
  ========================================================== */

  function getPendudukAge(person) {
    if (!person) {
      return "";
    }

    const direct = person.USIA ?? person.UMUR ?? person.AGE;

    if (direct !== undefined && direct !== null && direct !== "") {
      const number = Number(String(direct).replace(/[^\d]/g, ""));

      if (Number.isFinite(number) && number > 0) {
        return number;
      }
    }

    const birth =
      person.TGL_LAHIR ??
      person.TANGGAL_LAHIR ??
      person.TANGGAL_LAHIR_PENDUDUK ??
      person.DATE_OF_BIRTH;

    if (!birth) {
      return "";
    }

    const date = new Date(birth);

    if (isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    let age = now.getFullYear() - date.getFullYear();

    const month = now.getMonth() - date.getMonth();

    if (month < 0 || (month === 0 && now.getDate() < date.getDate())) {
      age--;
    }

    return age > 0 ? age : "";
  }

  /* ==========================================================
     GET ADDRESS
  ========================================================== */

  function getPendudukAddress(person) {
    if (!person) {
      return "";
    }

    const address = person.ALAMAT_LENGKAP ?? person.ALAMAT;

    if (address) {
      return String(address).trim();
    }

    const rt = String(person.RT || "").trim();

    const rw = String(person.RW || "").trim();

    if (rt || rw) {
      return [rt ? `RT ${rt}` : "", rw ? `RW ${rw}` : ""]

        .filter(Boolean)

        .join(" / ");
    }

    return "";
  }

  /* ==========================================================
     NORMALIZE PENDUDUK
  ========================================================== */

  function normalizePenduduk(person) {
    return {
      ...person,

      ID_PENDUDUK: getPendudukId(person),

      namaPenduduk: getPendudukName(person),

      nik: getPendudukNik(person),

      jenisKelamin: getPendudukGender(person),

      usia: getPendudukAge(person),

      alamat: getPendudukAddress(person),

      desa: getPendudukDesa(person),

      statusPenduduk: getPendudukStatus(person),

      kelayakan: "MEMENUHI",
    };
  }

  /* ==========================================================
     PROGRAM HELPERS
  ========================================================== */

  function getProgramName(program) {
    if (!program) {
      return "";
    }

    return String(
      program.NAMA_PROGRAM ?? program.NAMA ?? program.NAMA_PROG ?? "",
    ).trim();
  }

  function getProgramCategory(program) {
    if (!program) {
      return "";
    }

    return String(
      program.KATEGORI ??
        program.KATEGORI_PROGRAM ??
        program.NAMA_KATEGORI ??
        "",
    ).trim();
  }

  function getProgramDescription(program) {
    if (!program) {
      return "";
    }

    return String(
      program.DESKRIPSI ??
        program.DESKRIPSI_PROGRAM ??
        program.DESCRIPTION ??
        "Tidak ada deskripsi program.",
    ).trim();
  }

  /* ==========================================================
     DESA CHECK
  ========================================================== */

  function isSameDesa(person, desa) {
    const personDesa = normalizeText(getPendudukDesa(person));

    const targetDesa = normalizeText(desa);

    /* --------------------------------------------------------
       Jika master penduduk tidak mempunyai kolom desa,
       jangan buang data.
    -------------------------------------------------------- */

    if (!personDesa) {
      return true;
    }

    return personDesa === targetDesa;
  }

  /* ==========================================================
     GET PENDUDUK BY DESA
  ========================================================== */

  function getPendudukByDesa(desa) {
    if (String(desa || "").trim() === String(state.desa || "").trim()) {
      return {
        length: state.pendudukDesaTotal,
      };
    }

    return {
      length: 0,
    };
  }

  /* ==========================================================
   GET PENDUDUK BY IDS
   ----------------------------------------------------------
   Mengambil hanya penduduk yang dibutuhkan.
========================================================== */

  async function getPendudukByIds(ids) {
    const normalizedIds = [
      ...new Set(
        (Array.isArray(ids) ? ids : [])
          .map((id) => normalizeId(id))
          .filter(Boolean),
      ),
    ];

    console.log("[PENERIMA MANFAAT] getPendudukByIds:", normalizedIds);

    if (normalizedIds.length === 0) {
      return [];
    }

    const response = await API.get("getPendudukByIds", {
      ids: JSON.stringify(normalizedIds),
    });

    console.log("[PENERIMA MANFAAT] getPendudukByIds response:", response);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil data penduduk.");
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  /* ==========================================================
     NORMALIZE ID
  ========================================================== */

  function normalizeId(value) {
    return String(value ?? "")
      .trim()
      .toUpperCase();
  }

  /* ==========================================================
     NORMALIZE TEXT
  ========================================================== */

  function normalizeText(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase();
  }

  /* ==========================================================
     NORMALIZE STATUS
  ========================================================== */

  function normalizeStatus(value) {
    return String(value ?? "")
      .trim()
      .toUpperCase();
  }

  /* ==========================================================
     EXTRACT ARRAY
  ========================================================== */

  function extractArray(response) {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && Array.isArray(response.data)) {
      return response.data;
    }

    if (response && response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  }

  /* ==========================================================
     DATE
  ========================================================== */

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  /* ==========================================================
     INITIAL
  ========================================================== */

  function getInitial(name) {
    const value = String(name || "-").trim();

    if (!value) {
      return "?";
    }

    return value.charAt(0).toUpperCase();
  }

  /* ==========================================================
     SET TEXT
  ========================================================== */

  function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value ?? "";
    }
  }

  /* ==========================================================
     ESCAPE HTML
  ========================================================== */

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* ==========================================================
     ESCAPE JS
  ========================================================== */

  function escapeJs(value) {
    return String(value ?? "")
      .replaceAll("\\", "\\\\")
      .replaceAll("'", "\\'")
      .replaceAll('"', '\\"')
      .replaceAll("\n", "\\n")
      .replaceAll("\r", "\\r");
  }

  /* ==========================================================
     SUCCESS
  ========================================================== */

  function showSuccess(message) {
    if (typeof UI !== "undefined" && typeof UI.toast === "function") {
      UI.toast(message, "success");

      return;
    }

    console.log("[PENERIMA MANFAAT]", message);
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  function showError(message) {
    if (typeof UI !== "undefined" && typeof UI.toast === "function") {
      UI.toast(message, "error");

      return;
    }

    console.error("[PENERIMA MANFAAT]", message);
  }

  function resetProgramSelection() {
    /* ======================================================
     RESET PROGRAM
  ====================================================== */

    state.selectedProgramId = "";

    state.selectedCalon.clear();

    state.calon = [];

    state.calonFiltered = [];

    state.calonPage = 1;

    state.calonTotal = 0;

    state.calonTotalPages = 0;

    state.calonHasNext = false;

    state.calonHasPrevious = false;

    /* ======================================================
     RESET SELECTOR
  ====================================================== */

    const select = document.getElementById("penerimaProgramSelect");

    if (select) {
      select.value = "";
    }

    /* ======================================================
     RESET DESCRIPTION
  ====================================================== */

    setText("penerimaProgramCode", "-");

    setText(
      "penerimaProgramDescription",
      "Pilih program untuk melihat deskripsi program.",
    );

    /* ======================================================
     RESET CALON
  ====================================================== */

    renderCalonEmpty("Pilih program terlebih dahulu.");

    updateCandidateUI();

    console.log("[PENERIMA MANFAAT] Program selection reset");
  }

  /* ==========================================================
     PUBLIC
  ========================================================== */

  return {
    init,

    load,

    refresh,

    changeDesa,

    changeInnerTab,

    changePage,

    changeCalonPage,

    changePenerimaPage,

    selectAllCalon,

    toggleCalonFilter,

    tetapkanPenerima,

    resetFilter,

    lihatKriteria,

    detailCalon,

    openDetail,

    openCreate,

    openEdit,

    remove,
  };
})();
