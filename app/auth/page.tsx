"use client";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, isSupabaseConfigured } from "../supabase";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [mode, setMode] = useState<"login" | "register">("register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (data.session) window.location.replace(next); }); }, [next]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (!isSupabaseConfigured) return setError("Registration is not configured yet.");
    if (mode === "register" && password !== confirmPassword) return setError("The passwords do not match.");
    if (password.length < 6) return setError("Use a password with at least 6 characters.");
    setBusy(true);
    if (mode === "register") {
      const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/account` } });
      setBusy(false);
      if (authError) return setError(authError.message);
      if (data.session) window.location.assign(next);
      else setMessage("Account created. Check your email to confirm your address, then log in.");
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) return setError(authError.message);
    window.location.assign(next);
  }

  const switchMode = (value: "login" | "register") => { setMode(value); setError(""); setMessage(""); };
  return <main className="auth-page"><header className="auth-top"><a className="brand" href="/"><span>2°</span> Second Circle</a><a href="/">← Continue browsing</a></header>
    <section className="auth-shell"><div className="auth-story"><p className="eyebrow">Join the circle</p><h1>Buy and sell with one account.</h1><p>Save local finds, contact sellers and give your own unused things another chapter.</p><div><span>✓ One account for buying and selling</span><span>✓ Local, straightforward exchanges</span><span>✓ Your saved items in one place</span></div></div>
      <div className="auth-card"><div className="auth-tabs"><button type="button" className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>Create account</button><button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Log in</button></div><h2>{mode === "register" ? "Create your account" : "Welcome back"}</h2><p>{mode === "register" ? "You can browse, save, buy and sell as the same member." : "Log in to continue to your Second Circle account."}</p>
        <form onSubmit={submit}>{mode === "register" && <label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required /></label>}<label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} required /></label>{mode === "register" && <label>Confirm password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required /></label>}{error && <p className="form-message error" role="alert">{error}</p>}{message && <p className="form-message success" role="status">{message}</p>}<button className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Log in"}</button></form>
      </div></section></main>;
}

export default function AuthPage() {
  return <Suspense fallback={<main className="auth-page"><p>Preparing your account…</p></main>}><AuthPageContent /></Suspense>;
}
