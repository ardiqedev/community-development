/* =========================================
   BADGE ENGINE
========================================= */

const Badge = {
  /* =====================================
     RENDER
  ===================================== */

  render(text = "-", type = "secondary") {
    return `

      <span class="badge badge-${type}">

        ${text}

      </span>

    `;
  },

  /* =====================================
     STATUS
  ===================================== */

  status(status = "") {
    switch (status.toLowerCase()) {
      case "aktif":
        return this.render("Aktif", "success");

      case "nonaktif":
        return this.render("Nonaktif", "danger");

      case "pending":
        return this.render("Pending", "warning");

      case "booked":
        return this.render("Booked", "primary");

      case "checkin":
        return this.render("Check In", "success");

      case "checkout":
        return this.render("Check Out", "secondary");

      case "dibatalkan":
        return this.render("Dibatalkan", "danger");

      case "lunas":
        return this.render("Lunas", "success");

      case "belum lunas":
        return this.render("Belum Lunas", "warning");

      case "tersedia":
        return this.render("Tersedia", "success");

      case "terisi":
        return this.render("Terisi", "danger");

      case "maintenance":
        return this.render("Maintenance", "secondary");

      default:
        return this.render(status || "-", "secondary");
    }
  },

  /* =====================================
     BOOLEAN
  ===================================== */

  boolean(value) {
    return value
      ? this.render("Ya", "success")
      : this.render("Tidak", "danger");
  },
};
