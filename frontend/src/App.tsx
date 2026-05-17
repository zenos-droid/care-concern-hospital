import { useState, useEffect } from "react";
import { 
  HeartPulse, Phone, MessageSquare, Menu, X, ArrowRight, Shield, Heart, 
  MapPin, CheckCircle2, Star, Calendar, MessageCircle, Navigation, Info, 
  HelpCircle, Sparkles, Building, Globe, Mail 
} from "lucide-react";
import { TESTIMONIALS } from "./constants";
import AboutSection from "./components/AboutSection";
import ChatbotWidget from "./components/ChatbotWidget";
import BookingForm from "./components/BookingForm";
import DepartmentsSection from "./components/DepartmentsSection";
import DoctorsSection from "./components/DoctorsSection";
import FacilitiesSection from "./components/FacilitiesSection";
import AuthPortal from "./components/AuthPortal";
import DashboardPortal from "./components/DashboardPortal";
import { AuthSession, AuthUser, getStoredUser } from "./services/api";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  
  // Shared state for appointment booking sync
  const [bookingDeptId, setBookingDeptId] = useState("");
  const [bookingDocId, setBookingDocId] = useState("");
  
  // Dynamic counter to force-rebuild the form component when pre-populated from external clicks
  const [formResetCounter, setFormResetCounter] = useState(0);
  const [portalUser, setPortalUser] = useState<AuthUser | null>(() => getStoredUser());

  // Monitor scroll positioning to update sticky active links
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "departments", "doctors", "portal", "portal-dashboard", "facilities", "testimonials", "contact"];
      const currentScroll = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (currentScroll >= top && currentScroll < top + height) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // When a user selects a department from the panel, pre-fill it and scroll to form
  const handleSelectDept = (deptId: string) => {
    setBookingDeptId(deptId);
    setBookingDocId(""); // Reset specific doctor
    setFormResetCounter(prev => prev + 1);

    // Scroll smoothly to appointment section
    const formSection = document.getElementById("appointment-section");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // When a user selects a doctor card, pre-fill department & doctor and scroll to form
  const handleSelectDoctor = (docId: string, deptId: string) => {
    setBookingDeptId(deptId);
    setBookingDocId(docId);
    setFormResetCounter(prev => prev + 1);

    const formSection = document.getElementById("appointment-section");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAuthenticated = (session: AuthSession) => {
    setPortalUser(session.user);
    setTimeout(() => {
      document.getElementById("portal-dashboard")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between scroll-smooth text-slate-800 font-sans">
      
      {/* 24/7 Flash Announcement Bar */}
      <div className="bg-gradient-to-r from-sky-900 to-sky-950 text-white text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-cyan-200">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block"></span>
            🚨 24/7 Clinical Emergency & ICCU Active: +91 33 2662 4000
          </span>
          <div className="flex gap-4 text-[11px] text-slate-300 font-medium">
            <span>📍 12, G.T. Road, Serampore, Hooghly (Next to Serampore Court)</span>
            <span className="hidden md:inline">🕒 OPD timing: 9:00 AM - 8:00 PM</span>
          </div>
        </div>
      </div>

      {/* Sticky Premium Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-150 shadow-sm leading-none shrink-0 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <a href="#home" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md border border-sky-500/10">
              CC
            </div>
            <div>
              <h1 className="text-base font-black leading-none text-sky-900 tracking-tight text-[17px]">
                CARE CONCERN
              </h1>
              <span className="text-[9px] text-sky-600 uppercase tracking-widest font-extrabold mt-0.5 block">
                Hospital Pvt Ltd
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-bold text-slate-600 uppercase tracking-wider">
            {[
              { id: "home", label: "Home" },
              { id: "about", label: "About" },
              { id: "departments", label: "Departments" },
              { id: "doctors", label: "Doctors" },
              { id: portalUser ? "portal-dashboard" : "portal", label: "Portal" },
              { id: "facilities", label: "Facilities" },
              { id: "testimonials", label: "Reviews" },
              { id: "contact", label: "Contact Site" }
            ].map(tab => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                className={`transition-colors py-1 relative ${activeTab === tab.id ? "text-sky-600" : "hover:text-sky-850 text-slate-500"}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-sky-600 rounded-full"></span>
                )}
              </a>
            ))}
          </nav>

          {/* Right Header Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <a 
              href="tel:+913326624001" 
              className="text-slate-600 hover:text-sky-800 text-xs font-bold font-mono tracking-wide px-3 py-2 bg-slate-100 rounded-xl flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>+91 33 2662 4001</span>
            </a>
            <a
              href="#appointment-section"
              className="bg-sky-600 hover:bg-sky-700 text-white px-4.5 py-3 rounded-xl text-xs font-bold tracking-wide uppercase shadow-md hover:shadow-sky-100 transition-colors cursor-pointer"
            >
              Book Appointment
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-600 hover:text-sky-750 p-2 focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Options"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-md border-b border-slate-200 fixed top-16 left-0 right-0 z-30 shadow-xl overflow-y-auto max-h-[calc(100vh-4rem)] p-4 space-y-3 leading-none transition-all">
          <div className="flex flex-col gap-1">
            {[
              { id: "home", label: "Home" },
              { id: "about", label: "About Hospital" },
              { id: "departments", label: "Specialty Departments" },
              { id: "doctors", label: "Meet our Consultants" },
              { id: portalUser ? "portal-dashboard" : "portal", label: "Login Portal" },
              { id: "facilities", label: "Diagnostics Facilities" },
              { id: "testimonials", label: "Patient Feedbacks" },
              { id: "contact", label: "Locate & Contact" }
            ].map(tab => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-3.5 rounded-xl font-bold text-sm tracking-wide transition-colors ${activeTab === tab.id ? "bg-sky-100/70 text-sky-850" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {tab.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="tel:+913326624001"
              className="w-full text-center py-3 bg-slate-50 border border-slate-250 font-bold font-mono tracking-wide rounded-xl text-slate-700 text-xs flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-sky-600 animate-pulse" /> Call Desk: +91 33 2662 4001
            </a>
            <a
              href="#appointment-section"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 bg-sky-600 hover:bg-sky-700 text-white font-black tracking-widest uppercase rounded-xl text-xs shadow-md"
            >
              Book Consultation Slot
            </a>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section id="home" className="relative py-12 md:py-16 lg:py-20 bg-[#f8fafc] overflow-hidden scroll-mt-20">
          
          {/* Subtle animated/curved backdrop circles */}
          <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-sky-150/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-cyan-150/40 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column Text details */}
              <div className="lg:col-span-7 space-y-6 lg:max-w-2xl text-left">
                <span className="bg-sky-100/80 text-sky-800 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-sky-200 inline-flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-sky-500 rounded-full inline-block"></span>
                  Serampore Hooghly's Trusted Clinical Destination
                </span>
                
                <h1 className="text-4xl sm:text-5.5xl font-extrabold tracking-tight text-slate-900 leading-[1.08] font-sans">
                  Trusted 24/7 <br />
                  Healthcare for <span className="bg-gradient-to-r from-sky-600 to-sky-900 bg-clip-text text-transparent font-serif italic font-normal">Your Family</span>
                </h1>

                <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl font-normal">
                  Care Concern Hospital Pvt Ltd brings elite, medical therapy, highly diagnostic machinery, and compassionate clinical care directly to G.T. Road, Serampore. Get treated locally without navigating long distances.
                </p>

                {/* Micro Key Badges */}
                <div className="grid grid-cols-2 gap-4 pb-2 text-xs md:text-sm text-slate-700 font-semibold max-w-lg">
                  <div className="flex items-center gap-2 bg-white/70 p-3 rounded-2xl border border-slate-150 shadow-xs">
                    <CheckCircle2 className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                    <span>24/7 Triage & Trauma Bed</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 p-3 rounded-2xl border border-slate-150 shadow-xs">
                    <CheckCircle2 className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                    <span>WHO Standard Immunization</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 p-3 rounded-2xl border border-slate-150 shadow-xs">
                    <CheckCircle2 className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                    <span>Digitally Automated Lab</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 p-3 rounded-2xl border border-slate-150 shadow-xs">
                    <CheckCircle2 className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                    <span>Laminar Flow Sterile OTs</span>
                  </div>
                </div>

                {/* Primary actions buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <a
                    href="#appointment-section"
                    className="w-full sm:w-auto text-center bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-7 py-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-sky-100 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <span>Secure Online Appt</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  {/* Hot Hotline Emergency trigger */}
                  <a
                    href="tel:+913326624000"
                    className="w-full sm:w-auto p-3.5 bg-white border border-red-250 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center sm:justify-start gap-3 shadow-md border-b-2"
                  >
                    <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white animate-pulse">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-wider text-red-500 block font-bold">24-Hr Ambulance</span>
                      <p className="font-extrabold text-slate-900 font-mono text-sm leading-none mt-0.5">+91 33 2662 4000</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Right Column Layout representing clean visual medical trust banner */}
              <div className="lg:col-span-5 relative mt-8 lg:mt-0">
                <div className="bg-gradient-to-br from-sky-700 to-sky-900 rounded-[36px] overflow-hidden p-8 text-white shadow-2xl relative border border-white/5 flex flex-col justify-between min-h-[420px]">
                  
                  {/* Backdrop glass decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-xl -ml-20 -mb-20"></div>

                  <div className="space-y-4 relative">
                    <span className="bg-cyan-400/25 text-cyan-200 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-cyan-400/30 w-fit block backdrop-blur-md">
                      Serampore Hooghly
                    </span>
                    <h3 className="text-3xl md:text-3.5xl font-extrabold tracking-tight leading-tight">
                      Experience <br />
                      Clinical Healing <br />
                      With Care Concern
                    </h3>
                    <p className="text-sky-100 text-sm leading-relaxed max-w-sm">
                      We believe every patient deserves immediate senior consulting, respectful interaction, and optimized high-precision diagnostics.
                    </p>
                  </div>

                  {/* Micro medical rating box */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4.5 rounded-2xl relative mt-8 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex gap-0.5 text-amber-300">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className="w-4 h-4 fill-current text-cyan-200" />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-white mt-1.5 leading-tight">
                        Rated 4.8★ by 10,000+ Families
                      </p>
                      <p className="text-[10px] text-cyan-100">Across Hooghly, West Bengal area</p>
                    </div>
                    <div className="w-10 h-10 bg-cyan-400/20 rounded-full flex items-center justify-center text-cyan-200 shrink-0 border border-cyan-400/30">
                       <Shield className="w-5 h-5" />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TRUST BANNER METRICS & LOGO HIGHLIGHT - HANDLED INSIDE Legacy stats of AboutSection */}

        {/* ABOUT HOSPITAL Legacy SECTION */}
        <AboutSection />

        {/* DEPARTMENTS VIEW SECTION */}
        <DepartmentsSection onSelectDept={handleSelectDept} />

        {/* CLINICAL SPECIALIST DOCTORS SECT */}
        <DoctorsSection onSelectDoc={handleSelectDoctor} />

        {portalUser ? (
          <DashboardPortal user={portalUser} onLogout={() => setPortalUser(null)} />
        ) : (
          <AuthPortal onAuthenticated={handleAuthenticated} />
        )}

        {/* ADVANCED INFRASTRUCTURE DIAGNOSTIC FACILITIES */}
        <FacilitiesSection />

        {/* PATIENT TESTIMONIALS SECTION */}
        <section id="testimonials" className="py-16 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-sky-600 text-xs font-bold uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
                 Patient Testimonials
              </span>
              <h2 className="text-3.5xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
                 Words of Faith and Recovery
              </h2>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                 Listen directly to patients who restored their cardiac, bone joint, gynecologic wellness right here in Serampore.
              </p>
            </div>

            {/* Testimonials Swiper-ish grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((test) => (
                <div
                  key={test.id}
                  className="bg-slate-50 rounded-3xl p-6 border border-slate-150 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Render rating stars */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: test.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-amber-500" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{test.date}</span>
                    </div>

                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed italic font-normal">
                      "{test.message}"
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                       {test.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-none">{test.name}</h4>
                      <span className="text-[11px] text-slate-400 block mt-1">{test.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* APPOINTMENT SEC FORM CONTAINER */}
        <section id="appointment-section" className="py-16 bg-slate-50 scroll-mt-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            
            <div className="text-center mb-8">
              <span className="text-sky-600 text-xs font-bold uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100 uppercase">
                 Interactive Calendar Slots
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
                 Schedule Your Outpatient Visit
              </h2>
            </div>

            {/* Render form. Each external pre-fill clicks increments the reset counter to force redraw options */}
            <BookingForm 
              key={formResetCounter} 
              initialDeptId={bookingDeptId} 
              initialDocId={bookingDocId}
            />

          </div>
        </section>

        {/* MAPS INTEGRATION SECTION WITH REAL EMBED AND LOCAL SIDEBAR */}
        <section id="contact" className="py-16 bg-white border-t border-slate-150 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5 space-y-6 text-left">
                <span className="text-sky-600 text-xs font-bold uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
                   Find Us Instantly
                </span>
                <h2 className="text-3xl md:text-3.5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                   Located Directly on Grand Trunk Road
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                   Care Concern is positioned centrally, meaning visitors can commute hassle-free from both Hooghly and North 24 Parganas (via Barrackpore-Serampore Ferry Ghat).
                </p>

                {/* Local Contact coordinates */}
                <div className="space-y-3.5 text-xs md:text-sm font-semibold text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">Hospital Address:</strong>
                      <p className="text-slate-500 font-normal mt-0.5 leading-relaxed text-xs">
                        12, Grand Trunk Road, Serampore, Hooghly, West Bengal - 712201 (Adjacent to Serampore Court).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">Support Desks (9 AM - 8 PM):</strong>
                      <p className="text-slate-500 font-mono font-normal mt-0.5 text-xs">
                        +91 33 2662 4001, +91 33 2662 4002
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">General Enquiries:</strong>
                      <p className="text-slate-500 font-normal mt-0.5 text-xs lowercase">
                        contact@careconcern.in, billing@careconcern.in
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ferry connection disclaimer */}
                <div className="p-3 bg-cyan-50/50 text-cyan-900 border border-cyan-150 rounded-2xl text-[11px] leading-relaxed">
                  🌉 <strong>Commuters from Barrackpore:</strong> Take the Barrackpore-Serampore central launch ferry. It's just a 6 mins Toto auto commute from the Serampore Ferry jetty to the hospital G.T. road gate.
                </div>
              </div>

              {/* Maps integration side containing a beautiful responsive iframe */}
              <div className="lg:col-span-7 bg-slate-100 rounded-3xl overflow-hidden shadow-lg border border-slate-200 h-[380px] relative">
                {/* Embed high fidelity map placeholder framing */}
                <iframe
                  title="Care Concern Hospital Serampore Maps View"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3678.966440263309!2d88.344400!3d22.766600!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89b9f71c4c95f%3A0x6b4be9fafb590e!2sCare%20Concern%2520Hospital!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-350 pt-16 pb-8 border-t border-slate-800 shrink-0 select-none text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-805">
            
            {/* Brand Intro Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  CC
                </div>
                <div>
                  <h4 className="text-white text-base font-black tracking-tight leading-none">CARE CONCERN</h4>
                  <span className="text-[9px] uppercase tracking-wider text-sky-400 font-bold block mt-0.5">Hospital Pvt Ltd</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Care Concern Hospital Pvt Ltd, Serampore Hooghly is an accredited multi-specialty healthcare clinic delivering elite wellness and surgical solutions at patient-friendly pricing structures.
              </p>
              <p className="text-[10px] text-slate-500 font-normal">
                Approved by West Bengal Clinical Establishment licensing authorities. Registry: CCH-HOOGH-2006.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="lg:col-span-2.5">
              <h5 className="text-white text-xs font-black uppercase tracking-wider mb-4 border-l-2 border-sky-400 pl-2">
                 Quick Navigation
              </h5>
              <ul className="space-y-2.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <li><a href="#home" className="hover:text-white transition-colors">Portal Home</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Hospital Profile</a></li>
                <li><a href="#departments" className="hover:text-white transition-colors">Specialty OPDs</a></li>
                <li><a href="#doctors" className="hover:text-white transition-colors">Specialist Doctors</a></li>
                <li><a href="#facilities" className="hover:text-white transition-colors">Diagnostics Labs</a></li>
              </ul>
            </div>

            {/* Departments Quick Column */}
            <div className="lg:col-span-2.5">
              <h5 className="text-white text-xs font-black uppercase tracking-wider mb-4 border-l-2 border-sky-400 pl-2">
                 Specialty Clinics
              </h5>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a onClick={() => handleSelectDept("cardio")} href="#appointment-section" className="hover:text-white transition-colors cursor-pointer">Cardiology Checkups</a></li>
                <li><a onClick={() => handleSelectDept("ortho")} href="#appointment-section" className="hover:text-white transition-colors cursor-pointer">Physiotherapy & Bone Care</a></li>
                <li><a onClick={() => handleSelectDept("pedia")} href="#appointment-section" className="hover:text-white transition-colors cursor-pointer">Pediatrics Immunization</a></li>
                <li><a onClick={() => handleSelectDept("gynae")} href="#appointment-section" className="hover:text-white transition-colors cursor-pointer">Maternity & Gynecology</a></li>
                <li><a onClick={() => handleSelectDept("genmed")} href="#appointment-section" className="hover:text-white transition-colors cursor-pointer">Chronic Lifestyle Care</a></li>
              </ul>
            </div>

            {/* Legal / Emergency protocols column */}
            <div className="lg:col-span-3 space-y-4">
              <h5 className="text-white text-xs font-black uppercase tracking-wider mb-2 border-l-2 border-sky-400 pl-2">
                 Accreditation & Safety
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Our operations fulfill standard clinical protocols. Dedicated emergency protocols are functional round-the-clock inside the hospital campus.
              </p>
              <div className="p-3 bg-slate-800 rounded-2xl text-[10px] text-slate-300 leading-relaxed">
                 🛡️ Approved under West Bengal Swasthya Sathi scheme & premium private medical insurers. Verify coverage at admission counters.
              </div>
            </div>

          </div>

          {/* Copy notes */}
          <div className="pt-8 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <p>
              © {new Date().getFullYear()} Care Concern Hospital Pvt Ltd. All Clinical Rights Reserved. Created and maintained under Serampore Hooghly licensing.
            </p>
            <div className="flex gap-4">
              <a href="#about" className="hover:text-white transition-colors">Terms of Hospitality</a>
              <a href="#about" className="hover:text-white transition-colors">Privacy Principles</a>
              <a href="https://wa.me/919830000000" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Emergency Protocol</a>
            </div>
          </div>

        </div>
      </footer>

      {/* COMPLIANT FLOATING ACTION PILLS */}
      <div className="fixed bottom-6 right-6 z-45 flex flex-col gap-3">
        
        {/* Floating WhatsApp Action Trigger */}
        <a
          id="btn-whatsapp"
          href="https://wa.me/919830000000?text=Hello%20Care%20Concern%20Hospital%20Serampore.%20I%20would%20like%20to%20enquire%20about%20OPD%20doctor%20timings."
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          title="Instant WhatsApp Helpdesk"
          aria-label="Contact us on WhatsApp"
        >
          {/* Custom SVG WhatsApp representing high premium polish */}
          <svg className="w-6.5 h-6.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.43 0 9.85-4.417 9.854-9.853.002-5.462-4.415-9.85-9.846-9.851-5.435 0-9.853 4.418-9.855 9.852-.001 2.015.524 3.9 1.591 5.603l-.998 3.646 3.938-1.033z" />
          </svg>
        </a>

        {/* Hot Emergency Floating Phone Dialer Dial */}
        <a
          id="btn-emergency-pill"
          href="tel:+913326624000"
          className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          title="24/7 Ambulance Emergency Dispatch Line"
          aria-label="Directly call Emergency dispatch list"
        >
          <Phone className="w-5.5 h-5.5 animate-bounce mt-0.5" />
        </a>

      </div>

      {/* FLOATING COMPASSIONATE CHATBOT WIDGET */}
      <ChatbotWidget />

    </div>
  );
}
