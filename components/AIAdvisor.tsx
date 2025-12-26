import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AIAdvisorProps {
  soundPower: number;
  distance: number;
  resultLp: number;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ soundPower, distance, resultLp }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
        setError("API Key ontbreekt in omgeving. Configureer process.env.API_KEY.");
        return;
    }

    setLoading(true);
    setError(null);
    setAdvice(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Fungeer als een akoestisch expert.
        Ik heb een berekening gemaakt:
        - Bronvermogen (Lw): ${soundPower} dB
        - Afstand tot ontvanger: ${distance} meter
        - Resultaat geluidsdruk (Lp): ${resultLp} dB
        
        Geef een beknopte analyse in het Nederlands.
        1. Is dit geluidsniveau schadelijk, hinderlijk of acceptabel? (Refereer naar algemene standaarden).
        2. Geef 2-3 praktische tips om het geluid te reduceren indien nodig.
        
        Houd het kort, professioneel en praktisch. Gebruik Markdown voor opmaak.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAdvice(response.text || "Geen advies ontvangen.");
    } catch (err) {
      console.error(err);
      setError("Er ging iets mis bij het ophalen van het advies. Probeer het later opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-indigo-900">AI Akoestisch Adviseur</h3>
        </div>

        <p className="text-indigo-700/80 mb-6 text-sm leading-relaxed max-w-2xl">
          Krijg direct inzicht in wat deze dB-waarde betekent voor de omgeving en gezondheid, aangedreven door Google Gemini.
        </p>

        {!advice && !loading && (
          <button
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Sparkles size={16} />
            Start Analyse
          </button>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-indigo-600 animate-pulse">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Analyseren van geluidsgegevens...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
             <AlertTriangle className="shrink-0 mt-0.5" size={18} />
             <p className="text-sm">{error}</p>
          </div>
        )}

        {advice && (
          <div className="bg-white/80 backdrop-blur rounded-lg p-5 border border-indigo-100 shadow-sm animate-fade-in">
             <div className="prose prose-indigo prose-sm max-w-none">
                {/* Simple Markdown rendering by splitting lines or just whitespace preservation */}
                <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                  {advice}
                </div>
             </div>
             <div className="mt-4 pt-4 border-t border-indigo-50 flex justify-end">
                <button 
                  onClick={handleAnalyze}
                  className="text-xs text-indigo-500 hover:text-indigo-700 font-medium underline"
                >
                  Opnieuw analyseren
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;