"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

type Message = { id: string; listing_id: string; sender_id: string; recipient_id: string; sender_name: string; body: string; created_at: string; listings: { title: string; image_url: string } | null };

export default function InboxPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return window.location.replace("/auth?next=/inbox");
      setUser(data.user);
      const { data: rows } = await supabase.from("messages").select("*,listings(title,image_url)").or(`sender_id.eq.${data.user.id},recipient_id.eq.${data.user.id}`).order("created_at", { ascending: false });
      setMessages((rows as Message[]) || []);
    });
  }, []);
  if (user === undefined) return <main className="message-page"><p>Loading messages…</p></main>;
  if (!user) return null;
  return <main className="message-page"><header className="auth-top"><a className="brand" href="/"><span>2°</span> Second Circle</a><a href="/account">← Your account</a></header><section className="inbox-shell"><div className="inbox-heading"><p className="eyebrow">Your conversations</p><h1>Messages</h1><p>Buyer and seller email addresses remain private.</p></div>{messages.length === 0 ? <div className="inbox-empty"><span>✉</span><h2>No messages yet</h2><p>When someone contacts you about a listing—or you contact a seller—the conversation appears here.</p><a className="account-primary" href="/#browse">Browse items</a></div> : <div className="message-list">{messages.map((item) => { const incoming = item.recipient_id === user.id; const otherUserId = incoming ? item.sender_id : item.recipient_id; return <article key={item.id}><img src={item.listings?.image_url || ""} alt=""/><div><div className="message-meta"><strong>{item.listings?.title || "Listing"}</strong><time>{new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</time></div><p><b>{incoming ? item.sender_name : "You"}:</b> {item.body}</p><div className="message-actions"><a href={`/listing/${item.listing_id}`}>View item</a><a href={`/contact/${item.listing_id}?to=${otherUserId}`}>Reply</a></div></div></article>; })}</div>}</section></main>;
}
