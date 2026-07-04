/* ==========================================================================
   Ads-Peria — script.js
   Vanilla JS · IIFE · sin dependencias
   Módulos: menú móvil · reveals · typewriter · tabs · animaciones on-scroll
   ========================================================================== */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. Menú móvil (aria-expanded / aria-controls, cierra con Escape)
     ------------------------------------------------------------------ */
  var nav = document.querySelector(".js-nav");
  var toggle = document.querySelector(".js-nav-toggle");

  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  }

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });

    // Cierra el menú al navegar a una sección
    nav.addEventListener("click", function (e) {
      var link = e.target.closest ? e.target.closest(".nav__link, .btn") : null;
      if (link) closeMenu();
    });
  }

  /* ------------------------------------------------------------------
     2. Reveals + animaciones de barras/gráfica al entrar en viewport
     ------------------------------------------------------------------ */
  var animated = document.querySelectorAll(".reveal, .js-bars, .js-chart");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    animated.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
    );
    animated.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     3. Buscador simulado: teclea la búsqueda y aparecen los resultados
     ------------------------------------------------------------------ */
  var serp = document.querySelector(".js-serp");

  if (serp) {
    var queryEl = serp.querySelector(".js-serp-query");
    var results = Array.prototype.slice.call(serp.querySelectorAll(".js-serp-result"));

    if (reducedMotion) {
      // Estado estático: búsqueda completa y resultados visibles
      results.forEach(function (r) {
        r.classList.add("is-shown");
      });
    } else {
      var queries = [
        "agencia de google ads en méxico",
        "dentista cerca de mí",
        "software de nómina precio",
        "envío de flores hoy",
        "renta de maquinaria torreón"
      ];
      var qIndex = 0;

      var hideResults = function () {
        results.forEach(function (r) {
          r.classList.remove("is-shown");
        });
      };

      var showResults = function () {
        results.forEach(function (r, i) {
          window.setTimeout(function () {
            r.classList.add("is-shown");
          }, i * 260);
        });
      };

      var typeQuery = function (text, done) {
        var i = 0;
        var step = function () {
          i += 1;
          queryEl.textContent = text.slice(0, i);
          if (i < text.length) {
            window.setTimeout(step, 42);
          } else {
            done();
          }
        };
        step();
      };

      var eraseQuery = function (done) {
        var text = queryEl.textContent;
        var i = text.length;
        var step = function () {
          i -= 1;
          queryEl.textContent = text.slice(0, i);
          if (i > 0) {
            window.setTimeout(step, 14);
          } else {
            done();
          }
        };
        step();
      };

      var cycle = function () {
        typeQuery(queries[qIndex], function () {
          // Pausa breve tras teclear, luego "cargan" los resultados
          window.setTimeout(function () {
            showResults();
            // Tiempo de lectura, luego se limpia y sigue la próxima búsqueda
            window.setTimeout(function () {
              hideResults();
              window.setTimeout(function () {
                eraseQuery(function () {
                  qIndex = (qIndex + 1) % queries.length;
                  window.setTimeout(cycle, 180);
                });
              }, 250);
            }, 4600);
          }, 300);
        });
      };

      // Estado inicial: la primera búsqueda ya escrita en el HTML
      window.setTimeout(function () {
        showResults();
        window.setTimeout(function () {
          hideResults();
          window.setTimeout(function () {
            eraseQuery(function () {
              qIndex = 1;
              window.setTimeout(cycle, 180);
            });
          }, 250);
        }, 4600);
      }, 400);
    }
  }

  /* ------------------------------------------------------------------
     4. Tabs accesibles (soluciones): click + flechas + Home/End
     ------------------------------------------------------------------ */
  var tabsRoot = document.querySelector(".js-tabs");

  if (tabsRoot) {
    var tabs = Array.prototype.slice.call(tabsRoot.querySelectorAll("[role='tab']"));
    var panels = Array.prototype.slice.call(tabsRoot.querySelectorAll("[role='tabpanel']"));

    var selectTab = function (tab, focus) {
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
        t.setAttribute("tabindex", active ? "0" : "-1");
      });
      panels.forEach(function (p) {
        p.hidden = p.id !== tab.getAttribute("aria-controls");
      });
      if (focus) tab.focus();
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        selectTab(tab, false);
      });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          selectTab(next, true);
        }
      });
    });
  }
})();
