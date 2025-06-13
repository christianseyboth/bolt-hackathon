// Accordion.js

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconChevronDown } from "@tabler/icons-react";

const Accordion = ({ i, expanded, setExpanded, title, description }: any) => {
  const isOpen = i === expanded;

  return (
    <div className="border border-neutral-800 rounded-xl bg-neutral-900/30 overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
      <motion.div
        initial={false}
        onClick={() => setExpanded(isOpen ? false : i)}
        className="flex items-center justify-between p-6 cursor-pointer text-base font-semibold hover:bg-neutral-900/50 group transition-colors duration-200"
      >
        <span className="text-white pr-4">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <IconChevronDown className="h-5 w-5 text-neutral-400 group-hover:text-emerald-400 transition-colors duration-200" />
        </motion.div>
      </motion.div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border-t border-neutral-800/50"
          >
            <div className="px-6 pb-6 pt-4">
              <p className="text-sm font-normal text-neutral-400 leading-relaxed">
                {description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
