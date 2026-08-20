/* =========================================
   RESERVASI SERVICE
========================================= */

const ReservasiService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll(page = 1) {
    return ReservasiDummy.getAll(page);
  },

  /* =====================================
     GET PENGINAPAN
  ===================================== */

  async getPenginapan() {
    return ReservasiDummy.getPenginapan();
  },

  /* =====================================
     GET CHANNEL
  ===================================== */

  async getChannel() {
    return ReservasiDummy.getChannel();
  },

  /* =====================================
     SEARCH ROOM
  ===================================== */

  async searchRoom(filter) {
    return ReservasiAvailability.search(filter);
  },

  /* =====================================
     SAVE
  ===================================== */

  async save(data) {
    return ReservasiDummy.save(data);
  },

  /* =====================================
   GET BY ID
===================================== */

  async getById(id) {
    return ReservasiDummy.getById(id);
  },

  /* =====================================
     DELETE
  ===================================== */

  async delete(id) {
    return ReservasiDummy.delete(id);
  },
};
