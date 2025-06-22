// Accordion.js

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconChevronDown } from '@tabler/icons-react';

const Accordion = ({ i, expanded, setExpanded, title, description }: any) => {
    const isOpen = i === expanded;
    const accordionId = `accordion-${i}`;
    const contentId = `accordion-content-${i}`;

    return (
        <div className='border border-neutral-800 rounded-xl bg-neutral-900/30 overflow-hidden transition-all duration-300 hover:border-emerald-500/30'>
            <button
                type='button'
                onClick={() => setExpanded(isOpen ? false : i)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                id={accordionId}
                className='flex items-center justify-between p-6 cursor-pointer text-base font-semibold hover:bg-neutral-900/50 group transition-colors duration-200 w-full text-left'
            >
                <span className='text-white pr-4'>{title}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className='flex-shrink-0'
                    aria-hidden='true'
                >
                    <IconChevronDown className='h-5 w-5 text-neutral-400 group-hover:text-emerald-400 transition-colors duration-200' />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial='collapsed'
                        animate='open'
                        exit='collapsed'
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className='border-t border-neutral-800/50'
                        id={contentId}
                        role='region'
                        aria-labelledby={accordionId}
                    >
                        <div className='px-6 pb-6 pt-4'>
                            <p className='text-sm font-normal text-neutral-300 leading-relaxed'>
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
