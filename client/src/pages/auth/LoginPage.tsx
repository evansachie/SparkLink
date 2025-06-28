import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { login as loginApi } from "../../services/api/auth";
import Logo from "../../assets/spark-logo.jpg";
import { getErrorMessage } from "../../utils/getErrorMessage";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);
    try {
      const res = await loginApi(data);
      localStorage.setItem("token", res.token);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Login failed. Please check your credentials."));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/google`;
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
            <Link to='/login'>
                <img src={Logo} alt="SparkLink Logo" className="h-16 w-auto" />
            </Link>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-black text-center">Sign in to SparkLink</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Email</label>
              <input
                type="email"
                {...register("email")}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white text-black ${errors.email ? "border-error" : "border-gray-300"}`}
                autoComplete="email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="text-xs text-error">{errors.email.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Password</label>
              <input
                type="password"
                {...register("password")}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white text-black ${errors.password ? "border-error" : "border-gray-300"}`}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="text-xs text-error">{errors.password.message}</span>
              )}
            </div>
            {error && (
              <div className="text-error text-sm text-center">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-black text-white font-semibold py-2 rounded transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-2 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center bg-white border border-gray-300 hover:bg-primary/10 text-black font-semibold py-2 rounded transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </motion.button>
          <div className="mt-6 text-center">
            <a href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="mt-2 text-center text-sm">
            <span className="text-gray-500">
              Don't have an account?{" "}
              <a href="/register" className="text-primary hover:underline">
                Sign up
              </a>
            </span>
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
          src="/login.svg"
          alt="Placeholder"
          className="object-cover w-160 h-160 max-h-screen"
        />
      </motion.div>
    </div>
  );
};

export default LoginPage;

