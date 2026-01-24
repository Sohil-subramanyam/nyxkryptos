import React, { useEffect, useRef, useState } from 'react';

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8', '#33FFF5'];

const CustomCursor: React.FC = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [trails, setTrails] = useState<{x: number, y: number, id: number, color: string}[]>([]);
    const requestRef = useRef<number>();
    
    useEffect(() => {
        let mouseX = 0;
        let mouseY = 0;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (cursorRef.current) {
                cursorRef.current.style.left = `${mouseX}px`;
                cursorRef.current.style.top = `${mouseY}px`;
            }
        };

        const updateTrails = () => {
            setTrails(prev => {
                const newTrail = { 
                    x: mouseX, 
                    y: mouseY, 
                    id: Date.now(),
                    color: COLORS[Math.floor(Math.random() * COLORS.length)]
                };
                // Keep trail somewhat long but performant
                return [...prev, newTrail].slice(-12); 
            });
            requestRef.current = requestAnimationFrame(updateTrails);
        };

        window.addEventListener('mousemove', onMouseMove);
        requestRef.current = requestAnimationFrame(updateTrails);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <>
            <div ref={cursorRef} className="custom-cursor" />
            {trails.map((t, i) => (
                <div 
                    key={t.id} 
                    className="cursor-trail"
                    style={{
                        left: t.x,
                        top: t.y,
                        backgroundColor: t.color,
                        opacity: (i + 1) / trails.length,
                        transform: `translate(-50%, -50%) scale(${(i + 1) / trails.length})`
                    }}
                />
            ))}
        </>
    );
};

export default CustomCursor;