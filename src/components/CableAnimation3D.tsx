import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cableFragmentShader, cableVertexShader, createCableTube } from "@/lib/cable-scene";

export function CableAnimation3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [colors, setColors] = useState(["#087bdc", "#f5c400", "#2ca14c"]);
  const colorsRef = useRef(colors);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const pointer = useRef({ x: 0, y: 0, currentX: 0, currentY: 0 });
  const redraw = useRef<() => void>(() => undefined);
  const refreshMotion = useRef<() => void>(() => undefined);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    if (!gl) return;
    let frame = 0;
    let disposed = false;
    let visible = true;
    let previous = 0;
    let elapsed = 0;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shaders: WebGLShader[] = [];
    let program: WebGLProgram | null = null;
    let vertexBuffer: WebGLBuffer | null = null;
    let indexBuffer: WebGLBuffer | null = null;
    let observer: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let draw: () => void = () => undefined;
    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    }
    function loop(now: number) {
      frame = 0;
      if (disposed || !visible || document.hidden || motion.matches || pausedRef.current) return;
      if (!previous) previous = now;
      if (now - previous >= 1000 / 30) {
        elapsed += Math.min((now - previous) / 1000, 0.1);
        previous = now;
        draw();
      }
      frame = requestAnimationFrame(loop);
    }
    function sync() {
      stop();
      draw();
      if (!disposed && visible && !document.hidden && !motion.matches && !pausedRef.current)
        frame = requestAnimationFrame(loop);
    }
    function lost(event: Event) {
      event.preventDefault();
      stop();
      setReady(false);
    }
    try {
      function compile(type: number, source: string) {
        const shader = gl!.createShader(type);
        if (!shader) throw new Error("3D unavailable");
        shaders.push(shader);
        gl!.shaderSource(shader, source);
        gl!.compileShader(shader);
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error("3D unavailable");
        return shader;
      }
      const vertex = compile(gl.VERTEX_SHADER, cableVertexShader);
      const fragment = compile(gl.FRAGMENT_SHADER, cableFragmentShader);
      program = gl.createProgram();
      if (!program) throw new Error("3D unavailable");
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("3D unavailable");
      gl.useProgram(program);
      const geometry = createCableTube();
      vertexBuffer = gl.createBuffer();
      indexBuffer = gl.createBuffer();
      if (!vertexBuffer || !indexBuffer) throw new Error("3D unavailable");
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, geometry.samples, gl.STATIC_DRAW);
      const attribute = gl.getAttribLocation(program, "aSample");
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
      const time = gl.getUniformLocation(program, "uTime");
      const phase = gl.getUniformLocation(program, "uPhase");
      const aspect = gl.getUniformLocation(program, "uAspect");
      const perspective = gl.getUniformLocation(program, "uPointer");
      const color = gl.getUniformLocation(program, "uColor");
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
      draw = () => {
        if (disposed || gl.isContextLost()) return;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const scale = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.round(rect.width * scale);
        const height = Math.round(rect.height * scale);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform1f(aspect, width / height);
        gl.uniform1f(time, motion.matches ? 0 : elapsed);
        const view = pointer.current;
        const easing = motion.matches || pausedRef.current ? 1 : 0.14;
        view.currentX += (view.x - view.currentX) * easing;
        view.currentY += (view.y - view.currentY) * easing;
        gl.uniform2f(perspective, view.currentX, view.currentY);
        for (let cable = 0; cable < 3; cable++) {
          gl.uniform1f(phase, (cable * Math.PI * 2) / 3);
          const hex = colorsRef.current[cable] ?? "#087bdc";
          gl.uniform3f(
            color,
            parseInt(hex.slice(1, 3), 16) / 255,
            parseInt(hex.slice(3, 5), 16) / 255,
            parseInt(hex.slice(5, 7), 16) / 255,
          );
          gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
        }
      };
      draw();
      redraw.current = draw;
      refreshMotion.current = sync;
      setReady(true);
      resizeObserver = new ResizeObserver(draw);
      resizeObserver.observe(canvas);
      observer = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        sync();
      });
      observer.observe(canvas);
      motion.addEventListener("change", sync);
      document.addEventListener("visibilitychange", sync);
      canvas.addEventListener("webglcontextlost", lost);
      sync();
    } catch {
      // Devices without WebGL retain the existing cable photo, not a blank hero.
      setReady(false);
    }
    return () => {
      disposed = true;
      redraw.current = () => undefined;
      refreshMotion.current = () => undefined;
      stop();
      observer?.disconnect();
      resizeObserver?.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", lost);
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
      if (indexBuffer) gl.deleteBuffer(indexBuffer);
      if (program) gl.deleteProgram(program);
      for (const shader of shaders) gl.deleteShader(shader);
    };
  }, []);
  return (
    <div className={`store-cables-3d ${ready ? "is-ready" : ""}`}>
      <div
        className="store-cables-3d__viewport"
        role="img"
        aria-label="Três cabos elétricos em 3D. Mova o mouse, arraste ou use as setas para mudar a perspectiva."
        tabIndex={ready ? 0 : -1}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (
            event.pointerType !== "mouse" &&
            !event.currentTarget.hasPointerCapture(event.pointerId)
          )
            return;
          const rect = event.currentTarget.getBoundingClientRect();
          pointer.current.x = Math.max(
            -1,
            Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
          );
          pointer.current.y = Math.max(
            -1,
            Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
          );
          redraw.current();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            pointer.current.x = 0;
            pointer.current.y = 0;
            redraw.current();
          }
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          pointer.current.x = 0;
          pointer.current.y = 0;
          redraw.current();
        }}
        onKeyDown={(event) => {
          const view = pointer.current;
          if (event.key === "ArrowLeft") view.x = Math.max(-1, view.x - 0.2);
          else if (event.key === "ArrowRight") view.x = Math.min(1, view.x + 0.2);
          else if (event.key === "ArrowUp") view.y = Math.max(-1, view.y - 0.2);
          else if (event.key === "ArrowDown") view.y = Math.min(1, view.y + 0.2);
          else if (event.key === "Home") {
            view.x = 0;
            view.y = 0;
          } else return;
          event.preventDefault();
          redraw.current();
        }}
      >
        <img src="/assets/categories/condutor.jpg" alt="" className="store-energy-scene__photo" />
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      {ready && (
        <div className="store-cable-controls" role="group" aria-label="Personalizar cabos 3D">
          <div className="store-cable-controls__heading">
            <strong>Experimente as cores</strong>
            <span>Mova o mouse ou arraste</span>
          </div>
          <div className="store-cable-controls__row">
            {colors.map((hex, index) => (
              <label key={index}>
                <span>Cabo {index + 1}</span>
                <input
                  type="color"
                  value={hex}
                  aria-label={`Cor do cabo ${index + 1}`}
                  onChange={(event) => {
                    const next = [...colorsRef.current];
                    next[index] = event.target.value;
                    colorsRef.current = next;
                    setColors(next);
                    redraw.current();
                  }}
                />
              </label>
            ))}
            <button
              type="button"
              aria-label={paused ? "Retomar animação dos cabos" : "Pausar animação dos cabos"}
              aria-pressed={paused}
              onClick={() => {
                pausedRef.current = !pausedRef.current;
                setPaused(pausedRef.current);
                refreshMotion.current();
              }}
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
