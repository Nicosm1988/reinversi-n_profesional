import { describe, expect, it } from "vitest";
import englishMessages from "@/messages/en.json";
import spanishMessages from "@/messages/es.json";

function flattenMessages(
  value: Record<string, unknown>,
  prefix = "",
  output: Record<string, string> = {},
) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") {
      output[path] = child;
    } else if (child && typeof child === "object" && !Array.isArray(child)) {
      flattenMessages(child as Record<string, unknown>, path, output);
    }
  }

  return output;
}

function interpolationTokens(message: string) {
  return [...message.matchAll(/\{([^}]+)\}|<\/?([a-zA-Z][\w-]*)>/g)]
    .map((match) => (match[1] ? `{${match[1]}}` : `<${match[2]}>`))
    .sort();
}

describe("translation catalogs", () => {
  const spanish = flattenMessages(spanishMessages);
  const english = flattenMessages(englishMessages);

  it("keeps exact key and interpolation parity", () => {
    expect(Object.keys(english).sort()).toEqual(Object.keys(spanish).sort());

    for (const key of Object.keys(spanish)) {
      expect(interpolationTokens(english[key]), key).toEqual(
        interpolationTokens(spanish[key]),
      );
    }
  });

  it("preserves the five Senda territories", () => {
    expect(spanishMessages.Home.territories.items).toEqual({
      work: {
        title: "Trabajo",
        description: "Qué lugar ocupa el trabajo en tu vida y qué querés construir.",
      },
      identity: {
        title: "Identidad",
        description:
          "Quién sos cuando tu título o rol profesional ya no te representan.",
      },
      learning: {
        title: "Aprendizaje",
        description: "Qué necesitás aprender, desaprender o explorar.",
      },
      purpose: {
        title: "Propósito",
        description: "Qué dirección tiene sentido para vos en esta etapa.",
      },
      technology: {
        title: "Tecnología",
        description: "Cómo convivir en la nueva era tecnológica.",
      },
    });
  });

  it("publishes the complete 6/8/8 process journeys without public prices", () => {
    expect(Object.keys(spanishMessages.Processes.items.orientation.stages)).toHaveLength(6);
    expect(Object.keys(spanishMessages.Processes.items.reinvention.stages)).toHaveLength(8);
    expect(Object.keys(spanishMessages.Processes.items.transition.stages)).toHaveLength(8);

    for (const catalog of [spanishMessages, englishMessages]) {
      const publicCopy = JSON.stringify({
        home: catalog.Home,
        processes: catalog.Processes,
        diagnostic: catalog.InitialDiagnostic,
      });
      expect(publicCopy).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);
    }
  });

  it("does not expose a business-hours block", () => {
    for (const catalog of [spanish, english]) {
      expect(
        Object.keys(catalog).some((key) => /sidebarHours/i.test(key)),
      ).toBe(false);
      expect(
        Object.values(catalog).some((message) =>
          /Horario de atención|Lunes a viernes, 9:00|Monday through Friday, 9:00/i.test(
            message,
          ),
        ),
      ).toBe(false);
    }
  });
});
