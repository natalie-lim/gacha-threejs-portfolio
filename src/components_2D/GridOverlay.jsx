import { useEffect, useRef } from "react";

const GRID = 60;
const GLOW_RADIUS = 180;
const COLOR = "14, 71, 73"; // #0e4749

function GridOverlay() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    let raf;
    function draw() {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / GRID);
      const rows = Math.ceil(height / GRID);
      const { x: mx, y: my } = mouseRef.current;

      // Faint grid lines
      ctx.strokeStyle = `rgba(${COLOR}, 0.06)`;
      ctx.lineWidth = 1;
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * GRID, 0);
        ctx.lineTo(c * GRID, height);
        ctx.stroke();
      }
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * GRID);
        ctx.lineTo(width, r * GRID);
        ctx.stroke();
      }

      // Glowing intersection nodes
      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const x = c * GRID;
          const y = r * GRID;
          const dist = Math.hypot(x - mx, y - my);
          const t = Math.max(0, 1 - dist / GLOW_RADIUS);
          const eased = t * t * (3 - 2 * t);

          if (eased > 0) {
            const radius = 2 + eased * 6;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, `rgba(${COLOR}, ${0.75 * eased})`);
            grad.addColorStop(1, `rgba(${COLOR}, 0)`);
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${COLOR}, 0.1)`;
            ctx.fill();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

export default GridOverlay;
