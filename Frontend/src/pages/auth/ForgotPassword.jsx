import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import Loading from "../../components/layout/Loading";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PRIMARY = "#048dcc";
const TEXT1 = "#1F2937";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Check if email is entered
    if (!email) {
      setError("Email is required.");
      return;
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Temporary password sent to your email");
        localStorage.setItem("resetEmail", email);
        localStorage.setItem("username", data.data.username);
        
        setTimeout(() => {
          navigate("/reset-password");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to send temporary password.");
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex items-center justify-center min-h-screen mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-6 w-full max-w-md">
        <img src={logo} alt="Logo" className="mx-auto p-2 w-50 h-30" />

        <div>
          <h2 className="text-3xl leading-9 font-extrabold text-[#039e3f]">
            Reset password
          </h2>
          <p className="text-gray-500 text-sm leading-tight mt-2">
            Enter your email address, and we'll send a temporary password. Use
            it to reset your password.
          </p>
        </div>

        {!isLoading ? (
          <div className="space-y-6">
            <div className="text-left">
              <input
                type="email"
                placeholder="Email address"
                className={`base_input w-full p-2 border rounded-md ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {error && <p className="text-[#e23131] text-sm mt-1">{error}</p>}
            </div>

            <button
              className={`rounded-md p-4 w-full mt-4 font-medium mb-0 ${
                !email ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handleSubmit}
              disabled={!email}
              style={{ 
                backgroundColor: PRIMARY, 
                color: TEXT1 
              }}
            >
              Confirm
            </button>

            {/* Back to Sign In */}
            <div className="text-center ">
              <button
                onClick={() => navigate("/")}
                className="text-[#048dcc] hover:text-[#036a9e] font-medium text-m"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <Loading />
        )}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;