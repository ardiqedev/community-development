/**
 * ============================================================
 * COMMUNITY DEVELOPMENT
 * PROGRAM
 * ============================================================
 *
 * Module:
 * - Load Program
 * - Load Kategori
 * - Search
 * - Filter
 * - Create
 * - Update
 * - Delete
 * - Detail
 * - Kriteria
 * - Modal Engine
 * ============================================================
 */

const Program = (() => {
  /* ==========================================================
     STATE
  ========================================================== */

  const state = {
    data: [],

    kategori: [],

    filtered: [],

    // ========================================================
    // KRITERIA PROGRAM
    // ========================================================

    kriteriaByProgram: {},

    editingId: null,

    initialized: false,
  };

  /* ==========================================================
     INIT
  ========================================================== */

  async function init() {
    console.log("[PROGRAM] Init");

    bindEvents();

    await loadKategori();

    await load();

    state.initialized = true;
  }

  /* ==========================================================
     ELEMENT
  ========================================================== */

  function el(id) {
    return document.getElementById(id);
  }

  /* ==========================================================
     BIND EVENTS
  ========================================================== */

  function bindEvents() {
    const search = el("programSearch");

    if (search) {
      search.addEventListener("input", () => {
        applyFilter();
      });
    }

    const filter = el("programKategoriFilter");

    if (filter) {
      filter.addEventListener("change", () => {
        applyFilter();
      });
    }
  }

  /* ==========================================================
     LOAD KATEGORI
  ========================================================== */

  async function loadKategori() {
    try {
      console.log("[PROGRAM] Loading kategori...");

      const response = await API.get("getProgramKategori");

      console.log("[PROGRAM] Kategori response:", response);

      let rows = [];

      if (Array.isArray(response)) {
        rows = response;
      } else if (response && Array.isArray(response.data)) {
        rows = response.data;
      }

      state.kategori = rows.map(normalizeKategori).filter(Boolean);

      console.log("[PROGRAM] Kategori loaded:", state.kategori);

      renderKategori();
    } catch (error) {
      console.error("[PROGRAM] Load kategori gagal:", error);

      state.kategori = [];

      renderKategori();
    }
  }

  /* ==========================================================
     NORMALIZE KATEGORI
  ========================================================== */

  function normalizeKategori(row) {
    if (!row) {
      return "";
    }

    if (typeof row === "string") {
      return row.trim();
    }

    return String(
      row.NILAI || row.KATEGORI || row.NAMA || row.VALUE || "",
    ).trim();
  }

  /* ==========================================================
     RENDER KATEGORI
  ========================================================== */

  function renderKategori() {
    const select = el("programKategoriFilter");

    if (!select) {
      return;
    }

    const currentValue = select.value;

    select.innerHTML = `
      <option value="">Semua Kategori</option>
    `;

    state.kategori.forEach((kategori) => {
      const option = document.createElement("option");

      option.value = kategori;

      option.textContent = kategori;

      select.appendChild(option);
    });

    if (currentValue && state.kategori.includes(currentValue)) {
      select.value = currentValue;
    }
  }

  /* ==========================================================
     LOAD PROGRAM
  ========================================================== */

  async function load() {
    const container = el("programTableBody");

    if (container) {
      container.innerHTML = `
      <div class="program-grid-empty">
        <div class="program-empty-icon">
          ⟳
        </div>

        <div class="program-empty-title">
          Memuat data program...
        </div>
      </div>
    `;
    }

    try {
      console.log("[PROGRAM] Loading data...");

      const response = await API.get("getProgram");

      console.log("[PROGRAM] Program response:", response);

      let rows = [];

      if (Array.isArray(response)) {
        rows = response;
      } else if (response && Array.isArray(response.data)) {
        rows = response.data;
      }

      state.data = rows.map(normalizeProgram);

      console.log("[PROGRAM] Loaded:", state.data);

      await loadKriteriaProgram();

      applyFilter();

      updateSummary();
    } catch (error) {
      console.error("[PROGRAM] Load gagal:", error);

      state.data = [];

      updateSummary();

      render([]);

      showTableError(error.message || "Gagal memuat data program.");
    }
  }

  /* ==========================================================
     NORMALIZE PROGRAM
  ========================================================== */

  function normalizeProgram(row) {
    if (!row) {
      return {};
    }

    return {
      ID_PROGRAM: row.ID_PROGRAM || row.id_program || row.id || "",

      NAMA_PROGRAM: row.NAMA_PROGRAM || row.NAMA || row.nama_program || "",

      KATEGORI: row.KATEGORI || row.NAMA_KATEGORI || "",

      DESKRIPSI: row.DESKRIPSI || row.DESCRIPTION || "",

      STATUS: row.STATUS || "AKTIF",

      ...row,
    };
  }

  /* ==========================================================
   LOAD KRITERIA SEMUA PROGRAM
========================================================== */

  async function loadKriteriaProgram() {
    state.kriteriaByProgram = {};

    if (!Array.isArray(state.data) || state.data.length === 0) {
      return;
    }

    console.log("[PROGRAM] Loading kriteria program...");

    await Promise.all(
      state.data.map(async (program) => {
        const idProgram = String(program.ID_PROGRAM || "").trim();

        if (!idProgram) {
          return;
        }

        try {
          const response = await API.get("getProgramKriteriaByProgram", {
            ID_PROGRAM: idProgram,
          });

          let rows = [];

          if (Array.isArray(response)) {
            rows = response;
          } else if (response && Array.isArray(response.data)) {
            rows = response.data;
          }

          state.kriteriaByProgram[idProgram] = rows;

          console.log(`[PROGRAM] Kriteria ${idProgram}:`, rows);
        } catch (error) {
          console.error(`[PROGRAM] Gagal load kriteria ${idProgram}:`, error);

          state.kriteriaByProgram[idProgram] = [];
        }
      }),
    );

    console.log("[PROGRAM] Semua kriteria:", state.kriteriaByProgram);
  }

  /* ==========================================================
   RENDER KRITERIA MINI
========================================================== */

  function renderProgramKriteria(idProgram) {
    const rows = state.kriteriaByProgram[String(idProgram)] || [];

    if (!rows.length) {
      return `
      <div class="program-card-criteria-empty">
        Belum ada kriteria
      </div>
    `;
    }

    const criteria = rows
      .map((row) => {
        return String(
          row.FIELD || row.KRITERIA || row.NAMA_KRITERIA || "",
        ).trim();
      })
      .filter(Boolean);

    if (!criteria.length) {
      return `
      <div class="program-card-criteria-empty">
        Belum ada kriteria
      </div>
    `;
    }

    // Hilangkan duplikat
    const uniqueCriteria = [...new Set(criteria)];

    const visibleCriteria = uniqueCriteria.slice(0, 3);

    const remaining = uniqueCriteria.length - visibleCriteria.length;

    return `
        <div class="program-card-criteria">

            <div class="program-card-criteria-label">
            Kriteria
            </div>

            <div class="program-card-criteria-list">

            ${visibleCriteria
              .map(
                (item) => `
                    <span class="program-card-criteria-item">
                    ${escapeHtml(item)}
                    </span>
                `,
              )
              .join("")}

            ${
              remaining > 0
                ? `
                    <span class="program-card-criteria-more">
                    +${remaining}
                    </span>
                `
                : ""
            }

            </div>

        </div>
        `;
  }

  /* ==========================================================
     FILTER
  ========================================================== */

  function applyFilter() {
    const searchEl = el("programSearch");

    const kategoriEl = el("programKategoriFilter");

    const keyword = String(searchEl ? searchEl.value : "")
      .trim()
      .toLowerCase();

    const kategori = String(kategoriEl ? kategoriEl.value : "")
      .trim()
      .toLowerCase();

    state.filtered = state.data.filter((row) => {
      const id = String(row.ID_PROGRAM || "").toLowerCase();

      const nama = String(row.NAMA_PROGRAM || "").toLowerCase();

      const kat = String(row.KATEGORI || "").toLowerCase();

      const deskripsi = String(row.DESKRIPSI || "").toLowerCase();

      const matchSearch =
        !keyword ||
        id.includes(keyword) ||
        nama.includes(keyword) ||
        kat.includes(keyword) ||
        deskripsi.includes(keyword);

      const matchKategori = !kategori || kat === kategori;

      return matchSearch && matchKategori;
    });

    render(state.filtered);
  }

  /* ==========================================================
     RENDER TABLE
  ========================================================== */

  /* ==========================================================
   RENDER PROGRAM CARD
========================================================== */

  function render(rows) {
    const container = el("programTableBody");

    if (!container) {
      console.warn("[PROGRAM] programTableBody tidak ditemukan.");

      return;
    }

    /* ========================================================
     EMPTY
  ======================================================== */

    if (!Array.isArray(rows) || rows.length === 0) {
      container.innerHTML = `
      <div class="program-grid-empty">
        <div class="program-empty-icon">
          ◎
        </div>

        <div class="program-empty-title">
          Belum ada data program
        </div>

        <div class="program-empty-text">
          Tidak ada program yang sesuai dengan pencarian atau filter.
        </div>
      </div>
    `;

      return;
    }

    /* ========================================================
     CARDS
  ======================================================== */

    container.innerHTML = rows.map((row) => renderProgramCard(row)).join("");
  }

  /* ==========================================================
   RENDER PROGRAM CARD
========================================================== */

  function renderProgramCard(row) {
    const id = String(row.ID_PROGRAM || "-").trim();

    const nama = String(row.NAMA_PROGRAM || "-").trim();

    const kategori = String(row.KATEGORI || "-").trim();

    const deskripsi = String(row.DESKRIPSI || "").trim();

    const status = String(row.STATUS || "AKTIF")
      .trim()
      .toUpperCase();

    const statusClass = status === "AKTIF" ? "status-success" : "status-muted";

    return `
    <article class="program-card">

      <!-- ==================================================
           CARD TOP
      =================================================== -->

      <div class="program-card-top">

        <span class="program-card-id">
          ${escapeHtml(id)}
        </span>

        <span class="status-badge ${statusClass}">
          ${escapeHtml(status)}
        </span>

      </div>


      <!-- ==================================================
           TITLE
      =================================================== -->

      <div class="program-card-title">
        ${escapeHtml(nama)}
      </div>


      <!-- ==================================================
           DESCRIPTION
      =================================================== -->

      <div class="program-card-description">

        ${deskripsi ? escapeHtml(deskripsi) : "Tidak ada deskripsi program."}

      </div>


      <!-- ==================================================
           CATEGORY
      =================================================== -->

      <div class="program-card-category">

        <span class="program-card-category-icon">
          ◉
        </span>

        <span>
          ${escapeHtml(kategori)}
        </span>

      </div>


      <!-- ==================================================
           KRITERIA MINI
      =================================================== -->

      ${renderProgramKriteria(id)}


      <!-- ==================================================
           ACTIONS
      =================================================== -->

      <div class="program-card-actions">

        <!-- KRITERIA -->

        <button
          type="button"
          class="program-card-btn program-card-btn-detail"
          onclick="
            Program.openDetail(
              '${escapeJs(id)}'
            )
          "
        >
          <span>◉</span>
          Kriteria
        </button>


        <!-- EDIT -->

        <button
          type="button"
          class="program-card-btn program-card-btn-edit"
          onclick="
            Program.openEdit(
              '${escapeJs(id)}'
            )
          "
        >
          <span>✎</span>
          Edit
        </button>


        <!-- HAPUS -->

        <button
          type="button"
          class="program-card-btn program-card-btn-delete"
          onclick="
            Program.openDelete(
              '${escapeJs(id)}'
            )
          "
        >
          <span>⌫</span>
          Hapus
        </button>

      </div>

    </article>
  `;
  }

  /* ==========================================================
     SUMMARY
  ========================================================== */

  function updateSummary() {
    const total = state.data.length;

    const aktif = state.data.filter(
      (row) =>
        String(row.STATUS || "")
          .trim()
          .toUpperCase() === "AKTIF",
    ).length;

    const kategori = new Set(
      state.data
        .map((row) => String(row.KATEGORI || "").trim())
        .filter(Boolean),
    );

    const totalEl = el("programTotal");

    const aktifEl = el("programAktif");

    const kategoriEl = el("programKategoriTotal");

    if (totalEl) {
      totalEl.textContent = total;
    }

    if (aktifEl) {
      aktifEl.textContent = aktif;
    }

    if (kategoriEl) {
      kategoriEl.textContent = kategori.size;
    }
  }

  /* ==========================================================
     OPEN CREATE
  ========================================================== */

  function openCreate() {
    state.editingId = null;

    openModal({
      title: "Tambah Program",

      content: formHtml(),

      submitText: "Simpan",

      onSubmit: create,
    });
  }

  /* ==========================================================
     OPEN EDIT
  ========================================================== */

  function openEdit(idProgram) {
    const row = state.data.find(
      (item) => String(item.ID_PROGRAM) === String(idProgram),
    );

    if (!row) {
      Toast.error("Data program tidak ditemukan.");

      return;
    }

    state.editingId = row.ID_PROGRAM;

    openModal({
      title: "Edit Program",

      content: formHtml(row),

      submitText: "Simpan Perubahan",

      onSubmit: update,
    });
  }
  /* ==========================================================
     FORM HTML
  ========================================================== */

  function formHtml(row = {}) {
    const kategoriOptions = state.kategori
      .map((kategori) => {
        const selected =
          String(row.KATEGORI || "").trim() === String(kategori).trim()
            ? "selected"
            : "";

        return `
            <option
              value="${escapeHtml(kategori)}"
              ${selected}
            >
              ${escapeHtml(kategori)}
            </option>
          `;
      })
      .join("");

    const status = String(row.STATUS || "AKTIF")
      .trim()
      .toUpperCase();

    return `

      <form
        id="programForm"
        class="program-form"
      >

        <div class="form-group">

          <label>
            ID Program
          </label>

          <input
            type="text"
            id="programFormId"
            value="${escapeHtml(row.ID_PROGRAM || "")}"
            placeholder="Contoh: P001"
            ${row.ID_PROGRAM ? "readonly" : ""}
            required
          />

        </div>


        <div class="form-group">

          <label>
            Nama Program
          </label>

          <input
            type="text"
            id="programFormNama"
            value="${escapeHtml(row.NAMA_PROGRAM || "")}"
            placeholder="Nama program"
            required
          />

        </div>


        <div class="form-group">

          <label>
            Kategori
          </label>

          <select
            id="programFormKategori"
            required
          >

            <option value="">
              Pilih Kategori
            </option>

            ${kategoriOptions}

          </select>

        </div>


        <div class="form-group">

          <label>
            Deskripsi
          </label>

          <textarea
            id="programFormDeskripsi"
            rows="4"
            placeholder="Deskripsi program..."
          >${escapeHtml(row.DESKRIPSI || "")}</textarea>

        </div>


        <div class="form-group">

          <label>
            Status
          </label>

          <select
            id="programFormStatus"
          >

            <option
              value="AKTIF"
              ${status === "AKTIF" ? "selected" : ""}
            >
              AKTIF
            </option>

            <option
              value="NONAKTIF"
              ${status === "NONAKTIF" ? "selected" : ""}
            >
              NONAKTIF
            </option>

          </select>

        </div>

      </form>

    `;
  }

  /* ==========================================================
     CREATE
  ========================================================== */

  async function create() {
    const data = getFormData();

    validateForm(data);

    try {
      setModalLoading(true);

      const response = await API.post("createProgram", data);

      console.log("[PROGRAM] Create response:", response);

      closeModal();

      await load();

      Toast.success("Program berhasil ditambahkan.");
    } catch (error) {
      console.error("[PROGRAM] Create gagal:", error);

      Toast.error(error.message || "Gagal menambahkan program.");
    } finally {
      setModalLoading(false);
    }
  }

  /* ==========================================================
     UPDATE
  ========================================================== */

  async function update() {
    const data = getFormData();

    validateForm(data);

    data.ID_PROGRAM = state.editingId || data.ID_PROGRAM;

    try {
      setModalLoading(true);

      const response = await API.post("updateProgram", data);

      console.log("[PROGRAM] Update response:", response);

      closeModal();

      await load();

      Toast.success("Program berhasil diperbarui.");
    } catch (error) {
      console.error("[PROGRAM] Update gagal:", error);

      Toast.error(error.message || "Gagal memperbarui program.");
    } finally {
      setModalLoading(false);
    }
  }

  /* ==========================================================
     DELETE
  ========================================================== */

  function openDelete(idProgram) {
    return remove(idProgram);
  }

  async function remove(idProgram) {
    const row = state.data.find(
      (item) => String(item.ID_PROGRAM) === String(idProgram),
    );

    if (!row) {
      Toast.error("Data program tidak ditemukan.");

      return;
    }

    Confirm.open({
      title: "Hapus Program?",

      message: `
      Program
      <strong>${escapeHtml(row.NAMA_PROGRAM)}</strong>
      akan dihapus.
      <br>
      Tindakan ini tidak dapat dibatalkan.
    `,

      type: "danger",

      confirmText: "Hapus",

      cancelText: "Batal",

      onConfirm: async function () {
        try {
          const response = await API.post("deleteProgram", {
            ID_PROGRAM: idProgram,
          });

          console.log("[PROGRAM] Delete response:", response);

          await load();

          Toast.success("Program berhasil dihapus.");
        } catch (error) {
          console.error("[PROGRAM] Delete gagal:", error);

          Toast.error(error.message || "Gagal menghapus program.");
        }
      },
    });
  }

  /* ==========================================================
     GET FORM DATA
  ========================================================== */

  function getFormData() {
    return {
      ID_PROGRAM: el("programFormId")?.value.trim() || "",

      NAMA_PROGRAM: el("programFormNama")?.value.trim() || "",

      KATEGORI: el("programFormKategori")?.value.trim() || "",

      DESKRIPSI: el("programFormDeskripsi")?.value.trim() || "",

      STATUS: el("programFormStatus")?.value.trim() || "AKTIF",
    };
  }

  /* ==========================================================
     VALIDATE FORM
  ========================================================== */

  function validateForm(data) {
    if (!data.ID_PROGRAM) {
      throw new Error("ID Program wajib diisi.");
    }

    if (!data.NAMA_PROGRAM) {
      throw new Error("Nama Program wajib diisi.");
    }

    if (!data.KATEGORI) {
      throw new Error("Kategori wajib dipilih.");
    }
  }

  /* ==========================================================
     DETAIL
  ========================================================== */

  function openDetail(idProgram) {
    const row = state.data.find(
      (item) => String(item.ID_PROGRAM) === String(idProgram),
    );

    if (!row) {
      showError("Data program tidak ditemukan.");
      return;
    }

    openModal({
      title: "Detail Program",

      content: `
      <div class="program-detail">

        <div class="detail-row">
          <span class="detail-label">
            ID Program
          </span>

          <strong>
            ${escapeHtml(row.ID_PROGRAM)}
          </strong>
        </div>

        <div class="detail-row">
          <span class="detail-label">
            Nama Program
          </span>

          <strong>
            ${escapeHtml(row.NAMA_PROGRAM)}
          </strong>
        </div>

        <div class="detail-row">
          <span class="detail-label">
            Kategori
          </span>

          <span>
            ${escapeHtml(row.KATEGORI || "-")}
          </span>
        </div>

        <div class="detail-row">
          <span class="detail-label">
            Status
          </span>

          <span>
            ${escapeHtml(row.STATUS || "-")}
          </span>
        </div>

        <div class="detail-row detail-description">
          <span class="detail-label">
            Deskripsi
          </span>

          <p>
            ${escapeHtml(row.DESKRIPSI || "-")}
          </p>
        </div>

        <div class="detail-actions">

          <button
            type="button"
            class="btn btn-primary"
            onclick="
              Program.openKriteria(
                '${escapeJs(row.ID_PROGRAM)}'
              )
            "
          >
            ⚙ Kriteria
          </button>

          <button
            type="button"
            class="btn btn-secondary"
            onclick="
              Program.openEdit(
                '${escapeJs(row.ID_PROGRAM)}'
              )
            "
          >
            Edit
          </button>

          <button
            type="button"
            class="btn btn-danger"
            onclick="
              Program.remove(
                '${escapeJs(row.ID_PROGRAM)}'
              )
            "
          >
            Hapus
          </button>

        </div>

      </div>
    `,

      hideSubmit: true,
    });
  }

  /* ==========================================================
     OPEN KRITERIA
  ========================================================== */

  function openKriteria(idProgram) {
    if (!idProgram) {
      console.error("[PROGRAM] ID_PROGRAM kosong.");
      return;
    }

    Router.navigate("program-kriteria", true, {
      ID_PROGRAM: idProgram,
    });
  }

  /* ==========================================================
     LOAD KRITERIA MODAL
  ========================================================== */

  async function loadKriteriaModal(idProgram) {
    try {
      const response = await API.get("getProgramKriteriaByProgram", {
        ID_PROGRAM: idProgram,
      });

      let rows = [];

      if (Array.isArray(response)) {
        rows = response;
      } else if (response && Array.isArray(response.data)) {
        rows = response.data;
      }

      openModal({
        title: `Kriteria Program ${idProgram}`,

        content: kriteriaHtml(rows),

        hideSubmit: true,
      });
    } catch (error) {
      console.error("[PROGRAM] Load kriteria gagal:", error);

      Toast.error(error.message || "Gagal memuat kriteria program.");
    }
  }

  /* ==========================================================
     KRITERIA HTML
  ========================================================== */

  function kriteriaHtml(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return `

        <div class="table-empty">

          Belum ada kriteria
          untuk program ini.

        </div>

      `;
    }

    return `

      <div class="table-wrapper">

        <table class="data-table">

          <thead>

            <tr>

              <th>No</th>

              <th>Field</th>

              <th>Operator</th>

              <th>Value</th>

              <th>Status</th>

            </tr>

          </thead>


          <tbody>

            ${rows
              .map(
                (row, index) => `

                  <tr>

                    <td>
                      ${index + 1}
                    </td>

                    <td>
                      ${escapeHtml(row.FIELD || "")}
                    </td>

                    <td>
                      ${escapeHtml(row.OPERATOR || "")}
                    </td>

                    <td>
                      ${escapeHtml(row.VALUE ?? "")}
                    </td>

                    <td>
                      ${escapeHtml(row.STATUS || "")}
                    </td>

                  </tr>

                `,
              )
              .join("")}

          </tbody>

        </table>

      </div>

    `;
  }

  /* ==========================================================
     MODAL ENGINE
  ========================================================== */

  function openModal(options) {
    closeModal();

    const container = el("programModalContainer");

    if (!container) {
      console.error("[PROGRAM] programModalContainer tidak ditemukan.");

      return;
    }

    const {
      title = "",

      content = "",

      submitText = "Simpan",

      onSubmit = null,

      hideSubmit = false,
    } = options;

    container.innerHTML = `

      <div
        class="program-modal-overlay"
        data-program-modal
      >

        <div
          class="program-modal"
          role="dialog"
          aria-modal="true"
        >

          <div class="program-modal-header">

            <h3>
              ${escapeHtml(title)}
            </h3>

            <button
              type="button"
              class="program-modal-close"
              data-modal-close
              aria-label="Tutup"
            >
              ×
            </button>

          </div>


          <div class="program-modal-body">

            ${content}

          </div>


          <div class="program-modal-footer">

            <button
              type="button"
              class="btn btn-secondary"
              data-modal-close
            >
              Batal
            </button>

            ${
              hideSubmit
                ? ""
                : `
                  <button
                    type="button"
                    class="btn btn-primary"
                    id="programModalSubmit"
                  >
                    ${escapeHtml(submitText)}
                  </button>
                `
            }

          </div>

        </div>

      </div>

    `;

    const overlay = container.querySelector("[data-program-modal]");

    const closeButtons = container.querySelectorAll("[data-modal-close]");

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    if (overlay) {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          closeModal();
        }
      });
    }

    document.addEventListener("keydown", handleEscape);

    const submitButton = el("programModalSubmit");

    if (submitButton && typeof onSubmit === "function") {
      submitButton.addEventListener("click", async () => {
        try {
          await onSubmit();
        } catch (error) {
          console.error("[PROGRAM] Modal submit:", error);

          Toast.error(error.message || "Data tidak valid.");
        }
      });
    }
  }

  /* ==========================================================
     MODAL ESCAPE
  ========================================================== */

  function handleEscape(event) {
    if (event.key === "Escape") {
      closeModal();
    }
  }

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  function closeModal() {
    const container = el("programModalContainer");

    if (container) {
      container.innerHTML = "";
    }

    document.removeEventListener("keydown", handleEscape);
  }

  /* ==========================================================
     MODAL LOADING
  ========================================================== */

  function setModalLoading(loading) {
    const button = el("programModalSubmit");

    if (!button) {
      return;
    }

    button.disabled = loading;

    button.textContent = loading
      ? "Menyimpan..."
      : button.dataset.originalText || "Simpan";
  }

  /* ==========================================================
     TABLE ERROR
  ========================================================== */

  function showTableError(message) {
    const container = el("programTableBody");

    if (!container) {
      return;
    }

    container.innerHTML = `
    <div class="program-grid-empty program-grid-error">

      <div class="program-empty-icon">
        !
      </div>

      <div class="program-empty-title">
        Gagal memuat program
      </div>

      <div class="program-empty-text">
        ${escapeHtml(message)}
      </div>

    </div>
  `;
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
     PUBLIC
  ========================================================== */

  return {
    init,

    load,

    loadKategori,

    openCreate,

    openEdit,

    openDetail,

    openKriteria,

    openDelete,

    remove,

    closeModal,
  };
})();
