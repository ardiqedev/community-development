/* =========================================
   DROPDOWN ENGINE
========================================= */

const Dropdown = {
  /* =====================================
       RENDER
  ===================================== */

  render({
    target,

    data = [],

    valueField = "id",

    textField = "nama",

    placeholder = "Pilih Data",
  }) {
    const select = document.querySelector(target);

    if (!select) return;

    select.innerHTML = `

          <option value="">

              ${placeholder}

          </option>

      `;

    data.forEach((item) => {
      select.insertAdjacentHTML(
        "beforeend",

        `

                  <option value="${item[valueField]}">

                      ${item[textField]}

                  </option>

              `,
      );
    });
  },

  /* =====================================
       CLEAR
  ===================================== */

  clear(target, placeholder = "Pilih Data") {
    const select = document.querySelector(target);

    if (!select) return;

    select.innerHTML = `

          <option value="">

              ${placeholder}

          </option>

      `;
  },
};
