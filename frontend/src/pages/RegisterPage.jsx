import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/register", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
            <div className="card rounded-3 text-black">
              <div className="row g-0">
                {/* Left Side: Form */}
                <div className="col-lg-6">
                  <div className="card-body p-md-5 mx-md-4">
                    <div className="text-center">
                      <h4 className="mt-1 mb-5 pb-1">Create Your Account</h4>
                    </div>

                    <form onSubmit={handleRegister}>
                      <div className="form-outline mb-4">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="John Doe"
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-outline mb-4">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-outline mb-4">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {error && (
                        <div className="alert alert-danger py-2">{error}</div>
                      )}

                      <div className="text-center pt-1 mb-5 pb-1">
                        <button
                          className="btn btn-primary btn-block gradient-custom-2 mb-3 w-100"
                          type="submit"
                        >
                          Register
                        </button>
                        <Link to="/" className="text-muted">
                          Already have an account? Login here
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Side: Info Panel */}
                <div className="col-lg-6 d-flex align-items-center gradient-custom-2 text-white rounded-end">
                  <div className="text-center px-3 py-4 p-md-5 mx-md-4">
                    <h4 className="mb-4">Welcome to Our Community</h4>
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

// Gradient background custom style
const style = document.createElement("style");
style.innerHTML = `
  .gradient-custom-2 {
    background: linear-gradient(to right, #6a11cb, #2575fc);
  }
`;
document.head.appendChild(style);

export default RegisterPage;
