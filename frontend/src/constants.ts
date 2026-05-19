// Structural data for Care Concern Hospital Pvt Ltd, Serampore, Hooghly, West Bengal

export interface Department {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string; // we map this to Lucide icon string
  features: string[];
}

export interface Doctor {
  id: string;
  publicId?: string;
  name: string;
  specialty: string;
  deptId: string;
  degree: string;
  experience: string;
  chamberTimings: string;
  days: string[];
  slots: string[];
  imageDesc: string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  iconName: string;
  imageDesc: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  message: string;
  date: string;
}

export const DEPARTMENTS: Department[] = [
  {
    id: "cardio",
    name: "Cardiology",
    shortDesc: "High-precision cardiac diagnostics & outpatient care with 24/7 support.",
    fullDesc: "Our Cardiology department provides full-scale cardiac diagnostics including 12-channel high-resolution ECG, Echocardiography (Color Doppler), TMT (Treadmill Test), and 24-Hour Holter Monitoring. Backed by expert non-invasive therapists to protect your cardiac health.",
    iconName: "HeartPulse",
    features: [
      "Advanced Multi-Channel ECG",
      "Color Doppler Echocardiography",
      "24/7 Acute Coronary Emergency Care",
      "Stress Test (TMT)"
    ]
  },
  {
    id: "ortho",
    name: "Orthopedics & Joint Care",
    shortDesc: "Comprehensive bone, joint, spine therapies & trauma management.",
    fullDesc: "Dedicated to the prevention, diagnosis, and treatment of joint systems, skeletal structures, and spinal columns. Equipped with automated traction physiotherapy and computerized high-frequency digital X-Ray for immediate bone analytics.",
    iconName: "Activity",
    features: [
      "Joint Replacement Surgery",
      "Spine & Disc Specialty OPD",
      "Complex Fracture Fixation",
      "Computerized Physiotherapy Unit"
    ]
  },
  {
    id: "pedia",
    name: "Pediatrics",
    shortDesc: "Compassionate healthcare and vaccinations for newborns & kids.",
    fullDesc: "Care Concern offers child-first pediatric healthcare. Led by loving specialists, we supervise standard developmental stages, general infant infections, nutrition guidelines, and provide full immunization support according to WHO schedules.",
    iconName: "CheckCircle2",
    features: [
      "WHO Immunization Protocols",
      "Growth & Nutrition Consulting",
      "Newborn Preventive Health Screening",
      "Round-the-clock Resident Pediatrician Support"
    ]
  },
  {
    id: "gynae",
    name: "Gynecology & Obstetrics",
    shortDesc: "Premium prenatal, pregnancy, labor rooms & women's clinic.",
    fullDesc: "Providing support for safety, privacy, and gentle medical help for mothers and newcomers. Features pre-delivery consulting, 4D ultrasound level-II scanning, painless epidural labor facility, and comprehensive laparoscopic surgeries.",
    iconName: "Award",
    features: [
      "High-Risk Pregnancy Supervision",
      "Advanced Labor Deck with ICCU support",
      "Laparoscopic Gynaecologic Surgery",
      "Women's Oncology Screenings"
    ]
  },
  {
    id: "genmed",
    name: "General Medicine",
    shortDesc: "Management of common fevers, chronic pressure & diabetes care.",
    fullDesc: "Treating infectious diseases, respiratory disorders, thyroid malfunctions, hypertension, and diabetes management. Supported by intensive multi-disciplinary consultant panels and daily high-frequency OPD slots.",
    iconName: "Stethoscope",
    features: [
      "Chronic Disease Management Charts",
      "Infectious Fever Treatment protocols",
      "Geriatric Consultation clinic",
      "Preventive Health Check up Schemes"
    ]
  },
  {
    id: "emergency",
    name: "Emergency & Trauma Care",
    shortDesc: "24/7 high-care trauma services, fast triage, and ICCU support.",
    fullDesc: "We provide round-the-clock emergency medical response and synchronized critical care support. Features expert critical care medical officers, trauma bays, 24/7 surgical readiness, and automated respiratory assistance.",
    iconName: "Zap",
    features: [
      "24/7 Fully-staffed Trauma Bays",
      "Direct Ambulance Dispatch Hotline",
      "Synchronative Hospital ICCU Beds",
      "Immediate Surgical Resuscitation Unit"
    ]
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: "doc-mukherjee",
    publicId: "dr-s-k-mukherjee",
    name: "Dr. S. K. Mukherjee",
    specialty: "Senior Consultant Cardiologist",
    deptId: "cardio",
    degree: "MD, DM (Cardiology), FACC (USA)",
    experience: "22+ Years",
    chamberTimings: "Mon, Wed, Fri (11:00 AM - 2:00 PM)",
    days: ["Monday", "Wednesday", "Friday"],
    slots: ["11:00 AM", "12:00 PM", "01:00 PM"],
    imageDesc: "Eminent medical expert looking directly into camera with trusted smile, wearing medical uniform"
  },
  {
    id: "doc-sengupta",
    publicId: "dr-anirban-sengupta",
    name: "Dr. Anirban Sengupta",
    specialty: "Senior Orthopedic & Joint Replace Surgeon",
    deptId: "ortho",
    degree: "MS (Ortho), Fellow in Joint Reconstruction (UK)",
    experience: "18+ Years",
    chamberTimings: "Mon, Wed, Fri (4:00 PM - 7:00 PM)",
    days: ["Monday", "Wednesday", "Friday"],
    slots: ["04:00 PM", "05:00 PM", "06:00 PM"],
    imageDesc: "Self-assured surgeon demonstrating joint models, reassuring expression, corporate portrait background"
  },
  {
    id: "doc-banerjee",
    publicId: "dr-priya-banerjee",
    name: "Dr. Priya Banerjee",
    specialty: "Consultant Pediatrician",
    deptId: "pedia",
    degree: "MD (Pediatrics), DCH",
    experience: "15+ Years",
    chamberTimings: "Tue, Thu, Sat (5:00 PM - 8:00 PM)",
    days: ["Tuesday", "Thursday", "Saturday"],
    slots: ["05:00 PM", "06:00 PM", "07:00 PM"],
    imageDesc: "Gentle female pediatrician wearing stethoscope holding child-friendly toys with a friendly, caring smile"
  },
  {
    id: "doc-ray",
    publicId: "dr-rupa-ray",
    name: "Dr. Rupa Ray",
    specialty: "Eminent Gynecologist & Laparoscopic Specialist",
    deptId: "gynae",
    degree: "MS (OBG), MRCOG (London)",
    experience: "19+ Years",
    chamberTimings: "Mon to Fri (10:00 AM - 1:00 PM)",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    slots: ["10:00 AM", "11:00 AM", "12:00 PM"],
    imageDesc: "Warm professional female obstetrician sitting at clinical table explaining maternity care sheet with clear focus"
  },
  {
    id: "doc-ghosh", 
    publicId: "dr-amitabha-ghosh",
    name: "Dr. Amitabha Ghosh",
    specialty: "Consultant General Physician",
    deptId: "genmed",
    degree: "MD (General Medicine), MRCP (Ireland)",
    experience: "20+ Years",
    chamberTimings: "Mon to Sat (1:00 PM - 4:00 PM)",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    slots: ["01:00 PM", "02:00 PM", "03:00 PM"],
    imageDesc: "Senior physician checking diagnostic data folder, background medical screen, trustworthy grey hair"
  }
];

export const FACILITIES: Facility[] = [
  {
    id: "iccu",
    name: "Advanced ICCU & ICU Beds",
    description: "Multi-parameter monitors, ventilators, and 24/7 intensive nurse-guided custom medical watch.",
    iconName: "Shield",
    imageDesc: "Clean sterile hospital diagnostic intensive care cabin with pulse monitors and supportive bed"
  },
  {
    id: "pathology",
    name: "24/7 Digital Pathology Lab",
    description: "Fully automated biochemistry analyzers for high-accuracy and fast diagnostic lab reporting.",
    iconName: "Activity",
    imageDesc: "Advanced diagnostics equipment with digital screens scanning blood samples, white laboratory setup"
  },
  {
    id: "ot",
    name: "Ultra-Clean Laminar Flow OT",
    description: "State-of-the-art operation theater with modern anesthesia and full orthopedic/gynae/general surgical tables.",
    iconName: "Flame",
    imageDesc: "Modern sterile clinical operation room highlighting bright overhead medical lamps and surgical gears"
  },
  {
    id: "pharmacy",
    name: "24/7 In-House Medicine Store",
    description: "Stocked with legitimate, reliable pharmaceuticals, surgical accessories, and emergency medical supplies.",
    iconName: "Users",
    imageDesc: "Clean modern pharmacy counter with organized medicine packages and pharmacist assistant attending customer"
  },
  {
    id: "dialysis",
    name: "Modern Dialysis Unit",
    description: "Comfortable dialysis chairs with advanced filtration and continuous nephro-medical staffing support.",
    iconName: "Clock",
    imageDesc: "Patient healing chairs surrounded by dialysis apparatus under comfortable warm indirect healthcare lights"
  },
  {
    id: "ambulance",
    name: "24/7 Cardiac Ambulance Fleet",
    description: "Equipped with transport oxygen, emergency medicines, monitors, and direct alert triage links.",
    iconName: "Zap",
    imageDesc: "Modern hospital transport emergency ambulance parked in front of clean lit medical triage emergency door"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Samir K. Mukhopadhyay",
    location: "Serampore, Hooghly",
    rating: 5,
    message: "During my mother's acute cardiac event, Care Concern was our savior. Their 24/7 ICCU team admitted her within minutes, and Dr. S. K. Mukherjee's treatment saved her life. We didn't have to navigate to Kolkata for advanced clinical support.",
    date: "March 2026"
  },
  {
    id: "test-2",
    name: "Meenakshi Das",
    location: "Baidyabati, Hooghly",
    rating: 5,
    message: "I delivered my daughter at Care Concern. The labor rooms are highly clean, the nurses are extremely gentle and compassionate, and Dr. Rupa Ray guided us at every stage. Highly recommended for premium obstetrics care near Serampore.",
    date: "April 2026"
  },
  {
    id: "test-3",
    name: "Pradip Sen",
    location: "Rishra, Hooghly",
    rating: 5,
    message: "My knee joint replacement therapy was done under Dr. Anirban Sengupta. Outstanding joint mobility restoration and amazing systematic treatment at the Physiotherapy lab. The hospital fees are very reasonable compared to corporate giants.",
    date: "May 2026"
  },
  {
    id: "test-4",
    name: "Rumela Ghosh",
    location: "Sheoraphuli, Hooghly",
    rating: 4,
    message: "Their digital pathology lab is incredibly structured. We got the automated blood screening and sugar reports online within 3 hours. Dr. Amitabha Ghosh explained and helped balance my thyroid treatment layout perfectly.",
    date: "February 2026"
  }
];

export const LANDMARKS = [
  {
    name: "Serampore Railway Station",
    distance: "1.2 km",
    time: "5 mins via auto / e-rickshaw (Toto)",
    directions: "Head east on Station Road towards G.T. Road, turn right at Serampore Court intersection. The hospital is right on the main G.T. Road."
  },
  {
    name: "Serampore Court G.T. Road Junction",
    distance: "250 meters",
    time: "2 mins walk",
    directions: "Conveniently located immediately south of Serampore Court. Bus routes stopping directly in front of the hospital gate."
  },
  {
    name: "Grand Trunk Road (Kolkata Outer Line Route)",
    distance: "0 km",
    time: "Direct Access",
    directions: "G.T. Road serves as the primary artery connecting Baidyabati, Sheoraphuli, Rishra, Konnagar directly with Care Concern."
  }
];
