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

    /* ── Responsive grid: 2 cols on mobile, auto-fill on larger ── */
    .food-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (min-width: 640px) {
      .food-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
      }
    }

    /* ── Header padding: tight on mobile ── */
    .header-inner {
      max-width: 1600px;
      margin: 0 auto;
      padding: 10px 14px 0;
    }
    @media (min-width: 640px) {
      .header-inner {
        padding: 20px 32px 0;
      }
    }

    /* ── Main padding: tight on mobile ── */
    .main-inner {
      flex: 1;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
      padding: 14px 14px 48px;
    }
    @media (min-width: 640px) {
      .main-inner {
        padding: 28px 32px 48px;
      }
    }

    /* ── Title: smaller on mobile ── */
    .page-title {
      font-size: clamp(18px, 5vw, 40px);
      color: var(--char);
      line-height: 1.1;
      margin-top: 2px;
    }

    /* ── Top row: stack on mobile, row on desktop ── */
    .top-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
    @media (min-width: 640px) {
      .top-row {
        margin-bottom: 16px;
      }
    }

    /* ── Search: full width on mobile ── */
    .search-input {
      padding-left: 40px;
      padding-right: 16px;
      padding-top: 8px;
      padding-bottom: 8px;
      border-radius: 100px;
      border: 1.5px solid var(--card-border);
      background: var(--card-bg);
      color: var(--char);
      font-size: 13px;
      outline: none;
      width: 100%;
      font-family: 'DM Sans', sans-serif;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    @media (min-width: 640px) {
      .search-input {
        width: 220px;
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }

    /* ── Category pills row: tighter on mobile ── */
    .pills-row {
      overflow-x: auto;
      padding-bottom: 10px;
    }
    @media (min-width: 640px) {
      .pills-row {
        padding-bottom: 16px;
      }
    }

    /* ── Category label: smaller on mobile ── */
    .eyebrow-label {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--amber);
      font-weight: 600;
    }
    @media (min-width: 640px) {
      .eyebrow-label {
        font-size: 11px;
        letter-spacing: 4px;
      }
    }
  `}</style>
);

export default function StudentMenu() {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
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
    return matchesCategory && matchesSearch;
    // Note: no time filtering — all foods are shown, sorted by availability
  });

  // Smart empty state: figure out WHY the list is empty
  const getEmptyReason = () => {
    if (filteredFoods.length > 0) return null;

    const categoryFoods = foods.filter((food) =>
      activeCategory === "All" || food.categoryId === activeCategory
    );

    // Category exists but all items are not yet available (time-gated)
    const allTimeLocked = categoryFoods.length > 0 && categoryFoods.every((f) => !f.isCurrentlyAvailable);
    if (allTimeLocked) {
      // Find the earliest availableFrom across these foods
      const earliest = categoryFoods
        .map((f) => f.availableFrom)
        .filter(Boolean)
        .sort()[0];
      const catName = activeCategory === "All" ? null : categories.find(c => c.id === activeCategory)?.name;
      return { type: "time_locked", earliest, catName };
    }

    // Category has foods but search narrowed to zero
    if (categoryFoods.length > 0 && searchQuery) {
      return { type: "no_search_match", query: searchQuery };
    }

    // Category itself has no foods at all
    return { type: "empty_category" };
  };

  const emptyReason = getEmptyReason();

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
          <div className="header-inner">

            {/* Top row */}
            <div className="top-row">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="eyebrow-label">Campus Kitchen</span>
                  <span style={{ width: 24, height: 1.5, background: 'var(--amber)', display: 'inline-block' }} />
                </div>
                <h1 className="display-font page-title">
                  What are you craving?
                </h1>
              </div>

              {/* Search only */}
              <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: 320 }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search dishes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  onFocus={e => { e.target.style.borderColor = 'var(--amber)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,160,32,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="hide-scrollbar pills-row">
              <div style={{ display: 'flex', gap: 6, width: 'max-content' }}>
                {["All", ...categories.map(c => c.id)].map((id) => {
                  const cat = categories.find(c => c.id === id);
                  const isAll = id === "All";
                  const active = activeCategory === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveCategory(id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 14px', borderRadius: 100,
                        border: `1.5px solid ${active ? 'var(--amber)' : 'var(--card-border)'}`,
                        background: active ? 'var(--amber)' : 'transparent',
                        color: active ? '#fff' : 'var(--char-soft)',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        letterSpacing: 0.3, transition: 'all 0.18s',
                        fontFamily: 'DM Sans, sans-serif',
                        boxShadow: active ? '0 4px 14px rgba(232,160,32,0.35)' : 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {!isAll && <span style={{ fontSize: 13 }}>{cat?.emoji}</span>}
                      {isAll ? "All" : cat?.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <main className="main-inner">
          {filteredFoods.length > 0 && (
            <p style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>
              {filteredFoods.length} dish{filteredFoods.length !== 1 ? 'es' : ''} found
            </p>
          )}

          {filteredFoods.length === 0 ? (
            <SmartEmptyState reason={emptyReason} onClearSearch={() => setSearchQuery("")} onShowAll={() => setActiveCategory("All")} />
          ) : (
            <div className="food-grid">
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

function SmartEmptyState({ reason, onClearSearch, onShowAll }) {
  if (!reason) return null;

  const configs = {
    time_locked: {
      emoji: "⏰",
      title: reason?.catName
        ? `${reason.catName} isn't open yet`
        : "Nothing available right now",
      subtitle: reason?.earliest
        ? `Opens at ${reason.earliest} — check back soon`
        : "These items aren't available at this hour",
      action: { label: "Browse all foods", onClick: onShowAll },
    },
    no_search_match: {
      emoji: "🔍",
      title: "No dishes match that search",
      subtitle: `We couldn't find anything for "${reason?.query}"`,
      action: { label: "Clear search", onClick: onClearSearch },
    },
    empty_category: {
      emoji: "🍽️",
      title: "Nothing here yet",
      subtitle: "This category has no items available right now",
      action: { label: "Browse all foods", onClick: onShowAll },
    },
  };

  const cfg = configs[reason.type] ?? configs.empty_category;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
    }}>
      {/* Icon bubble */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        background: 'var(--parchment)',
        border: '2px dashed var(--card-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38, marginBottom: 20,
      }}>
        {cfg.emoji}
      </div>

      <p className="display-font" style={{ fontSize: 20, color: 'var(--char-soft)', marginBottom: 8, lineHeight: 1.2 }}>
        {cfg.title}
      </p>
      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 260, marginBottom: 24 }}>
        {cfg.subtitle}
      </p>

      {/* CTA button */}
      <button
        onClick={cfg.action.onClick}
        style={{
          padding: '10px 22px', borderRadius: 100,
          border: '1.5px solid var(--amber)',
          background: 'transparent', color: 'var(--amber-deep)',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          letterSpacing: 0.4, fontFamily: 'DM Sans, sans-serif',
          transition: 'all 0.18s',
        }}
        onMouseEnter={e => { e.target.style.background = 'var(--amber)'; e.target.style.color = '#fff'; }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--amber-deep)'; }}
      >
        {cfg.action.label}
      </button>
    </div>
  );
}

function FoodCard({ food, addToCart, index }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleAdd = () => {
    if (food.isOutOfStock || !food.isCurrentlyAvailable) return;
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
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: hovered
          ? '0 20px 48px rgba(26,20,16,0.13), 0 4px 12px rgba(232,160,32,0.1)'
          : '0 2px 8px rgba(26,20,16,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.34, 1.4, 0.64, 1)',
        animationDelay: `${Math.min(index * 0.05, 0.4)}s`,
        opacity: (food.isOutOfStock || !food.isCurrentlyAvailable) ? 0.65 : 1,
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
            sizes="(max-width: 640px) 50vw, 25vw"
            style={{ transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)', transform: hovered ? 'scale(1.07)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🍔</div>
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
              fontSize: 9, fontWeight: 800, letterSpacing: 3,
              textTransform: 'uppercase', padding: '5px 12px', borderRadius: 100,
            }}>
              Sold Out
            </span>
          </div>
        )}

        {/* Not yet available overlay */}
        {!food.isOutOfStock && !food.isCurrentlyAvailable && food.availableFrom && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(26,20,16,0.42)',
            backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{
              background: 'var(--amber-deep)', color: '#fff',
              fontSize: 9, fontWeight: 800, letterSpacing: 2,
              textTransform: 'uppercase', padding: '5px 12px', borderRadius: 100,
              whiteSpace: 'nowrap',
            }}>
              Available from {food.availableFrom}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          className="display-font"
          style={{
            fontSize: 14, lineHeight: 1.2, color: 'var(--char)',
            marginBottom: 4, display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {food.name}
        </h3>

        {food.description && (
          <p style={{
            fontSize: 11, color: 'var(--muted)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', flex: 1, marginBottom: 10,
          }}>
            {food.description}
          </p>
        )}

        {/* Price + CTA */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 10,
          borderTop: '1px dashed var(--card-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8
        }}>
          <div>
            <span style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Price</span>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--char)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: 'Playfair Display, serif' }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginRight: 2, fontFamily: 'DM Sans, sans-serif' }}>KSH</span>
              {food.price}
            </p>
          </div>

          <button
            onClick={handleAdd}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            disabled={food.isOutOfStock || !food.isCurrentlyAvailable}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              background: food.isOutOfStock ? 'var(--parchment)' : (hovered ? 'var(--amber-deep)' : 'var(--amber)'),
              color: food.isOutOfStock ? 'var(--muted)' : '#fff',
              border: 'none', borderRadius: 100,
              padding: '8px 14px', fontSize: 11, fontWeight: 700,
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
              <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </svg>
            )}
            {food.isOutOfStock ? "Sold Out" : !food.isCurrentlyAvailable ? "Soon" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}