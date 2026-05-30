import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Evaluator, Brush, SUBTRACTION, ADDITION } from "three-bvh-csg";

function Gotcha() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.update() must be called after any manual changes to the camera's transform
    camera.position.set(0, 20, 100);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 5;
    controls.cursorStyle = "grab";
    controls.maxPolarAngle = Math.PI / 2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const base_x = 2,
      base_y = 2.75,
      base_z = 1.75;

    const geometry = new THREE.BoxGeometry(base_x, base_y, base_z);
    const material = new THREE.MeshPhongMaterial({ color: 0xb4ceb3 });
    const base = new Brush(geometry, material);

    const geometry_base = new THREE.BoxGeometry(
      base_x + 0.25,
      0.25,
      base_z + 0.25,
    );
    const base_material = new THREE.MeshPhongMaterial({ color: 0x0e4749 });
    const base_of_base = new Brush(geometry_base, base_material);

    const geometry_roof = new THREE.BoxGeometry(
      base_x + 0.25,
      0.25,
      base_z + 0.25,
    );

    const roof = new Brush(geometry_roof, base_material);

    base.position.y = base_y / 2 + 0.25 / 2;
    roof.position.y = base.position.y + base_y / 2 + 0.25 / 2;

    const shape = new THREE.Shape();
    const w = 1,
      h = 1.25,
      r = 0.2; // width, height, corner radius

    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

    const extrudeSettings = { depth: 2, bevelEnabled: false };
    const bubbleGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
      transmission: 0.95,
      roughness: 0,
      metalness: 0,
      ior: 1.5,
      thickness: 1.0,
      transparent: true,
      color: 0xc9e8f0,
    });

    const bubble_position_x = -1,
      bubble_position_y = 2,
      bubble_position_z = 0.5;

    const cutter = new Brush(bubbleGeometry);
    cutter.rotation.x = Math.PI / 2;
    cutter.rotation.y = Math.PI / 2;
    cutter.rotation.z = Math.PI / 2;
    cutter.position.x = bubble_position_x;
    cutter.position.y = bubble_position_y;
    cutter.position.z = bubble_position_z;

    base_of_base.updateMatrixWorld();
    base.updateMatrixWorld();
    roof.updateMatrixWorld();
    cutter.updateMatrixWorld();

    const evaluator = new Evaluator();
    const top = evaluator.evaluate(base, roof, ADDITION);
    const body = evaluator.evaluate(base_of_base, top, ADDITION);
    const result = evaluator.evaluate(body, cutter, SUBTRACTION);
    scene.add(result);

    const glassMesh = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.rotation.y = Math.PI / 2;
    glassMesh.rotation.z = Math.PI / 2;
    glassMesh.position.x = bubble_position_x;
    glassMesh.position.y = bubble_position_y;
    glassMesh.position.z = bubble_position_z;

    scene.add(glassMesh);

    const gumballColors = [
      0xff6b6b, 0xffa94d, 0xffd43b, 0x69db7c, 0x74c0fc, 0xda77f2, 0xf783ac,
      0x63e6be, 0xa9e34b, 0x4dabf7, 0xb197fc, 0xff8787,
    ];

    const sphereGeo = new THREE.SphereGeometry(0.24, 40, 40);
    const positions = [
      [-0.75, 1.63, 0.25], [-0.25, 1.63, 0.75], [0.25, 1.63, 0.25], [0.75, 1.63, 0.75],
      [-0.75, 2.0,  0.75], [-0.25, 2.0,  0.25], [0.25, 2.0,  0.75], [0.75, 2.0,  0.25],
      [-0.75, 2.37, 0.25], [-0.25, 2.37, 0.75], [0.25, 2.37, 0.25], [0.75, 2.37, 0.75],
    ];

    positions.forEach(([x, y, z], i) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: gumballColors[i],
        transmission: 0.5,
        roughness: 0.1,
        metalness: 0,
        ior: 1.4,
        thickness: 0.3,
        transparent: true,
      });
      const sphere = new THREE.Mesh(sphereGeo, mat);
      sphere.position.set(x, y, z);
      scene.add(sphere);
    });

    function animate(time) {
      controls.update();
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    return () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
}

export default Gotcha;
