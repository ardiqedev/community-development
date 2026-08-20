/* =========================================
   DUMMY MUSIM
========================================= */

const DummyMusim = {
  /* =====================================
     DATA
  ===================================== */

  data: [
    {
      id: "MS001",

      kode: "LOW",

      nama: "Low Season",

      tanggalMulai: "2026-01-01",

      tanggalSelesai: "2026-06-30",

      status: "Aktif",

      keterangan: "Periode normal di luar musim liburan.",
    },

    {
      id: "MS002",

      kode: "HIGH",

      nama: "High Season",

      tanggalMulai: "2026-07-01",

      tanggalSelesai: "2026-08-31",

      status: "Aktif",

      keterangan: "Libur sekolah.",
    },

    {
      id: "MS003",

      kode: "PEAK",

      nama: "Peak Season",

      tanggalMulai: "2026-12-20",

      tanggalSelesai: "2027-01-05",

      status: "Aktif",

      keterangan: "Natal & Tahun Baru.",
    },

    {
      id: "MS004",

      kode: "LEBARAN",

      nama: "Idul Fitri",

      tanggalMulai: "2027-03-18",

      tanggalSelesai: "2027-03-28",

      status: "Aktif",

      keterangan: "Libur Hari Raya Idul Fitri.",
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

      message: "Musim berhasil ditambahkan",
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

      message: "Musim berhasil diperbarui",
    };
  },

  /* =====================================
     DELETE
  ===================================== */

  delete(id) {
    const index = this.data.findIndex((x) => x.id === id);

    if (index === -1) {
      return {
        success: false,

        message: "Data tidak ditemukan",
      };
    }

    this.data.splice(index, 1);

    return {
      success: true,

      message: "Musim berhasil dihapus",
    };
  },
};
