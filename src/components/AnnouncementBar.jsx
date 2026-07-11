import { motion } from 'framer-motion';

const announcements = [
  "FREE SHIPPING IN INDIA",
  "Delivery Time: 15-20 Working Days",
  "FREE SHIPPING IN INDIA",
  "Delivery Time: 15-20 Working Days",
];

export default function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground overflow-hidden py-2 text-xs tracking-[0.2em] uppercase font-body">
      <motion.div
        className="flex whitespace-nowrap gap-16"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...announcements, ...announcements].map((text, i) => (
          <span key={i} className="flex-shrink-0 px-8">{text}</span>
        ))}
      </motion.div>
    </div>
  );
}