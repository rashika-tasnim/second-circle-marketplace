"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export default function AuthActions() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  async function signOut() {
    await supabase.auth.signOut();
    window.location.assign("/");
  }
  return <div className="header-actions">
    {user && <a className="header-inbox" href="/inbox">Messages</a>}
    {user ? <div className="account-menu">
      <button className="header-account" type="button" aria-haspopup="menu">{user.user_metadata?.full_name || "Account"}<span aria-hidden="true">⌄</span></button>
      <div className="account-dropdown" role="menu">
        <a href="/account" role="menuitem">Account details</a>
        <button type="button" role="menuitem" onClick={signOut}>Log out</button>
      </div>
    </div> : <a className="header-account" href="/auth">Log in</a>}
    <a className="header-sell" href={user ? "/sell" : "/auth?next=/sell"}><span aria-hidden="true">＋</span><b>Sell an item</b></a>
  </div>;
}
