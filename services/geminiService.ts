import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ReportData, WCAGResult, WCAGLevel, Principle, Criterion } from "../types";
import { WCAG22_TEMPLATE } from "../data/wcag22";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Updated schema to include new result types
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    conclusion: { type: Type.STRING },
    feedback: { type: Type.STRING },
    criteria_results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          result: {
            type: Type.STRING,
            enum: [
              WCAGResult.PASS,
              WCAGResult.FAIL,
              WCAGResult.NOT_CHECKED,
              WCAGResult.NA,
              WCAGResult.OUT_OF_SCOPE,
            ],
          },
          reason: { type: Type.STRING, description: "Reason why it is Nog niet onderzocht, Niet relevant or Buiten scope." },
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
        required: ["id", "result"],
      },
    },
  },
  required: ["conclusion", "feedback", "criteria_results"],
};

export const analyzeHtml = async (htmlCode: string, userMeta: ReportData['meta']): Promise<ReportData> => {
  const model = "gemini-2.5-flash";
  
  // Create a deep copy of the template to avoid mutating the constant
  const report: ReportData = JSON.parse(JSON.stringify(WCAG22_TEMPLATE));
  report.meta = userMeta;

  const prompt = `
    Je bent een senior toegankelijkheidsconsultant. Je voert een WCAG 2.2 AA audit uit op de volgende HTML code.
    
    Jouw taak is om de HTML te analyseren en voor ELK relevant succescriterium exact één van de volgende statussen te kiezen:
    
    1. "Voldoet" (PASS) - Als uit de code blijkt dat het criterium correct is geïmplementeerd.
    2. "Voldoet niet" (FAIL) - Als er duidelijke fouten zijn gevonden.
    3. "Niet relevant" (NA) - Als de content waar dit criterium over gaat NIET aanwezig is (bijv. geen video, geen audio, geen tijdslimieten).
    4. "Buiten scope" (OUT_OF_SCOPE) - Als de content aanwezig is maar buiten de controle van deze audit valt (bijv. 3rd party widgets).
    5. "Nog niet onderzocht" (NOT_CHECKED) - Voor zaken die je niet automatisch kunt vaststellen (bijv. subjectieve designs, toetsenbord navigatie zonder JS context).

    HTML CODE OM TE ANALYSEREN:
    \`\`\`html
    ${htmlCode}
    \`\`\`

    INSTRUCTIES:
    1. Wees streng maar rechtvaardig.
    2. Voor statussen anders dan PASS/FAIL, geef ALTIJD een korte \`reason\` (reden).
       - Bijv: bij 'Niet relevant': "Geen video content aanwezig."
       - Bijv: bij 'Nog niet onderzocht': "Vereist handmatige controle van tab-volgorde."
    3. Voor 'Voldoet niet' (FAIL), genereer specifieke bevindingen.

    Geef ook een algemene conclusie en feedback.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    if (response.text) {
      const analysis = JSON.parse(response.text) as {
        conclusion: string;
        feedback: string;
        criteria_results: { id: string; result: WCAGResult; reason?: string; findings?: any[] }[];
      };

      // Merge AI analysis into the template
      report.summary.conclusion = analysis.conclusion || "Geen conclusie gegenereerd.";
      report.summary.feedback = analysis.feedback || "";

      const resultsMap = new Map(analysis.criteria_results.map(r => [r.id, r]));

      report.principles.forEach(p => {
        p.criteria.forEach(c => {
          if (resultsMap.has(c.id)) {
            const aiResult = resultsMap.get(c.id)!;
            c.result = aiResult.result;
            
            // Map reason if present
            if (aiResult.reason) {
              c.reason = aiResult.reason;
            }

            if (aiResult.findings && aiResult.findings.length > 0) {
              c.findings = aiResult.findings;
            }
          }
        });
      });

      // Recalculate stats for summary scores
      let totalPass22 = 0, totalTotal22 = 0;

      report.principles.forEach(p => {
        let pPass = 0, pFail = 0;
        p.criteria.forEach(c => {
          if (c.level === WCAGLevel.A || c.level === WCAGLevel.AA) {
             const isPass = c.result === WCAGResult.PASS;
             const isFail = c.result === WCAGResult.FAIL;
             
             if (isPass) pPass++;
             if (isFail) pFail++;
          }
        });
        p.stats = { pass: pPass, fail: pFail, total: p.criteria.length };
        
        totalPass22 += pPass;
        totalTotal22 += p.criteria.length;
      });

      report.summary.scores.wcag22 = { pass: totalPass22, total: totalTotal22 };
      report.summary.scores.wcag21 = { pass: totalPass22, total: totalTotal22 };

      return report;
    }
    throw new Error("No response generated");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    report.summary.conclusion = "Fout bij AI analyse. Probeer het opnieuw.";
    return report;
  }
};