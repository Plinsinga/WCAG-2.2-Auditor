import { ReportData, WCAGResult, WCAGLevel } from '../types';

export const generateHtml = (data: ReportData): string => {
  const meta = data.meta || { product: 'Onbekend', client: 'Onbekend', date: '', version: '', researchers: '' };
  const scope = data.scope || { inScope: [], outScope: [] };
  const summary = data.summary || { conclusion: '', feedback: '', scores: { wcag21: { pass: 0, total: 0 }, wcag22: { pass: 0, total: 0 } } };
  const principles = data.principles || [];

  // Helper for safe stats
  const calculateStats = (level: WCAGLevel) => {
    let pass = 0, fail = 0, notChecked = 0, na = 0, total = 0;
    principles.forEach(p => {
      (p.criteria || []).forEach(c => {
        if (c.level === level) {
          total++;
          if (c.result === WCAGResult.PASS) pass++;
          else if (c.result === WCAGResult.FAIL) fail++;
          else if (c.result === WCAGResult.NOT_CHECKED) notChecked++;
          else if (c.result === WCAGResult.NA) na++;
        }
      });
    });
    return { pass, fail, notChecked, na, total };
  };

  const statsA = calculateStats(WCAGLevel.A);
  const statsAA = calculateStats(WCAGLevel.AA);
  const totalStats = {
    pass: statsA.pass + statsAA.pass,
    fail: statsA.fail + statsAA.fail,
    notChecked: statsA.notChecked + statsAA.notChecked,
    na: statsA.na + statsAA.na,
    total: statsA.total + statsAA.total
  };

  const css = `
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
    .container { max-width: 900px; margin: 0 auto; background: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .page { padding: 40px; min-height: 800px; border-bottom: 1px solid #eee; position: relative; }
    .cover { background: linear-gradient(135deg, #2e0b1f 0%, #a61e38 100%); color: white; display: flex; flex-direction: column; justify-content: space-between; height: 900px; }
    h1 { font-size: 3.5rem; margin-bottom: 20px; font-family: Georgia, serif; }
    h2 { color: #a61e38; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 30px; }
    h3 { color: #333; margin-top: 20px; }
    .principle-header { background: #eee6e9; color: #2e0b1f; padding: 15px; margin-top: 40px; border-radius: 4px; }
    .meta-block { border-top: 1px solid rgba(255,255,255,0.3); padding-top: 20px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9rem; }
    th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
    th { background-color: #f8f8f8; font-weight: bold; }
    .status-pass { color: #166534; font-weight: bold; }
    .status-fail { color: #dc2626; font-weight: bold; }
    .status-na { color: #9ca3af; }
    .status-nc { color: #d97706; }
    .card { background: #fff; border-left: 5px solid #ddd; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .card.fail { border-left-color: #dc2626; background: #fef2f2; }
    .card.pass { border-left-color: #166534; bg-color: #f0fdf4; }
    .card.na, .card.nc { border-left-color: #9ca3af; background: #f9fafb; }
    .finding { background: #fff; padding: 15px; margin-top: 10px; border: 1px solid #eee; }
    @media print {
      body { background: #fff; }
      .container { box-shadow: none; max-width: 100%; }
      .page { page-break-after: always; min-height: 0; height: auto; border: none; }
    }
  `;

  let html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>WCAG Rapport - ${meta.product}</title>
  <style>${css}</style>
</head>
<body>
<div class="container">
  
  <!-- COVER -->
  <div class="page cover">
    <div style="margin-top: 100px;">
      <h1>Een check<br>op WCAG<br>richtlijnen<br>bij ${meta.product}</h1>
    </div>
    <div class="meta-block">
      <p><strong>NORM:</strong> WCAG 2.2, niveau AA</p>
      <p>${meta.researchers}<br>${meta.client}<br>${meta.date}</p>
    </div>
  </div>

  <!-- INLEIDING -->
  <div class="page">
    <h2>Inleiding</h2>
    <p>Dit rapport bevat de resultaten van een automatische validatie op basis van de aangeleverde HTML-code conform WCAG 2.2 niveau AA.</p>
    <p><em>"Door te voldoen aan WCAG-richtlijnen, kan de digitale wereld voor iedereen toegankelijk en inclusief worden gemaakt."</em></p>
    
    <h3>Vier principes</h3>
    <ul>
      <li><strong>Waarneembaar</strong></li>
      <li><strong>Bedienbaar</strong></li>
      <li><strong>Begrijpelijk</strong></li>
      <li><strong>Robuust</strong></li>
    </ul>
  </div>

  <!-- ONDERZOEK -->
  <div class="page">
    <h2>Onderzoek</h2>
    <h3>Scope</h3>
    <p>
      <strong>Onderwerp:</strong> ${meta.product}<br>
      <strong>Versie:</strong> ${meta.version}
    </p>
    <h3>Steekproef</h3>
    <ul>
      ${scope.inScope.length > 0 ? scope.inScope.map(i => `<li>${i}</li>`).join('') : '<li>Aangeleverde HTML snippet</li>'}
    </ul>
  </div>

  <!-- SAMENVATTING -->
  <div class="page">
    <h2>Samenvatting resultaten</h2>
    <p><strong>Conclusie:</strong> ${summary.conclusion}</p>
    
    <h3>Scores</h3>
    <table>
      <thead>
        <tr>
          <th>Niveau</th>
          <th>Voldoet</th>
          <th>Voldoet niet</th>
          <th>Niet onderzocht</th>
          <th>Buiten scope</th>
          <th>Totaal</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Niveau A</td>
          <td>${statsA.pass}</td>
          <td class="status-fail">${statsA.fail}</td>
          <td>${statsA.notChecked}</td>
          <td>${statsA.na}</td>
          <td>${statsA.total}</td>
        </tr>
        <tr>
          <td>Niveau AA</td>
          <td>${statsAA.pass}</td>
          <td class="status-fail">${statsAA.fail}</td>
          <td>${statsAA.notChecked}</td>
          <td>${statsAA.na}</td>
          <td>${statsAA.total}</td>
        </tr>
         <tr>
          <td><strong>Totaal</strong></td>
          <td><strong>${totalStats.pass}</strong></td>
          <td class="status-fail">${totalStats.fail}</td>
          <td>${totalStats.notChecked}</td>
          <td>${totalStats.na}</td>
          <td>${totalStats.total}</td>
        </tr>
      </tbody>
    </table>

    <h3>Aanbevelingen</h3>
    <p style="white-space: pre-line;">${summary.feedback}</p>
  </div>

  <!-- RESULTATEN TABELLEN -->
  <div class="page">
    <h2>Resultaten Overzicht</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 10%;">ID</th>
          <th style="width: 70%;">Richtlijn</th>
          <th style="width: 20%;">Resultaat</th>
        </tr>
      </thead>
      <tbody>
  `;

  principles.forEach(p => {
    (p.criteria || []).forEach(c => {
      let statusClass = '';
      if (c.result === WCAGResult.PASS) statusClass = 'status-pass';
      if (c.result === WCAGResult.FAIL) statusClass = 'status-fail';
      if (c.result === WCAGResult.NA) statusClass = 'status-na';
      if (c.result === WCAGResult.NOT_CHECKED) statusClass = 'status-nc';

      html += `
        <tr>
          <td>${c.id}</td>
          <td>${c.name} <span style="font-size:0.8em; color:#666;">(${c.level})</span></td>
          <td class="${statusClass}">${c.result}</td>
        </tr>
      `;
    });
  });

  html += `
      </tbody>
    </table>
  </div>
  `;

  // DETAILED CARDS GROUPED BY PRINCIPLE
  html += `<div class="page"><h2>Bevindingen Details</h2>`;
  
  principles.forEach((p, index) => {
    // Add Principle Header
    html += `
      <div class="principle-header">
        <h3>Principe ${index + 1}: ${p.name}</h3>
        <p>${p.description}</p>
      </div>
    `;

    (p.criteria || []).forEach(c => {
      let cardClass = 'nc';
      if (c.result === WCAGResult.PASS) cardClass = 'pass';
      if (c.result === WCAGResult.FAIL) cardClass = 'fail';
      if (c.result === WCAGResult.NA) cardClass = 'na';

      html += `
        <div class="card ${cardClass}">
          <h3>${c.id} ${c.name} <span style="font-size:0.7em; background:#eee; padding:2px 6px; border-radius:4px;">${c.level}</span></h3>
          <p>${c.description}</p>
          <p><strong>Resultaat:</strong> <span class="status-${cardClass}">${c.result}</span></p>
      `;

      if (c.findings && c.findings.length > 0) {
        c.findings.forEach(f => {
          html += `
            <div class="finding">
              <p><strong>Locatie:</strong> ${f.location}</p>
              <p><strong>Probleem:</strong> ${f.problemDescription}</p>
              <p><strong>Observatie:</strong> ${f.observation}</p>
              <p><em>Advies: ${f.advice}</em></p>
            </div>
          `;
        });
      }

      html += `</div>`;
    });
  });

  html += `
  </div>
</div>
</body>
</html>`;

  return html;
};