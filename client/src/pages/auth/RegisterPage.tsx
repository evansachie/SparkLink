import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/api/auth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/shared/AuthHeader";
import OAuthButton from "../../components/auth/OAuthButton";
import { OAuthDivider } from "../../components/common/OAuthDivider";
import TermsAndPrivacy from "../../components/auth/shared/TermsAndPrivacy";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PasswordInput } from "../../components/ui/password-input";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "../../components/ui/label";

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
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

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
    <AuthLayout illustration="/signup.svg" illustrationAlt="Sign up illustration">
      <AuthHeader 
        title="Join SparkLink today" 
        subtitle="Create your professional portfolio in minutes" 
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
                  <Label htmlFor="email">Email address</Label>
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
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    placeholder="Create a strong password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <TermsAndPrivacy 
                agreed={agreedToTerms}
                onAgreedChange={setAgreedToTerms}
              />

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
                disabled={isSubmitting || !agreedToTerms}
                className="w-full h-11 text-base font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <OAuthDivider />
            </div>

            <div className="mt-6">
              <OAuthButton 
                provider="google" 
                action="signup" 
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
