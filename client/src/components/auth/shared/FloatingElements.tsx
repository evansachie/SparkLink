import { motion } from "framer-motion";

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating shapes */}
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
        className="absolute top-20 left-10 w-16 h-16 bg-primary/10 rounded-full blur-sm"
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
        className="absolute top-40 right-20 w-12 h-12 bg-accent/10 rounded-full blur-sm"
      />

      <motion.div
        animate={{
          y: [0, -25, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-32 left-20 w-8 h-8 bg-primary/20 rounded-full blur-sm"
      />

      <motion.div
        animate={{
          y: [0, 15, 0],
          x: [0, -10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-20 right-10 w-20 h-20 bg-accent/5 rounded-full blur-sm"
      />
    </div>
  );
}
