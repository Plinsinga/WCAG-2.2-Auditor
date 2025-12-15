import React, { useState } from 'react';
import { analyzeHtml } from './services/geminiService';
import ReportDisplay from './components/ReportDisplay';
import { ReportData } from './types';
import { generateHtml } from './utils/htmlGenerator';

function App() {
  const [htmlInput, setHtmlInput] = useState('');
  
  // State for metadata fields
  const [metaData, setMetaData] = useState({
    client: '',
    product: '',
    version: '1.0',
    date: new Date().toISOString().split('T')[0], // Default to current date (YYYY-MM-DD)
    researchers: ''
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetaData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
    if (!htmlInput.trim()) {
      setError("Voer a.u.b. HTML code in.");
      return;
    }

    // Basic validation for metadata
    if (!metaData.client || !metaData.product || !metaData.researchers) {
        setError("Vul a.u.b. alle verplichte velden in (Opdrachtgever, Onderwerp, Onderzoeker).");
        return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      // Pass both HTML and Metadata to the service
      const data = await analyzeHtml(htmlInput, metaData);
      setReportData(data);
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Er ging iets mis bij het genereren van het rapport. Probeer het opnieuw.";
      
      // Check for common API errors
      const errString = err?.toString() || "";
      if (errString.includes("token count") || (err?.message && err.message.includes("token count"))) {
         errorMessage = "De HTML code is te groot om in één keer te verwerken. Probeer een kleiner stuk code (bijvoorbeeld alleen de <body>).";
      } else if (errString.includes("400")) {
         errorMessage = "Er is een technische fout opgetreden (Invalid Argument). Mogelijk is de invoer te complex.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = () => {
    // Clear the report view
    setReportData(null);
    // Clear errors
    setError(null);
    // Clear HTML input
    setHtmlInput('');
    // Update metadata: Keep client and researchers, clear product/subject
    setMetaData(prev => ({
      ...prev,
      product: ''
    }));
  };

  const handleDownloadHtml = () => {
    if (!reportData) return;
    const html = generateHtml(reportData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WCAG-Rapport-${reportData.meta.date.replace(/\s/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header - Sticky for easy access */}
      <header className="sticky top-0 z-50 bg-emerald-700 text-white shadow-md no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-tr-lg rounded-bl-lg"></div>
            <h1 className="text-xl font-bold tracking-wide">WCAG 2.2 Auditor</h1>
          </div>
          {reportData && (
            <div className="flex flex-wrap gap-2 items-center">
              <button 
                onClick={handleDownloadHtml} 
                className="bg-emerald-900 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-emerald-950 transition-colors flex items-center gap-2 shadow-sm border border-emerald-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download HTML
              </button>

              <button 
                onClick={handleNewReport} 
                className="bg-white text-emerald-800 px-4 py-2 rounded-md font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nieuw rapport
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!reportData ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Nieuwe Audit Starten</h2>
                <p className="text-gray-600 mb-6">Vul de rapportgegevens in en plak de HTML broncode. De AI valideert de code vervolgens op WCAG 2.2 AA.</p>
                
                {/* Metadata Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="col-span-1">
                        <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Opdrachtgever *</label>
                        <input 
                            id="client"
                            type="text" 
                            name="client"
                            value={metaData.client}
                            onChange={handleMetaChange}
                            placeholder="Bijv. Gemeente X"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white text-gray-900"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Onderwerp / Product *</label>
                        <input 
                            id="product"
                            type="text" 
                            name="product"
                            value={metaData.product}
                            onChange={handleMetaChange}
                            placeholder="Bijv. Homepage Header"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white text-gray-900"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="researchers" className="block text-sm font-medium text-gray-700 mb-1">Onderzoeker *</label>
                        <input 
                            id="researchers"
                            type="text" 
                            name="researchers"
                            value={metaData.researchers}
                            onChange={handleMetaChange}
                            placeholder="Bijv. J. Jansen"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white text-gray-900"
                        />
                    </div>
                    <div className="col-span-1 grid grid-cols-2 gap-2">
                        <div>
                            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">Versie</label>
                            <input 
                                id="version"
                                type="text" 
                                name="version"
                                value={metaData.version}
                                onChange={handleMetaChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                            <input 
                                id="date"
                                type="date" 
                                name="date"
                                value={metaData.date}
                                onChange={handleMetaChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white text-gray-900"
                            />
                        </div>
                    </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="html-input" className="block text-sm font-medium text-gray-700 mb-2">HTML Code</label>
                <textarea
                  id="html-input"
                  rows={12}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm bg-white text-gray-900"
                  placeholder="<div class='container'>..."
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`w-full py-4 rounded-lg text-white font-bold text-lg shadow transition-all ${
                  loading 
                    ? 'bg-emerald-400 cursor-wait' 
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyseren...
                  </span>
                ) : (
                  'Genereer Rapport'
                )}
              </button>
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Ondersteunt WCAG 2.1 & 2.2 AA. Gebruikt Gemini AI voor contextuele analyse.</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <ReportDisplay data={reportData} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;