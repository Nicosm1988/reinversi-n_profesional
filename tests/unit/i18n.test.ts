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

  it("publishes exactly two journeys and one split situations section", () => {
    expect(Object.keys(spanishMessages.Home.journeys.items)).toEqual([
      "compass",
      "newStage",
    ]);
    expect(Object.keys(spanishMessages.Home.situations.items)).toEqual([
      "compass",
      "newStage",
    ]);
    expect("territories" in spanishMessages.Home).toBe(false);
    expect("manifesto" in spanishMessages.Home).toBe(false);
    expect(spanishMessages.Contact.reasonCompass).toBe("Brújula");
    expect(spanishMessages.Contact.reasonNewStage).toBe("Nueva Etapa Profesional");
    expect("reasonVocational" in spanishMessages.Contact).toBe(false);

    for (const legacyNamespace of [
      "Hero",
      "Trust",
      "Problem",
      "Method",
      "Paths",
      "Services",
      "FAQ",
      "Diagnostics",
      "Journey",
    ]) {
      expect(legacyNamespace in spanishMessages).toBe(false);
      expect(legacyNamespace in englishMessages).toBe(false);
    }
  });

  it("publishes the complete 6/8 journeys without public prices", () => {
    expect(Object.keys(spanishMessages.Processes.items)).toEqual([
      "compass",
      "newStage",
    ]);
    expect(Object.keys(spanishMessages.Processes.items.compass.stages)).toHaveLength(6);
    expect(Object.keys(spanishMessages.Processes.items.newStage.stages)).toHaveLength(8);

    for (const catalog of [spanishMessages, englishMessages]) {
      const publicCopy = JSON.stringify({
        home: catalog.Home,
        processes: catalog.Processes,
        diagnostic: catalog.InitialDiagnostic,
      });
      expect(publicCopy).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);
    }
  });

  it("does not publish the retired journey names", () => {
    for (const catalog of [spanishMessages, englishMessages]) {
      expect(JSON.stringify(catalog)).not.toMatch(
        /orientaci[oó]n vocacional|vocational guidance|reinvenci[oó]n profesional|professional reinvention|transici[oó]n laboral|career transition/i,
      );
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
