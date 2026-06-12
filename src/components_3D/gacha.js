import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Evaluator, Brush, SUBTRACTION, ADDITION } from "three-bvh-csg";
import * as CANNON from "cannon-es";

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
    const evaluator = new Evaluator();
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-1, 2, 4);
    scene.add(light);
    const controls = new OrbitControls(camera, renderer.domElement);
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    window.addEventListener("pointermove", (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });
    // controls.update() must be called after any manual changes to the camera's transform
    camera.position.set(0, 0, 3.78);
    controls.target.set(0, -0.625, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;
    controls.enableZoom = false;
    controls.cursorStyle = "grab";
    controls.maxPolarAngle = Math.PI / 2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const base_x = 1.85,
      base_y = 2.6,
      base_z = 1.75;

    const geometry = new THREE.BoxGeometry(base_x, base_y, base_z);
    const material = new THREE.MeshPhongMaterial({
      color: 0x89a894,
      side: THREE.DoubleSide,
    });
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
    const w = 1.6,
      h = 1.35,
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

    const extrudeSettings = { depth: base_x + 0.1, bevelEnabled: false };
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

    const bubble_position_x = -(base_x + 0.1) / 2,
      bubble_position_y = 2,
      bubble_position_z = 0.3;

    const cutter = new Brush(bubbleGeometry);
    cutter.rotation.x = Math.PI / 2;
    cutter.rotation.y = Math.PI / 2;
    cutter.rotation.z = Math.PI / 2;
    cutter.position.x = bubble_position_x;
    cutter.position.y = bubble_position_y;
    cutter.position.z = bubble_position_z;

    const geometry_crank = new THREE.CylinderGeometry(
      0.25,
      0.25,
      0.1,
      25,
      5,
      false,
      0,
      Math.PI * 2,
    );

    const crank_material = new THREE.MeshPhongMaterial({
      color: 0x463239,
      side: THREE.DoubleSide,
    });
    const crank_base = new Brush(geometry_crank, crank_material);
    crank_base.rotation.x = Math.PI / 2;
    crank_base.position.z = base_z / 2 + 0.025;
    crank_base.position.y = -2;

    const geometry_crank_handle = new THREE.BoxGeometry(0.5, 0.075, 0.1);
    const crank_handle = new Brush(geometry_crank_handle, crank_material);

    crank_handle.position.y = crank_base.position.y;
    crank_handle.position.z = crank_base.position.z + 0.1;

    const hole_geo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 25);
    const hole = new Brush(hole_geo, crank_material);
    hole.rotation.x = Math.PI / 2;
    hole.position.z = crank_base.position.z;
    hole.position.y = crank_base.position.y;

    base_of_base.updateMatrixWorld();
    base.updateMatrixWorld();
    roof.updateMatrixWorld();
    cutter.updateMatrixWorld();
    crank_base.updateMatrixWorld();
    crank_handle.updateMatrixWorld();
    hole.updateMatrixWorld();

    const coinOutlineGeo = new THREE.BoxGeometry(0.2, 0.45, 0.85);
    const outlineMateral = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      specular: 0xffffff,
      shininess: 200,
    });
    const coinOutline = new Brush(coinOutlineGeo, outlineMateral);
    const coinSlotGeo = new THREE.BoxGeometry(0.075, 0.3, 2);
    const coinCut = new Brush(coinSlotGeo, material);

    const coin_x = 0.5;
    const coin_y = 1;
    const coin_z = 0.5;

    coinOutline.position.x = coin_x;
    coinOutline.position.y = coin_y;
    coinOutline.position.z = coin_z;
    coinCut.position.x = coin_x;
    coinCut.position.y = coin_y;
    coinCut.position.z = coin_z;
    coinCut.updateMatrixWorld();
    coinOutline.updateMatrixWorld();

    const outputGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.5, 20);
    const outputHole = new Brush(outputGeo, material);
    outputHole.position.y = 0.6;
    outputHole.position.z = 0.6;
    outputHole.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI * -0.4);

    outputHole.updateMatrixWorld();

    const top = evaluator.evaluate(base, roof, ADDITION);
    const body = evaluator.evaluate(base_of_base, top, ADDITION);
    const withCoin = evaluator.evaluate(body, coinOutline, ADDITION);
    const withCut = evaluator.evaluate(withCoin, coinCut, SUBTRACTION);
    const withOutput = evaluator.evaluate(withCut, outputHole, SUBTRACTION);
    const result = evaluator.evaluate(withOutput, cutter, SUBTRACTION);
    result.position.y = -2;

    const crank = evaluator.evaluate(crank_base, crank_handle, ADDITION);
    const crankMesh = evaluator.evaluate(crank, hole, SUBTRACTION);
    crankMesh.position.y = -1;
    crankMesh.position.x = -0.4;
    scene.add(crankMesh);
    scene.add(result);

    const glassMesh = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.rotation.y = Math.PI / 2;
    glassMesh.rotation.z = Math.PI / 2;
    glassMesh.position.x = bubble_position_x;
    glassMesh.position.y = bubble_position_y - 2.0;
    glassMesh.position.z = bubble_position_z;
    scene.add(glassMesh);

    const gumballColors = [
      0xff6b6b, 0xffa94d, 0xffd43b, 0x69db7c, 0x74c0fc, 0xda77f2, 0xf783ac,
      0x63e6be, 0xa9e34b, 0x4dabf7, 0xb197fc, 0xff8787, 0xff6eb4, 0x40e0d0,
      0xffd700, 0x98fb98, 0xdda0dd, 0xff7f50,
      0xff4757, 0xff6348, 0xffa502, 0x2ed573, 0x1e90ff, 0x5352ed,
      0xff6b81, 0x7bed9f, 0x70a1ff, 0xeccc68, 0xa29bfe, 0xff9ff3,
      0x54a0ff, 0x5f27cd, 0x00d2d3, 0xff9f43, 0xee5a24, 0x0abde3,
    ];

    // Physics world — gravity along -Y
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

    const sphereMat = new CANNON.Material("sphere");
    const wallMat = new CANNON.Material("wall");

    const container = new CANNON.Body({ mass: 0, material: wallMat });
    container.addShape(
      new CANNON.Box(new CANNON.Vec3(0.975, 0.05, 0.8)),
      new CANNON.Vec3(0, -0.675, 0.3),
    ); // floor
    container.addShape(
      new CANNON.Box(new CANNON.Vec3(0.975, 0.05, 0.8)),
      new CANNON.Vec3(0, 0.7, 0.3),
    ); // ceiling
    container.addShape(
      new CANNON.Box(new CANNON.Vec3(0.05, 0.7, 0.8)),
      new CANNON.Vec3(-0.975, 0.0, 0.3),
    ); // left
    container.addShape(
      new CANNON.Box(new CANNON.Vec3(0.05, 0.7, 0.8)),
      new CANNON.Vec3(0.975, 0.0, 0.3),
    ); // right
    container.addShape(
      new CANNON.Box(new CANNON.Vec3(0.975, 0.7, 0.05)),
      new CANNON.Vec3(0, 0.0, -0.5),
    ); // back
    container.addShape(
      new CANNON.Box(new CANNON.Vec3(0.975, 0.7, 0.05)),
      new CANNON.Vec3(0, 0.0, 1.1),
    ); // front
    world.addBody(container);

    // Physics walls for the output tube — body sits at tube center, rotated to match the visual
    // Local frame: Y = tube axis, -Z = gravity-side floor of the tube
    const tubeBody = new CANNON.Body({ mass: 0, material: wallMat });
    const tubeQ = new CANNON.Quaternion();
    tubeQ.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI * -0.4);
    tubeBody.quaternion.copy(tubeQ);
    tubeBody.position.set(0, -1.4, 0.6);
    tubeBody.addShape(
      new CANNON.Box(new CANNON.Vec3(0.3, 0.8, 0.025)),
      new CANNON.Vec3(0, 0, -0.325),
    ); // floor
    tubeBody.addShape(
      new CANNON.Box(new CANNON.Vec3(0.025, 0.8, 0.3)),
      new CANNON.Vec3(-0.3, 0, -0.15),
    ); // left wall
    tubeBody.addShape(
      new CANNON.Box(new CANNON.Vec3(0.025, 0.8, 0.3)),
      new CANNON.Vec3(0.3, 0, -0.15),
    ); // right wall
    world.addBody(tubeBody);

    const sphereGeo = new THREE.SphereGeometry(0.24, 40, 40);
    const sphereBodies = [];
    const sphereMeshes = [];

    const sphereSphereContact = new CANNON.ContactMaterial(
      sphereMat,
      sphereMat,
      {
        friction: 0.1,
        restitution: 0.4,
      },
    );
    const sphereWallContact = new CANNON.ContactMaterial(sphereMat, wallMat, {
      friction: 0.6,
      restitution: 0.2,
    });

    world.addContactMaterial(sphereSphereContact);
    world.addContactMaterial(sphereWallContact);

    gumballColors.forEach((color, i) => {
      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Sphere(0.2),
        material: sphereMat,
        linearDamping: 0.3,
        angularDamping: 0.3,
      });
      const col = i % 3;
      const row = Math.floor((i % 9) / 3);
      const layer = Math.floor(i / 9);
      body.position.set(
        [
          -0.5 + Math.random() * 0.03,
          0 + Math.random() * 0.03,
          0.5 + Math.random() * 0.03,
        ][col],
        [
          -0.35 + Math.random() * 0.03,
          0.1 + Math.random() * 0.03,
          0.4 + Math.random() * 0.03,
        ][row],
        [
          -0.25 + Math.random() * 0.03,
          0.15 + Math.random() * 0.03,
          0.5 + Math.random() * 0.03,
          0.8 + Math.random() * 0.03,
        ][layer],
      );
      world.addBody(body);
      sphereBodies.push(body);

      const mat = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.1,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      });
      const sphere = new THREE.Mesh(sphereGeo, mat);
      scene.add(sphere);
      sphereMeshes.push(sphere);
    });
    let crankRotation = 0;
    const GRAVITY = 9.82;
    const gravityDown = new THREE.Vector3();

    function animate() {
      // Gravity always points toward the bottom of the screen, so the
      // gumballs tumble like a snow globe as the camera orbits.
      gravityDown.set(0, -1, 0).applyQuaternion(camera.quaternion);
      world.gravity.set(
        gravityDown.x * GRAVITY,
        gravityDown.y * GRAVITY,
        gravityDown.z * GRAVITY,
      );

      world.fixedStep();
      sphereBodies.forEach((body, i) => {
        sphereMeshes[i].position.copy(body.position);
        sphereMeshes[i].quaternion.copy(body.quaternion);
      });

      if (crankRotation > 0) {
        const step = Math.min(0.25, crankRotation);
        crankMesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), step);
        crankRotation -= step;
      }

      controls.update();
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    function spinCrank() {
      crankRotation += Math.PI * 2;
    }

    function spawnBall(x, y, z, color) {
      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Sphere(0.2),
        material: sphereMat,
      });
      body.position.set(x, y, z);
      world.addBody(body);
      const mesh = new THREE.Mesh(
        sphereGeo,
        new THREE.MeshPhysicalMaterial({ color }),
      );
      scene.add(mesh);
      sphereBodies.push(body);
      sphereMeshes.push(mesh);
    }

    function onClick() {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects([crankMesh], true);
      if (hits.length > 0) {
        spinCrank();
        setTimeout(() => {
          spawnBall(
            0,
            -1.5,
            0.57,
            gumballColors[Math.floor(Math.random() * gumballColors.length)],
          );
        }, 500);
      }
    }
    renderer.domElement.addEventListener("click", onClick);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    return () => {
      renderer.domElement.removeEventListener("click", onClick);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="" style={{ width: "600px", height: "600px" }} />;
}

export default Gotcha;
