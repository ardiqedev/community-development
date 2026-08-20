/* =========================================
   QEDEV AUTH
========================================= */

const Auth = {};

/* =====================================
   CONFIG
===================================== */

Auth.config = {
  tokenKey: "token",

  userKey: "user",
};

/* =====================================
   INIT
===================================== */

Auth.init = function () {
  const token = Storage.get(this.config.tokenKey);

  const user = Storage.get(this.config.userKey);

  if (token) {
    State.set("token", token);
  }

  if (user) {
    State.set("user", user);
  }
};

/* =====================================
   LOGIN
===================================== */

Auth.login = async function (username, password) {
  const response = await API.post("auth.login", {
    username,
    password,
  });

  if (!response.success) {
    return response;
  }

  this.setToken(response.data.token);

  this.setUser(response.data.user);

  return response;
};

/* =====================================
   LOGOUT
===================================== */

Auth.logout = function () {
  this.destroy();
};

/* =====================================
   CHECK
===================================== */

Auth.check = function () {
  return this.isLoggedIn();
};

/* =====================================
   IS LOGGED IN
===================================== */

Auth.isLoggedIn = function () {
  return this.getToken() !== null;
};

/* =====================================
   USER
===================================== */

Auth.user = function () {
  return State.get("user");
};

/* =====================================
   SET USER
===================================== */

Auth.setUser = function (user) {
  Storage.set(this.config.userKey, user);

  State.set("user", user);
};

/* =====================================
   CLEAR USER
===================================== */

Auth.clearUser = function () {
  Storage.remove(this.config.userKey);

  State.remove("user");
};

/* =====================================
   GET TOKEN
===================================== */

Auth.getToken = function () {
  return State.get("token");
};

/* =====================================
   SET TOKEN
===================================== */

Auth.setToken = function (token) {
  Storage.set(this.config.tokenKey, token);

  State.set("token", token);
};

/* =====================================
   CLEAR TOKEN
===================================== */

Auth.clearToken = function () {
  Storage.remove(this.config.tokenKey);

  State.remove("token");
};

/* =====================================
   DESTROY
===================================== */

Auth.destroy = function () {
  this.clearToken();

  this.clearUser();

  State.clear();
};
