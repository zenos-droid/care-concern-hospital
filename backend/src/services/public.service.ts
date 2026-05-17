import { prisma } from "../config/prisma";

export class PublicService {
  departments() {
    return prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, include: { doctors: { where: { isActive: true } } } });
  }

  doctors(filters: { departmentSlug?: string; day?: string; search?: string }) {
    return prisma.doctor.findMany({
      where: {
        isActive: true,
        department: filters.departmentSlug ? { slug: filters.departmentSlug } : undefined,
        availableDays: filters.day ? { has: filters.day } : undefined,
        OR: filters.search ? [
          { fullName: { contains: filters.search, mode: "insensitive" } },
          { specialty: { contains: filters.search, mode: "insensitive" } },
          { degree: { contains: filters.search, mode: "insensitive" } }
        ] : undefined
      },
      include: { department: true },
      orderBy: { fullName: "asc" }
    });
  }

  async chatbot(message: string) {
    const lower = message.toLowerCase();
    if (/(emergency|ambulance|trauma|chest pain|critical)/.test(lower)) return "For emergencies, call +91 33 2662 4000 or report to the 24/7 emergency triage at Care Concern Hospital, Serampore.";
    if (/(appointment|book|schedule)/.test(lower)) return "Use the Book Appointment form, choose a department, doctor, date, and slot. Reception can also help at +91 33 2662 4001.";
    if (/(address|location|station|map)/.test(lower)) return "Care Concern Hospital is at 12, Grand Trunk Road, Serampore, Hooghly, West Bengal - 712201, near Serampore Court.";
    return "Care Concern Hospital supports Cardiology, Orthopedics, Pediatrics, Gynecology, General Medicine, Emergency care, diagnostics, ICCU, and 24/7 pharmacy. For clinical diagnosis, consult a physician.";
  }
}

export const publicService = new PublicService();
