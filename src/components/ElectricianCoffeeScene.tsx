import { useRef, useState, type CSSProperties } from "react";
import { MoveUpRight, Pause, Play, Zap } from "lucide-react";

export function ElectricianCoffeeScene() {
  const scene = useRef<HTMLDivElement>(null);
  const angle = useRef({ x: -8, y: -16 });
  const [paused, setPaused] = useState(false);

  function rotate(x: number, y: number) {
    angle.current = { x, y };
    scene.current?.style.setProperty("--coffee-x", `${x}deg`);
    scene.current?.style.setProperty("--coffee-y", `${y}deg`);
  }

  return (
    <div className={`electric-coffee${paused ? " is-paused" : ""}`}>
      <div className="electric-coffee__halo" aria-hidden="true" />
      <span className="electric-coffee__orbit electric-coffee__orbit--one" aria-hidden="true" />
      <span className="electric-coffee__orbit electric-coffee__orbit--two" aria-hidden="true" />
      <div className="electric-coffee__stamp" aria-hidden="true">
        FEITO PARA
        <br />
        <strong>VOCÊ.</strong>
      </div>
      <div
        className="electric-coffee__viewport"
        role="img"
        aria-label="Xícara de café em 3D. Mova o mouse, arraste ou use as setas para mudar a perspectiva."
        tabIndex={0}
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
          const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
          const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
          rotate(-8 - y * 9, -16 + x * 22);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") rotate(-8, -16);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => rotate(-8, -16)}
        onKeyDown={(event) => {
          const next = { ...angle.current };
          if (event.key === "ArrowLeft") next.y -= 5;
          else if (event.key === "ArrowRight") next.y += 5;
          else if (event.key === "ArrowUp") next.x -= 5;
          else if (event.key === "ArrowDown") next.x += 5;
          else if (event.key === "Home") {
            next.x = -8;
            next.y = -16;
          } else return;
          event.preventDefault();
          rotate(Math.max(-25, Math.min(10, next.x)), Math.max(-40, Math.min(20, next.y)));
        }}
      >
        <div className="electric-coffee__shadow" aria-hidden="true" />
        <div
          ref={scene}
          className="electric-coffee__scene"
          style={{ "--coffee-x": "-8deg", "--coffee-y": "-16deg" } as CSSProperties}
          aria-hidden="true"
        >
          <div className="electric-coffee__steam">
            <i />
            <i />
            <i />
          </div>
          <div className="electric-coffee__saucer" />
          <div className="electric-coffee__handle" />
          <div className="electric-coffee__cup">
            <div className="electric-coffee__rim">
              <span />
            </div>
            <div className="electric-coffee__emblem">
              <Zap size={44} strokeWidth={1.5} />
              <span>PIZZATTO</span>
              <small>ENERGIA QUE CONECTA</small>
            </div>
          </div>
        </div>
      </div>
      <div className="electric-coffee__caption">
        <span>
          <MoveUpRight size={14} aria-hidden="true" /> Mova, arraste e explore
        </span>
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
          aria-label={paused ? "Retomar animação do café" : "Pausar animação do café"}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>
    </div>
  );
}
