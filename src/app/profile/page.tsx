import PersonalBests from "@/components/profile/PersonalBest";
import TestHistory from "@/components/profile/TestHistory";
import UserStats from "@/components/profile/UserStats";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const { user } = await getUser();

  if (!user) redirect("/login");

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="grid gap-8 md:grid-cols-2">
        <UserStats userId={user.id} />
        <PersonalBests userId={user.id} />
      </div>

      <div className="mt-8">
        <TestHistory userId={user.id} />
      </div>
    </main>
  );
}
