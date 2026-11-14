import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { products } from "@/data/products";
import "@/FeaturedBridal.css";

const money = (value) => `₹${value.toLocaleString("en-IN")}`;
const FALLBACK_IMAGE = "/muse/silk-curtain.webp";

const bridalPicks = [products[8], products[7], products[4], products[0], products[3], products[2]];

const onImageError = (event) => {
  const img = event.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = FALLBACK_IMAGE;
};

export function FeaturedCollectionBanner() {
  return (
    <a className="fb-banner" href="#the-rack" aria-label="View the bridal collection" data-testid="featured-banner">
      <img className="fb-banner-img" src="/muse/temple-bride.jpg" alt="Bride wearing a red Kanchipuram silk saree with traditional gold jewellery" loading="lazy" onError={onImageError} />
      <span className="fb-banner-shade" aria-hidden="true" />
      <span className="fb-banner-copy">
        <span className="fb-banner-kicker">The Saari Bridal Edit</span>
        <span className="fb-banner-title">The Bridal Collection</span>
        <span className="fb-banner-cta">View the collection <ArrowRight size={14} /></span>
      </span>
    </a>
  );
}

export function FeaturedProductCard({ product, onAdd, onOpen }) {
  const [adding, setAdding] = useState(false);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const add = () => {
    if (adding) return;
    setAdding(true);
    try {
      onAdd?.(product);
    } finally {
      window.setTimeout(() => setAdding(false), 900);
    }
  };

  return (
    <article className="fb-card" data-testid={`bridal-product-${product.id}`}>
      <button className="fb-card-media" type="button" onClick={() => onOpen?.(product)} aria-label={`View ${product.name}`}>
        <img src={product.image} alt={product.alt} loading="lazy" draggable="false" onError={onImageError} />
        {discount > 0 && <span className="fb-card-badge">-{discount}%</span>}
      </button>
      <div className="fb-card-body">
        <span className="fb-card-fabric">{product.fabric}</span>
        <button className="fb-card-name" type="button" onClick={() => onOpen?.(product)}>{product.name}</button>
        <div className="fb-card-price">
          <strong>{money(product.price)}</strong>
          {product.originalPrice && <del>{money(product.originalPrice)}</del>}
        </div>
        <button className="fb-card-add" type="button" onClick={add} disabled={adding} data-testid={`bridal-add-${product.id}`} aria-label={`Add ${product.name} to bag`}>
          {adding ? "Added" : "Add to cart"} <ShoppingBag size={13} />
        </button>
      </div>
    </article>
  );
}

export function FeaturedProductCarousel({ items, onAdd, onOpen }) {
  const railRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 2);
    setAtEnd(max <= 2 || rail.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    measure();
    const rail = railRef.current;
    if (!rail) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    return () => ro.disconnect();
  }, [measure, items.length]);

  const step = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * Math.max(rail.clientWidth * 0.8, 220), behavior: "smooth" });
  };

  const onKeyDown = (event) => {
    const rail = railRef.current;
    if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    else if (event.key === "Home") { event.preventDefault(); rail?.scrollTo({ left: 0, behavior: "smooth" }); }
    else if (event.key === "End") { event.preventDefault(); rail?.scrollTo({ left: rail.scrollWidth, behavior: "smooth" }); }
  };

  return (
    <div className="fb-carousel">
      <div className="fb-head">
        <div className="fb-head-copy">
          <span className="fb-eyebrow">Selected for the muhurtham</span>
          <h2 className="fb-title">The Bridal <em>Collection</em></h2>
        </div>
        <div className="fb-nav">
          <button type="button" onClick={() => step(-1)} disabled={atStart} aria-label="Previous bridal pieces" data-testid="bridal-carousel-prev"><ChevronLeft size={17} /></button>
          <button type="button" onClick={() => step(1)} disabled={atEnd} aria-label="Next bridal pieces" data-testid="bridal-carousel-next"><ChevronRight size={17} /></button>
        </div>
      </div>
      <div className="fb-rail" ref={railRef} onScroll={measure} onKeyDown={onKeyDown} tabIndex={0} role="region" aria-label="Bridal collection products" data-testid="bridal-carousel">
        {items.map((product) => <FeaturedProductCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

export function FeaturedBridalCollection({ onAdd, onOpen }) {
  return (
    <section className="fb-section" id="bridal" data-testid="featured-bridal-section">
      <svg className="fb-wave fb-wave-top" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0,66 C180,8 360,116 540,74 C720,32 900,110 1080,78 C1260,46 1350,60 1440,34 L1440,0 L0,0 Z" /></svg>
      <svg className="fb-wave fb-wave-bottom" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0,54 C180,108 360,10 540,48 C720,86 900,18 1080,52 C1260,86 1350,70 1440,96 L1440,120 L0,120 Z" /></svg>
      <div className="fb-shell">
        <FeaturedCollectionBanner />
        <FeaturedProductCarousel items={bridalPicks} onAdd={onAdd} onOpen={onOpen} />
      </div>
    </section>
  );
}

export default FeaturedBridalCollection;
