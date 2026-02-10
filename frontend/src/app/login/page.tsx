import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-8 text-center">Sign In</h1>
      <LoginForm />
    </div>
  );
}
