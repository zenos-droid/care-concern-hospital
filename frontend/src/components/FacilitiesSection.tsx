import { Shield, Activity, Flame, Users, Clock, Zap, Cpu, MapPin, Stethoscope } from "lucide-react";
import { FACILITIES } from "../constants";

export default function FacilitiesSection() {
  const getIcon = (iconName: string, className: string) => {
    if (!iconName) {
      return <Stethoscope className={className} />;
    }    
    switch (iconName) {
      case "Shield": return <Shield className={className} />;
      case "Activity": return <Activity className={className} />;
      case "Flame": return <Flame className={className} />;
      case "Users": return <Users className={className} />;
      case "Clock": return <Clock className={className} />;
      case "Zap": return <Zap className={className} />;
      default: return <Cpu className={className} />;
    }
  };

  return (
    <section id="facilities" className="py-16 bg-slate-50/50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sky-600 text-xs font-bold uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
             World Class Diagnostics
          </span>
          <h2 className="text-3.5xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
             Premium Care Infrastructure
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
             Care Concern features advanced diagnostic screening equipment and state-of-the-art diagnostic facilities to guarantee accurate answers.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FACILITIES.map((fac) => (
            <div
              key={fac.id}
              className="bg-white rounded-3xl p-6 border border-slate-150 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Icon Indicator */}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    {getIcon(fac.iconName, "w-6 h-6")}
                  </div>
                  <span className="bg-slate-100 text-[10px] font-bold text-slate-400 px-2 py-1 rounded uppercase tracking-wider">
                     Triage-Approved
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
                    {fac.description}
                  </p>
                </div>
              </div>

              {/* Internal Quality tag */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-semibold lowercase">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  clinical accuracy
                </span>
                <span>Active 24/7 support</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic emergency dispatch bottom trigger */}
        <div className="mt-12 bg-gradient-to-r from-sky-850 to-sky-700 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-sky-100/10">
          <div>
            <div className="bg-white/10 text-cyan-200 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-widest w-fit">
              Critical Ambulance Hotline
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold mt-2.5 tracking-tight">
              Instant Cardiac Ambulance Dispatch at Serampore Hooghly
            </h3>
            <p className="text-xs text-sky-100 mt-1 max-w-xl">
               Operating oxygen support transit vehicles. Available directly around Rishra, Konnagar, BaidyaBati and central Serampore. Get in touch with dispatch immediately.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <a
              href="tel:+913326624000"
              className="bg-white text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all hover:bg-slate-50 shadow-lg"
            >
               Call: +91 33 2662 4000
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
