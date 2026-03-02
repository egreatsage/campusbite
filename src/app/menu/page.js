"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";

/* ─────────────────────────────────────────────
   Inline global styles (inject once)
───────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

    :root {
      --cream: #faf6ef;
      --parchment: #f2ead8;
      --amber: #e8a020;
      --amber-deep: #c47d0e;
      --char: #1a1410;
      --char-soft: #3d3026;
      --muted: #9a8c78;
      --green: #3d6b4f;
      --card-bg: #fffdf8;
      --card-border: #e8dfc8;
    }

    body { background: var(--cream); }

    .menu-root { font-family: 'DM Sans', sans-serif; }

    .display-font { font-family: 'Playfair Display', serif; }

    /* Scrollbar hide */
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* Card shine effect */
    .food-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      z-index: 1;
      border-radius: inherit;
    }
    .food-card:hover::before { opacity: 1; }

    /* Stagger grid fade-in */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .food-card {
      animation: fadeUp 0.45s both ease-out;
    }

    /* Dot loader */
    @keyframes dotBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-12px); }
    }
  `}</style>
);

export default function StudentMenu() {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed to load menu");
        const data = await res.json();
        setCategories(data.categories);
        setFoods(data.foods);
      } catch {
        toast.error("Could not load the menu right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = activeCategory === "All" || food.categoryId === activeCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = inStockOnly ? !food.isOutOfStock : true;
    return matchesCategory && matchesSearch && matchesStock;
  });

  if (loading) {
    return (
      <>
        <GlobalStyle />
        <div className="menu-root min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--cream)' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 12, height: 12,
                borderRadius: '50%',
                background: 'var(--amber)',
                animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite`
              }} />
            ))}
          </div>
          <p className="display-font" style={{ color: 'var(--muted)', fontSize: 14, letterSpacing: 3, textTransform: 'uppercase' }}>
            Loading menu…
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <div className="menu-root min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>

        {/* ── Sticky Header ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(250,246,239,0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1.5px solid var(--card-border)',
        }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 32px 0' }}>

            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 600 }}>
                    Campus Kitchen
                  </span>
                  <span style={{ width: 32, height: 1.5, background: 'var(--amber)', display: 'inline-block' }} />
                </div>
                <h1 className="display-font" style={{ fontSize: 'clamp(26px, 4vw, 40px)', color: 'var(--char)', lineHeight: 1.1, marginTop: 4 }}>
                  What are you craving today?
                </h1>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search dishes…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                      borderRadius: 100, border: '1.5px solid var(--card-border)',
                      background: 'var(--card-bg)', color: 'var(--char)',
                      fontSize: 13, outline: 'none', width: 220,
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--amber)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,160,32,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Toggle */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer',
                  background: inStockOnly ? 'var(--green)' : 'var(--card-bg)',
                  border: `1.5px solid ${inStockOnly ? 'var(--green)' : 'var(--card-border)'}`,
                  borderRadius: 100, padding: '9px 16px',
                  transition: 'all 0.2s',
                }}>
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} style={{ display: 'none' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: inStockOnly ? '#7edaa0' : 'var(--muted)', transition: 'background 0.2s' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: inStockOnly ? '#fff' : 'var(--muted)', whiteSpace: 'nowrap', letterSpacing: 0.3 }}>
                    In stock only
                  </span>
                </label>
              </div>
            </div>

            {/* Category pills */}
            <div className="hide-scrollbar" style={{ overflowX: 'auto', paddingBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
                {["All", ...categories.map(c => c.id)].map((id) => {
                  const cat = categories.find(c => c.id === id);
                  const isAll = id === "All";
                  const active = activeCategory === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveCategory(id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 18px', borderRadius: 100,
                        border: `1.5px solid ${active ? 'var(--amber)' : 'var(--card-border)'}`,
                        background: active ? 'var(--amber)' : 'transparent',
                        color: active ? '#fff' : 'var(--char-soft)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        letterSpacing: 0.3, transition: 'all 0.18s',
                        fontFamily: 'DM Sans, sans-serif',
                        boxShadow: active ? '0 4px 14px rgba(232,160,32,0.35)' : 'none',
                      }}
                    >
                      {!isAll && <span style={{ fontSize: 15 }}>{cat?.emoji}</span>}
                      {isAll ? "All Foods" : cat?.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <main style={{ flex: 1, maxWidth: 1600, margin: '0 auto', width: '100%', padding: '28px 32px 48px' }}>
          {filteredFoods.length > 0 && (
            <p style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>
              {filteredFoods.length} dish{filteredFoods.length !== 1 ? 'es' : ''} found
            </p>
          )}

          {filteredFoods.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: 'var(--muted)' }}>
              <span style={{ fontSize: 64, marginBottom: 16 }}>🍽️</span>
              <p className="display-font" style={{ fontSize: 22, color: 'var(--char-soft)' }}>Nothing found</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Try a different category or search term</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
            }}>
              {filteredFoods.map((food, i) => (
                <FoodCard key={food.id} food={food} addToCart={addToCart} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function FoodCard({ food, addToCart, index }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleAdd = () => {
    if (food.isOutOfStock) return;
    addToCart(food);
    toast.success(`${food.name} added!`, { icon: "🛒" });
  };

  return (
    <div
      className="food-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'var(--card-bg)',
        border: `1.5px solid ${hovered ? 'var(--amber)' : 'var(--card-border)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: hovered
          ? '0 20px 48px rgba(26,20,16,0.13), 0 4px 12px rgba(232,160,32,0.1)'
          : '0 2px 8px rgba(26,20,16,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.34, 1.4, 0.64, 1)',
        animationDelay: `${Math.min(index * 0.05, 0.4)}s`,
        opacity: food.isOutOfStock ? 0.65 : 1,
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '72%', background: 'var(--parchment)', overflow: 'hidden' }}>
        {food.imageUrl ? (
          <Image
            src={food.imageUrl}
            alt={food.name}
            fill
            quality={100}
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 25vw"
            style={{ transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)', transform: hovered ? 'scale(1.07)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🍔</div>
        )}

        {/* Out of stock overlay */}
        {food.isOutOfStock && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(26,20,16,0.55)',
            backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{
              background: 'var(--char)', color: '#fff',
              fontSize: 10, fontWeight: 800, letterSpacing: 3,
              textTransform: 'uppercase', padding: '6px 16px', borderRadius: 100,
            }}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          className="display-font"
          style={{
            fontSize: 17, lineHeight: 1.2, color: 'var(--char)',
            marginBottom: 6, display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {food.name}
        </h3>

        {food.description && (
          <p style={{
            fontSize: 12, color: 'var(--muted)', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', flex: 1, marginBottom: 14,
          }}>
            {food.description}
          </p>
        )}

        {/* Price + CTA */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 14,
          borderTop: '1px dashed var(--card-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
        }}>
          <div>
            <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Price</span>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--char)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: 'Playfair Display, serif' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginRight: 2, fontFamily: 'DM Sans, sans-serif' }}>KSH</span>
              {food.price}
            </p>
          </div>

          <button
            onClick={handleAdd}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            disabled={food.isOutOfStock}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: food.isOutOfStock ? 'var(--parchment)' : (hovered ? 'var(--amber-deep)' : 'var(--amber)'),
              color: food.isOutOfStock ? 'var(--muted)' : '#fff',
              border: 'none', borderRadius: 100,
              padding: '10px 18px', fontSize: 12, fontWeight: 700,
              cursor: food.isOutOfStock ? 'not-allowed' : 'pointer',
              letterSpacing: 0.3,
              transform: pressed ? 'scale(0.95)' : 'scale(1)',
              transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: food.isOutOfStock ? 'none' : (hovered ? '0 6px 20px rgba(232,160,32,0.4)' : '0 3px 10px rgba(232,160,32,0.25)'),
              fontFamily: 'DM Sans, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {!food.isOutOfStock && (
              <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </svg>
            )}
            {food.isOutOfStock ? "Sold Out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}