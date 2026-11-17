"use client";

import { registerDoctorAction } from "../admin/doctors/actions";
import { EmployeeRegistrationForm } from "./employee-registration-form";

export function DoctorRegistrationForm() {
  return (
    <EmployeeRegistrationForm
      section="doctors"
      registerAction={registerDoctorAction}
    />
  );
}
