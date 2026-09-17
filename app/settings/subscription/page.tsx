import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserUsageAndLimit } from "@/lib/subscription";
import { SubscriptionSettings } from "@/components/settings/subscription-settings";

export const dynamic = "force-dynamic";

export default async function SettingsSubscriptionPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const usage = await getUserUsageAndLimit(userId);

  return <SubscriptionSettings usage={usage} />;
}
