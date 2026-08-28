"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { categories, type Listing } from "../../listings";
import { supabase } from "../../supabase";

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const category = categories.find((item) => item.toLowerCase() === decodeURIComponent(params.category).toLowerCase());
  const [items, setItems] = useState<Listing[]>([]);
  useEffect(() => { if (category) supabase.from("listings").select("*").eq("status", "active").eq("category", category).order("created_at", { ascending: false }).then(({ data }) => setItems((data ?? []).map((item) => ({ id: item.id, title: item.title, price: item.price, category: item.category, place: item.place, condition: item.condition, image: item.image_url, description: item.description, seller: item.seller_name, memberSince: new Date(item.created_at).getFullYear().toString(), posted: "Recently", userId: item.user_id, isUserListing: true })))); }, [category]);
  return <main><header className="topbar detail-topbar"><a className="brand" href="/"><span>2°</span> Second Circle</a><nav><a href="/#browse">Browse all</a><a href="/#how">How it works</a></nav><a className="back-link top-back" href="/">← Home</a></header><section className="category-shell"><nav className="breadcrumbs"><a href="/">Home</a><span>/</span><strong>{category ?? "Category"}</strong></nav>{category ? <><div className="category-heading"><div><p className="eyebrow">Browse by category</p><h1>{category}</h1><p>{items.length} {items.length === 1 ? "item" : "items"} currently available</p></div><a href="/#browse">View all categories →</a></div><div className="grid category-grid">{items.map((item) => <article className="listing" key={item.id}><a className="card-link" href={`/listing/${item.id}`} aria-label={`View ${item.title}`}></a><div className="image-wrap"><img src={item.image} alt={item.title}/><span className="condition">{item.condition}</span></div><div className="listing-copy"><div><h3>{item.title}</h3><p>{item.place} · Pickup</p></div><strong>{item.price.toLocaleString("nb-NO")} kr</strong></div></article>)}</div></> : <section className="not-found"><h1>Category not found</h1><a href="/#browse">← Browse categories</a></section>}</section></main>;
}
