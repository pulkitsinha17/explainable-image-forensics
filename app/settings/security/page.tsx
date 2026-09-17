import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SecuritySettings } from "@/components/settings/security-settings";

export const dynamic = "force-dynamic";

export default async function SettingsSecurityPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return <SecuritySettings />;
}
