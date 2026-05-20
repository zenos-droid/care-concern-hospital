import { DEPARTMENTS, DOCTORS, Department, Doctor } from "../constants";
import { publicApi } from "./api";

const mapDepartment = (department: any): Department => ({
  id: department.slug || department.id,
  name: department.name || "Hospital Department",
  shortDesc: department.shortDesc || "",
  fullDesc: department.fullDesc || department.shortDesc || "",
  iconName: department?.iconName || "Stethoscope",
  features: department.features || []
});

const mapDoctor = (doctor: any): Doctor => ({
  id: doctor.publicId,
  publicId: doctor.id,
  name: doctor.fullName,
  specialty: doctor.specialty,
  deptId: doctor.department?.slug || "",
  degree: doctor.degree,
  experience: `${doctor.experienceYears}+ Years`,
  chamberTimings: doctor.chamberTimings,
  days: doctor.availableDays || [],
  slots: doctor.slots || [],
  imageDesc: doctor.bio || ""
});

export async function loadHospitalData() {
  try {
    const [departments, doctors] = await Promise.all([publicApi.departments(), publicApi.doctors()]);
    if (!departments.length || !doctors.length) {
      return {
        departments: DEPARTMENTS,
        doctors: DOCTORS
      };
    }
    return {
      departments: departments.map(mapDepartment),
      doctors: doctors.map(mapDoctor)
    };
  } catch {
    return {
      departments: DEPARTMENTS,
      doctors: DOCTORS
    };
  }
}
