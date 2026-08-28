"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../supabase";

type ContactListing = { id: string; title: string; price: number; image_url: string; user_id: string; seller_name: string };

function ContactSellerPageContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [listing, setListing] = useState<ContactListing | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.replace(`/auth?next=/contact/${params.id}`);
      else setUser(data.user);
    });
    supabase.from("listings").select("id,title,price,image_url,user_id,seller_name").eq("id", params.id).maybeSingle().then(({ data }) => setListing(data));
  }, [params.id]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !listing) return;
    const replyTo = searchParams.get("to");
    const recipientId = user.id === listing.user_id && replyTo ? replyTo : listing.user_id;
    if (recipientId === user.id) return setError("You cannot message yourself about your own listing.");
    setBusy(true); setError("");
    const { error: sendError } = await supabase.from("messages").insert({ listing_id: listing.id, sender_id: user.id, recipient_id: recipientId, sender_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Member", body: message.trim() });
    setBusy(false);
    if (sendError) return setError(sendError.message);
    setSent(true);
  }

  if (user === undefined || listing === undefined) return <main className="message-page"><p>Preparing your message…</p></main>;
  if (!listing) return <main className="message-page"><section className="message-card"><h1>Listing not found</h1><a href="/">Return to marketplace</a></section></main>;
  if (sent) return <main className="message-page"><header className="auth-top"><a className="brand" href="/"><span>2°</span> Second Circle</a><a href="/inbox">Messages</a></header><section className="publish-success"><span>✓</span><p className="eyebrow">Message sent</p><h1>The seller can reply in Second Circle.</h1><div className="account-buttons"><a className="account-primary" href="/inbox">Open messages</a><a className="secondary-link" href={`/listing/${listing.id}`}>Back to item</a></div></section></main>;

  return <main className="message-page"><header className="auth-top"><a className="brand" href="/"><span>2°</span> Second Circle</a><a href={`/listing/${listing.id}`}>← Back to item</a></header><section className="message-shell"><aside className="message-item"><img src={listing.image_url} alt={listing.title}/><div><p className="eyebrow">About this item</p><h2>{listing.title}</h2><strong>{listing.price.toLocaleString("nb-NO")} kr</strong><span>Seller: {listing.seller_name}</span></div></aside><form className="message-card" onSubmit={submit}><p className="eyebrow">Contact seller</p><h1>Start a conversation.</h1><p>Your email remains private. Replies stay inside your Second Circle inbox.</p><label>Message<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} maxLength={1000} placeholder={`Hi ${listing.seller_name}, is this still available?`} required/><small>{message.length}/1000</small></label>{error && <p className="form-message error" role="alert">{error}</p>}<button className="publish-button" disabled={busy || !message.trim()}>{busy ? "Sending…" : "Send message"}<span>→</span></button></form></section></main>;
}

export default function ContactSellerPage() {
  return <Suspense fallback={<main className="message-page"><p>Preparing your message…</p></main>}><ContactSellerPageContent /></Suspense>;
}
