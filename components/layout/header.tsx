"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Compass, LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import type { AuthChangeEvent, Session, UserResponse } from "@supabase/supabase-js";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { Link, usePathname } from "@/navigation";
import { cn } from "@/lib/utils";

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
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.length
    ? parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase()
    : (email ?? "S").slice(0, 2).toUpperCase();
}

export function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(() =>
    createClient() ? { status: "loading" } : { status: "anonymous" },
  );
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !mobileMenuOpen;

  const navLinks = [
    { name: t("navHome"), href: "/" },
    { name: t("navProcesses"), href: "/#procesos" },
    { name: t("navHow"), href: "/#como-funciona" },
    { name: t("navFaq"), href: "/#preguntas" },
  ] as const;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
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
      if (active) setAuthState(data.user ? authenticatedState(data.user) : { status: "anonymous" });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (active) setAuthState(session?.user ? authenticatedState(session.user) : { status: "anonymous" });
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthState({ status: "anonymous" });
    window.location.assign(locale === "en" ? "/en" : "/");
  }

  return (
    <header
      data-transparent={transparent}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
        transparent
          ? "border-transparent bg-transparent"
          : "border-[var(--senda-border)] bg-[rgba(247,242,232,.92)] shadow-[0_14px_42px_-36px_rgba(34,38,29,.8)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(37,42,34,.92)]",
      )}
    >
      <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-20">
        <Link href="/" className="group relative z-10 flex items-center gap-3" aria-label={t("homeLabel")}>
          <span className="relative flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-full border border-[var(--senda-ink)]/45 dark:border-[#f4efe4]/45">
            <span className="h-2 w-2 rounded-full bg-[var(--senda-terracotta)]" />
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border border-[var(--senda-ink)]/45 bg-[#f4efe4] transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5 dark:border-[#f4efe4]/45 dark:bg-[#252a22]" />
          </span>
          <span className="font-heading text-[1.75rem] font-medium tracking-[-0.03em] text-[var(--senda-ink)] dark:text-[#f4efe4]">Senda</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={t("primaryNavigation")}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="relative py-2 text-[13px] font-bold text-[var(--senda-ink)]/68 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--senda-terracotta)] after:transition-transform hover:text-[var(--senda-ink)] hover:after:scale-x-100 dark:text-[#f4efe4]/70 dark:hover:text-white">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher compact />
          <ThemeToggle />
          {authState.status === "authenticated" ? (
            <div ref={accountDropdownRef} className="relative">
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={() => setAccountOpen((current) => !current)}
                className="flex h-10 items-center gap-2 rounded-full border border-[var(--senda-ink)]/15 bg-white/45 pl-1.5 pr-3 text-xs font-bold text-[var(--senda-ink)] backdrop-blur-sm hover:bg-white/70 dark:border-white/15 dark:bg-white/5 dark:text-[#f4efe4] dark:hover:bg-white/10"
              >
                {authState.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={authState.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--senda-ink)] text-[10px] text-white dark:bg-[#f4efe4] dark:text-[#252a22]">{userInitials(authState.fullName, authState.email)}</span>
                )}
                {t("ctaAccount")} <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", accountOpen && "rotate-180")} />
              </button>
              {accountOpen ? (
                <div role="menu" className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-[var(--senda-border)] bg-[#faf7ef] p-2 shadow-[0_28px_65px_-30px_rgba(35,39,29,.55)] dark:border-white/15 dark:bg-[#30362d]">
                  <p className="truncate px-3 pb-2 pt-1 text-xs text-[var(--senda-muted)]">{authState.email}</p>
                  {[
                    { href: "/panel#resumen", label: t("accountOverview"), icon: LayoutDashboard },
                    { href: "/panel#resultado", label: t("accountLatestResult"), icon: Compass },
                    { href: "/panel#perfil", label: t("accountPersonalData"), icon: UserRound },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} role="menuitem" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--senda-ink)] hover:bg-[var(--senda-stone)] dark:text-[#f4efe4] dark:hover:bg-white/10">
                      <item.icon className="h-4 w-4 text-[var(--senda-terracotta)]" /> {item.label}
                    </Link>
                  ))}
                  <div className="my-2 border-t border-[var(--senda-border)] dark:border-white/10" />
                  <button type="button" role="menuitem" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--senda-muted)] hover:bg-[var(--senda-stone)] hover:text-[var(--senda-ink)] dark:hover:bg-white/10 dark:hover:text-white">
                    <LogOut className="h-4 w-4" /> {t("ctaLogout")}
                  </button>
                </div>
              ) : null}
            </div>
          ) : authState.status === "anonymous" ? (
            <Link href="/login" className="px-2 text-xs font-bold text-[var(--senda-ink)]/65 hover:text-[var(--senda-ink)] dark:text-[#f4efe4]/70 dark:hover:text-white">{t("ctaLogin")}</Link>
          ) : (
            <span className="h-3 w-14 animate-pulse rounded-full bg-[var(--senda-border)]" aria-label={t("authLoading")} />
          )}
          <Link href="/diagnostico" className="ml-1 inline-flex min-h-11 items-center rounded-full bg-[var(--senda-ink)] px-5 text-xs font-bold text-white hover:bg-[var(--senda-olive)] dark:bg-[#f4efe4] dark:text-[#252a22] dark:hover:bg-white">
            {t("ctaDiagnostic")}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageSwitcher compact />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label={mobileMenuOpen ? t("closeMenu") : t("mobileMenu")}
            aria-expanded={mobileMenuOpen}
            aria-controls="senda-mobile-menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--senda-ink)]/15 bg-white/35 text-[var(--senda-ink)] backdrop-blur-sm hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-terracotta)] dark:border-white/15 dark:bg-white/5 dark:text-[#f4efe4]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div id="senda-mobile-menu" className="h-[calc(100svh-82px)] overflow-y-auto border-t border-[var(--senda-border)] bg-[#f7f2e8] dark:border-white/10 dark:bg-[#252a22] lg:hidden">
          <div className="mx-auto flex min-h-full max-w-xl flex-col px-5 py-8 sm:px-8">
            <nav className="divide-y divide-[var(--senda-border)] border-y border-[var(--senda-border)] dark:divide-white/10 dark:border-white/10" aria-label={t("mobileNavigation")}>
              {navLinks.map((link, index) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-5 py-5 font-heading text-3xl text-[var(--senda-ink)] dark:text-[#f4efe4]">
                  <span className="text-[10px] font-sans font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">0{index + 1}</span>{link.name}
                </Link>
              ))}
            </nav>
            <Link href="/diagnostico" onClick={() => setMobileMenuOpen(false)} className="mt-8 inline-flex min-h-13 items-center justify-center rounded-full bg-[var(--senda-ink)] px-6 py-3.5 text-sm font-bold text-white dark:bg-[#f4efe4] dark:text-[#252a22]">
              {t("ctaDiagnostic")}
            </Link>
            <div className="mt-auto pt-10">
              {authState.status === "authenticated" ? (
                <div className="grid gap-2 text-sm font-semibold text-[var(--senda-muted)]">
                  <Link href="/panel" onClick={() => setMobileMenuOpen(false)}>{t("ctaAccount")}</Link>
                  <button type="button" onClick={handleSignOut} className="text-left">{t("ctaLogout")}</button>
                </div>
              ) : authState.status === "anonymous" ? (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[var(--senda-muted)]">{t("ctaLogin")}</Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
