"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

type SavedListing = { id: string; title: string; price: number; place: string; image_url: string; condition: string };

export default function AccountPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [listingCount, setListingCount] = useState(0);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  useEffect(() => { supabase.auth.getUser().then(async ({ data }) => { if (!data.user) window.location.replace("/auth"); else { setUser(data.user); const [{ count }, { data: saves }] = await Promise.all([supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", data.user.id), supabase.from("saved_items").select("listings(id,title,price,place,image_url,condition)").eq("user_id", data.user.id)]); setListingCount(count ?? 0); setSavedListings((saves ?? []).flatMap((row: any) => row.listings ? [row.listings] : [])); } }); }, []);
  async function signOut() { await supabase.auth.signOut(); window.location.assign("/"); }
  if (user === undefined) return <main className="account-page"><p>Loading your account…</p></main>;
  if (!user) return null;
  return <main className="account-page"><header className="auth-top"><a className="brand" href="/"><span>2°</span> Second Circle</a><a href="/">← Browse listings</a></header><section className="account-card"><p className="eyebrow">Your account</p><h1>Hello, {user.user_metadata?.full_name || "there"}.</h1><p>{user.email}</p><div className="account-grid"><article><strong>Saved items</strong><span>{savedListings.length ? `${savedListings.length} saved ${savedListings.length === 1 ? "item" : "items"}.` : "Save a listing with the heart icon and it will appear here."}</span></article><article><strong>Your listings</strong><span>{listingCount === 0 ? "You have not listed anything yet." : `${listingCount} ${listingCount === 1 ? "item" : "items"} currently listed.`}</span></article><article><strong>Messages</strong><span>Talk privately with buyers and sellers inside Second Circle.</span><a href="/inbox">Open inbox →</a></article></div>{savedListings.length > 0 && <section className="saved-account-section"><div><p className="eyebrow">Saved for later</p><h2>Your saved items</h2></div><div className="grid">{savedListings.map((item) => <article className="listing" key={item.id}><a className="card-link" href={`/listing/${item.id}`} aria-label={`View ${item.title}`}></a><div className="image-wrap"><img src={item.image_url} alt={item.title}/><span className="condition">{item.condition}</span></div><div className="listing-copy"><div><h3>{item.title}</h3><p>{item.place} · Pickup</p></div><strong>{item.price.toLocaleString("nb-NO")} kr</strong></div></article>)}</div></section>}<div className="account-buttons"><a className="account-primary" href="/sell"><span>＋</span> Sell an item</a><button className="account-secondary" onClick={signOut}>Log out</button></div></section></main>;
}
