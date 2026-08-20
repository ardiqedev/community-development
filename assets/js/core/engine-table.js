/* =========================================
   TABLE ENGINE
========================================= */

const Table = {
  /* =====================================
     RENDER
  ===================================== */

  render(options = {}) {
    console.log("TABLE RENDER");

    console.log(options);
    const {
      target,
      columns = [],
      data = [],
      emptyText = "Tidak ada data",
      striped = false,
      hover = true,
    } = options;

    const container = document.querySelector(target);

    if (!container) return;

    const tableClass = [
      "table",
      striped ? "table-striped" : "",
      hover ? "table-hover" : "",
    ].join(" ");

    container.innerHTML = `

      <div class="table-wrapper">

          <table class="${tableClass}">

              ${this.renderHeader(columns)}

              ${this.renderBody(columns, data, emptyText)}

          </table>

      </div>

    `;
  },

  /* =====================================
     HEADER
  ===================================== */

  renderHeader(columns) {
    return `

      <thead>

          <tr>

              ${columns
                .map(
                  (col) => `

                  <th class="${col.className || ""}">

                      ${col.title}

                  </th>

              `,
                )
                .join("")}

          </tr>

      </thead>

    `;
  },

  /* =====================================
     BODY
  ===================================== */

  renderBody(columns, data, emptyText) {
    if (!data.length) {
      return this.renderEmpty(columns.length, emptyText);
    }

    return `

      <tbody>

          ${data
            .map(
              (row) => `

              <tr>

                  ${columns
                    .map((col) => {
                      const value = col.formatter
                        ? col.formatter(row)
                        : (row[col.field] ?? "-");

                      return `

                          <td class="${col.className || ""}">

                              ${value}

                          </td>

                      `;
                    })
                    .join("")}

              </tr>

          `,
            )
            .join("")}

      </tbody>

    `;
  },

  /* =====================================
     EMPTY
  ===================================== */

  renderEmpty(colspan, text) {
    return `

      <tbody>

          <tr>

              <td
                  colspan="${colspan}"
                  class="table-empty">

                  ${text}

              </td>

          </tr>

      </tbody>

    `;
  },
};
