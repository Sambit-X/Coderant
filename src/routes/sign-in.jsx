import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="container-fluid bg-light min-vh-100 d-flex justify-content-center align-items-center">
      <SignIn path="/sign-in" />
    </div>

  );
}
