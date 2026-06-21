"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Flame, Leaf, Star, UtensilsCrossed, ChefHat, Phone, RotateCcw } from "lucide-react";
import { MenuItem } from "@/lib/menu-types";


type DietFilter = "ALL" | "VEG" | "EGG" | "NON-VEG";

// TODO: replace with the restaurant's real number before going live
const WAITER_PHONE = "+91 91588 99631";

const DIET_OPTIONS: { key: DietFilter; label: string; activeBg: string }[] = [
  { key: "ALL", label: "All", activeBg: "#1a120b" },
  { key: "VEG", label: "Veg", activeBg: "#16a34a" },
  { key: "EGG", label: "Egg", activeBg: "#ca8a04" },
  { key: "NON-VEG", label: "Non-Veg", activeBg: "#dc2626" },
];

// ── Photos mapped by dish name ───────────────────────────────
const EXACT_DISH_PHOTOS: Record<string, string> = {
  "butter chicken": "butter-chicken.jpg",
  "butter masala chicken": "butter-masala-chicken.jpg",
  "paneer butter masala": "paneer-butter-masala.jpg",
  "paneer makhani": "paneer-makhani.jpg",
  "palak paneer": "palak-paneer.jpg",
  "paneer tikka": "paneer-tikka.jpg",
  "paneer haryali tikka": "paneer-haryali-tikka.jpg",
  "paneer reshmi tikka": "paneer-reshmi-tikka.jpg",
  "paneer malai tikka": "paneer-malai-tikka.jpg",
  "paneer angara tikka": "paneer-angara-tikka.jpg",
  "chicken tikka": "chicken-tikka.jpg",
  "chicken reshmi tikka": "chicken-reshmi-tikka.jpg",
  "chicken boti tikka": "chicken-boti-tikka.jpg",
  "chicken bonanza tikka": "chicken-bonanza-tikka.jpg",
  "chicken angara tikka": "chicken-angara-tikka.jpg",
  "chicken afghani tikka": "chicken-afghani-tikka.jpg",
  "chicken hariyali tikka": "chicken-hariyali-tikka.jpg",
  "tandoori chicken": "tandoori-chicken.jpg",
  "chicken biryani": "chicken-biryani.jpg",
  "chicken hyderabadi dum biryani": "chicken-hyderabadi-biryani.jpg",
  "veg biryani": "veg-biryani.jpg",
  "dum veg biryani": "dum-veg-biryani.jpg",
  "paneer tikka biryani": "paneer-tikka-biryani.jpg",
  "veg hyderabadi biryani": "veg-hyderabadi-biryani.jpg",
  "mutton biryani": "mutton-biryani.jpg",
  "dal makhani": "dal-makhani.jpg",
  "dal fry": "dal-fry.jpg",
  "dal tadka": "dal-tadka.jpg",
  "malai kofta": "malai-kofta.jpg",
  "mughlai malai kofta": "mughlai-malai-kofta.jpg",
  "chicken seekh kebab": "chicken-seekh-kebab.jpg",
  "mutton seekh kebab": "mutton-seekh-kebab.jpg",
  "hara bhara": "hara-bhara-kebab.jpg",
  "naan": "naan.jpg",
  "butter naan": "butter-naan.jpg",
  "garlic naan": "garlic-naan.jpg",
  "cheese garlic naan": "cheese-garlic-naan.jpg",
  "finger chips": "finger-chips.jpg",
  "onion pakora": "onion-pakora.jpg",
  "mix pakora": "mix-pakora.jpg",
  "aloo pakora": "aloo-pakora.jpg",
  "paneer pakora": "paneer-pakora.jpg",
  "paneer chilli": "paneer-chilli.jpg",
  "gobi chilli": "gobi-chilli.jpg",
  "chicken chilli": "chicken-chilli.jpg",
  "fish fry": "fish-fry.jpg",
  "fish masala": "fish-masala.jpg",
  "lassi": "lassi.jpg",
  "sweet corn soup": "sweet-corn-soup.jpg",
  "chicken sweet corn": "chicken-sweet-corn-soup.jpg",
  "tomato soup": "tomato-soup.jpg",
  "hot & sour soup": "hot-and-sour-soup.jpg",
  "chicken hot & sour soup": "hot-and-sour-soup.jpg",
  "egg biryani": "egg-biryani.jpg",
  "chicken tikka masala": "chicken-tikka-masala.jpg",
  "shahi paneer": "shahi-paneer.jpg",
  "masala papad": "masala-papad.jpg",
  "roast papad": "roast-papad.jpg",
  "chana masala": "chana-masala.jpg",
  "veg pulao": "veg-pulao.jpg",
  "jeera rice": "jeera-rice.jpg",
  "garlic rice": "garlic-rice.jpg",
  "chicken curry": "chicken-curry.jpg",
  "chicken masala": "chicken-masala.jpg",
  "mutton curry": "mutton-curry.jpg",
  "mutton masala": "mutton-masala.jpg",
  "mutton bhuna": "mutton-bhuna.jpg",
};

const PHOTO_KEYWORDS: { keywords: string[]; image: string }[] = [
  { keywords: ["paneer haryali"], image: "paneer-haryali-tikka.jpg" },
  { keywords: ["paneer reshmi"], image: "paneer-reshmi-tikka.jpg" },
  { keywords: ["paneer malai"], image: "paneer-malai-tikka.jpg" },
  { keywords: ["chicken reshmi"], image: "chicken-reshmi-tikka.jpg" },
  { keywords: ["chicken boti"], image: "chicken-boti-tikka.jpg" },
  { keywords: ["chicken bonanza"], image: "chicken-bonanza-tikka.jpg" },
  { keywords: ["chicken angara"], image: "chicken-angara-tikka.jpg" },
  { keywords: ["chicken afghani"], image: "chicken-afghani-tikka.jpg" },
  { keywords: ["chicken hariyali"], image: "chicken-hariyali-tikka.jpg" },
  { keywords: ["mutton seekh"], image: "mutton-seekh-kebab.jpg" },
  { keywords: ["chicken seekh"], image: "chicken-seekh-kebab.jpg" },
  { keywords: ["chicken hyderabadi"], image: "chicken-hyderabadi-biryani.jpg" },
  { keywords: ["veg hyderabadi"], image: "veg-hyderabadi-biryani.jpg" },
  { keywords: ["dum veg"], image: "dum-veg-biryani.jpg" },
  { keywords: ["paneer tikka biryani"], image: "paneer-tikka-biryani.jpg" },
  { keywords: ["mutton bhuna"], image: "mutton-bhuna.jpg" },
  { keywords: ["hot & sour"], image: "hot-and-sour-soup.jpg" },
];

function normalizeDishName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function getPhoto(name: string): string | null {
  const normalizedName = normalizeDishName(name);


  const exactImage = EXACT_DISH_PHOTOS[normalizedName];
  if (exactImage) {
    return `/menu_images/${exactImage}`;
  }

  const sortedKeywords = [...PHOTO_KEYWORDS].sort((a, b) => {
    const maxLenA = Math.max(...a.keywords.map((k) => k.length));
    const maxLenB = Math.max(...b.keywords.map((k) => k.length));
    return maxLenB - maxLenA;
  });

  for (const entry of sortedKeywords) {
    if (entry.keywords.some((kw) => normalizedName.includes(kw))) {
      return `/menu_images/${entry.image}`;
    }
  }

  return null;
}

// ── Category hero images ──────────────────────────────────────
const CATEGORY_IMAGES: Record<string, string> = {
  "Soups": "/menu_images/tomato-soup.jpg",
  "Papad & Fry Items": "/menu_images/finger-chips.jpg",
  "Pakora": "/menu_images/onion-pakora.jpg",
  "Salad & Mastani": "/menu_images/lassi.jpg",
  "Tandoori Paneer Tikka": "/menu_images/paneer-tikka.jpg",
  "Veg Starters Chinese": "/menu_images/gobi-chilli.jpg",
  "Paneer Main Course": "/menu_images/paneer-butter-masala.jpg",
  "Veg Main Course": "/menu_images/chana-masala.jpg",
  "Veg Kofta": "/menu_images/malai-kofta.jpg",
  "Dal & Rice": "/menu_images/dal-makhani.jpg",
  "Non-Veg Pakoda & Starters": "/menu_images/chicken-tikka.jpg",
  "Tandoori Non-Veg": "/menu_images/tandoori-chicken.jpg",
  "Chinese Non-Veg": "/menu_images/chicken-chilli.jpg",
  "Biryani": "/menu_images/chicken-biryani.jpg",
  "Non-Veg Main Course": "/menu_images/butter-chicken.jpg",
  "Non-Veg Handi": "/menu_images/mutton-curry.jpg",
  "Breads": "/menu_images/naan.jpg",
  "Make Your Own": "/menu_images/mutton-curry.jpg",
};

const BADGE_STYLES: Record<string, { style: string; emoji: string }> = {
  "Guest's Fav":   { style: "bg-amber-100 text-amber-800 border border-amber-200",    emoji: "⭐" },
  "Chef's Special":{ style: "bg-purple-100 text-purple-800 border border-purple-200", emoji: "👨‍🍳" },
  "NEW":           { style: "bg-blue-100 text-blue-700 border border-blue-200",        emoji: "✨" },
  "Spicy 🌶":      { style: "bg-red-100 text-red-700 border border-red-200",           emoji: "" },
  "Spicy":         { style: "bg-red-100 text-red-700 border border-red-200",           emoji: "🌶" },
  "Sweet":         { style: "bg-pink-100 text-pink-700 border border-pink-200",        emoji: "🍯" },
  "Sizzler":       { style: "bg-orange-100 text-orange-700 border border-orange-200",  emoji: "🔥" },
};

function parseBadges(desc: string): string[] {
  if (!desc) return [];
  return desc.split(/[·,]/).map((s) => s.trim()).filter(Boolean);
}

function DietDot({ type }: { type: string }) {
  const map: Record<string, { border: string; fill: string; label: string }> = {
    VEG:       { border: "border-green-600",  fill: "bg-green-600",  label: "Veg" },
    EGG:       { border: "border-yellow-500", fill: "bg-yellow-500", label: "Egg" },
    "NON-VEG": { border: "border-red-600",    fill: "bg-red-600",    label: "Non-Veg" },
  };
  const d = map[type] ?? { border: "border-gray-400", fill: "bg-gray-400", label: type };
  return (
    <span className={`shrink-0 w-4 h-4 rounded-sm border-2 grid place-items-center ${d.border}`} title={d.label}>
      <span className={`w-2 h-2 rounded-full ${d.fill}`} />
    </span>
  );
}

// ── Item card: with or without photo ─────────────────────────
function ItemCard({ item }: { item: MenuItem }) {
  const photo = getPhoto(item.name);
  const badges = parseBadges(item.description);

  if (photo) {
    return (
      <div className="flex gap-4 py-4 px-4 border-b border-espresso/5 last:border-0 group hover:bg-white/70 transition-colors rounded-2xl mx-1 my-1">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5">
          <Image
            src={photo}
            alt={item.name}
            fill
            sizes="112px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <DietDot type={item.dietType} />
              <p className="font-semibold text-sm sm:text-base leading-snug text-espresso">{item.name}</p>
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 ml-6">
                {badges.map((b) => {
                  const s = BADGE_STYLES[b];
                  return (
                    <span key={b} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s?.style ?? "bg-espresso/10 text-espresso/70"}`}>
                      {s?.emoji ? `${s.emoji} ` : ""}{b}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-chili font-bold text-base sm:text-lg">{item.price}</span>
          </div>
        </div>
      </div>
    );
  }

  // No photo — compact row
  return (
    <div className="flex items-start justify-between gap-3 py-3.5 px-4 border-b border-espresso/5 last:border-0 hover:bg-white/70 transition-colors rounded-2xl mx-1 my-1">
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <DietDot type={item.dietType} />
        <div className="min-w-0">
          <p className="font-semibold text-sm sm:text-base leading-snug text-espresso">{item.name}</p>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {badges.map((b) => {
                const s = BADGE_STYLES[b];
                return (
                  <span key={b} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s?.style ?? "bg-espresso/10 text-espresso/70"}`}>
                    {s?.emoji ? `${s.emoji} ` : ""}{b}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <span className="text-chili font-bold text-base whitespace-nowrap shrink-0 pt-0.5">{item.price}</span>
    </div>
  );
}

// ── Category section with hero banner ────────────────────────
function CategorySection({ cat, items }: { cat: string; items: MenuItem[] }) {
  const heroImg = CATEGORY_IMAGES[cat];
  return (
    <section className="mb-0">
      {/* Category banner */}
      <div className="relative rounded-[2rem] overflow-hidden h-32 sm:h-40 mb-6 shadow-lg border border-espresso/10">
        {heroImg ? (
          <>
            <Image src={heroImg} alt={cat} fill className="object-cover" sizes="800px" />
            <div className="absolute inset-0 bg-gradient-to-r from-espresso/95 via-espresso/70 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso-l to-chili/40" />
        )}
        <div className="absolute inset-0 flex items-center px-8">
          <h2 className="font-[family-name:var(--font-display)] text-cream text-3xl sm:text-4xl drop-shadow-lg font-bold">
            {cat}
          </h2>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-[1.75rem] border border-espresso/8 shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-espresso/8" style={{ background: "rgba(26,18,11,0.02)" }}>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(26,18,11,0.5)" }}>
            {items.length} {items.length === 1 ? 'Dish' : 'Dishes'}
          </span>
        </div>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      <br></br>
    </section>
  );
}

// ── Main component ────────────────────────────────────────────
export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<DietFilter>("ALL");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [logoError, setLogoError] = useState(false);

  // Filter bar collapses into a small pill once the user scrolls past the
  // hero, and pops back open the moment they scroll back near the top.
  // Tapping the pill (or the collapse handle) overrides it manually.
  const [pastHero, setPastHero] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  useEffect(() => {
    const COLLAPSE_AT = 160; // px scrolled before the bar offers to collapse — tweak to taste
    const handleScroll = () => {
      const past = window.scrollY > COLLAPSE_AT;
      setPastHero((prevPast) => {
        if (past !== prevPast) setFiltersExpanded(!past);
        return past;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadMenu = () => {
    setLoading(true);
    setLoadError(false);
    fetch("/api/admin/menu")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load menu");
        return r.json();
      })
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!item.available) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) return false;
      if (diet !== "ALL" && item.dietType !== diet) return false;
      if (activeCategory !== "ALL" && item.category !== activeCategory) return false;
      return true;
    });
  }, [items, query, diet, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    filtered.forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    });
    return map;
  }, [filtered]);

  // Popular picks (items with "Guest's Fav" in description, max 6)
  const popular = useMemo(
    () => items.filter((i) => i.available && i.description.includes("Guest's Fav")).slice(0, 6),
    [items]
  );

  // How many available dishes fall under each diet type, given the
  // current search + category filters — powers the counts on the slider.
  const dietCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inScope = items.filter((item) => {
      if (!item.available) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) return false;
      if (activeCategory !== "ALL" && item.category !== activeCategory) return false;
      return true;
    });
    const counts: Record<DietFilter, number> = { ALL: inScope.length, VEG: 0, EGG: 0, "NON-VEG": 0 };
    inScope.forEach((item) => {
      counts[item.dietType] = (counts[item.dietType] ?? 0) + 1;
    });
    return counts;
  }, [items, query, activeCategory]);

  // How many available dishes are in each category, given the current diet filter.
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      if (!item.available) return;
      if (diet !== "ALL" && item.dietType !== diet) return;
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    });
    return map;
  }, [items, diet]);

  const activeDietIndex = DIET_OPTIONS.findIndex((opt) => opt.key === diet);
  const hasActiveFilters = query !== "" || diet !== "ALL" || activeCategory !== "ALL";
  const activeFilterCount = (query.trim() !== "" ? 1 : 0) + (diet !== "ALL" ? 1 : 0) + (activeCategory !== "ALL" ? 1 : 0);

  const clearFilters = () => {
    setQuery("");
    setDiet("ALL");
    setActiveCategory("ALL");
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(circle at top, #fff7ee 0%, #fdf6ec 48%, #f8efe5 100%)" }}>

      {/* ── HERO HEADER ── */}
      <header className="px-4 pt-8 pb-6 sm:pt-10 sm:pb-8">
        <div className="max-w-5xl mx-auto rounded-[2.25rem] border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_20px_60px_rgba(26,18,11,0.08)] px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex justify-center mb-4 sm:mb-6">
            {/* Drop your logo file in the project's /public folder (e.g. /public/logo.png) — the src below just points to it */}
            <div className="flex justify-center mb-4 sm:mb-6">
  <div
    className="relative
    w-[260px]
    h-[120px]
    rounded-3xl
    overflow-hidden"
    style={{ background: "#1a120b" }}
  >
    {!logoError ? (
      <Image
        src="/logo.png"
        alt="Chandra Hotel & Restaurant logo"
        width={140}
        height={140}
        priority
        className="w-full h-full object-cover"
        onError={() => setLogoError(true)}
      />
    ) : (
      <span className="text-2xl font-bold" style={{ color: "#d4af37" }}>CH</span>
    )}
  </div>
</div>
          </div>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl mb-3" style={{ color: "#1a120b" }}>
              Chandra Hotel &amp; Restaurant
            </h1>
            <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(26,18,11,0.62)" }}>
              Freshly prepared dishes, thoughtful service, and a menu designed for easy browsing.
            </p>

            <a
              href={`tel:${WAITER_PHONE.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 mt-5 text-xs font-semibold rounded-full px-4 py-2.5 border transition-colors hover:bg-white"
              style={{ color: "#c1440e", borderColor: "rgba(193,68,14,0.35)", background: "rgba(255,255,255,0.6)" }}
            >
              <Phone size={14} /> Call for more info — {WAITER_PHONE}
            </a>

            {/* Diet legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6">
              {[
                { type: "VEG", color: "#16a34a", label: "Veg" },
                { type: "EGG", color: "#ca8a04", label: "Egg" },
                { type: "NON-VEG", color: "#dc2626", label: "Non-Veg" },
              ].map(({ type, color, label }) => (
                <span key={type} className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold shadow-sm" style={{ background: "rgba(255,255,255,0.85)", color: "rgba(26,18,11,0.75)" }}>
                  <span className="w-3.5 h-3.5 rounded-full border-2 grid place-items-center" style={{ borderColor: color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── STICKY FILTERS ── */}
      {/* Collapses into a small pill once you scroll past the hero (mobile gets its space back), */}
      {/* and re-expands on scroll-to-top or on tap — same pattern as Swiggy/Zomato's search bar. */}
      <div
        className="sticky top-0 z-30 px-4 transition-[padding] duration-300 ease-out"
        style={{
          paddingTop: filtersExpanded ? "1rem" : "0.5rem",
          paddingBottom: filtersExpanded ? "1rem" : "0.5rem",
          background: "rgba(253,246,236,0.88)",
          backdropFilter: "blur(18px)",
          borderBottom: filtersExpanded ? "1px solid rgba(193,68,14,0.08)" : "1px solid transparent",
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Collapsed pill */}
          <button
            onClick={() => setFiltersExpanded(true)}
            aria-hidden={filtersExpanded}
            className="w-full flex items-center justify-between gap-3 rounded-full border bg-white/90 shadow-sm transition-all duration-300 ease-out overflow-hidden"
            style={{
              borderColor: "rgba(193,68,14,0.16)",
              maxHeight: filtersExpanded ? "0px" : "48px",
              opacity: filtersExpanded ? 0 : 1,
              padding: filtersExpanded ? "0 1.25rem" : "0.75rem 1.25rem",
              pointerEvents: filtersExpanded ? "none" : "auto",
            }}
          >
            <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "rgba(26,18,11,0.8)" }}>
              <Search size={16} style={{ color: "rgba(193,68,14,0.55)" }} />
              {hasActiveFilters ? "Filters applied" : "Search & filter"}
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 grid place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: "#c1440e" }}>
                  {activeFilterCount}
                </span>
              )}
            </span>
            <span className="text-xs font-semibold shrink-0" style={{ color: "#c1440e" }}>Tap to open</span>
          </button>

          {/* Expanded filter card */}
          <div
            aria-hidden={!filtersExpanded}
            className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/55 shadow-[0_12px_36px_rgba(26,18,11,0.06)] transition-all duration-300 ease-out overflow-hidden"
            style={{
              maxHeight: filtersExpanded ? "640px" : "0px",
              opacity: filtersExpanded ? 1 : 0,
              padding: filtersExpanded ? "1rem 1.25rem" : "0 1.25rem",
            }}
          >
            {pastHero && (
              <button
                onClick={() => setFiltersExpanded(false)}
                className="self-end -mb-2 inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: "rgba(26,18,11,0.4)" }}
              >
                Collapse ✕
              </button>
            )}

            {/* Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(193,68,14,0.45)" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes, ingredients..."
                aria-label="Search the menu"
                className="w-full rounded-full border bg-white/90 text-sm focus:outline-none pl-11 pr-10 py-3 font-medium transition-all shadow-sm"
                style={{ borderColor: query ? "rgba(193,68,14,0.28)" : "rgba(193,68,14,0.12)" }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center rounded-full text-xs font-bold"
                  style={{ background: "rgba(26,18,11,0.08)", color: "rgba(26,18,11,0.5)" }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Diet Filter — true sliding toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider uppercase px-1" style={{ color: "rgba(26,18,11,0.52)" }}>
                Diet Preference
              </label>
              <div
                role="tablist"
                aria-label="Filter by diet"
                className="relative grid p-1.5 rounded-full"
                style={{ background: "rgba(26,18,11,0.04)", gridTemplateColumns: `repeat(${DIET_OPTIONS.length}, minmax(0, 1fr))` }}
              >
                {/* Sliding highlight — this is the actual slider, animated with CSS transitions */}
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 bottom-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{
                    left: `calc(${(activeDietIndex / DIET_OPTIONS.length) * 100}% + 6px)`,
                    width: `calc(${100 / DIET_OPTIONS.length}% - 12px)`,
                    background: DIET_OPTIONS[activeDietIndex]?.activeBg ?? "#1a120b",
                    boxShadow: "0 10px 22px rgba(26,18,11,0.18)",
                  }}
                />
                {DIET_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    role="tab"
                    aria-selected={diet === opt.key}
                    onClick={() => setDiet(opt.key)}
                    className="relative z-10 font-semibold px-2 py-2.5 rounded-full text-xs sm:text-sm transition-colors duration-200"
                    style={{ color: diet === opt.key ? "white" : "rgba(26,18,11,0.6)" }}
                  >
                    {opt.label}
                    <span className="ml-1 font-normal opacity-80">({dietCounts[opt.key]})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter - Dropdown */}
            <div className="flex flex-col gap-2">
              <label htmlFor="category-filter" className="text-xs font-bold tracking-wider uppercase px-1" style={{ color: "rgba(26,18,11,0.52)" }}>
                Category
              </label>
              <div className="relative">
                <select
                  id="category-filter"
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full appearance-none rounded-full border bg-white/90 px-4 py-3 pr-11 font-medium text-sm focus:outline-none transition-all shadow-sm"
                  style={{
                    borderColor: activeCategory !== "ALL" ? "rgba(193,68,14,0.24)" : "rgba(193,68,14,0.10)",
                    color: "rgba(26,18,11,0.82)"
                  }}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({categoryCounts.get(cat) ?? 0})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(26,18,11,0.35)" }}>⌄</span>
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="self-start inline-flex items-center gap-1.5 text-xs font-semibold px-1"
                style={{ color: "#c1440e" }}
              >
                <RotateCcw size={13} /> Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* ── POPULAR PICKS (only when no filter active) ── */}
        {!loading && !loadError && popular.length > 0 && !hasActiveFilters && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <Star size={24} style={{ color: "#d4af37" }} />
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold" style={{ color: "#1a120b" }}>
                Guest Favourites
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {popular.map((item) => {
                const photo = getPhoto(item.name);
                return (
                  <div key={item.id} className="rounded-xl overflow-hidden shadow-lg border border-espresso/5 group bg-white hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-32 sm:h-40">
                      {photo ? (
                        <Image src={photo} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="200px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1a120b,#c1440e22)" }}>
                          <UtensilsCrossed size={32} style={{ color: "rgba(212,175,55,0.6)" }} />
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5">
                        <DietDot type={item.dietType} />
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold">⭐ Fav</div>
                    </div>
                    <div className="px-3 py-3">
                      <p className="text-sm font-semibold leading-snug line-clamp-2 mb-2" style={{ color: "#1a120b" }}>{item.name}</p>
                      <p className="text-sm font-bold" style={{ color: "#c1440e" }}>{item.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── MENU SECTIONS ── */}
        {loading ? (
          <div className="text-center py-24" style={{ color: "rgba(26,18,11,0.35)" }}>
            <ChefHat size={48} className="mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-semibold">Loading menu…</p>
          </div>
        ) : loadError ? (
          <div className="text-center py-24 rounded-2xl" style={{ background: "rgba(193,68,14,0.08)" }}>
            <UtensilsCrossed size={48} className="mx-auto mb-4" style={{ color: "rgba(193,68,14,0.3)" }} />
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2" style={{ color: "#1a120b" }}>Could not load the menu</p>
            <p className="text-base mb-5" style={{ color: "rgba(26,18,11,0.6)" }}>Check your connection and try again.</p>
            <button
              onClick={loadMenu}
              className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-full text-white"
              style={{ background: "#c1440e" }}
            >
              <RotateCcw size={14} /> Try again
            </button>
          </div>
        ) : grouped.size === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ background: "rgba(193,68,14,0.08)" }}>
            <UtensilsCrossed size={48} className="mx-auto mb-4" style={{ color: "rgba(193,68,14,0.3)" }} />
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2" style={{ color: "#1a120b" }}>No dishes found</p>
            <p className="text-base" style={{ color: "rgba(26,18,11,0.6)" }}>Try a different search or adjust your filters.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-full mt-5"
                style={{ background: "white", color: "#c1440e", border: "1px solid rgba(193,68,14,0.25)" }}
              >
                <RotateCcw size={14} /> Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([cat, catItems]) => (
              <CategorySection key={cat} cat={cat} items={catItems} />
            ))}
          </div>
        )}

        {/* ── FOOTER NOTES ── */}
        <div className="mt-12 rounded-[2rem] p-6 text-sm space-y-2.5" style={{ background: "linear-gradient(135deg, rgba(26,18,11,0.04), rgba(193,68,14,0.04))", border: "1px solid rgba(193,68,14,0.08)" }}>
          <div className="flex items-center gap-3 mb-4">
            <Flame size={20} style={{ color: "#c1440e" }} />
            <p className="font-bold text-lg" style={{ color: "#1a120b" }}>Please Note</p>
            <Leaf size={20} style={{ color: "#4a5d23" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ color: "rgba(26,18,11,0.6)" }}>
            <p>✓ No outside food or beverages allowed</p>
            <p>✓ Extra gravy charged separately</p>
            <p>✓ Parcel charges: ₹10 per box</p>
            <p>✓ Minimum 10-min wait for fresh prep</p>
            <p>✓ Please notify staff of allergies</p>
            <p>✓ Liquor is not allowed only in the family restaurant</p>
          </div>
          <p className="pt-2 text-center font-bold" style={{ color: "#c1440e" }}>🍮 A complimentary sweet is on us!</p>
        </div>
      </main>
    </div>
  );
}
