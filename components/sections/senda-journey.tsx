import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  HeartHandshake,
  Route,
  Sparkles,
} from "lucide-react";
import {
  DoorsIllustration,
  JourneyIllustration,
  PuzzleIllustration,
  StairIllustration,
  SupportIllustration,
} from "@/components/illustrations/pastel-illustrations";

const moments = [
  { number: "01", title: "Estoy en una pausa", text: "Necesito bajar el ruido y entender qué me está pasando." },
  { number: "02", title: "Sé que algo cambió", text: "Mi trabajo ya no encaja, pero todavía no veo con claridad qué sigue." },
  { number: "03", title: "Tengo una dirección", text: "Quiero transformar una intuición en decisiones y próximos pasos." },
];

const paths = [
  { icon: BriefcaseBusiness, title: "Trabajo", text: "Roles, transiciones y decisiones de carrera.", tone: "bg-[#e8a17f]" },
  { icon: Brain, title: "Identidad", text: "Quién sos cuando tu título profesional ya no alcanza.", tone: "bg-[#a8bd9e]" },
  { icon: GraduationCap, title: "Aprendizaje", text: "Qué aprender, para qué y sin perderte en la urgencia.", tone: "bg-[#e6c675]" },
  { icon: Compass, title: "Propósito", text: "Valores y motivaciones para elegir con coherencia.", tone: "bg-[#9eb8c2]" },
  { icon: Sparkles, title: "Tecnología", text: "Cómo convivir con la IA y convertir el cambio en criterio.", tone: "bg-[#c7a8c9]" },
];

export function SendaJourney() {
  return (
    <div className="overflow-hidden bg-[#fcf5ec] text-[#2f3647]">
      <section className="relative min-h-[92vh] overflow-hidden bg-[#31384a] px-5 pb-16 pt-32 text-[#f6efe7] md:px-8 md:pt-40">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_15%,rgba(203,226,190,.22),transparent_25%),radial-gradient(circle_at_82%_72%,rgba(226,164,118,.18),transparent_28%)]" />
        <div className="absolute -bottom-24 left-1/2 h-[540px] w-[180px] -translate-x-1/2 rotate-[9deg] rounded-[50%] border-x border-[#d9c68d]/30 bg-[#d9c68d]/10 blur-[1px]" />
        <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#eadfd4]/25 bg-white/5 px-4 py-2 text-sm text-[#eadfd4]">
              <Route className="h-4 w-4" /> Un espacio para orientarte sin apurarte
            </p>
            <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-[5.5rem]">
              No necesitás tener todo claro para <span className="text-[#e47c56]">dar el próximo paso.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#e7e2d5]/80 md:text-xl">
              Senda es un mapa vivo para explorar tu trabajo, tu identidad y lo que querés construir. Empezá por el punto en el que estás hoy.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="#donde-estoy" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e47c56] px-7 font-semibold text-[#31384a] hover:bg-[#f0b08d]">
                Entrar a la senda <ArrowDown className="h-4 w-4" />
              </Link>
              <Link href="/diagnostico/ancla-de-carrera" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-7 font-semibold text-white hover:bg-white/10">
                Hacer el diagnóstico gratuito
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute inset-6 rounded-[38px] border border-white/10 bg-white/6" />
            <div className="relative overflow-hidden rounded-[36px] border border-[#d7c3ae] bg-[#f6efe7] p-4 shadow-[0_30px_80px_-40px_rgba(16,21,33,.9)]">
              <JourneyIllustration className="rounded-[28px]" />
            </div>
          </div>
        </div>
      </section>

      <section id="donde-estoy" className="relative px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[.22em] text-[#a84729]">Primer hito · ubicarse</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:items-end">
            <h2 className="font-heading text-4xl font-semibold leading-tight tracking-[-.035em] md:text-6xl">¿En qué punto de tu camino estás?</h2>
            <p className="max-w-xl text-lg leading-8 text-[#606777]">No hay una respuesta correcta. Reconocer el momento actual es una forma concreta de empezar a orientarte.</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-[2rem] border border-[#eadfd4] bg-[#fffaf4] p-3 shadow-[0_20px_45px_-35px_rgba(47,54,71,.55)]">
              <PuzzleIllustration className="rounded-[1.5rem]" />
            </div>
            {moments.map((moment) => (
              <article key={moment.number} className="group rounded-[2rem] border border-[#2f3647]/12 bg-[#fffaf4] p-7 transition-transform hover:-translate-y-1">
                <span className="text-sm font-bold text-[#8f4028]">{moment.number}</span>
                <h3 className="mt-10 font-heading text-2xl font-semibold">{moment.title}</h3>
                <p className="mt-3 leading-7 text-[#606777]">{moment.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cruce-de-caminos" className="relative bg-[#f4e9de] px-5 py-24 md:px-8 md:py-32">
        <div className="absolute left-1/2 top-0 h-full w-px bg-[#2f3647]/12" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.22em] text-[#8f4028]">Cruce de caminos</p>
            <h2 className="mt-5 font-heading text-4xl font-semibold tracking-[-.035em] md:text-6xl">Una vida profesional tiene más de una senda.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#606777]">Podés explorar una, volver atrás o conectar varias. El recorrido se construye con preguntas, no con fórmulas.</p>
          </div>
          <div className="mx-auto mt-12 max-w-[460px] overflow-hidden rounded-[2rem] border border-[#eadfd4] bg-[#fffaf4] p-3 shadow-[0_20px_45px_-35px_rgba(47,54,71,.55)]">
            <DoorsIllustration className="rounded-[1.5rem]" />
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {paths.map(({ icon: Icon, title, text, tone }) => (
              <article key={title} className="rounded-[1.75rem] border border-[#2f3647]/10 bg-[#fffaf4] p-5 shadow-[0_18px_45px_-34px_rgba(32,55,47,.45)]">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></div>
                <h3 className="mt-7 font-heading text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#606777]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div className="overflow-hidden rounded-[2.5rem] border border-[#eadfd4] bg-[#fffaf4] p-4 shadow-[0_24px_55px_-38px_rgba(47,54,71,.6)]">
            <StairIllustration className="rounded-[2rem]" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[.22em] text-[#a84729]">Una herramienta para empezar</p>
            <h2 className="mt-5 font-heading text-4xl font-semibold tracking-[-.035em] md:text-6xl">Descubrí qué sostiene tus decisiones.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#606777]">El test de Anclas de Carrera te ayuda a reconocer capacidades, motivaciones y valores que no querés abandonar. Es gratuito, orientativo y podés hacerlo una vez.</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#606777]">
              <span className="rounded-full border border-[#2f3647]/15 px-4 py-2">10–12 minutos</span>
              <span className="rounded-full border border-[#2f3647]/15 px-4 py-2">Resultado inmediato</span>
              <span className="rounded-full border border-[#2f3647]/15 px-4 py-2">Sin diagnóstico clínico</span>
            </div>
            <Link href="/diagnostico/ancla-de-carrera" className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#2f3647] px-7 font-semibold text-white hover:bg-[#414a60]">
              Empezar el test <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#efe1d2] px-5 py-24 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.7fr_1fr_1fr] lg:items-center">
          <div className="overflow-hidden rounded-[2rem] border border-[#d7c3ae] bg-[#fffaf4] p-3 shadow-[0_20px_45px_-35px_rgba(47,54,71,.55)]">
            <SupportIllustration className="rounded-[1.5rem]" />
          </div>
          <div>
            <HeartHandshake className="h-10 w-10 text-[#7b452e]" />
            <h2 className="mt-6 max-w-3xl font-heading text-4xl font-semibold tracking-[-.035em] md:text-6xl">Algunas partes del camino se transitan mejor en compañía.</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[#6a7080]">Si querés profundizar, podés conversar con nuestro equipo o con un profesional recomendado. Sin respuestas automáticas que pretendan reemplazar una escucha humana.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contacto" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f3647] px-7 font-semibold text-white hover:bg-[#414a60]">Contactar al equipo</Link>
              <Link href="/diagnostico" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#2f3647]/25 px-7 font-semibold text-[#2f3647] hover:bg-white/20"><BookOpen className="h-4 w-4" /> Ver recursos</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
