/* =========================================
   QEDEV API
========================================= */

const API = {};

/* =========================================
   CONFIG
========================================= */

API.baseUrl = CONFIG.API.URL;

/* =========================================
   REQUEST
========================================= */

API.request = async function (action, data = {}) {
  try {
    /* =====================================
       BUILD URL
    ===================================== */

    const url = `${this.baseUrl}?action=${encodeURIComponent(action)}`;

    /* =====================================
       PAYLOAD
    ===================================== */

    const payload = JSON.stringify(data);

    /* =====================================
       REQUEST
    ===================================== */

    const response = await fetch(url, {
      method: "POST",

      body: new URLSearchParams({
        payload: payload,
      }),
    });

    /* =====================================
       READ RESPONSE
    ===================================== */

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("[API] Invalid JSON response:", text);

      throw new Error(
        `Server mengembalikan response tidak valid (${response.status}).`,
      );
    }

    /* =====================================
       HTTP ERROR
    ===================================== */

    if (!response.ok) {
      throw new Error(result?.message || `Request gagal (${response.status}).`);
    }

    /* =====================================
       APPLICATION ERROR
    ===================================== */

    if (result.success === false) {
      throw new Error(result.message || "Request gagal.");
    }

    /* =====================================
       SUCCESS
    ===================================== */

    return result;
  } catch (error) {
    console.error("[API] Request error:", error);

    throw error;
  }
};

/* =========================================
   GET
========================================= */

API.get = async function (action, params = {}) {
  const query = new URLSearchParams();

  query.set("action", action);

  Object.keys(params).forEach(function (key) {
    const value = params[key];

    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const url = `${this.baseUrl}?${query.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {
      console.error("[API] Invalid JSON response:", text);

      throw new Error(
        `Server mengembalikan response tidak valid (${response.status}).`,
      );
    }

    if (!response.ok) {
      throw new Error(result?.message || `Request gagal (${response.status}).`);
    }

    if (result.success === false) {
      throw new Error(result.message || "Request gagal.");
    }

    return result;
  } catch (error) {
    console.error("[API] GET error:", error);

    throw error;
  }
};

/* =========================================
   POST
========================================= */

API.post = function (action, data = {}) {
  return this.request(action, data);
};
