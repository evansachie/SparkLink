import { ReactNode } from "react";
import { motion } from "framer-motion";
import FloatingElements from "./shared/FloatingElements";

interface AuthLayoutProps {
  children: ReactNode;
  illustration?: string;
  illustrationAlt?: string;
  illustrationText?: string;
  illustrationDescription?: string;
}

export default function AuthLayout({
  children,
  illustrationText,
  illustrationDescription,
  illustration = "/login.svg"}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-center items-center px-8 py-12 relative"
      >
        <FloatingElements />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          {children}
        </motion.div>
      </motion.div>

      {/* Right: Full Image Container */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10, 150, 143, 0.1) 0%, rgba(173, 216, 230, 0.1) 100%), url(${illustration})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/20 rounded-full blur-sm"
          />
          
          <motion.div
            animate={{
              y: [0, 30, 0],
              x: [0, -15, 0],
              rotate: [360, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/2 right-1/3 w-12 h-12 bg-primary/30 rounded-full blur-sm"
          />

          <motion.div
            animate={{
              y: [0, -25, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-accent/40 rounded-full blur-sm"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-8 left-8 right-8 text-white"
        >
          <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold mb-2">
              {illustrationText || "Build. Share. Grow."}
            </h3>
            <p className="text-white/90 text-lg">
                {illustrationDescription || "Create your professional portfolio in minutes and showcase your work to the world."}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
