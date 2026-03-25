// Interactive Three.js scenes for the landing page and article page.
(function () {
  if (typeof THREE === "undefined") {
    return;
  }

  function createRenderer(container) {
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    return renderer;
  }

  function mountAnimatedCursor() {
    var dot = document.getElementById("cursor-dot");
    var trail = document.getElementById("cursor-trail");
    if (!dot || !trail || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    var state = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      tx: window.innerWidth / 2,
      ty: window.innerHeight / 2
    };

    window.addEventListener("mousemove", function (event) {
      state.x = event.clientX;
      state.y = event.clientY;
      dot.style.left = state.x + "px";
      dot.style.top = state.y + "px";
    });

    document.querySelectorAll("a, button, .visual-stage, .magnetic-card").forEach(function (node) {
      node.addEventListener("mouseenter", function () {
        document.body.classList.add("cursor-active");
      });
      node.addEventListener("mouseleave", function () {
        document.body.classList.remove("cursor-active");
      });
    });

    function animate() {
      state.tx += (state.x - state.tx) * 0.16;
      state.ty += (state.y - state.ty) * 0.16;
      trail.style.left = state.tx + "px";
      trail.style.top = state.ty + "px";
      requestAnimationFrame(animate);
    }

    animate();
  }

  function mountHeroScene() {
    var container = document.getElementById("three-hero-scene");
    if (!container) {
      return;
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    var renderer = createRenderer(container);
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));

    var keyLight = new THREE.PointLight(0x67e8f9, 2.2, 40);
    keyLight.position.set(4, 4, 8);
    scene.add(keyLight);

    var rimLight = new THREE.PointLight(0xf59e0b, 1.1, 30);
    rimLight.position.set(-5, -2, 5);
    scene.add(rimLight);

    var rig = new THREE.Group();
    scene.add(rig);

    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 2),
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.35,
        metalness: 0.1,
        roughness: 0.2,
        wireframe: true
      })
    );
    rig.add(core);

    var nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: 0x67e8f9,
        emissiveIntensity: 0.5,
        roughness: 0.15,
        metalness: 0.05
      })
    );
    rig.add(nucleus);

    function makeRing(radius, color, rotation) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.025, 16, 220),
        new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.55
        })
      );
      ring.rotation.set(rotation.x, rotation.y, rotation.z);
      rig.add(ring);
      return ring;
    }

    var ringA = makeRing(1.95, 0x67e8f9, { x: Math.PI / 2.5, y: 0.2, z: 0.0 });
    var ringB = makeRing(2.35, 0x93c5fd, { x: 0.85, y: 0.7, z: 0.55 });
    var ringC = makeRing(2.75, 0x34d399, { x: 1.3, y: 0.1, z: 1.2 });
    var outerShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.4, 1),
      new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        wireframe: true,
        transparent: true,
        opacity: 0.12
      })
    );
    rig.add(outerShell);

    var starPositions = [];
    for (var i = 0; i < 1400; i += 1) {
      var radius = 2.4 + Math.random() * 2.2;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos((Math.random() * 2) - 1);
      starPositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }

    var stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3)),
      new THREE.PointsMaterial({
        color: 0x67e8f9,
        size: 0.045,
        transparent: true,
        opacity: 0.95
      })
    );
    rig.add(stars);

    var cometGeometry = new THREE.BufferGeometry();
    var cometTrail = [];
    for (var c = 0; c < 90; c += 1) {
      cometTrail.push(0, 0, 0);
    }
    cometGeometry.setAttribute("position", new THREE.Float32BufferAttribute(cometTrail, 3));
    var comet = new THREE.Line(
      cometGeometry,
      new THREE.LineBasicMaterial({
        color: 0xf8fafc,
        transparent: true,
        opacity: 0.5
      })
    );
    rig.add(comet);

    function makeElectron(color) {
      return new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 16, 16),
        new THREE.MeshBasicMaterial({ color: color })
      );
    }

    var electron1 = makeElectron(0x67e8f9);
    var electron2 = makeElectron(0xf59e0b);
    var electron3 = makeElectron(0x34d399);
    rig.add(electron1, electron2, electron3);

    var focusDescription = document.getElementById("focus-description");
    var focusButtons = document.querySelectorAll("[data-particle-focus]");
    var state = {
      pointerX: 0,
      pointerY: 0,
      speed: 0.0034
    };

    var focusMap = {
      quarks: {
        color: 0xf59e0b,
        speed: 0.0048,
        text: "Quarks intensify the dense inner core, emphasizing the strongly bound building blocks that form protons and neutrons."
      },
      leptons: {
        color: 0x67e8f9,
        speed: 0.0030,
        text: "Leptons shift the scene toward lighter, cleaner orbital motion, reflecting particles like electrons and neutrinos."
      },
      bosons: {
        color: 0x34d399,
        speed: 0.0038,
        text: "Bosons brighten the orbital channels to represent the force-carrying messengers that connect the quantum world."
      }
    };

    function setFocus(name) {
      var config = focusMap[name];
      if (!config) {
        return;
      }

      state.speed = config.speed;
      keyLight.color.setHex(config.color);
      nucleus.material.emissive.setHex(config.color);
      core.material.color.setHex(config.color);
      stars.material.color.setHex(config.color);
      outerShell.material.color.setHex(config.color);
      ringA.material.color.setHex(config.color);

      if (focusDescription) {
        focusDescription.textContent = config.text;
      }
    }

    focusButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setFocus(button.getAttribute("data-particle-focus"));
      });
    });

    container.addEventListener("mousemove", function (event) {
      var bounds = container.getBoundingClientRect();
      state.pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2.2;
      state.pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 1.6;
    });

    container.addEventListener("mouseleave", function () {
      state.pointerX = 0;
      state.pointerY = 0;
    });

    function resize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener("resize", resize);
    setFocus("leptons");

    function animate() {
      requestAnimationFrame(animate);

      var time = performance.now() * 0.001;
      rig.rotation.y += state.speed;
      rig.rotation.x += 0.0015;
      rig.position.x += (state.pointerX - rig.position.x) * 0.04;
      rig.position.y += (-state.pointerY - rig.position.y) * 0.04;

      ringA.rotation.z += 0.006;
      ringB.rotation.z -= 0.0045;
      ringC.rotation.z += 0.0035;
      outerShell.rotation.x -= 0.0012;
      outerShell.rotation.y += 0.0018;
      stars.rotation.y -= 0.0012;
      stars.rotation.x += 0.0005;

      electron1.position.set(Math.cos(time * 1.6) * 1.95, Math.sin(time * 1.6) * 1.95, 0);
      electron2.position.set(Math.cos(time * 1.2 + 1.4) * 2.35, 0, Math.sin(time * 1.2 + 1.4) * 2.35);
      electron3.position.set(0, Math.sin(time * 0.95 + 0.8) * 2.75, Math.cos(time * 0.95 + 0.8) * 2.75);

      var cometPositions = comet.geometry.attributes.position.array;
      for (var i = cometPositions.length - 3; i >= 3; i -= 3) {
        cometPositions[i] = cometPositions[i - 3];
        cometPositions[i + 1] = cometPositions[i - 2];
        cometPositions[i + 2] = cometPositions[i - 1];
      }
      cometPositions[0] = Math.cos(time * 1.45) * 3.1;
      cometPositions[1] = Math.sin(time * 1.45) * 0.9;
      cometPositions[2] = Math.sin(time * 1.45) * 3.1;
      comet.geometry.attributes.position.needsUpdate = true;

      nucleus.scale.setScalar(1 + Math.sin(time * 2.8) * 0.04);
      core.rotation.x += 0.003;
      core.rotation.y -= 0.0025;

      renderer.render(scene, camera);
    }

    animate();
  }

  function mountArticleScene() {
    var container = document.getElementById("three-article-scene");
    if (!container) {
      return;
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 7;

    var renderer = createRenderer(container);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    var blueLight = new THREE.PointLight(0x67e8f9, 1.5, 30);
    blueLight.position.set(4, 3, 6);
    scene.add(blueLight);

    var goldLight = new THREE.PointLight(0xf59e0b, 1.0, 25);
    goldLight.position.set(-4, -1, 5);
    scene.add(goldLight);

    var atom = new THREE.Group();
    scene.add(atom);

    var core = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 28, 28),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: 0x67e8f9,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.05
      })
    );
    atom.add(core);

    var shells = [];
    for (var i = 0; i < 3; i += 1) {
      var shell = new THREE.Mesh(
        new THREE.TorusGeometry(1.8 + i * 0.55, 0.02, 16, 180),
        new THREE.MeshBasicMaterial({
          color: i === 2 ? 0xf59e0b : 0x67e8f9,
          transparent: true,
          opacity: 0.42
        })
      );
      shell.rotation.set((i + 1) * 0.7, i * 0.6, i * 0.3);
      atom.add(shell);
      shells.push(shell);
    }

    function electron(color) {
      return new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 14, 14),
        new THREE.MeshBasicMaterial({ color: color })
      );
    }

    var e1 = electron(0x67e8f9);
    var e2 = electron(0xf59e0b);
    var e3 = electron(0x34d399);
    atom.add(e1, e2, e3);

    function resize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener("resize", resize);

    function animate() {
      requestAnimationFrame(animate);
      var time = performance.now() * 0.001;

      atom.rotation.y += 0.004;
      atom.rotation.x = Math.sin(time * 0.5) * 0.08;
      atom.position.y = Math.sin(time * 0.8) * 0.08;
      shells[0].rotation.z += 0.004;
      shells[1].rotation.z -= 0.003;
      shells[2].rotation.z += 0.002;

      e1.position.set(Math.cos(time * 1.4) * 1.8, Math.sin(time * 1.4) * 1.8, 0);
      e2.position.set(Math.cos(time + 1.4) * 2.35, 0, Math.sin(time + 1.4) * 2.35);
      e3.position.set(0, Math.sin(time * 1.15 + 0.6) * 2.9, Math.cos(time * 1.15 + 0.6) * 2.9);

      core.scale.setScalar(1 + Math.sin(time * 2.4) * 0.03);
      renderer.render(scene, camera);
    }

    animate();
  }

  mountAnimatedCursor();
  mountHeroScene();
  mountArticleScene();
}());
