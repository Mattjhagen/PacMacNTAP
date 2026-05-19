import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Users, Brain, Key, ArrowUpRight, ArrowDown } from 'lucide-react';

interface CardItem {
  id: string;
  num: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function HowItWorks() {
  const cards: CardItem[] = [
    {
      id: 'screening',
      num: '01',
      title: 'Spam Call Screening',
      description: 'Find out who’s calling before you waste your time.',
      icon: <ShieldAlert className="w-5 h-5 text-white" />,
    },
    {
      id: 'personas',
      num: '02',
      title: 'AI Call Personas',
      description: 'Let customizable AI voices handle suspicious callers for you.',
      icon: <Users className="w-5 h-5 text-white" />,
    },
    {
      id: 'intelligence',
      num: '03',
      title: 'Smart Learning',
      description: 'PackieAI gets better at recognizing scam behavior over time.',
      icon: <Brain className="w-5 h-5 text-white" />,
    },
    {
      id: 'privacy',
      num: '04',
      title: 'Privacy Support',
      description: 'Add another layer between scammers and your real number.',
      icon: <Key className="w-5 h-5 text-white" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 90,
      },
    },
  };

  return (
    <section id="how-it-works" className="relative py-24 md:py-36 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute left-[20%] top-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.012] blur-3xl pointer-events-none" />
      <div className="absolute right-0 bottom-1/4 w-[60vw] h-[40vh] radial-glow-gradient pointer-events-none z-0 opacity-40" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center md:text-left mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="font-mono text-xs text-brand-gray-500 uppercase tracking-widest">
                04 // SMART ADD-ON
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white">
              Meet PackieAI
            </h2>
          </div>
          <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light max-w-sm md:text-left text-center leading-relaxed">
            A smarter way to deal with spam calls. This optional AI assistant is designed inside PacMac Mobile’s platform as a built-in feature to screen and manage calls.
          </p>
        </div>

        {/* 4 Cards Grid - Featuring 3D interactive tilt cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {cards.map((card) => (
            <TiltCard key={card.id} card={card} itemVariants={itemVariants} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}

// Interactive 3D Perspective Tilt Card Component
interface TiltCardProps {
  key?: string;
  card: CardItem;
  itemVariants: any;
}

function TiltCard({ card, itemVariants }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const rect = cardEl.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate relative cursor position from the center of the card
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Standard high-end tech-reveal maximum angle bounds
    const maxRotation = 10; 
    const rX = -(mouseY / (height / 2)) * maxRotation;
    const rY = (mouseX / (width / 2)) * maxRotation;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      variants={itemVariants}
      className="perspective-[1000px] h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="h-full rounded-2xl border border-white/10 bg-white/[0.01] p-6 md:p-8 backdrop-blur-md flex flex-col justify-between overflow-hidden transition-all duration-300 relative glow-sm cursor-pointer"
        style={{
          transform: isHovered 
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)` 
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          borderColor: isHovered ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isHovered ? '0 15px 35px rgba(255, 255, 255, 0.08)' : '0 0 15px rgba(255, 255, 255, 0.05)',
          transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        {/* Soft custom inner gradient light overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity duration-500 pointer-events-none"
          style={{ opacity: isHovered ? 1 : 0 }}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white">
              {card.icon}
            </div>
            <span className="font-mono text-[10px] text-brand-gray-500 uppercase tracking-widest">
              {card.num}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-xl font-semibold tracking-tight text-white">
              {card.title}
            </h3>
            <p className="text-xs md:text-sm text-brand-gray-400 font-sans font-light leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-brand-gray-400 group-hover:text-white">
          <span>PACMAC SERVICE FEATURE</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
        </div>
      </div>
    </motion.div>
  );
}
