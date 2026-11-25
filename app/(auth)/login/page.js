import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Customer sign in" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = params?.next || "/account";
  const signOutFailed = params?.error === "signout_failed";
  return (
    <AuthShell title="Customer sign in" subtitle="Sign in to manage your quotes, wishlist, cart and saved designs.">
      {signOutFailed && (
        <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          We could not sign you out. Please try again.
        </p>
      )}
      <LoginForm next={next} />
    </AuthShell>
  );
}
