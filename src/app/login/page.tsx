"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/lib/supabase";



function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auth state states
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
    }
  }, [searchParams]);

  // Redirect already-authenticated users and listen for OAuth session arrival
  useEffect(() => {
    // Immediate check — covers page refresh while logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      }
    };
    checkAuth();

    // Real-time listener — fires when the OAuth callback sets the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
          router.replace("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }
    if (mode === "signup" && !agreeTerms) {
      setErrorMessage("You must agree to the Terms of Service.");
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#F8FAFC] dark:bg-[#090D1A] transition-colors duration-200">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl w-full lg:w-[95%] min-h-[600px] lg:h-[800px] rounded-[40px] overflow-hidden border border-[#E2E8F0] dark:border-[#24324A] shadow-2xl relative bg-[#FAFBFC] dark:bg-[#131C31] flex flex-col lg:flex-row"
      >
        {/* LEFT COLUMN: Brand Experience (Desktop only) */}
        <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 xl:p-16 bg-[#0B1020] text-slate-100 border-r border-[#24324A]/40 relative overflow-hidden select-none">
          
          {/* Subtle atmospheric glows (8% opacity only, large blur) */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#5B6EFF]/8 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#4FD1C5]/8 blur-[120px] pointer-events-none" />
          
          {/* Concentric knowledge rings in the background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <div className="w-[520px] h-[520px] rounded-full border border-slate-500/20 flex items-center justify-center">
              <div className="w-[380px] h-[380px] rounded-full border border-slate-500/20 flex items-center justify-center">
                <div className="w-[240px] h-[240px] rounded-full border border-slate-500/20" />
              </div>
            </div>
          </div>
          
          {/* Top Header Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#5B6EFF] shadow-lg shadow-[#5B6EFF]/20">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              KnowledgeSearch
            </span>
          </div>

          {/* Core Value Proposition & Previews */}
          <div className="my-auto space-y-8 max-w-lg relative z-10 w-full">
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#5B6EFF] mb-2">
                  DOCUMENT INTELLIGENCE
                </span>
                <h1 className="font-heading font-extrabold text-3xl lg:text-[42px] text-[#F8FAFC] leading-[1.1] tracking-tight">
                  Turn documents into <br />
                  searchable knowledge.
                </h1>
              </div>
              <p className="text-sm lg:text-[15px] text-[#94A3B8] font-normal leading-relaxed max-w-[480px]">
                Upload PDFs, notes and research files. <br className="hidden xl:inline" />
                Ask questions and receive source-backed answers instantly.
              </p>
              
              {/* Compact Bullet Feature Rows */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#94A3B8] font-medium pt-1">
                <span>• Semantic Search</span>
                <span>• Source Citations</span>
                <span>• Instant Retrieval</span>
              </div>
            </div>

            {/* High-Fidelity Illustration Wrapper with Floating Micro Cards */}
            <div className="relative w-full max-w-[720px] h-[500px] mt-6">
              {/* Concentric rings behind the image */}
              <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center -z-10">
                <div className="w-[520px] h-[520px] rounded-full border border-slate-500/20 flex items-center justify-center">
                  <div className="w-[360px] h-[360px] rounded-full border border-slate-500/20" />
                </div>
              </div>

              {/* Float Card 1: PDF Indexed */}
              <div className="absolute top-[20%] -left-6 z-20 bg-[#131C31]/95 border border-[#24324A] rounded-xl px-3 py-2 shadow-md">
                <div className="text-[9px] font-bold text-[#4FD1C5] uppercase tracking-wider">PDF Indexed</div>
                <div className="text-[11px] font-semibold text-slate-200 mt-0.5">142 Pages</div>
              </div>

              {/* Float Card 2: Query Found */}
              <div className="absolute bottom-[25%] -right-4 z-20 bg-[#18243C]/95 border border-[#24324A] rounded-xl px-3 py-2 shadow-md">
                <div className="text-[9px] font-bold text-[#5B6EFF] uppercase tracking-wider">Query Found</div>
                <div className="text-[11px] font-semibold text-slate-200 mt-0.5">Page 17</div>
              </div>

              {/* Float Card 3: Ready */}
              <div className="absolute top-[12%] -right-6 z-20 bg-[#131C31]/95 border border-[#24324A] rounded-xl px-3 py-2 shadow-md">
                <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Ready
                </div>
                <div className="text-[11px] font-semibold text-slate-200 mt-0.5">Vectorized</div>
              </div>

              {/* Image Container Frame */}
              <div className="w-full h-full rounded-[28px] p-6 border border-white/[0.08] shadow-lg relative bg-[#0B1020] overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src="/login-illustration.jpg"
                    alt="Workspace Illustration"
                    fill
                    priority
                    className="object-contain object-bottom opacity-90 brightness-95"
                  />
                </div>
                {/* Vignette radial overlay for background color integration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0B1020_95%)] pointer-events-none" />
                {/* Bottom gradient fade */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B1020] to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer trust check */}
          <div className="text-[11px] text-slate-500 font-medium relative z-10 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SOC2 Type II Certified • Data Encrypted</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Experience */}
        <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 sm:p-10 lg:py-6 lg:px-12 relative overflow-y-auto bg-[#FAFBFC] dark:bg-[#131C31] transition-colors duration-200">
          
          {/* Header toolbar with Mobile Logo */}
          <div className="flex items-center justify-between w-full">
            {/* Mobile-only logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#5B6EFF] shadow-lg shadow-[#5B6EFF]/20">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                KnowledgeSearch
              </span>
            </div>
          </div>

          {/* Authentication Form Box (Centered) */}
          <div className="my-auto w-full max-w-[380px] mx-auto py-2">
            <div className="space-y-5">
              
              {/* Header text */}
              <div className="space-y-1">
                <h2 className="font-heading font-bold text-3xl lg:text-[40px] text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-[1.1]">
                  {mode === "signin" ? "Sign in to account" : "Create an account"}
                </h2>
                <p className="text-[16px] text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
                  {mode === "signin"
                    ? "Welcome back. Enter your credentials to access your workspace."
                    : "Get started with your private research environment."}
                </p>
              </div>

              {/* Error Message banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-[12px] bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <svg className="w-4.5 h-4.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message banner */}
              {successMessage && (
                <div className="p-3.5 rounded-[12px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <svg className="w-4.5 h-4.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Google sign-in container */}
              <div className="space-y-2.5">
                <span className="block text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B] dark:text-[#94A3B8]">
                  Sign in with
                </span>
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={googleLoading || loading}
                    className="w-[64px] h-[64px] flex items-center justify-center rounded-full border border-[#E2E8F0] dark:border-[#24324A] bg-white dark:bg-[#0B1020] hover:bg-slate-50 dark:hover:bg-[#18243C] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {googleLoading ? (
                      <svg className="w-4 h-4 animate-spin text-[#0F172A] dark:text-white" viewBox="0 0 24 24" fill="none">
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

              {/* Divider line */}
              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8F0] dark:border-[#24324A]" />
                </div>
                <span className="relative px-3 bg-[#FAFBFC] dark:bg-[#131C31] text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  or continue with email
                </span>
              </div>

              {/* Email/Password form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B] dark:text-[#94A3B8] ml-4">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-[64px] text-sm pl-12 pr-6 border border-[#E2E8F0] dark:border-[#24324A] bg-[#FAFBFC] dark:bg-[#0B1020] hover:border-slate-300 dark:hover:border-zinc-700/80 focus:border-[#5B6EFF] focus:ring-2 focus:ring-[#5B6EFF]/20 rounded-full outline-none transition-all placeholder:text-[#94A3B8]"
                      disabled={loading || googleLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-4">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B] dark:text-[#94A3B8]">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => alert("Password reset code triggered in demo workspace.")}
                        disabled={loading || googleLoading}
                        className="text-[11px] font-semibold text-[#5B6EFF] hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-[64px] text-sm pl-12 pr-12 border border-[#E2E8F0] dark:border-[#24324A] bg-[#FAFBFC] dark:bg-[#0B1020] hover:border-slate-300 dark:hover:border-zinc-700/80 focus:border-[#5B6EFF] focus:ring-2 focus:ring-[#5B6EFF]/20 rounded-full outline-none transition-all placeholder:text-[#94A3B8] pr-12"
                      disabled={loading || googleLoading}
                      autoComplete="current-password"
                    />
                    {/* Show/Hide password toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading || googleLoading}
                      className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Extra Form Actions */}
                {mode === "signin" ? (
                  <div className="flex items-center justify-between pt-1 ml-4">
                    <label className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading || googleLoading}
                        className="h-4 w-4 rounded-full border-[#E2E8F0] dark:border-[#24324A] text-[#5B6EFF] focus:ring-[#5B6EFF] cursor-pointer bg-[#FAFBFC] dark:bg-[#0B1020]"
                      />
                      <span>Remember me</span>
                    </label>
                  </div>
                ) : (
                  <div className="pt-1 ml-4">
                    <label className="flex items-start gap-2.5 text-xs text-[#64748B] dark:text-[#94A3B8] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        disabled={loading || googleLoading}
                        className="h-4 w-4 rounded-full border-[#E2E8F0] dark:border-[#24324A] text-[#5B6EFF] focus:ring-[#5B6EFF] mt-0.5 cursor-pointer bg-[#FAFBFC] dark:bg-[#0B1020]"
                      />
                      <span className="leading-snug">
                        I agree to the{" "}
                        <a href="#" className="font-semibold text-[#5B6EFF] hover:underline">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="font-semibold text-[#5B6EFF] hover:underline">Privacy Policy</a>.
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit CTA button */}
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full h-[64px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer bg-gradient-to-r from-[#5B6EFF] to-[#7C8CFF] text-white hover:brightness-105 transition-all shadow-lg shadow-[#5B6EFF]/25 disabled:opacity-50 disabled:pointer-events-none mt-5"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>
                        {mode === "signin" ? "Signing in…" : "Creating account…"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === "signin" ? "Sign In" : "Create Account"}
                      </span>
                      <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
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
            <div className="text-center text-xs text-[#64748B] dark:text-[#94A3B8] mt-8">
              {mode === "signin" ? (
                <>
                  New to KnowledgeSearch?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setMode("signup");
                    }}
                    className="font-semibold text-[#5B6EFF] hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setMode("signin");
                    }}
                    className="font-semibold text-[#5B6EFF] hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Small Legal/Privacy Footer */}
          <div className="w-full text-center mt-auto pt-6 border-t border-[#E2E8F0] dark:border-[#24324A] select-none">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              <span>Protected by reCAPTCHA</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a href="#" className="hover:underline">Terms of Service</a>
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
