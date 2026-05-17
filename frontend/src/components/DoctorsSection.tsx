import { useState, useMemo, useEffect } from "react";
import { Search, Calendar, Clock, Sparkles, Heart, Activity, UserCheck, Shield } from "lucide-react";
import { DOCTORS, Doctor } from "../constants";
import { loadHospitalData } from "../services/hospitalData";

export default function DoctorsSection({ onSelectDoc }: { onSelectDoc: (docId: string, deptId: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    loadHospitalData().then((data) => setDoctors(data.doctors));
  }, []);

  // Filter logic
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.degree.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchDay = selectedDay === "" || doc.days.includes(selectedDay);
      return matchSearch && matchDay;
    });
  }, [doctors, searchQuery, selectedDay]);

  // Fallback avatar generator
  const getAvatarFallback = (docId: string) => {
    switch (docId) {
      case "doc-mukherjee": return "❤️";
      case "doc-sengupta": return "🦴";
      case "doc-banerjee": return "👶";
      case "doc-ray": return "🤰";
      case "doc-ghosh": return "🩺";
      default: return "👨‍⚕️";
    }
  };

  return (
    <section id="doctors" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <span className="text-sky-600 text-xs font-bold uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
               Trusted Specialists
            </span>
            <h2 className="text-3.5xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
               Meet Our Clinical Medical Experts
            </h2>
            <p className="text-slate-500 text-sm mt-1 mb-0 max-w-xl font-medium">
               Consult highly experienced medical consultants chambering weekly directly in Serampore, Hooghly.
            </p>
          </div>

          {/* Quick Stats banner inside doctors */}
          <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-150 text-xs text-slate-600 flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold text-slate-800">24/7 Duty Roster Active</span>
              <p className="text-[10px] text-slate-400">Emergency Medicine Officers Resident</p>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by surgeon name, clinical degree, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 px-9 py-3 rounded-xl text-xs sm:text-sm text-slate-800 focus:border-slate-300"
            />
          </div>

          {/* Day of Week Filter Chips */}
          <div className="md:col-span-7 flex flex-wrap gap-2.5 items-center justify-start md:justify-end">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">Chamber Day:</span>
            <button
              onClick={() => setSelectedDay("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedDay === "" ? "bg-sky-600 text-white shadow-md shadow-sky-100" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
            >
               All Days
            </button>
            {weekDays.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedDay === day ? "bg-sky-600 text-white shadow-md shadow-sky-100" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-150 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Profile card upper containing visual avatar representer */}
              <div className="p-6 pb-2">
                <div className="flex gap-4 items-start">
                  {/* Fallback illustrational avatar mapping */}
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 text-slate-800 flex items-center justify-center text-3xl shrink-0 shadow-inner group-hover:bg-sky-100 transition-colors border border-sky-100">
                     {getAvatarFallback(doc.id)}
                  </div>

                  <div className="min-w-0">
                    <span className="bg-sky-50 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                       {doc.specialty.split(" ")[0]} Specialists
                    </span>
                    <h3 className="font-extrabold text-slate-900 mt-1 text-base md:text-lg tracking-tight leading-snug group-hover:text-sky-600 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mt-0.5 leading-relaxed">
                      {doc.specialty}
                    </p>
                  </div>
                </div>

                {/* Academic/Experience info */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3.5">
                  <p>
                    <strong className="text-slate-700">Degree:</strong> {doc.degree}
                  </p>
                  <p>
                    <strong className="text-slate-700">Experience:</strong> {doc.experience} of medical duty
                  </p>
                </div>
              </div>

              {/* Lower info chamber functional timing */}
              <div className="p-6 pt-2 space-y-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1.5">
                    <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Serampore Chamber Route:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    🕒 {doc.chamberTimings}
                  </p>
                  
                  {/* Operating Days inline chips */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.days.map((d, index) => (
                      <span key={index} className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-100">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Book direct click CTA */}
                <button
                  type="button"
                  onClick={() => onSelectDoc(doc.id, doc.deptId)}
                  className="w-full bg-sky-50 group-hover:bg-sky-600 text-sky-800 group-hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-sm group-hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 border border-sky-100 group-hover:border-transparent"
                >
                  <span>Secure Priority Booking Appointment</span>
                </button>
              </div>
            </div>
          ))}

          {/* Empty search warning */}
          {filteredDoctors.length === 0 && (
            <div className="col-span-full py-12 p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
              <p className="text-sm font-semibold text-slate-500">
                No doctors matches your search keywords or days selection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDay("");
                }}
                className="mt-3 bg-sky-600 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
