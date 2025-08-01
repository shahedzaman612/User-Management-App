import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/login`,
        { email, password },
        { withCredentials: true }
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data || "Login failed");
    }
  };

  return (
    <section
      className="h-100 gradient-form"
      style={{ backgroundColor: "#eee" }}
    >
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-xl-10">
            <div className="card rounded-3 text-black shadow">
              <div className="row g-0">
                {/* Left Form */}
                <div className="col-lg-6">
                  <div className="card-body p-md-5 mx-md-4">
                    <div className="text-center">
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                        style={{ width: "185px" }}
                        alt="logo"
                      />
                      <h4 className="mt-1 mb-5 pb-1">User Management App</h4>
                    </div>

                    <form onSubmit={handleLogin}>
                      <p className="mb-4">Please login to your account</p>

                      <div className="form-outline mb-4">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-outline mb-4">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}

                      <div className="text-center pt-1 mb-5 pb-1">
                        <button
                          className="btn btn-primary btn-block w-100"
                          type="submit"
                        >
                          Log in
                        </button>
                      </div>

                      <div className="d-flex align-items-center justify-content-center pb-4">
                        <p className="mb-0 me-2">Don't have an account?</p>
                        <Link to="/register" className="btn btn-outline-danger">
                          Create new
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="col-lg-6 d-flex align-items-center bg-primary text-white rounded-end">
                  <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                    <h4 className="mb-4">We are more than just a company</h4>
                    <p className="small mb-0">
                      Join us to access powerful tools, manage your profile, and
                      connect with others. Creating an account is quick and
                      easy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
