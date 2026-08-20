/* =========================================
   DUMMY HARGA MUSIM
========================================= */

const DummyHargaMusim = {
  /* =====================================
     DATA
  ===================================== */

  data: [
    {
      id: "HM001",

      penginapanId: "PGN001",

      penginapan: "Homestay Dieng Indah",

      tipeKamarId: "TP001",

      tipeKamar: "Standard Room",

      musim: "Low Season",

      channel: "OWNER",

      tanggalMulai: "2026-01-01",

      tanggalSelesai: "2026-06-30",

      weekday: 350000,

      weekend: 400000,

      extraPerson: 50000,

      status: "Aktif",
    },

    {
      id: "HM002",

      penginapanId: "PGN001",

      penginapan: "Homestay Dieng Indah",

      tipeKamarId: "TP001",

      tipeKamar: "Standard Room",

      musim: "Low Season",

      channel: "WEBSITE",

      tanggalMulai: "2026-01-01",

      tanggalSelesai: "2026-06-30",

      weekday: 375000,

      weekend: 425000,

      extraPerson: 50000,

      status: "Aktif",
    },

    {
      id: "HM003",

      penginapanId: "PGN001",

      penginapan: "Homestay Dieng Indah",

      tipeKamarId: "TP001",

      tipeKamar: "Standard Room",

      musim: "Low Season",

      channel: "AGEN",

      tanggalMulai: "2026-01-01",

      tanggalSelesai: "2026-06-30",

      weekday: 390000,

      weekend: 440000,

      extraPerson: 50000,

      status: "Aktif",
    },

    {
      id: "HM004",

      penginapanId: "PGN002",

      penginapan: "Villa Arjuna",

      tipeKamarId: "TP003",

      tipeKamar: "Family Room",

      musim: "Peak Season",

      channel: "OWNER",

      tanggalMulai: "2026-12-20",

      tanggalSelesai: "2027-01-05",

      weekday: 900000,

      weekend: 1000000,

      extraPerson: 100000,

      status: "Aktif",
    },
  ],

  /* =====================================
     GET ALL
  ===================================== */

  getAll() {
    return {
      success: true,

      message: "Data berhasil diambil",

      data: {
        rows: [...this.data],

        total: this.data.length,

        page: 1,

        limit: 10,

        totalPages: 1,
      },
    };
  },

  /* =====================================
     GET BY ID
  ===================================== */

  getById(id) {
    const item = this.data.find((x) => x.id === id);

    return {
      success: !!item,

      message: item ? "Data ditemukan" : "Data tidak ditemukan",

      data: item || null,
    };
  },

  /* =====================================
     CREATE
  ===================================== */

  create(data) {
    this.data.push(data);

    return {
      success: true,

      message: "Harga musim berhasil ditambahkan",
    };
  },

  /* =====================================
     UPDATE
  ===================================== */

  update(id, data) {
    const index = this.data.findIndex((x) => x.id === id);

    if (index === -1) {
      return {
        success: false,

        message: "Data tidak ditemukan",
      };
    }

    this.data[index] = {
      ...this.data[index],
      ...data,
    };

    return {
      success: true,

      message: "Harga musim berhasil diperbarui",
    };
  },

  /* =====================================
     DELETE
  ===================================== */

  /* =====================================
     DELETE
===================================== */

  delete(id) {
    const index = this.data.findIndex((item) => item.id === id);

    if (index === -1) {
      return {
        success: false,

        message: "Data tidak ditemukan",
      };
    }

    this.data.splice(index, 1);

    return {
      success: true,

      message: "Harga musim berhasil dihapus",
    };
  },
};
