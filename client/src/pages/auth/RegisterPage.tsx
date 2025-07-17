import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/api/auth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import AuthLayout from "../../components/auth/AuthLayout";
import OAuthButton from "../../components/auth/OAuthButton";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { OAuthDivider } from "../../components/common/OAuthDivider";
import { Alert, AlertDescription } from "../../components/ui/alert";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormInputs) => {
    setError(null);
    setSuccess(null);
    
    try {
      const res = await registerUser({ 
        email: data.email, 
        password: data.password 
      });
      
      if (res.token && res.user) {
        login(res.user, res.token);
        navigate("/dashboard", { replace: true });
        return;
      }
      
      setSuccess("Registration successful! Please check your email for the verification code.");
      reset();
      
      setTimeout(() => {
        navigate("/verify-email", { state: { email: data.email } });
      }, 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    }
  };

  return (
    <AuthLayout
      title="Create your SparkLink account"
      subtitle="Start building your professional portfolio today."
      illustration="/signup.svg"
      illustrationAlt="Sign up illustration"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <OAuthDivider/>

      <OAuthButton 
        provider="google" 
        action="signup" 
        disabled={isSubmitting}
      />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link 
          to="/login" 
          className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
