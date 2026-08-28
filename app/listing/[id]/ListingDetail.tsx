"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Listing } from "../../listings";
import { supabase } from "../../supabase";

export default function ListingDetail({ id }: { id: string }) {
  const [item, setItem] = useState<Listing | null | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: row } = await supabase.from("saved_items").select("listing_id").eq("user_id", data.user.id).eq("listing_id", id).maybeSingle();
        setSaved(Boolean(row));
      }
    });
    supabase.from("listings").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (!data) return setItem(null);
      setItem({ id: data.id, title: data.title, price: data.price, category: data.category, place: data.place, condition: data.condition, image: data.image_url, description: data.description, seller: data.seller_name, memberSince: new Date(data.created_at).getFullYear().toString(), posted: "Recently", userId: data.user_id, isUserListing: true });
    });
  }, [id]);

  async function toggleSaved() {
    if (!user) return window.location.assign(`/auth?next=/listing/${id}`);
    const next = !saved;
    setSaved(next);
    const result = next
      ? await supabase.from("saved_items").insert({ user_id: user.id, listing_id: id })
      : await supabase.from("saved_items").delete().eq("user_id", user.id).eq("listing_id", id);
    if (result.error) setSaved(!next);
  }

  if (item === undefined) return <main className="detail-shell"><p>Loading listing…</p></main>;
  if (!item) return <main className="detail-shell"><a className="back-link" href="/#browse">← Back to listings</a><section className="not-found"><h1>Listing not found</h1><p>This item may no longer be available.</p></section></main>;
  const ownListing = Boolean(user && item.userId === user.id);
  const contactHref = user ? `/contact/${item.id}` : `/auth?next=/contact/${item.id}`;

  return <main><header className="topbar detail-topbar"><a className="brand" href="/" aria-label="Second Circle home"><span>2°</span> Second Circle</a><a className="back-link top-back" href="/#browse">← Back to browse</a></header><div className="detail-shell">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href={`/category/${item.category.toLowerCase()}`}>{item.category}</a><span>/</span><strong>{item.title}</strong></nav>
    <section className="detail-grid"><div className="detail-image"><img src={item.image} alt={item.title}/><span>{item.condition}</span></div><aside className="detail-panel"><p className="detail-meta">{item.category} · Posted {item.posted}</p><h1>{item.title}</h1><strong className="detail-price">{item.price.toLocaleString("nb-NO")} kr</strong><p className="detail-place">⌖ {item.place} · Local pickup</p>
      <div className="detail-actions">{ownListing ? <button className="contact-button disabled" disabled>Your listing</button> : <a className="contact-button contact-link" href={contactHref}>Contact seller</a>}<button className={`save-button ${saved ? "saved" : ""}`} onClick={toggleSaved}>{saved ? "♥ Saved" : "♡ Save"}</button></div>
      <div className="seller-card"><span className="avatar">{item.seller.charAt(0)}</span><div><b>{item.seller}</b><p>Member since {item.memberSince} · Usually responds within a day</p></div><span className="verified">✓ Verified</span></div></aside></section>
    <section className="detail-lower"><article><p className="eyebrow">About the item</p><h2>Description</h2><p>{item.description}</p><dl><div><dt>Condition</dt><dd>{item.condition}</dd></div><div><dt>Handover</dt><dd>Pickup in {item.place}</dd></div><div><dt>Payment</dt><dd>Agree directly with seller</dd></div></dl></article><aside className="safety-card"><span>◎</span><div><h3>Meet safely</h3><p>Choose a public place, inspect the item before paying, and tell someone where you are meeting.</p></div></aside></section>
  </div><footer><a className="brand" href="/"><span>2°</span> Second Circle</a><p>© {new Date().getFullYear()} Rashika Tasnim Keya. All rights reserved.</p></footer></main>;
}
