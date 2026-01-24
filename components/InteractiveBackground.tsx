import React, { useEffect, useRef } from 'react';

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8', '#33FFF5'];

const InteractiveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let mouse = { x: -1000, y: -1000 };

        class Ball {
            x: number;
            y: number;
            originX: number;
            originY: number;
            radius: number;
            color: string;
            angle: number;
            velocity: number;
            density: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.originX = x;
                this.originY = y;
                // Random size between 4 and 10
                this.radius = Math.random() * 6 + 4; 
                this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.angle = Math.random() * Math.PI * 2;
                // Speed of the wave
                this.velocity = Math.random() * 0.02 + 0.01;
                // How much the mouse affects it
                this.density = Math.random() * 30 + 10;
            }

            draw() {
                if(!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Wavy motion (sine wave on Y axis)
                this.angle += this.velocity;
                const waveY = Math.sin(this.angle) * 15; // Amplitude of 15px
                
                // Mouse Interaction Physics
                let dx = mouse.x - this.x;
                let dy = mouse.y - (this.y - waveY); // Interaction relative to current wave position
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                // Repulsion Radius
                const maxDistance = 150;
                
                if (distance < maxDistance) {
                    // Calculate repulsion force
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;

                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Spring back to original position (with wave offset)
                    // X axis return
                    if (this.x !== this.originX) {
                        let dx = this.x - this.originX;
                        this.x -= dx * 0.05; // Ease factor
                    }
                    
                    // Y axis return (origin + wave)
                    let targetY = this.originY + waveY;
                    let dy = this.y - targetY;
                    this.y -= dy * 0.05; // Ease factor
                }
            }
        }

        const balls: Ball[] = [];
        const init = () => {
            balls.length = 0;
            // Calculate number of balls based on screen size (prevent overcrowding)
            const numberOfBalls = (width * height) / 20000; 
            
            for (let i = 0; i < numberOfBalls; i++) {
                let x = Math.random() * width;
                let y = Math.random() * height;
                balls.push(new Ball(x, y));
            }
        };

        const animate = () => {
            if(!ctx) return;
            ctx.clearRect(0, 0, width, height);
            
            // Re-drawing logic
            balls.forEach(ball => {
                ball.draw();
                ball.update();
            });
            
            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        // Listeners
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        // Start
        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 z-0 pointer-events-none opacity-60" 
            style={{ mixBlendMode: 'multiply' }}
        />
    );
};

export default InteractiveBackground;