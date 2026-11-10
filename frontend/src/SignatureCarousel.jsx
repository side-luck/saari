import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import "@/SignatureCarousel.css";

const money = (value) => `₹${value.toLocaleString("en-IN")}`;

export function SignatureCarousel({ items, onOpen }) {
  const stageRef = useRef(null);
  const [reduced, setReduced] = useState(false);
  const s = useRef({ pos: 0, target: 0, vel: 0, dragging: false, lastX: 0, moved: 0, paused: false, step: 248, angle: 38, raf: 0, cardEls: [] });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    const stage = stageRef.current;
    if (!stage) return undefined;
    const st = s.current;
    st.cardEls = [...stage.querySelectorAll(".sc-card")];

    const measure = () => {
      const first = st.cardEls[0];
      if (first) st.step = first.offsetWidth + 16;
      st.angle = parseFloat(getComputedStyle(stage).getPropertyValue("--sc-angle")) || 38;
      const h = first ? first.offsetWidth * 4 / 3 + 74 : 400;
      stage.style.height = `${h}px`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);

    const frame = () => {
      if (!st.dragging) {
        if (!st.paused) st.target += 0.55;
        st.target += st.vel;
        st.vel *= 0.94;
      }
      st.pos += (st.target - st.pos) * (st.dragging ? 0.35 : 0.08);
      const total = items.length * st.step;
      const stageW = stage.clientWidth;
      const stageCenter = stageW / 2;
      for (let i = 0; i < st.cardEls.length; i++) {
        const raw = i * st.step - st.pos;
        const x = ((raw % total) + total) % total - st.step;
        const d = Math.max(-1, Math.min(1, (x + st.step / 2 - stageCenter) / stageCenter));
        const a = Math.abs(d);
        const el = st.cardEls[i];
        el.style.transform = `translateX(${x}px) translateZ(${-a * 160}px) rotateY(${-d * st.angle}deg) translateY(${d * d * 48}px) scale(${1 - a * 0.08})`;
        el.style.filter = `brightness(${1 - a * 0.25})`;
        el.style.zIndex = String(200 - Math.round(a * 100));
      }
      st.raf = requestAnimationFrame(frame);
    };
    st.raf = requestAnimationFrame(frame);

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); st.target += e.deltaX; }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => { cancelAnimationFrame(st.raf); ro.disconnect(); stage.removeEventListener("wheel", onWheel); };
  }, [reduced, items.length]);

  const down = (e) => { const st = s.current; st.dragging = true; st.lastX = e.clientX; st.moved = 0; st.vel = 0; stageRef.current?.setPointerCapture?.(e.pointerId); };
  const move = (e) => { const st = s.current; if (!st.dragging) return; const dx = e.clientX - st.lastX; st.lastX = e.clientX; st.target -= dx; st.vel = -dx; st.moved += Math.abs(dx); };
  const up = () => { s.current.dragging = false; };
  const key = (e) => { const st = s.current; if (e.key === "ArrowRight") { st.target += st.step; e.preventDefault(); } if (e.key === "ArrowLeft") { st.target -= st.step; e.preventDefault(); } };
  const clickCard = (item) => { if (s.current.moved < 6) onOpen?.(item); };
  const stageClick = (e) => {
    if (s.current.moved >= 6) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest(".sc-card");
    if (el) clickCard(doubled[Number(el.dataset.idx)]);
  };

  const doubled = [...items, ...items];
  return (
    <section className={`sig-carousel ${reduced ? "sc-flat" : ""}`} data-testid="signature-carousel">
      <div className="sc-head">
        <div>
          <span className="sc-eyebrow">The Signature Edit</span>
          <h2 className="sc-title">Woven to Be <em>Remembered.</em></h2>
        </div>
        <a className="sc-link" href="#the-rack" data-testid="sc-explore">Explore the edit <ArrowRight size={14} /></a>
      </div>
      <div
        className="sc-stage"
        ref={stageRef}
        role="region"
        aria-label="Signature sarees"
        tabIndex={0}
        data-testid="sc-stage"
        onKeyDown={key}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClick={stageClick}
        onMouseEnter={() => { s.current.paused = true; }}
        onMouseLeave={() => { s.current.paused = false; }}
      >
        {doubled.map((item, i) => (
          <article
            className="sc-card"
            key={`${item.id}-${i}`}
            data-testid={`sc-card-${item.id}-${i < items.length ? "a" : "b"}`}
            data-idx={i}
            aria-hidden={i >= items.length}
          >
            <img src={item.image} alt={i < items.length ? item.alt : ""} loading="lazy" draggable="false" />
            <div className="sc-shade" />
            <div className="sc-meta">
              <h3>{item.name}</h3>
              <span>{money(item.price)}</span>
            </div>
            <span className="sc-view">View</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SignatureCarousel;
