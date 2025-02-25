import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MarketCreatedModalProps {
  marketId: string | number;
  onClose: () => void;
}

const MarketCreatedModal = ({ marketId, onClose }: MarketCreatedModalProps) => {
  useEffect(() => {
    // Create confetti effect using DOM elements
    const colors = ['#DB9AFF', '#9A7CFF', '#FF7CDB', '#7CFFDB'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '100';
    document.body.appendChild(container);

    // Create confetti particles
    for (let i = 0; i < 100; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = '-10px'; // Start above the viewport

      // Add rotation for rectangle particles
      if (particle.style.borderRadius === '2px') {
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      }

      container.appendChild(particle);

      // Animate each particle
      const duration = 1500 + Math.random() * 1000;
      const horizontalSwing = (Math.random() - 0.5) * 100; // Random horizontal movement
      
      particle.animate([
        { 
          transform: 'translate(0, 0) rotate(0deg)',
          opacity: 1 
        },
        { 
          transform: `translate(${horizontalSwing}px, ${window.innerHeight + 10}px) rotate(${360 + Math.random() * 720}deg)`,
          opacity: 0 
        }
      ], {
        duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      });
    }

    // Create a second wave of confetti after a small delay
    setTimeout(() => {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = '-10px';
        container.appendChild(particle);

        const duration = 1500 + Math.random() * 1000;
        const horizontalSwing = (Math.random() - 0.5) * 100;
        
        particle.animate([
          { 
            transform: 'translate(0, 0) rotate(0deg)',
            opacity: 1 
          },
          { 
            transform: `translate(${horizontalSwing}px, ${window.innerHeight + 10}px) rotate(${360 + Math.random() * 720}deg)`,
            opacity: 0 
          }
        ], {
          duration,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        });
      }
    }, 200);

    // Cleanup
    setTimeout(() => {
      container.remove();
    }, 3000);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            Market Created Successfully!
          </h3>
          <p className="text-white/70">
            Your market has been created and is now live.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <Link 
            to={`/event/${marketId}`}
            className="w-full py-3 px-4 bg-[#DB9AFF] hover:bg-[#DB9AFF]/90 text-black font-medium rounded-lg text-center transition-colors"
          >
            View Market →
          </Link>
          
          <Link 
            to="/create"
            className="w-full py-3 px-4 bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-white/90 font-medium rounded-lg text-center transition-colors"
            onClick={onClose}
          >
            Create Another Market
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MarketCreatedModal; 