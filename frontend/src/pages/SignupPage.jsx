import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { validatePassword } from "../utils/helpers";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    // Validation checks with toast notifications
    if (!name || !email || !password) {
      toast.error("Please fill all fields", { icon: '📝' });
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long", { icon: '🔒' });
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter", { icon: '🔠' });
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number", { icon: '🔢' });
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { icon: '❌' });
      return;
    }

    // Create a username from the email if name is not provided
    const username = name ? name.split(' ')[0].toLowerCase() : email.split('@')[0];
    await signup({ 
      name,
      email,
      password,
      username
    });
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
            <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
            <p className="text-base-content/90 text-lg">Join CartonIQ today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full name"
              className="input input-bordered w-full bg-white text-base-content"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="input input-bordered w-full bg-white text-base-content pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm p-0 min-h-0 h-auto"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <Link to="/login" className="text-sm link link-primary hover:link-hover">Have an account? Sign in</Link>
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;