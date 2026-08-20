/* =========================================================
   COMMUNITY DEVELOPMENT
   MODULE : PROGRAM KRITERIA
========================================================= */

const ProgramKriteria = (() => {
  /* =========================================================
     STATE
  ========================================================= */

  const state = {
    idProgram: "",

    program: null,

    data: [],

    filtered: [],

    editingId: null,

    initialized: false,

    loading: false,

    saving: false,
  };

  /* =========================================================
     MASTER FIELD
  ========================================================= */
  const FIELD_OPTIONS = [
    "USIA",
    "JENIS_KELAMIN",
    "AGAMA",
    "HUBUNGAN_KELUARGA",
    "STATUS_PERKAWINAN",
    "JUMLAH_TANGGUNGAN",
    "DESA",
    "RESIDENCE",
    "STATUS_PENDIDIKAN",
    "PENDIDIKAN_TERAKHIR",
    "SEKOLAH",
    "KELAS",
    "STATUS_PEKERJAAN",
    "PEKERJAAN",
    "PENDAPATAN_BULANAN",
    "STATUS_PENDUDUK",
  ];
  /* =========================================================
   MASTER FIELD PENDUDUK
========================================================= */

  const CRITERIA_FIELD_TYPES = {
    USIA: "NUMBER",
    JUMLAH_TANGGUNGAN: "NUMBER",
    PENDAPATAN_BULANAN: "NUMBER",

    JENIS_KELAMIN: "CATEGORY",
    AGAMA: "CATEGORY",
    HUBUNGAN_KELUARGA: "CATEGORY",
    STATUS_PERKAWINAN: "CATEGORY",
    DESA: "CATEGORY",
    RESIDENCE: "CATEGORY",
    STATUS_PENDIDIKAN: "CATEGORY",
    PENDIDIKAN_TERAKHIR: "CATEGORY",
    SEKOLAH: "CATEGORY",
    KELAS: "CATEGORY",
    STATUS_PEKERJAAN: "CATEGORY",
    PEKERJAAN: "CATEGORY",
    STATUS_PENDUDUK: "CATEGORY",
  };

  function getCriteriaFieldType(field) {
    const key = String(field || "")
      .trim()
      .toUpperCase();

    return CRITERIA_FIELD_TYPES[key] || "CATEGORY";
  }

  /* =========================================================
     MASTER OPERATOR
  ========================================================= */

  const OPERATOR_OPTIONS = [
    "=",
    "!=",
    ">",
    ">=",
    "<",
    "<=",
    "CONTAINS",
    "STARTS_WITH",
    "ENDS_WITH",
  ];

  /* =========================================================
     INIT
  ========================================================= */

  async function init() {
    console.log("[PROGRAM KRITERIA] Init");

    resetState();

    state.idProgram = getProgramId();

    if (!state.idProgram) {
      showError("ID_PROGRAM tidak ditemukan.");

      return;
    }

    bindEvents();

    await Promise.all([loadProgram(), load()]);

    state.initialized = true;

    console.log("[PROGRAM KRITERIA] Ready:", {
      ID_PROGRAM: state.idProgram,
    });
  }

  /* =========================================================
     RESET STATE
  ========================================================= */

  function resetState() {
    state.program = null;

    state.data = [];

    state.filtered = [];

    state.editingId = null;

    state.loading = false;

    state.saving = false;
  }

  /* =========================================================
     GET PROGRAM ID
  ========================================================= */

  function getProgramId() {
    const params = new URLSearchParams(window.location.search);

    return (
      params.get("ID_PROGRAM") ||
      params.get("id_program") ||
      params.get("idProgram") ||
      ""
    ).trim();
  }

  /* =========================================================
     EVENTS
  ========================================================= */

  function bindEvents() {
    const search = el("programKriteriaSearch");

    const status = el("programKriteriaStatusFilter");

    if (search) {
      search.oninput = applyFilter;
    }

    if (status) {
      status.onchange = applyFilter;
    }
  }

  /* =========================================================
     LOAD PROGRAM
  ========================================================= */

  async function loadProgram() {
    try {
      console.log("[PROGRAM KRITERIA] Loading program:", state.idProgram);

      const response = await API.get("getProgramById", {
        ID_PROGRAM: state.idProgram,
      });

      console.log("[PROGRAM KRITERIA] Program response:", response);

      const data = normalizeResponse(response);

      state.program = Array.isArray(data) ? data[0] || null : data;

      renderProgram();
    } catch (error) {
      console.error("[PROGRAM KRITERIA] Load program error:", error);

      state.program = null;

      renderProgram();

      showError(error.message || "Gagal memuat data program.");
    }
  }

  /* =========================================================
     LOAD KRITERIA
  ========================================================= */

  async function load() {
    if (!state.idProgram) {
      console.warn("[PROGRAM KRITERIA] ID_PROGRAM kosong.");

      return;
    }

    setLoading(true);

    try {
      console.log("[PROGRAM KRITERIA] Loading kriteria:", state.idProgram);

      const response = await API.get("getProgramKriteriaByProgram", {
        ID_PROGRAM: state.idProgram,
      });

      console.log("[PROGRAM KRITERIA] Response:", response);

      state.data = normalizeArray(response);

      state.filtered = [...state.data];

      renderSummary();

      applyFilter();
    } catch (error) {
      console.error("[PROGRAM KRITERIA] Load error:", error);

      state.data = [];

      state.filtered = [];

      renderSummary();

      renderEmpty(error.message || "Gagal memuat data kriteria.");

      showError(error.message || "Gagal memuat data kriteria.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     NORMALIZE ARRAY RESPONSE
  ========================================================= */

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

  /* =========================================================
     NORMALIZE SINGLE RESPONSE
  ========================================================= */

  function normalizeResponse(response) {
    if (response && response.data !== undefined) {
      return response.data;
    }

    if (response && response.result !== undefined) {
      return response.result;
    }

    return response;
  }

  /* =========================================================
     RENDER PROGRAM INFO
  ========================================================= */

  function renderProgram() {
    const name = el("programKriteriaProgramName");

    const info = el("programKriteriaProgramInfo");

    const breadcrumb = el("programKriteriaBreadcrumb");

    const subtitle = el("programKriteriaSubtitle");

    const program = state.program;

    if (!program) {
      if (name) {
        name.textContent = state.idProgram;
      }

      if (info) {
        info.textContent = "Program tidak ditemukan.";
      }

      if (breadcrumb) {
        breadcrumb.textContent = state.idProgram;
      }

      if (subtitle) {
        subtitle.textContent = "Kelola kriteria penerima manfaat program";
      }

      return;
    }

    const nama = program.NAMA_PROGRAM || program.NAMA || state.idProgram;

    const kategori = program.KATEGORI || program.NAMA_KATEGORI || "-";

    if (name) {
      name.textContent = nama;
    }

    if (info) {
      info.textContent = `${state.idProgram} • ${kategori}`;
    }

    if (breadcrumb) {
      breadcrumb.textContent = nama;
    }

    if (subtitle) {
      subtitle.textContent = `Kelola kriteria penerima manfaat untuk program ${nama}`;
    }
  }

  /* =========================================================
     SUMMARY
  ========================================================= */

  function renderSummary() {
    const total = state.data.length;

    const aktif = state.data.filter(
      (row) => normalizeStatus(row.STATUS) === "AKTIF",
    ).length;

    const operators = new Set(
      state.data
        .map((row) =>
          String(row.OPERATOR || "")
            .trim()
            .toUpperCase(),
        )
        .filter(Boolean),
    ).size;

    setText("programKriteriaTotal", total);

    setText("programKriteriaAktif", aktif);

    setText("programKriteriaOperator", operators);
  }

  /* =========================================================
     FILTER
  ========================================================= */

  function applyFilter() {
    const search = String(el("programKriteriaSearch")?.value || "")
      .trim()
      .toLowerCase();

    const status = normalizeStatus(
      el("programKriteriaStatusFilter")?.value || "",
    );

    state.filtered = state.data.filter((row) => {
      const id = String(row.ID_KRITERIA || "").toLowerCase();

      const field = String(row.FIELD || "").toLowerCase();

      const operator = String(row.OPERATOR || "").toLowerCase();

      const value = String(row.VALUE ?? "").toLowerCase();

      const rowStatus = normalizeStatus(row.STATUS);

      const matchSearch =
        !search ||
        id.includes(search) ||
        field.includes(search) ||
        operator.includes(search) ||
        value.includes(search);

      const matchStatus = !status || rowStatus === status;

      return matchSearch && matchStatus;
    });

    renderTable();
  }

  /* =========================================================
     RESET FILTER
  ========================================================= */

  function resetFilter() {
    const search = el("programKriteriaSearch");

    const status = el("programKriteriaStatusFilter");

    if (search) {
      search.value = "";
    }

    if (status) {
      status.value = "";
    }

    applyFilter();
  }

  /* =========================================================
     RENDER TABLE
  ========================================================= */

  function renderTable() {
    const tbody = el("programKriteriaTableBody");

    if (!tbody) {
      console.warn("[PROGRAM KRITERIA] Table body tidak ditemukan.");

      return;
    }

    if (!state.filtered.length) {
      renderEmpty(
        state.data.length
          ? "Data tidak ditemukan."
          : "Belum ada kriteria untuk program ini.",
      );

      return;
    }

    tbody.innerHTML = state.filtered
      .map((row, index) => renderRow(row, index))
      .join("");
  }

  /* =========================================================
     RENDER ROW
  ========================================================= */

  function renderRow(row, index) {
    const id = String(row.ID_KRITERIA || "-");

    const field = String(row.FIELD || "-");

    const operator = String(row.OPERATOR || "-");

    const value = String(row.VALUE ?? "-");

    const status = normalizeStatus(row.STATUS) || "-";

    const statusClass =
      status === "AKTIF" ? "badge badge-success" : "badge badge-secondary";

    return `
      <tr>

        <td>
          ${index + 1}
        </td>

        <td>
          <strong>
            ${escapeHtml(id)}
          </strong>
        </td>

        <td>
          <strong>
            ${escapeHtml(field)}
          </strong>
        </td>

        <td>
          <span class="badge">
            ${escapeHtml(operator)}
          </span>
        </td>

        <td>
          ${escapeHtml(value)}
        </td>

        <td>
          <span class="${statusClass}">
            ${escapeHtml(status)}
          </span>
        </td>

        <td>

          <div
            style="
              display:flex;
              gap:6px;
              align-items:center;
              justify-content:center;
            "
          >

            <button
              type="button"
              class="btn btn-secondary btn-sm"
              onclick="
                ProgramKriteria.openEdit(
                  '${escapeJs(id)}'
                )
              "
            >
              Edit
            </button>

            <button
              type="button"
              class="btn btn-danger btn-sm"
              onclick="
                ProgramKriteria.remove(
                  '${escapeJs(id)}'
                )
              "
            >
              Hapus
            </button>

          </div>

        </td>

      </tr>
    `;
  }

  /* =========================================================
     OPEN CREATE
  ========================================================= */

  function openCreate() {
    console.log("[PROGRAM KRITERIA] Open create");

    state.editingId = null;

    openModal({
      mode: "create",
      title: "Tambah Kriteria",
      data: {},
    });
  }

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  function openEdit(id) {
    const row = state.data.find(
      (item) => String(item.ID_KRITERIA) === String(id),
    );

    if (!row) {
      showError("Data kriteria tidak ditemukan.");

      return;
    }

    console.log("[PROGRAM KRITERIA] Open edit:", row);

    state.editingId = row.ID_KRITERIA;

    openModal({
      mode: "edit",
      title: "Edit Kriteria",
      data: row,
    });
  }

  /* =========================================================
     MODAL ENGINE
  ========================================================= */

  function openModal({ mode = "create", title = "Kriteria", data = {} }) {
    const container = el("programKriteriaModalContainer");

    if (!container) {
      console.error("[PROGRAM KRITERIA] Modal container tidak ditemukan.");

      return;
    }

    const isEdit = mode === "edit";

    container.innerHTML = `
      <div
        class="modal-overlay"
        id="programKriteriaModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="programKriteriaModalTitle"
        onclick="
          ProgramKriteria.handleOverlayClick(event)
        "
      >

        <div
          class="modal"
          onclick="event.stopPropagation()"
        >

          <!-- HEADER -->

          <div class="modal-header">

            <div>

              <h2 id="programKriteriaModalTitle">
                ${escapeHtml(title)}
              </h2>

              <p>
                Atur aturan kelayakan penerima manfaat
              </p>

            </div>

            <button
              type="button"
              class="modal-close"
              aria-label="Tutup"
              onclick="
                ProgramKriteria.closeModal()
              "
            >
              ×
            </button>

          </div>


          <!-- FORM -->

          <form
            id="programKriteriaForm"
            onsubmit="
              ProgramKriteria.submit(event)
            "
          >

            <div class="modal-body">

              ${
                isEdit
                  ? `
                    <input
                      type="hidden"
                      name="ID_KRITERIA"
                      value="${escapeAttr(data.ID_KRITERIA || "")}"
                    />
                  `
                  : ""
              }

              <input
                type="hidden"
                name="ID_PROGRAM"
                value="${escapeAttr(state.idProgram)}"
              />


              <!-- FIELD -->

              <div class="form-group">

                <label for="programKriteriaField">
                  Field
                  <span class="required">*</span>
                </label>

                <select
                  id="programKriteriaField"
                  name="FIELD"
                  required
                >

                  <option value="">
                    Pilih Field
                  </option>

                  ${renderFieldOptions(data.FIELD)}

                </select>

                <small>
                  Field harus sesuai dengan kolom data Penduduk.
                </small>

              </div>


              <!-- OPERATOR -->

              <div class="form-group">

                <label for="programKriteriaOperator">
                  Operator
                  <span class="required">*</span>
                </label>

                <select
                  id="programKriteriaOperator"
                  name="OPERATOR"
                  required
                >

                  <option value="">
                    Pilih Operator
                  </option>

                  ${renderOperatorOptions(data.OPERATOR)}

                </select>

                <small>
                  Operator digunakan untuk membandingkan nilai.
                </small>

              </div>


              <!-- VALUE -->

              <div class="form-group">

                <label for="programKriteriaValue">
                  Nilai
                  <span class="required">*</span>
                </label>

                <div id="programKriteriaValueContainer">
                  ${renderCriteriaValueInput(data.FIELD, data.VALUE ?? "")}
                </div>

                <small>
                  Nilai yang akan dibandingkan dengan data penduduk.
                </small>

              </div>


              <!-- STATUS -->

              <div class="form-group">

                <label for="programKriteriaStatus">
                  Status
                  <span class="required">*</span>
                </label>

                <select
                  id="programKriteriaStatus"
                  name="STATUS"
                  required
                >

                  <option
                    value="AKTIF"
                    ${
                      normalizeStatus(data.STATUS || "AKTIF") === "AKTIF"
                        ? "selected"
                        : ""
                    }
                  >
                    AKTIF
                  </option>

                  <option
                    value="NONAKTIF"
                    ${
                      normalizeStatus(data.STATUS) === "NONAKTIF"
                        ? "selected"
                        : ""
                    }
                  >
                    NONAKTIF
                  </option>

                </select>

              </div>

            </div>


            <!-- FOOTER -->

            <div class="modal-footer">

              <button
                type="button"
                class="btn btn-secondary"
                onclick="
                  ProgramKriteria.closeModal()
                "
              >
                Batal
              </button>

              <button
                type="submit"
                class="btn btn-primary"
                id="programKriteriaSubmitButton"
              >
                ${isEdit ? "Simpan Perubahan" : "Simpan"}
              </button>

            </div>

          </form>

        </div>

      </div>
    `;

    requestAnimationFrame(() => {
      const modal = el("programKriteriaModal");

      if (modal) {
        modal.classList.add("show");
      }

      const field = el("programKriteriaField");

      if (field) {
        field.focus();

        field.addEventListener("change", function () {
          updateCriteriaValueControl();
        });
      }

      updateCriteriaValueControl(data.VALUE ?? "");
    });
  }

  function renderCriteriaValueInput(field, value = "") {
    const type = getCriteriaFieldType(field);

    /* ======================================================
     NUMBER
  ====================================================== */

    if (type === "NUMBER") {
      return `
      <input
        type="number"
        id="programKriteriaValue"
        name="VALUE"
        value="${escapeAttr(value)}"
        placeholder="Masukkan angka..."
        required
        autocomplete="off"
      />
    `;
    }

    /* ======================================================
     CATEGORY
  ====================================================== */

    return `
    <select
      id="programKriteriaValue"
      name="VALUE"
      required
    >
      <option value="">
        Pilih Nilai
      </option>
    </select>
  `;
  }

  function updateCriteriaValueControl(value = "") {
    const field = el("programKriteriaField");

    const container = el("programKriteriaValueContainer");

    if (!field || !container) {
      return;
    }

    const fieldName = String(field.value || "")
      .trim()
      .toUpperCase();

    /* ======================================================
     BELUM PILIH FIELD
  ====================================================== */

    if (!fieldName) {
      container.innerHTML = `
      <input
        type="text"
        id="programKriteriaValue"
        name="VALUE"
        placeholder="Pilih field terlebih dahulu..."
        disabled
      />
    `;

      return;
    }

    /* ======================================================
     RENDER CONTROL
  ====================================================== */

    container.innerHTML = renderCriteriaValueInput(fieldName, value);

    /* ======================================================
     CATEGORY → LOAD OPTIONS
  ====================================================== */

    if (getCriteriaFieldType(fieldName) === "CATEGORY") {
      loadCriteriaFieldValues(fieldName, value);
    }
  }

  /* =========================================================
     FIELD OPTIONS
  ========================================================= */

  function renderFieldOptions(selected) {
    const current = String(selected || "")
      .trim()
      .toUpperCase();

    return FIELD_OPTIONS.map(
      (field) => `
        <option
          value="${escapeAttr(field)}"
          ${current === field ? "selected" : ""}
        >
          ${escapeHtml(field)}
        </option>
      `,
    ).join("");
  }

  function renderCriteriaValueInput(field, value = "") {
    const type = getCriteriaFieldType(field);

    /* ======================================================
     NUMBER
  ====================================================== */

    if (type === "NUMBER") {
      return `
      <input
        type="number"
        id="programKriteriaValue"
        name="VALUE"
        value="${escapeAttr(value)}"
        placeholder="Masukkan angka..."
        required
        autocomplete="off"
      />
    `;
    }

    /* ======================================================
     CATEGORY
  ====================================================== */

    return `
    <select
      id="programKriteriaValue"
      name="VALUE"
      required
      disabled
    >

      <option value="">
        Memuat nilai...
      </option>

    </select>
  `;
  }

  async function loadCriteriaFieldValues(field, selectedValue = "") {
    const select = el("programKriteriaValue");

    if (!select) {
      return;
    }

    const type = getCriteriaFieldType(field);

    /* ======================================================
     NUMBER
  ====================================================== */

    if (type === "NUMBER") {
      return;
    }

    /* ======================================================
     LOADING
  ====================================================== */

    select.disabled = true;

    select.innerHTML = `
    <option value="">
      Memuat nilai...
    </option>
  `;

    try {
      const response = await API.get("getDistinctFieldValues", {
        FIELD: field,
      });

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Gagal mengambil nilai field.");
      }

      const values = Array.isArray(response.data) ? response.data : [];

      select.innerHTML = `
      <option value="">
        Pilih Nilai
      </option>

      ${values
        .map(function (value) {
          const selected =
            String(value) === String(selectedValue) ? "selected" : "";

          return `
            <option
              value="${escapeAttr(value)}"
              ${selected}
            >
              ${escapeHtml(value)}
            </option>
          `;
        })
        .join("")}
    `;

      select.disabled = false;
    } catch (error) {
      console.error("[PROGRAM KRITERIA] load field values:", error);

      select.innerHTML = `
      <option value="">
        Gagal memuat nilai
      </option>
    `;

      select.disabled = true;
    }
  }

  /* =========================================================
     OPERATOR OPTIONS
  ========================================================= */

  function renderOperatorOptions(selected) {
    const current = String(selected || "")
      .trim()
      .toUpperCase();

    return OPERATOR_OPTIONS.map(
      (operator) => `
        <option
          value="${escapeAttr(operator)}"
          ${current === operator ? "selected" : ""}
        >
          ${escapeHtml(operator)}
        </option>
      `,
    ).join("");
  }

  /* =========================================================
     OVERLAY CLICK
  ========================================================= */

  function handleOverlayClick(event) {
    if (event && event.target && event.target.id === "programKriteriaModal") {
      closeModal();
    }
  }

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  function closeModal() {
    const container = el("programKriteriaModalContainer");

    if (!container) {
      return;
    }

    const modal = el("programKriteriaModal");

    if (modal) {
      modal.classList.remove("show");
    }

    container.innerHTML = "";

    state.editingId = null;
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  /* =========================================================
   SUBMIT
========================================================= */

  async function submit(event) {
    event.preventDefault();

    const form = document.getElementById("programKriteriaForm");

    if (!form) {
      console.error("[PROGRAM KRITERIA] Form tidak ditemukan.");
      return;
    }

    /* =======================================================
     PROGRAM ID
  ======================================================= */

    const params = new URLSearchParams(window.location.search);

    const idProgram = String(
      params.get("ID_PROGRAM") ||
        params.get("id_program") ||
        params.get("idProgram") ||
        "",
    ).trim();

    if (!idProgram) {
      showError("ID_PROGRAM tidak ditemukan.");
      return;
    }

    /* =======================================================
     FORM DATA
  ======================================================= */

    const formData = new FormData(form);

    const payload = {
      ID_PROGRAM: idProgram,

      FIELD: String(formData.get("FIELD") || "")
        .trim()
        .toUpperCase(),

      OPERATOR: String(formData.get("OPERATOR") || "")
        .trim()
        .toUpperCase(),

      VALUE: String(formData.get("VALUE") ?? "").trim(),

      STATUS: String(formData.get("STATUS") || "AKTIF")
        .trim()
        .toUpperCase(),
    };

    /* =======================================================
     EDIT
  ======================================================= */

    if (state.editingId) {
      payload.ID_KRITERIA = String(state.editingId).trim();
    }

    /* =======================================================
     VALIDATION
  ======================================================= */

    if (!payload.ID_PROGRAM) {
      showError("ID Program wajib diisi.");
      return;
    }

    if (!payload.FIELD) {
      showError("Field wajib dipilih.");
      return;
    }

    if (!payload.OPERATOR) {
      showError("Operator wajib dipilih.");
      return;
    }

    if (!payload.VALUE) {
      showError("Nilai wajib diisi.");
      return;
    }

    if (!payload.STATUS) {
      showError("Status wajib dipilih.");
      return;
    }

    /* =======================================================
     DEBUG
  ======================================================= */

    console.log("[PROGRAM KRITERIA] =================================");

    console.log("[PROGRAM KRITERIA] ID_PROGRAM:", payload.ID_PROGRAM);

    console.log("[PROGRAM KRITERIA] Save payload:", payload);

    /* =======================================================
     BUTTON
  ======================================================= */

    const button = document.getElementById("programKriteriaSubmitButton");

    setButtonLoading(button, true);

    try {
      /* =====================================================
       API
    ===================================================== */

      const action = state.editingId
        ? "updateProgramKriteria"
        : "createProgramKriteria";

      console.log("[PROGRAM KRITERIA] Action:", action);

      const response = await API.post(action, payload);

      console.log("[PROGRAM KRITERIA] API response:", response);

      /* =====================================================
       RESPONSE VALIDATION
    ===================================================== */

      if (!response) {
        throw new Error("Tidak ada response dari server.");
      }

      if (response.success !== true) {
        throw new Error(response.message || "Server gagal menyimpan kriteria.");
      }

      /* =====================================================
       SUCCESS
    ===================================================== */

      console.log("[PROGRAM KRITERIA] Kriteria berhasil disimpan.");

      showSuccess(
        response.message ||
          (state.editingId
            ? "Kriteria berhasil diperbarui."
            : "Kriteria berhasil ditambahkan."),
      );

      /* =====================================================
       CLOSE
    ===================================================== */

      closeModal();

      /* =====================================================
       RELOAD
    ===================================================== */

      await load();
    } catch (error) {
      console.error("[PROGRAM KRITERIA] Save error:", error);

      showError(error?.message || "Gagal menyimpan kriteria.");
    } finally {
      setButtonLoading(button, false);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function remove(id) {
    if (!id) {
      return;
    }

    const row = state.data.find(
      (item) => String(item.ID_KRITERIA) === String(id),
    );

    if (!row) {
      showError("Kriteria tidak ditemukan.");

      return;
    }

    const field = row.FIELD || "-";

    const operator = row.OPERATOR || "-";

    const value = row.VALUE ?? "-";

    const confirmed = window.confirm(
      `Hapus kriteria ${row.ID_KRITERIA}?\n\n` +
        `${field} ${operator} ${value}`,
    );

    if (!confirmed) {
      return;
    }

    try {
      console.log("[PROGRAM KRITERIA] Delete:", row.ID_KRITERIA);

      const response = await API.post("deleteProgramKriteria", {
        ID_KRITERIA: row.ID_KRITERIA,
      });

      console.log("[PROGRAM KRITERIA] Delete response:", response);

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Gagal menghapus kriteria.");
      }

      showSuccess(response.message || "Kriteria berhasil dihapus.");

      await load();
    } catch (error) {
      console.error("[PROGRAM KRITERIA] Delete error:", error);

      showError(error.message || "Gagal menghapus kriteria.");
    }
  }

  /* =========================================================
     BACK TO PROGRAM
  ========================================================= */

  function backToProgram() {
    closeModal();

    window.location.href = "?page=program";
  }

  /* =========================================================
     LOADING
  ========================================================= */

  function setLoading(loading) {
    state.loading = loading;

    if (!loading) {
      return;
    }

    const tbody = el("programKriteriaTableBody");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = `
      <tr>

        <td
          colspan="7"
          class="table-empty"
        >
          Memuat data kriteria...
        </td>

      </tr>
    `;
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  function renderEmpty(message) {
    const tbody = el("programKriteriaTableBody");

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
  }

  /* =========================================================
     BUTTON LOADING
  ========================================================= */

  function setButtonLoading(button, loading, text) {
    if (!button) {
      return;
    }

    if (loading) {
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }

      button.disabled = true;

      button.textContent = text || "Menyimpan...";
    } else {
      button.disabled = false;

      button.textContent = text || button.dataset.originalText || "Simpan";
    }
  }

  /* =========================================================
     STATUS
  ========================================================= */

  function normalizeStatus(value) {
    return String(value || "")
      .trim()
      .toUpperCase();
  }

  /* =========================================================
     SET TEXT
  ========================================================= */

  function setText(id, value) {
    const element = el(id);

    if (element) {
      element.textContent = String(value);
    }
  }

  /* =========================================================
     ELEMENT HELPER
  ========================================================= */

  function el(id) {
    return document.getElementById(id);
  }

  /* =========================================================
     SUCCESS
  ========================================================= */

  function showSuccess(message) {
    console.log("[PROGRAM KRITERIA] SUCCESS:", message);

    if (typeof Toast !== "undefined" && typeof Toast.success === "function") {
      Toast.success(message);

      return;
    }

    if (typeof App !== "undefined" && typeof App.toast === "function") {
      App.toast(message, "success");

      return;
    }
  }

  function getProgramId() {
    const params = new URLSearchParams(window.location.search);

    const idProgram = String(params.get("ID_PROGRAM") || "").trim();

    if (!idProgram) {
      console.error("[PROGRAM KRITERIA] ID_PROGRAM tidak ditemukan di URL.");
      return "";
    }

    return idProgram;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  function showError(message) {
    console.error("[PROGRAM KRITERIA] ERROR:", message);

    if (typeof Toast !== "undefined" && typeof Toast.error === "function") {
      Toast.error(message);

      return;
    }

    if (typeof App !== "undefined" && typeof App.toast === "function") {
      App.toast(message, "error");

      return;
    }

    window.alert(message);
  }

  /* =========================================================
     ESCAPE HTML
  ========================================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================================================
     ESCAPE ATTRIBUTE
  ========================================================= */

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  /* =========================================================
     ESCAPE JS
  ========================================================= */

  function escapeJs(value) {
    return String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r");
  }

  /**
   * =========================================
   * EVALUATE PROGRAM PAGE
   * =========================================
   */

  async function evaluateProgramPage(programId, page = 1, pageSize = 50) {
    const id = String(programId || "").trim();

    if (!id) {
      throw new Error("ID_PROGRAM wajib diisi.");
    }

    console.log("[PROGRAM KRITERIA] Evaluate page:", {
      ID_PROGRAM: id,
      page,
      pageSize,
    });

    const response = await API.get("evaluateProgramPage", {
      ID_PROGRAM: id,
      page,
      pageSize,
    });

    console.log("[PROGRAM KRITERIA] Evaluate page response:", response);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengevaluasi program.");
    }

    return response;
  }

  /* =========================================================
     PUBLIC API
  ========================================================= */

  return {
    init,

    load,

    loadProgram,

    applyFilter,

    resetFilter,

    openCreate,

    openEdit,

    openModal,

    closeModal,

    handleOverlayClick,

    submit,

    remove,

    backToProgram,

    evaluateProgramPage,
  };
})();

/* =========================================================
   GLOBAL
========================================================= */

window.ProgramKriteria = ProgramKriteria;
