import { Link } from "react-router-dom";

export default function IndexPage() {
  return (
    <div className="container-fluid bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="text-center">
        <h1 className="display-4">Welcome to Coderant</h1>
        <p className="lead">The best place to improve your coding skills</p>
        <Link to="/sign-in" className="btn btn-primary btn-lg mt-4">Sign In</Link>
      </div>
    </div>
  );
}
