'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export interface OtterInsightProps {
  /** Whether the overlay is currently visible */
  visible: boolean;
  /** Called when the user taps to dismiss */
  onDismiss: () => void;
  /** Heading text, default "Insight from Happy Otter ✨" */
  heading?: string;
  /** Opening line, e.g. "You're doing great! 🎉" */
  openingLine?: string;
  /** Main body — supports highlighting via `highlightText` */
  body: string;
  /** Substring within `body` to highlight in pink */
  highlightText?: string;
  /** Closing encouragement line */
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
  // Split body around highlightText so we can colour it
  const bodyParts = highlightText
    ? body.split(highlightText)
    : [body];

  return (
    <AnimatePresence>
      {visible && (
        // Full-screen tap target — tapping anywhere dismisses
        <motion.div
          key="otter-overlay"
          className="fixed inset-0 z-50 flex flex-col items-center justify-end"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}
          onClick={onDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Dark backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.62)', backdropFilter: 'blur(1px)' }}
          />

          {/* Otter + Bubble wrapper — stop tap propagation so clicking the bubble still dismisses via parent */}
          <div className="relative w-full max-w-sm px-5 flex flex-col items-center">

            {/* Otter mascot — overlaps top of bubble */}
            <motion.div
              className="relative z-10 pointer-events-none"
              style={{ marginBottom: -52, marginLeft: -60, alignSelf: 'flex-start' }}
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 20 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                stiffness: 320,
                damping: 22,
              }}
            >
              <Image
                src="/ottertransparent.png"
                alt="Happy Otter"
                width={180}
                height={180}
                priority
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))' }}
              />
            </motion.div>

            {/* Speech bubble */}
            <motion.div
              className="relative w-full z-0"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.18, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div
                className="w-full rounded-3xl p-6"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0,0,0,0.10)',
                }}
              >
                {/* Quote icon */}
                <div className="mb-3">
                  <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                    <path
                      d="M0 22V13.156C0 9.458 0.938 6.396 2.813 3.969 4.719 1.542 7.51 0 11.188 0v4.625C9.625 4.896 8.354 5.583 7.375 6.688 6.396 7.76 5.906 9.135 5.906 10.812H11.5V22H0ZM16.5 22V13.156c0-3.698.938-6.76 2.813-9.187C21.219 1.542 24.01 0 27.688 0v4.625c-1.563.271-2.833.958-3.813 2.063-.979 1.073-1.469 2.448-1.469 4.124H28V22H16.5Z"
                      fill="#EC4899"
                    />
                  </svg>
                </div>

                {/* Heading */}
                <p
                  className="text-xl font-extrabold mb-3 leading-snug"
                  style={{ color: '#111827', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  {heading}
                </p>

                {/* Opening line */}
                {openingLine && (
                  <p className="text-base mb-2" style={{ color: '#374151' }}>
                    {openingLine}
                  </p>
                )}

                {/* Body with optional pink highlight */}
                <p className="text-base leading-relaxed mb-1" style={{ color: '#374151' }}>
                  {highlightText && bodyParts.length === 2 ? (
                    <>
                      {bodyParts[0]}
                      <span className="font-bold" style={{ color: '#EC4899' }}>{highlightText}</span>
                      {bodyParts[1]}
                    </>
                  ) : (
                    body
                  )}
                </p>

                {/* Closing line */}
                {closingLine && (
                  <p className="text-base mt-2" style={{ color: '#374151' }}>
                    {closingLine}
                  </p>
                )}

                {/* Tap to continue */}
                <p
                  className="text-sm font-semibold mt-5 text-center cursor-pointer"
                  style={{ color: '#EC4899' }}
                >
                  Tap anywhere to continue 👆
                </p>
              </div>

              {/* Speech bubble downward pointer */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: -18,
                  width: 0,
                  height: 0,
                  borderLeft: '18px solid transparent',
                  borderRight: '18px solid transparent',
                  borderTop: '20px solid #FFFFFF',
                  filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.08))',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
