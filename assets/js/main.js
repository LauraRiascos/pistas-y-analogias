/**
* Basado en la plantilla BizLand (BootstrapMade.com).
* Solo conserva lo que usa este recurso: encabezado, menú móvil,
* preloader, botón de volver arriba y menú con pestañas.
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

})();

// Menú con tabs
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tab-link");
  const contents = document.querySelectorAll(".tab-content");

  contents.forEach(content => content.classList.remove("active"));
  document.getElementById("seccion2").classList.add("active");

  function setActiveTab(target) {
    tabs.forEach(tab => tab.classList.remove("active"));
    document.querySelector(`[data-tab="${target}"]`).classList.add("active");
  }

  setActiveTab("seccion2");

  tabs.forEach(tab => {
    tab.addEventListener("click", function (event) {
      event.preventDefault();
      const target = this.getAttribute("data-tab");

      // Desactivar todas las secciones
      contents.forEach(content => content.classList.remove("active"));

      // Activar la sección seleccionada
      document.getElementById(target).classList.add("active");

      // Marcar como tab activo
      setActiveTab(target);

      // Scrollear hacia arriba después del cambio
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "auto"
        });
      }, 50);
    });
  });
});
