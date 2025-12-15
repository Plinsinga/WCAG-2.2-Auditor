import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ReportData, WCAGResult, WCAGLevel, Principle, Criterion } from "../types";
import { WCAG22_TEMPLATE } from "../data/wcag22";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Internal helper enums for AI communication (English codes are more reliable for LLMs)
enum AiResultStatus {
  PASS = "PASS",
  FAIL = "FAIL",
  NOT_CHECKED = "NOT_CHECKED",
  NA = "NA",
  OUT_OF_SCOPE = "OUT_OF_SCOPE"
}

// Map AI status codes to the Dutch UI strings defined in WCAGResult
const STATUS_MAP: Record<string, WCAGResult> = {
  [AiResultStatus.PASS]: WCAGResult.PASS,
  [AiResultStatus.FAIL]: WCAGResult.FAIL,
  [AiResultStatus.NOT_CHECKED]: WCAGResult.NOT_CHECKED,
  [AiResultStatus.NA]: WCAGResult.NA,
  [AiResultStatus.OUT_OF_SCOPE]: WCAGResult.OUT_OF_SCOPE,
};

// Updated schema to use the English codes
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
            enum: Object.values(AiResultStatus), // ["PASS", "FAIL", "NOT_CHECKED", "NA", "OUT_OF_SCOPE"]
          },
          reason: { type: Type.STRING, description: "Reason why it is NOT_CHECKED, NA or OUT_OF_SCOPE." },
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

// Helper to clean HTML to reduce token usage
const cleanHtml = (html: string): string => {
  if (!html) return "";
  
  let cleaned = html;

  // 1. Remove base64 image data (src, href, srcset) - massive token saver
  // Using global case-insensitive replacement
  cleaned = cleaned.replace(/src=["']data:[^"']*["']/gi, 'src="[BASE64_IMAGE_REMOVED]"');
  cleaned = cleaned.replace(/srcset=["']data:[^"']*["']/gi, 'srcset="[BASE64_DATA_REMOVED]"');
  cleaned = cleaned.replace(/href=["']data:[^"']*["']/gi, 'href="[BASE64_DATA_REMOVED]"');
  
  // 2. Remove base64 in css url()
  cleaned = cleaned.replace(/url\(['"]?data:[^)]*['"]?\)/gi, 'url([BASE64_DATA_REMOVED])');

  // 3. Remove SVG paths/content (often huge inline SVGs)
  // We keep the svg tag so the auditor knows there is an image, but remove the path data
  cleaned = cleaned.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, (match) => {
    if (match.length > 200) return '<svg>[SVG_CONTENT_REMOVED_FOR_BREVITY]</svg>';
    return match;
  });

  // 4. Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  // 5. Remove scripts content. Scripts are often large and less relevant for basic HTML structure WCAG (except interaction)
  // Inline scripts: <script>...</script>. 
  cleaned = cleaned.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '<script>[SCRIPT_CONTENT_REMOVED]</script>');
  
  // 6. Remove style content.
  cleaned = cleaned.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '<style>[STYLE_CONTENT_REMOVED]</style>');

  return cleaned;
};

export const analyzeHtml = async (htmlCode: string, userMeta: ReportData['meta']): Promise<ReportData> => {
  const model = "gemini-2.5-flash";
  
  // Create a deep copy of the template
  const report: ReportData = JSON.parse(JSON.stringify(WCAG22_TEMPLATE));
  report.meta = userMeta;

  // Pre-process HTML to avoid token limits
  // 1 token approx 4 chars. 1M tokens limit.
  // We strictly limit input to 200,000 characters (approx 50k-80k tokens) to be extremely safe.
  // This is sufficient for auditing the structure of even large pages.
  const MAX_CHARS = 200000; 
  let processedHtml = cleanHtml(htmlCode);
  
  if (processedHtml.length > MAX_CHARS) {
    console.warn(`HTML input too large (${processedHtml.length} chars). Truncating to ${MAX_CHARS} chars.`);
    processedHtml = processedHtml.substring(0, MAX_CHARS) + "\n\n<!-- HTML TRUNCATED DUE TO SIZE LIMIT -->";
  }

  // Extract ALL criteria IDs and Names to force the AI to check them
  const allCriteriaList = report.principles
    .flatMap(p => p.criteria)
    .map(c => `- ${c.id}: ${c.name}`)
    .join("\n");

  const systemInstruction = `
    Je bent een senior toegankelijkheidsconsultant. Je voert een WCAG 2.2 AA audit uit.
    
    Jouw taak: Analyseer de HTML en beoordeel ELK criterium uit onderstaande lijst.
    
    CRITERIA LIJST (VERPLICHT ALLES BEOORDELEN):
    ${allCriteriaList}

    Voor elk criterium, kies één van deze status codes (gebruik exact deze Engelse termen):
    - PASS (Voldoet: correct geïmplementeerd)
    - FAIL (Voldoet niet: fouten gevonden)
    - NA (Niet relevant: content niet aanwezig, bijv. geen video/audio)
    - OUT_OF_SCOPE (Buiten scope: 3rd party content, niet testbaar)
    - NOT_CHECKED (Niet onderzocht: kan niet automatisch bepaald worden zonder context/JS/menselijke blik)

    BELANGRIJK:
    1. Geef voor ALLE items uit de lijst een resultaat in de JSON output.
    2. Bij FAIL: vul 'findings' array met specifieke fouten.
    3. Bij NA/NOT_CHECKED/OUT_OF_SCOPE: vul ALTIJD het 'reason' veld met korte uitleg.
    4. Wees streng maar rechtvaardig.
  `;

  const userPrompt = `
    Voer de audit uit op de volgende HTML code (ingekort en opgeschoond voor analyse):
    
    \`\`\`html
    ${processedHtml}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    if (response.text) {
      const analysis = JSON.parse(response.text) as {
        conclusion: string;
        feedback: string;
        criteria_results: { id: string; result: AiResultStatus; reason?: string; findings?: any[] }[];
      };

      // Merge AI analysis into the template
      report.summary.conclusion = analysis.conclusion || "Geen conclusie gegenereerd.";
      report.summary.feedback = analysis.feedback || "";

      const resultsMap = new Map(analysis.criteria_results.map(r => [r.id.trim(), r]));

      report.principles.forEach(p => {
        p.criteria.forEach(c => {
          if (resultsMap.has(c.id)) {
            const aiResult = resultsMap.get(c.id)!;
            
            // Map the English AI code to the Dutch WCAGResult enum
            if (STATUS_MAP[aiResult.result]) {
              c.result = STATUS_MAP[aiResult.result];
            } else {
              // Fallback default
              c.result = WCAGResult.NOT_CHECKED;
            }
            
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
    throw error;
  }
};