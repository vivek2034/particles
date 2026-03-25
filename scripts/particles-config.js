// Shared particles.js configuration for the landing page hero background.
if (typeof particlesJS !== "undefined" && document.getElementById("particles-js")) {
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 90,
        density: {
          enable: true,
          value_area: 900
        }
      },
      color: {
        value: ["#67e8f9", "#93c5fd", "#f8fafc"]
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: 0.45,
        random: true
      },
      size: {
        value: 3,
        random: true
      },
      line_linked: {
        enable: true,
        distance: 140,
        color: "#67e8f9",
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        speed: 1.2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab"
        },
        onclick: {
          enable: true,
          mode: "push"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 160,
          line_linked: {
            opacity: 0.5
          }
        },
        push: {
          particles_nb: 5
        }
      }
    },
    retina_detect: true
  });
}
