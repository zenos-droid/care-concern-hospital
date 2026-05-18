import { DEPARTMENTS, DOCTORS, Department, Doctor } from "../constants";
import { publicApi } from "./api";

const mapDepartment = (department: any): Department => ({
  id: department.slug,
  name: department.name,
  shortDesc: department.shortDesc,
  fullDesc: department.fullDesc,
  iconName: department?.iconName,
  features: department.features || []
});

const mapDoctor = (doctor: any): Doctor => ({
  id: doctor.publicId,
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

