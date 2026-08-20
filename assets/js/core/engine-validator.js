/* =========================================
   VALIDATOR ENGINE
========================================= */

const Validator = {
  /* =====================================
     VALIDATE
  ===================================== */

  validate(rules = {}) {
    this.clear();

    let firstError = null;

    for (const id in rules) {
      const element = document.getElementById(id);

      if (!element) continue;

      const value = element.value.trim();

      const option = rules[id];

      /* ===============================
         REQUIRED
      =============================== */

      if (option.required && value === "") {
        this.showError(element, option.label || "Field ini wajib diisi.");

        if (!firstError) {
          firstError = element;
        }

        continue;
      }
    }

    if (firstError) {
      firstError.focus();

      return false;
    }

    return true;
  },

  /* =====================================
     SHOW ERROR
  ===================================== */

  showError(element, message) {
    element.classList.add("is-invalid");

    const error = document.createElement("div");

    error.className = "form-error";

    error.innerText = message;

    element.parentNode.appendChild(error);
  },

  /* =====================================
     CLEAR
  ===================================== */

  clear() {
    document.querySelectorAll(".is-invalid").forEach((el) => {
      el.classList.remove("is-invalid");
    });

    document.querySelectorAll(".form-error").forEach((el) => {
      el.remove();
    });
  },
};
