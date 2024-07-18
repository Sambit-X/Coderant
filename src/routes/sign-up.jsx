import { SignUp } from "@clerk/clerk-react"

export default function SignUpPage() {
  return (
    <div className="container-fluid bg-light min-vh-100 d-flex justify-content-center align-items-center">
      <SignUp path="/sign-up" />
    </div>
  );
}