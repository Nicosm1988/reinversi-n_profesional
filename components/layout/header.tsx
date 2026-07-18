"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, X, Compass, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session, UserResponse } from "@supabase/supabase-js";

type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; email: string | null; fullName: string; avatarUrl: string | null };

function authenticatedState(user: Session["user"]): AuthState {
  const metadata = user.user_metadata ?? {};
  return {
    status: "authenticated",
    email: user.email ?? null,
    fullName: metadata.full_name ?? metadata.name ?? "",
    avatarUrl: metadata.avatar_url ?? null,
  };
}

function userInitials(fullName: string, email: string | null) {
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  if (nameParts.length) return nameParts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (email ?? "S").slice(0, 2).toUpperCase();
}

export function Header() {
  const t = useTranslations("Header");

  const navLinks = [
    { name: t("navMethod"), href: "/#donde-estoy" },
    { name: t("navPaths"), href: "/#cruce-de-caminos" },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(() =>
    createClient() ? { status: "loading" } : { status: "anonymous" },
  );

  const accountDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let active = true;
    void supabase.auth.getUser().then(({ data }: UserResponse) => {
      if (!active) return;
      setAuthState(
        data.user
          ? authenticatedState(data.user)
          : { status: "anonymous" },
      );
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!active) return;
      setAuthState(
        session?.user
          ? authenticatedState(session.user)
          : { status: "anonymous" },
      );
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthState({ status: "anonymous" });
    window.location.assign("/");
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b bg-[#fffaf4]/95 backdrop-blur-xl transition-all duration-300 dark:bg-[#242a38]/95 ${
        scrolled ? "border-[#e7d9cc] shadow-[0_12px_35px_-30px_rgba(47,54,71,.7)]" : "border-[#e7d9cc]/60"
      }`}
    >
      <div className="container mx-auto flex h-[78px] max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="group z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#2f3647] bg-[#2f3647] text-base font-black text-[#f6efe7] transition-transform group-hover:scale-[1.03] group-active:scale-[0.98]">
            S
          </div>
          <span className="hidden font-heading text-lg font-semibold tracking-tight text-primary dark:text-[#f6efe7] sm:block">{t("logo")}</span>
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          <nav className="flex items-center gap-1 rounded-full border border-[#eadfd4] bg-[#fffaf4] px-2 py-1.5 shadow-[0_18px_36px_-30px_rgba(47,54,71,0.45)] dark:border-white/15 dark:bg-[#303747]">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#6a7080] hover:bg-[#f2e6d9] hover:text-[#2f3647] dark:text-[#ddd5cc] dark:hover:bg-white/10 dark:hover:text-white"
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/diagnostico/ancla-de-carrera"
              className="rounded-full border border-[#a84729] bg-[#f3ddd0] px-5 py-2 text-sm font-semibold text-[#8f4028] transition-colors hover:bg-[#edd3c4]"
            >
              {t("ctaDiagnostic")}
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {authState.status === "authenticated" ? (
            <div ref={accountDropdownRef} className="relative">
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={() => setAccountOpen((current) => !current)}
                title={authState.email ?? undefined}
                className="flex items-center gap-2 rounded-full border border-[#d7c3ae] bg-[#f5e9dc] py-1.5 pl-1.5 pr-4 text-sm font-semibold text-[#2f3647] hover:bg-[#eedbc9] dark:border-white/15 dark:bg-white/10 dark:text-[#f6efe7] dark:hover:bg-white/15"
              >
                {authState.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={authState.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2f3647] text-[10px] font-bold text-[#f6efe7] dark:bg-[#f6efe7] dark:text-[#2f3647]">
                    {userInitials(authState.fullName, authState.email)}
                  </span>
                )}
                {t("ctaAccount")}
                <ChevronDown className={`h-4 w-4 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>
              {accountOpen && (
                <div role="menu" className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-[#eadfd4] bg-[#fffaf4] p-2 shadow-[0_24px_60px_-28px_rgba(47,54,71,0.55)] dark:border-white/15 dark:bg-[#303747]">
                  <p className="truncate px-3 pb-2 pt-1 text-xs text-[#6a7080] dark:text-[#c8c1ba]">{authState.email}</p>
                  {[
                    { href: "/panel#resumen", label: "Resumen", icon: LayoutDashboard },
                    { href: "/panel#resultado", label: "Mi último resultado", icon: Compass },
                    { href: "/panel#perfil", label: "Datos personales", icon: UserRound },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} role="menuitem" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#2f3647] hover:bg-[#f4e9de] dark:text-[#f6efe7] dark:hover:bg-white/10">
                      <item.icon className="h-4 w-4 text-[#e47c56]" />{item.label}
                    </Link>
                  ))}
                  <div className="my-2 border-t border-[#eadfd4] dark:border-white/15" />
                  <button type="button" role="menuitem" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#6a7080] hover:bg-[#f4e9de] hover:text-[#2f3647] dark:text-[#ddd5cc] dark:hover:bg-white/10 dark:hover:text-white">
                    <LogOut className="h-4 w-4" />{t("ctaLogout")}
                  </button>
                </div>
              )}
            </div>
          ) : authState.status === "anonymous" ? (
            <Link href="/login" className="text-sm font-semibold text-[#2f3647] hover:text-[#e47c56] dark:text-[#f6efe7] dark:hover:text-[#f0a27f]">
              {t("ctaLogin")}
            </Link>
          ) : (
            <span className="h-4 w-16 animate-pulse rounded-full bg-[#ded2c6] dark:bg-white/15" aria-label={t("authLoading")} />
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfd4] bg-[#fffaf4] text-primary dark:border-white/15 dark:bg-white/10"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={t("mobileMenu")}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#eadfd4] bg-[#fffaf4] dark:border-white/15 dark:bg-[#242a38] lg:hidden">
            <div className="container mx-auto max-w-6xl space-y-3 px-5 py-6 md:px-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block rounded-xl border border-[#eadfd4] px-4 py-3 text-sm font-semibold text-primary hover:bg-[#f4e9de] dark:border-white/15 dark:text-[#f6efe7] dark:hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <Button
                variant="default"
                className="h-12 w-full rounded-full border-[#a84729] bg-[#bd5734] text-white hover:border-[#963f25] hover:bg-[#a84729]"
                asChild
              >
                <Link href="/diagnostico/ancla-de-carrera" onClick={() => setMobileMenuOpen(false)}>
                  {t("ctaDiagnostic")}
                </Link>
              </Button>
              {authState.status === "authenticated" ? (
                <div className="space-y-2 rounded-2xl border border-[#eadfd4] bg-[#f7efe6] p-2 dark:border-white/15 dark:bg-[#303747]">
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("ctaAccount")}</p>
                  <Link href="/panel#resumen" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold dark:text-[#f6efe7] dark:hover:bg-white/10">Resumen</Link>
                  <Link href="/panel#resultado" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold dark:text-[#f6efe7] dark:hover:bg-white/10">Mi último resultado</Link>
                  <Link href="/panel#perfil" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold dark:text-[#f6efe7] dark:hover:bg-white/10">Datos personales</Link>
                  <Button variant="ghost" className="h-12 w-full rounded-full" onClick={handleSignOut}>
                    {t("ctaLogout")}
                  </Button>
                </div>
              ) : authState.status === "anonymous" ? (
                <Button variant="outline" className="h-12 w-full rounded-full border-[#d3c0ad] bg-[#fbf5ee] text-[#2f3647] hover:bg-[#f0e3d5]" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    {t("ctaLogin")}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        )}
    </header>
  );
}
