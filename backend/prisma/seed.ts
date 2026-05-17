import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const departments = [
  { slug: "cardio", name: "Cardiology", shortDesc: "High-precision cardiac diagnostics & outpatient care with 24/7 support.", fullDesc: "Full-scale cardiac diagnostics including ECG, Echocardiography, TMT, and 24-hour Holter monitoring.", iconName: "HeartPulse", features: ["Advanced Multi-Channel ECG", "Color Doppler Echocardiography", "24/7 Acute Coronary Emergency Care", "Stress Test (TMT)"] },
  { slug: "ortho", name: "Orthopedics & Joint Care", shortDesc: "Comprehensive bone, joint, spine therapies & trauma management.", fullDesc: "Prevention, diagnosis, and treatment of joint systems, skeletal structures, and spinal columns.", iconName: "Activity", features: ["Joint Replacement Surgery", "Spine & Disc Specialty OPD", "Complex Fracture Fixation", "Computerized Physiotherapy Unit"] },
  { slug: "pedia", name: "Pediatrics", shortDesc: "Compassionate healthcare and vaccinations for newborns & kids.", fullDesc: "Child-first pediatric healthcare, developmental checks, infections, nutrition, and immunization.", iconName: "CheckCircle2", features: ["WHO Immunization Protocols", "Growth & Nutrition Consulting", "Newborn Preventive Health Screening", "Round-the-clock Resident Pediatrician Support"] },
  { slug: "gynae", name: "Gynecology & Obstetrics", shortDesc: "Premium prenatal, pregnancy, labor rooms & women's clinic.", fullDesc: "Privacy-first care for mothers and women, high-risk pregnancy, ultrasound, and laparoscopic surgeries.", iconName: "Award", features: ["High-Risk Pregnancy Supervision", "Advanced Labor Deck with ICCU support", "Laparoscopic Gynaecologic Surgery", "Women's Oncology Screenings"] },
  { slug: "genmed", name: "General Medicine", shortDesc: "Management of common fevers, chronic pressure & diabetes care.", fullDesc: "Infectious disease, respiratory disorders, thyroid, hypertension, and diabetes management.", iconName: "Stethoscope", features: ["Chronic Disease Management Charts", "Infectious Fever Treatment protocols", "Geriatric Consultation clinic", "Preventive Health Check up Schemes"] },
  { slug: "emergency", name: "Emergency & Trauma Care", shortDesc: "24/7 high-care trauma services, fast triage, and ICCU support.", fullDesc: "Round-the-clock emergency response, critical care officers, trauma bays, surgical readiness, and respiratory support.", iconName: "Zap", features: ["24/7 Fully-staffed Trauma Bays", "Direct Ambulance Dispatch Hotline", "Synchronative Hospital ICCU Beds", "Immediate Surgical Resuscitation Unit"] }
];

const doctors = [
  { publicId: "doc-mukherjee", slug: "cardio", fullName: "Dr. S. K. Mukherjee", specialty: "Senior Consultant Cardiologist", degree: "MD, DM (Cardiology), FACC (USA)", experienceYears: 22, chamberTimings: "Mon, Wed, Fri (11:00 AM - 2:00 PM)", availableDays: ["Monday", "Wednesday", "Friday"], slots: ["11:00 AM", "12:00 PM", "01:00 PM"], roomNumber: "Room 101" },
  { publicId: "doc-sengupta", slug: "ortho", fullName: "Dr. Anirban Sengupta", specialty: "Senior Orthopedic & Joint Replace Surgeon", degree: "MS (Ortho), Fellow in Joint Reconstruction (UK)", experienceYears: 18, chamberTimings: "Mon, Wed, Fri (4:00 PM - 7:00 PM)", availableDays: ["Monday", "Wednesday", "Friday"], slots: ["04:00 PM", "05:00 PM", "06:00 PM"], roomNumber: "Room 102" },
  { publicId: "doc-banerjee", slug: "pedia", fullName: "Dr. Priya Banerjee", specialty: "Consultant Pediatrician", degree: "MD (Pediatrics), DCH", experienceYears: 15, chamberTimings: "Tue, Thu, Sat (5:00 PM - 8:00 PM)", availableDays: ["Tuesday", "Thursday", "Saturday"], slots: ["05:00 PM", "06:00 PM", "07:00 PM"], roomNumber: "Room 103" },
  { publicId: "doc-ray", slug: "gynae", fullName: "Dr. Rupa Ray", specialty: "Eminent Gynecologist & Laparoscopic Specialist", degree: "MS (OBG), MRCOG (London)", experienceYears: 19, chamberTimings: "Mon to Fri (10:00 AM - 1:00 PM)", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], slots: ["10:00 AM", "11:00 AM", "12:00 PM"], roomNumber: "Room 104" },
  { publicId: "doc-ghosh", slug: "genmed", fullName: "Dr. Amitabha Ghosh", specialty: "Consultant General Physician", degree: "MD (General Medicine), MRCP (Ireland)", experienceYears: 20, chamberTimings: "Mon to Sat (1:00 PM - 4:00 PM)", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], slots: ["01:00 PM", "02:00 PM", "03:00 PM"], roomNumber: "Room 105" }
];

async function main() {
  const passwordHash = await hashPassword("CareConcern@123");
  await prisma.user.upsert({ where: { email: "admin@careconcern.in" }, update: {}, create: { email: "admin@careconcern.in", phone: "9000000001", fullName: "Care Concern Admin", role: Role.ADMIN, passwordHash } });
  await prisma.user.upsert({ where: { email: "reception@careconcern.in" }, update: {}, create: { email: "reception@careconcern.in", phone: "9000000002", fullName: "Reception Desk", role: Role.RECEPTIONIST, passwordHash } });

  for (const dept of departments) {
    await prisma.department.upsert({ where: { slug: dept.slug }, update: dept, create: dept });
  }

  for (const doctor of doctors) {
    const { slug, ...doctorData } = doctor;
    const department = await prisma.department.findUniqueOrThrow({ where: { slug: doctor.slug } });
    const user = await prisma.user.upsert({
      where: { email: `${doctor.publicId}@careconcern.in` },
      update: {},
      create: { email: `${doctor.publicId}@careconcern.in`, fullName: doctor.fullName, role: Role.DOCTOR, passwordHash }
    });
    await prisma.doctor.upsert({
      where: { publicId: doctor.publicId },
      update: { ...doctorData, departmentId: department.id, userId: user.id },
      create: { ...doctorData, departmentId: department.id, userId: user.id }
    });
  }
}

main().finally(async () => prisma.$disconnect());
