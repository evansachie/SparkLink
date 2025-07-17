import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import NotFoundSVG from "../assets/not-found.svg";

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
    <motion.img
      src={NotFoundSVG}
      alt="Page not found"
      className="w-72 h-72 mb-8"
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    />
    <motion.h1
      className="text-4xl md:text-5xl font-bold text-black mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      404 – Page Not Found
    </motion.h1>
    <motion.p
      className="text-gray-500 text-lg md:text-xl mb-8 text-center max-w-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      Sorry, the page you’re looking for doesn’t exist or has been moved.
    </motion.p>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Link
        to="/"
        className="inline-block bg-primary hover:bg-black text-white font-semibold px-6 py-2 rounded transition"
      >
        Go to Home
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
