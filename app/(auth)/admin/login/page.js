import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Admin sign in" };

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const next = params?.next || "/admin/dashboard";
  const accessDenied = params?.error === "access_denied";
  const signOutFailed = params?.error === "signout_failed";

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
      {signOutFailed && (
        <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          We could not sign you out. Please try again.
        </p>
      )}
      <LoginForm next={next} showSignup={false} />
    </AuthShell>
  );
}
