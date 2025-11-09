import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Client-side validation
    if (!email) {
      toast.error("Please enter your email address", { 
        icon: '📧',
        duration: 3000
      });
      return;
    }
    if (!password) {
      toast.error("Please enter your password", { 
        icon: '�',
        duration: 3000
      });
      return;
    }

    await login(email, password);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/assets/carton.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="card w-full max-w-md bg-white/90 backdrop-blur shadow-2xl z-10">
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome to CartonIQ</h1>
            <p className="text-base-content/90 text-lg">Sign in to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full bg-white text-base-content"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input input-bordered w-full bg-white text-base-content pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm p-0 min-h-0 h-auto"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <Link to="/signup" className="text-sm link link-primary hover:link-hover">Create account</Link>
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;