/* =========================================
   COMMUNITY DEVELOPMENT
   Module : Dashboard
========================================= */

const Dashboard = {};

/* =========================================
   INIT
========================================= */

Dashboard.init = async function () {
  try {
    console.log("[DASHBOARD] Init");

    Dashboard.showLoading();

    const response = await API.get("getDashboard");

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil data dashboard.");
    }

    const data = response.data || {};

    /* =====================================
       RENDER
    ===================================== */

    Dashboard.renderSummary(data);

    Dashboard.renderStatus(data);

    Dashboard.renderCharts(data);

    /* =====================================
       ICON
    ===================================== */

    if (
      typeof lucide !== "undefined" &&
      typeof lucide.createIcons === "function"
    ) {
      lucide.createIcons();
    }

    console.log("[DASHBOARD] Loaded", data);
  } catch (error) {
    console.error("[DASHBOARD] Init failed:", error);

    Dashboard.showError(error);
  }
};

/* =========================================
   SUMMARY
========================================= */

Dashboard.renderSummary = function (data) {
  /* ---------------------------------------
     Total Penduduk
  --------------------------------------- */

  Dashboard.setText("statTotalPenduduk", Dashboard.number(data.totalPenduduk));

  /* ---------------------------------------
     Total Program
  --------------------------------------- */

  Dashboard.setText("statTotalProgram", Dashboard.number(data.totalProgram));

  /* ---------------------------------------
     Program Aktif
  --------------------------------------- */

  Dashboard.setText(
    "statProgramAktif",
    `${Dashboard.number(data.totalProgramAktif)} aktif`,
  );

  /* ---------------------------------------
     Total Penerima
  --------------------------------------- */

  Dashboard.setText("statTotalPenerima", Dashboard.number(data.totalPenerima));

  /* ---------------------------------------
     Penerima Aktif
  --------------------------------------- */

  Dashboard.setText(
    "statPenerimaAktif",
    `${Dashboard.number(data.totalPenerimaAktif)} aktif`,
  );

  /* ---------------------------------------
     Total Desa
  --------------------------------------- */

  const sebaranDesa = Array.isArray(data.sebaranDesa) ? data.sebaranDesa : [];

  Dashboard.setText("statTotalDesa", Dashboard.number(sebaranDesa.length));
};

/* =========================================
   STATUS
========================================= */

Dashboard.renderStatus = function (data) {
  const totalProgram = Number(data.totalProgram) || 0;

  const totalProgramAktif = Number(data.totalProgramAktif) || 0;

  const totalPenerima = Number(data.totalPenerima) || 0;

  const totalPenerimaAktif = Number(data.totalPenerimaAktif) || 0;

  /* =====================================
     PROGRAM
  ===================================== */

  Dashboard.setText("summaryProgramAktif", Dashboard.number(totalProgramAktif));

  Dashboard.setText("summaryTotalProgram", Dashboard.number(totalProgram));

  const programPercent =
    totalProgram > 0 ? Math.round((totalProgramAktif / totalProgram) * 100) : 0;

  Dashboard.setText("summaryProgramPercent", `${programPercent}%`);

  /* =====================================
     PENERIMA
  ===================================== */

  Dashboard.setText(
    "summaryPenerimaAktif",
    Dashboard.number(totalPenerimaAktif),
  );

  Dashboard.setText("summaryTotalPenerima", Dashboard.number(totalPenerima));

  const penerimaPercent =
    totalPenerima > 0
      ? Math.round((totalPenerimaAktif / totalPenerima) * 100)
      : 0;

  Dashboard.setText("summaryPenerimaPercent", `${penerimaPercent}%`);
};

/* =========================================
   CHARTS
========================================= */

Dashboard.renderCharts = function (data) {
  Dashboard.renderSebaranDesa(data.sebaranDesa || []);

  Dashboard.renderPenerimaProgram(data.penerimaPerProgram || []);
};

/* =========================================
   CHART
   SEBARAN DESA
========================================= */

Dashboard.renderSebaranDesa = function (rows) {
  const canvas = document.getElementById("chartSebaranDesa");

  if (!canvas) {
    console.warn("[DASHBOARD] Canvas chartSebaranDesa tidak ditemukan.");

    return;
  }

  /* =====================================
     DESTROY CHART LAMA
  ===================================== */

  if (
    Dashboard.chartSebaranDesa &&
    typeof Dashboard.chartSebaranDesa.destroy === "function"
  ) {
    Dashboard.chartSebaranDesa.destroy();
  }

  /* =====================================
     DATA
  ===================================== */

  const labels = rows.map(function (row) {
    return row.label || "-";
  });

  const values = rows.map(function (row) {
    return Number(row.total) || 0;
  });

  /* =====================================
     CHART
  ===================================== */

  if (typeof Chart === "undefined") {
    console.warn("[DASHBOARD] Chart.js belum tersedia.");

    return;
  }

  Dashboard.chartSebaranDesa = new Chart(canvas, {
    type: "bar",

    data: {
      labels,

      datasets: [
        {
          label: "Penduduk",

          data: values,

          borderWidth: 1,

          borderRadius: 6,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
};

/* =========================================
   CHART
   PENERIMA PER PROGRAM
========================================= */

Dashboard.renderPenerimaProgram = function (rows) {
  const canvas = document.getElementById("chartPenerimaProgram");

  if (!canvas) {
    console.warn("[DASHBOARD] Canvas chartPenerimaProgram tidak ditemukan.");

    return;
  }

  /* =====================================
     DESTROY CHART LAMA
  ===================================== */

  if (
    Dashboard.chartPenerimaProgram &&
    typeof Dashboard.chartPenerimaProgram.destroy === "function"
  ) {
    Dashboard.chartPenerimaProgram.destroy();
  }

  /* =====================================
     DATA
  ===================================== */

  const labels = rows.map(function (row) {
    return row.NAMA_PROGRAM || "-";
  });

  const values = rows.map(function (row) {
    return Number(row.total) || 0;
  });

  /* =====================================
     CHART
  ===================================== */

  if (typeof Chart === "undefined") {
    console.warn("[DASHBOARD] Chart.js belum tersedia.");

    return;
  }

  Dashboard.chartPenerimaProgram = new Chart(canvas, {
    type: "bar",

    data: {
      labels,

      datasets: [
        {
          label: "Penerima",

          data: values,

          borderWidth: 1,

          borderRadius: 6,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      indexAxis: "y",

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        x: {
          beginAtZero: true,

          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
};

/* =========================================
   LOADING
========================================= */

Dashboard.showLoading = function () {
  Dashboard.setText("statTotalPenduduk", "–");

  Dashboard.setText("statTotalProgram", "–");

  Dashboard.setText("statTotalPenerima", "–");

  Dashboard.setText("statTotalDesa", "–");
};

/* =========================================
   ERROR
========================================= */

Dashboard.showError = function (error) {
  const message = error?.message || "Gagal memuat dashboard.";

  console.error("[DASHBOARD]", message);

  if (typeof Toast !== "undefined" && typeof Toast.error === "function") {
    Toast.error(message);
  }
};

/* =========================================
   SET TEXT
========================================= */

Dashboard.setText = function (id, value) {
  const element = document.getElementById(id);

  if (!element) {
    console.warn(`[DASHBOARD] Element #${id} tidak ditemukan.`);

    return;
  }

  element.textContent = value ?? "-";
};

/* =========================================
   NUMBER FORMAT
========================================= */

Dashboard.number = function (value) {
  const number = Number(value) || 0;

  return number.toLocaleString("id-ID");
};
