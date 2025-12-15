import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ReportData, WCAGResult, WCAGLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    // We keep meta in schema to handle potential AI generated fallbacks, 
    // but we will overwrite it with user input in the function.
    meta: {
      type: Type.OBJECT,
      properties: {
        client: { type: Type.STRING },
        product: { type: Type.STRING },
        date: { type: Type.STRING },
        version: { type: Type.STRING },
        researchers: { type: Type.STRING },
      },
    },
    scope: {
      type: Type.OBJECT,
      properties: {
        inScope: { type: Type.ARRAY, items: { type: Type.STRING } },
        outScope: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        conclusion: { type: Type.STRING },
        feedback: { type: Type.STRING },
        scores: {
          type: Type.OBJECT,
          properties: {
            wcag21: {
              type: Type.OBJECT,
              properties: {
                pass: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
              },
            },
            wcag22: {
              type: Type.OBJECT,
              properties: {
                pass: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
              },
            },
          },
        },
      },
    },
    principles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          stats: {
            type: Type.OBJECT,
            properties: {
              pass: { type: Type.NUMBER },
              fail: { type: Type.NUMBER },
              total: { type: Type.NUMBER },
            },
          },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                level: { type: Type.STRING, enum: [WCAGLevel.A, WCAGLevel.AA] },
                result: {
                  type: Type.STRING,
                  enum: [
                    WCAGResult.PASS,
                    WCAGResult.FAIL,
                    WCAGResult.NA,
                    WCAGResult.NOT_CHECKED,
                  ],
                },
                findings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      location: { type: Type.STRING },
                      observation: { type: Type.STRING },
                      problemDescription: { type: Type.STRING },
                      impact: { type: Type.STRING },
                      advice: { type: Type.STRING },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const analyzeHtml = async (htmlCode: string, userMeta: ReportData['meta']): Promise<ReportData> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Je bent een senior toegankelijkheidsconsultant en technical writer. Je schrijft formele, verifieerbare WCAG 2.2 AA-auditrapporten, uitsluitend op basis van expliciet aangeleverde input.

    ABSOLUUT VERBOD OP HALLUCINATIE
    Dit is een harde eis en heeft altijd prioriteit boven volledigheid, leesbaarheid of stijl:

    1) Je mag NOOIT:
       - aannames doen
       - ontbrekende informatie invullen
       - voorbeelden verzinnen
       - scores, aantallen, pagina’s, schermen, tools, datums of bevindingen afleiden
       - “typische” WCAG-problemen toevoegen
       - algemene best-practices presenteren als geconstateerde bevindingen

    2) Alles wat niet letterlijk of ondubbelzinnig uit de input blijkt, MOET je markeren als "Geen oordeel" (gebruik de enum waarde: NOT_CHECKED).

    3) Als een succescriterium:
       - niet met zekerheid is te controleren op basis van de snippet -> Resultaat: NOT_CHECKED ("Geen oordeel")
       - niet in de input voorkomt -> Resultaat: NOT_CHECKED ("Geen oordeel")
       - geen bewijs bevat -> GEEN conclusie trekken, dus NOT_CHECKED ("Geen oordeel")

    4) Je gebruikt uitsluitend:
       - de aangeleverde HTML snippet
       - de WCAG 2.2 niveau A en AA criteria

    5) Je generaliseert NOOIT van:
       - de snippet naar de hele site
       tenzij dit expliciet in de input staat vermeld.

    6) Resultaten Mapping:
       - Voldoet (PASS): Alleen als je 100% zeker weet dat de code correct is volgens de specificatie.
       - Voldoet niet (FAIL): Alleen als je een duidelijke fout ziet in de snippet.
       - Niet van toepassing (NA): Als het criterium logischerwijs niet kan voorkomen (bijv. video-eisen op een tekst-snippet).
       - Geen oordeel (NOT_CHECKED): IN ALLE ANDERE GEVALLEN. Als je twijfelt, als de code incompleet is, of als je context mist. Dit is de standaard fallback.
    
    7) VOLLEDIGHEID:
       - Neem ALLE WCAG 2.2 niveau A en AA succescriteria op in de 'principles' array, ongeacht het resultaat.
       - Ook criteria die NA (Niet van toepassing) of NOT_CHECKED (Geen oordeel) zijn, MOETEN in de lijst staan.
       - Ik wil een compleet overzicht van alle normen.

    8) Metadata:
       - De metadata (opdrachtgever, datum, etc) wordt door de gebruiker aangeleverd en later ingevoegd. Je mag voor de "meta" sectie placeholders gebruiken of "Zie input" invullen. Focus je volledig op de technische audit.

    HTML SNIPPET OM TE ANALYSEREN:
    \`\`\`html
    ${htmlCode}
    \`\`\`

    Genereer de output strikt volgens het gedefinieerde JSON schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ReportData;
      // Overwrite the metadata with the user provided inputs to guarantee accuracy and no hallucinations
      data.meta = userMeta;
      return data;
    }
    throw new Error("No response generated");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};