import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/react.svg";
import Loading from "../../components/layout/Loading";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PRIMARY = "#61dafbaa";
const TEXT1 = "#1F2937"; // Assuming a dark text color; adjust as needed

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
      // Hardcoded response for demo - simulates successful temp password generation
      const data = {
        success: true,
        data: {
          tempPassword: "TempPass123!", // Hardcoded temp password
          username: email, // Use email as username
        },
      };

      if (data.success) {
        toast.success("Temporary password generated and sent to email");
        localStorage.setItem("tempPassword", data.data.tempPassword);
        localStorage.setItem("username", data.data.username);
        navigate("/reset-password");
      } else {
        toast.error(data.message || "Failed to generate temporary password.");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
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
        <img src={logo} alt="Logo" className="mx-auto p-2" />

        <div>
          <h2 style={{ color: TEXT1 }} className="text-3xl leading-9 font-extrabold">
            Reset password
          </h2>
          <p className="text-gray-500 text-sm leading-tight mt-2">
            Enter your email address, and we’ll send a temporary password. Use
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
              className={`rounded-md p-4 w-full mt-4 font-medium ${
                !email ? "opacity-50 cursor-not-allowed" : ""
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
          </div>
        ) : (
          <Loading />
        )}
        <ToastContainer
          position="top-right z-40"
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