import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Admin sign in" };

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const next = params?.next || "/admin/dashboard";
  const accessDenied = params?.error === "access_denied";

  return (
    <AuthShell
      audience="admin"
      title="Admin sign in"
      subtitle="Use your authorized BestHomz staff account to continue."
    >
      {accessDenied && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          This account does not have access to the admin workspace.
        </p>
      )}
      <LoginForm next={next} showSignup={false} />
    </AuthShell>
  );
}
