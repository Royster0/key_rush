import Game from "@/components/Game";
import { getUser } from "@/lib/auth";

export default async function Home() {
  const { user } = await getUser();

  return (
    <main className="container mx-auto py-8 flex justify-center">
      <Game user={user} />
    </main>
  );
}
