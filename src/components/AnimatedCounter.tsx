import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number | string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter = ({ value, decimals = 2, className = '' }: AnimatedCounterProps) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const spring = useSpring(numValue, { stiffness: 75, damping: 15 });
  const display = useTransform(spring, (latest) => isNaN(latest) ? '0.00' : latest.toFixed(decimals));

  const [current, setCurrent] = useState(numValue.toFixed(decimals));

  useEffect(() => {
    spring.set(numValue);
  }, [numValue, spring]);

  useEffect(() => {
    return display.on('change', (v) => setCurrent(v));
  }, [display]);

  if (typeof value === 'string' && isNaN(parseFloat(value))) {
    return <span className={className}>{value}</span>;
  }

  return (
    <motion.span className={`inline-block font-mono ${className}`}>
      {current}
    </motion.span>
  );
};
