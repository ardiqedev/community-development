/* =========================================
   QEDEV STATE
========================================= */

const State = {
  data: {},
};

/* =====================================
   Init
===================================== */

State.init = function () {
  this.data = {};
};

/* =====================================
   Set
===================================== */

State.set = function (key, value) {
  this.data[key] = value;

  return value;
};

/* =====================================
   Get
===================================== */

State.get = function (key, defaultValue = null) {
  return this.has(key) ? this.data[key] : defaultValue;
};

/* =====================================
   Has
===================================== */

State.has = function (key) {
  return Object.prototype.hasOwnProperty.call(this.data, key);
};

/* =====================================
   Remove
===================================== */

State.remove = function (key) {
  delete this.data[key];
};

/* =====================================
   Clear
===================================== */

State.clear = function () {
  this.data = {};
};

/* =====================================
   All
===================================== */

State.all = function () {
  return {
    ...this.data,
  };
};
