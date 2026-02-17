import AccountPageContent from "@/components/account/AccountPageContent";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      <AccountPageContent />
    </div>
  );
}
