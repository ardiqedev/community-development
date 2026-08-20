/* =========================================
   HARGA MUSIM SERVICE
========================================= */

const HargaMusimService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll(payload = {}) {
    return API.post("harga.list", {
      page: payload.page || 1,

      limit: payload.limit || 10,

      keyword: payload.keyword || "",

      status: payload.status || "",

      penginapanId: payload.penginapanId || "",

      tipeKamarId: payload.tipeKamarId || "",

      musimId: payload.musimId || "",

      channelId: payload.channelId || "",
    });
  },

  /* =====================================
     GET BY ID
  ===================================== */

  async getById(id) {
    return API.post("harga.detail", {
      id,
    });
  },

  /* =====================================
     CREATE
  ===================================== */

  async create(data) {
    return API.post("harga.store", data);
  },

  /* =====================================
     UPDATE
  ===================================== */

  async update(id, data) {
    return API.post("harga.update", {
      id,
      ...data,
    });
  },

  /* =====================================
     DELETE
  ===================================== */

  async delete(id) {
    return API.post("harga.delete", {
      id,
    });
  },
};
