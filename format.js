/**
 * ============================================================
 * COMMUNITY DEVELOPMENT
 * PROGRAM KRITERIA ENGINE
 * ============================================================
 *
 * Fungsi:
 * - Mengambil kriteria berdasarkan program
 * - Mengevaluasi penduduk terhadap kriteria
 * - Menentukan layak / tidak layak
 * - Menghasilkan alasan jika tidak memenuhi
 *
 * Operator:
 * =   !=   >   >=   <   <=
 * CONTAINS
 * ============================================================
 */

const ProgramKriteriaEngine = (() => {
  /* ==========================================================
     KONFIGURASI
  ========================================================== */

  const FIELD_USIA = "USIA";

  const STATUS_AKTIF = "AKTIF";

  /* ==========================================================
     PUBLIC
  ========================================================== */

  /**
   * ==========================================================
   * CEK SATU PENDUDUK
   * ==========================================================
   *
   * @param {Object} penduduk
   * @param {Array} kriteria
   *
   * @return {Object}
   */
  function evaluate(penduduk, kriteria) {
    if (!penduduk) {
      return {
        eligible: false,
        alasan: ["Data penduduk tidak ditemukan."],
      };
    }

    if (!Array.isArray(kriteria) || kriteria.length === 0) {
      return {
        eligible: true,
        alasan: [],
      };
    }

    const gagal = [];

    kriteria.forEach((criteria) => {
      if (!criteria) {
        return;
      }

      // Hanya kriteria aktif
      if (
        String(criteria.STATUS || "")
          .trim()
          .toUpperCase() !== STATUS_AKTIF
      ) {
        return;
      }

      const hasil = evaluateCriteria(penduduk, criteria);

      if (!hasil.valid) {
        gagal.push({
          ID_KRITERIA: criteria.ID_KRITERIA || "",
          FIELD: criteria.FIELD || "",
          OPERATOR: criteria.OPERATOR || "",
          VALUE: criteria.VALUE ?? "",
          actual: hasil.actual,
          alasan: hasil.alasan,
        });
      }
    });

    return {
      eligible: gagal.length === 0,

      alasan: gagal.map((item) => item.alasan),

      gagal: gagal,
    };
  }

  /**
   * ==========================================================
   * CEK SATU KRITERIA
   * ==========================================================
   */

  function evaluateCriteria(penduduk, criteria) {
    const field = String(criteria.FIELD || "")
      .trim()
      .toUpperCase();

    const operator = String(criteria.OPERATOR || "=")
      .trim()
      .toUpperCase();

    const expected = criteria.VALUE;

    const actual = getFieldValue(penduduk, field);

    if (actual === undefined || actual === null || actual === "") {
      return {
        valid: false,

        actual: actual,

        alasan: field + " tidak tersedia pada data penduduk.",
      };
    }

    const valid = compare(actual, operator, expected, field);

    return {
      valid: valid,

      actual: actual,

      alasan: valid ? "" : buildAlasan(field, operator, expected, actual),
    };
  }

  /**
   * ==========================================================
   * GET VALUE FIELD
   * ==========================================================
   */

  function getFieldValue(penduduk, field) {
    /* --------------------------------------------------------
       USIA
    -------------------------------------------------------- */

    if (field === FIELD_USIA) {
      // Kalau data penduduk sudah punya USIA
      if (
        penduduk.USIA !== undefined &&
        penduduk.USIA !== null &&
        penduduk.USIA !== ""
      ) {
        return Number(penduduk.USIA);
      }

      // Coba hitung dari tanggal lahir
      const tanggalLahir =
        penduduk.TGL_LAHIR ||
        penduduk.TANGGAL_LAHIR ||
        penduduk.TGL_LAHIR_PENDUDUK;

      if (tanggalLahir) {
        return calculateAge(tanggalLahir);
      }

      return null;
    }

    /* --------------------------------------------------------
       FIELD BIASA
    -------------------------------------------------------- */

    const key = Object.keys(penduduk).find(
      (k) => String(k).trim().toUpperCase() === field,
    );

    if (!key) {
      return null;
    }

    return penduduk[key];
  }

  /**
   * ==========================================================
   * HITUNG USIA
   * ==========================================================
   */

  function calculateAge(tanggalLahir) {
    const birth = new Date(tanggalLahir);

    if (isNaN(birth.getTime())) {
      return null;
    }

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const month = today.getMonth() - birth.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * ==========================================================
   * COMPARE
   * ==========================================================
   */

  function compare(actual, operator, expected, field) {
    /* --------------------------------------------------------
       ANGKA
    -------------------------------------------------------- */

    const numericFields = ["USIA"];

    if (numericFields.includes(field)) {
      const a = Number(actual);

      const b = Number(expected);

      if (isNaN(a) || isNaN(b)) {
        return false;
      }

      switch (operator) {
        case "=":
        case "==":
          return a === b;

        case "!=":
        case "<>":
          return a !== b;

        case ">":
          return a > b;

        case ">=":
          return a >= b;

        case "<":
          return a < b;

        case "<=":
          return a <= b;

        default:
          return false;
      }
    }

    /* --------------------------------------------------------
       TEXT
    -------------------------------------------------------- */

    const a = String(actual ?? "")
      .trim()
      .toUpperCase();

    const b = String(expected ?? "")
      .trim()
      .toUpperCase();

    switch (operator) {
      case "=":
      case "==":
        return a === b;

      case "!=":
      case "<>":
        return a !== b;

      case "CONTAINS":
        return a.includes(b);

      case "STARTS_WITH":
        return a.startsWith(b);

      case "ENDS_WITH":
        return a.endsWith(b);

      default:
        return false;
    }
  }

  /**
   * ==========================================================
   * BUILD ALASAN
   * ==========================================================
   */

  function buildAlasan(field, operator, expected, actual) {
    return (
      field + " harus " + operator + " " + expected + " (data: " + actual + ")"
    );
  }

  /**
   * ==========================================================
   * CEK SEMUA PENDUDUK
   * ==========================================================
   *
   * Menghasilkan hanya penduduk yang memenuhi
   * seluruh kriteria program.
   *
   */

  function getEligible(idProgram) {
    const kriteria = ProgramKriteria.getByProgram(idProgram);

    const penduduk = Penduduk.getAll();

    if (!Array.isArray(penduduk)) {
      return [];
    }

    return penduduk
      .map((row) => {
        const result = evaluate(row, kriteria);

        return {
          ...row,

          ELIGIBLE: result.eligible,

          ALASAN: result.alasan,

          KRITERIA_GAGAL: result.gagal,
        };
      })
      .filter((row) => row.ELIGIBLE === true);
  }

  /**
   * ==========================================================
   * CEK SATU PENDUDUK UNTUK PROGRAM
   * ==========================================================
   */

  function check(idProgram, idPenduduk) {
    const kriteria = ProgramKriteria.getByProgram(idProgram);

    const penduduk = Penduduk.getById(idPenduduk);

    if (!penduduk) {
      throw new Error("Data penduduk tidak ditemukan.");
    }

    const result = evaluate(penduduk, kriteria);

    return {
      ID_PROGRAM: idProgram,

      ID_PENDUDUK: idPenduduk,

      ELIGIBLE: result.eligible,

      ALASAN: result.alasan,

      KRITERIA_GAGAL: result.gagal,
    };
  }

  /**
   * ==========================================================
   * GET SEMUA HASIL
   * ==========================================================
   */

  function evaluateAll(idProgram) {
    const kriteria = ProgramKriteria.getByProgram(idProgram);

    const penduduk = Penduduk.getAll();

    if (!Array.isArray(penduduk)) {
      return [];
    }

    return penduduk.map((row) => {
      const result = evaluate(row, kriteria);

      return {
        ...row,

        ELIGIBLE: result.eligible,

        ALASAN: result.alasan,

        KRITERIA_GAGAL: result.gagal,
      };
    });
  }

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    evaluate,

    evaluateCriteria,

    getEligible,

    check,

    evaluateAll,

    calculateAge,
  };
})();
