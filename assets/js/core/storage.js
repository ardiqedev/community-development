/* =========================================
   QEDEV STORAGE
========================================= */

const Storage = {};

/* =====================================
   Set
===================================== */

Storage.set = function (key, value) {
  localStorage.setItem(key, JSON.stringify(value));
};

/* =====================================
   Get
===================================== */

Storage.get = function (key, defaultValue = null) {
  const value = localStorage.getItem(key);

  if (value === null) {
    return defaultValue;
  }

  return JSON.parse(value);
};

/* =====================================
   Has
===================================== */

Storage.has = function (key) {
  return localStorage.getItem(key) !== null;
};

/* =====================================
   Remove
===================================== */

Storage.remove = function (key) {
  localStorage.removeItem(key);
};

/* =====================================
   Clear
===================================== */

Storage.clear = function () {
  localStorage.clear();
};
