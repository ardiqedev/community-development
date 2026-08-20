/* =========================================
   QEDEV ASSET ENGINE
========================================= */

const Asset = {
  /* =====================================
       DEFAULTS
    ===================================== */

  defaults: {
    image() {
      return CONFIG.ASSET.PLACEHOLDER.IMAGE;
    },
  },
};

/* =====================================
   GET GOOGLE DRIVE FILE ID
===================================== */

Asset.getDriveId = function (url) {
  if (!url) {
    return null;
  }

  const match = url.match(/[?&]id=([^&]+)/);

  return match ? match[1] : null;
};

/* =====================================
   IMAGE
===================================== */

Asset.image = function (url) {
  if (!url) {
    return this.defaults.image();
  }

  const id = this.getDriveId(url);

  if (id) {
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }

  return url;
};

// Asset.image = function (url) {
//   console.log(url);

//   return url;
// };

/* =====================================
   ERROR
===================================== */

Asset.error = function (image) {
  image.onerror = null;

  image.classList.add("asset-error");

  image.src = this.defaults.image();
};
