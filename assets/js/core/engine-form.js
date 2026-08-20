/* =========================================
   FORM ENGINE
========================================= */

const Form = {
  /* =====================================
     GET CONTAINER
  ===================================== */

  getContainer(container = document) {
    if (typeof container === "string") {
      return document.querySelector(container);
    }

    return container;
  },

  /* =====================================
     GET DATA
  ===================================== */

  getData(container = document) {
    container = this.getContainer(container);

    if (!container) return {};

    const data = {};

    container.querySelectorAll("input, select, textarea").forEach((element) => {
      if (!element.id) return;

      switch (element.type) {
        case "checkbox":
          data[element.id] = element.checked;
          break;

        case "radio":
          if (element.checked) {
            data[element.name || element.id] = element.value;
          }
          break;

        case "number":
          data[element.id] =
            element.value === "" ? null : Number(element.value);
          break;

        case "file":
          break;

        default:
          data[element.id] = element.value.trim();
      }
    });

    return data;
  },

  /* =====================================
     SET DATA
  ===================================== */

  setData(data = {}, container = document) {
    container = this.getContainer(container);

    if (!container) return;

    Object.keys(data).forEach((key) => {
      const element = container.querySelector(`#${key}`);

      if (!element) return;

      switch (element.type) {
        case "checkbox":
          element.checked = Boolean(data[key]);
          break;

        case "radio":
          if (element.value === data[key]) {
            element.checked = true;
          }
          break;

        default:
          element.value = data[key] ?? "";
      }
    });
  },

  /* =====================================
     RESET
  ===================================== */

  reset(container = document) {
    container = this.getContainer(container);

    if (!container) return;

    container.querySelectorAll("input, textarea, select").forEach((element) => {
      switch (element.type) {
        case "checkbox":
        case "radio":
          element.checked = false;
          break;

        default:
          element.value = "";
      }
    });
  },

  /* =====================================
     FILL
     (Alias setData)
  ===================================== */

  fill(data, container) {
    this.setData(data, container);
  },
};
