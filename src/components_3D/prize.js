import { useEffect, useRef } from "react";
import * as THREE from "three";

const PRIZE_COLOR = 0xff6eb4;

function Prize3D({ onBurst }) {
  const mountRef = useRef(null);
  const onBurstRef = useRef(onBurst);
  onBurstRef.current = onBurst;

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);

    const sphereGeo = new THREE.SphereGeometry(0.6, 40, 40);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: PRIZE_COLOR,
      roughness: 0.1,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    const halfGeo = {
      top: new THREE.SphereGeometry(0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      bottom: new THREE.SphereGeometry(0.6, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    };

    let phase = "shaking";
    let burstStart = 0;
    let topHalf = null;
    let bottomHalf = null;
    const startTime = performance.now();

    function doBurst(now) {
      if (phase !== "shaking") return;
      phase = "bursting";
      burstStart = now;
      scene.remove(sphere);

      const makeHalfMat = () =>
        new THREE.MeshPhysicalMaterial({
          color: PRIZE_COLOR,
          roughness: 0.1,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          side: THREE.DoubleSide,
          transparent: true,
        });

      topHalf = new THREE.Mesh(halfGeo.top, makeHalfMat());
      bottomHalf = new THREE.Mesh(halfGeo.bottom, makeHalfMat());
      scene.add(topHalf, bottomHalf);
      onBurstRef.current();
    }

    function animate() {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      if (phase === "shaking") {
        const intensity = Math.min(elapsed / 1.5, 1);
        sphere.position.x = Math.sin(elapsed * 20) * 0.09 * intensity;
        sphere.position.y = Math.sin(elapsed * 25 + 1) * 0.07 * intensity;
        sphere.rotation.z = Math.sin(elapsed * 16) * 0.18 * intensity;
        sphere.rotation.x = Math.sin(elapsed * 13 + 0.5) * 0.1 * intensity;
      } else if (phase === "bursting") {
        const t = Math.min(1, (now - burstStart) / 700);
        const eased = 1 - Math.pow(1 - t, 3);
        topHalf.position.y = eased * 1.5;
        topHalf.rotation.z = -eased * 0.9;
        bottomHalf.position.y = -eased * 1.5;
        bottomHalf.rotation.z = eased * 0.9;
        topHalf.material.opacity = 1 - t;
        bottomHalf.material.opacity = 1 - t;
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

    function onClick() {
      doBurst(performance.now());
    }
    mount.addEventListener("click", onClick);

    const autoBurst = setTimeout(() => doBurst(performance.now()), 2500);

    return () => {
      clearTimeout(autoBurst);
      mount.removeEventListener("click", onClick);
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      sphereGeo.dispose();
      halfGeo.top.dispose();
      halfGeo.bottom.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 100,
        cursor: "pointer",
      }}
    />
  );
}

export default Prize3D;
