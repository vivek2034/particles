// Shared premium UI effects for both pages.
(function () {
  function markLoaded() {
    window.setTimeout(function () {
      document.body.classList.add("loaded");
    }, 450);
  }

  function updateProgressBar() {
    var bar = document.getElementById("progress-bar");
    if (!bar) {
      return;
    }

    function sync() {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = Math.min(progress, 100) + "%";
    }

    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  function mountRevealObserver() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) {
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.16
    });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function mountCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) {
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        var node = entry.target;
        var target = Number(node.getAttribute("data-counter")) || 0;
        var duration = 1100;
        var start = performance.now();

        function tick(now) {
          var progress = Math.min((now - start) / duration, 1);
          node.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            node.textContent = String(target);
          }
        }

        requestAnimationFrame(tick);
        observer.unobserve(node);
      });
    }, {
      threshold: 0.5
    });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function mountTiltCards() {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width;
        var py = (event.clientY - rect.top) / rect.height;
        var rotateY = (px - 0.5) * 10;
        var rotateX = (0.5 - py) * 8;
        card.style.transform = "perspective(1000px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  function mountParallax() {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    var layers = document.querySelectorAll("[data-parallax]");
    if (!layers.length) {
      return;
    }

    window.addEventListener("mousemove", function (event) {
      var x = (event.clientX / window.innerWidth - 0.5) * 12;
      var y = (event.clientY / window.innerHeight - 0.5) * 10;
      layers.forEach(function (layer, index) {
        var depth = (index + 1) * 0.35;
        layer.style.transform = "translate3d(" + (-x * depth) + "px," + (-y * depth) + "px,0)";
      });
    });
  }

  function mountMobileMenus() {
    document.querySelectorAll("[data-menu-toggle]").forEach(function (button) {
      var targetId = button.getAttribute("data-menu-toggle");
      var menu = document.getElementById(targetId);
      if (!menu) {
        return;
      }

      button.addEventListener("click", function () {
        var isOpen = menu.classList.toggle("is-open");
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          menu.classList.remove("is-open");
          button.setAttribute("aria-expanded", "false");
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      markLoaded();
      updateProgressBar();
      mountRevealObserver();
      mountCounters();
      mountTiltCards();
      mountParallax();
      mountMobileMenus();
    });
  } else {
    markLoaded();
    updateProgressBar();
    mountRevealObserver();
    mountCounters();
    mountTiltCards();
    mountParallax();
    mountMobileMenus();
  }
}());
