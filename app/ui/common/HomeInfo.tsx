'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import homeInfoData from '@/app/lib/data/homeInfoContent.json';
import { getHomeInfoContent, ContentCard } from '@/app/lib/hooks/useInfoContent';

const HomeCard = ({ cardData }: { cardData: ContentCard }) => {
  const router = useRouter();

  const handleButtonClick = () => {
    if (cardData.buttonAction === 'experiences') {
      (window as any).__showBlurOverlay?.(true);
      setTimeout(() => {
        router.push('/cloud-station');
      }, 1000);
    } else if (cardData.buttonAction === 'projects') {
      window.open('https://github.com/nguyenkhang344/encox-predict', '_blank');
    }
  };

  return (
    <div className="w-96 rounded-2xl bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-black mb-4">{cardData.title}</h2>
        {cardData.paragraphs?.map((paragraph, index) => (
          <p
            key={index}
            className={`text-black/90 ${index < (cardData.paragraphs?.length || 0) - 1 ? 'mb-3' : 'mb-6'}`}
          >
            {paragraph}
          </p>
        ))}
        <div className="flex justify-end">
          <button
            onClick={handleButtonClick}
            className="btn btn-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out"
          >
            {cardData.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const renderContent = (stageNumber: number) => {
  const cardData = getHomeInfoContent(homeInfoData, stageNumber);
  return cardData ? <HomeCard cardData={cardData} /> : null;
};

interface HomeInfoProps {
  currentStage: number;
}

const HomeInfo = ({ currentStage }: HomeInfoProps) => {
  const [displayStage, setDisplayStage] = useState(currentStage);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (currentStage !== displayStage) {
      // Fade out current modal
      setIsVisible(false);

      // After fade out completes, change content and fade in
      const timer = setTimeout(() => {
        setDisplayStage(currentStage);
        setIsVisible(true);
      }, 200); // 200ms fade out duration

      return () => clearTimeout(timer);
    }
  }, [currentStage, displayStage]);

  const content = renderContent(displayStage);

  return (
    <>
      <div
        className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-300 ease-in-out ${
          content && isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
          }`}
        style={{
          transitionProperty: 'opacity, transform'
        }}
      >
        {content}
      </div>
    </>
  );
};

export default HomeInfo;
