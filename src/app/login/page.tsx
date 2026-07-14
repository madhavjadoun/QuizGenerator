"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import LogoSVG from "@/components/layout/LogoSVG";



function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auth state states
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  // Show error passed back from /auth/callback (e.g. user cancelled Google login)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setErrorMessage(decodeURIComponent(urlError));
      // Reset the Google loading spinner — user came back from a cancelled OAuth flow
      setGoogleLoading(false);
    }
    // Login page is always light mode
    document.documentElement.classList.remove("dark");
    // Restore the user's saved theme when leaving this page
    return () => {
      try {
        const saved = localStorage.getItem("theme");
        if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
          document.documentElement.classList.add("dark");
        }
      } catch (_) {}
    };
  }, [searchParams]);

  // Redirect already-authenticated users and listen for OAuth session arrival
  useEffect(() => {
    // Immediate check — covers page refresh while logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const params = new URLSearchParams(window.location.search);
        if (params.get("recovery") || window.location.hash.includes("type=recovery")) {
          setMode("reset");
        } else {
          router.replace("/dashboard");
        }
      }
    };
    checkAuth();

    // Real-time listener — fires when the OAuth callback sets the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setMode("reset");
        } else if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
          const params = new URLSearchParams(window.location.search);
          if (!params.get("recovery") && !window.location.hash.includes("type=recovery") && mode !== "reset") {
            router.replace("/dashboard");
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, mode]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (mode === "forgot") {
      if (!email) {
        setErrorMessage("Please enter your email address.");
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/login?recovery=true",
        });
        if (error) throw error;
        setSuccessMessage("Password reset link sent! Please check your email inbox.");
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "An error occurred starting password reset.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "reset") {
      if (!password) {
        setErrorMessage("Please enter your new password.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setSuccessMessage("Password updated successfully! Redirecting to dashboard...");
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1500);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to update password.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        setSuccessMessage("Sign in successful! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
          }
        });
        if (error) throw error;

        if (data.session) {
          setSuccessMessage("Account created successfully! Redirecting...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 800);
        } else {
          setSuccessMessage("Account created! Please check your email for a confirmation link.");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An authentication error occurred.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Redirect to the server-side callback route which exchanges the
          // authorization code for a session, then forwards to /dashboard.
          redirectTo: window.location.origin + "/auth/callback",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        }
      });
      if (error) throw error;
      // Note: setGoogleLoading stays true here — the page will navigate away.
      // If the user cancels, the /auth/callback route redirects back with ?error
      // and the URL error useEffect above will reset loading via errorMessage.
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred starting Google OAuth.";
      setErrorMessage(message);
      setGoogleLoading(false);
    }
  };

  // Entrance variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.08,
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#FAFBFC] dark:bg-[#09090B] transition-colors duration-200 relative overflow-hidden">
      
      {/* Background Radial Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(14,165,233,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Dynamic Keyframes for Custom Float Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-card-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes float-card-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes float-card-3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float-1 {
          animation: float-card-1 8s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-card-2 9s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-card-3 10s ease-in-out infinite;
        }
      `}} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1150px] w-full min-h-[630px] lg:h-[700px] rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-white/[0.08] shadow-2xl relative bg-[#FAFBFC] dark:bg-[#111113] flex flex-col lg:flex-row"
      >
        {/* LEFT COLUMN: Brand Experience (Desktop only) */}
        <div 
          className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10 text-[var(--text-1)] border-r border-slate-200 dark:border-white/[0.08] relative overflow-hidden select-none"
          style={{
            background: "linear-gradient(180deg, #ffffff, #f8fcff)"
          }}
        >
          {/* Subtle Blur Circles behind SVG */}
          <div className="absolute top-[15%] left-[15%] w-[180px] h-[180px] rounded-full bg-[rgba(14,165,233,0.04)] blur-[35px] pointer-events-none" />
          <div className="absolute bottom-[15%] right-[15%] w-[180px] h-[180px] rounded-full bg-[rgba(16,185,129,0.04)] blur-[35px] pointer-events-none" />

          {/* Divider Blur Glow Overlay */}
          <div className="absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-gradient-to-b from-transparent via-[rgba(14,165,233,0.15)] to-transparent blur-[1.5px] pointer-events-none" />
          
          <div className="absolute inset-6 z-10">
            <Image
              src="/login-illustration.svg"
              alt="Workspace Illustration"
              fill
              priority
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: Form Experience */}
        <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 lg:p-8 relative overflow-y-auto bg-[var(--bg)] dark:bg-[var(--bg-2)] transition-colors duration-200">
          
          {/* Header toolbar with Mobile Logo */}
          <div className="flex items-center justify-between w-full">
            {/* Brand Logo */}
            <div className="flex items-center select-none pointer-events-none" style={{ height: '28px' }}>
              <div style={{ marginRight: '4px', flexShrink: 0, height: '28px' }}>
                <LogoSVG
                  type="icon"
                  animate={false}
                  className="h-7 w-auto object-contain"
                />
              </div>
              <span className="text-sm font-bold tracking-tight text-[var(--text-1)] leading-none">
                Quiz<span style={{ color: '#0d9488' }}>Gens</span>
              </span>
            </div>
          </div>

          {/* Authentication Form Box (Centered) */}
          <div className="my-auto w-full max-w-[380px] mx-auto py-0">
            <div className="space-y-4">
              
              {/* Header text */}
              <div className="space-y-1.5 mb-3.5">
                <h2 
                  className="font-heading font-extrabold text-2xl lg:text-[30px] text-[var(--text-1)] tracking-[-0.02em] leading-[1.2]"
                  style={{
                    fontWeight: 800,
                  }}
                >
                  {mode === "signin" && "Welcome back 👋"}
                  {mode === "signup" && "Create an account"}
                  {mode === "forgot" && "Reset your password"}
                  {mode === "reset" && "Set new password"}
                </h2>
                <p className="text-[13px] text-[var(--text-3)] font-medium leading-relaxed">
                  {mode === "signin" && "Welcome back. Enter your credentials to access your workspace."}
                  {mode === "signup" && "Get started with your private research environment."}
                  {mode === "forgot" && "Enter your email address and we will send you a link to reset your password."}
                  {mode === "reset" && "Please enter your new password below to update your account."}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[11px] text-[#1E293B] leading-snug flex-1">{errorMessage}</p>
                  <button
                    onClick={() => setErrorMessage("")}
                    className="flex-shrink-0 text-[#94A3B8] hover:text-[#475569] transition-colors cursor-pointer"
                    aria-label="Dismiss"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-start gap-2 pl-3 border-l-2 border-emerald-500">
                  <p className="text-[12px] text-emerald-700 leading-snug">{successMessage}</p>
                </div>
              )}

              {/* Google sign-in container */}
              {mode !== "forgot" && mode !== "reset" && (
                <div className="space-y-2">
                  <span className="block text-center text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--text-4)]">
                    Sign in with
                  </span>
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 0 }}
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={googleLoading || loading}
                      className="w-[50px] h-[50px] flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg-2)] transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      style={{
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      {googleLoading ? (
                        <svg className="w-3.5 h-3.5 animate-spin text-[var(--text-1)]" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Divider line */}
              {mode !== "forgot" && mode !== "reset" && (
                <div className="relative flex items-center justify-center py-0.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border)]" />
                  </div>
                  <span className="relative px-3 bg-[var(--bg)] dark:bg-[var(--bg-2)] text-[8px] font-bold uppercase tracking-wider text-[var(--text-4)] transition-colors duration-200">
                    or continue with email
                  </span>
                </div>
              )}

              {/* Email/Password form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                
                {/* Email Address */}
                {mode !== "reset" && (
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] ml-4">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-4)] pointer-events-none">
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full h-[50px] text-xs pl-12 pr-5 border border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] hover:border-[var(--border-strong)] focus:border-[var(--text-1)] focus:ring-2 focus:ring-[var(--text-1)]/5 rounded-full outline-none transition-all placeholder:text-[var(--text-4)]"
                        disabled={loading || googleLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                {mode !== "forgot" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between ml-3">
                      <label className="block text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)]">
                        {mode === "reset" ? "New Password" : "Password"}
                      </label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMessage("");
                            setSuccessMessage("");
                            setMode("forgot");
                          }}
                          disabled={loading || googleLoading}
                          className="text-[9px] font-semibold text-[var(--text-1)] hover:underline cursor-pointer bg-transparent border-0 p-0"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-4)] pointer-events-none">
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-[50px] text-xs pl-12 pr-10 border border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] hover:border-[var(--border-strong)] focus:border-[var(--text-1)] focus:ring-2 focus:ring-[var(--text-1)]/5 rounded-full outline-none transition-all placeholder:text-[var(--text-4)]"
                        disabled={loading || googleLoading}
                        autoComplete="current-password"
                      />
                      {/* Show/Hide password toggle */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading || googleLoading}
                        className="absolute inset-y-0 right-5 flex items-center text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Extra Form Actions */}
                {mode !== "forgot" && mode !== "reset" && (
                  <div className="space-y-3.5 pt-0.5 ml-1">
                    {mode === "signin" && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2.5 text-xs text-[var(--text-3)] cursor-pointer select-none">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              disabled={loading || googleLoading}
                              className="sr-only"
                            />
                            <div className={`h-[18px] w-[18px] rounded-md flex items-center justify-center border transition-all ${
                              rememberMe 
                                ? "bg-[var(--text-1)] border-[var(--text-1)] text-[var(--text-inv)]" 
                                : "border-slate-300 dark:border-white/[0.15] bg-white dark:bg-zinc-900 hover:border-slate-400"
                            }`}>
                              {rememberMe && (
                                <svg className="w-3 h-3 text-[var(--text-inv)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="font-semibold text-xs text-[var(--text-2)]">Remember me</span>
                        </label>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5 text-xs text-[var(--text-3)] select-none">
                      <div className="relative flex items-center mt-0.5">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          disabled={loading || googleLoading}
                          className="sr-only"
                        />
                        <label
                          htmlFor="agreeTerms"
                          className={`h-[18px] w-[18px] rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                            agreeTerms 
                              ? "bg-[var(--text-1)] border-[var(--text-1)] text-[var(--text-inv)]" 
                              : "border-slate-300 dark:border-white/[0.15] bg-white dark:bg-zinc-900 hover:border-slate-400"
                          }`}
                        >
                          {agreeTerms && (
                            <svg className="w-3 h-3 text-[var(--text-inv)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </label>
                      </div>
                      <label htmlFor="agreeTerms" className="text-[12px] leading-snug cursor-pointer font-medium text-[var(--text-3)]">
                        By signing in or creating an account, you agree to the{" "}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--text-1)] hover:underline">Terms of Service</a>
                        {" "}and{" "}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--text-1)] hover:underline">Privacy Policy</a>.
                      </label>
                    </div>
                  </div>
                )}

                {/* Submit CTA button */}
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full h-[50px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer bg-[var(--text-1)] hover:opacity-90 text-[var(--text-inv)] transition-all disabled:opacity-50 disabled:pointer-events-none mt-4"
                  style={{
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin text-[var(--text-inv)]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>
                        {mode === "signin" && "Signing in…"}
                        {mode === "signup" && "Creating account…"}
                        {mode === "forgot" && "Sending link…"}
                        {mode === "reset" && "Updating password…"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === "signin" && "Sign In"}
                        {mode === "signup" && "Create Account"}
                        {mode === "forgot" && "Send Reset Link"}
                        {mode === "reset" && "Update Password"}
                      </span>
                      <svg className="w-4 h-4 text-[var(--text-inv)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </form>

            </div>

            {/* Form Toggle Switcher */}
            <div className="text-center text-xs text-[var(--text-3)] mt-4">
              {mode === "signin" && (
                <>
                  New to QuizGens?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setSuccessMessage("");
                      setMode("signup");
                    }}
                    className="font-semibold text-[var(--text-1)] hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Create an account
                  </button>
                </>
              )}
              {mode === "signup" && (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setSuccessMessage("");
                      setMode("signin");
                    }}
                    className="font-semibold text-[var(--text-1)] hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Sign in
                  </button>
                </>
              )}
              {mode === "forgot" && (
                <>
                  Remembered your password?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setSuccessMessage("");
                      setMode("signin");
                    }}
                    className="font-semibold text-[var(--text-1)] hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Sign in
                  </button>
                </>
              )}
              {mode === "reset" && (
                <>
                  Cancel and return to{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setSuccessMessage("");
                      setMode("signin");
                    }}
                    className="font-semibold text-[var(--text-1)] hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Small Legal/Privacy Footer */}
          <div className="w-full text-center mt-auto pt-4 border-t border-[var(--border)] select-none">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] font-medium text-[var(--text-4)]">
              <span>Protected by reCAPTCHA</span>
              <span className="text-[var(--border)]">•</span>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy Policy</a>
              <span className="text-[var(--border)]">•</span>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * LoginPage wraps LoginContent in a Suspense boundary.
 * This is required by Next.js App Router when a component uses useSearchParams().
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-[var(--bg)]" />}>
      <LoginContent />
    </Suspense>
  );
}
