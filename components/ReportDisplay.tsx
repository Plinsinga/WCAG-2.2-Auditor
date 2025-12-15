import React from 'react';
import { ReportData, WCAGResult, WCAGLevel, Principle, Criterion } from '../types';

interface ReportDisplayProps {
  data: ReportData;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ data }) => {
  const { meta, summary, principles, scope } = data;

  // Ensure arrays are safe to iterate
  const safePrinciples = principles || [];
  const safeScopeIn = scope?.inScope || [];
  
  // Helper to calculate stats per level
  const calculateStats = (level: WCAGLevel) => {
    let pass = 0, fail = 0, notChecked = 0, na = 0, outOfScope = 0, total = 0;
    
    safePrinciples.forEach(p => {
      (p.criteria || []).forEach(c => {
        if (c.level === level) {
          total++;
          if (c.result === WCAGResult.PASS) pass++;
          else if (c.result === WCAGResult.FAIL) fail++;
          else if (c.result === WCAGResult.NOT_CHECKED) notChecked++;
          else if (c.result === WCAGResult.NA) na++;
          else if (c.result === WCAGResult.OUT_OF_SCOPE) outOfScope++;
        }
      });
    });

    return { pass, fail, notChecked, na, outOfScope, total };
  };

  const statsA = calculateStats(WCAGLevel.A);
  const statsAA = calculateStats(WCAGLevel.AA);
  const totalStats = {
    pass: statsA.pass + statsAA.pass,
    fail: statsA.fail + statsAA.fail,
    notChecked: statsA.notChecked + statsAA.notChecked,
    na: statsA.na + statsAA.na,
    outOfScope: statsA.outOfScope + statsAA.outOfScope,
    total: statsA.total + statsAA.total
  };
  
  // Flatten criteria for table views only
  const allCriteria = safePrinciples.flatMap(p => p.criteria || []);
  const criteriaA = allCriteria.filter(c => c.level === WCAGLevel.A);
  const criteriaAA = allCriteria.filter(c => c.level === WCAGLevel.AA);

  const safeSummary = summary || { conclusion: '', feedback: '', scores: { wcag21: {pass:0, total:0}, wcag22: {pass:0, total:0} } };

  return (
    <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-screen font-sans text-gray-800 print:shadow-none print:max-w-none">
      
      {/* --- PAGE 1: COVER --- */}
      <div className="relative h-[297mm] flex flex-col justify-between p-16 text-white overflow-hidden page-break"
           style={{ background: 'linear-gradient(135deg, #2e0b1f 0%, #a61e38 100%)' }}>
        
        {/* Decorative circle lines */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] border border-white/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] border border-white/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="mt-32 relative z-10">
          <h1 className="text-6xl font-serif font-bold leading-tight mb-4">
            Een check<br/>
            op WCAG<br/>
            richtlijnen<br/>
            bij {meta?.product || '<Onderwerp>'}
          </h1>
        </div>

        <div className="relative z-10 text-sm font-medium">
          <div className="border-t border-white/50 pt-4 mb-2">
            <p className="uppercase tracking-widest text-white/80 text-xs mb-1">Norm</p>
            <p className="text-lg">WCAG 2.2, niveau AA</p>
          </div>
          
          <div className="grid grid-cols-1 gap-1 mt-8 text-white/90">
             <p>{meta?.researchers || '<Onderzoeker>'}</p>
             <p>{meta?.client || '<Opdrachtgever>'}</p>
             <p>{meta?.date || '<Datum>'}</p>
          </div>
        </div>
      </div>

      {/* --- PAGE 2: INLEIDING --- */}
      <div className="p-16 h-[297mm] relative page-break">
        <h2 className="text-3xl font-bold mb-8">Inleiding</h2>
        
        <div className="space-y-6 text-sm leading-relaxed text-gray-700">
          <p>
            Het Web Content Accessibility Guidelines (WCAG) is een internationale standaard die richtlijnen biedt voor het creëren van toegankelijke webinhoud. Het naleven van WCAG richtlijnen kan resulteren in een verbeterde gebruikerservaring. Toegankelijkheid houdt namelijk niet alleen rekening met mensen met een beperking, maar kan ook de bruikbaarheid en navigatie van een website verbeteren voor mensen zonder beperking.
          </p>
          
          <blockquote className="border-l-4 border-red-600 pl-4 py-2 text-xl font-bold text-red-700 italic my-8">
            Door te voldoen aan WCAG-richtlijnen, kan de digitale wereld voor iedereen toegankelijk en inclusief worden gemaakt.
          </blockquote>

          <h3 className="font-bold text-gray-900 mt-6">Vier principes</h3>
          <p>Er zijn vier principes: waarneembaar, bedienbaar, begrijpelijk en robuust. De richtlijnen zijn volgens deze indeling genummerd.</p>
          <ul className="list-decimal pl-5 space-y-1">
            <li><strong>Waarneembaar:</strong> alle gebruikers kunnen informatie en componenten waarnemen.</li>
            <li><strong>Bedienbaar:</strong> alle gebruikers kunnen componenten en navigatie bedienen.</li>
            <li><strong>Begrijpelijk:</strong> alle gebruikers kunnen informatie en bediening van de interface begrijpen.</li>
            <li><strong>Robuust:</strong> content is zo opgebouwd dat deze door hulptechnologie verwerkt kan worden.</li>
          </ul>

          <h3 className="font-bold text-gray-900 mt-6">Drie niveaus</h3>
          <p>
            De richtlijnen zijn opgedeeld in 3 niveaus: A, AA en AAA, ingedeeld op basis van impact die ze hebben op de visuele presentatie van de pagina. Niveau A heeft de minste impact, niveau AAA de meeste. Om een niveau te halen, moet er aan alle richtlijnen van dat niveau worden voldaan.
          </p>

          <h3 className="font-bold text-gray-900 mt-6">Versie</h3>
          <p>
            De huidige WCAG versie (2.2) is gepubliceerd in oktober 2023. Deze versie is het uitgangspunt in dit document.
          </p>
        </div>
      </div>

      {/* --- PAGE 3: ONDERZOEK --- */}
      <div className="p-16 h-[297mm] relative page-break">
        <h2 className="text-3xl font-bold mb-8">Onderzoek</h2>
        <p className="mb-8 text-sm text-gray-700">
            In dit document beschrijven we alle richtlijnen die onder Niveau A en AA vallen en of het onderzochte hieraan voldoet.
        </p>

        <div className="space-y-8 text-sm text-gray-700">
            <div>
                <h3 className="font-bold text-gray-900 mb-2">Scope</h3>
                <p>WCAG versie: 2.2</p>
                <p>Niveau: AA</p>
                <p>Onderwerp: {meta?.product || ''}</p>
            </div>

            <div>
                <h3 className="font-bold text-gray-900 mb-2">Steekproef</h3>
                <p className="mb-2">De volgende input is onderzocht:</p>
                <ul className="list-disc pl-5">
                    {safeScopeIn.length > 0 ? safeScopeIn.map((item, i) => (
                        <li key={i}>{item}</li>
                    )) : <li>Aangeleverde HTML snippet</li>}
                </ul>
            </div>

            <div>
                <h3 className="font-bold text-gray-900 mb-2">Disclaimer</h3>
                <p>
                    We hebben ons best gedaan om dit onderzoek zo nauwkeurig mogelijk te doen en dit document zo volledig mogelijk op te stellen. Ondanks onze zorgvuldigheid kunnen er vanwege de complexiteit van WCAG interpretatieverschillen voorkomen. Dit rapport is gegenereerd door een AI-assistent en dient gevalideerd te worden door een menselijke expert.
                </p>
            </div>
        </div>
      </div>

      {/* --- PAGE 4: SAMENVATTING --- */}
      <div className="p-16 h-[297mm] relative page-break">
        <h2 className="text-3xl font-bold mb-8">Samenvatting resultaten</h2>
        
        <p className="mb-6 text-sm text-gray-700">
            {safeSummary.conclusion || "Hieronder volgt het overzicht van de scores."}
        </p>

        <h3 className="font-bold text-gray-900 mb-4">Scores</h3>
        <p className="text-sm text-gray-700 mb-4">Om een niveau te halen, moeten alle punten met dat niveau voldoen aan de richtlijn.</p>

        <div className="overflow-hidden rounded-lg border border-gray-200 mb-8">
            <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-900 font-bold">
                    <tr>
                        <th className="px-3 py-3 border-b">Niveau</th>
                        <th className="px-3 py-3 border-b">Voldoet</th>
                        <th className="px-3 py-3 border-b">Voldoet niet</th>
                        <th className="px-3 py-3 border-b">Nog niet<br/>onderzocht</th>
                        <th className="px-3 py-3 border-b">Niet<br/>relevant</th>
                        <th className="px-3 py-3 border-b">Buiten<br/>scope</th>
                        <th className="px-3 py-3 border-b">Totaal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    <tr>
                        <td className="px-3 py-3 font-medium">Niveau A</td>
                        <td className="px-3 py-3 text-green-700 font-bold">{statsA.pass}</td>
                        <td className="px-3 py-3 text-red-600 font-bold">{statsA.fail}</td>
                        <td className="px-3 py-3 text-orange-600">{statsA.notChecked}</td>
                        <td className="px-3 py-3 text-gray-400">{statsA.na}</td>
                        <td className="px-3 py-3 text-gray-400">{statsA.outOfScope}</td>
                        <td className="px-3 py-3 font-bold">{statsA.total}</td>
                    </tr>
                    <tr>
                        <td className="px-3 py-3 font-medium">Niveau AA</td>
                        <td className="px-3 py-3 text-green-700 font-bold">{statsAA.pass}</td>
                        <td className="px-3 py-3 text-red-600 font-bold">{statsAA.fail}</td>
                        <td className="px-3 py-3 text-orange-600">{statsAA.notChecked}</td>
                        <td className="px-3 py-3 text-gray-400">{statsAA.na}</td>
                        <td className="px-3 py-3 text-gray-400">{statsAA.outOfScope}</td>
                        <td className="px-3 py-3 font-bold">{statsAA.total}</td>
                    </tr>
                     <tr>
                        <td className="px-3 py-3 font-medium text-gray-400">Niveau AAA</td>
                        <td className="px-3 py-3 text-gray-400">-</td>
                        <td className="px-3 py-3 text-gray-400">-</td>
                        <td className="px-3 py-3 text-gray-400">-</td>
                        <td className="px-3 py-3 text-gray-400">-</td>
                        <td className="px-3 py-3 text-gray-400">-</td>
                         <td className="px-3 py-3 text-gray-400">-</td>
                    </tr>
                    <tr className="bg-gray-50 font-bold">
                        <td className="px-3 py-3">Totaal</td>
                        <td className="px-3 py-3 text-green-700">{totalStats.pass}</td>
                        <td className="px-3 py-3 text-red-600">{totalStats.fail}</td>
                        <td className="px-3 py-3 text-orange-600">{totalStats.notChecked}</td>
                        <td className="px-3 py-3 text-gray-500">{totalStats.na}</td>
                        <td className="px-3 py-3 text-gray-500">{totalStats.outOfScope}</td>
                        <td className="px-3 py-3">{totalStats.total}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {safeSummary.feedback && (
            <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-2">Aanbevelingen</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{safeSummary.feedback}</p>
            </div>
        )}
      </div>

      {/* --- RESULTS TABLES (A & AA) --- */}
      {[
        { level: 'A', criteria: criteriaA },
        { level: 'AA', criteria: criteriaAA }
      ].map((group) => (
         <div key={group.level} className="p-16 min-h-[297mm] relative page-break">
            <h2 className="text-2xl font-bold mb-8">Resultaten Niveau {group.level}</h2>
            <table className="w-full text-sm text-left border-collapse">
                <thead className="border-b-2 border-gray-100">
                    <tr>
                        <th className="py-2 font-bold text-gray-900 w-2/3">Richtlijn</th>
                        <th className="py-2 font-bold text-gray-900 w-24">Disciplines</th>
                        <th className="py-2 font-bold text-gray-900 w-24">Niveau</th>
                        <th className="py-2 font-bold text-gray-900">Resultaat</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {group.criteria.map(c => (
                        <tr key={c.id}>
                            <td className="py-3 pr-4 text-gray-700">
                                <span className="font-medium text-gray-900 mr-2">{c.id}</span>
                                {c.name}
                            </td>
                            <td className="py-3 text-xs text-gray-500">{c.disciplines || '-'}</td>
                            <td className="py-3 text-xs">{c.level}</td>
                            <td className="py-3">
                                <span className={`
                                    ${c.result === WCAGResult.PASS ? 'text-green-600' : ''}
                                    ${c.result === WCAGResult.FAIL ? 'text-red-600 font-bold' : ''}
                                    ${c.result === WCAGResult.NA ? 'text-gray-400' : ''}
                                    ${c.result === WCAGResult.NOT_CHECKED ? 'text-orange-600' : ''}
                                    ${c.result === WCAGResult.OUT_OF_SCOPE ? 'text-gray-400 italic' : ''}
                                `}>
                                    {c.result}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      ))}

      {/* --- PRINCIPLE SECTIONS & DETAILED CRITERIA --- */}
      {safePrinciples.map((principle, index) => (
        <React.Fragment key={index}>
            {/* --- PRINCIPLE INTRO PAGE --- */}
            <div className="h-[297mm] relative p-16 flex flex-col justify-center page-break bg-[#eee6e9]">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] border border-white/50 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none opacity-20"></div>
                
                <div className="relative z-10 max-w-2xl">
                    <span className="block text-red-500 text-6xl italic font-serif mb-8">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-5xl font-bold text-[#2e0b1f] leading-tight">
                        {principle.description || `Alle gebruikers kunnen ${principle.name.toLowerCase()}.`}
                    </h2>
                </div>
            </div>

            {/* --- CRITERIA CARDS FOR THIS PRINCIPLE --- */}
            {(principle.criteria || []).map((criterion) => (
                <div key={criterion.id} className="p-16 h-[297mm] relative flex flex-col page-break">
                    <div className="flex gap-2 mb-4">
                        <span className="bg-purple-200 text-purple-900 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm">
                            Niveau {criterion.level}
                        </span>
                        {criterion.disciplines && (
                             <span className="bg-gray-200 text-gray-700 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm">
                                {criterion.disciplines}
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {criterion.id} {criterion.name}
                    </h2>

                    <div className="text-sm text-gray-700 mb-6 leading-relaxed flex-grow-0">
                        <p className="mb-4">{criterion.description}</p>
                        <a href={`https://www.w3.org/WAI/WCAG22/Understanding/${criterion.id.toLowerCase().replace(/\./g, '')}`} target="_blank" rel="noreferrer" className="text-gray-400 underline block mb-1 text-xs">
                            W3C Understanding Doc (EN)
                        </a>
                    </div>

                    {/* Status Box */}
                    <div className={`mt-8 p-6 rounded-sm border-l-4 ${
                        criterion.result === WCAGResult.NOT_CHECKED 
                        ? 'bg-orange-50 border-orange-400 text-gray-800'
                        : criterion.result === WCAGResult.NA || criterion.result === WCAGResult.OUT_OF_SCOPE
                        ? 'bg-gray-50 border-gray-400 text-gray-700' 
                        : criterion.result === WCAGResult.FAIL 
                        ? 'bg-red-50 border-red-500' 
                        : 'bg-green-50 border-green-500'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center
                                ${criterion.result === WCAGResult.NOT_CHECKED ? 'border-orange-500' :
                                  criterion.result === WCAGResult.NA || criterion.result === WCAGResult.OUT_OF_SCOPE ? 'border-gray-500' : 
                                  criterion.result === WCAGResult.FAIL ? 'border-red-600 bg-red-600' : 'border-green-600 bg-green-600'}
                            `}>
                                {(criterion.result === WCAGResult.FAIL || criterion.result === WCAGResult.PASS) && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div> 
                                )}
                            </div>
                            
                            <div className="text-sm w-full">
                                <p className={`font-bold mb-1 ${
                                    criterion.result === WCAGResult.PASS ? 'text-green-800' :
                                    criterion.result === WCAGResult.FAIL ? 'text-red-800' :
                                    criterion.result === WCAGResult.NOT_CHECKED ? 'text-orange-800' :
                                    'text-gray-800'
                                }`}>
                                    {criterion.result}
                                </p>
                                
                                {criterion.reason ? (
                                     <p className="text-gray-700 mt-2">
                                        <span className="font-semibold block text-xs uppercase tracking-wide opacity-70 mb-0.5">Toelichting</span>
                                        <span className="italic block">{criterion.reason}</span>
                                     </p>
                                ) : (
                                    <>
                                        {criterion.result === WCAGResult.NOT_CHECKED && (
                                            <p className="text-gray-700 mt-1">Deze richtlijn is op dit moment nog niet onderzocht.</p>
                                        )}
                                        {criterion.result === WCAGResult.NA && (
                                            <p className="text-gray-700 mt-1">Deze richtlijn is niet relevant voor de huidige content.</p>
                                        )}
                                        {criterion.result === WCAGResult.OUT_OF_SCOPE && (
                                            <p className="text-gray-700 mt-1">Dit onderdeel valt buiten de scope van dit onderzoek.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Findings Section */}
                    {(criterion.result === WCAGResult.FAIL || criterion.result === WCAGResult.PASS) && (
                        <div className="mt-8">
                            <h3 className="font-bold text-gray-900 mb-4">Bevindingen</h3>
                            {criterion.findings && criterion.findings.length > 0 ? (
                                <div className="space-y-4">
                                    {criterion.findings.map((finding, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 border border-gray-100 text-sm">
                                            <p className="font-bold text-gray-800 mb-1">{finding.problemDescription}</p>
                                            <p className="text-gray-600 mb-2">{finding.observation}</p>
                                            <p className="text-gray-500 text-xs italic">Advies: {finding.advice}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Hier komen de bevindingen te staan, eventueel voorzien van screenshots met url's.</p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </React.Fragment>
      ))}

    </div>
  );
};

export default ReportDisplay;