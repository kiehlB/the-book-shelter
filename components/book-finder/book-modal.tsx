import * as React from 'react';
import { MdClose } from 'react-icons/md';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface BookModalProps {
  visible?: boolean;
  onClose: (visible: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

const ulVariants = {
  open: {
    display: '',

    transition: {
      staggerChildren: 0.17,
      delayChildren: 0.2,
    },
  },
  closed: {
    display: 'none',
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: 'afterChildren',
    },
  },
};

const liVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

const BookModal: React.FC<BookModalProps> = ({ visible, children, onClose }) => {
  React.useEffect(() => {
    // scrollbar
    document.body.style.overflowY = visible ? 'hidden' : 'initial';
  }, [visible]);

  return (
    <motion.div
      className={clsx(
        'fixed left-0 top-0 z-[1000] flex h-full w-full items-center justify-center bg-[#00000080] mxs:h-full mxs:w-full mxs:flex-1',
      )}
      initial={{ display: 'none' }}
      animate={visible ? 'open' : 'closed'}
      variants={ulVariants}>
      <motion.div
        variants={liVariants}
        className={`h-full w-full max-w-[80rem] bg-[#E9E9E9] dark:bg-[#1a1b1e] mxs:h-full mxs:w-auto mxs:flex-1`}>
        <div className="flex flex-1 flex-col bg-[#E9E9E9] py-4 dark:bg-[#1a1b1e]">
          <div className="flex justify-end p-[1.5rem] mxs:mb-0 mxs:hidden">
            <MdClose
              onClick={() => onClose(!visible)}
              tabIndex={1}
              size={24}
              color="#868E96"
              className="cursor-pointer"
            />
          </div>
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookModal;
