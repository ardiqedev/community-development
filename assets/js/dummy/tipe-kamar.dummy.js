/* =========================================
   DUMMY TIPE KAMAR
========================================= */

const DummyTipeKamar = {
  /* =====================================
     DATA
  ===================================== */

  data: [
    {
      id: "TP001",

      penginapanId: "PGN001",

      penginapan: "Homestay Dieng Indah",

      nama: "Standard Room",

      kapasitasDewasa: 2,

      kapasitasAnak: 1,

      jumlahBed: 1,

      jenisBed: "Queen",

      luas: 24,

      status: "Aktif",
    },

    {
      id: "TP002",

      penginapanId: "PGN001",

      penginapan: "Homestay Dieng Indah",

      nama: "Family Room",

      kapasitasDewasa: 4,

      kapasitasAnak: 2,

      jumlahBed: 2,

      jenisBed: "Queen",

      luas: 36,

      status: "Aktif",
    },

    {
      id: "TP003",

      penginapanId: "PGN002",

      penginapan: "Villa Arjuna",

      nama: "Deluxe Villa",

      kapasitasDewasa: 6,

      kapasitasAnak: 2,

      jumlahBed: 3,

      jenisBed: "King",

      luas: 64,

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
    const item = this.data.find((row) => row.id === id);

    return {
      success: !!item,

      message: item ? "Data berhasil diambil" : "Data tidak ditemukan",

      data: item,
    };
  },

  /* =====================================
     CREATE
  ===================================== */

  create(data) {
    this.data.unshift(data);

    return {
      success: true,

      message: "Data berhasil ditambahkan",
    };
  },

  /* =====================================
     UPDATE
  ===================================== */

  update(id, data) {
    const index = this.data.findIndex((row) => row.id === id);

    if (index < 0) {
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

      message: "Data berhasil diperbarui",
    };
  },

  /* =====================================
     DELETE
  ===================================== */

  remove(id) {
    this.data = this.data.filter((row) => row.id !== id);

    return {
      success: true,

      message: "Data berhasil dihapus",
    };
  },
};
