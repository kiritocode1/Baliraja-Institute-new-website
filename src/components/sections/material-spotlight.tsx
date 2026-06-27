"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { site } from "@/lib/site";

// Shader injection (cursor-driven material spotlight).
const vertexPars = /* glsl */ `varying vec3 vWPos;`;
const vertexMain = /* glsl */ `vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`;
const fragmentPars = /* glsl */ `
  uniform vec3 uHitPoint;
  uniform float uActive, uRadius, uSoftness;
  varying vec3 vWPos;
`;
const fragmentMain = /* glsl */ `
  float d = distance(vWPos, uHitPoint);
  float reveal = 1.0 - smoothstep(uRadius, uRadius + uSoftness, d);
  float mask = reveal * uActive;
  roughnessFactor = mix(0.95, 0.4, mask);
  diffuseColor.rgb *= mix(1.0, 0.42, mask);
`;

export function MaterialSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // No WebGL: section keeps its stone background + overlay text.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent over the CSS stone bg
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.68;
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment()).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const config = { radius: 0.15, softness: 0.35, lerp: 0.06 };
    const shaders: THREE.WebGLProgramParametersWithUniforms[] = [];
    const uHit = new THREE.Vector3(0, 100, 0);
    const target = new THREE.Vector3(0, 100, 0);
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const planeHit = new THREE.Vector3();
    let uActive = 0;
    let active = false;
    let disposed = false;
    let raf = 0;
    let running = false;

    // Stored framing so resize can refit the camera.
    let halfW = 1;
    let halfH = 1;
    const groups: THREE.Object3D[] = [];
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();

    function fitCamera() {
      const fovRad = (camera.fov * Math.PI) / 180;
      const distH = halfH / Math.tan(fovRad / 2);
      const distW = halfW / camera.aspect / Math.tan(fovRad / 2);
      const dist = Math.max(distH, distW) * 1.18;
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
    }

    new GLTFLoader().load(
      "/model.glb",
      (gltf) => {
        if (disposed) return;
        const base = gltf.scene;

        // Center the model on its own origin.
        const box = new THREE.Box3().setFromObject(base);
        base.position.sub(box.getCenter(new THREE.Vector3()));
        const size = box.getSize(new THREE.Vector3());

        // Patch every material once with the spotlight shader (shared by both
        // copies). DoubleSide keeps the mirrored copy's flipped winding clean.
        base.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          if (mesh.geometry) geometries.add(mesh.geometry);
          const material = mesh.material as THREE.MeshStandardMaterial;
          materials.add(material);
          material.roughness = 0.95;
          material.side = THREE.DoubleSide;
          material.onBeforeCompile = (shader) => {
            shader.uniforms.uHitPoint = { value: uHit };
            shader.uniforms.uActive = { value: 0 };
            shader.uniforms.uRadius = { value: config.radius };
            shader.uniforms.uSoftness = { value: config.softness };
            shader.vertexShader = shader.vertexShader
              .replace("#include <common>", `#include <common>\n${vertexPars}`)
              .replace(
                "#include <worldpos_vertex>",
                `#include <worldpos_vertex>\n${vertexMain}`,
              );
            shader.fragmentShader = shader.fragmentShader
              .replace(
                "#include <common>",
                `#include <common>\n${fragmentPars}`,
              )
              .replace(
                "#include <roughnessmap_fragment>",
                `#include <roughnessmap_fragment>\n${fragmentMain}`,
              );
            shaders.push(shader);
          };
          material.needsUpdate = true;
        });

        // Two mirrored copies with a centre gap for the wordmark.
        const offset = size.x * 0.82;
        const left = new THREE.Group();
        left.add(base);
        left.position.x = -offset;

        const right = new THREE.Group();
        right.add(base.clone(true));
        right.position.x = offset;
        right.scale.x = -1; // mirror

        groups.push(left, right);
        scene.add(left, right);

        halfW = offset + size.x / 2;
        halfH = size.y / 2;
        fitCamera();
        renderFrame(); // paint once even when motion is reduced
      },
      undefined,
      (err) => console.error("Spotlight model failed to load:", err),
    );

    const onPointerMove = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      active = true;
    };
    const onPointerLeave = () => {
      active = false;
    };
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    function renderFrame() {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, planeHit);
      if (planeHit) target.copy(planeHit);

      uHit.lerp(target, config.lerp);
      uActive += ((active ? 1 : 0) - uActive) * config.lerp;

      for (const s of shaders) {
        (s.uniforms.uHitPoint.value as THREE.Vector3).copy(uHit);
        s.uniforms.uActive.value = uActive;
      }
      renderer.render(scene, camera);
    }

    function loop() {
      raf = requestAnimationFrame(loop);
      renderFrame();
    }

    // Only burn GPU while the coda is on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (reduced) renderFrame();
          else if (!running) {
            running = true;
            loop();
          }
        } else if (running) {
          cancelAnimationFrame(raf);
          running = false;
        }
      },
      { threshold: 0.04 },
    );
    io.observe(container);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitCamera();
      renderer.setSize(w, h);
      if (!running) renderFrame();
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      groups.forEach((g) => {
        scene.remove(g);
      });
      geometries.forEach((g) => {
        g.dispose();
      });
      materials.forEach((m) => {
        m.dispose();
      });
      envTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section
      id="baliraja"
      aria-label="Baliraja Institute"
      className="relative isolate flex h-[90svh] min-h-[36rem] w-full items-center justify-center overflow-hidden bg-parchment-deep"
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* Centre wordmark + quote underneath */}
      <div className="pointer-events-none relative z-10 flex flex-col items-center px-5 text-center">
        <h2 className="font-display text-[clamp(3.5rem,13vw,11rem)] font-light leading-[0.9] tracking-[-0.03em] text-oxblood">
          Baliraja
        </h2>
        <p className="mt-6 max-w-md font-display text-[clamp(1.05rem,2.4vw,1.6rem)] italic leading-snug text-ink/80">
          “{site.motto}.”
        </p>
        <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-ink-soft">
          Career Academy · {site.place}
        </p>
      </div>
    </section>
  );
}
