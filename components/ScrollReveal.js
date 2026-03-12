'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

export default function ScrollReveal({
  children,
  className = '',
  threshold = 0.18,
  rootMargin = '0px 0px -10% 0px',
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <Box
      ref={elementRef}
      className={className}
      data-visible={isVisible ? 'true' : 'false'}
      {...props}
    >
      {children}
    </Box>
  );
}
