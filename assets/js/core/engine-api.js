/* =========================================
   API ENGINE
========================================= */

const Api = {
  /* =====================================
     CONFIG
  ===================================== */

  baseUrl: "",

  headers: {
    "Content-Type": "application/json",
  },

  /* =====================================
     SET BASE URL
  ===================================== */

  setBaseUrl(url) {
    this.baseUrl = url;
  },

  /* =====================================
     REQUEST
  ===================================== */

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(this.baseUrl + endpoint, {
        ...options,

        headers: {
          ...this.headers,

          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(err);

      Toast.error("Gagal terhubung ke server.");

      throw err;
    }
  },

  /* =====================================
     GET
  ===================================== */

  get(endpoint) {
    return this.request(endpoint, {
      method: "GET",
    });
  },

  /* =====================================
     POST
  ===================================== */

  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",

      body: JSON.stringify(data),
    });
  },

  /* =====================================
     PUT
  ===================================== */

  put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",

      body: JSON.stringify(data),
    });
  },

  /* =====================================
     DELETE
  ===================================== */

  delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  },
};
