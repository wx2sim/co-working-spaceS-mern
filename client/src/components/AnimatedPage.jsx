import { motion } from 'framer-motion';

const animations = {
  initial: { opacity: 0, scale: 0.98 }, 
  animate: { opacity: 1, scale: 1 },    
  exit: { opacity: 0, scale: 0.98 },
};

export default function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}