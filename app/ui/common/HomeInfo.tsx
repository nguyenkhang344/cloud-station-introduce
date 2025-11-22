'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

// Define the type for renderContent
type RenderContentType = {
  [key: number]: React.ReactNode;
};

const HomeExperiencesCard = () => {
  const router = useRouter();

  const handleMyExperiencesClick = () => {
    // Trigger blur overlay effect
    (window as any).__showBlurOverlay?.(true);

    // Redirect after animation (1 second)
    setTimeout(() => {
      router.push('/cloud-station');
    }, 1000);
  };

  return (
    <div className="w-96 rounded-2xl bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-black mb-4">Hi, I&rsquo;m Khang 👋</h2>
        <p className="text-black/90 mb-3">I&rsquo;m a software engineer working in fintech, building both frontend apps with React and backend systems with Java.
          I enjoy the mix between design and logic — crafting something that not only works, but also feels right.</p>
        <p className="text-black/90 mb-6">Lately, I&rsquo;ve been diving into machine learning, curious about how code can understand and adapt.
          I&rsquo;m the kind of person who loves learning how things really work — from trading models to tiny game worlds like this one.</p>
        <div className="flex justify-end">
          <button
            onClick={handleMyExperiencesClick}
            className="btn btn-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out"
          >
            My Experiences
          </button>
        </div>
      </div>
    </div>
  );
};

const MyOtherProjectsCard = () => {
  return (
    <div className="w-96 rounded-2xl bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-black mb-4">My Other Projects 🚀</h2>
        <p className="text-black/90 mb-6">I&rsquo;ve worked on diverse projects ranging from real-time trading platforms to interactive data visualization tools. Each project represents a learning opportunity where I explore new technologies and push the boundaries of what&rsquo;s possible with modern web development and backend systems.</p>
        <div className="flex justify-end">
          <button
            className="btn btn-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out"
          >
            View Projects
          </button>
        </div>
      </div>
    </div>
  );
};

const MyContactCard = () => {
  return (
    <div className="w-96 rounded-2xl bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-black mb-4">Get in Touch 📧</h2>
        <p className="text-black/90 mb-6">Interested in collaborating or have a great project idea? Feel free to reach out. I&rsquo;m always open to discussing new opportunities and learning from fellow developers and innovators in the tech community.</p>
        <div className="flex justify-end">
          <button
            className="btn btn-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out"
          >
            Contact Me
          </button>
        </div>
      </div>
    </div>
  );
};

const renderContent: RenderContentType = {
  1: <MyContactCard />,
  2: <MyOtherProjectsCard />,
  3: <HomeExperiencesCard />,
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

  return (
    <>
      <div
        className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-300 ease-in-out ${
          renderContent[displayStage] && isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
          }`}
        style={{
          transitionProperty: 'opacity, transform'
        }}
      >
        {renderContent[displayStage]}
      </div>
    </>
  );
};

export default HomeInfo;
