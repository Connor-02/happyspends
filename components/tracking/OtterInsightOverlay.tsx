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
          style={{ background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(1.5px)', padding: '0 24px' }}
          onClick={onDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Otter + card column, centered */}
          <div
            className="relative flex flex-col items-center"
            style={{ width: '100%', maxWidth: 390 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Otter — centered, overlaps card top edge */}
            <motion.div
              className="relative z-10 pointer-events-none"
              style={{ marginBottom: -28 }}
              initial={{ scale: 0.55, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: 16 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 340, damping: 24 }}
            >
              <Image
                src="/ottertransparent.png"
                alt="Happy Otter"
                width={175}
                height={175}
                priority
                style={{
                  width: 'min(175px, 45vw)',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.22))',
                }}
              />
            </motion.div>

            {/* Speech bubble card */}
            <motion.div
              className="relative w-full z-0"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ delay: 0.16, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={onDismiss}
            >
              <div
                className="w-full px-7 py-8"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 32,
                  boxShadow: '0 24px 64px rgba(0,0,0,0.24), 0 4px 16px rgba(0,0,0,0.10)',
                }}
              >
                {/* Opening pink quote */}
                <p className="text-5xl font-black leading-none mb-1 select-none" style={{ color: '#EC4899', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                  “
                </p>

                {/* Heading */}
                <p
                  className="text-[19px] font-extrabold leading-snug mb-3"
                  style={{ color: '#111827', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  {heading}
                </p>

                {/* Opening line */}
                {openingLine && (
                  <p className="text-[15px] mb-2" style={{ color: '#374151' }}>
                    {openingLine}
                  </p>
                )}

                {/* Body with optional highlight */}
                <p className="text-[15px] leading-relaxed" style={{ color: '#374151' }}>
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
                  <p className="text-[15px] leading-relaxed mt-2" style={{ color: '#374151' }}>
                    {closingLine}
                  </p>
                )}

                {/* Closing pink quote */}
                <p className="text-5xl font-black leading-none text-right select-none mt-1" style={{ color: '#EC4899', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                  ”
                </p>

                {/* Tap to continue */}
                <p
                  className="text-sm font-semibold mt-6 text-center cursor-pointer"
                  style={{ color: '#EC4899' }}
                >
                  Tap anywhere to continue 👆
                </p>
              </div>

              {/* Downward pointer (rotated square) */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: -10,
                  width: 20,
                  height: 20,
                  background: '#FFFFFF',
                  transform: 'translateX(-50%) rotate(45deg)',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.06)',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
