import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { login as loginApi } from "../../services/api/auth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import AuthLayout from "../../components/auth/AuthLayout";
import OAuthButton from "../../components/auth/OAuthButton";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { OAuthDivider } from "../../components/common/OAuthDivider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);
    try {
      const res = await loginApi(data);
      login(res.user, res.token);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Login failed. Please check your credentials."));
    }
  };

  return (
    <AuthLayout
      title="Sign in to SparkLink"
      subtitle="Welcome back! Please sign in to your account."
      illustration="/login.svg"
      illustrationAlt="Login illustration"
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
            autoComplete="current-password"
            disabled={isSubmitting}
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <OAuthDivider />

      <OAuthButton 
        provider="google" 
        action="login" 
        disabled={isSubmitting}
      />

      <div className="space-y-4 text-center text-sm">
        <Link 
          to="/forgot-password" 
          className="text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          Forgot password?
        </Link>
        
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <Link 
            to="/register" 
            className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

