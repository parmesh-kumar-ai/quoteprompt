'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, ChevronRight, Image as ImageIcon, MessageSquare, Hash, BookOpen } from 'lucide-react';

export default function Home() {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState('');

  const generatePrompt = async () => {
    if (!quote.trim()) {
      setError('Please paste a quote first.');
      return;
    }
    
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate prompt');

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const renderResultCard = (title: string, icon: React.ReactNode, text: string, key: string) => {
    if (!text) return null;
    return (
      <div className="glass p-6 rounded-2xl mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gradient-gold flex items-center gap-2 uppercase tracking-widest">
            {icon} {title}
          </h3>
          <button 
            onClick={() => handleCopy(text, key)}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors bg-neutral-800/50 px-3 py-1.5 rounded-full"
          >
            {copiedKey === key ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copiedKey === key ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-neutral-300 leading-relaxed font-serif text-lg tracking-wide">{text}</p>
      </div>
    );
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-20 min-h-screen flex flex-col">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/5 mb-6 text-xs font-medium text-neutral-300">
          <Sparkles size={14} className="text-[#d4a373]" /> Agentic Prompt Generator
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight text-gradient">Inkwell AI</h1>
        <p className="text-neutral-400 text-lg max-w-xl mx-auto">
          Paste your quote below. Get an ultra-realistic, highly engaging image prompt and social caption tailored for 9:16 vertical reels.
        </p>
      </div>

      <div className="glass p-8 rounded-3xl mb-12 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="mb-2 flex justify-between items-end">
           <label className="text-sm font-semibold text-neutral-300 ml-1">Your Quote</label>
        </div>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="“The world will tell you who to be; listen instead to the quiet voice within you.”"
          className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-5 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#d4a373]/50 focus:border-transparent transition-all resize-none text-lg font-serif mb-6"
        />
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <span className="block w-1.5 h-1.5 rounded-full bg-red-400"></span> {error}
          </div>
        )}

        <button
          onClick={generatePrompt}
          disabled={loading || !quote.trim()}
          className="w-full glass-button py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Sparkles size={18} className="animate-pulse" /> Conjuring magic...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Generate Reel Concept <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </div>

      {result && (
        <div className="flex flex-col gap-2">
          {result.scene_note && (
             <div className="text-center mb-6 animate-in fade-in duration-500">
               <p className="text-[#d4a373] text-sm italic opacity-80 flex justify-center items-center gap-2">
                 <BookOpen size={14} /> &quot;{result.scene_note}&quot;
               </p>
             </div>
          )}

          {renderResultCard('Image Prompt', <ImageIcon size={16} />, result.image_prompt, 'image')}
          
          {(result.caption_hook || result.caption_body) && renderResultCard(
            'Social Caption', 
            <MessageSquare size={16} />, 
            [result.caption_hook, result.caption_body, result.cta].filter(Boolean).join('\n\n'), 
            'caption'
          )}
          
          {result.hashtags && result.hashtags.length > 0 && renderResultCard(
            'Hashtags', 
            <Hash size={16} />, 
            result.hashtags.map((h: string) => '#' + h.replace('#', '')).join(' '), 
            'tags'
          )}
        </div>
      )}
    </main>
  );
}
