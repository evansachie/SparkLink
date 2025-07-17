import { ReactNode } from "react";
import { motion } from "framer-motion";
import Logo from "../common/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  illustration?: string;
  illustrationAlt?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  illustration = "/login.svg",
  illustrationAlt = "Authentication illustration"
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Form */}
      <motion.div
        className="flex-1 flex flex-col justify-center items-center px-8 py-12"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <Logo size={64} />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>
      </motion.div>

      {/* Right: Illustration */}
      <motion.div
        className="hidden md:flex flex-1 items-center justify-center bg-muted/30"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={illustration}
          alt={illustrationAlt}
          className="object-contain w-4/5 h-4/5 max-w-lg"
        />
      </motion.div>
    </div>
  );
}
