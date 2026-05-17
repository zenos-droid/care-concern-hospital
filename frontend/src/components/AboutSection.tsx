import { useState } from "react";
import { Train, MapPin, Navigation, Bus, Clock, Shield, Award, Users, HeartPulse, Sparkles } from "lucide-react";
import { LANDMARKS } from "../constants";

export default function AboutSection() {
  const [activeCommuteIdx, setActiveCommuteIdx] = useState(0);

  return (
    <section id="about" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="bg-sky-50 text-sky-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border border-sky-100 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Healing Since 2006
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Care Concern Hospital Pvt Ltd <br />
              <span className="text-sky-600 font-serif italic font-normal">A Legacy of Comfort & Cure In Hooghly</span>
            </h2>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              For over two decades, <strong>Care Concern Hospital</strong> has served as the bedrock of dependable, advanced clinical care for families across Serampore, Rishra, Konnagar, and Baidyabati. Located directly on G.T. Road near landmark Serampore Court, we guarantee elite, immediate treatment options without forcing patients to travel all the way into Kolkata.
            </p>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Our 40-bed healthcare campus is equipped with state-of-the-art diagnostics, modular ultra-clean laminar flow operation theaters, a fully loaded 24/7 ICCU unit, and dedicated pediatric/obstetrics wards. Under the directorship of elite Hooghly-renowned medical practitioners, we provide highly compassionate patient support alongside highly transparent billing structures.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">NABH-Compliant Safety</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Strict clinical guidelines, infection control, and sterile hospital rooms.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Elite Medical Board</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Senior consultants with years of training in India and abroad.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute top-0 right-0 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl -z-10 -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-200/50 rounded-full blur-2xl -z-10 -ml-8 -mb-8"></div>
            
            {/* Elegant Map Directions card */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-xl relative">
              <div className="flex items-center gap-2 mb-4 text-sky-900 font-bold">
                <Navigation className="w-5 h-5 text-sky-600" />
                <h3 className="text-base tracking-tight leading-none uppercase text-xs font-black">How to Reach Our Venue</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                Strategic location directly on G.T. Road, Serampore, Hooghly, West Bengal - 712201 (Adjacent to Serampore Court). Select your transport to see routes:
              </p>

              {/* Commuter Option Nodes */}
              <div className="space-y-3">
                <div className="flex gap-1.5 border-b border-slate-200 pb-2.5">
                  {LANDMARKS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCommuteIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0 ${activeCommuteIdx === idx ? "bg-sky-600 text-white shadow-md shadow-sky-100" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
                    >
                      {idx === 0 && <Train className="w-3.5 h-3.5" />}
                      {idx === 1 && <MapPin className="w-3.5 h-3.5" />}
                      {idx === 2 && <Bus className="w-3.5 h-3.5" />}
                      <span>{item.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commuter Metric</span>
                    <span className="bg-sky-50 text-sky-700 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {LANDMARKS[activeCommuteIdx].time}
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-[13px]">
                     {LANDMARKS[activeCommuteIdx].name}
                  </h4>
                  <p className="text-xs text-sky-900 font-semibold mb-2">
                    Distance: {LANDMARKS[activeCommuteIdx].distance}
                  </p>
                  
                  <div className="text-xs text-slate-600 border-t border-slate-100 pt-2 leading-relaxed">
                    <strong>Transit instructions:</strong> {LANDMARKS[activeCommuteIdx].directions}
                  </div>
                </div>
              </div>

              {/* Digital Landmark banner */}
              <div className="mt-4 p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950 font-black text-xs font-mono shrink-0">
                    H
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Need Help Navigating?</span>
                    <p className="font-bold text-cyan-300">Call Reception: +91 33 2662 4001</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

        </div>

        {/* Dynamic Legacy Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 text-center">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 transition-colors">
            <h3 className="text-4xl font-black text-sky-600 font-display">20+</h3>
            <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mt-1.5">Years Experience</p>
            <p className="text-[11px] text-slate-500 mt-1">Delivering trusted diagnosis in Hooghly since 2006</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 transition-colors">
            <h3 className="text-4xl font-black text-sky-600 font-display">10,000+</h3>
            <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mt-1.5">Happy Recoveries</p>
            <p className="text-[11px] text-slate-500 mt-1">Grateful feedback from surrounding families</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 transition-colors">
            <h3 className="text-4xl font-black text-red-600 font-display">24/7</h3>
            <p className="text-xs uppercase font-extrabold text-red-500/80 tracking-wider mt-1.5">Emergency Triage</p>
            <p className="text-[11px] text-slate-500 mt-1">Round-the-clock cardiac, stroke & trauma team</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 transition-colors">
            <h3 className="text-4xl font-black text-sky-600 font-display">100%</h3>
            <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mt-1.5">Compassion Focused</p>
            <p className="text-[11px] text-slate-500 mt-1">Ethical healthcare solutions with pocket-friendly pricing</p>
          </div>
        </div>

      </div>
    </section>
  );
}
