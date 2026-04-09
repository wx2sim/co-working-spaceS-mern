import { motion } from 'framer-motion';

const animations = {
  initial: { opacity: 0, y: 50 }, // Start 
  animate: { opacity: 1, y: 0 },  // Animate to fully visible and center
  exit: { opacity: 0, y: -50},   // Exit 
};

export default function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}