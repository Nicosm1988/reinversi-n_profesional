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
      "roleTransition",
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
    expect(spanishMessages.Header.navAbout).toBe("Quiénes somos");
    expect(spanishMessages.AboutMe.story.highlights).toHaveLength(4);
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
      "roleTransition",
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

  it("presents Career Anchors consistently as a 40-statement instrument", () => {
    const spanishPresentations = [
      spanishMessages.ProcessPopup.description,
      spanishMessages.Panel.emptyDescription,
      spanishMessages.Login.termsNotice,
      spanishMessages.CareerAnchorIntro.metadataTitle,
      spanishMessages.CareerAnchorIntro.metadataDescription,
      spanishMessages.CareerAnchorIntro.label,
      spanishMessages.CareerAnchorIntro.introContinuation,
      spanishMessages.CareerQuiz.metadataTitle,
      spanishMessages.CareerQuiz.metadataDescription,
      spanishMessages.CareerQuiz.introBadge,
      spanishMessages.CareerQuiz.introLead,
      spanishMessages.CareerQuiz.introFactStatements,
    ];
    const englishPresentations = [
      englishMessages.ProcessPopup.description,
      englishMessages.Panel.emptyDescription,
      englishMessages.Login.termsNotice,
      englishMessages.CareerAnchorIntro.metadataTitle,
      englishMessages.CareerAnchorIntro.metadataDescription,
      englishMessages.CareerAnchorIntro.label,
      englishMessages.CareerAnchorIntro.introContinuation,
      englishMessages.CareerQuiz.metadataTitle,
      englishMessages.CareerQuiz.metadataDescription,
      englishMessages.CareerQuiz.introBadge,
      englishMessages.CareerQuiz.introLead,
      englishMessages.CareerQuiz.introFactStatements,
    ];

    for (const message of spanishPresentations) {
      expect(message).toMatch(/\b40 enunciados\b/i);
    }
    for (const message of englishPresentations) {
      expect(message).toMatch(/\b40 statements\b/i);
    }

    const spanishCareerCopy = JSON.stringify({
      intro: spanishMessages.CareerAnchorIntro,
      quiz: spanishMessages.CareerQuiz,
      popup: spanishMessages.ProcessPopup,
      panel: spanishMessages.Panel.emptyDescription,
      login: spanishMessages.Login.termsNotice,
    });
    const englishCareerCopy = JSON.stringify({
      intro: englishMessages.CareerAnchorIntro,
      quiz: englishMessages.CareerQuiz,
      popup: englishMessages.ProcessPopup,
      panel: englishMessages.Panel.emptyDescription,
      login: englishMessages.Login.termsNotice,
    });

    expect(spanishCareerCopy).not.toMatch(
      /\b40\s+(?:preguntas|ítems|items|afirmaciones)\b/i,
    );
    expect(englishCareerCopy).not.toMatch(/\b40\s+affirmations\b/i);
  });

  it("keeps internal notification recipients and consent copy out of public messages", () => {
    for (const catalog of [spanishMessages, englishMessages]) {
      const publicCopy = JSON.stringify({
        privacy: catalog.Privacy,
        terms: catalog.Terms,
        careerQuiz: catalog.CareerQuiz,
        resultShare: catalog.ResultShare,
      });

      expect(publicCopy).not.toContain("tanisardella@gmail.com");
      expect(JSON.stringify(catalog.CareerQuiz)).not.toContain(
        "hola@universosenda.com",
      );
      expect(Object.keys(catalog.CareerQuiz)).not.toEqual(
        expect.arrayContaining([
          "reportConsentTitle",
          "reportConsentDescription",
          "reportConsentLabel",
          "reportConsentRequired",
        ]),
      );
    }

    expect(spanishMessages.Privacy.section1Text).toContain(
      "hola@universosenda.com",
    );
    expect(englishMessages.Privacy.section1Text).toContain(
      "hola@universosenda.com",
    );
  });

  it("keeps AI processing copy out of the Career Anchors introduction", () => {
    expect(spanishMessages.CareerQuiz.introPrivacyTitle).toBe("Privacidad");
    expect(spanishMessages.CareerQuiz.introProfessionalDisclaimer).toBe(
      "Este test no reemplaza una consulta con una persona profesional.",
    );
    expect(englishMessages.CareerQuiz.introPrivacyTitle).toBe("Privacy");
    expect(englishMessages.CareerQuiz.introProfessionalDisclaimer).toBe(
      "This test does not replace a consultation with a qualified professional.",
    );

    for (const catalog of [spanishMessages, englishMessages]) {
      expect(JSON.stringify(catalog.CareerQuiz)).not.toMatch(
        /\b(?:IA|AI)\b|inteligencia artificial|artificial intelligence/i,
      );
      expect("introPrivacyText" in catalog.CareerQuiz).toBe(false);
      expect("introScopeTitle" in catalog.CareerQuiz).toBe(false);
      expect("introScopeText" in catalog.CareerQuiz).toBe(false);
      expect(catalog.CareerQuiz.resultsDisclaimer).toMatch(
        /no reemplaza una consulta|does not replace a consultation/i,
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
