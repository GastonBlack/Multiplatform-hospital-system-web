import { RegisterPageView } from "../components/register-page";
import { hospitalToday } from "../validation";
import { connection } from "next/server";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  await connection();
  return <RegisterPageView today={hospitalToday()} />;
}
