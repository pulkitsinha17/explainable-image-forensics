import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserUsageAndLimit } from "@/lib/subscription";
import { UsageSettings } from "@/components/settings/usage-settings";

export const dynamic = "force-dynamic";

export default async function SettingsUsagePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const usage = await getUserUsageAndLimit(userId);

  return <UsageSettings usage={usage} />;
}
