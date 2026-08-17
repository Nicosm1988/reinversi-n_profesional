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

  it("publishes six adult transition proposals and keeps Brújulas secondary", () => {
    const adultProposalKeys = [
      "direction",
      "jobChange",
      "project",
      "leadership",
      "focused",
      "education",
    ];

    expect(Object.keys(spanishMessages.Journeys.items)).toEqual([
      ...adultProposalKeys,
      "compass",
    ]);
    expect(Object.keys(spanishMessages.Home.situations.items)).toEqual(
      adultProposalKeys,
    );
    expect(Object.keys(spanishMessages.Home.signals.items)).toHaveLength(6);
    expect(spanishMessages.Home.compass.title).toBe("Brújulas");
    expect(spanishMessages.Header.navTransitions).toBe("Transiciones laborales");
    expect(spanishMessages.Header.navCompass).toBe("Brújulas");
    expect(spanishMessages.Header.navAbout).toBe("Sobre mí");
    expect(spanishMessages.AboutMe.structure.items).toHaveProperty("experience");
    expect(Object.keys(spanishMessages.AboutMe.structure.items)).toHaveLength(3);
    expect(spanishMessages.Header.navLaboratory).toBe("Laboratorio");
    expect(spanishMessages.Home.laboratory.status).toBe("Próximamente");
    expect(spanishMessages.NarrativesLab.hero.title).toBe(
      "Laboratorio de Narrativas Laborales Alternativas",
    );
    expect(Object.keys(spanishMessages.NarrativesLab.explorations.items)).toHaveLength(9);
    expect("journeys" in spanishMessages.Home).toBe(false);
    expect("phases" in spanishMessages.Home).toBe(false);
    expect("team" in spanishMessages.Home).toBe(false);
    expect("faq" in spanishMessages.Home).toBe(false);
    expect("territories" in spanishMessages.Home).toBe(false);
    expect("manifesto" in spanishMessages.Home).toBe(false);
    expect(spanishMessages.Contact.labelPhone).toBe("Teléfono");
    expect(spanishMessages.Contact.directWhatsapp).toContain("WhatsApp");
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

  it("publishes complete service structures without invented public prices", () => {
    expect(Object.keys(spanishMessages.Processes.items)).toEqual([
      "direction",
      "jobChange",
      "project",
      "leadership",
      "focused",
      "education",
      "compass",
    ]);
    expect(Object.keys(spanishMessages.Processes.items.direction.stages)).toHaveLength(7);
    expect(Object.keys(spanishMessages.Processes.items.jobChange.stages)).toHaveLength(8);
    expect(Object.keys(spanishMessages.Processes.items.project.stages)).toHaveLength(9);
    expect(Object.keys(spanishMessages.Processes.items.leadership.stages)).toHaveLength(9);
    expect(Object.keys(spanishMessages.Processes.items.focused.stages)).toHaveLength(6);
    expect(Object.keys(spanishMessages.Processes.items.education.stages)).toHaveLength(9);

    for (const catalog of [spanishMessages, englishMessages]) {
      const publicCopy = JSON.stringify({
        home: catalog.Home,
        journeys: catalog.Journeys,
        processes: catalog.Processes,
        diagnostic: catalog.InitialDiagnostic,
      });
      expect(publicCopy).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);
    }
  });

  it("does not publish retired positioning or service names", () => {
    for (const catalog of [spanishMessages, englishMessages]) {
      expect(JSON.stringify(catalog)).not.toMatch(
        /orientaci[oó]n vocacional|vocational guidance|reinvenci[oó]n|reinventarse|reinvention|nueva etapa profesional|new professional stage/i,
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
