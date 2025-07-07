'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';

// 淡入动画组件
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.6,
  direction = 'up',
  className 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 }
  };

  const variants = {
    hidden: directionVariants[direction],
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.25, 0.25, 0.75]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 缩放动画组件
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  scale?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  scale = 0.8,
  className 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const variants = {
    hidden: { scale, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 交错动画组件
interface StaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const Stagger: React.FC<StaggerProps> = ({ 
  children, 
  staggerDelay = 0.1,
  className 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// 悬浮动画组件
interface FloatingProps {
  children: React.ReactNode;
  intensity?: number;
  speed?: number;
  className?: string;
}

export const Floating: React.FC<FloatingProps> = ({ 
  children, 
  intensity = 10,
  speed = 3,
  className 
}) => {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 脉冲动画组件
interface PulseProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({ 
  children, 
  scale = 1.05,
  duration = 2,
  className 
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 旋转动画组件
interface RotateProps {
  children: React.ReactNode;
  duration?: number;
  direction?: 'clockwise' | 'counterclockwise';
  className?: string;
}

export const Rotate: React.FC<RotateProps> = ({ 
  children, 
  duration = 10,
  direction = 'clockwise',
  className 
}) => {
  const rotation = direction === 'clockwise' ? 360 : -360;

  return (
    <motion.div
      animate={{
        rotate: rotation,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 页面过渡动画组件
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 卡片悬停动画组件
interface CardHoverProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
}

export const CardHover: React.FC<CardHoverProps> = ({ 
  children, 
  className,
  hoverScale = 1.02,
  hoverY = -5
}) => {
  return (
    <motion.div
      whileHover={{
        scale: hoverScale,
        y: hoverY,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 数字计数动画组件
interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({ 
  from = 0, 
  to, 
  duration = 2,
  className,
  suffix = '',
  prefix = ''
}) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const updateCount = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (endTime - startTime), 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = from + (to - from) * easeOutQuart;
        
        setCount(Math.round(currentCount));

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      requestAnimationFrame(updateCount);
    }
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
};

// 进度条动画组件
interface AnimatedProgressProps {
  value: number;
  max?: number;
  duration?: number;
  className?: string;
  showValue?: boolean;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({ 
  value, 
  max = 100,
  duration = 1.5,
  className,
  showValue = false
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const updateValue = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (endTime - startTime), 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = value * easeOutCubic;
        
        setAnimatedValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(updateValue);
        }
      };

      requestAnimationFrame(updateValue);
    }
  }, [isInView, value, duration]);

  const percentage = (animatedValue / max) * 100;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration, ease: 'easeOut' }}
        />
      </div>
      {showValue && (
        <div className="absolute right-0 top-0 -mt-6 text-sm font-medium">
          {Math.round(animatedValue)}/{max}
        </div>
      )}
    </div>
  );
};

// 加载动画组件
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-primary/20 border-t-primary rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
};

// 波纹动画组件
interface RippleProps {
  children: React.ReactNode;
  className?: string;
}

export const Ripple: React.FC<RippleProps> = ({ children, className }) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={addRipple}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute bg-white/20 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
              width: 50,
              height: 50,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
