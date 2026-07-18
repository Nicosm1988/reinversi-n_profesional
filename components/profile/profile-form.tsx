"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
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
      setMessage("Elegí una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      setMessage("La imagen debe pesar menos de 5 MB.");
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
    if (!supabase) return;

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
      setMessage("Tus datos quedaron guardados.");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("No pudimos guardar los cambios. Probá nuevamente.");
    }
  }

  const avatarSrc = avatarPreview ?? profile.avatarUrl;

  return (
    <form onSubmit={saveProfile} className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 flex-none">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt="Foto de perfil" className="h-28 w-28 rounded-full border-4 border-background object-cover shadow-md" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-background bg-[#2f3647] font-heading text-3xl font-bold text-[#f6efe7] shadow-md">
              {initials}
            </div>
          )}
          <label className="absolute bottom-0 right-0 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-[#e47c56] text-white shadow-md hover:bg-[#d86f49]" aria-label="Cambiar foto">
            <Camera className="h-4 w-4" />
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectAvatar} className="sr-only" />
          </label>
        </div>
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Tu imagen</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">JPG, PNG o WebP de hasta 5 MB. Si no cargás una foto, mostraremos tus iniciales.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-foreground">Nombre para mostrar</span>
          <input value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} maxLength={100} className="h-12 w-full rounded-xl border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-secondary/40" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-foreground">Nombre</span>
          <input value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} maxLength={60} className="h-12 w-full rounded-xl border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-secondary/40" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-foreground">Apellido</span>
          <input value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} maxLength={60} className="h-12 w-full rounded-xl border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-secondary/40" />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-foreground">Correo de acceso</span>
          <input value={profile.email} disabled className="h-12 w-full rounded-xl border bg-muted px-4 text-muted-foreground" />
          <span className="block text-xs text-muted-foreground">Este correo proviene de tu cuenta de Google y no se modifica desde Senda.</span>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-foreground">País (código)</span>
          <input value={profile.countryCode} onChange={(event) => setProfile({ ...profile, countryCode: event.target.value })} maxLength={2} placeholder="AR" className="h-12 w-full rounded-xl border bg-background px-4 uppercase text-foreground outline-none focus:ring-2 focus:ring-secondary/40" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-foreground">Zona horaria</span>
          <input value={profile.timezone} onChange={(event) => setProfile({ ...profile, timezone: event.target.value })} maxLength={80} placeholder="America/Argentina/Buenos_Aires" className="h-12 w-full rounded-xl border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-secondary/40" />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={status === "saving"} className="h-12 rounded-full bg-[#e47c56] px-8 text-white hover:bg-[#d86f49]">
          {status === "saving" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando…</> : "Guardar cambios"}
        </Button>
        {message && <p role="status" className={`flex items-center gap-2 text-sm ${status === "error" ? "text-destructive" : "text-foreground"}`}>{status === "saved" && <CheckCircle2 className="h-4 w-4 text-green-600" />}{message}</p>}
      </div>
    </form>
  );
}
