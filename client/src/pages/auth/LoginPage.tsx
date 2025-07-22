import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { login as loginApi } from "../../services/api/auth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/shared/AuthHeader";
import OAuthButton from "../../components/auth/OAuthButton";
import { OAuthDivider } from "../../components/common/OAuthDivider";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PasswordInput } from "../../components/ui/password-input";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "../../components/ui/label";

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
      illustration="/login.jpg" 
      illustrationAlt="Login illustration"
      illustrationText="Welcome back to SparkLink"
      illustrationDescription="Sign in to continue building your portfolio and connecting with the community."
    >
      <AuthHeader 
        title="Welcome back" 
        subtitle="Sign in to your SparkLink account" 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base font-medium pulse-glow"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <OAuthDivider />
            </div>

            <div className="mt-6">
              <OAuthButton 
                provider="google" 
                action="login" 
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-6 space-y-4 text-center text-sm">
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
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}

