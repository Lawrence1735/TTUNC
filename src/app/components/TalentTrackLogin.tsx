import React, { useState } from "react";
import { MicroFooter } from "./MicroFooter";
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

interface LoginFormData {
  role: string;
  email: string;
  password: string;
}

interface TalentTrackLoginProps {
  onLogin?: (
    email: string,
    password: string,
    role: string,
  ) => Promise<{ success: boolean; error?: string }> | void;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

export const TalentTrackLogin: React.FC<
  TalentTrackLoginProps
> = ({ onLogin, onBack, onNavigate }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    role: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    string | null
  >(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(formData.email, formData.password, formData.role);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9]">
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-[16px] py-[0px]">
        {/* Back Button - Top Left */}
        <div className="w-full max-w-[440px] mb-4">
          <button
            onClick={handleBackClick}
            className="w-10 h-10 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#475569]" />
          </button>
        </div>

        {/* Central Institutional Branding */}
        <div className="flex flex-col items-center mb-8 md:mb-10">
          {/* UNC Institutional Crest/Seal */}

          {/* Brand Typography */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl mb-2">
              <span className="font-bold text-[#0F172A]">
                Talent
              </span>
              <span className="text-[#0F172A]">Track</span>
              <span className="font-bold text-[#7A1E1E]">
                UNC
              </span>
            </h1>
            <p className="text-sm text-[#64748B]">
              University of Nueva Caceres
            </p>
          </div>
        </div>

        {/* Central Login Card Container */}
        <div className="w-full max-w-[440px] bg-white rounded-xl border border-[#E2E8F0] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] px-[40px] py-[15px]">
          {/* Card Header */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mx-[0px] mt-[20px] mb-[8px]">
              Welcome Back
            </h2>
            <p className="text-sm text-[#64748B]">
              Sign in with your UNC credentials
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label
                htmlFor="role"
                className="block text-xs font-semibold uppercase tracking-wide text-[#475569] mb-2"
              >
                Login As:{" "}
                <span className="text-[#7A1E1E]">*</span>
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField("role")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-11 px-4 bg-[#F8FAFC] border rounded-lg appearance-none transition-all duration-200 text-sm ${
                    focusedField === "role"
                      ? "bg-white border-[#7A1E1E] ring-2 ring-[#7A1E1E]/20"
                      : "border-[#CBD5E1] hover:border-[#94A3B8]"
                  } ${formData.role ? "text-[#0F172A]" : "text-[#94A3B8]"}`}
                  required
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="director">Director</option>
                  <option value="admin">Admin</option>
                  <option value="scholar">
                    Scholar/Member
                  </option>
                  <option value="trainee">Trainee</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wide text-[#475569] mb-2"
              >
                Email <span className="text-[#7A1E1E]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="your.email@unc.edu.ph"
                className={`w-full h-11 px-4 bg-[#F8FAFC] border rounded-lg transition-all duration-200 text-sm placeholder:italic placeholder:text-[#CBD5E1] ${
                  focusedField === "email"
                    ? "bg-white border-[#7A1E1E] ring-2 ring-[#7A1E1E]/20"
                    : "border-[#CBD5E1] hover:border-[#94A3B8]"
                }`}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wide text-[#475569] mb-2"
              >
                Password{" "}
                <span className="text-[#7A1E1E]">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full h-11 px-4 pr-12 bg-[#F8FAFC] border rounded-lg transition-all duration-200 text-sm placeholder:text-[#CBD5E1] ${
                    focusedField === "password"
                      ? "bg-white border-[#7A1E1E] ring-2 ring-[#7A1E1E]/20"
                      : "border-[#CBD5E1] hover:border-[#94A3B8]"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#475569] transition-colors duration-200"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate("forgot-password");
                  }
                }}
                className="text-sm text-[#0052CC] hover:text-[#7A1E1E] hover:underline transition-colors duration-200 bg-transparent border-0 p-0 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-11 bg-[#7A1E1E] hover:bg-[#5C1616] text-white font-bold text-sm uppercase rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"></div>
            <div className="relative flex justify-center text-xs uppercase"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center"></div>
        </div>

        {/* Additional Help Text */}
        <div className="mt-8 text-center"></div>
      </div>

      {/* Atlassian-Style Minimal Micro-Footer */}
      <div className="mt-auto">
        <footer className="border-t border-[#E2E8F0] bg-white"></footer>
      </div>
    </div>
  );
};