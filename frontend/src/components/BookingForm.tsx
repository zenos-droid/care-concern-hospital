import { useState, useMemo, useEffect, FormEvent } from "react";
import { Calendar, Clock, User, Phone, CheckCircle2, ArrowRight, Printer, Shield, MapPin } from "lucide-react";
import { DEPARTMENTS, DOCTORS } from "../constants";
import { appointmentApi } from "../services/api";
import { loadHospitalData } from "../services/hospitalData";

export default function BookingForm({ initialDeptId, initialDocId }: { initialDeptId?: string; initialDocId?: string }) {
  const [selectedDept, setSelectedDept] = useState(initialDeptId || "");
  const [selectedDocId, setSelectedDocId] = useState(initialDocId ||"");
  const [selectedDoctorUuid, setSelectedDoctorUuid] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState(DEPARTMENTS);
  const [doctors, setDoctors] = useState(DOCTORS);
  
  useEffect(() => {
    loadHospitalData().then((data) => {
      console.log("API DATA:", data);
      setDepartments(data.departments);
      setDoctors(data.doctors);
      setSelectedDocId("");
    });
  }, []);

  // Modal Ticket Confirmation
  const [ticketData, setTicketData] = useState<any | null>(null);

  // Sync doctors list based on chosen department
  const filteredDoctors = useMemo(() => {
    if (!selectedDept) return doctors;
    return doctors.filter(d => d.deptId === selectedDept);
  }, [doctors, selectedDept]);

  // Selected doctor config
  const selectedDoctor = useMemo(() => {
    return doctors.find(d => d.id === selectedDocId) || null;
  }, [doctors, selectedDocId]);

  // Handle department shift
  const handleDocChange = (docId: string) => {
    const realDoctor = doctors.find((d) => d.id === docId);
    console.log("REAL DOCTOR ID:", realDoctor?.id);
    console.log("REAL DOCTOR PUBLIC ID:", realDoctor?.publicId);

    setSelectedDocId(docId);

    setSelectedDoctorUuid(realDoctor?.publicId || "");

    setBookingSlot("");

    if (realDoctor && realDoctor.deptId !== selectedDept) {
      setSelectedDept(realDoctor.deptId);
    }
  };


  // Validate day of week against doctor's schedule
  const dateValidationWarning = useMemo(() => {
    if (!bookingDate || !selectedDoctor) return null;
    
    // Parse Date day
    const dateObj = new Date(bookingDate);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" }); // "Monday", "Tuesday", etc.
    const isAvailable = (selectedDoctor.days || []).includes(dayName);

    if (!isAvailable) {
      return `Warning: ${selectedDoctor.name} normally chambers on ${(selectedDoctor.days || []).join(", ")}. Checking with reception is advised if choosing a ${dayName}.`;
    }
    return null;
  }, [bookingDate, selectedDoctor]);

  const handleBookNow = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone || !selectedDocId) {
      alert("Please fill in Name, Phone, and select a Medical Specialist.");
      return;
    }
    setIsSubmitting(true);
    let appointment: any;
    try {
      console.log("SELECTED DOCTOR:", selectedDoctor);
      console.log("SELECTED DOC ID:", selectedDocId);
      alert("DOCTOR ID = " + selectedDocId);
      console.log("FINAL PAYLOAD", {
        patientName,
        patientPhone,
        patientAge,
        doctorId: selectedDocId,
        departmentSlug: selectedDept,
        scheduledDate: bookingDate,
        slot: bookingSlot,
        symptoms
      });

      appointment = await appointmentApi.create({
        patientName,
        patientPhone,
        patientAge: patientAge ? Number(patientAge) : undefined,
        doctorId: selectedDocId,  
        departmentSlug: selectedDept,
        scheduledDate: bookingDate || undefined,
        slot: bookingSlot || undefined,
        symptoms
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Appointment booking failed.");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);


    const matchedDoc = doctors.find(d => d.id === selectedDocId);
    const matchedDept = departments.find(dep => dep.id === (matchedDoc?.deptId || selectedDept));
    
    const mockTicket = {
      ticketId: appointment.ticketNumber,
      patientName,
      patientPhone,
      patientAge: patientAge || "N/A",
      doctorName: matchedDoc?.name || "Senior Duty Physician",
      doctorDegree: matchedDoc?.degree || "",
      doctorSpecialty: matchedDoc?.specialty || "",
      department: matchedDept?.name || "General Outpatient (OPD)",
      date: new Date(appointment.scheduledDate).toLocaleDateString(),
      slot: appointment.slot,
      chamber: appointment.doctor?.roomNumber || "Room assigned at reception, First Floor, Clinical Block",
      registrationFee: "₹0 (Online Booking Offer Saved ₹200)",
      consultationFee: `₹${appointment.doctor?.consultationFee || 400} (To be settled in clinic counter)`,
      timestamp: new Date().toLocaleString()
    };

    setTicketData(mockTicket);
  };

  const resetForm = () => {
    setPatientName("");
    setPatientPhone("");
    setPatientAge("");
    setSymptoms("");
    setSelectedDocId("");
    setSelectedDept("");
    setBookingDate("");
    setBookingSlot("");
    setTicketData(null);
  };

  return (
    <div id="booking-container" className="scroll-mt-24">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Subtle decorative medical cross grid */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-sky-600 w-full h-full">
            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
          </svg>
        </div>

        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-7 bg-sky-600 rounded-full inline-block"></span>
              Secure Online Slot
            </h3>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Zero registration fee. Book in 1 minute & report to Serampore Court Road premises.
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-emerald-100 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Normal OPD functional 9:00 AM - 8:00 PM
          </span>
        </div>

        <form onSubmit={handleBookNow} className="space-y-4">
          {/* Patient Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Patient's Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Samir Sen"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Contact Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="10-digit primary mobile"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Age (Years)</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="number"
                  placeholder="e.g. 45"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Department and Doctor Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Clinical Department</label>
              <select
                value={selectedDept}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
              >
                <option value="">-- All Departments --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Healthcare Specialist *</label>
              <select
                required
                value={selectedDocId}
                onChange={(e) => handleDocChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
              >
                <option value="">-- Select Specialist Doctor --</option>
                {filteredDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialty} ({doc.degree})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule Date & Hour */}
          {selectedDoctor && (
            <div className="p-3.5 bg-sky-50 rounded-2xl text-[12px] text-sky-950 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
              <div>
                <p className="font-bold">
                  👨‍⚕️ {selectedDoctor.name} Chamber schedule at Serampore:
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Available days of week: <span className="font-semibold text-sky-800">{selectedDoctor.days.join(", ")}</span> | Timing: {selectedDoctor.chamberTimings}
                </p>
              </div>
              <span className="bg-white/80 px-2.5 py-1 rounded border border-sky-100 font-mono font-medium text-sky-700 text-[11px]">
                Exp: {selectedDoctor.experience}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Appointment Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                />
              </div>
              {dateValidationWarning && (
                <p id="date-warning" className="text-[11px] text-amber-700 mt-1 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">
                  {dateValidationWarning}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Preferred Time Slot</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
                >
                  <option value="">-- Choose Hour Option --</option>
                  {selectedDoctor ? (selectedDoctor.slots || []).map((sl, idx) => (
                    <option key={idx} value={sl}>{sl}</option>
                  )) : (
                    <>
                      <option value="09:00 AM - 12:00 PM">Morning OPD session</option>
                      <option value="04:00 PM - 07:00 PM">Evening Specialist session</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Primary complaint details */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Brief History or Symptoms</label>
            <textarea
              rows={2}
              placeholder="e.g., routine pediatric checkup, chronic high pressure tracking, persistent knee joint pain..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 resize-none focus:bg-white transition-colors"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-sky-200 hover:-translate-y-[1px] transition-all cursor-pointer text-sm flex items-center justify-center gap-2 tracking-wide"
          >
            <span>{isSubmitting ? "Reserving Slot..." : "Generate Patient Reservation Ticket"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Dynamic confirmation ticket overlay */}
        {ticketData && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div id="booking-confirmation-modal" className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-sky-100 animate-in fade-in zoom-in duration-300">
              {/* Token banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-sky-700 p-5 text-white flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Ticket Reserved
                  </div>
                  <h4 className="text-xl font-extrabold mt-1 tracking-tight">Care Concern Hospital</h4>
                  <p className="text-[10px] text-sky-100 uppercase tracking-widest font-semibold mt-0.5">Serampore Clinical Branch</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-200 uppercase tracking-wider block">Reservation ID</span>
                  <span className="text-lg font-mono font-bold block">{ticketData.ticketId}</span>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-4">
                <div className="border-b border-dashed border-slate-200 pb-4">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Patient Ticket Info</h5>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <span className="text-slate-400">FullName:</span>
                      <p className="font-bold text-slate-800 mt-0.5">{ticketData.patientName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Mobile Phone:</span>
                      <p className="font-bold text-slate-800 mt-0.5">+91 {ticketData.patientPhone}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Age:</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{ticketData.patientAge} Yrs</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Department:</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{ticketData.department}</p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-dashed border-slate-200 pb-4">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chamber & Consult Schedule</h5>
                  <div className="space-y-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dedicated Specialist:</span>
                      <span className="font-bold text-slate-900">{ticketData.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Scheduled Date:</span>
                      <span className="font-semibold text-slate-900">{ticketData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Approx Time:</span>
                      <span className="font-semibold text-slate-900">{ticketData.slot}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-slate-500 shrink-0">Chamber Location:</span>
                      <span className="font-mono text-right text-sky-800 font-semibold">{ticketData.chamber}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing layout */}
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Online Slot Booking Registration Charge:</span>
                    <span className="text-emerald-600 font-bold">{ticketData.registrationFee}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-sm">
                    <span className="text-slate-700">Estimated Specialist OPD Fee (At Venue):</span>
                    <span className="text-slate-900">{ticketData.consultationFee}</span>
                  </div>
                </div>

                {/* Safety notes */}
                <div className="text-[10px] text-slate-400 bg-sky-50/50 p-3 rounded-xl border border-sky-100/30 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    Please display this digital ticket screen at Care Concern reception on G.T. Road, Serampore, 15 minutes before slot timing. We look forward to comforting your healing process index.
                  </span>
                </div>

                {/* Print and Return Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Print Ticket
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Done & Return
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
