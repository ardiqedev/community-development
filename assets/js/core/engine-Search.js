/* =========================================
   QEDEV SEARCH ENGINE
========================================= */

const Search = {};

/* =====================================
   INIT
===================================== */

Search.init = function ({ input, delay = 400, minLength = 0, onSearch }) {
  const element = document.querySelector(input);

  if (!element) {
    console.warn(`Search: "${input}" tidak ditemukan.`);
    return;
  }

  let timer = null;

  element.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();

    clearTimeout(timer);

    timer = setTimeout(() => {
      if (keyword.length > 0 && keyword.length < minLength) {
        return;
      }

      if (typeof onSearch === "function") {
        onSearch(keyword);
      }
    }, delay);
  });
};
