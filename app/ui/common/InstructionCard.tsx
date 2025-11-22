'use client';

import React, { useEffect } from 'react';
import { PiMouseLeftClickFill, PiMouseRightClickFill, PiMouseMiddleClickFill } from 'react-icons/pi';
import { AiOutlineDrag } from 'react-icons/ai';
import { TbHandTwoFingers, TbHandFinger } from 'react-icons/tb';
import { MdOutlinePinch } from 'react-icons/md';
import { useTouchDevice } from '../../lib/hooks/useTouchDevice';
import { liquidGlassStyle } from '../../lib/utils';

interface InstructionCardProps {
  isVisible?: boolean;
  onDismiss?: () => void;
}

const InstructionCard: React.FC<InstructionCardProps> = ({
  isVisible = true,
  onDismiss,
}) => {
  const { isTouchDevice, mounted } = useTouchDevice();

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!isVisible || !onDismiss) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [isVisible, onDismiss]);

  if (!mounted || !isVisible) return null;

  // Mobile touch device instructions
  const touchInstructions = [
    { icon: <div className="flex items-center gap-1"><TbHandFinger className="text-white" size={24} /><span className="text-white text-lg">+</span><AiOutlineDrag className="text-white" size={24} /></div>, text: 'One finger swipe to rotate' },
    { icon: <div className="flex items-center gap-1"><TbHandTwoFingers className="text-white" size={24} /><span className="text-white text-lg">+</span><AiOutlineDrag className="text-white" size={24} /></div>, text: 'Two fingers swipe to pan' },
    { icon: <MdOutlinePinch className="text-white" size={24} />, text: 'Pinch to zoom' },
  ];

  // Desktop mouse instructions with react-icons
  const desktopInstructions = [
    { icon: <div className="flex items-center gap-1"><PiMouseLeftClickFill className="text-white" size={24} /><span className="text-white text-lg">+</span><AiOutlineDrag className="text-white" size={24} /></div>, text: 'Left click + drag to rotate' },
    { icon: <div className="flex items-center gap-1"><PiMouseRightClickFill className="text-white" size={24} /><span className="text-white text-lg">+</span><AiOutlineDrag className="text-white" size={24} /></div>, text: 'Right click + drag for pan' },
    { icon: <PiMouseMiddleClickFill className="text-white" size={24} />, text: 'Scroll to zoom in/out' },
  ];

  const instructions = isTouchDevice ? touchInstructions : desktopInstructions;

  return (
    <div
      className={`fixed top-4 left-4 md:top-8 md:left-8 z-40 transition-all duration-300 ease-in-out transform ${
        isVisible
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 -translate-x-4 scale-95'
      }`}
    >
      <div
        className="rounded-2xl p-4 md:p-6 backdrop-blur-md"
        style={liquidGlassStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  {typeof instruction.icon === 'string' ? (
                    <span className="text-xl md:text-2xl">{instruction.icon}</span>
                  ) : (
                    instruction.icon
                  )}
                </div>
                <span className="text-white text-xs md:text-sm font-medium">
                  {instruction.text}
                </span>
              </div>
            ))}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0 -mt-3"
              aria-label="Close instruction"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructionCard;
