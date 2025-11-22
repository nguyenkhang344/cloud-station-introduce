'use client';

import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { PiMouseLeftClickFill } from 'react-icons/pi';
import { MdOutlineSwipe } from 'react-icons/md';
import { useTouchDevice } from '../../lib/hooks/useTouchDevice';
import { liquidGlassStyle } from '../../lib/utils';

interface InstructionOverlayProps {
  isVisible: boolean;
}

const InstructionOverlay = ({ isVisible }: InstructionOverlayProps) => {
  const { isTouchDevice, mounted } = useTouchDevice();
  return (
    <>
      <div
        className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-500 ease-in-out ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div
          className="rounded-2xl px-6 py-4 flex items-center gap-4 backdrop-blur-md"
          style={liquidGlassStyle}
        >
        {!isTouchDevice && mounted ? (
          <>
            {/* Desktop: Keyboard arrows */}
            <div className="flex items-center gap-2">
              <div className="bg-black/20 rounded-lg p-2 flex items-center justify-center min-w-[32px] h-8">
                <FaArrowLeft className="text-black text-lg" />
              </div>
              <div className="bg-black/20 rounded-lg p-2 flex items-center justify-center min-w-[32px] h-8">
                <FaArrowRight className="text-black text-lg" />
              </div>
            </div>

            {/* OR text */}
            <span className="text-black/70 text-sm font-medium">or</span>

            {/* Desktop: Drag gesture icon */}
            <div className="flex items-center gap-2">
              <div className="bg-black/20 rounded-lg p-2 flex items-center justify-center min-w-[32px] h-8">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black">
                  <path d="M12 2L15 5M12 2L9 5M12 2V22M12 22L15 19M12 22L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L5 9M2 12L5 15M2 12H22M22 12L19 9M22 12L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-black/90 text-sm">+</span>
              <div className="bg-black/20 rounded-lg p-2 flex items-center justify-center min-w-[32px] h-8">
                <PiMouseLeftClickFill className="text-black text-lg" />
              </div>
              <span className="text-black/90 text-sm">Drag to rotate</span>
            </div>
          </>
        ) : mounted ? (
          <>
            {/* Mobile: Swipe instruction */}
            <div className="flex items-center gap-2">
              <div className="bg-black/20 rounded-lg p-2 flex items-center justify-center min-w-[32px] h-8">
                <MdOutlineSwipe className="text-black text-lg" />
              </div>
              <span className="text-black/90 text-sm">Swipe to rotate</span>
            </div>
          </>
        ) : null}
        </div>
      </div>
    </>
  );
};

export default InstructionOverlay;