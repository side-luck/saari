import { useEffect, useRef, useState } from "react";
import { ReactLenis } from "lenis/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, Menu, Minus, Play, Plus, Search, ShoppingBag, Volume2, X } from "lucide-react";
import "@/App.css";
import "@/Archive.css";
import "@/SilkFix.css";
import "@/Rails.css";
import { products } from "@/data/products";
import { useShopStore } from "@/store";
import { SignatureCarousel } from "@/SignatureCarousel";
import SilkCurtain from "@/SilkCurtain";

const money = (value) => `₹${value.toLocaleString("en-IN")}`;
const photos = [
  "/muse/magenta.jpg",
  "/muse/green.jpg",
  "/muse/sage.jpg",
  "/muse/cream.jpg",
  "/muse/purple.jpg",
  "/muse/scarlet.jpg",
  "/muse/marigold.jpg",
  "/muse/sage-maroon.jpg",
  "/muse/emerald-bride.webp",
  "/muse/temple-bride.jpg",
];
const archive = ["Wedding Edit", "Kanchipuram Icons", "Banarasi Heirlooms", "Everyday Silk", "Temple Gold", "Modern Drapes"];
const rackProducts = [...products];

const reveal = {
  hidden: { opacity: 0, y: 44 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 } }),
};
const Reveal = ({ children, i = 0, className, ...rest }) => (
  <motion.div className={className} variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-70px" }} custom={i} {...rest}>{children}</motion.div>
);

function useAutoDrift(ref, speed = 0.4) {
  const moved = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let raf = 0; let vel = 0; let dragging = false; let lastX = 0; let paused = false; let pos = el.scrollLeft;
    const frame = () => {
      if (!dragging && Math.abs(el.scrollLeft - pos) > 3) pos = el.scrollLeft;
      if (!dragging) {
        if (!paused) pos += speed;
        pos += vel;
        vel *= 0.94;
      }
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (pos >= half) pos -= half;
        if (pos < 0) pos += half;
      }
      el.scrollLeft = pos;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const down = (e) => { dragging = true; lastX = e.clientX; vel = 0; moved.current = 0; pos = el.scrollLeft; };
    const move = (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; pos -= dx; vel = -dx; moved.current += Math.abs(dx); };
    const up = () => { dragging = false; };
    const enter = () => { paused = true; };
    const leave = () => { paused = false; dragging = false; };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); };
  }, [ref, speed]);
  return moved;
}

function Navbar({ onCart, onSearch }) {
  const [scrolled, setScrolled] = useState(false); const [open, setOpen] = useState(false);
  const count = useShopStore((s) => s.cart.reduce((n, item) => n + item.quantity, 0)); const wishes = useShopStore((s) => s.wishlist.length);
  useEffect(() => { const handler = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", handler); return () => window.removeEventListener("scroll", handler); }, []);
  return <><nav className={`glass-nav ${scrolled ? "glass-nav-scrolled" : ""}`} data-testid="main-navigation"><button className="mobile-menu-button" onClick={() => setOpen(true)} data-testid="mobile-menu-button"><Menu size={19} /></button><a href="#top" className="archive-logo" data-testid="brand-link"><strong>SAAARI</strong><small>Woven for the divine</small></a><div className="nav-links">{["Archive", "Try the Look", "The Rack", "Bridal"].map((label) => <a href={`#${label.toLowerCase().replaceAll(" ", "-")}`} key={label} data-testid={`nav-${label.toLowerCase().replaceAll(" ", "-")}`}>{label}</a>)}</div><div className="nav-actions"><button onClick={onSearch} data-testid="search-button"><Search size={17} /></button><button className="nav-count" onClick={() => alert("Your saved silk edits await.")} data-testid="wishlist-button"><Heart size={17} /><b>{wishes}</b></button><button className="nav-count" onClick={onCart} data-testid="bag-button"><ShoppingBag size={17} /><b>{count}</b></button><a href="#the-rack" className="store-pill" data-testid="visit-store-button">Visit the store <ArrowUpRight size={14} /></a></div></nav>{open && <div className="mobile-menu" data-testid="mobile-menu"><button onClick={() => setOpen(false)} data-testid="close-mobile-menu"><X /></button>{["Archive", "Try the Look", "The Rack", "Bridal"].map((label) => <a href={`#${label.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setOpen(false)} key={label} data-testid={`mobile-nav-${label.toLowerCase().replaceAll(" ", "-")}`}>{label}</a>)}</div>}</>;
}

function ProductCard({ product, onAdd, onOpen, sfx = "" }) {
  const wished = useShopStore((s) => s.wishlist.some((item) => item.id === product.id)); const toggle = useShopStore((s) => s.toggleWishlist);
  return <article className="product-card" data-testid={`product-card-${product.id}${sfx}`}><div className="product-image-wrap"><button className="product-open" onClick={() => onOpen(product)} data-testid={`open-product-${product.id}${sfx}`} aria-label={`View ${product.name}`}><img src={product.image} alt={sfx ? "" : product.alt} loading="lazy" draggable="false" /></button><span className="product-tag">{product.tag}</span><button className={`heart-button ${wished ? "is-wishlisted" : ""}`} onClick={() => toggle(product)} data-testid={`wishlist-${product.id}${sfx}`} aria-label={`Save ${product.name}`}><Heart size={16} fill={wished ? "currentColor" : "none"} /></button><button className="quick-add" onClick={() => onAdd(product)} data-testid={`quick-add-${product.id}${sfx}`}>Add to bag <ArrowUpRight size={14} /></button></div><button className="product-meta" onClick={() => onOpen(product)} data-testid={`product-meta-${product.id}${sfx}`}><span className="eyebrow">{product.fabric}</span><h3>{product.name}</h3><strong>{money(product.price)}</strong></button></article>;
}

function ProductOverlay({ product, close, onAdd }) {
  const gallery = [product.image, ...photos.filter((p) => p !== product.image)].slice(0, 4);
  const [shot, setShot] = useState(0); const [size, setSize] = useState(null); const [openTab, setOpenTab] = useState("care");
  const wished = useShopStore((s) => s.wishlist.some((item) => item.id === product.id)); const toggle = useShopStore((s) => s.toggleWishlist);
  useEffect(() => { setShot(0); setSize(null); setOpenTab("care"); }, [product]);
  const sizes = product.category === "Blouses" ? [34, 36, 38, 40, 42] : ["Free", 34, 36, 38, 40];
  return <motion.div className="rack-modal" data-testid="rack-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
    <button className="rack-close" onClick={close} data-testid="rack-detail-close">Close <X size={15} /></button>
    <motion.div className="rack-detail-gallery" initial={{ opacity: 0, x: -34 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
      <div className="rack-detail-image"><AnimatePresence mode="wait"><motion.img key={shot} src={gallery[shot]} alt={product.alt} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} /></AnimatePresence></div>
      <div className="gallery-thumbs">{gallery.map((img, index) => <button className={index === shot ? "thumb-active" : ""} onClick={() => setShot(index)} key={img + index} data-testid={`gallery-thumb-${index}`}><img src={img} alt="" /></button>)}</div>
    </motion.div>
    <motion.div className="rack-detail-copy" initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}>
      <span className="eyebrow">{product.fabric} · {product.tag}</span><h2>{product.name}</h2><strong>{money(product.price)}</strong>
      <p className="detail-description">{product.description}</p>
      <div className="size-row"><span>{product.category === "Blouses" ? "Select a size" : "Blouse size (saree is free size)"}</span>{sizes.map((s) => <button className={size === s ? "size-active" : ""} onClick={() => setSize(s)} key={s} data-testid={`size-${s}`}>{s}</button>)}</div>
      <div className="detail-actions"><button onClick={() => { close(); onAdd(product); }} data-testid="rack-add-to-cart">Add to bag <ArrowUpRight size={15} /></button><button className={wished ? "is-wishlisted" : ""} onClick={() => toggle(product)} data-testid="overlay-wishlist" aria-label="Save to wishlist"><Heart size={17} fill={wished ? "currentColor" : "none"} /></button></div>
      {[["care", "Care & fabric", product.care], ["delivery", "Delivery & returns", product.delivery]].map(([key, label, text]) => <div className="detail-accordion" key={key}><button onClick={() => setOpenTab(openTab === key ? "" : key)} data-testid={`${key}-toggle`}><span>{label}</span><ChevronDown size={15} style={{ transform: openTab === key ? "rotate(180deg)" : "none", transition: "transform .3s" }} /></button><AnimatePresence>{openTab === key && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>{text}</motion.p>}</AnimatePresence></div>)}
      <a href="#footer" className="availability" onClick={close} data-testid="availability-link">See availability <ArrowRight size={14} /></a>
    </motion.div>
  </motion.div>;
}

function CartDrawer({ open, close }) {
  const cart = useShopStore((s) => s.cart); const remove = useShopStore((s) => s.removeFromCart); const update = useShopStore((s) => s.updateQuantity); const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!open) return null;
  return <div className="drawer-backdrop" onClick={close} data-testid="cart-drawer-backdrop"><aside className="cart-drawer" onClick={(e) => e.stopPropagation()} data-testid="cart-drawer"><div className="drawer-head"><div><span className="eyebrow">YOUR SILK EDIT</span><h2>The bag <em>({cart.reduce((n, i) => n + i.quantity, 0)})</em></h2></div><button onClick={close} data-testid="close-cart-button"><X /></button></div>{cart.length === 0 ? <div className="empty-cart"><p>Your bag is waiting for a piece of the archive.</p></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id} data-testid={`cart-item-${item.id}`}><img src={item.image} alt={item.alt} /><div><span className="eyebrow">{item.fabric}</span><h3>{item.name}</h3><strong>{money(item.price)}</strong><div className="qty"><button onClick={() => update(item.id, item.quantity - 1)} data-testid={`decrease-${item.id}`}><Minus size={12} /></button><span>{item.quantity}</span><button onClick={() => update(item.id, item.quantity + 1)} data-testid={`increase-${item.id}`}><Plus size={12} /></button><button className="remove" onClick={() => remove(item.id)} data-testid={`remove-${item.id}`}>Remove</button></div></div></div>)}</div><div className="shipping-note">{total >= 15000 ? "Congratulations! Free shipping is yours." : `${money(15000 - total)} away from free shipping.`}</div><div className="cart-total"><span>Subtotal</span><strong>{money(total)}</strong></div><button className="checkout-button" data-testid="checkout-button">Proceed to checkout <ArrowUpRight size={15} /></button></>}</aside></div>;
}

function useIntroGate() {
  const [done, setDone] = useState(() => window.__curtainDone === true);
  useEffect(() => {
    const handler = () => setDone(true);
    window.addEventListener("saaari:curtain-done", handler);
    return () => window.removeEventListener("saaari:curtain-done", handler);
  }, []);
  return done;
}

const FRAME_COUNT = 110;
const frameSrc = (i) => `/frames/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;

function Hero() {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const currentRef = useRef(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const mainOpacity = useTransform(scrollYProgress, [0, 0.2, 0.28], [1, 1, 0]);
  const mainY = useTransform(scrollYProgress, [0, 0.28], [0, -46]);
  const mainPointer = useTransform(scrollYProgress, (v) => (v > 0.24 ? "none" : "auto"));
  const q1Opacity = useTransform(scrollYProgress, [0.28, 0.38, 0.55, 0.64], [0, 1, 1, 0]);
  const q1Y = useTransform(scrollYProgress, [0.28, 0.64], [34, -18]);
  const q2Opacity = useTransform(scrollYProgress, [0.64, 0.74, 1], [0, 1, 1]);
  const q2Y = useTransform(scrollYProgress, [0.64, 1], [34, 0]);

  useEffect(() => {
    const draw = (i) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      let j = i;
      while (j > 0 && !(framesRef.current[j]?.complete && framesRef.current[j].naturalWidth)) j -= 1;
      const img = framesRef.current[j];
      if (!img || !img.complete || !img.naturalWidth) return;
      const ctx = canvas.getContext("2d");
      const cw = canvas.width; const ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      ctx.drawImage(img, (cw - img.naturalWidth * s) / 2, (ch - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
    };
    framesRef.current = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image();
      img.src = frameSrc(i);
      if (i === 0) img.onload = () => draw(0);
      return img;
    });
    const canvas = canvasRef.current;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw(currentRef.current);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas._draw = draw;
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(FRAME_COUNT - 1, Math.floor(v * FRAME_COUNT));
    if (i !== currentRef.current) { currentRef.current = i; canvasRef.current?._draw?.(i); }
  });

  const intro = useIntroGate();
  return <><div className="hero-scroll" ref={ref}><section className="showroom-hero hero-sticky" data-testid="hero-section"><canvas className="hero-canvas" ref={canvasRef} data-testid="hero-canvas" /><div className="showroom-overlay" /><motion.div className="hero-copy" style={{ opacity: mainOpacity, y: mainY, pointerEvents: mainPointer }}><motion.span className="eyebrow" initial={{ opacity: 0, y: 16 }} animate={intro ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.25 }}>TRADITION MEETS TOMORROW</motion.span><h1>{["More Than", "a Saree."].map((line, i) => <span className="mask-line" key={line}><motion.span initial={{ y: "112%" }} animate={intro ? { y: "0%" } : {}} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 + i * 0.16 }}>{i === 1 ? <em>{line}</em> : line}</motion.span></span>)}</h1><motion.p initial={{ opacity: 0, y: 18 }} animate={intro ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 0.9 }}>For every you, every moment.</motion.p><motion.div className="hero-buttons" initial={{ opacity: 0, y: 18 }} animate={intro ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 1.05 }}><a className="hero-maroon-button" href="#the-rack" data-testid="explore-collections-button">Explore Collections <ArrowUpRight size={16} /></a><a className="hero-white-button" href="#try-the-look" data-testid="try-look-button">Try the Look <ArrowRight size={16} /></a></motion.div></motion.div><motion.div className="hero-trust" style={{ opacity: mainOpacity }} data-testid="hero-trust"><span>100% Authentic Weaves</span><i>◆</i><span>Free Shipping Across India</span><i>◆</i><span>Easy Returns within 7 days</span></motion.div><motion.p className="hero-quote hero-quote-bl" style={{ opacity: q1Opacity, y: q1Y }} data-testid="hero-quote-1">Six weavers, one thread, months of patient hands.</motion.p><motion.p className="hero-quote hero-quote-tr" style={{ opacity: q2Opacity, y: q2Y }} data-testid="hero-quote-2">Zari catches the light the way memory catches a moment.</motion.p></section></div><div className="maroon-ticker" data-testid="maroon-ticker"><div>TRY THE LOOK <b>◆</b> PURE ZARI <b>◆</b> BRIDAL <b>◆</b> KANCHIPURAM ICONS <b>◆</b> THE RACK <b>◆</b> TRY THE LOOK <b>◆</b> PURE ZARI <b>◆</b> BRIDAL <b>◆</b></div></div></>;
}

function ArchiveSection() { return <section className="archive-section" id="archive" data-testid="archive-section"><Reveal className="archive-heading"><div><span className="eyebrow">THE SAAARI ARCHIVE</span><h2>Six Moods.<br /><em>Timeless Drapes.</em></h2></div><p>Woven by hand,<br />worn for a lifetime.</p></Reveal><div className="temple-grid">{archive.map((item, index) => <Reveal i={index * 0.5} key={item}><a href="#the-rack" className="temple-card" data-testid={`archive-mood-${index}`}><div className="temple-window"><span className="finial">✦</span><img src={photos[index % photos.length]} alt={`${item} saree mood`} loading="lazy" /></div><span>{item}</span></a></Reveal>)}</div></section>; }

function TryTheLook({ onAdd }) {
  const lookPhotos = ["/look/look-1.jpg", "/look/look-2.jpg", "/look/look-3.jpg", "/look/look-4.jpg", "/look/look-5.jpg"];
  const lookNames = ["Maroon Muhurtham", "Ganga Jamuna", "Ajrakh Courtyard", "Temple Emerald", "Chettinand Gold"];
  const [active, setActive] = useState(0); const [hovered, setHovered] = useState(null);
  const expanded = hovered !== null ? hovered : active;
  const lookItems = [{ name: "Kanchi Rani Silk", price: 24500 }, { name: "Temple Gold Blouse", price: 4200 }, { name: "Lakshmi Choker", price: 3800 }, { name: "Ruby Jhumkas", price: 2400 }, { name: "Antique Ottiyanam", price: 5900 }, { name: "Gold Bangles", price: 1800 }];
  const next = () => setActive((expanded + 1) % 5); const prev = () => setActive((expanded + 4) % 5);
  return <section className="look-section" id="try-the-look" data-testid="try-look-section"><Reveal className="look-title"><span className="eyebrow">THE FULL LOOK / 05</span><h2>Try the <em>Look.</em></h2><p>One drape. Every detail.<br />Styled for the moment.</p></Reveal><Reveal i={1} className="look-stage"><div className="look-models" onMouseLeave={() => setHovered(null)}>{lookPhotos.map((src, n) => <button className={`look-model ${n === expanded ? "look-model-active" : ""}`} onMouseEnter={() => setHovered(n)} onFocus={() => setHovered(n)} onClick={() => setActive(n)} key={src} data-testid={`look-model-${n}`}><img src={src} alt={`Styled saree look — ${lookNames[n]}`} /><span className="look-model-name">{lookNames[n]}</span></button>)}</div><div className="look-controls" data-testid="look-controls"><span>{expanded + 1} of 5 · {lookNames[expanded]}</span><button onClick={prev} data-testid="look-prev"><ChevronLeft size={15} /></button><button onClick={next} data-testid="look-next"><ChevronRight size={15} /></button><small>Hover or drag</small></div></Reveal><Reveal i={2} className="look-panel"><span className="eyebrow">IN THIS LOOK</span>{lookItems.map((item, index) => <div className="look-item" key={item.name}><img src={lookPhotos[index % lookPhotos.length]} alt="" /><div><strong>{item.name}</strong><span>{money(item.price)}</span></div><button data-testid={`look-heart-${index}`}><Heart size={14} /></button><button onClick={() => onAdd({ ...products[index % products.length], id: `look-${index}`, name: item.name, price: item.price })} data-testid={`look-add-${index}`}><Plus size={15} /></button></div>)}<div className="bundle-total"><span>Full look <small>10% edit saving</small></span><strong>{money(42600)}</strong></div><button className="bundle-button" onClick={() => onAdd(products[0])} data-testid="add-full-look">Add full look to bag <ArrowUpRight size={16} /></button></Reveal></section>;
}

function RailArrows({ railRef, prefix }) {
  const scroll = (dir) => railRef.current?.scrollBy({ left: dir * 560, behavior: "smooth" });
  return <div className="rail-nav"><button onClick={() => scroll(-1)} data-testid={`${prefix}-prev`} aria-label="Scroll back"><ArrowLeft size={16} /></button><button onClick={() => scroll(1)} data-testid={`${prefix}-next`} aria-label="Scroll forward"><ArrowRight size={16} /></button></div>;
}

function NewArrivals({ onAdd, onOpen }) {
  const railRef = useRef(null);
  const dragMoved = useAutoDrift(railRef, 0.55);
  const railProducts = [...products, ...products];
  return <section className="new-rail-section" data-testid="new-arrivals-section"><Reveal className="new-rail-head"><div><span className="eyebrow">JUST OFF THE LOOM</span><h2>New <em>Arrivals.</em></h2></div><RailArrows railRef={railRef} prefix="arrivals" /></Reveal><div className="product-rail" ref={railRef} data-testid="arrivals-rail">{railProducts.map((product, index) => <Reveal i={(index % products.length) * 0.25} key={`${product.id}-${index}`} className="rail-item"><ProductCard product={product} sfx={index < products.length ? "" : "-loop"} onAdd={onAdd} onOpen={(p) => { if (dragMoved.current < 6) onOpen(p); }} /></Reveal>)}</div></section>;
}

function Rack({ onOpen }) {
  const [filter, setFilter] = useState("All pieces"); const railRef = useRef(null);
  const dragMoved = useAutoDrift(railRef, 0.7);
  const filters = ["All pieces", "Silk Sarees", "Half Sarees", "Blouses", "Checked Sarees", "Zari & Brocade"];
  const filtered = filter === "All pieces" ? rackProducts : rackProducts.filter((p) => p.category === filter);
  const railItems = [...filtered, ...filtered];
  return <section className="rack-section" id="the-rack" data-testid="rack-section"><Reveal className="rack-head"><div><span className="eyebrow">THE SAAARI RACK</span><h2>Every silk,<br /><em>on the rail.</em></h2></div><div className="rack-copy"><p>Explore the collection · {rackProducts.length} pieces</p><small>Drag the rail or let it drift</small><RailArrows railRef={railRef} prefix="rack" /></div></Reveal><div className="filter-row">{filters.map((item) => <button className={filter === item ? "filter-active" : ""} onClick={() => setFilter(item)} key={item} data-testid={`rack-filter-${item.toLowerCase().replaceAll(" ", "-")}`}>{item} <span>{item === "All pieces" ? rackProducts.length : rackProducts.filter((p) => p.category === item).length}</span></button>)}</div><div className="rail" ref={railRef} data-testid="rack-rail"><div className="rail-line" />{railItems.map((product, idx) => { const copy = idx < filtered.length ? 0 : 1; return <button className="hanger" onClick={() => { if (dragMoved.current < 6) onOpen(product); }} key={`${product.id}-${copy}`} data-testid={copy === 0 ? `hanger-${product.id}` : `hanger-${product.id}-loop`} aria-hidden={copy === 1}><span className="hanger-hook">⌒</span><div className="hanger-frame"><img src={product.image} alt={copy === 0 ? product.alt : ""} draggable="false" /><span>{product.name}</span><small>{money(product.price)}</small></div></button>; })}</div></section>;
}

function MuseFilm({ onAdd }) { return <section className="film-section" data-testid="muse-film"><Reveal className="film-heading"><span className="eyebrow">THE MUSE FILM / 03:42</span><h2>Feel the <em>drape.</em></h2></Reveal><div className="film-layout"><Reveal i={1} className="film-side film-side-left"><img src={photos[6]} alt="Silk lifestyle" /><img src={photos[7]} alt="Silk detail" /></Reveal><Reveal i={0} className="film-frame"><img src={photos[5]} alt="SAAARI muse film still" /><span className="film-bracket bracket-top" /><span className="film-bracket bracket-bottom" /><button className="sound-pill" data-testid="film-sound-toggle"><Volume2 size={13} /> Sound off</button><button className="film-play" data-testid="film-play"><Play fill="currentColor" size={20} /></button></Reveal><Reveal i={2} className="film-side film-side-right"><img src={photos[9]} alt="Silk lifestyle" /><img src={photos[8]} alt="Silk drape detail" /></Reveal></div><button className="film-cta" onClick={() => onAdd(products[1])} data-testid="purchase-collection">Purchase the collection <ArrowUpRight size={16} /></button></section>; }

function MuseReels() {
  const arcRef = useRef(null);
  const dragMoved = useAutoDrift(arcRef, 0.55);
  const reels = ["First Light", "Temple Steps", "Golden Hour", "The Last Drape", "Woven Heritage"];
  const reelItems = [...reels, ...reels];

  useEffect(() => {
    const arc = arcRef.current;
    if (!arc) return undefined;
    let raf = 0; let current = null;
    const tick = () => {
      const mid = arc.getBoundingClientRect().left + arc.clientWidth / 2;
      const cards = arc.querySelectorAll(".reel-card");
      let best = null; let bestDist = Infinity;
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestDist) { bestDist = d; best = card; }
      });
      if (best !== current) { current?.classList.remove("reel-center"); best?.classList.add("reel-center"); current = best; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); current?.classList.remove("reel-center"); };
  }, []);

  const step = (dir) => {
    const arc = arcRef.current;
    const card = arc?.querySelector(".reel-card");
    if (arc && card) arc.scrollBy({ left: dir * (card.offsetWidth + 13), behavior: "smooth" });
  };

  return <section className="reels-section" data-testid="muse-reels"><Reveal className="reels-head"><div><span className="eyebrow">THE MUSE REELS / 05 STORIES</span><h2>Silk, <em>in motion.</em></h2></div><div><button onClick={() => step(-1)} data-testid="reels-prev"><ChevronLeft /></button><button onClick={() => step(1)} data-testid="reels-next"><ChevronRight /></button></div></Reveal><div className="reel-arc" ref={arcRef} data-testid="reels-arc">{reelItems.map((title, copy) => { const index = copy % 5; return <button className="reel-card" key={`${title}-${copy}`} data-testid={copy < 5 ? `reel-${index}` : `reel-${index}-loop`} aria-hidden={copy >= 5}><img src={photos[(index + 1) % photos.length]} alt={copy < 5 ? title : ""} draggable="false" /><span className="reel-number">0{index + 1}</span><div><small>00:24 · {index % 2 ? "KANCHIPURAM" : "ORGANZA"}</small><strong>{title}</strong><span>{["Bengaluru", "Kanchipuram", "Varanasi", "Udaipur", "Coimbatore"][index]}</span></div><i className="reel-progress" /></button>; })}</div></section>;
}

function Bridal({ onOpen }) {
  const [active, setActive] = useState(1);
  const bridalLooks = [products[0], products[4], products[8]];
  const current = bridalLooks[active];
  return <section className="bridal-section" id="bridal" data-testid="bridal-section"><Reveal className="bridal-heading"><span className="eyebrow">THE SAARI BRIDAL EDIT</span><h2>The Bridal<br /><em>Collection.</em></h2><p>For the muhurtham and every vow after.</p></Reveal><div className="bridal-carousel">{bridalLooks.map((look, index) => <button className={`bridal-card ${index === active ? "bridal-active" : ""}`} onClick={() => setActive(index)} key={look.id} data-testid={`bridal-card-${index}`}><div><img src={look.image} alt={look.alt} /></div><span>{look.name}</span></button>)}</div><div className="bridal-info"><span className="eyebrow">PURE KANCHIPURAM SILK · ZARI PALLU</span><h3>{current.name}</h3><strong>{money(current.price)}</strong><div><button onClick={() => setActive((active + 2) % 3)} data-testid="bridal-prev"><ChevronLeft /></button><button onClick={() => setActive((active + 1) % 3)} data-testid="bridal-next"><ChevronRight /></button><button className="bridal-add" onClick={() => onOpen(current)} data-testid="bridal-add">View the piece <ArrowUpRight size={15} /></button><button data-testid="bridal-heart"><Heart size={16} /></button></div></div></section>;
}

function App() {
  const [cartOpen, setCartOpen] = useState(false); const [searchOpen, setSearchOpen] = useState(false); const [selected, setSelected] = useState(null);
  const addToCart = useShopStore((s) => s.addToCart);
  const add = (product) => { addToCart(product); setCartOpen(true); };
  return <ReactLenis root options={{ lerp: 0.09, anchors: true }}><div className="site" id="top"><div className="announcement" data-testid="announcement-bar"><span>NEW DROP</span><i>◆</i><span>Free shipping all over India</span><i>◆</i><span>Made-to-order house stitching</span></div><SilkCurtain /><Navbar onCart={() => setCartOpen(true)} onSearch={() => setSearchOpen(true)} />{searchOpen && <div className="search-overlay" data-testid="search-overlay"><button onClick={() => setSearchOpen(false)} data-testid="close-search-button"><X /></button><span className="eyebrow">SEARCH THE HOUSE</span><input autoFocus placeholder="Search sarees, silk, stories..." data-testid="search-input" /></div>}<main><Hero /><ArchiveSection /><TryTheLook onAdd={add} /><NewArrivals onAdd={add} onOpen={setSelected} /><SignatureCarousel items={products.slice(0, 7)} onOpen={setSelected} /><Rack onOpen={setSelected} /><MuseFilm onAdd={add} /><MuseReels /><Bridal onOpen={setSelected} /></main><footer id="footer" data-testid="site-footer"><div className="footer-brand"><span>SAAARI</span><i>Woven for the divine.</i></div><div className="footer-bottom"><span>© 2026 SAAARI</span><span>Privacy · Terms · Shipping & returns</span><span>Made with patience in India</span></div></footer><AnimatePresence>{selected && <ProductOverlay product={selected} close={() => setSelected(null)} onAdd={add} />}</AnimatePresence><CartDrawer open={cartOpen} close={() => setCartOpen(false)} /></div></ReactLenis>;
}

export default App;
