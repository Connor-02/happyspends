'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export interface OtterInsightProps {
  visible: boolean;
  onDismiss: () => void;
  heading?: string;
  openingLine?: string;
  body: string;
  highlightText?: string;
  closingLine?: string;
}

export function OtterInsightOverlay({
  visible,
  onDismiss,
  heading = 'Insight from Happy Otter ✨',
  openingLine,
  body,
  highlightText,
  closingLine,
}: OtterInsightProps) {
  const bodyParts = highlightText ? body.split(highlightText) : [body];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="otter-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(1.5px)' }}
          onClick={onDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Otter + card column, centered */}
          <div
            className="relative flex flex-col items-center"
            style={{ width: '84vw', maxWidth: 340 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Otter — centered, overlaps card top edge */}
            <motion.div
              className="relative z-10 pointer-events-none"
              style={{ marginBottom: -32 }}
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.55, opacity: 0, y: 20 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 320, damping: 22 }}
            >
              <Image
                src="/ottertransparent.png"
                alt="Happy Otter"
                width={260}
                height={260}
                priority
                style={{
                  width: 'min(260px, 62vw)',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.26))',
                }}
              />
            </motion.div>

            {/* Speech bubble card */}
            <motion.div
              className="relative w-full z-0"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 14, opacity: 0 }}
              transition={{ delay: 0.16, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={onDismiss}
            >
              <div
                className="w-full"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 28,
                  boxShadow: '0 20px 56px rgba(0,0,0,0.22), 0 4px 14px rgba(0,0,0,0.10)',
                  paddingTop: 44,
                  paddingBottom: 20,
                  paddingLeft: 22,
                  paddingRight: 22,
                }}
              >
                {/* Opening pink quote */}
                <p className="text-5xl font-black leading-none mb-1 select-none" style={{ color: '#EC4899', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                  “
                </p>

                {/* Heading */}
                <p
                  className="text-[17px] font-extrabold leading-snug mb-2"
                  style={{ color: '#111827', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  {heading}
                </p>

                {/* Opening line */}
                {openingLine && (
                  <p className="text-[14px] mb-1.5" style={{ color: '#374151' }}>
                    {openingLine}
                  </p>
                )}

                {/* Body with optional highlight */}
                <p className="text-[14px] leading-relaxed" style={{ color: '#374151' }}>
                  {highlightText && bodyParts.length === 2 ? (
                    <>
                      {bodyParts[0]}
                      <span className="font-bold" style={{ color: '#EC4899' }}>{highlightText}</span>
                      {bodyParts[1]}
                    </>
                  ) : body}
                </p>

                {/* Closing line */}
                {closingLine && (
                  <p className="text-[14px] leading-relaxed mt-1.5" style={{ color: '#374151' }}>
                    {closingLine}
                  </p>
                )}

                {/* Closing pink quote */}
                <p className="text-5xl font-black leading-none text-right select-none mt-1" style={{ color: '#EC4899', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                  ”
                </p>

                {/* Tap to continue */}
                <p
                  className="text-[13px] font-semibold mt-4 text-center cursor-pointer"
                  style={{ color: '#EC4899' }}
                >
                  Tap anywhere to continue 👆
                </p>
              </div>

              {/* Downward pointer (rotated square) */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: -9,
                  width: 18,
                  height: 18,
                  background: '#FFFFFF',
                  transform: 'translateX(-50%) rotate(45deg)',
                  boxShadow: '3px 3px 6px rgba(0,0,0,0.06)',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
