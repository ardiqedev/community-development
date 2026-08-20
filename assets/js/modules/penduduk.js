/* =========================================
   COMMUNITY DEVELOPMENT
   Module : Penduduk
   Database : 25 Field
   AI OCR  : KK → OCR Review → Draft
========================================= */

const Penduduk = {
  /* =======================================
     STATE
  ======================================= */

  data: [],
  filteredData: [],

  ocrResult: null,

  currentPage: 1,

  pageSize: 10,

  /* =======================================
     INIT
  ======================================= */

  init: async function () {
    try {
      console.log("[PENDUDUK] Init");

      Penduduk.showLoading();

      await Penduduk.load();

      Penduduk.bindEvents();

      Penduduk.renderIcons();

      console.log("[PENDUDUK] Loaded:", Penduduk.data.length);
    } catch (error) {
      console.error("[PENDUDUK] Init failed:", error);

      Penduduk.showError(error);
    }
  },

  /* =======================================
     LOAD DATA
  ======================================= */

  load: async function () {
    try {
      const response = await API.get("getPenduduk");

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Gagal mengambil data penduduk.");
      }

      const data = Array.isArray(response.data) ? response.data : [];

      Penduduk.data = data;

      Penduduk.filteredData = [...data];

      Penduduk.renderSummary(data);

      Penduduk.currentPage = 1;

      Penduduk.renderPaginatedTable();

      return data;
    } catch (error) {
      console.error("[PENDUDUK] Load failed:", error);

      throw error;
    }
  },

  /* =======================================
     SUMMARY
  ======================================= */

  renderSummary: function (rows) {
    const total = rows.length;

    const laki = rows.filter(function (row) {
      return (
        String(row.JENIS_KELAMIN || "")
          .trim()
          .toLowerCase() === "laki-laki"
      );
    }).length;

    const perempuan = rows.filter(function (row) {
      return (
        String(row.JENIS_KELAMIN || "")
          .trim()
          .toLowerCase() === "perempuan"
      );
    }).length;

    Penduduk.setText("statTotalPenduduk", Penduduk.number(total));

    Penduduk.setText("statPendudukLaki", Penduduk.number(laki));

    Penduduk.setText("statPendudukPerempuan", Penduduk.number(perempuan));
  },

  /* =======================================
     TABLE
  ======================================= */

  renderTable: function (rows) {
    const tbody = document.getElementById("tablePenduduk");

    if (!tbody) {
      console.warn("[PENDUDUK] Element #tablePenduduk tidak ditemukan.");

      return;
    }

    if (!rows.length) {
      tbody.innerHTML = `

        <tr>

          <td
            colspan="7"
            class="table-empty"
          >
            Menampilkan 0 data
          </td>

        </tr>

      `;

      return;
    }

    tbody.innerHTML = rows
      .map(function (row, index) {
        const nama = Penduduk.escape(row.NAMA || "-");

        const nik = Penduduk.escape(row.NIK || "-");

        const jenisKelamin = Penduduk.escape(row.JENIS_KELAMIN || "-");

        const desa = Penduduk.escape(row.DESA || "-");

        const status = String(row.STATUS_PENDUDUK || "NONAKTIF").trim();

        const statusClass = status === "AKTIF" ? "success" : "secondary";

        return `

            <tr>

              <td>
                ${index + 1}
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
                ${jenisKelamin}
              </td>

              <td>
                ${desa}
              </td>

              <td>

                <span
                  class="badge badge-${statusClass}"
                >
                  ${Penduduk.escape(status)}
                </span>

              </td>

              <td class="table-actions">

                <div class="penduduk-actions">

                  <button
                    type="button"
                    class="btn btn-icon btn-secondary"
                    data-action="detail-penduduk"
                    data-id="${Penduduk.escapeAttribute(row.ID_PENDUDUK)}"
                    title="Detail"
                  >
                    <i data-lucide="eye"></i>
                  </button>


                  <button
                    type="button"
                    class="btn btn-icon btn-secondary"
                    data-action="edit-penduduk"
                    data-id="${Penduduk.escapeAttribute(row.ID_PENDUDUK)}"
                    title="Edit"
                  >
                    <i data-lucide="pencil"></i>
                  </button>


                  <button
                    type="button"
                    class="btn btn-icon btn-danger"
                    data-action="delete-penduduk"
                    data-id="${Penduduk.escapeAttribute(row.ID_PENDUDUK)}"
                    title="Hapus"
                  >
                    <i data-lucide="trash-2"></i>
                  </button>

                </div>

              </td>

            </tr>

          `;
      })
      .join("");

    Penduduk.renderIcons();
  },

  /* =======================================
     SEARCH
  ======================================= */

  search: function (keyword) {
    const query = String(keyword || "")
      .trim()
      .toLowerCase();

    if (!query) {
      Penduduk.filteredData = [...Penduduk.data];
    } else {
      Penduduk.filteredData = Penduduk.data.filter(function (row) {
        const nik = String(row.NIK || "").toLowerCase();

        const nama = String(row.NAMA || "").toLowerCase();

        const desa = String(row.DESA || "").toLowerCase();

        const noKK = String(row.NO_KK || "").toLowerCase();

        const noHP = String(row.NO_HP || "").toLowerCase();

        return (
          nik.includes(query) ||
          nama.includes(query) ||
          desa.includes(query) ||
          noKK.includes(query) ||
          noHP.includes(query)
        );
      });
    }

    Penduduk.currentPage = 1;

    Penduduk.renderPaginatedTable();
  },

  /* =======================================
     EVENTS
  ======================================= */

  bindEvents: function () {
    /* -------------------------------------
       SEARCH
    ------------------------------------- */

    const search = document.getElementById("searchPenduduk");

    if (search) {
      search.addEventListener("input", function (event) {
        Penduduk.search(event.target.value);
      });
    }

    /* -------------------------------------
       REFRESH
    ------------------------------------- */

    const refresh = document.getElementById("btnRefreshPenduduk");

    if (refresh) {
      refresh.addEventListener("click", async function () {
        try {
          refresh.disabled = true;

          await Penduduk.load();
        } catch (error) {
          Penduduk.showError(error);
        } finally {
          refresh.disabled = false;
        }
      });
    }

    /* -------------------------------------
       TAMBAH
    ------------------------------------- */

    const tambah = document.getElementById("btnTambahPenduduk");

    if (tambah) {
      tambah.addEventListener("click", function () {
        Penduduk.openCreate();
      });
    }

    /* -------------------------------------
       TABLE ACTION
    ------------------------------------- */

    const tbody = document.getElementById("tablePenduduk");

    if (tbody) {
      tbody.addEventListener("click", function (event) {
        const button = event.target.closest("[data-action]");

        if (!button) {
          return;
        }

        const action = button.dataset.action;

        const id = button.dataset.id;

        if (!id) {
          Toast.error("ID_PENDUDUK tidak ditemukan.");

          return;
        }

        switch (action) {
          case "detail-penduduk":
            Penduduk.openDetail(id);

            break;

          case "edit-penduduk":
            Penduduk.openEdit(id);

            break;

          case "delete-penduduk":
            Penduduk.openDelete(id);

            break;
        }
      });
    }

    /* -------------------------------------
       OCR REVIEW ACTION
    ------------------------------------- */

    if (!Penduduk._ocrActionBound) {
      document.addEventListener("click", function (event) {
        const button = event.target.closest('[data-action="use-ocr-member"]');

        if (!button) {
          return;
        }

        const index = Number(button.dataset.index);

        if (!Number.isInteger(index) || index < 0) {
          Toast.error("Anggota OCR tidak ditemukan.");

          return;
        }

        Penduduk.useOCRMember(index);
      });

      Penduduk._ocrActionBound = true;
    }
  },

  /* =======================================
     CREATE ENTRY
     ======================================= */

  openCreate: function () {
    console.log("[PENDUDUK] Open create");

    const body = `

      <div class="form-grid">

        <div
          class="form-group form-group-full"
          style="
            padding:20px;
            border:1px solid #e5e7eb;
            border-radius:14px;
            text-align:center;
          "
        >

          <div
            style="
              width:56px;
              height:56px;
              margin:0 auto 12px;
              border-radius:14px;
              background:#eef4ff;
              display:flex;
              align-items:center;
              justify-content:center;
            "
          >
            <i
              data-lucide="scan-text"
              style="width:28px;height:28px;"
            ></i>
          </div>


          <h3
            style="
              margin:0 0 6px;
            "
          >
            Scan KK dengan AI
          </h3>


          <p
            class="text-muted"
            style="
              margin:0 0 16px;
            "
          >
            Upload foto Kartu Keluarga.
            Gemini akan membaca data anggota
            dan menampilkannya untuk diverifikasi.
          </p>


          <button
            type="button"
            class="btn btn-primary"
            id="btnScanKKPenduduk"
          >

            <i data-lucide="scan-text"></i>

            Scan KK dengan AI

          </button>

        </div>


        <div
          class="form-group form-group-full"
          style="
            text-align:center;
            padding:4px 0;
          "
        >

          <span class="text-muted">
            atau
          </span>

        </div>


        <div
          class="form-group form-group-full"
          style="
            padding:20px;
            border:1px solid #e5e7eb;
            border-radius:14px;
            text-align:center;
          "
        >

          <div
            style="
              width:56px;
              height:56px;
              margin:0 auto 12px;
              border-radius:14px;
              background:#f3f4f6;
              display:flex;
              align-items:center;
              justify-content:center;
            "
          >
            <i
              data-lucide="pen-line"
              style="width:28px;height:28px;"
            ></i>
          </div>


          <h3
            style="
              margin:0 0 6px;
            "
          >
            Input Manual
          </h3>


          <p
            class="text-muted"
            style="
              margin:0 0 16px;
            "
          >
            Isi seluruh data penduduk
            secara manual.
          </p>


          <button
            type="button"
            class="btn btn-secondary"
            id="btnInputManualPenduduk"
          >

            <i data-lucide="pen-line"></i>

            Input Manual

          </button>

        </div>

      </div>

    `;

    Modal.open({
      title: "Tambah Penduduk",

      body: body,

      footer: `

        <button
          type="button"
          class="btn btn-secondary"
          onclick="Modal.close()"
        >
          Batal
        </button>

      `,

      size: "lg",
    });

    document
      .getElementById("btnScanKKPenduduk")
      ?.addEventListener("click", function () {
        Penduduk.openOCRUpload();
      });

    document
      .getElementById("btnInputManualPenduduk")
      ?.addEventListener("click", function () {
        Penduduk.openCreateManual();
      });

    Penduduk.renderIcons();
  },

  /* =======================================
     OCR UPLOAD
  ======================================= */

  openOCRUpload: function () {
    const body = `

      <div>

        <input
          type="file"
          id="inputKKOCR"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          style="display:none;"
        >


        <div
          id="ocrUploadArea"
          style="
            border:2px dashed #d7deea;
            border-radius:16px;
            padding:30px 20px;
            text-align:center;
            cursor:pointer;
          "
        >

          <div
            style="
              width:64px;
              height:64px;
              margin:0 auto 14px;
              border-radius:16px;
              background:#eef4ff;
              display:flex;
              align-items:center;
              justify-content:center;
            "
          >

            <i
              data-lucide="camera"
              style="
                width:30px;
                height:30px;
              "
            ></i>

          </div>


          <h3
            style="
              margin:0 0 8px;
            "
          >
            Upload Foto KK
          </h3>


          <p
            class="text-muted"
            style="
              margin:0;
            "
          >
            Klik untuk memilih foto KK
          </p>

        </div>


        <div
          id="ocrPreview"
          style="
            display:none;
            margin-top:18px;
          "
        >

          <img
            id="ocrPreviewImage"
            src=""
            alt="Preview KK"
            style="
              width:100%;
              max-height:320px;
              object-fit:contain;
              border-radius:12px;
              border:1px solid #e5e7eb;
            "
          >


          <div
            id="ocrFileInfo"
            class="text-muted"
            style="
              margin-top:8px;
              font-size:13px;
            "
          ></div>

        </div>


        <div
          style="
            margin-top:18px;
            padding:12px 14px;
            border-radius:10px;
            background:#f6f8fb;
            font-size:13px;
          "
        >

          <strong>
            Catatan:
          </strong>

          AI hanya membuat draft data.
          Hasil tetap harus diverifikasi
          sebelum disimpan.

        </div>

      </div>

    `;

    const footer = `

      <button
        type="button"
        class="btn btn-secondary"
        id="btnBatalOCR"
      >
        Batal
      </button>


      <button
        type="button"
        class="btn btn-primary"
        id="btnMulaiOCR"
        disabled
      >

        <i data-lucide="scan-text"></i>

        <span>
          Baca KK
        </span>

      </button>

    `;

    Modal.open({
      title: "Scan KK dengan AI",

      body: body,

      footer: footer,

      size: "lg",
    });

    const input = document.getElementById("inputKKOCR");

    const uploadArea = document.getElementById("ocrUploadArea");

    const preview = document.getElementById("ocrPreview");

    const previewImage = document.getElementById("ocrPreviewImage");

    const fileInfo = document.getElementById("ocrFileInfo");

    const scanButton = document.getElementById("btnMulaiOCR");

    uploadArea?.addEventListener("click", function () {
      input?.click();
    });

    input?.addEventListener("change", function (event) {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        Toast.error("File harus berupa gambar.");

        input.value = "";

        return;
      }

      const objectUrl = URL.createObjectURL(file);

      previewImage.src = objectUrl;

      preview.style.display = "block";

      fileInfo.textContent = `${file.name} • ${Penduduk.formatFileSize(file.size)}`;

      scanButton.disabled = false;
    });

    scanButton?.addEventListener("click", async function () {
      const file = input?.files?.[0];

      if (!file) {
        Toast.error("Pilih foto KK terlebih dahulu.");

        return;
      }

      await Penduduk.scanKK(file, scanButton);
    });

    document
      .getElementById("btnBatalOCR")
      ?.addEventListener("click", function () {
        Modal.close();
      });

    Penduduk.renderIcons();
  },

  /* =========================================
   USE OCR MEMBER
========================================= */

  useOCRMember: function (index) {
    /* =====================================
     AMBIL DATA OCR
     ===================================== */

    const data = Penduduk._ocrReviewData;

    if (!data) {
      Toast.error("Data hasil OCR tidak ditemukan.");

      return;
    }

    /* =====================================
     MEMBERS
     ===================================== */

    const members = Array.isArray(data.anggota_keluarga)
      ? data.anggota_keluarga
      : [];

    const member = members[index];

    if (!member) {
      Toast.error("Data anggota OCR tidak ditemukan.");

      return;
    }

    console.log("[PENDUDUK OCR] Gunakan anggota:", index + 1, member);

    /* =====================================
     SIMPAN DATA TERPILIH
     ===================================== */

    Penduduk._selectedOCRMember = member;

    Penduduk._selectedOCRNoKK = data.no_kk || "";

    /* =====================================
     TUTUP REVIEW OCR
     ===================================== */

    Modal.close();

    /* =====================================
     BUKA LANGSUNG FORM MANUAL
     ===================================== */

    setTimeout(function () {
      Penduduk.openCreateManual();

      /* ===================================
       TUNGGU FORM SELESAI RENDER
       =================================== */

      setTimeout(function () {
        Penduduk.fillCreateFromOCR(
          Penduduk._selectedOCRMember,
          Penduduk._selectedOCRNoKK,
        );
      }, 50);
    }, 150);
  },

  /* =========================================
   PAGINATION
========================================= */

  renderPagination: function () {
    const totalData = Array.isArray(Penduduk.filteredData)
      ? Penduduk.filteredData.length
      : 0;

    const totalPages = Math.max(1, Math.ceil(totalData / Penduduk.pageSize));

    if (Penduduk.currentPage > totalPages) {
      Penduduk.currentPage = totalPages;
    }

    Pagination.render({
      target: "#paginationPenduduk",

      page: Penduduk.currentPage,

      totalPages: totalPages,

      onChange: function (page) {
        Penduduk.currentPage = page;

        Penduduk.renderPaginatedTable();
      },
    });
  },

  renderPaginatedTable: function () {
    const data = Array.isArray(Penduduk.filteredData)
      ? Penduduk.filteredData
      : [];

    const start = (Penduduk.currentPage - 1) * Penduduk.pageSize;

    const end = start + Penduduk.pageSize;

    const pageData = data.slice(start, end);

    Penduduk.renderTable(pageData);

    Penduduk.renderPagination();
  },

  /* =========================================
   FILL CREATE FORM FROM OCR
========================================= */

  fillCreateFromOCR: function (member, noKK) {
    if (!member) {
      console.warn("[PENDUDUK OCR] Member kosong.");

      return;
    }

    console.log("[PENDUDUK OCR] Mengisi form:", member);

    /* =====================================
     HELPER
     ===================================== */

    const setField = function (name, value) {
      if (value === undefined || value === null || value === "") {
        return;
      }

      const field = document.querySelector(`[name="${name}"]`);

      if (!field) {
        console.warn(`[PENDUDUK OCR] Field tidak ditemukan: ${name}`);

        return;
      }

      field.value = String(value);

      field.dispatchEvent(
        new Event("input", {
          bubbles: true,
        }),
      );

      field.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );
    };

    /* =====================================
     SELECT
     ===================================== */

    const setSelect = function (name, value) {
      if (value === undefined || value === null || value === "") {
        return;
      }

      const field = document.querySelector(`[name="${name}"]`);

      if (!field) {
        console.warn(`[PENDUDUK OCR] Select tidak ditemukan: ${name}`);

        return;
      }

      const target = String(value).trim().toLowerCase();

      let matched = false;

      Array.from(field.options).forEach(function (option) {
        const optionValue = String(option.value || "")
          .trim()
          .toLowerCase();

        const optionText = String(option.textContent || "")
          .trim()
          .toLowerCase();

        if (optionValue === target || optionText === target) {
          field.value = option.value;

          matched = true;
        }
      });

      if (!matched) {
        console.warn(
          `[PENDUDUK OCR] Option tidak ditemukan: ${name} = ${value}`,
        );

        return;
      }

      field.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );
    };

    /* =====================================
     NO KK
     DARI HEADER KK
     ===================================== */

    setField("NO_KK", noKK);

    /* =====================================
     IDENTITAS
     ===================================== */

    setField("NIK", member.nik);

    setField("NAMA", member.nama);

    setField("TEMPAT_LAHIR", member.tempat_lahir);

    /* =====================================
     TANGGAL LAHIR
     ===================================== */

    if (member.tanggal_lahir) {
      const tanggal = Penduduk.ocrDateToInput(member.tanggal_lahir);

      if (tanggal) {
        setField("TANGGAL_LAHIR", tanggal);
      }
    }

    /* =====================================
     JENIS KELAMIN
     ===================================== */

    setSelect(
      "JENIS_KELAMIN",
      Penduduk.normalizeJenisKelamin(member.jenis_kelamin),
    );

    /* =====================================
     AGAMA
     ===================================== */

    setSelect("AGAMA", Penduduk.normalizeAgama(member.agama));

    /* =====================================
     HUBUNGAN KELUARGA
     ===================================== */

    setSelect(
      "HUBUNGAN_KELUARGA",
      Penduduk.normalizeHubungan(member.hubungan_keluarga),
    );

    /* =====================================
     STATUS PERKAWINAN
     ===================================== */

    setSelect(
      "STATUS_PERKAWINAN",
      Penduduk.normalizeStatusKawin(member.status_perkawinan),
    );

    /* =====================================
    PENDIDIKAN & PEKERJAAN
    ===================================== */

    setField("PENDIDIKAN_TERAKHIR", member.pendidikan_terakhir);

    setField("PEKERJAAN", member.pekerjaan);

    /* =====================================
     ALAMAT
     ===================================== */

    setField("ALAMAT", member.alamat);

    /* =====================================
     RT / RW
     ===================================== */

    setField("RT", member.rt);

    setField("RW", member.rw);

    /* =====================================
     DESA
     ===================================== */

    setSelect("DESA", member.desa);

    /* =====================================
     SELESAI
     ===================================== */

    console.log("[PENDUDUK OCR] Form berhasil diisi.");
  },

  /* =======================================
     OCR SCAN
  ======================================= */

  scanKK: async function (file, button) {
    try {
      if (button) {
        button.disabled = true;

        button.innerHTML = `

          <i
            data-lucide="loader-circle"
          ></i>

          <span>
            Membaca KK...
          </span>

        `;

        Penduduk.renderIcons();
      }

      console.log("[PENDUDUK OCR] File:", file.name);

      const compressed = await Penduduk.compressImage(file);

      console.log(
        "[PENDUDUK OCR] Original:",
        Penduduk.formatFileSize(file.size),
      );

      console.log(
        "[PENDUDUK OCR] Compressed:",
        Penduduk.formatFileSize(compressed.blob.size),
      );

      const base64 = await Penduduk.blobToBase64(compressed.blob);

      console.log("[PENDUDUK OCR] Sending scanKK...");

      const response = await API.post("scanKK", {
        imageBase64: base64,

        mimeType: compressed.mimeType,
      });

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Gagal membaca KK dengan AI.");
      }

      const data = response.data;

      if (
        !data ||
        !Array.isArray(data.anggota_keluarga) ||
        !data.anggota_keluarga.length
      ) {
        throw new Error("AI tidak menemukan anggota keluarga.");
      }

      Penduduk.ocrResult = data;

      console.log("[PENDUDUK OCR] Result:", data);

      console.log("[PENDUDUK OCR] Usage:", response.usage);

      Modal.close();

      Toast.success(
        `AI menemukan ${data.anggota_keluarga.length} anggota keluarga.`,
      );

      Penduduk.openOCRReview(data);
    } catch (error) {
      console.error("[PENDUDUK OCR] Scan failed:", error);

      Toast.error(error?.message || "Gagal membaca KK.");
    } finally {
      if (button) {
        button.disabled = false;

        button.innerHTML = `

          <i
            data-lucide="scan-text"
          ></i>

          <span>
            Baca KK
          </span>

        `;

        Penduduk.renderIcons();
      }
    }
  },

  /* =======================================
     COMPRESS IMAGE
  ======================================= */

  compressImage: function (file) {
    return new Promise(function (resolve, reject) {
      const objectUrl = URL.createObjectURL(file);

      const image = new Image();

      image.onload = function () {
        URL.revokeObjectURL(objectUrl);

        const maxSize = 1800;

        let width = image.naturalWidth;

        let height = image.naturalHeight;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);

          width = Math.round(width * ratio);

          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;

        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Canvas browser tidak tersedia."));

          return;
        }

        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          function (blob) {
            if (!blob) {
              reject(new Error("Gagal melakukan kompresi gambar."));

              return;
            }

            resolve({
              blob: blob,

              mimeType: "image/jpeg",

              width: width,

              height: height,
            });
          },

          "image/jpeg",

          0.82,
        );
      };

      image.onerror = function () {
        URL.revokeObjectURL(objectUrl);

        reject(new Error("Gambar KK tidak dapat dibaca browser."));
      };

      image.src = objectUrl;
    });
  },

  /* =======================================
     BLOB → BASE64
  ======================================= */

  blobToBase64: function (blob) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();

      reader.onload = function () {
        const result = String(reader.result || "");

        const commaIndex = result.indexOf(",");

        if (commaIndex === -1) {
          reject(new Error("Base64 gambar tidak valid."));

          return;
        }

        resolve(result.substring(commaIndex + 1));
      };

      reader.onerror = function () {
        reject(new Error("Gagal membaca gambar."));
      };

      reader.readAsDataURL(blob);
    });
  },

  /* =======================================
     OCR REVIEW
  ======================================= */
  openOCRReview: function (data) {
    /* =====================================
     SIMPAN DATA OCR
  ===================================== */

    Penduduk._ocrReviewData = data;

    console.log("[PENDUDUK OCR] Review data:", Penduduk._ocrReviewData);

    /* =====================================
     MEMBERS
  ===================================== */

    const members = Array.isArray(data?.anggota_keluarga)
      ? data.anggota_keluarga
      : [];

    if (!members.length) {
      Toast.error("Tidak ada data anggota keluarga.");

      return;
    }

    /* =====================================
     NO KK
  ===================================== */

    const noKK = Penduduk.escape(data.no_kk || "-");

    /* =====================================
     BODY
  ===================================== */

    const body = `

    <div>

      <div
        style="
          padding:14px 16px;
          border-radius:12px;
          background:#eef4ff;
          margin-bottom:18px;
        "
      >

        <div
          style="
            font-size:12px;
            color:#64748b;
            margin-bottom:4px;
          "
        >
          NO. KK
        </div>

        <strong>
          ${noKK}
        </strong>

        <div
          style="
            margin-top:6px;
            font-size:13px;
            color:#64748b;
          "
        >
          ${members.length}
          anggota ditemukan oleh AI
        </div>

      </div>


      <div
        style="
          display:flex;
          flex-direction:column;
          gap:14px;
        "
      >

        ${members
          .map(function (member, index) {
            return Penduduk.renderOCRMember(member, index, data.no_kk);
          })
          .join("")}

      </div>


      <div
        style="
          margin-top:18px;
          padding:12px 14px;
          border-radius:10px;
          background:#fff8e8;
          color:#7c5a00;
          font-size:13px;
        "
      >

        <strong>
          Verifikasi wajib:
        </strong>

        Periksa terutama NIK,
        nama, tanggal lahir,
        hubungan keluarga,
        RT/RW, dan desa
        sebelum menggunakan data.

      </div>

    </div>

  `;

    /* =====================================
     MODAL
  ===================================== */

    Modal.open({
      title: "Review Hasil Scan KK",

      body: body,

      footer: `

      <button
        type="button"
        class="btn btn-secondary"
        onclick="Modal.close()"
      >
        Tutup
      </button>

    `,

      size: "lg",
    });

    Penduduk.renderIcons();
  },

  /* =========================================
   OCR VALIDATION UI
========================================= */

  renderOCRIdentityStatus: function (validation) {
    if (!validation) {
      return "";
    }

    let html = "";

    /* =====================================
     NO KK
  ===================================== */

    if (validation.noKK) {
      if (validation.noKK.valid) {
        html += `
        <div class="penduduk-ocr-status success">
          <span>✓</span>
          <span>NO. KK valid — 16 digit</span>
        </div>
      `;
      } else {
        html += `
        <div class="penduduk-ocr-status warning">
          <span>⚠</span>
          <span>
            ${validation.noKK.issues
              .map(function (issue) {
                return escapeHtml(issue);
              })
              .join(" ")}
          </span>
        </div>
      `;
      }
    }

    /* =====================================
     SUMMARY
  ===================================== */

    const suspicious = validation.summary ? validation.summary.suspicious : 0;

    const total = validation.summary ? validation.summary.total : 0;

    if (suspicious > 0) {
      html += `
      <div class="penduduk-ocr-summary warning">
        ⚠ ${suspicious} dari ${total}
        anggota perlu diperiksa.
      </div>
    `;
    } else if (total > 0) {
      html += `
      <div class="penduduk-ocr-summary success">
        ✓ Semua NIK anggota valid.
      </div>
    `;
    }

    return html;
  },

  /* =========================================
   OCR NIK STATUS
========================================= */

  renderOCRNIKStatus: function (validation, index) {
    if (!validation || !Array.isArray(validation.members)) {
      return "";
    }

    const item = validation.members[index];

    if (!item) {
      return "";
    }

    if (item.valid) {
      return `
      <div class="penduduk-ocr-field-status success">
        <span>✓</span>
        <span>Valid — 16 digit</span>
      </div>
    `;
    }

    return `
    <div class="penduduk-ocr-field-status warning">
      <span>⚠</span>
      <span>
        ${item.issues
          .map(function (issue) {
            return escapeHtml(issue);
          })
          .join(" ")}
      </span>
    </div>
  `;
  },

  /* =======================================
     OCR MEMBER CARD
  ======================================= */

  renderOCRMember: function (member, index, noKK) {
    const safeIndex = Number(index);

    const value = function (field) {
      return Penduduk.escapeAttribute(member?.[field] || "");
    };

    return `

    <div
      class="ocr-review-card"
      data-ocr-index="${safeIndex}"
      style="
        border:1px solid #e2e8f0;
        border-radius:14px;
        padding:16px;
        background:#fff;
      "
    >

      <div
        style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin-bottom:14px;
        "
      >

        <div>

          <div
            style="
              font-size:12px;
              color:#64748b;
              margin-bottom:3px;
            "
          >
            ANGGOTA ${safeIndex + 1}
          </div>

          <strong>
            ${Penduduk.escape(member?.nama || "Tanpa Nama")}
          </strong>

        </div>

        <span class="badge badge-success">
          HASIL AI
        </span>

      </div>


      <div class="form-grid">

        ${Penduduk.ocrTextField(safeIndex, "nik", "NIK", value("nik"))}

        ${Penduduk.ocrTextField(
          safeIndex,
          "nama",
          "Nama Lengkap",
          value("nama"),
          true,
        )}

        ${Penduduk.ocrTextField(
          safeIndex,
          "tempat_lahir",
          "Tempat Lahir",
          value("tempat_lahir"),
        )}

        ${Penduduk.ocrTextField(
          safeIndex,
          "tanggal_lahir",
          "Tanggal Lahir",
          Penduduk.escapeAttribute(
            Penduduk.ocrDateToInput(member?.tanggal_lahir),
          ),
          false,
          "date",
        )}

        ${Penduduk.ocrSelectField(
          safeIndex,
          "jenis_kelamin",
          "Jenis Kelamin",
          ["Laki-laki", "Perempuan"],
          Penduduk.normalizeJenisKelamin(member?.jenis_kelamin),
        )}

        ${Penduduk.ocrSelectField(
          safeIndex,
          "agama",
          "Agama",
          [
            "Islam",
            "Kristen Protestan",
            "Katolik",
            "Hindu",
            "Buddha",
            "Konghucu",
          ],
          Penduduk.normalizeAgama(member?.agama),
        )}

        ${Penduduk.ocrSelectField(
          safeIndex,
          "hubungan_keluarga",
          "Hubungan Keluarga",
          [
            "Kepala Keluarga",
            "Suami",
            "Istri",
            "Anak",
            "Orang Tua",
            "Saudara",
            "Lainnya",
          ],
          Penduduk.normalizeHubungan(member?.hubungan_keluarga),
        )}

        ${Penduduk.ocrSelectField(
          safeIndex,
          "status_perkawinan",
          "Status Perkawinan",
          ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"],
          Penduduk.normalizeStatusKawin(member?.status_perkawinan),
        )}

        ${Penduduk.ocrTextField(
          safeIndex,
          "pendidikan_terakhir",
          "Pendidikan Terakhir",
          value("pendidikan_terakhir"),
        )}

        ${Penduduk.ocrTextField(
          safeIndex,
          "pekerjaan",
          "Pekerjaan",
          value("pekerjaan"),
        )}

        ${Penduduk.ocrTextField(
          safeIndex,
          "alamat",
          "Alamat",
          value("alamat"),
          false,
          "text",
          true,
        )}

        ${Penduduk.ocrTextField(safeIndex, "rt", "RT", value("rt"))}

        ${Penduduk.ocrTextField(safeIndex, "rw", "RW", value("rw"))}

        ${Penduduk.ocrTextField(safeIndex, "desa", "Desa", value("desa"))}

      </div>


      <div
        style="
          margin-top:16px;
          padding-top:14px;
          border-top:1px solid #eef2f7;
          display:flex;
          justify-content:flex-end;
        "
      >

        <button
          type="button"
          class="btn btn-primary"
          data-action="use-ocr-member"
          data-index="${safeIndex}"
        >

          <i data-lucide="arrow-down-to-line"></i>

          Gunakan Data Ini

        </button>

      </div>

    </div>

  `;
  },
  /* =======================================
     OCR TEXT FIELD
  ======================================= */

  ocrTextField: function (
    index,
    key,
    label,
    value,
    required,
    type,
    full,
    validation,
  ) {
    let statusHtml = "";

    /* =====================================
     VALIDATION STATUS
  ===================================== */

    if (validation) {
      if (validation.valid) {
        statusHtml = `
        <div class="penduduk-ocr-field-status success">
          <span>✓</span>
          <span>Valid — 16 digit</span>
        </div>
      `;
      } else {
        const issues = Array.isArray(validation.issues)
          ? validation.issues
          : [];

        statusHtml = `
        <div class="penduduk-ocr-field-status warning">
          <span>⚠</span>
          <span>
            ${issues
              .map(function (issue) {
                return Penduduk.escape(issue);
              })
              .join(" ")}
          </span>
        </div>
      `;
      }
    }

    return `

    <div
      class="form-group ${full ? "form-group-full" : ""}"
    >

      <label class="form-label">

        ${Penduduk.escape(label)}

        ${required ? `<span class="required">*</span>` : ""}

      </label>


      <input
        type="${type || "text"}"
        class="form-control"
        id="ocr_${key}_${index}"
        value="${value || ""}"
        ${required ? "required" : ""}
        ${
          key === "nik"
            ? `
            maxlength="16"
            inputmode="numeric"
            autocomplete="off"
          `
            : ""
        }
      >


      ${statusHtml}

    </div>

  `;
  },

  /* =======================================
     OCR SELECT FIELD
  ======================================= */

  ocrSelectField: function (index, key, label, options, selected) {
    return `

      <div
        class="form-group"
      >

        <label class="form-label">

          ${Penduduk.escape(label)}

        </label>


        <select
          class="form-control"
          id="ocr_${key}_${index}"
        >

          <option value="">
            Pilih
          </option>


          ${options
            .map(function (option) {
              return Penduduk.option(option, selected);
            })
            .join("")}

        </select>

      </div>

    `;
  },

  /* =======================================
     COLLECT OCR MEMBER
  ======================================= */

  collectOCRMember: function (index) {
    const get = function (key) {
      const element = document.getElementById(`ocr_${key}_${index}`);

      return element ? String(element.value || "").trim() : "";
    };

    return {
      nik: get("nik"),

      nama: get("nama"),

      tempat_lahir: get("tempat_lahir"),

      tanggal_lahir: get("tanggal_lahir"),

      jenis_kelamin: get("jenis_kelamin"),

      agama: get("agama"),

      hubungan_keluarga: get("hubungan_keluarga"),

      status_perkawinan: get("status_perkawinan"),

      pendidikan_terakhir: get("pendidikan_terakhir"),

      pekerjaan: get("pekerjaan"),

      alamat: get("alamat"),

      rt: get("rt"),

      rw: get("rw"),

      desa: get("desa"),
    };
  },

  /* =======================================
     USE OCR MEMBER
     ======================================= */

  applyOCRMember: function (index) {
    const member = Penduduk.collectOCRMember(index);

    if (!member.nik) {
      Toast.error("NIK belum diisi.");

      return;
    }

    if (!/^\d{16}$/.test(member.nik)) {
      Toast.error("NIK harus terdiri dari 16 digit.");

      return;
    }

    if (!member.nama) {
      Toast.error("Nama lengkap belum diisi.");

      return;
    }

    const noKK = String(Penduduk.ocrResult?.no_kk || "").trim();

    const prefill = {
      NO_KK: noKK,

      NIK: member.nik,

      NAMA: member.nama,

      TEMPAT_LAHIR: member.tempat_lahir,

      TANGGAL_LAHIR: member.tanggal_lahir,

      JENIS_KELAMIN: Penduduk.normalizeJenisKelamin(member.jenis_kelamin),

      AGAMA: Penduduk.normalizeAgama(member.agama),

      HUBUNGAN_KELUARGA: Penduduk.normalizeHubungan(member.hubungan_keluarga),

      STATUS_PERKAWINAN: Penduduk.normalizeStatusKawin(
        member.status_perkawinan,
      ),

      JUMLAH_TANGGUNGAN: "0",

      DESA: Penduduk.normalizeDesa(member.desa),

      RESIDENCE: "",

      ALAMAT: member.alamat,

      RT: Penduduk.normalizeRT(member.rt),

      RW: Penduduk.normalizeRW(member.rw),

      STATUS_PENDIDIKAN: Penduduk.inferStatusPendidikan(
        member.pendidikan_terakhir,
      ),

      PENDIDIKAN_TERAKHIR: Penduduk.normalizePendidikan(
        member.pendidikan_terakhir,
      ),

      SEKOLAH: "",

      KELAS: "",

      STATUS_PEKERJAAN: Penduduk.inferStatusPekerjaan(member.pekerjaan),

      PEKERJAAN: Penduduk.normalizePekerjaan(member.pekerjaan),

      PENDAPATAN_BULANAN: "",

      NO_HP: "",

      STATUS_PENDUDUK: "AKTIF",
    };

    console.log("[PENDUDUK OCR] Apply member:", prefill);

    Modal.close();

    setTimeout(function () {
      Penduduk.openCreateManual(prefill, true);
    }, 100);
  },

  /* =======================================
     OCR DATE
  ======================================= */

  ocrDateToInput: function (value) {
    if (!value) {
      return "";
    }

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    let match = text.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);

    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }

    match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

    if (match) {
      return `${match[3]}-${String(match[2]).padStart(2, "0")}-${String(
        match[1],
      ).padStart(2, "0")}`;
    }

    return "";
  },

  /* =======================================
     OCR NORMALIZATION
  ======================================= */

  normalizeJenisKelamin: function (value) {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    if (text === "l" || text.includes("laki")) {
      return "Laki-laki";
    }

    if (text === "p" || text.includes("perempuan")) {
      return "Perempuan";
    }

    return "";
  },

  normalizeAgama: function (value) {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    const map = {
      islam: "Islam",

      kristen: "Kristen Protestan",

      "kristen protestan": "Kristen Protestan",

      protestan: "Kristen Protestan",

      katolik: "Katolik",

      hindu: "Hindu",

      buddha: "Buddha",

      budha: "Buddha",

      konghucu: "Konghucu",
    };

    return map[text] || "";
  },

  normalizeHubungan: function (value) {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    if (text.includes("kepala keluarga")) {
      return "Kepala Keluarga";
    }

    if (text === "suami") {
      return "Suami";
    }

    if (text === "istri") {
      return "Istri";
    }

    if (text.includes("anak")) {
      return "Anak";
    }

    if (
      text.includes("orang tua") ||
      text.includes("ayah") ||
      text.includes("ibu")
    ) {
      return "Orang Tua";
    }

    if (text.includes("saudara")) {
      return "Saudara";
    }

    return text ? "Lainnya" : "";
  },

  normalizeStatusKawin: function (value) {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    if (text.includes("belum")) {
      return "Belum Kawin";
    }

    if (text === "kawin" || text === "menikah") {
      return "Kawin";
    }

    if (text.includes("cerai hidup")) {
      return "Cerai Hidup";
    }

    if (text.includes("cerai mati")) {
      return "Cerai Mati";
    }

    return "";
  },

  normalizeDesa: function (value) {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    if (text === "sologi") {
      return "Sologi";
    }

    if (text === "kawasi") {
      return "Kawasi";
    }

    return "";
  },

  normalizeRT: function (value) {
    const text = String(value || "")
      .replace(/\D/g, "")
      .trim();

    if (!text) {
      return "";
    }

    return text.padStart(3, "0");
  },

  normalizeRW: function (value) {
    const text = String(value || "")
      .replace(/\D/g, "")
      .trim();

    if (!text) {
      return "";
    }

    return text.padStart(3, "0");
  },

  /* =========================================
   NORMALIZE PENDIDIKAN
========================================= */

  normalizePendidikan: function (value) {
    const text = String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");

    if (!text) {
      return "";
    }

    /* =====================================
     TIDAK / BELUM SEKOLAH
  ===================================== */

    if (
      text.includes("TIDAK SEKOLAH") ||
      text.includes("BELUM SEKOLAH") ||
      text.includes("TIDAK/BELUM SEKOLAH") ||
      text.includes("TIDAK / BELUM SEKOLAH")
    ) {
      return "Tidak Sekolah";
    }

    /* =====================================
     TK
  ===================================== */

    if (text === "TK" || text.includes("TAMAN KANAK")) {
      return "TK";
    }

    /* =====================================
     SD / SEDERAJAT
  ===================================== */

    if (
      text === "SD" ||
      text.includes("SD SEDERAJAT") ||
      text.includes("SD/SEDERAJAT") ||
      text.includes("MADRASAH IBTIDAIYAH") ||
      text === "MI"
    ) {
      return "SD";
    }

    /* =====================================
     SMP / SEDERAJAT
  ===================================== */

    if (
      text === "SMP" ||
      text.includes("SMP SEDERAJAT") ||
      text.includes("SMP/SEDERAJAT") ||
      text.includes("MADRASAH TSANAWIYAH") ||
      text === "MTS"
    ) {
      return "SMP";
    }

    /* =====================================
     SMA / SLTA / SEDERAJAT
  ===================================== */

    if (
      text === "SMA" ||
      text === "SMU" ||
      text === "SMK" ||
      text === "STM" ||
      text === "SMEA" ||
      text === "MA" ||
      text === "MAK" ||
      text === "SLTA" ||
      text === "SMA/SLTA" ||
      text.includes("SMA SEDERAJAT") ||
      text.includes("SLTA SEDERAJAT") ||
      text.includes("SLTA/SEDERAJAT") ||
      text.includes("SMA/SEDERAJAT") ||
      text.includes("MADRASAH ALIYAH") ||
      text.includes("PAKET C")
    ) {
      return "SMA/SLTA Sederajat";
    }

    /* =====================================
     D1
  ===================================== */

    if (
      text === "D1" ||
      text.includes("DIPLOMA 1") ||
      text.includes("DIPLOMA I")
    ) {
      return "D1";
    }

    /* =====================================
     D2
  ===================================== */

    if (
      text === "D2" ||
      text.includes("DIPLOMA 2") ||
      text.includes("DIPLOMA II")
    ) {
      return "D2";
    }

    /* =====================================
     D3
  ===================================== */

    if (
      text === "D3" ||
      text.includes("DIPLOMA 3") ||
      text.includes("DIPLOMA III")
    ) {
      return "D3";
    }

    /* =====================================
     D4 / S1
  ===================================== */

    if (
      text === "D4" ||
      text.includes("DIPLOMA 4") ||
      text.includes("DIPLOMA IV") ||
      text === "S1" ||
      text.includes("STRATA 1") ||
      text.includes("SARJANA")
    ) {
      return "D4/S1";
    }

    /* =====================================
     S2
  ===================================== */

    if (
      text === "S2" ||
      text.includes("STRATA 2") ||
      text.includes("MAGISTER")
    ) {
      return "S2";
    }

    /* =====================================
     S3
  ===================================== */

    if (text === "S3" || text.includes("STRATA 3") || text.includes("DOKTOR")) {
      return "S3";
    }

    return "";
  },

  inferStatusPendidikan: function (value) {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    if (text.includes("pelajar")) {
      return "Pelajar";
    }

    if (text.includes("mahasiswa")) {
      return "Mahasiswa";
    }

    if (text.includes("tidak sekolah")) {
      return "Tidak Sekolah";
    }

    return "Lulus";
  },

  normalizePekerjaan: function (value) {
    return String(value || "").trim();
  },

  inferStatusPekerjaan: function (value) {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    if (!text) {
      return "";
    }

    if (text.includes("pelajar")) {
      return "Pelajar";
    }

    if (text.includes("mahasiswa")) {
      return "Mahasiswa";
    }

    if (text.includes("pensiun")) {
      return "Pensiun";
    }

    if (text.includes("tidak bekerja") || text.includes("ibu rumah")) {
      return "Tidak Bekerja";
    }

    return "Bekerja";
  },

  /* =========================================
   OCR IDENTITY VALIDATOR
========================================= */

  validateOCRIdentity: function (ocrData) {
    const result = {
      valid: true,

      noKK: {
        value: "",
        valid: false,
        issues: [],
      },

      members: [],

      summary: {
        total: 0,
        valid: 0,
        suspicious: 0,
      },
    };

    /* =====================================
     HELPER STRING
  ===================================== */

    const toSafeString = function (value) {
      if (value === null || value === undefined) {
        return "";
      }

      return String(value).trim();
    };

    /* =====================================
     NORMALIZE ID
     
     Hanya menghapus spasi / tanda -
     TIDAK mengubah digit.
     
     JANGAN Number()
  ===================================== */

    const normalizeIdentity = function (value) {
      return toSafeString(value).replace(/[\s-]/g, "");
    };

    /* =====================================
     VALIDATE 16 DIGIT
  ===================================== */

    const validate16Digit = function (value) {
      const issues = [];

      if (!value) {
        issues.push("Data kosong.");

        return issues;
      }

      if (!/^\d+$/.test(value)) {
        issues.push("Harus berisi angka saja.");

        return issues;
      }

      if (value.length !== 16) {
        issues.push(`Harus 16 digit, saat ini ${value.length} digit.`);
      }

      return issues;
    };

    /* =====================================
     NO KK
  ===================================== */

    const noKK = normalizeIdentity(ocrData?.no_kk);

    result.noKK.value = noKK;

    result.noKK.issues = validate16Digit(noKK);

    result.noKK.valid = result.noKK.issues.length === 0;

    if (!result.noKK.valid) {
      result.valid = false;
    }

    /* =====================================
     MEMBERS
  ===================================== */

    const members = Array.isArray(ocrData?.anggota_keluarga)
      ? ocrData.anggota_keluarga
      : [];

    result.summary.total = members.length;

    const nikMap = {};

    members.forEach(function (member, index) {
      const nik = normalizeIdentity(member?.nik);

      const item = {
        index: index,

        nik: nik,

        valid: true,

        suspicious: false,

        issues: [],
      };

      /* =================================
       VALIDASI NIK
    ================================= */

      const nikIssues = validate16Digit(nik);

      nikIssues.forEach(function (issue) {
        item.issues.push(issue);
      });

      /* =================================
       DUPLIKAT NIK
    ================================= */

      if (nik) {
        if (nikMap[nik] !== undefined) {
          item.issues.push(`NIK sama dengan anggota #${nikMap[nik] + 1}.`);
        } else {
          nikMap[nik] = index;
        }
      }

      /* =================================
       NIK = NO KK
    ================================= */

      if (nik && noKK && nik === noKK) {
        item.issues.push("NIK sama dengan NO. KK.");
      }

      /* =================================
       FINAL STATUS
    ================================= */

      item.valid = item.issues.length === 0;

      item.suspicious = !item.valid;

      if (item.suspicious) {
        result.valid = false;

        result.summary.suspicious++;
      } else {
        result.summary.valid++;
      }

      result.members.push(item);
    });

    /* =====================================
     EMPTY MEMBERS
  ===================================== */

    if (members.length === 0) {
      result.valid = false;
    }

    /* =====================================
     RETURN
  ===================================== */

    return result;
  },

  /* =========================================
   OCR IDENTITY STATUS
========================================= */

  getOCRIdentityStatus: function (ocrData) {
    const validation = Penduduk.validateOCRIdentity(ocrData);

    console.log("[PENDUDUK OCR] Identity validation:", validation);

    return validation;
  },

  /* =======================================
     MANUAL CREATE FORM
  ======================================= */

  openCreateManual: function (prefill, fromOCR) {
    prefill = prefill || {};

    console.log(
      "[PENDUDUK] Open manual create",
      fromOCR ? "FROM OCR" : "MANUAL",
    );

    const v = function (key) {
      return Penduduk.escapeAttribute(prefill?.[key] ?? "");
    };

    const body = `

      ${
        fromOCR
          ? `

            <div
              style="
                padding:12px 14px;
                margin-bottom:18px;
                border-radius:10px;
                background:#eef4ff;
                font-size:13px;
              "
            >

              <strong>
                Draft hasil OCR AI
              </strong>

              <div
                style="
                  margin-top:4px;
                  color:#64748b;
                "
              >
                Data dari KK sudah diisi otomatis.
                Lengkapi field yang tidak terdapat
                pada KK sebelum menyimpan.
              </div>

            </div>

          `
          : ""
      }


      <form
        id="formTambahPenduduk"
      >

        <div class="form-grid">

          <!-- NO KK -->

          <div class="form-group">

            <label class="form-label">
              No. KK
              <span class="required">*</span>
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukNoKK"
              name="NO_KK"
              maxlength="16"
              inputmode="numeric"
              placeholder="16 digit No. KK"
              value="${v("NO_KK")}"
              required
            />

            <div
              id="pendudukNoKKStatus"
              class="penduduk-ocr-field-status"
            ></div>

          </div>


          <!-- NIK -->

          <div class="form-group">

            <label class="form-label">
              NIK
              <span class="required">*</span>
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukNIK"
              name="NIK"
              maxlength="16"
              inputmode="numeric"
              placeholder="16 digit NIK"
              value="${v("NIK")}"
              required
            />

          </div>


          <!-- NAMA -->

          <div class="form-group form-group-full">

            <label class="form-label">
              Nama Lengkap
              <span class="required">*</span>
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukNama"
              name="NAMA"
              placeholder="Nama lengkap"
              value="${v("NAMA")}"
              required
            />

          </div>


          <!-- TEMPAT LAHIR -->

          <div class="form-group">

            <label class="form-label">
              Tempat Lahir
              <span class="required">*</span>
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukTempatLahir"
              name="TEMPAT_LAHIR"
              placeholder="Tempat lahir"
              value="${v("TEMPAT_LAHIR")}"
              required
            />

          </div>


          <!-- TANGGAL LAHIR -->

          <div class="form-group">

            <label class="form-label">
              Tanggal Lahir
              <span class="required">*</span>
            </label>

            <input
              type="date"
              class="form-control"
              id="pendudukTanggalLahir"
              name="TANGGAL_LAHIR"
              value="${Penduduk.escapeAttribute(
                Penduduk.toInputDate(prefill.TANGGAL_LAHIR),
              )}"
              required
            />

          </div>


          <!-- JENIS KELAMIN -->

          <div class="form-group">

            <label class="form-label">
              Jenis Kelamin
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukJenisKelamin"
              name="JENIS_KELAMIN"
              required
            >

              <option value="">
                Pilih jenis kelamin
              </option>

              ${Penduduk.option("Laki-laki", prefill.JENIS_KELAMIN)}

              ${Penduduk.option("Perempuan", prefill.JENIS_KELAMIN)}

            </select>

          </div>


          <!-- AGAMA -->

          <div class="form-group">

            <label class="form-label">
              Agama
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukAgama"
              name="AGAMA"
              required
            >

              <option value="">
                Pilih agama
              </option>

              ${Penduduk.option("Islam", prefill.AGAMA)}

              ${Penduduk.option("Kristen Protestan", prefill.AGAMA)}

              ${Penduduk.option("Katolik", prefill.AGAMA)}

              ${Penduduk.option("Hindu", prefill.AGAMA)}

              ${Penduduk.option("Buddha", prefill.AGAMA)}

              ${Penduduk.option("Konghucu", prefill.AGAMA)}

            </select>

          </div>


          <!-- HUBUNGAN KELUARGA -->

          <div class="form-group">

            <label class="form-label">
              Hubungan Keluarga
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukHubunganKeluarga"
              name="HUBUNGAN_KELUARGA"
              required
            >

              <option value="">
                Pilih hubungan
              </option>

              ${Penduduk.option("Kepala Keluarga", prefill.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Suami", prefill.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Istri", prefill.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Anak", prefill.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Orang Tua", prefill.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Saudara", prefill.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Lainnya", prefill.HUBUNGAN_KELUARGA)}

            </select>

          </div>


          <!-- STATUS PERKAWINAN -->

          <div class="form-group">

            <label class="form-label">
              Status Perkawinan
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukStatusPerkawinan"
              name="STATUS_PERKAWINAN"
              required
            >

              <option value="">
                Pilih status
              </option>

              ${Penduduk.option("Belum Kawin", prefill.STATUS_PERKAWINAN)}

              ${Penduduk.option("Kawin", prefill.STATUS_PERKAWINAN)}

              ${Penduduk.option("Cerai Hidup", prefill.STATUS_PERKAWINAN)}

              ${Penduduk.option("Cerai Mati", prefill.STATUS_PERKAWINAN)}

            </select>

          </div>


          <!-- JUMLAH TANGGUNGAN -->

          <div class="form-group">

            <label class="form-label">
              Jumlah Tanggungan
            </label>

            <input
              type="number"
              class="form-control"
              id="pendudukJumlahTanggungan"
              name="JUMLAH_TANGGUNGAN"
              min="0"
              step="1"
              value="${v("JUMLAH_TANGGUNGAN") || "0"}"
            />

          </div>


          <!-- DESA -->

          <div class="form-group">

            <label class="form-label">
              Desa
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukDesa"
              name="DESA"
              required
            >

              <option value="">
                Pilih desa
              </option>

              ${Penduduk.option("Kawasi", prefill.DESA)}

              ${Penduduk.option("Sologi", prefill.DESA)}

            </select>

          </div>


          <!-- RESIDENCE -->

          <div class="form-group">

            <label class="form-label">
              Residence
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukResidence"
              name="RESIDENCE"
              required
            >

              <option value="">
                Pilih residence
              </option>

              ${Penduduk.option("ASLI", prefill.RESIDENCE)}

              ${Penduduk.option("PENDATANG", prefill.RESIDENCE)}

            </select>

          </div>


          <!-- ALAMAT -->

          <div class="form-group form-group-full">

            <label class="form-label">
              Alamat
            </label>

            <textarea
              class="form-control"
              id="pendudukAlamat"
              name="ALAMAT"
              rows="2"
              placeholder="Alamat lengkap"
            >${Penduduk.escape(prefill.ALAMAT || "")}</textarea>

          </div>


          <!-- RT -->

          <div class="form-group">

            <label class="form-label">
              RT
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukRT"
              name="RT"
              maxlength="3"
              placeholder="001"
              value="${v("RT")}"
            />

          </div>


          <!-- RW -->

          <div class="form-group">

            <label class="form-label">
              RW
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukRW"
              name="RW"
              maxlength="3"
              placeholder="001"
              value="${v("RW")}"
            />

          </div>


          <!-- STATUS PENDIDIKAN -->

          <div class="form-group">

            <label class="form-label">
              Status Pendidikan
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukStatusPendidikan"
              name="STATUS_PENDIDIKAN"
              required
            >

              <option value="">
                Pilih status pendidikan
              </option>

              ${Penduduk.option("Pelajar", prefill.STATUS_PENDIDIKAN)}

              ${Penduduk.option("Tidak Sekolah", prefill.STATUS_PENDIDIKAN)}

              ${Penduduk.option("Lulus", prefill.STATUS_PENDIDIKAN)}

              ${Penduduk.option("Mahasiswa", prefill.STATUS_PENDIDIKAN)}

            </select>

          </div>


          <!-- PENDIDIKAN TERAKHIR -->

          <div class="form-group">

            <label class="form-label">
              Pendidikan Terakhir
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukPendidikanTerakhir"
              name="PENDIDIKAN_TERAKHIR"
              required
            >

              <option value="">
                Pilih pendidikan
              </option>

              ${Penduduk.option("Tidak Sekolah", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("TK", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("SD", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("SMP", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("SMA", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("D1", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("D2", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("D3", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("D4", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("S1", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("S2", prefill.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("S3", prefill.PENDIDIKAN_TERAKHIR)}

            </select>

          </div>


          <!-- SEKOLAH -->

          <div class="form-group">

            <label class="form-label">
              Sekolah
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukSekolah"
              name="SEKOLAH"
              placeholder="Nama sekolah"
              value="${v("SEKOLAH")}"
            />

          </div>


          <!-- KELAS -->

          <div class="form-group">

            <label class="form-label">
              Kelas
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukKelas"
              name="KELAS"
              placeholder="Contoh: VIII"
              value="${v("KELAS")}"
            />

          </div>


          <!-- STATUS PEKERJAAN -->

          <div class="form-group">

            <label class="form-label">
              Status Pekerjaan
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukStatusPekerjaan"
              name="STATUS_PEKERJAAN"
              required
            >

              <option value="">
                Pilih status pekerjaan
              </option>

              ${Penduduk.option("Bekerja", prefill.STATUS_PEKERJAAN)}

              ${Penduduk.option("Tidak Bekerja", prefill.STATUS_PEKERJAAN)}

              ${Penduduk.option("Pelajar", prefill.STATUS_PEKERJAAN)}

              ${Penduduk.option("Mahasiswa", prefill.STATUS_PEKERJAAN)}

              ${Penduduk.option("Pensiun", prefill.STATUS_PEKERJAAN)}

            </select>

          </div>


          <!-- PEKERJAAN -->

          <div class="form-group">

            <label class="form-label">
              Pekerjaan
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukPekerjaan"
              name="PEKERJAAN"
              placeholder="Jenis pekerjaan"
              value="${v("PEKERJAAN")}"
            />

          </div>


          <!-- PENDAPATAN -->

          <div class="form-group">

            <label class="form-label">
              Pendapatan Bulanan
            </label>

            <input
              type="number"
              class="form-control"
              id="pendudukPendapatan"
              name="PENDAPATAN_BULANAN"
              min="0"
              step="1000"
              placeholder="0"
              value="${v("PENDAPATAN_BULANAN")}"
            />

          </div>


          <!-- NO HP -->

          <div class="form-group">

            <label class="form-label">
              No. HP
            </label>

            <input
              type="text"
              class="form-control"
              id="pendudukNoHP"
              name="NO_HP"
              inputmode="numeric"
              placeholder="08xxxxxxxxxx"
              value="${v("NO_HP")}"
            />

          </div>


          <!-- STATUS PENDUDUK -->

          <div class="form-group">

            <label class="form-label">
              Status Penduduk
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="pendudukStatus"
              name="STATUS_PENDUDUK"
              required
            >

              ${Penduduk.option("AKTIF", prefill.STATUS_PENDUDUK || "AKTIF")}

              ${Penduduk.option("NONAKTIF", prefill.STATUS_PENDUDUK)}

            </select>

          </div>

        </div>

      </form>

    `;

    const footer = `

      <button
        type="button"
        class="btn btn-secondary"
        id="btnBatalTambahPenduduk"
      >
        Batal
      </button>


      <button
        type="submit"
        form="formTambahPenduduk"
        class="btn btn-primary"
        id="btnSimpanPenduduk"
      >

        <i data-lucide="save"></i>

        <span>
          Simpan Penduduk
        </span>

      </button>

    `;

    Modal.open({
      title: fromOCR ? "Lengkapi Data Penduduk" : "Tambah Penduduk",

      body: body,

      footer: footer,

      size: "lg",
    });

    Penduduk.bindCreateForm();

    Penduduk.renderIcons();
  },

  /* =======================================
     BIND CREATE FORM
  ======================================= */

  bindCreateForm: function () {
    const form = document.getElementById("formTambahPenduduk");

    if (!form) {
      console.warn("[PENDUDUK] Form tambah penduduk tidak ditemukan.");

      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      Penduduk.create(form);
    });

    const batal = document.getElementById("btnBatalTambahPenduduk");

    if (batal) {
      batal.addEventListener("click", function () {
        Modal.close();
      });
    }
  },

  /* =======================================
     CREATE
  ======================================= */

  create: async function (form) {
    const button = document.getElementById("btnSimpanPenduduk");

    const payload = {
      NO_KK: Penduduk.value("pendudukNoKK"),

      NIK: Penduduk.value("pendudukNIK"),

      NAMA: Penduduk.value("pendudukNama"),

      TEMPAT_LAHIR: Penduduk.value("pendudukTempatLahir"),

      TANGGAL_LAHIR: Penduduk.value("pendudukTanggalLahir"),

      JENIS_KELAMIN: Penduduk.value("pendudukJenisKelamin"),

      AGAMA: Penduduk.value("pendudukAgama"),

      HUBUNGAN_KELUARGA: Penduduk.value("pendudukHubunganKeluarga"),

      STATUS_PERKAWINAN: Penduduk.value("pendudukStatusPerkawinan"),

      JUMLAH_TANGGUNGAN: Penduduk.value("pendudukJumlahTanggungan"),

      DESA: Penduduk.value("pendudukDesa"),

      RESIDENCE: Penduduk.value("pendudukResidence"),

      ALAMAT: Penduduk.value("pendudukAlamat"),

      RT: Penduduk.value("pendudukRT"),

      RW: Penduduk.value("pendudukRW"),

      STATUS_PENDIDIKAN: Penduduk.value("pendudukStatusPendidikan"),

      PENDIDIKAN_TERAKHIR: Penduduk.value("pendudukPendidikanTerakhir"),

      SEKOLAH: Penduduk.value("pendudukSekolah"),

      KELAS: Penduduk.value("pendudukKelas"),

      STATUS_PEKERJAAN: Penduduk.value("pendudukStatusPekerjaan"),

      PEKERJAAN: Penduduk.value("pendudukPekerjaan"),

      PENDAPATAN_BULANAN: Penduduk.value("pendudukPendapatan"),

      NO_HP: Penduduk.value("pendudukNoHP"),

      STATUS_PENDUDUK: Penduduk.value("pendudukStatus"),
    };

    const validation = Penduduk.validatePayload(payload);

    if (!validation.valid) {
      Toast.error(validation.message);

      return;
    }

    try {
      if (button) {
        button.disabled = true;

        button.innerHTML = `

          <i
            data-lucide="loader-circle"
          ></i>

          <span>
            Menyimpan...
          </span>

        `;

        Penduduk.renderIcons();
      }

      console.log("[PENDUDUK] Create payload:", payload);

      const response = await API.post("createPenduduk", payload);

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Gagal menambahkan penduduk.");
      }

      Modal.close();

      Toast.success(response.message || "Data penduduk berhasil ditambahkan.");

      await Penduduk.load();
    } catch (error) {
      console.error("[PENDUDUK] Create failed:", error);

      Toast.error(error?.message || "Gagal menambahkan penduduk.");
    } finally {
      if (button) {
        button.disabled = false;

        button.innerHTML = `

          <i
            data-lucide="save"
          ></i>

          <span>
            Simpan Penduduk
          </span>

        `;

        Penduduk.renderIcons();
      }
    }
  },

  /* =======================================
     DETAIL
  ======================================= */

  openDetail: async function (idPenduduk) {
    try {
      console.log("[PENDUDUK] Detail:", idPenduduk);

      if (!idPenduduk) {
        throw new Error("ID_PENDUDUK tidak ditemukan.");
      }

      const result = await API.get("getPendudukById", {
        ID_PENDUDUK: idPenduduk,
      });

      if (!result || result.success !== true || !result.data) {
        throw new Error(result?.message || "Data penduduk tidak ditemukan.");
      }

      const data = result.data;

      Modal.open({
        title: "Detail Penduduk",

        size: "lg",

        body: Penduduk.renderDetail(data),

        footer: `

          <button
            type="button"
            class="btn btn-secondary"
            onclick="Modal.close()"
          >
            Tutup
          </button>

        `,
      });
    } catch (error) {
      console.error("[PENDUDUK] Detail failed:", error);

      Toast.error(error?.message || "Gagal mengambil detail penduduk.");
    }
  },

  /* =======================================
     DETAIL VIEW
  ======================================= */

  renderDetail: function (data) {
    const fields = [
      ["ID Penduduk", data.ID_PENDUDUK],

      ["No. KK", data.NO_KK],

      ["NIK", data.NIK],

      ["Nama Lengkap", data.NAMA],

      ["Tempat Lahir", data.TEMPAT_LAHIR],

      ["Tanggal Lahir", Penduduk.formatDate(data.TANGGAL_LAHIR)],

      ["Jenis Kelamin", data.JENIS_KELAMIN],

      ["Agama", data.AGAMA],

      ["Hubungan Keluarga", data.HUBUNGAN_KELUARGA],

      ["Status Perkawinan", data.STATUS_PERKAWINAN],

      ["Jumlah Tanggungan", data.JUMLAH_TANGGUNGAN],

      ["Desa", data.DESA],

      ["Residence", data.RESIDENCE],

      ["Alamat", data.ALAMAT],

      ["RT", data.RT],

      ["RW", data.RW],

      ["Status Pendidikan", data.STATUS_PENDIDIKAN],

      ["Pendidikan Terakhir", data.PENDIDIKAN_TERAKHIR],

      ["Sekolah", data.SEKOLAH],

      ["Kelas", data.KELAS],

      ["Status Pekerjaan", data.STATUS_PEKERJAAN],

      ["Pekerjaan", data.PEKERJAAN],

      ["Pendapatan Bulanan", Penduduk.formatCurrency(data.PENDAPATAN_BULANAN)],

      ["No. HP", data.NO_HP],

      ["Status Penduduk", data.STATUS_PENDUDUK],
    ];

    return `

      <div class="detail-grid">

        ${fields
          .map(function (field) {
            return `

                <div
                  class="detail-item"
                >

                  <span
                    class="detail-label"
                  >
                    ${Penduduk.escape(field[0])}
                  </span>

                  <strong>
                    ${Penduduk.escape(field[1] ?? "-")}
                  </strong>

                </div>

              `;
          })
          .join("")}

      </div>

    `;
  },

  /* =======================================
     EDIT
  ======================================= */

  openEdit: async function (idPenduduk) {
    try {
      console.log("[PENDUDUK] Edit:", idPenduduk);

      if (!idPenduduk) {
        throw new Error("ID_PENDUDUK tidak ditemukan.");
      }

      const result = await API.get("getPendudukById", {
        ID_PENDUDUK: idPenduduk,
      });

      if (!result || result.success !== true || !result.data) {
        throw new Error(result?.message || "Data penduduk tidak ditemukan.");
      }

      const data = result.data;

      const body = Penduduk.renderEditForm(data);

      Modal.open({
        title: "Edit Penduduk",

        body: body,

        footer: `

          <button
            type="button"
            class="btn btn-secondary"
            id="btnBatalEditPenduduk"
          >
            Batal
          </button>


          <button
            type="button"
            class="btn btn-primary"
            id="btnUpdatePenduduk"
          >

            <i
              data-lucide="save"
            ></i>

            <span>
              Simpan Perubahan
            </span>

          </button>

        `,

        size: "lg",
      });

      Penduduk.renderIcons();

      document
        .getElementById("btnBatalEditPenduduk")
        ?.addEventListener("click", function () {
          Modal.close();
        });

      document
        .getElementById("btnUpdatePenduduk")
        ?.addEventListener("click", function () {
          Penduduk.update();
        });
    } catch (error) {
      console.error("[PENDUDUK] Edit failed:", error);

      Toast.error(error?.message || "Gagal mengambil data penduduk.");
    }
  },

  /* =======================================
     EDIT FORM
  ======================================= */

  renderEditForm: function (data) {
    return `

      <form
        id="formEditPenduduk"
      >

        <input
          type="hidden"
          id="edit_ID_PENDUDUK"
          value="${Penduduk.escapeAttribute(data.ID_PENDUDUK || "")}"
        >


        <div class="form-grid">

          ${Penduduk.editTextField(
            "NO_KK",
            "No. KK",
            data.NO_KK,
            true,
            16,
            "numeric",
          )}


          ${Penduduk.editTextField("NIK", "NIK", data.NIK, true, 16, "numeric")}


          ${Penduduk.editTextField("NAMA", "Nama Lengkap", data.NAMA, true)}


          ${Penduduk.editTextField(
            "TEMPAT_LAHIR",
            "Tempat Lahir",
            data.TEMPAT_LAHIR,
            true,
          )}


          <div class="form-group">

            <label class="form-label">
              Tanggal Lahir
              <span class="required">*</span>
            </label>

            <input
              type="date"
              class="form-control"
              id="edit_TANGGAL_LAHIR"
              value="${Penduduk.escapeAttribute(
                Penduduk.toInputDate(data.TANGGAL_LAHIR),
              )}"
              required
            >

          </div>


          <div class="form-group">

            <label class="form-label">
              Jenis Kelamin
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_JENIS_KELAMIN"
              required
            >

              ${Penduduk.option("Laki-laki", data.JENIS_KELAMIN)}

              ${Penduduk.option("Perempuan", data.JENIS_KELAMIN)}

            </select>

          </div>


          <div class="form-group">

            <label class="form-label">
              Agama
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_AGAMA"
              required
            >

              ${Penduduk.option("Islam", data.AGAMA)}

              ${Penduduk.option("Kristen Protestan", data.AGAMA)}

              ${Penduduk.option("Katolik", data.AGAMA)}

              ${Penduduk.option("Hindu", data.AGAMA)}

              ${Penduduk.option("Buddha", data.AGAMA)}

              ${Penduduk.option("Konghucu", data.AGAMA)}

            </select>

          </div>


          <div class="form-group">

            <label class="form-label">
              Hubungan Keluarga
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_HUBUNGAN_KELUARGA"
              required
            >

              ${Penduduk.option("Kepala Keluarga", data.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Suami", data.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Istri", data.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Anak", data.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Orang Tua", data.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Saudara", data.HUBUNGAN_KELUARGA)}

              ${Penduduk.option("Lainnya", data.HUBUNGAN_KELUARGA)}

            </select>

          </div>


          <div class="form-group">

            <label class="form-label">
              Status Perkawinan
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_STATUS_PERKAWINAN"
              required
            >

              ${Penduduk.option("Belum Kawin", data.STATUS_PERKAWINAN)}

              ${Penduduk.option("Kawin", data.STATUS_PERKAWINAN)}

              ${Penduduk.option("Cerai Hidup", data.STATUS_PERKAWINAN)}

              ${Penduduk.option("Cerai Mati", data.STATUS_PERKAWINAN)}

            </select>

          </div>


          <div class="form-group">

            <label class="form-label">
              Jumlah Tanggungan
            </label>

            <input
              type="number"
              class="form-control"
              id="edit_JUMLAH_TANGGUNGAN"
              min="0"
              step="1"
              value="${Penduduk.escapeAttribute(data.JUMLAH_TANGGUNGAN ?? 0)}"
            >

          </div>


          <div class="form-group">

            <label class="form-label">
              Desa
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_DESA"
              required
            >

              ${Penduduk.option("Kawasi", data.DESA)}

              ${Penduduk.option("Sologi", data.DESA)}

            </select>

          </div>


          <div class="form-group">

            <label class="form-label">
              Residence
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_RESIDENCE"
              required
            >

              ${Penduduk.option("ASLI", data.RESIDENCE)}

              ${Penduduk.option("PENDATANG", data.RESIDENCE)}

            </select>

          </div>


          <div
            class="form-group form-group-full"
          >

            <label class="form-label">
              Alamat
            </label>

            <textarea
              class="form-control"
              id="edit_ALAMAT"
              rows="2"
            >${Penduduk.escape(data.ALAMAT || "")}</textarea>

          </div>


          ${Penduduk.editTextField("RT", "RT", data.RT, false, 3)}


          ${Penduduk.editTextField("RW", "RW", data.RW, false, 3)}


          <div class="form-group">

            <label class="form-label">
              Status Pendidikan
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_STATUS_PENDIDIKAN"
              required
            >

              ${Penduduk.option("Pelajar", data.STATUS_PENDIDIKAN)}

              ${Penduduk.option("Tidak Sekolah", data.STATUS_PENDIDIKAN)}

              ${Penduduk.option("Lulus", data.STATUS_PENDIDIKAN)}

              ${Penduduk.option("Mahasiswa", data.STATUS_PENDIDIKAN)}

            </select>

          </div>


          <div class="form-group">

            <label class="form-label">
              Pendidikan Terakhir
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_PENDIDIKAN_TERAKHIR"
              required
            >

              ${Penduduk.option("Tidak Sekolah", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("TK", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("SD", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("SMP", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("SMA", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("D1", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("D2", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("D3", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("D4", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("S1", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("S2", data.PENDIDIKAN_TERAKHIR)}

              ${Penduduk.option("S3", data.PENDIDIKAN_TERAKHIR)}

            </select>

          </div>


          ${Penduduk.editTextField("SEKOLAH", "Sekolah", data.SEKOLAH)}


          ${Penduduk.editTextField("KELAS", "Kelas", data.KELAS)}


          <div class="form-group">

            <label class="form-label">
              Status Pekerjaan
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_STATUS_PEKERJAAN"
              required
            >

              ${Penduduk.option("Bekerja", data.STATUS_PEKERJAAN)}

              ${Penduduk.option("Tidak Bekerja", data.STATUS_PEKERJAAN)}

              ${Penduduk.option("Pelajar", data.STATUS_PEKERJAAN)}

              ${Penduduk.option("Mahasiswa", data.STATUS_PEKERJAAN)}

              ${Penduduk.option("Pensiun", data.STATUS_PEKERJAAN)}

            </select>

          </div>


          ${Penduduk.editTextField("PEKERJAAN", "Pekerjaan", data.PEKERJAAN)}


          <div class="form-group">

            <label class="form-label">
              Pendapatan Bulanan
            </label>

            <input
              type="number"
              class="form-control"
              id="edit_PENDAPATAN_BULANAN"
              min="0"
              step="1000"
              value="${Penduduk.escapeAttribute(data.PENDAPATAN_BULANAN ?? "")}"
            >

          </div>


          ${Penduduk.editTextField("NO_HP", "No. HP", data.NO_HP)}


          <div class="form-group">

            <label class="form-label">
              Status Penduduk
              <span class="required">*</span>
            </label>

            <select
              class="form-control"
              id="edit_STATUS_PENDUDUK"
              required
            >

              ${Penduduk.option("AKTIF", data.STATUS_PENDUDUK)}

              ${Penduduk.option("NONAKTIF", data.STATUS_PENDUDUK)}

            </select>

          </div>

        </div>

      </form>

    `;
  },

  /* =======================================
     UPDATE
  ======================================= */

  update: async function () {
    const button = document.getElementById("btnUpdatePenduduk");

    try {
      const payload = {
        ID_PENDUDUK: Penduduk.value("edit_ID_PENDUDUK"),

        NO_KK: Penduduk.value("edit_NO_KK"),

        NIK: Penduduk.value("edit_NIK"),

        NAMA: Penduduk.value("edit_NAMA"),

        TEMPAT_LAHIR: Penduduk.value("edit_TEMPAT_LAHIR"),

        TANGGAL_LAHIR: Penduduk.value("edit_TANGGAL_LAHIR"),

        JENIS_KELAMIN: Penduduk.value("edit_JENIS_KELAMIN"),

        AGAMA: Penduduk.value("edit_AGAMA"),

        HUBUNGAN_KELUARGA: Penduduk.value("edit_HUBUNGAN_KELUARGA"),

        STATUS_PERKAWINAN: Penduduk.value("edit_STATUS_PERKAWINAN"),

        JUMLAH_TANGGUNGAN: Penduduk.value("edit_JUMLAH_TANGGUNGAN"),

        DESA: Penduduk.value("edit_DESA"),

        RESIDENCE: Penduduk.value("edit_RESIDENCE"),

        ALAMAT: Penduduk.value("edit_ALAMAT"),

        RT: Penduduk.value("edit_RT"),

        RW: Penduduk.value("edit_RW"),

        STATUS_PENDIDIKAN: Penduduk.value("edit_STATUS_PENDIDIKAN"),

        PENDIDIKAN_TERAKHIR: Penduduk.value("edit_PENDIDIKAN_TERAKHIR"),

        SEKOLAH: Penduduk.value("edit_SEKOLAH"),

        KELAS: Penduduk.value("edit_KELAS"),

        STATUS_PEKERJAAN: Penduduk.value("edit_STATUS_PEKERJAAN"),

        PEKERJAAN: Penduduk.value("edit_PEKERJAAN"),

        PENDAPATAN_BULANAN: Penduduk.value("edit_PENDAPATAN_BULANAN"),

        NO_HP: Penduduk.value("edit_NO_HP"),

        STATUS_PENDUDUK: Penduduk.value("edit_STATUS_PENDUDUK"),
      };

      const validation = Penduduk.validatePayload(payload, true);

      if (!validation.valid) {
        Toast.error(validation.message);

        return;
      }

      if (button) {
        button.disabled = true;

        button.innerHTML = `

          <i
            data-lucide="loader-circle"
          ></i>

          <span>
            Menyimpan...
          </span>

        `;

        Penduduk.renderIcons();
      }

      console.log("[PENDUDUK] Update payload:", payload);

      const result = await API.post("updatePenduduk", payload);

      if (!result || result.success !== true) {
        throw new Error(result?.message || "Gagal memperbarui data penduduk.");
      }

      Modal.close();

      Toast.success(result.message || "Data penduduk berhasil diperbarui.");

      await Penduduk.load();
    } catch (error) {
      console.error("[PENDUDUK] Update failed:", error);

      Toast.error(error?.message || "Gagal memperbarui data penduduk.");
    } finally {
      if (button) {
        button.disabled = false;

        button.innerHTML = `

          <i
            data-lucide="save"
          ></i>

          <span>
            Simpan Perubahan
          </span>

        `;

        Penduduk.renderIcons();
      }
    }
  },

  /* =======================================
     DELETE CONFIRMATION
  ======================================= */

  openDelete: async function (idPenduduk) {
    try {
      if (!idPenduduk) {
        throw new Error("ID_PENDUDUK tidak ditemukan.");
      }

      const row = Penduduk.data.find(function (item) {
        return String(item.ID_PENDUDUK) === String(idPenduduk);
      });

      if (!row) {
        throw new Error("Data penduduk tidak ditemukan.");
      }

      Modal.open({
        title: "Hapus Penduduk",

        size: "sm",

        body: `

          <div
            class="confirm-delete"
          >

            <div
              class="confirm-delete-icon"
            >
              <i
                data-lucide="trash-2"
              ></i>
            </div>


            <h3>
              Hapus data penduduk?
            </h3>


            <p>

              Data penduduk

              <strong>
                ${Penduduk.escape(row.NAMA)}
              </strong>

              akan dihapus secara permanen.

            </p>


            <p
              class="text-muted"
            >
              Tindakan ini tidak dapat dibatalkan.
            </p>

          </div>

        `,

        footer: `

          <button
            type="button"
            class="btn btn-secondary"
            onclick="Modal.close()"
          >
            Batal
          </button>


          <button
            type="button"
            class="btn btn-danger"
            id="btnConfirmDeletePenduduk"
          >

            <i
              data-lucide="trash-2"
            ></i>

            Hapus Data

          </button>

        `,
      });

      Penduduk.renderIcons();

      document
        .getElementById("btnConfirmDeletePenduduk")
        ?.addEventListener("click", function () {
          Penduduk.delete(idPenduduk);
        });
    } catch (error) {
      console.error("[PENDUDUK] Open delete failed:", error);

      Toast.error(error?.message || "Gagal membuka konfirmasi hapus.");
    }
  },

  /* =======================================
     DELETE
  ======================================= */

  delete: async function (idPenduduk) {
    const button = document.getElementById("btnConfirmDeletePenduduk");

    try {
      if (!idPenduduk) {
        throw new Error("ID_PENDUDUK tidak ditemukan.");
      }

      if (button) {
        button.disabled = true;

        button.innerHTML = `

          <i
            data-lucide="loader-circle"
          ></i>

          Menghapus...

        `;

        Penduduk.renderIcons();
      }

      const result = await API.post("deletePenduduk", {
        ID_PENDUDUK: idPenduduk,
      });

      if (!result || result.success !== true) {
        throw new Error(result?.message || "Gagal menghapus data penduduk.");
      }

      Modal.close();

      Toast.success(result.message || "Data penduduk berhasil dihapus.");

      await Penduduk.load();
    } catch (error) {
      console.error("[PENDUDUK] Delete failed:", error);

      Toast.error(error?.message || "Gagal menghapus data penduduk.");

      if (button) {
        button.disabled = false;

        button.innerHTML = `

          <i
            data-lucide="trash-2"
          ></i>

          Hapus Data

        `;

        Penduduk.renderIcons();
      }
    }
  },

  /* =======================================
     VALIDATE PAYLOAD
  ======================================= */

  validatePayload: function (payload, isUpdate) {
    if (isUpdate && !payload.ID_PENDUDUK) {
      return {
        valid: false,

        message: "ID_PENDUDUK tidak ditemukan.",
      };
    }

    if (!/^\d{16}$/.test(String(payload.NO_KK || ""))) {
      return {
        valid: false,

        message: "No. KK harus terdiri dari 16 digit.",
      };
    }

    if (!/^\d{16}$/.test(String(payload.NIK || ""))) {
      return {
        valid: false,

        message: "NIK harus terdiri dari 16 digit.",
      };
    }

    if (!payload.NAMA) {
      return {
        valid: false,

        message: "Nama lengkap wajib diisi.",
      };
    }

    if (!payload.TEMPAT_LAHIR) {
      return {
        valid: false,

        message: "Tempat lahir wajib diisi.",
      };
    }

    if (!payload.TANGGAL_LAHIR) {
      return {
        valid: false,

        message: "Tanggal lahir wajib diisi.",
      };
    }

    if (!payload.JENIS_KELAMIN) {
      return {
        valid: false,

        message: "Jenis kelamin wajib dipilih.",
      };
    }

    if (!payload.AGAMA) {
      return {
        valid: false,

        message: "Agama wajib dipilih.",
      };
    }

    if (!payload.HUBUNGAN_KELUARGA) {
      return {
        valid: false,

        message: "Hubungan keluarga wajib dipilih.",
      };
    }

    if (!payload.STATUS_PERKAWINAN) {
      return {
        valid: false,

        message: "Status perkawinan wajib dipilih.",
      };
    }

    if (
      payload.JUMLAH_TANGGUNGAN !== "" &&
      (isNaN(Number(payload.JUMLAH_TANGGUNGAN)) ||
        Number(payload.JUMLAH_TANGGUNGAN) < 0)
    ) {
      return {
        valid: false,

        message: "Jumlah tanggungan harus berupa angka >= 0.",
      };
    }

    if (!payload.DESA) {
      return {
        valid: false,

        message: "Desa wajib dipilih.",
      };
    }

    if (payload.DESA !== "Kawasi" && payload.DESA !== "Sologi") {
      return {
        valid: false,

        message: "Desa harus Kawasi atau Sologi.",
      };
    }

    if (!payload.RESIDENCE) {
      return {
        valid: false,

        message: "Residence wajib dipilih.",
      };
    }

    if (payload.RESIDENCE !== "ASLI" && payload.RESIDENCE !== "PENDATANG") {
      return {
        valid: false,

        message: "Residence tidak valid.",
      };
    }

    if (!payload.STATUS_PENDIDIKAN) {
      return {
        valid: false,

        message: "Status pendidikan wajib dipilih.",
      };
    }

    if (!payload.PENDIDIKAN_TERAKHIR) {
      return {
        valid: false,

        message: "Pendidikan terakhir wajib dipilih.",
      };
    }

    if (!payload.STATUS_PEKERJAAN) {
      return {
        valid: false,

        message: "Status pekerjaan wajib dipilih.",
      };
    }

    if (
      payload.PENDAPATAN_BULANAN !== "" &&
      (isNaN(Number(payload.PENDAPATAN_BULANAN)) ||
        Number(payload.PENDAPATAN_BULANAN) < 0)
    ) {
      return {
        valid: false,

        message: "Pendapatan bulanan harus berupa angka >= 0.",
      };
    }

    if (!payload.STATUS_PENDUDUK) {
      return {
        valid: false,

        message: "Status penduduk wajib dipilih.",
      };
    }

    if (
      payload.STATUS_PENDUDUK !== "AKTIF" &&
      payload.STATUS_PENDUDUK !== "NONAKTIF"
    ) {
      return {
        valid: false,

        message: "Status penduduk tidak valid.",
      };
    }

    return {
      valid: true,

      message: "Valid",
    };
  },

  /* =======================================
     EDIT TEXT FIELD
  ======================================= */

  editTextField: function (key, label, value, required, maxlength, inputmode) {
    const requiredAttr = required ? "required" : "";

    const requiredMark = required ? `<span class="required">*</span>` : "";

    return `

      <div class="form-group">

        <label class="form-label">

          ${Penduduk.escape(label)}

          ${requiredMark}

        </label>


        <input
          type="text"
          class="form-control"
          id="edit_${Penduduk.escapeAttribute(key)}"
          value="${Penduduk.escapeAttribute(value || "")}"
          ${maxlength ? `maxlength="${maxlength}"` : ""}
          ${inputmode ? `inputmode="${inputmode}"` : ""}
          ${requiredAttr}
        >

      </div>

    `;
  },

  /* =======================================
     OPTION
  ======================================= */

  option: function (value, selected) {
    return `

      <option
        value="${Penduduk.escapeAttribute(value)}"
        ${String(value) === String(selected) ? "selected" : ""}
      >
        ${Penduduk.escape(value)}
      </option>

    `;
  },

  /* =======================================
     VALUE
  ======================================= */

  value: function (id) {
    const element = document.getElementById(id);

    return element ? String(element.value || "").trim() : "";
  },

  /* =======================================
     DATE
  ======================================= */

  toInputDate: function (value) {
    if (!value) {
      return "";
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },

  /* =======================================
     FORMAT DATE
  ======================================= */

  formatDate: function (value) {
    if (!value) {
      return "-";
    }

    const input = Penduduk.toInputDate(value);

    if (!input) {
      return String(value);
    }

    const parts = input.split("-");

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  },

  /* =======================================
     FORMAT CURRENCY
  ======================================= */

  formatCurrency: function (value) {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const number = Number(value);

    if (!isFinite(number)) {
      return "-";
    }

    return number.toLocaleString("id-ID", {
      style: "currency",

      currency: "IDR",

      maximumFractionDigits: 0,
    });
  },

  /* =======================================
     FILE SIZE
  ======================================= */

  formatFileSize: function (bytes) {
    const value = Number(bytes || 0);

    if (value < 1024) {
      return `${value} B`;
    }

    if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(1)} KB`;
    }

    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  },

  /* =======================================
     LOADING
  ======================================= */

  showLoading: function () {
    Penduduk.setText("statTotalPenduduk", "–");

    Penduduk.setText("statPendudukLaki", "–");

    Penduduk.setText("statPendudukPerempuan", "–");

    const tbody = document.getElementById("tablePenduduk");

    if (tbody) {
      tbody.innerHTML = `

        <tr>

          <td
            colspan="7"
            class="table-empty"
          >
            Memuat data penduduk...
          </td>

        </tr>

      `;
    }
  },

  /* =======================================
     ERROR
  ======================================= */

  showError: function (error) {
    const message = error?.message || "Gagal memuat data penduduk.";

    console.error("[PENDUDUK]", message);

    if (typeof Toast !== "undefined" && typeof Toast.error === "function") {
      Toast.error(message);
    }
  },

  /* =======================================
     SET TEXT
  ======================================= */

  setText: function (id, value) {
    const element = document.getElementById(id);

    if (!element) {
      console.warn(`[PENDUDUK] Element #${id} tidak ditemukan.`);

      return;
    }

    element.textContent = value ?? "-";
  },

  /* =======================================
     NUMBER
  ======================================= */

  number: function (value) {
    return (Number(value) || 0).toLocaleString("id-ID");
  },

  /* =======================================
     ESCAPE HTML
  ======================================= */

  escape: function (value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /* =======================================
     ESCAPE ATTRIBUTE
  ======================================= */

  escapeAttribute: function (value) {
    return Penduduk.escape(value).replace(/`/g, "&#096;");
  },

  /* =======================================
     LUCIDE
  ======================================= */

  renderIcons: function () {
    if (
      typeof lucide !== "undefined" &&
      typeof lucide.createIcons === "function"
    ) {
      lucide.createIcons();
    }
  },
};
