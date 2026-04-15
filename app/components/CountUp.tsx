'use client';

import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
    end: number;
    duration?: number; // milliseconds
    className?: string;
    suffix?: string;
    prefix?: string;
}

export default function CountUp({ end, duration = 1000, className = '', suffix = '', prefix = '' }: CountUpProps) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const elementRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (hasAnimated) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setHasAnimated(true);

                    const startTime = Date.now();
                    const startValue = 0;
                    const endValue = end;

                    const updateCount = () => {
                        const now = Date.now();
                        const progress = Math.min((now - startTime) / duration, 1);

                        // Easing function (ease-out)
                        const easedProgress = 1 - Math.pow(1 - progress, 3);
                        const currentCount = Math.floor(startValue + (endValue - startValue) * easedProgress);

                        setCount(currentCount);

                        if (progress < 1) {
                            requestAnimationFrame(updateCount);
                        } else {
                            setCount(endValue);
                        }
                    };

                    requestAnimationFrame(updateCount);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return (
        <span ref={elementRef} className={className}>
            {prefix}{count}{suffix}
        </span>
    );
}
