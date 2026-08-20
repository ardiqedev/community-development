/* =========================================
   TIPE KAMAR SERVICE
========================================= */

const TipeKamarService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll(payload = {}) {
    return API.post("tipe-kamar.list", {
      page: payload.page || 1,
      limit: payload.limit || 10,
      keyword: payload.keyword || "",
      status: payload.status || "",
      penginapanId: payload.penginapanId || "",
    });
  },

  /* =====================================
     GET BY ID
  ===================================== */

  async getById(id) {
    return API.post("tipe-kamar.detail", {
      id,
    });
  },

  /* =====================================
     CREATE
  ===================================== */

  async create(data) {
    return API.post("tipe-kamar.store", data);
  },

  /* =====================================
     UPDATE
  ===================================== */

  async update(id, data) {
    return API.post("tipe-kamar.update", {
      id,
      ...data,
    });
  },

  /* =====================================
     DELETE
  ===================================== */

  async remove(id) {
    return API.post("tipe-kamar.delete", {
      id,
    });
  },
};
