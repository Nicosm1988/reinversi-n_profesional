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
  Map,
  Route,
  Sparkles,
  Trees,
} from "lucide-react";

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
    <div className="overflow-hidden bg-[#f3efe4] text-[#20372f]">
      <section className="relative min-h-[92vh] overflow-hidden bg-[#173b31] px-5 pb-16 pt-32 text-[#f8f2e6] md:px-8 md:pt-40">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_15%,rgba(203,226,190,.22),transparent_25%),radial-gradient(circle_at_82%_72%,rgba(226,164,118,.18),transparent_28%)]" />
        <div className="absolute -bottom-24 left-1/2 h-[540px] w-[180px] -translate-x-1/2 rotate-[9deg] rounded-[50%] border-x border-[#d9c68d]/30 bg-[#d9c68d]/10 blur-[1px]" />
        <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d8e2cc]/25 bg-white/5 px-4 py-2 text-sm text-[#d8e2cc]">
              <Route className="h-4 w-4" /> Un espacio para orientarte sin apurarte
            </p>
            <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-[5.5rem]">
              No necesitás tener todo claro para <span className="text-[#e7b184]">dar el próximo paso.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#e7e2d5]/80 md:text-xl">
              Senda es un mapa vivo para explorar tu trabajo, tu identidad y lo que querés construir. Empezá por el punto en el que estás hoy.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="#donde-estoy" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e7b184] px-7 font-semibold text-[#173b31] hover:bg-[#f0c49f]">
                Entrar a la senda <ArrowDown className="h-4 w-4" />
              </Link>
              <Link href="/diagnostico/ancla-de-carrera" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-7 font-semibold text-white hover:bg-white/10">
                Hacer el diagnóstico gratuito
              </Link>
            </div>
          </div>

          <div aria-label="Mapa ilustrado de una senda entre montañas" className="relative mx-auto aspect-square w-full max-w-[520px]">
            <div className="absolute inset-[8%] rounded-full border border-[#d8e2cc]/20" />
            <div className="absolute inset-[18%] rounded-full border border-dashed border-[#d8e2cc]/25" />
            <Trees className="absolute left-[8%] top-[42%] h-24 w-24 text-[#8fac91]" strokeWidth={1.2} />
            <Trees className="absolute right-[4%] top-[20%] h-32 w-32 text-[#70937b]" strokeWidth={1.1} />
            <Map className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 text-[#e7b184]" strokeWidth={0.8} />
            <div className="absolute left-[48%] top-[12%] h-4 w-4 rounded-full bg-[#e7b184] shadow-[0_0_0_10px_rgba(231,177,132,.12)]" />
            <div className="absolute bottom-[12%] right-[28%] rounded-full border border-[#d8e2cc]/25 bg-[#173b31]/80 px-4 py-2 text-xs text-[#d8e2cc] backdrop-blur">Tu mapa no es lineal</div>
          </div>
        </div>
      </section>

      <section id="donde-estoy" className="relative px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[.22em] text-[#9a5b3d]">Primer hito · ubicarse</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:items-end">
            <h2 className="font-heading text-4xl font-semibold leading-tight tracking-[-.035em] md:text-6xl">¿En qué punto de tu camino estás?</h2>
            <p className="max-w-xl text-lg leading-8 text-[#53665e]">No hay una respuesta correcta. Reconocer el momento actual es una forma concreta de empezar a orientarte.</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {moments.map((moment) => (
              <article key={moment.number} className="group rounded-[2rem] border border-[#20372f]/12 bg-[#faf7ee] p-7 transition-transform hover:-translate-y-1">
                <span className="text-sm font-bold text-[#b56e4c]">{moment.number}</span>
                <h3 className="mt-10 font-heading text-2xl font-semibold">{moment.title}</h3>
                <p className="mt-3 leading-7 text-[#65746d]">{moment.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cruce-de-caminos" className="relative bg-[#dce3d4] px-5 py-24 md:px-8 md:py-32">
        <div className="absolute left-1/2 top-0 h-full w-px bg-[#20372f]/12" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.22em] text-[#6a765f]">Cruce de caminos</p>
            <h2 className="mt-5 font-heading text-4xl font-semibold tracking-[-.035em] md:text-6xl">Una vida profesional tiene más de una senda.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#53665e]">Podés explorar una, volver atrás o conectar varias. El recorrido se construye con preguntas, no con fórmulas.</p>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {paths.map(({ icon: Icon, title, text, tone }) => (
              <article key={title} className="rounded-[1.75rem] border border-[#20372f]/10 bg-[#f7f3e9] p-5 shadow-[0_18px_45px_-34px_rgba(32,55,47,.45)]">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></div>
                <h3 className="mt-7 font-heading text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#607068]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div className="relative min-h-[430px] rounded-[2.5rem] bg-[#20372f] p-8 text-[#f8f2e6]">
            <div className="absolute left-1/2 top-10 h-[72%] w-24 -translate-x-1/2 rounded-[50%] border-x border-dashed border-[#e7b184]/60" />
            <div className="absolute left-1/2 top-16 h-5 w-5 -translate-x-1/2 rounded-full bg-[#e7b184]" />
            <div className="absolute bottom-16 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-[#e7b184] bg-[#20372f]" />
            <p className="absolute bottom-7 left-8 right-8 text-center text-sm text-[#d5dfd0]">Cada respuesta abre una pregunta mejor.</p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[.22em] text-[#9a5b3d]">Una herramienta para empezar</p>
            <h2 className="mt-5 font-heading text-4xl font-semibold tracking-[-.035em] md:text-6xl">Descubrí qué sostiene tus decisiones.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#53665e]">El test de Anclas de Carrera te ayuda a reconocer capacidades, motivaciones y valores que no querés abandonar. Es gratuito, orientativo y podés hacerlo una vez.</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#53665e]">
              <span className="rounded-full border border-[#20372f]/15 px-4 py-2">10–12 minutos</span>
              <span className="rounded-full border border-[#20372f]/15 px-4 py-2">Resultado inmediato</span>
              <span className="rounded-full border border-[#20372f]/15 px-4 py-2">Sin diagnóstico clínico</span>
            </div>
            <Link href="/diagnostico/ancla-de-carrera" className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#20372f] px-7 font-semibold text-white hover:bg-[#315346]">
              Empezar el test <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#e8cdb7] px-5 py-24 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <HeartHandshake className="h-10 w-10 text-[#7b452e]" />
            <h2 className="mt-6 max-w-3xl font-heading text-4xl font-semibold tracking-[-.035em] md:text-6xl">Algunas partes del camino se transitan mejor en compañía.</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[#604d43]">Si querés profundizar, podés conversar con nuestro equipo o con un profesional recomendado. Sin respuestas automáticas que pretendan reemplazar una escucha humana.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contacto" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#20372f] px-7 font-semibold text-white hover:bg-[#315346]">Contactar al equipo</Link>
              <Link href="/diagnostico" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#20372f]/25 px-7 font-semibold text-[#20372f] hover:bg-white/20"><BookOpen className="h-4 w-4" /> Ver recursos</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
