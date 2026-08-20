/* =========================================
   QEDEV ROUTER
   COMMUNITY DEVELOPMENT
========================================= */

const Router = {};

/* =========================================
   ROUTES
========================================= */

Router.routes = {
  dashboard: {
    title: "Dashboard",
    page: "pages/dashboard.html",
  },

  penduduk: {
    title: "Data Penduduk",
    page: "pages/penduduk.html",
  },

  program: {
    title: "Program",
    page: "pages/program.html",
  },

  "program-kriteria": {
    title: "Kriteria Program",
    page: "pages/program-kriteria.html",
  },

  penerima: {
    title: "Penerima Manfaat",
    page: "pages/penerima-manfaat.html",
  },

  evaluasi: {
    title: "Evaluasi",
    page: "pages/evaluasi.html",
  },

  report: {
    title: "Report",
    page: "pages/report.html",
  },
};

/* =========================================
   DEFAULT ROUTE
========================================= */

Router.defaultRoute = "dashboard";

/* =========================================
   CURRENT ROUTE
========================================= */

Router.current = null;

/* =========================================
   START
========================================= */

Router.start = function () {
  try {
    const route = Router.getRoute();

    Router.navigate(route, false);

    /* =====================================
       BROWSER BACK / FORWARD
    ===================================== */

    window.addEventListener("popstate", function () {
      const route = Router.getRoute();

      Router.navigate(route, false);
    });
  } catch (error) {
    console.error("[ROUTER] Start failed:", error);
  }
};

/* =========================================
   GET ROUTE
========================================= */

Router.getRoute = function () {
  const params = new URLSearchParams(window.location.search);

  const page = params.get("page");

  if (page && Router.routes[page]) {
    return page;
  }

  return Router.defaultRoute;
};

/* =========================================
   NAVIGATE
========================================= */

Router.navigate = async function (route, pushState = true, params = {}) {
  try {
    if (!Router.routes[route]) {
      console.warn(`[ROUTER] Route tidak ditemukan: ${route}`);

      route = Router.defaultRoute;
    }

    const config = Router.routes[route];

    if (pushState) {
      const searchParams = new URLSearchParams();

      searchParams.set("page", route);

      Object.keys(params || {}).forEach((key) => {
        const value = params[key];

        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, value);
        }
      });

      const url = "?" + searchParams.toString();

      window.history.pushState(
        {
          route: route,
          params: params,
        },
        "",
        url,
      );
    }

    if (typeof Loading !== "undefined" && Loading.show) {
      Loading.show();
    }

    await Router.loadComponent(config.page, "content");

    Router.current = route;

    document.title = `${config.title} | Community Development`;

    if (typeof Sidebar !== "undefined" && Sidebar.setActive) {
      Sidebar.setActive(route);
    }

    Router.initPage(route);
  } catch (error) {
    console.error("[ROUTER] Navigation failed:", error);

    Router.renderError(error);
  } finally {
    if (typeof Loading !== "undefined" && Loading.hide) {
      Loading.hide();
    }
  }
};

Router.getQuery = function () {
  const params = new URLSearchParams(window.location.search);

  const result = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

/* =========================================
   LOAD COMPONENT
========================================= */

Router.loadComponent = async function (url, target) {
  const element =
    typeof target === "string" ? document.getElementById(target) : target;

  if (!element) {
    throw new Error(`Target element tidak ditemukan: #${target}`);
  }

  const response = await fetch(url, {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(`Gagal memuat ${url} (${response.status})`);
  }

  const html = await response.text();

  element.innerHTML = html;

  /* =====================================
     LUCIDE
  ===================================== */

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  return html;
};

/* =========================================
   PAGE INIT
========================================= */

Router.initPage = function (route) {
  switch (route) {
    /* =====================================
       DASHBOARD
    ===================================== */

    case "dashboard":
      if (typeof Dashboard !== "undefined" && Dashboard.init) {
        Dashboard.init();
      }

      break;

    /* =====================================
       PENDUDUK
    ===================================== */

    case "penduduk":
      if (typeof Penduduk !== "undefined" && Penduduk.init) {
        Penduduk.init();
      }

      break;

    /* =====================================
       PROGRAM
    ===================================== */

    case "program":
      if (typeof Program !== "undefined" && Program.init) {
        Program.init();
      }

      break;

    /* =====================================
       PROGRAM KRITERIA
    ===================================== */

    case "program-kriteria":
      if (typeof ProgramKriteria !== "undefined" && ProgramKriteria.init) {
        ProgramKriteria.init();
      }

      break;

    case "evaluasi":
      if (typeof Evaluasi !== "undefined" && Evaluasi.init) {
        Evaluasi.init();
      }

      break;

    /* =====================================
       PENERIMA
    ===================================== */

    case "penerima":
      if (typeof PenerimaManfaat !== "undefined" && PenerimaManfaat.init) {
        PenerimaManfaat.init();
      }

      break;

    /* =====================================
       REPORT
    ===================================== */

    case "report":
      if (typeof Report !== "undefined" && Report.init) {
        Report.init();
      }

      break;
  }
};

/* =========================================
   RENDER ERROR
========================================= */

Router.renderError = function (error) {
  const content = document.getElementById("content");

  if (!content) {
    return;
  }

  content.innerHTML = `

    <div class="page-error">

      <div class="page-error-icon">

        <i data-lucide="alert-triangle"></i>

      </div>


      <h2>
        Halaman tidak dapat dimuat
      </h2>


      <p>
        ${error.message || "Terjadi kesalahan."}
      </p>


      <button
        type="button"
        onclick="Router.navigate('dashboard')"
      >
        Kembali ke Dashboard
      </button>

    </div>

  `;

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
};
