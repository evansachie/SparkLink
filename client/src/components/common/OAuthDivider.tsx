import { motion } from "framer-motion";

export function OAuthDivider() {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative"
    >
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground font-medium">
          Or continue with
        </span>
      </div>
    </motion.div>
  );
}
