"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, type Listing } from "./listings";
import AuthActions from "./AuthActions";
import { supabase } from "./supabase";


export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState<string[]>([]);
  const [memberListings, setMemberListings] = useState<Listing[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [condition, setCondition] = useState("All");
  const [place, setPlace] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  useEffect(() => {
    supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }).then(({ data }) => {
      if (!data) return;
      setMemberListings(data.map((item) => ({ id: item.id, title: item.title, price: item.price, category: item.category, place: item.place, condition: item.condition, image: item.image_url, description: item.description, seller: item.seller_name, memberSince: new Date(item.created_at).getFullYear().toString(), posted: "Recently", userId: item.user_id, isUserListing: true })));
    });
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: rows } = await supabase.from("saved_items").select("listing_id").eq("user_id", data.user.id);
      setSaved((rows ?? []).map((row) => row.listing_id));
    });
  }, []);
  const allListings = memberListings;
  const visible = useMemo(() => allListings.filter((item) => {
    const inCategory = category === "All" || item.category === category;
    const inSearch = `${item.title} ${item.category} ${item.place} ${item.condition}`.toLowerCase().includes(query.trim().toLowerCase());
    const inCondition = condition === "All" || item.condition === condition;
    const inPlace = place === "All" || item.place === place;
    const aboveMinimum = minPrice === "" || item.price >= Number(minPrice);
    const belowMaximum = maxPrice === "" || item.price <= Number(maxPrice);
    return inCategory && inSearch && inCondition && inPlace && aboveMinimum && belowMaximum;
  }), [allListings, query, category, condition, place, minPrice, maxPrice]);
  async function toggleSaved(id: string) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return window.location.assign("/auth?next=/#browse");
    const wasSaved = saved.includes(id);
    setSaved((current) => wasSaved ? current.filter((item) => item !== id) : [...current, id]);
    const result = wasSaved
      ? await supabase.from("saved_items").delete().eq("user_id", data.user.id).eq("listing_id", id)
      : await supabase.from("saved_items").insert({ user_id: data.user.id, listing_id: id });
    if (result.error) setSaved((current) => wasSaved ? [...current, id] : current.filter((item) => item !== id));
  }
  const clearFilters = () => { setCategory("All"); setCondition("All"); setPlace("All"); setMinPrice(""); setMaxPrice(""); };

  return <main>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Second Circle home"><span>2°</span> Second Circle</a>
      <nav aria-label="Main navigation"><a href="#browse">Browse</a><a href="#how">How it works</a></nav>
      <AuthActions />
    </header>
    <section className="hero" id="top">
      <div><p className="eyebrow">Local finds · longer lives</p><h1>Find what you need.<br/><em>Pass on what you don’t.</em></h1>
        <p className="intro">Find useful, characterful pieces near you and give pre-owned items a second circle.</p>
        <label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, categories or locations"/><button type="button">Search</button></label>
        <div className="trust"><span>✓ Local pickup</span><span>✓ Clear condition labels</span><span>✓ Safer meetup guidance</span></div>
      </div>
      <aside className="hero-card"><p>THIS WEEK</p><strong>128</strong><span>items found a new home</span><div className="orbit" aria-hidden="true"><i>lamp</i><i>bike</i><i>chair</i></div></aside>
    </section>
    <section className="catalog" id="browse">
      <div className="section-heading"><div><p className="eyebrow">Recently listed</p><h2>Fresh from the circle</h2></div><button className={`filter-button ${showFilters ? "open" : ""}`} onClick={() => setShowFilters((open) => !open)} aria-expanded={showFilters} aria-controls="advanced-filters">Filters <span>{showFilters ? "↑" : "↓"}</span></button></div>
      <div className="chips" aria-label="Filter by category">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}</div>
      {showFilters && <div className="filter-panel" id="advanced-filters">
        <label>Location<select value={place} onChange={(e) => setPlace(e.target.value)}><option>All</option>{[...new Set(allListings.map((item) => item.place))].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Condition<select value={condition} onChange={(e) => setCondition(e.target.value)}><option>All</option>{[...new Set(allListings.map((item) => item.condition))].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Minimum price<input type="number" min="0" step="100" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="No minimum"/><span>kr</span></label>
        <label>Maximum price<input type="number" min="0" step="100" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="No maximum"/><span>kr</span></label>
        <button className="clear-filters" onClick={clearFilters}>Clear filters</button>
      </div>}
      <p className="result-count">{visible.length} {visible.length === 1 ? "listing" : "listings"}</p>
      <div className="grid">{visible.map((item) => <article className="listing" key={item.id}>
        <a className="card-link" href={`/listing/${item.id}`} aria-label={`View details for ${item.title}`}></a>
        <div className="image-wrap"><img src={item.image} alt={item.title}/><span className="condition">{item.condition}</span><button className={`heart ${saved.includes(String(item.id)) ? "saved" : ""}`} onClick={() => toggleSaved(String(item.id))} aria-label={`${saved.includes(String(item.id)) ? "Remove" : "Save"} ${item.title}`}>{saved.includes(String(item.id)) ? "♥" : "♡"}</button></div>
        <div className="listing-copy"><div><h3>{item.title}</h3><p>{item.place} · Pickup</p></div><strong>{item.price.toLocaleString("nb-NO")} kr</strong></div>
      </article>)}</div>
      {visible.length === 0 && <div className="empty"><strong>No matches yet.</strong><span>Try another word or category.</span></div>}
    </section>
    <section className="how" id="how"><p className="eyebrow">How it works</p><h2>From listing to local pickup.</h2><div><article><b>01</b><h3>Discover nearby</h3><p>Search useful items and filter by category, condition and location.</p></article><article><b>02</b><h3>Check the details</h3><p>Review condition notes, seller information and pickup options.</p></article><article><b>03</b><h3>Meet with confidence</h3><p>Agree on a public meeting place and inspect the item before payment.</p></article></div></section>
    <footer><a className="brand" href="#top"><span>2°</span> Second Circle</a><p>© {new Date().getFullYear()} Rashika Tasnim Keya. All rights reserved.</p></footer>
  </main>;
}
