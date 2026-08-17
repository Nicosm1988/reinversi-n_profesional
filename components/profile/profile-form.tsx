"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export type PersonalProfile = {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  timezone: string;
  avatarUrl: string | null;
};

function initialsFor(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length) return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function ProfileForm({ initialProfile }: { initialProfile: PersonalProfile }) {
  const t = useTranslations("Profile");
  const [profile, setProfile] = useState(initialProfile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const initials = useMemo(
    () => initialsFor(profile.fullName || `${profile.firstName} ${profile.lastName}`, profile.email),
    [profile.email, profile.firstName, profile.fullName, profile.lastName],
  );

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStatus("error");
      setMessage(t("errors.invalidImageType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      setMessage(t("errors.imageTooLarge"));
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setStatus("idle");
    setMessage("");
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      setStatus("error");
      setMessage(t("errors.unavailable"));
      return;
    }

    setStatus("saving");
    setMessage("");

    try {
      let avatarUrl = profile.avatarUrl;
      if (avatarFile) {
        const avatarPath = `${profile.id}/avatar`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(avatarPath, avatarFile, { upsert: true, contentType: avatarFile.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
        avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
      }

      const fullName = profile.fullName.trim();
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          first_name: profile.firstName.trim() || null,
          last_name: profile.lastName.trim() || null,
          country_code: profile.countryCode.trim().toUpperCase() || null,
          timezone: profile.timezone.trim() || "UTC",
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, name: fullName, avatar_url: avatarUrl },
      });
      if (authError) throw authError;

      setProfile((current) => ({ ...current, avatarUrl }));
      setAvatarFile(null);
      setAvatarPreview(null);
      setStatus("saved");
      setMessage(t("success"));
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(t("errors.save"));
    }
  }

  const avatarSrc = avatarPreview ?? profile.avatarUrl;

  return (
    <form onSubmit={saveProfile} className="space-y-8" aria-label={t("formLabel")}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 flex-none">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt={t("avatarAlt")} className="h-28 w-28 rounded-full border-4 border-background object-cover shadow-md" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-background bg-[#241d38] font-heading text-3xl font-bold text-[#f5f2f7] shadow-md">
              {initials}
            </div>
          )}
          <label className="absolute bottom-0 right-0 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-[#cc148c] text-white shadow-md hover:bg-[#a80e70] focus-within:outline-none focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-2" aria-label={t("changePhoto")}>
            <Camera aria-hidden="true" className="h-4 w-4" />
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectAvatar} className="sr-only" />
          </label>
        </div>
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">{t("imageTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("imageDescription")}</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-foreground">{t("displayName")}</span>
          <input name="fullName" autoComplete="name" value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} maxLength={100} className="h-12 w-full rounded-xl border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-secondary/40" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-foreground">{t("firstName")}</span>
          <input name="firstName" autoComplete="given-name" value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} maxLength={60} className="h-12 w-full rounded-xl border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-secondary/40" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-foreground">{t("lastName")}</span>
          <input name="lastName" autoComplete="family-name" value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} maxLength={60} className="h-12 w-full rounded-xl border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-secondary/40" />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-foreground">{t("accessEmail")}</span>
          <input name="email" autoComplete="email" value={profile.email} disabled aria-describedby="profile-email-help" className="h-12 w-full rounded-xl border bg-muted px-4 text-muted-foreground" />
          <span id="profile-email-help" className="block text-xs text-muted-foreground">{t("accessEmailHelp")}</span>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={status === "saving"} className="h-12 rounded-full bg-[#cc148c] px-8 text-white hover:bg-[#a80e70]">
          {status === "saving" ? <><Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />{t("saving")}</> : t("save")}
        </Button>
        {message && (
          <p
            role={status === "error" ? "alert" : "status"}
            className={`flex items-center gap-2 text-sm ${status === "error" ? "text-destructive" : "text-foreground"}`}
          >
            {status === "saved" && <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-green-600" />}
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
