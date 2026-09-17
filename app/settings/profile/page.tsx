import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/settings/profile-settings";

export const dynamic = "force-dynamic";

export default async function SettingsProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return <ProfileSettings />;
}
