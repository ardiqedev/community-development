/* =========================================
   PENGINAPAN SERVICE
========================================= */

const PenginapanService = {
  /* =====================================
     GET ALL
  ===================================== */

  /* =====================================
   GET ALL
===================================== */

  async getAll({ page = 1, limit = 10, keyword = "", status = "" } = {}) {
    return API.post("penginapan.list", {
      page,
      limit,
      keyword,
      status,
    });
  },

  /* =====================================
     GET BY ID
  ===================================== */

  async getById(id) {
    return API.post("penginapan.detail", {
      id,
    });
  },

  /* =====================================
     CREATE
  ===================================== */

  async create(data) {
    return API.post("penginapan.store", data);
  },

  /* =====================================
     UPDATE
  ===================================== */

  async update(id, data) {
    return API.post("penginapan.update", {
      id,
      ...data,
    });
  },

  /* =====================================
     REMOVE
  ===================================== */

  async remove(id) {
    return API.post("penginapan.delete", {
      id,
    });
  },
};
