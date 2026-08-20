/* =========================================
   DUMMY RESERVASI
========================================= */

const ReservasiDummy = {
  /* =====================================
     DATA
  ===================================== */

  data: [
    {
      id: "RSV001",
      kodeReservasi: "RES-260701-0001",
      penginapanId: "PGN001",
      penginapan: "Homestay Dieng Indah",
      tipeKamarId: "TP001",
      tipeKamar: "Standard Room",
      kamarId: "KM001",
      kamar: "STD-01",
      musimId: "MS001",
      musim: "Low Season",
      channel: "WEBSITE",
      tamuId: "TM001",
      namaTamu: "Budi Santoso",
      noHp: "081234567890",
      email: "budi@gmail.com",
      checkIn: "2026-07-10",
      checkOut: "2026-07-12",
      jumlahMalam: 2,
      dewasa: 2,
      anak: 1,
      weekday: 350000,
      weekend: 400000,
      extraPerson: 50000,
      subtotal: 750000,
      diskon: 0,
      pajak: 0,
      grandTotal: 750000,
      status: "DRAFT",
      paymentStatus: "UNPAID",
      catatan: "Menunggu pembayaran DP",
    },

    {
      id: "RSV002",
      kodeReservasi: "RES-260702-0002",
      penginapanId: "PGN001",
      penginapan: "Homestay Dieng Indah",
      tipeKamarId: "TP001",
      tipeKamar: "Standard Room",
      kamarId: "KM002",
      kamar: "STD-02",
      musimId: "MS001",
      musim: "Low Season",
      channel: "WEBSITE",
      tamuId: "TM002",
      namaTamu: "Siti Aminah",
      noHp: "081355667788",
      email: "siti@gmail.com",
      checkIn: "2026-07-11",
      checkOut: "2026-07-13",
      jumlahMalam: 2,
      dewasa: 2,
      anak: 0,
      weekday: 375000,
      weekend: 425000,
      extraPerson: 50000,
      subtotal: 800000,
      diskon: 50000,
      pajak: 0,
      grandTotal: 750000,
      status: "BOOKED",
      paymentStatus: "DP",
      catatan: "DP 30% telah diverifikasi",
    },

    {
      id: "RSV003",
      kodeReservasi: "RES-260703-0003",
      penginapanId: "PGN002",
      penginapan: "Villa Arjuna",
      tipeKamarId: "TP003",
      tipeKamar: "Family Room",
      kamarId: "KM010",
      kamar: "FM-01",
      musimId: "MS003",
      musim: "Peak Season",
      channel: "AGEN",
      tamuId: "TM003",
      namaTamu: "Andi Saputra",
      noHp: "082233445566",
      email: "andi@gmail.com",
      checkIn: "2026-12-24",
      checkOut: "2026-12-27",
      jumlahMalam: 3,
      dewasa: 4,
      anak: 2,
      weekday: 900000,
      weekend: 1000000,
      extraPerson: 100000,
      subtotal: 2900000,
      diskon: 100000,
      pajak: 0,
      grandTotal: 2800000,
      status: "CHECK IN",
      paymentStatus: "PAID",
      catatan: "Tamu sedang menginap",
    },

    {
      id: "RSV004",
      kodeReservasi: "RES-260704-0004",
      penginapanId: "PGN001",
      penginapan: "Homestay Dieng Indah",
      tipeKamarId: "TP002",
      tipeKamar: "Deluxe Room",
      kamarId: "KM005",
      kamar: "DLX-01",
      musimId: "MS002",
      musim: "High Season",
      channel: "OWNER",
      tamuId: "TM004",
      namaTamu: "Linda Marlina",
      noHp: "085677889900",
      email: "linda@gmail.com",
      checkIn: "2026-08-05",
      checkOut: "2026-08-08",
      jumlahMalam: 3,
      dewasa: 2,
      anak: 1,
      weekday: 650000,
      weekend: 700000,
      extraPerson: 75000,
      subtotal: 2000000,
      diskon: 0,
      pajak: 0,
      grandTotal: 2000000,
      status: "CHECK OUT",
      paymentStatus: "PAID",
      catatan: "Reservasi selesai",
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

  /* =========================================
   GET PENGINAPAN
========================================= */

  getPenginapan() {
    return {
      success: true,

      data: [
        {
          id: "PGN001",

          nama: "Homestay Dieng Indah",

          status: "Aktif",
        },

        {
          id: "PGN002",

          nama: "Villa Arjuna",

          status: "Aktif",
        },

        {
          id: "PGN003",

          nama: "Dieng Family Homestay",

          status: "Aktif",
        },

        {
          id: "PGN004",

          nama: "Penginapan Sikunir View",

          status: "Aktif",
        },
      ],
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
   GET CHANNEL
===================================== */

  /* =====================================
   GET CHANNEL
===================================== */

  getChannel() {
    return {
      success: true,

      data: [
        {
          id: "OWNER",

          kode: "OWNER",

          nama: "Walk In / Owner",

          aktif: true,
        },
        {
          id: "WEBSITE",

          kode: "WEBSITE",

          nama: "Website",

          aktif: true,
        },
        {
          id: "AGEN",

          kode: "AGEN",

          nama: "Agen",

          aktif: true,
        },
      ],
    };
  },

  /* =====================================
   GET AVAILABLE ROOMS
===================================== */

  getAvailableRooms() {
    return [
      {
        id: "KM001",

        penginapanId: "PGN001",

        nomor: "STD-01",

        tipeKamarId: "TP001",

        tipeKamar: "Standard Room",

        kapasitasDewasa: 2,

        kapasitasAnak: 1,

        bed: "Queen Bed",

        roomPrice: 350000,

        extraPerson: 50000,

        minimalMalam: 1,

        status: "TERSEDIA",

        badge: "TERSEDIA",

        foto: "",
      },

      {
        id: "KM002",

        penginapanId: "PGN001",

        nomor: "STD-02",

        tipeKamarId: "TP001",

        tipeKamar: "Standard Room",

        kapasitasDewasa: 2,

        kapasitasAnak: 1,

        bed: "Twin Bed",

        roomPrice: 375000,

        extraPerson: 50000,

        minimalMalam: 1,

        status: "TERSEDIA",

        badge: "PROMO",

        foto: "",
      },

      {
        id: "KM003",

        penginapanId: "PGN001",

        nomor: "DLX-01",

        tipeKamarId: "TP002",

        tipeKamar: "Deluxe Room",

        kapasitasDewasa: 2,

        kapasitasAnak: 2,

        bed: "King Bed",

        roomPrice: 650000,

        extraPerson: 75000,

        minimalMalam: 1,

        status: "TERSEDIA",

        badge: "SISA 1",

        foto: "",
      },

      {
        id: "KM004",

        penginapanId: "PGN002",

        nomor: "FM-01",

        tipeKamarId: "TP003",

        tipeKamar: "Family Room",

        kapasitasDewasa: 4,

        kapasitasAnak: 2,

        bed: "2 Queen Bed",

        roomPrice: 900000,

        extraPerson: 100000,

        minimalMalam: 2,

        status: "TERSEDIA",

        badge: "TERSEDIA",

        foto: "",
      },

      {
        id: "KM005",

        penginapanId: "PGN004",

        nomor: "STD-01",

        tipeKamarId: "TP001",

        tipeKamar: "Standard Room",

        kapasitasDewasa: 2,

        kapasitasAnak: 0,

        bed: "Queen Bed",

        roomPrice: 325000,

        extraPerson: 50000,

        minimalMalam: 1,

        status: "TERSEDIA",

        badge: "PROMO",

        foto: "",
      },
    ];
  },

  /* =====================================
   SAVE
===================================== */

  save(data) {
    this.data.unshift(data);

    return {
      success: true,
      message: "Reservasi berhasil ditambahkan",
      data,
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

      message: "Reservasi berhasil diperbarui",
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

      message: "Reservasi berhasil dihapus",
    };
  },
};
