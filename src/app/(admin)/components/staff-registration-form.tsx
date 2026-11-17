"use client";

import { registerStaffAction } from "../admin/staff/actions";
import { EmployeeRegistrationForm } from "./employee-registration-form";

export function StaffRegistrationForm() {
  return (
    <EmployeeRegistrationForm
      section="staff"
      registerAction={registerStaffAction}
    />
  );
}
