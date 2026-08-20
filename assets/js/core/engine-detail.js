/* =========================================
   DETAIL ENGINE
========================================= */

const Detail = {
  /* =====================================
     OPEN
  ===================================== */

  open({ title = "Detail", size = "lg", header = {}, sections = [] }) {
    Modal.open({
      title,

      size,

      body: this.render(header, sections),

      footer: `
        <button
            class="btn btn-outline"
            onclick="Modal.close()">

            Tutup

        </button>
      `,
    });

    lucide.createIcons();
  },

  /* =====================================
     RENDER
  ===================================== */

  render(header, sections) {
    return `

        <div class="detail">

            ${this.renderHeader(header)}

            ${sections.map((section) => this.renderSection(section)).join("")}

        </div>

    `;
  },

  /* =====================================
     HEADER
  ===================================== */

  renderHeader(header = {}) {
    if (!header.title) return "";

    return `

        <div class="detail-header">

            <div class="detail-avatar">

                ${
                  header.image
                    ? `
                            <img
                                src="${Asset.image(header.image)}"
                                class="detail-avatar-image"
                                onerror="Asset.error(this)">
                        `
                    : `
                            <i data-lucide="${header.icon || "hotel"}"></i>
                        `
                }

            </div>

            <div class="detail-header-content">

                <h3>

                    ${header.title}

                </h3>

                <p>

                    ${header.subtitle || ""}

                </p>

                ${
                  header.badge
                    ? `<div class="detail-badge">${header.badge}</div>`
                    : ""
                }

            </div>

        </div>

    `;
  },

  /* =====================================
     SECTION
  ===================================== */

  renderSection(section) {
    return `

        <div class="detail-section">

            <div class="detail-title">

                ${section.title}

            </div>

            <div class="detail-grid">

                ${section.fields
                  .map((field) => this.renderField(field))
                  .join("")}

            </div>

        </div>

    `;
  },

  /* =====================================
     FIELD
  ===================================== */

  renderField(field) {
    return `

        <div class="detail-item ${field.full ? "full" : ""}">

            <div class="detail-label">

                ${field.label}

            </div>

            <div class="detail-value">

                ${this.renderValue(field)}

            </div>

        </div>

    `;
  },

  /* =====================================
   VALUE
===================================== */

  renderValue(field) {
    if (field.type === "image") {
      return `

            <img
                src="${Asset.image(field.value)}"
                class="detail-image"
                onerror="Asset.error(this)">

        `;
    }

    return field.value ?? "-";
  },

  /* =====================================
     CLOSE
  ===================================== */

  close() {
    Modal.close();
  },
};
