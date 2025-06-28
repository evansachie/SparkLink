import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { verifyEmail, resendVerification } from "../../services/api/auth";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import OTPImage from "../../assets/otp.svg";
import { getErrorMessage } from "../../utils/getErrorMessage";
import Input from "../../components/common/Input";

const otpSchema = z.object({
  email: z.string().email("Enter a valid email"),
  otp: z.string().min(4, "OTP is required"),
});

type OtpFormInputs = z.infer<typeof otpSchema>;

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = (location.state as { email?: string })?.email || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<OtpFormInputs>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: emailFromState },
  });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const onSubmit = async (data: OtpFormInputs) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await verifyEmail(data);
      setSuccessMsg("Email verified! Redirecting...");
      localStorage.setItem("token", res.token);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err, "Verification failed. Please try again."));
    }
  };

  const handleResend = async () => {
    setError(null);
    setSuccessMsg(null);
    setResendLoading(true);
    try {
      await resendVerification({ email: watch("email") });
      setSuccessMsg("Verification code resent! Please check your email.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resend verification code."));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: Form */}
      <motion.div
        className="flex-1 flex flex-col justify-center items-center px-8 py-12"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Logo size={80} />
          </div>
          <h2 className="text-3xl font-bold mb-6 text-black text-center">Verify your email</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              disabled={!!emailFromState || isSubmitting}
              error={errors.email?.message}
              {...register("email")}
              onChange={e => setValue("email", e.target.value)}
            />
            <Input
              label="Verification Code"
              type="text"
              autoComplete="one-time-code"
              maxLength={6}
              inputMode="numeric"
              disabled={isSubmitting}
              error={errors.otp?.message}
              className="tracking-widest text-center text-lg font-mono"
              {...register("otp")}
            />
            {error && (
              <div className="text-error text-sm text-center">{error}</div>
            )}
            {successMsg && (
              <div className="text-success text-sm text-center">{successMsg}</div>
            )}
            <Button
              type="submit"
              loading={isSubmitting}
              className="mt-2"
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </form>
          <div className="mt-4 flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="outline"
              loading={resendLoading}
              onClick={handleResend}
              className="w-auto px-4"
              disabled={resendLoading || !watch("email")}
            >
              Resend Code
            </Button>
            <Link to="/login" className="text-sm text-primary hover:underline mt-2">
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
      {/* Right: Image */}
      <motion.div
        className="hidden md:flex flex-1 items-center justify-center bg-gray-100"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={OTPImage}
          alt="OTP Illustration"
          className="object-cover w-96 h-96 max-h-screen"
        />
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
