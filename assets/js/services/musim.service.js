/* =========================================
   MUSIM SERVICE
========================================= */

const MusimService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll({ page = 1, limit = 10, keyword = "", status = "" } = {}) {
    return API.post("musim.list", {
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
    return API.post("musim.detail", {
      id,
    });
  },

  /* =====================================
     CREATE
  ===================================== */

  async create(data) {
    return API.post("musim.store", data);
  },

  /* =====================================
     UPDATE
  ===================================== */

  async update(id, data) {
    return API.post("musim.update", {
      id,
      ...data,
    });
  },

  /* =====================================
     DELETE
  ===================================== */

  async delete(id) {
    return API.post("musim.delete", {
      id,
    });
  },
};
