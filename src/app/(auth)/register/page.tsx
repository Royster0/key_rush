import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/auth-form";
import { getUser } from "@/lib/auth";

export default async function RegisterPage() {
  const { user } = await getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1>
        <AuthForm isLogin={false} />
      </div>
    </div>
  );
}
