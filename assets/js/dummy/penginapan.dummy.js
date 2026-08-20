/* =========================================
   DUMMY PENGINAPAN
========================================= */

const DummyPenginapan = {
  /* =====================================
     DATA
  ===================================== */

  data: [
    {
      id: "PGN001",

      nama: "Homestay Dieng Indah",

      jenis: "Homestay",

      kategori: "Standard",

      pemilik: "Junaidi",

      whatsapp: "085678888888",

      username: "junaidi",

      status: "Aktif",
    },

    {
      id: "PGN002",

      nama: "Villa Arjuna",

      jenis: "Villa",

      kategori: "Premium",

      pemilik: "Ardi",

      whatsapp: "081234567890",

      username: "ardi",

      status: "Aktif",
    },

    {
      id: "PGN003",

      nama: "Hotel Dieng View",

      jenis: "Hotel",

      kategori: "Luxury",

      pemilik: "Budi",

      whatsapp: "081111111111",

      username: "budi",

      status: "Non Aktif",
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
    const data = this.data.find((item) => item.id === id);

    if (!data) {
      return {
        success: false,

        message: "Data tidak ditemukan",
      };
    }

    return {
      success: true,

      message: "Data berhasil diambil",

      data,
    };
  },

  /* =====================================
   CREATE
  ===================================== */

  create(data) {
    this.data.unshift(data);

    return {
      success: true,

      message: "Penginapan berhasil ditambahkan",

      data,
    };
  },

  /* =====================================
     UPDATE
  ===================================== */

  update(id, newData) {
    const index = this.data.findIndex((item) => item.id === id);

    if (index < 0) {
      return {
        success: false,

        message: "Data tidak ditemukan",
      };
    }

    this.data[index] = {
      ...this.data[index],

      ...newData,
    };

    return {
      success: true,

      message: "Data berhasil diupdate",

      data: this.data[index],
    };
  },

  /* =====================================
     DELETE
  ===================================== */

  remove(id) {
    this.data = this.data.filter((item) => item.id !== id);

    return {
      success: true,

      message: "Penginapan berhasil dihapus.",
    };
  },
};
