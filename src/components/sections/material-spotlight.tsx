"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
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
  roughnessFactor = mix(0.95, 0.45, mask);
  diffuseColor.rgb *= mix(1.0, 0.5, mask);
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
      return; // No WebGL: the section keeps its stone background + overlay text.
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

    const config = { radius: 0.15, softness: 0.35, lerp: 0.05 };
    const shaders: THREE.WebGLProgramParametersWithUniforms[] = [];
    const uHit = new THREE.Vector3(0, 100, 0);
    const target = new THREE.Vector3(0, 100, 0);
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const planeHit = new THREE.Vector3();
    let uActive = 0;
    let active = false;
    let model: THREE.Group | null = null;
    let disposed = false;
    let raf = 0;
    let running = false;

    new GLTFLoader().load(
      "/model.glb",
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        model.position.sub(box.getCenter(new THREE.Vector3()));

        const size = box.getSize(new THREE.Vector3());
        const dist =
          Math.max(size.x, size.y, size.z) /
          (2 * Math.tan(((camera.fov * Math.PI) / 180) / 2));
        camera.position.set(0, 0, dist * 1.75);
        camera.lookAt(0, 0, 0);

        model.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.roughness = 0.95;
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
              .replace("#include <common>", `#include <common>\n${fragmentPars}`)
              .replace(
                "#include <roughnessmap_fragment>",
                `#include <roughnessmap_fragment>\n${fragmentMain}`,
              );

            shaders.push(shader);
          };
          material.needsUpdate = true;
        });

        scene.add(model);
        renderFrame(); // paint at least once, even when motion is reduced
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
          if (reduced) {
            renderFrame();
          } else if (!running) {
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
      if (model) {
        model.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          const mat = mesh.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        });
      }
      envTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section
      aria-label="Baliraja Institute"
      className="relative isolate h-[88svh] min-h-[34rem] w-full overflow-hidden bg-parchment-deep"
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* Brand overlay — does not intercept the cursor */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
        <div className="mx-auto flex w-full max-w-[100rem] items-center justify-between px-5 pt-10 sm:px-8">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-oxblood/70">
            {site.place} · Estd. {site.established}
          </p>
          <p className="hidden text-[0.62rem] font-medium uppercase tracking-[0.22em] text-ink-soft sm:block">
            Move your cursor
          </p>
        </div>

        <div className="mx-auto w-full max-w-[100rem] px-5 pb-12 sm:px-8 sm:pb-16">
          <h2 className="max-w-[16ch] font-display text-[clamp(2.4rem,7vw,6.5rem)] font-light leading-[0.95] tracking-[-0.025em] text-oxblood">
            {site.motto}.
          </h2>
        </div>
      </div>
    </section>
  );
}
