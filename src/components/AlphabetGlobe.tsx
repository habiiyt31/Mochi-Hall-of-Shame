"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface LetterUD {
  basePos: THREE.Vector3;
  velocity: THREE.Vector3;
  bursting: boolean;
  elapsed: number;
  delay: number;
}

interface Props {
  onBurst?: () => void;
  count?: number;
  radius?: number;
}

export default function AlphabetGlobe({ onBurst, count = 300, radius = 2.2 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    // ---- texture cache ----
    const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const cache = new Map<string, THREE.CanvasTexture>();

    function makeTex(letter: string, hue: number): THREE.CanvasTexture {
      const key = `${letter}${hue}`;
      const hit = cache.get(key);
      if (hit) return hit;
      const cv = document.createElement("canvas");
      cv.width = cv.height = 64;
      const ctx = cv.getContext("2d")!;
      ctx.clearRect(0, 0, 64, 64);
      ctx.font = 'bold 48px "Press Start 2P",monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.shadowBlur = 12;
      ctx.fillStyle = `hsl(${hue},100%,70%)`;
      ctx.fillText(letter, 32, 32);
      const tex = new THREE.CanvasTexture(cv);
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      cache.set(key, tex);
      return tex;
    }

    // ---- Fibonacci sphere positions ----
    const golden = Math.PI * (3 - Math.sqrt(5));
    const positions: THREE.Vector3[] = Array.from({ length: count }, (_, i) => {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      return new THREE.Vector3(Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius);
    });

    // ---- sprites ----
    const group = new THREE.Group();
    scene.add(group);

    const sprites: THREE.Sprite[] = positions.map((base) => {
      const letter = ALPHA[Math.floor(Math.random() * 26)];
      const hue = Math.floor(Math.random() * 360);
      const mat = new THREE.SpriteMaterial({ map: makeTex(letter, hue), transparent: true, depthWrite: false });
      const s = new THREE.Sprite(mat);
      s.scale.setScalar(0.18);
      s.position.copy(base);
      s.userData = { basePos: base.clone(), velocity: new THREE.Vector3(), bursting: false, elapsed: 0, delay: Math.random() * 0.3 } as LetterUD;
      group.add(s);
      return s;
    });

    // ---- click burst ----
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let burstActive = false;

    function burst() {
      if (burstActive) return;
      burstActive = true;
      onBurst?.();
      sprites.forEach((s) => {
        const ud = s.userData as LetterUD;
        const dir = ud.basePos.clone().normalize();
        dir.z += 1.5;
        dir.normalize().multiplyScalar(0.08 + Math.random() * 0.12);
        ud.velocity.copy(dir);
        ud.bursting = true;
        ud.elapsed = 0;
      });
      setTimeout(() => { burstActive = false; }, 2500);
    }

    function onPointerDown(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      ptr.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      ray.setFromCamera(ptr, camera);
      if (ray.intersectObjects(sprites, false).length > 0) burst();
    }
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // ---- animation ----
    let raf = 0;
    let t = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      t += 0.016;
      if (!burstActive) {
        group.rotation.y += 0.003;
        group.rotation.x = Math.sin(t * 0.2) * 0.1;
      }
      sprites.forEach((s) => {
        const ud = s.userData as LetterUD;
        if (!ud.bursting) return;
        ud.elapsed += 0.016;
        if (ud.elapsed < 0.6) {
          s.position.add(ud.velocity);
          ud.velocity.multiplyScalar(0.97);
        } else if (ud.elapsed >= 0.6 + ud.delay) {
          const toBase = ud.basePos.clone().sub(s.position);
          ud.velocity.add(toBase.multiplyScalar(0.08)).multiplyScalar(0.82);
          s.position.add(ud.velocity);
          if (s.position.distanceTo(ud.basePos) < 0.01 && ud.velocity.length() < 0.005) {
            s.position.copy(ud.basePos);
            ud.velocity.set(0, 0, 0);
            ud.bursting = false;
          }
        }
      });
      renderer.render(scene, camera);
    }
    animate();

    // ---- resize ----
    function onResize() {
      if (!mount) return;
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      sprites.forEach((s) => { s.material.map?.dispose(); s.material.dispose(); });
      cache.forEach((tex) => tex.dispose());
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [onBurst, count, radius]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "pointer" }} title="Click to burst" />;
}
