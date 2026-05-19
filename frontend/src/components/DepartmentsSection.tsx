import { Stethoscope } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { HeartPulse, Activity, CheckCircle2, Award, Stethoscope, Zap, ChevronRight, Check } from "lucide-react";
import { DEPARTMENTS, DOCTORS, Department } from "../constants";
import { loadHospitalData } from "../services/hospitalData";

export default function DepartmentsSection({ onSelectDept }: { onSelectDept: (deptId: string) => void }) {
  const [activeDeptId, setActiveDeptId] = useState<string>("cardio");
  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS);
  const [doctors, setDoctors] = useState(DOCTORS);

  useEffect(() => {
    loadHospitalData().then((data) => {
      setDepartments(data.departments.length ? data.departments : DEPARTMENTS);
      setDoctors(data.doctors.length ? data.doctors : DOCTORS);
    });
  }, []);

  // Icon map to resolve dynamic key strings
  const getIcon = (iconName: string, className: string) => {
    if (!iconName) {
      return <Stethoscope className={className} />;
    }
    switch (iconName) {
      case "HeartPulse": return <HeartPulse className={className} />;
      case "Activity": return <Activity className={className} />;
      case "CheckCircle2": return <CheckCircle2 className={className} />;
      case "Award": return <Award className={className} />;
      case "Stethoscope": return <Stethoscope className={className} />;
      case "Zap": return <Zap className={className} />;
      default: return <Stethoscope className={className} />;
    }
  };

  const selectedDeptObj = useMemo(() => {
    return departments.find(d => d.id === activeDeptId) || departments[0] || null;
  }, [activeDeptId, departments]);
  if (!selectedDeptObj) {
  return (
    <div className="p-10 text-center text-slate-500">
      Loading departments...
    </div>
  );
}

  // Doctors belonging to this department
  const filteredDocs = useMemo(() => {
    return doctors.filter(doc => doc.deptId === activeDeptId);
  }, [activeDeptId, doctors]);

  return (
    <section id="departments" className="py-16 bg-slate-50/50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sky-600 text-xs font-bold uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100 uppercase">
             Comprehensive Treatments
          </span>
          <h2 className="text-3.5xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
            Specialized Medical Departments
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
             Care Concern features advanced clinical expertise, precision instrumentation, and round-the-clock emergency support.
          </p>
        </div>

        {/* Dynamic Grid + Showcase Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Grid: Clickable Department Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
            {departments.map((dept) => {
              const isActive = activeDeptId === dept.id;
              return (
                <button
                  id={`btn-dept-${dept.id}`}
                  key={dept.id}
                  onClick={() => setActiveDeptId(dept.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border cursor-pointer duration-300 flex items-center gap-3.5 ${isActive ? "bg-white border-sky-500 shadow-xl pl-6 text-sky-950 scale-102" : "bg-white border-slate-150 shadow-sm hover:border-slate-300 hover:bg-slate-50 text-slate-700"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-600"}`}>
                    {getIcon(dept?.iconName, "w-5.5 h-5.5")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm md:text-base leading-tight truncate">{dept.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{dept.shortDesc}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-sky-600 translate-x-1" : "text-slate-300"}`} />
                </button>
              );
            })}
          </div>

          {/* Right Panel: Executive Showcase of Active Department */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col justify-between h-auto lg:min-h-[460px] relative overflow-hidden animate-in fade-in duration-300">
            
            {/* Soft decorative background radial light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -z-10 -mr-20 -mt-20"></div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center mb-1">
                  {getIcon(selectedDeptObj?.iconName, "w-6 h-6")}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-none">
                     {selectedDeptObj.name} Department
                  </h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Care Concern Hooghly</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  {selectedDeptObj.fullDesc}
                </p>
              </div>

              {/* Department key diagnostic features */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Key Services & Diagnostic Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {selectedDeptObj.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctors belonging to this active department */}
              {filteredDocs.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Available Specialists Today</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredDocs.map(doc => (
                      <div key={doc.id} className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100/50 text-xs flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-slate-800">{doc.name}</p>
                          <p className="text-slate-500 font-medium text-[10px] mt-0.5">{doc.degree}</p>
                        </div>
                        <span className="bg-white px-2 py-1 text-[10px] rounded border border-sky-100 text-sky-700 font-mono font-bold shrink-0">
                          {doc.experience}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Booking Link */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-xs text-slate-500">
                 Need immediate consultation? Fill in the details to reserve a calendar slot.
              </div>
              <button
                type="button"
                onClick={() => onSelectDept(activeDeptId)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-3 rounded-xl text-xs transition-colors shadow-lg cursor-pointer shrink-0"
              >
                 Book {selectedDeptObj.name} Now
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
