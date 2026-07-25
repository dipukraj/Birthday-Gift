// JavaScript for Premium Maintenance Page

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // CANVAS PARTICLE SYSTEM
    // -----------------------------------------------------------------
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 45;

        // Resize Canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.baseOpacity = Math.random() * 0.5 + 0.2;
                this.opacity = this.baseOpacity;
                this.speedX = (Math.random() - 0.5) * 0.15;
                this.speedY = -Math.random() * 0.25 - 0.05; // Drift upwards slowly
                this.blinkSpeed = Math.random() * 0.015 + 0.005;
                this.blinkDir = Math.random() > 0.5 ? 1 : -1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Loop particles around boundaries
                if (this.y < 0) {
                    this.y = canvas.height;
                    this.x = Math.random() * canvas.width;
                }
                if (this.x < 0 || this.x > canvas.width) {
                    this.x = Math.random() * canvas.width;
                }

                // Breathing/twinkling effect
                this.opacity += this.blinkSpeed * this.blinkDir;
                if (this.opacity >= 0.8 || this.opacity <= 0.1) {
                    this.blinkDir *= -1;
                }
            }

            draw() {
                ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`; // Warm gold tint
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();

                // Occasional star shape cross overlay
                if (this.size > 2 && this.opacity > 0.5) {
                    ctx.strokeStyle = `rgba(255, 215, 0, ${this.opacity * 0.4})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(this.x - this.size * 2, this.y);
                    ctx.lineTo(this.x + this.size * 2, this.y);
                    ctx.moveTo(this.x, this.y - this.size * 2);
                    ctx.lineTo(this.x, this.y + this.size * 2);
                    ctx.stroke();
                }
            }
        }

        // Initialize particles
        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        // Animation Loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // -----------------------------------------------------------------
    // "SEND LOVE" INTERACTIVE BURST EFFECT
    // -----------------------------------------------------------------
    const heartBtn = document.getElementById('heart-btn');
    const hearts = ['💖', '❤️', '💝', '🌸', '✨', '💕', '⭐'];

    if (heartBtn) {
        heartBtn.addEventListener('click', (e) => {
            // Create burst particles
            const count = 18;
            for (let i = 0; i < count; i++) {
                createHeart(e.clientX, e.clientY);
            }

            // Animate button scale trigger
            heartBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                heartBtn.style.transform = '';
            }, 100);
        });
    }

    function createHeart(clientX, clientY) {
        const heartEl = document.createElement('div');
        heartEl.className = 'flying-heart';
        
        // Randomize visual character
        heartEl.innerText = hearts[Math.floor(Math.random() * hearts.length)];
        
        // Set initial coordinates relative to click
        heartEl.style.left = `${clientX}px`;
        heartEl.style.top = `${clientY}px`;

        // Calculate random dispersal coordinates using CSS custom properties
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 120 + 60;
        const xDir = Math.cos(angle) * distance;
        const yDir = Math.sin(angle) * distance - 80; // offset upward direction
        const rotation = Math.random() * 360 - 180;
        const scale = Math.random() * 0.8 + 0.8;

        heartEl.style.setProperty('--x-dir', `${xDir}px`);
        heartEl.style.setProperty('--y-dir', `${yDir}px`);
        heartEl.style.setProperty('--rot-val', `${rotation}deg`);
        heartEl.style.setProperty('--scale-val', scale);

        document.body.appendChild(heartEl);

        // Remove element after animation ends
        setTimeout(() => {
            heartEl.remove();
        }, 1200);
    }

    // -----------------------------------------------------------------
    // SECRET BYPASS ROUTE
    // -----------------------------------------------------------------
    const secretBtn = document.getElementById('secret-door');
    if (secretBtn) {
        secretBtn.addEventListener('click', () => {
            // Smoothly transition or redirect to birthday gift page
            window.location.href = 'birthday.html';
        });
    }

    // Keyboard shortcut (Shift + B) to access birthday directly
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && (e.key === 'B' || e.key === 'b')) {
            window.location.href = 'birthday.html';
        }
    });
});
