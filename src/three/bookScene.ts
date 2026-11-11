import * as THREE from "three";

export interface BookSpec {
  id: string;
  label: string;
  caption: string;
  base: string;
  accent: string;
  ink?: string;
}

export interface BookSceneHandle {
  setOpen: (id: string | null) => void;
  dispose: () => void;
}

interface BookEntry {
  spec: BookSpec;
  group: THREE.Group;
  coverPivot: THREE.Group;
  hover: number;
  open: number;
  targetOpen: number;
  phase: number;
}

const BOOK_W = 1.05;
const BOOK_H = 1.45;
const BOOK_D = 0.26;
const COVER_T = 0.035;
const SPACING = 1.42;
const BOOKS_PER_ROW = 4;
const ROW_Z = [-0.95, 0.55];
const ROW_Y = [0.85, -0.85];

const PAPER = "#EFE7D8";

function drawCover(book: BookSpec): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  ctx.fillStyle = book.base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = book.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  ctx.fillStyle = book.accent;
  ctx.font = "600 34px Unbounded, sans-serif";
  ctx.textAlign = "center";
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "10px";
  }
  ctx.fillText("KADAM", canvas.width / 2, 118);

  ctx.fillStyle = book.ink ?? "#F6F1E7";
  ctx.font = `800 ${book.label.length > 2 ? 190 : 250}px Unbounded, sans-serif`;
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  }
  ctx.fillText(book.label, canvas.width / 2, 420);

  ctx.fillStyle = book.accent;
  ctx.fillRect(96, 480, canvas.width - 192, 5);

  ctx.font = "600 30px Manrope, sans-serif";
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "6px";
  }
  ctx.fillText(book.caption, canvas.width / 2, 552);

  return canvas;
}

function createBook(spec: BookSpec, textures: THREE.Texture[]): BookEntry {
  const group = new THREE.Group();

  const pageMaterial = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.95 });
  const coverMaterials = [
    new THREE.MeshStandardMaterial({ color: spec.base, roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: spec.base, roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: spec.base, roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: spec.base, roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: spec.base, roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: spec.base, roughness: 0.55 }),
  ];

  const coverTexture = new THREE.CanvasTexture(drawCover(spec));
  coverTexture.colorSpace = THREE.SRGBColorSpace;
  coverTexture.anisotropy = 8;
  textures.push(coverTexture);
  const frontMaterial = new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.5 });

  const pages = new THREE.Mesh(new THREE.BoxGeometry(BOOK_W * 0.93, BOOK_H * 0.955, BOOK_D * 0.88), pageMaterial);
  pages.position.x = 0.025;

  const backCover = new THREE.Mesh(
    new THREE.BoxGeometry(BOOK_W, BOOK_H, COVER_T),
    coverMaterials[1],
  );
  backCover.position.z = -(BOOK_D / 2 + COVER_T / 2);

  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(COVER_T * 1.5, BOOK_H, BOOK_D + COVER_T * 2),
    coverMaterials[0],
  );
  spine.position.x = -BOOK_W / 2 - COVER_T * 0.25;

  const coverPivot = new THREE.Group();
  coverPivot.position.set(-BOOK_W / 2, 0, BOOK_D / 2 + COVER_T / 2);
  const frontCover = new THREE.Mesh(new THREE.BoxGeometry(BOOK_W, BOOK_H, COVER_T), [
    ...coverMaterials.slice(2, 4),
    coverMaterials[4],
    coverMaterials[5],
    frontMaterial,
    coverMaterials[3],
  ]);
  frontCover.position.x = BOOK_W / 2;
  coverPivot.add(frontCover);

  group.add(pages, backCover, spine, coverPivot);
  group.traverse((node) => {
    if (node instanceof THREE.Mesh) node.castShadow = true;
  });

  return {
    spec,
    group,
    coverPivot,
    hover: 0,
    open: 0,
    targetOpen: 0,
    phase: Math.random() * Math.PI * 2,
  };
}

function fitCamera(camera: THREE.PerspectiveCamera, spanWidth: number, spanHeight: number) {
  const aspect = camera.aspect;
  const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
  const distanceForWidth = (spanWidth / 2) / (Math.tan(halfFov) * aspect);
  const distanceForHeight = (spanHeight / 2) / Math.tan(halfFov);
  camera.position.set(0, 0.45, Math.max(distanceForWidth, distanceForHeight) * 1.02);
  camera.lookAt(0, 0, 0);
}

export function createBookScene(
  container: HTMLElement,
  books: BookSpec[],
  onSelect: (id: string) => void,
): BookSceneHandle {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight("#DCE6F2", "#0A1B2D", 1.1);
  const key = new THREE.DirectionalLight("#FFF4E0", 2.4);
  key.position.set(5, 8, 7);
  key.castShadow = true;
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  const fill = new THREE.DirectionalLight("#7FB0E0", 0.7);
  fill.position.set(-6, 3, 4);
  scene.add(ambient, key, fill);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.ShadowMaterial({ opacity: 0.22 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.85;
  ground.receiveShadow = true;
  scene.add(ground);

  const textures: THREE.Texture[] = [];
  const entries = books.map((spec, index) => {
    const entry = createBook(spec, textures);
    const column = index % BOOKS_PER_ROW;
    const row = Math.floor(index / BOOKS_PER_ROW);
    const x = (column - (BOOKS_PER_ROW - 1) / 2) * SPACING + (row === 1 ? 0.22 : 0);
    entry.group.position.set(x, ROW_Y[row], ROW_Z[row]);
    entry.group.rotation.y = ((BOOKS_PER_ROW - 1) / 2 - column) * 0.1;
    entry.group.userData.baseY = entry.group.position.y;
    entry.group.userData.baseZ = entry.group.position.z;
    scene.add(entry.group);
    return entry;
  });

  const redrawCovers = () => {
    entries.forEach((entry) => {
      const mesh = entry.coverPivot.children[0] as THREE.Mesh;
      const materials = mesh.material as THREE.MeshStandardMaterial[];
      const material = materials[4];
      if (!material.map) return;
      material.map.image = drawCover(entry.spec);
      material.map.needsUpdate = true;
    });
  };
  if (document.fonts?.status !== "loaded") {
    document.fonts?.ready.then(redrawCovers);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered: BookEntry | null = null;
  let pointerDown: { x: number; y: number } | null = null;

  const updatePointer = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const pick = () => {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(entries.map((entry) => entry.group), true);
    if (hits.length === 0) return null;
    let node: THREE.Object3D | null = hits[0].object;
    while (node && node.userData.baseY === undefined) node = node.parent;
    return entries.find((entry) => entry.group === node) ?? null;
  };

  const onPointerMove = (event: PointerEvent) => {
    updatePointer(event);
    hovered = reducedMotion ? hovered : pick();
    renderer.domElement.style.cursor = hovered ? "pointer" : "default";
  };

  const onPointerDown = (event: PointerEvent) => {
    pointerDown = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!pointerDown) return;
    const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    pointerDown = null;
    if (moved > 6) return;
    updatePointer(event);
    const hit = pick();
    if (hit) onSelect(hit.spec.id);
  };

  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointerleave", () => {
    hovered = null;
  });

  const resize = () => {
    const { clientWidth, clientHeight } = container;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    fitCamera(
      camera,
      (BOOKS_PER_ROW - 1) * SPACING + BOOK_W + 0.9,
      ROW_Y[0] - ROW_Y[1] + BOOK_H + 0.5,
    );
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(container);

  const timer = new THREE.Timer();
  let frame = 0;

  const tick = () => {
    frame = requestAnimationFrame(tick);
    timer.update();
    const elapsed = timer.getElapsed();

    entries.forEach((entry) => {
      const baseY = entry.group.userData.baseY as number;
      const baseZ = entry.group.userData.baseZ as number;
      const hoverTarget = entry === hovered ? 0.16 : 0;
      entry.hover += (hoverTarget - entry.hover) * 0.12;
      const drift = reducedMotion ? 0 : Math.sin(elapsed * 0.9 + entry.phase) * 0.035;
      entry.group.position.y = baseY + entry.hover + drift;

      entry.open += (entry.targetOpen - entry.open) * 0.1;
      entry.group.position.z = baseZ + entry.open * 0.55;
      entry.coverPivot.rotation.y = -entry.open * 1.9;
    });

    if (!reducedMotion) {
      camera.position.x += (pointer.x * 0.55 - camera.position.x) * 0.04;
      camera.position.y += (0.45 + pointer.y * 0.25 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  };
  tick();

  return {
    setOpen(id) {
      entries.forEach((entry) => {
        entry.targetOpen = entry.spec.id === id ? 1 : 0;
      });
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      entries.forEach((entry) => entry.group.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          materials.forEach((material) => material.dispose());
        }
      }));
      textures.forEach((texture) => texture.dispose());
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
