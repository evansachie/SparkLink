import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { registerUser } from "../../services/api/auth";
import Logo from "../../components/common/Logo";
import { getErrorMessage } from "../../utils/getErrorMessage";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormInputs) => {
    setError(null);
    setSuccessMsg(null);
    try {
      await registerUser({ email: data.email, password: data.password });
      setSuccessMsg("Registration successful! Please check your email for the verification code.");
      reset();
      setTimeout(() => {
        navigate("/verify-email", { state: { email: data.email } });
      }, 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${"https://sparklink.onrender.com/api"}/auth/google`;
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
            <Logo size={64} />
          </div>
          <h2 className="text-3xl font-bold mb-6 text-black text-center">Create your SparkLink account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting}
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
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
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-2 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center bg-white border border-gray-300 hover:bg-primary/10 text-black font-semibold py-2 rounded transition"
            type="button"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign up with Google
          </motion.button>
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
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
          src="/signup.svg"
          alt="Placeholder"
          className="object-cover w-160 h-160 max-h-screen"
        />
      </motion.div>
    </div>
  );
};

export default RegisterPage;
