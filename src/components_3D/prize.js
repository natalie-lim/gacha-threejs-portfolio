import { useEffect, useRef } from "react";
import * as THREE from "three";

const PRIZE_MESSAGES = [
  "cs @ uc san diego",
  "loves boba & matcha",
  "built things with ml & agents",
  "full-stack engineer",
  "always learning something new",
  "fan of cozy games",
];

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

function createMessageSprite(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fffdf2";
  ctx.strokeStyle = "#0e4749";
  ctx.lineWidth = 10;
  drawRoundedRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, 28);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#0e4749";
  ctx.font = "bold 38px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  wrapText(ctx, text, canvas.width / 2, canvas.height / 2, canvas.width - 80, 48);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true })
  );
  sprite.scale.set(1.6, 0.8, 1);
  return sprite;
}

const gumballColors = [
  0xff6b6b, 0xffa94d, 0xffd43b, 0x69db7c, 0x74c0fc, 0xda77f2, 0x63e6be,
  0xa9e34b, 0x4dabf7, 0xb197fc, 0xff8787, 0xff6eb4,
];

function About3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);

    const sphereGeo = new THREE.SphereGeometry(0.3, 40, 40);
    const halfGeo = {
      top: new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      bottom: new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    };

    const prizes = [];
    let messageIndex = 0;

    function startFlight(mesh, color, now) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const prize = {
        mesh,
        color,
        phase: "flying",
        flightFrom: mesh.position.clone(),
        flightTo: camera.position.clone().addScaledVector(forward, 2),
        flightStart: now,
      };
      prizes.push(prize);
    }

    function startBreak(prize, now) {
      scene.remove(prize.mesh);
      prize.mesh.material.dispose();
      delete prize.mesh;

      const makeHalfMat = () =>
        new THREE.MeshPhysicalMaterial({
          color: prize.color,
          roughness: 0.1,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          side: THREE.DoubleSide,
          transparent: true,
        });

      prize.top = new THREE.Mesh(halfGeo.top, makeHalfMat());
      prize.bottom = new THREE.Mesh(halfGeo.bottom, makeHalfMat());
      prize.top.position.copy(prize.flightTo);
      prize.bottom.position.copy(prize.flightTo);
      scene.add(prize.top, prize.bottom);

      const msg = PRIZE_MESSAGES[messageIndex % PRIZE_MESSAGES.length];
      messageIndex++;
      prize.label = createMessageSprite(msg);
      prize.label.position.copy(prize.flightTo);
      prize.label.scale.set(0, 0, 1);
      scene.add(prize.label);

      prize.breakStart = now;
      prize.phase = "breaking";
    }

    function cleanupPrize(prize) {
      if (prize.mesh) {
        scene.remove(prize.mesh);
        prize.mesh.material.dispose();
      }
      if (prize.top) {
        scene.remove(prize.top, prize.bottom, prize.label);
        prize.top.material.dispose();
        prize.bottom.material.dispose();
        prize.label.material.map.dispose();
        prize.label.material.dispose();
      }
    }

    function spawnPrize() {
      const color = gumballColors[Math.floor(Math.random() * gumballColors.length)];
      const mesh = new THREE.Mesh(
        sphereGeo,
        new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.1,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
        })
      );
      mesh.position.set((Math.random() - 0.5) * 2, -2, (Math.random() - 0.5) * 0.5);
      scene.add(mesh);
      startFlight(mesh, color, performance.now());
    }

    function animate() {
      const now = performance.now();
      for (let i = prizes.length - 1; i >= 0; i--) {
        const prize = prizes[i];
        if (prize.phase === "flying") {
          const t = Math.min(1, (now - prize.flightStart) / 700);
          const eased = 1 - Math.pow(1 - t, 3);
          prize.mesh.position.lerpVectors(prize.flightFrom, prize.flightTo, eased);
          prize.mesh.rotation.y += 0.25;
          prize.mesh.rotation.x += 0.15;
          prize.mesh.scale.setScalar(1 + eased * 0.6);
          if (t >= 1) startBreak(prize, now);
        } else if (prize.phase === "breaking") {
          const t = Math.min(1, (now - prize.breakStart) / 500);
          const eased = 1 - Math.pow(1 - t, 3);
          prize.top.position.y = prize.flightTo.y + eased * 0.4;
          prize.top.rotation.z = -eased * 0.5;
          prize.bottom.position.y = prize.flightTo.y - eased * 0.4;
          prize.bottom.rotation.z = eased * 0.5;
          const labelT = Math.max(0, (t - 0.3) / 0.7);
          const labelEase = labelT * labelT * (3 - 2 * labelT);
          prize.label.scale.set(1.6 * labelEase, 0.8 * labelEase, 1);
          if (t >= 1) {
            prize.phase = "holding";
            prize.holdStart = now;
          }
        } else if (prize.phase === "holding") {
          if (now - prize.holdStart > 2500) {
            prize.phase = "fading";
            prize.fadeStart = now;
          }
        } else if (prize.phase === "fading") {
          const t = Math.min(1, (now - prize.fadeStart) / 500);
          const opacity = 1 - t;
          prize.top.material.opacity = opacity;
          prize.bottom.material.opacity = opacity;
          prize.label.material.opacity = opacity;
          prize.top.position.y = prize.flightTo.y + 0.4 + t * 0.3;
          prize.bottom.position.y = prize.flightTo.y - 0.4 - t * 0.3;
          if (t >= 1) {
            cleanupPrize(prize);
            prizes.splice(i, 1);
          }
        }
      }
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(mount);

    mount.addEventListener("click", spawnPrize);

    return () => {
      mount.removeEventListener("click", spawnPrize);
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      prizes.forEach(cleanupPrize);
      halfGeo.top.dispose();
      halfGeo.bottom.dispose();
      sphereGeo.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "300px", height: "300px", cursor: "pointer" }}
    />
  );
}

export default About3D;
