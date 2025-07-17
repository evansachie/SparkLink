import { motion } from "framer-motion";
import Logo from "../../common/Logo";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center space-y-6"
    >
      {/* Logo with floating animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        <div className="p-4 bg-primary/10 rounded-2xl float-animation">
          <Logo size={48} />
        </div>
      </motion.div>

      {/* Title and subtitle */}
      <div className="space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl font-bold text-foreground tracking-tight"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
