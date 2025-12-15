import { ReportData, WCAGResult } from '../types';

export const generateMarkdown = (data: ReportData): string => {
  const meta = data.meta || { product: 'Onbekend', client: 'Onbekend', date: '', version: '', researchers: '' };
  const scope = data.scope || { inScope: [], outScope: [] };
  const summary = data.summary || { conclusion: '', feedback: '', scores: { wcag21: {pass:0, total:0}, wcag22: {pass:0, total:0} } };
  const principles = data.principles || [];

  let md = `# WCAG 2.2 onderzoek niveau AA\n\n`;
  
  // Metadata
  md += `**Onderwerp:** ${meta.product || 'Onbekend'}\n`;
  md += `**Opdrachtgever:** ${meta.client || 'Onbekend'}\n`;
  md += `**Datum:** ${meta.date || 'Onbekend'}\n`;
  md += `**Versie:** ${meta.version || '1.0'}\n`;
  md += `**Onderzoeker:** ${meta.researchers || 'Onbekend'}\n\n`;

  // Inleiding
  md += `## Inleiding\n\n`;
  md += `Dit rapport bevat de resultaten van een automatische validatie op basis van de aangeleverde HTML-code conform WCAG 2.2 niveau AA.\n\n`;
  
  if (scope.inScope && scope.inScope.length > 0) {
    md += `### Scope\n`;
    scope.inScope.forEach(item => md += `- ${item}\n`);
    md += `\n`;
  }
  
  if (scope.outScope && scope.outScope.length > 0) {
    md += `**Buiten scope:**\n`;
    scope.outScope.forEach(item => md += `- ${item}\n`);
    md += `\n`;
  }

  // Samenvatting
  md += `## Samenvatting\n\n`;
  md += `**Conclusie:** ${summary.conclusion || 'N/A'}\n\n`;
  md += `**Feedback:**\n${summary.feedback || 'N/A'}\n\n`;
  
  md += `### Scores\n\n`;
  md += `| Norm | Voldoet | Totaal | Score |\n`;
  md += `|---|---|---|---|\n`;
  
  const score21 = summary.scores?.wcag21?.total > 0 
    ? Math.round((summary.scores.wcag21.pass / summary.scores.wcag21.total) * 100) 
    : 0;
  const score22 = summary.scores?.wcag22?.total > 0 
    ? Math.round((summary.scores.wcag22.pass / summary.scores.wcag22.total) * 100) 
    : 0;

  md += `| WCAG 2.1 (A+AA) | ${summary.scores?.wcag21?.pass || 0} | ${summary.scores?.wcag21?.total || 0} | ${score21}% |\n`;
  md += `| WCAG 2.2 (A+AA) | ${summary.scores?.wcag22?.pass || 0} | ${summary.scores?.wcag22?.total || 0} | ${score22}% |\n\n`;

  // Beoordelingsoverzicht
  md += `## Beoordelingsoverzicht\n\n`;
  md += `| Criterium | Omschrijving | Niveau | Resultaat |\n`;
  md += `|---|---|---|---|\n`;
  
  principles.forEach(p => {
    (p.criteria || []).forEach(c => {
      md += `| ${c.id} | ${c.name} | ${c.level} | ${c.result} |\n`;
    });
  });
  md += `\n`;

  // Bevindingen per principe
  md += `## Bevindingen\n\n`;
  principles.forEach((p, index) => {
    md += `### Principe ${index + 1}: ${p.name}\n\n`;
    md += `*${p.description || ''}*\n\n`;
    
    const failures = (p.criteria || []).filter(c => c.result === WCAGResult.FAIL);
    
    if (failures.length === 0) {
      md += `Geen criteria die niet voldoen gevonden binnen dit principe.\n\n`;
    } else {
      failures.forEach(c => {
        md += `#### Succescriterium ${c.id}: ${c.name} (${c.level})\n`;
        md += `**Resultaat:** ${c.result}\n\n`;
        
        if (c.findings && c.findings.length > 0) {
          c.findings.forEach(f => {
            md += `- **Locatie:** ${f.location}\n`;
            md += `  **Probleem:** ${f.problemDescription}\n`;
            md += `  **Observatie:** ${f.observation}\n`;
            md += `  **Impact:** ${f.impact}\n`;
            md += `  **Advies:** ${f.advice}\n\n`;
          });
        } else {
           md += `Geen specifieke bevindingen details beschikbaar.\n\n`;
        }
      });
    }
  });

  // Bijlage
  if (scope.inScope && scope.inScope.length > 0) {
      md += `## Bijlage: Steekproef\n\n`;
      scope.inScope.forEach(item => md += `- ${item}\n`);
  }

  return md;
};