"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

const categories = ["Furniture", "Clothing", "Electronics", "Sport", "Home", "Books"];
const conditions = ["Like new", "Very good", "Good", "Used"];

export default function SellPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [condition, setCondition] = useState(conditions[1]);
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.replace("/auth?next=/sell");
      else setUser(data.user);
    });
  }, []);

  function chooseImage(file: File | null) {
    setImage(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !image) return setError("Please add one clear photo of the item.");
    setBusy(true); setError("");
    const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("listing-images").upload(imagePath, image, { contentType: image.type, upsert: false });
    if (uploadError) { setBusy(false); return setError(uploadError.message); }
    const { data: publicImage } = supabase.storage.from("listing-images").getPublicUrl(imagePath);
    const { error: insertError } = await supabase.from("listings").insert({
      user_id: user.id, title: title.trim(), price: Number(price), category, condition,
      place: place.trim(), description: description.trim(), image_url: publicImage.publicUrl,
      seller_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Member",
    });
    setBusy(false);
    if (insertError) {
      await supabase.storage.from("listing-images").remove([imagePath]);
      return setError(insertError.message);
    }
    setSuccess(true);
  }

  if (user === undefined) return <main className="account-page"><p>Checking your account…</p></main>;
  if (!user) return null;
  if (success) return <main className="sell-page"><header className="auth-top"><a className="brand" href="/"><span>2°</span> Second Circle</a><a href="/account">Your account</a></header><section className="publish-success"><span>✓</span><p className="eyebrow">Listing published</p><h1>Your item joined the circle.</h1><p>You can now find and manage it from your account.</p><div className="account-buttons"><a className="account-primary" href="/account">View your listings</a><a className="secondary-link" href="/sell">List another item</a></div></section></main>;

  return <main className="sell-page">
    <header className="auth-top"><a className="brand" href="/"><span>2°</span> Second Circle</a><a href="/account">← Your account</a></header>
    <section className="sell-shell">
      <aside className="sell-intro"><p className="eyebrow">Create a listing</p><h1>Give it another chapter.</h1><p>Add honest details and one clear photo so a nearby buyer knows exactly what they are finding.</p><ol><li><b>1</b><span><strong>Describe it clearly</strong>Include condition and useful details.</span></li><li><b>2</b><span><strong>Choose a fair price</strong>Leave room for a simple conversation.</span></li><li><b>3</b><span><strong>Arrange a safe pickup</strong>Meet publicly when possible.</span></li></ol></aside>
      <form className="listing-form" onSubmit={submit}>
        <div className="form-heading"><div><span>New listing</span><h2>Item details</h2></div><a href="/account">Cancel</a></div>
        <label className="photo-field"><span>Photo</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => chooseImage(e.target.files?.[0] || null)} required/><div className={preview ? "photo-preview has-image" : "photo-preview"}>{preview ? <img src={preview} alt="Preview of item"/> : <><b>＋</b><strong>Add a clear photo</strong><small>JPG, PNG or WebP</small></>}</div></label>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Oak reading chair" maxLength={80} required/></label>
        <div className="form-row"><label>Price <span>(NOK)</span><input type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="650" required/></label><label>Location<input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Bergen" maxLength={60} required/></label></div>
        <div className="form-row"><label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Condition<select value={condition} onChange={(e) => setCondition(e.target.value)}>{conditions.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe its condition, size, age and anything the buyer should know…" rows={5} maxLength={800} required/><small>{description.length}/800</small></label>
        {error && <p className="form-message error" role="alert">{error}</p>}
        <button className="publish-button" disabled={busy}>{busy ? "Publishing…" : "Publish listing"}<span>→</span></button>
      </form>
    </section>
  </main>;
}
