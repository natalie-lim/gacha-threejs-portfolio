import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Evaluator, Brush, SUBTRACTION, ADDITION } from "three-bvh-csg";
import * as CANNON from "cannon-es";

const PRIZE_MESSAGES = [
  "you got a lucky charm!",
  "have an amazing day :)",
  "thanks for stopping by!",
  "good things are coming your way",
  "you found a hidden message!",
  "keep being awesome!",
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
  wrapText(
    ctx,
    text,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width - 80,
    48,
  );

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true }),
  );
  sprite.scale.set(1.6, 0.8, 1);
  return sprite;
}

function Gotcha() {
  const mountRef = useRef(null);
  const [isFullSize, setIsFullSize] = useState(false);
  const isFullSizeRef = useRef(false);

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

    // 360° lighting rig — ring of directional lights plus top/bottom lights
    // so the gacha machine stays evenly lit as the camera orbits around it.
    const lightRadius = 6;
    const lightHeight = 3;
    const ringLightCount = 4;
    for (let i = 0; i < ringLightCount; i++) {
      const angle = (i / ringLightCount) * Math.PI * 2;
      const ringLight = new THREE.DirectionalLight(0xffffff, 1.2);
      ringLight.position.set(
        Math.cos(angle) * lightRadius,
        lightHeight,
        Math.sin(angle) * lightRadius,
      );
      scene.add(ringLight);
    }
    const topLight = new THREE.DirectionalLight(0xffffff, 1);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.6);
    bottomLight.position.set(0, -10, 0);
    scene.add(bottomLight);
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

    const btnCanvas = document.createElement("canvas");
    btnCanvas.width = 512;
    btnCanvas.height = 128;
    const btnCtx = btnCanvas.getContext("2d");
    btnCtx.fillStyle = "#0e4749";
    drawRoundedRect(btnCtx, 4, 4, 504, 120, 16);
    btnCtx.fill();
    btnCtx.strokeStyle = "#fffdf2";
    btnCtx.lineWidth = 4;
    btnCtx.stroke();
    btnCtx.fillStyle = "#fffdf2";
    btnCtx.font = "bold 42px sans-serif";
    btnCtx.textAlign = "center";
    btnCtx.textBaseline = "middle";
    btnCtx.fillText("full size", 256, 64);
    const btnTex = new THREE.CanvasTexture(btnCanvas);
    const btnMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.18, 0.04),
      new THREE.MeshPhongMaterial({ map: btnTex }),
    );
    btnMesh.position.set(0, 0.85, 1);
    scene.add(btnMesh);

    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(mount);

    const gumballColors = [
      0xff6b6b, 0xffa94d, 0xffd43b, 0x69db7c, 0x74c0fc, 0xda77f2, 0x63e6be,
      0xa9e34b, 0x4dabf7, 0xb197fc, 0xff8787, 0xff6eb4, 0xffd700, 0x98fb98,
      0xdda0dd, 0xff7f50, 0xff4757, 0xff6348, 0xffa502, 0x2ed573, 0x1e90ff,
      0x5352ed, 0xff6b81, 0x7bed9f, 0x70a1ff, 0xeccc68, 0xa29bfe, 0xff9ff3,
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

    const halfGeo = {
      top: new THREE.SphereGeometry(
        0.24,
        32,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2,
      ),
      bottom: new THREE.SphereGeometry(
        0.24,
        32,
        16,
        0,
        Math.PI * 2,
        Math.PI / 2,
        Math.PI / 2,
      ),
    };
    const prizes = [];

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

      const now = performance.now();
      for (let i = prizes.length - 1; i >= 0; i--) {
        const prize = prizes[i];
        if (prize.phase === "rolling") {
          const distFromTube = prize.body.position.distanceTo(
            tubeBody.position,
          );
          if (distFromTube > 0.85 || now - prize.phaseStart > 5000) {
            startFlight(prize, now);
          }
        } else if (prize.phase === "flying") {
          const t = Math.min(1, (now - prize.flightStart) / 700);
          const eased = 1 - Math.pow(1 - t, 3);
          prize.mesh.position.lerpVectors(
            prize.flightFrom,
            prize.flightTo,
            eased,
          );
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
      prizes.push({
        body,
        mesh,
        color,
        phase: "rolling",
        phaseStart: performance.now(),
      });
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

    // Lift the ball out of the physics simulation and tween it toward the
    // center of the screen (OrbitControls always looks at controls.target,
    // so a point along the camera's forward direction is screen-centered).
    function startFlight(prize, now) {
      world.removeBody(prize.body);
      const i = sphereBodies.indexOf(prize.body);
      if (i !== -1) {
        sphereBodies.splice(i, 1);
        sphereMeshes.splice(i, 1);
      }
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      prize.flightFrom = prize.mesh.position.clone();
      prize.flightTo = camera.position.clone().addScaledVector(forward, 2);
      prize.flightStart = now;
      prize.phase = "flying";
    }

    function startBreak(prize, now) {
      scene.remove(prize.mesh);
      prize.mesh.material.dispose();
      delete prize.mesh;

      const makeHalfMaterial = () =>
        new THREE.MeshPhysicalMaterial({
          color: prize.color,
          roughness: 0.1,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          side: THREE.DoubleSide,
          transparent: true,
        });

      prize.top = new THREE.Mesh(halfGeo.top, makeHalfMaterial());
      prize.bottom = new THREE.Mesh(halfGeo.bottom, makeHalfMaterial());
      prize.top.position.copy(prize.flightTo);
      prize.bottom.position.copy(prize.flightTo);
      scene.add(prize.top, prize.bottom);

      prize.label = createMessageSprite(
        PRIZE_MESSAGES[Math.floor(Math.random() * PRIZE_MESSAGES.length)],
      );
      prize.label.position.copy(prize.flightTo);
      prize.label.scale.set(0, 0, 1);
      scene.add(prize.label);

      prize.breakStart = now;
      prize.phase = "breaking";
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
      const btnHits = raycaster.intersectObjects([btnMesh], true);
      if (btnHits.length > 0) {
        const next = !isFullSizeRef.current;
        isFullSizeRef.current = next;
        setIsFullSize(next);
      }
    }
    renderer.domElement.addEventListener("click", onClick);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    return () => {
      renderer.domElement.removeEventListener("click", onClick);
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      prizes.forEach(cleanupPrize);
      halfGeo.top.dispose();
      halfGeo.bottom.dispose();
      btnTex.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={
        isFullSize
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 999,
            }
          : { width: "600px", height: "600px" }
      }
    />
  );
}

export default Gotcha;
