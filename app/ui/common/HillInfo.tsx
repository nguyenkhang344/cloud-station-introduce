import React, { useState, useEffect } from 'react';
import hillInfoData from '@/app/lib/data/hillInfoContent.json';
import { getHillInfoContent, ContentCard } from '@/app/lib/hooks/useInfoContent';

interface InfoCardProps {
  cardData: ContentCard;
  isExiting?: boolean;
}

const HillInfoCard = ({ cardData, isExiting = false }: InfoCardProps) => (
  <div className="card w-96 bg-transparent backdrop-blur-sm">
    <div className="card-body">
      <h2
        className={`card-title text-white ${isExiting ? 'animate-fade-up' : 'animate-fade-down'}`}
        style={{ animationDelay: isExiting ? '0.2s' : '0s', opacity: 0 }}
      >
        {cardData.title}
      </h2>
      <p
        className={`text-white ${isExiting ? 'animate-fade-up' : 'animate-fade-down'}`}
        style={{ animationDelay: isExiting ? '0s' : '0.2s', opacity: 0 }}
      >
        {cardData.description}
      </p>
    </div>
  </div>
);

const getCardContent = (hillKey: string, isExiting: boolean) => {
  const cardData = getHillInfoContent(hillInfoData, hillKey);
  if (!cardData) return null;

  return <HillInfoCard cardData={cardData} isExiting={isExiting} />;
};

interface HillInfoProps {
  currentHill: string | null;
  isVisible: boolean;
  isExiting?: boolean;
}

const HillInfo = ({ currentHill, isVisible, isExiting = false }: HillInfoProps) => {
  const [displayHill, setDisplayHill] = useState<string | null>(currentHill);
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (currentHill !== displayHill) {
      // Fade out current modal
      setShow(false);

      // After fade out completes, change content and fade in
      const timer = setTimeout(() => {
        setDisplayHill(currentHill);
        setShow(isVisible);
      }, 200); // 200ms fade out duration

      return () => clearTimeout(timer);
    } else {
      setShow(isVisible);
    }
  }, [currentHill, isVisible, displayHill]);

  if (!displayHill) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        .animate-fade-down {
          animation: fadeDown 0.6s ease-out forwards;
        }

        .animate-fade-up {
          animation: fadeUp 0.3s ease-in forwards;
        }
      `}</style>
      <div
        className={`transition-all duration-300 ease-in-out transform ${
          show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
        }`}
        style={{
          transitionProperty: 'opacity, transform',
          willChange: 'opacity, transform',
        }}
      >
        {getCardContent(displayHill, isExiting)}
      </div>
    </>
  );
};

export default HillInfo;
