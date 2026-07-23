// JS Functionality for Happy Birthday Prerana Pritam Website

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // DOM ELEMENTS
    // -----------------------------------------------------------------
    const splashScreen = document.getElementById('splash-screen');
    const unlockBtn = document.getElementById('unlock-btn');
    const mainContent = document.getElementById('main-content');
    const musicToggle = document.getElementById('music-toggle');

    const candle1 = document.getElementById('candle-1');
    const candle2 = document.getElementById('candle-2');
    const candle3 = document.getElementById('candle-3');
    const cakeHint = document.getElementById('cake-instruction');

    const envelope = document.getElementById('envelope');

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    const giftBoxes = [
        document.getElementById('gift-box-1'),
        document.getElementById('gift-box-2'),
        document.getElementById('gift-box-3')
    ];

    // -----------------------------------------------------------------
    // STATE VARIABLES
    // -----------------------------------------------------------------
    let isUnlocked = false;
    let audioUnlocked = false;
    let isMusicPlaying = false;
    let blownCandles = { 1: false, 2: false, 3: false };

    // -----------------------------------------------------------------
    // MUSIC BOX SYNTHESIZER (Web Audio API)
    // -----------------------------------------------------------------
    let audioCtx = null;
    let melodyTimerId = null;
    let nextNoteTime = 0.0;
    let noteIndex = 0;
    const tempoBPM = 110;
    const secondsPerBeat = 60.0 / tempoBPM;

    // Frequencies of notes in standard pitch (Hz)
    const notesFreq = {
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
        'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
        'A5': 880.00, 'rest': 0
    };

    // Happy Birthday Melody (Celesta / Music Box style notes)
    // format: [note, duration_in_beats]
    const melody = [
        ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['C5', 1.0], ['B4', 2.0],
        ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['D5', 1.0], ['C5', 2.0],
        ['G4', 0.75], ['G4', 0.25], ['G5', 1.0], ['E5', 1.0], ['C5', 1.0], ['B4', 1.0], ['A4', 2.0],
        ['F5', 0.75], ['F5', 0.25], ['E5', 1.0], ['C5', 1.0], ['D5', 1.0], ['C5', 2.0],
        ['rest', 2.0] // Silence between loops
    ];

    function initAudio() {
        if (audioCtx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        audioUnlocked = true;
    }

    function playCelestaNote(frequency, startTime, duration) {
        if (frequency === 0) return; // Rest note

        // Create oscillator for main chime (triangle wave)
        const osc1 = audioCtx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(frequency, startTime);

        // Create helper oscillator for brighter bell tone (sine wave 1 octave up)
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(frequency * 2, startTime);

        // Lowpass filter to smooth out highs and simulate wood/metal bell body
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, startTime);

        // Volume gain node for envelope
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.001, startTime);
        // Instant attack to simulate mallet strike
        gainNode.gain.exponentialRampToValueAtTime(0.35, startTime + 0.03);
        // Sweet bell decay decay
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.95);

        // Connect nodes
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Start and stop oscs
        osc1.start(startTime);
        osc1.stop(startTime + duration);
        osc2.start(startTime);
        osc2.stop(startTime + duration);
    }

    function scheduler() {
        // While there are notes to play before the next interval check
        while (nextNoteTime < audioCtx.currentTime + 0.1) {
            const currentNote = melody[noteIndex];
            const noteName = currentNote[0];
            const noteBeats = currentNote[1];
            const duration = noteBeats * secondsPerBeat;

            if (isMusicPlaying) {
                playCelestaNote(notesFreq[noteName], nextNoteTime, duration);
            }

            nextNoteTime += duration;
            noteIndex = (noteIndex + 1) % melody.length;
        }
        melodyTimerId = setTimeout(scheduler, 50);
    }

    function startMusic() {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        isMusicPlaying = true;
        noteIndex = 0;
        nextNoteTime = audioCtx.currentTime + 0.1;
        scheduler();
        musicToggle.classList.add('playing');
    }

    function stopMusic() {
        isMusicPlaying = false;
        if (melodyTimerId) {
            clearTimeout(melodyTimerId);
            melodyTimerId = null;
        }
        musicToggle.classList.remove('playing');
    }

    function toggleMusic() {
        if (isMusicPlaying) {
            stopMusic();
        } else {
            startMusic();
        }
    }

    // Celebratory synthetic sound effect (cheers arpeggio)
    function playCelebrationChime() {
        if (!audioUnlocked) return;
        const now = audioCtx.currentTime;
        const scale = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        scale.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.6);
        });
    }

    // Extinguish sound effect (pshh)
    function playBlowSound() {
        if (!audioUnlocked) return;
        const bufferSize = audioCtx.sampleRate * 0.3; // 0.3 seconds noise
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1.5;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start();
    }

    // -----------------------------------------------------------------
    // GLITTER PARTICLES CANVAS TRAIL
    // -----------------------------------------------------------------
    const glitterCanvas = document.getElementById('glitter-canvas');
    const glitterCtx = glitterCanvas.getContext('2d');
    let sparkles = [];

    function resizeGlitterCanvas() {
        glitterCanvas.width = window.innerWidth;
        glitterCanvas.height = window.innerHeight;
    }
    resizeGlitterCanvas();
    window.addEventListener('resize', resizeGlitterCanvas);

    class Sparkle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 4 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * -1.5 - 0.5;
            this.opacity = 1;
            this.fadeSpeed = Math.random() * 0.015 + 0.01;
            // Palette matches the rose gold / gold theme
            const colors = ['#ffd700', '#ff477e', '#d4af37', '#e2c15c', '#c8963e', '#ffffff'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= this.fadeSpeed;
            if (this.size > 0.2) this.size -= 0.05;
        }

        draw() {
            glitterCtx.save();
            glitterCtx.globalAlpha = this.opacity;
            glitterCtx.fillStyle = this.color;
            glitterCtx.shadowBlur = 8;
            glitterCtx.shadowColor = this.color;

            // Draw star shape
            glitterCtx.beginPath();
            glitterCtx.moveTo(this.x, this.y - this.size);
            glitterCtx.lineTo(this.x + this.size * 0.3, this.y - this.size * 0.3);
            glitterCtx.lineTo(this.x + this.size, this.y);
            glitterCtx.lineTo(this.x + this.size * 0.3, this.y + this.size * 0.3);
            glitterCtx.lineTo(this.x, this.y + this.size);
            glitterCtx.lineTo(this.x - this.size * 0.3, this.y + this.size * 0.3);
            glitterCtx.lineTo(this.x - this.size, this.y);
            glitterCtx.lineTo(this.x - this.size * 0.3, this.y - this.size * 0.3);
            glitterCtx.closePath();

            glitterCtx.fill();
            glitterCtx.restore();
        }
    }

    function handlePointerMove(e) {
        if (!isUnlocked) return;
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        if (x !== undefined && y !== undefined) {
            for (let i = 0; i < 3; i++) {
                sparkles.push(new Sparkle(x, y));
            }
        }
    }

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    // Dynamic drifting background stars
    function spawnBackgroundSparkle() {
        if (!isUnlocked) return;
        const x = Math.random() * glitterCanvas.width;
        const y = Math.random() * glitterCanvas.height;
        sparkles.push(new Sparkle(x, y));
    }
    setInterval(spawnBackgroundSparkle, 180);

    function animateGlitter() {
        glitterCtx.clearRect(0, 0, glitterCanvas.width, glitterCanvas.height);

        for (let i = 0; i < sparkles.length; i++) {
            sparkles[i].update();
            sparkles[i].draw();

            if (sparkles[i].opacity <= 0) {
                sparkles.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(animateGlitter);
    }
    animateGlitter();

    // -----------------------------------------------------------------
    // CONFETTI EXPLOSION CANVAS
    // -----------------------------------------------------------------
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    let confettiArray = [];

    function resizeConfettiCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);

    class Confetti {
        constructor(x, y, isVelocitySpout = false) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 6;
            this.color = ['#f72585', '#b5179e', '#7209b7', '#4cc9f0', '#ffd700', '#ff477e'][Math.floor(Math.random() * 6)];
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 6 - 3;

            if (isVelocitySpout) {
                // Spout up (like an explosion source)
                this.speedX = Math.random() * 10 - 5;
                this.speedY = Math.random() * -12 - 5;
            } else {
                // Natural sky float
                this.speedX = Math.random() * 4 - 2;
                this.speedY = Math.random() * 5 + 2;
            }

            this.gravity = 0.22;
            this.opacity = 1;
        }

        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            if (this.y > confettiCanvas.height) {
                this.opacity = 0; // mark for removal
            }
        }

        draw() {
            confettiCtx.save();
            confettiCtx.translate(this.x, this.y);
            confettiCtx.rotate(this.rotation * Math.PI / 180);
            confettiCtx.fillStyle = this.color;
            confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            confettiCtx.restore();
        }
    }

    function triggerConfettiBurst(x, y, count = 60, isSpout = true) {
        for (let i = 0; i < count; i++) {
            confettiArray.push(new Confetti(x, y, isSpout));
        }
    }

    function animateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        for (let i = 0; i < confettiArray.length; i++) {
            confettiArray[i].update();
            confettiArray[i].draw();

            if (confettiArray[i].opacity <= 0) {
                confettiArray.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(animateConfetti);
    }
    animateConfetti();

    // -----------------------------------------------------------------
    // COUNTDOWN CALCULATOR
    // -----------------------------------------------------------------
    // Prerana's birthday is 21st July. Let's calculate the countdown for July 21, 2026.
    // Her birth year is 2003, turning 23.
    const birthdayStart = new Date('July 21, 2026 00:00:00').getTime();
    const birthdayEnd = new Date('July 22, 2026 00:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();

        // 1. On the Birthday (July 21, 2026)
        if (now >= birthdayStart && now < birthdayEnd) {
            document.querySelector('.countdown-title').innerHTML = "✨ Today is the Day! ✨";
            document.querySelector('.timer').innerHTML = `
                <div class="birthday-text-glow">
                    HAPPY 23rd BIRTHDAY PRERANA PRITAM! 🎉🍰
                </div>
            `;
            // Trigger slow ambient confetti falling from top
            if (Math.random() < 0.05) {
                triggerConfettiBurst(Math.random() * window.innerWidth, -10, 5, false);
            }
            return;
        }
        
        // 2. After the Birthday (July 22, 2026 onwards)
        if (now >= birthdayEnd) {
            document.querySelector('.countdown-title').innerHTML = "✨ Hope You Had a Wonderful Birthday! ✨";
            document.querySelector('.timer').innerHTML = `
                <div class="birthday-text-glow belated">
                    BELATED HAPPY 23rd BIRTHDAY PRERANA PRITAM! 💖🎉
                </div>
            `;
            // Trigger slow ambient confetti falling from top occasionally
            if (Math.random() < 0.03) {
                triggerConfettiBurst(Math.random() * window.innerWidth, -10, 3, false);
            }
            return;
        }

        // 3. Before the Birthday (Show Countdown)
        const difference = birthdayStart - now;
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.innerText = String(days).padStart(2, '0');
        hoursEl.innerText = String(hours).padStart(2, '0');
        minutesEl.innerText = String(minutes).padStart(2, '0');
        secondsEl.innerText = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // -----------------------------------------------------------------
    // SPLASH UNLOCK
    // -----------------------------------------------------------------
    unlockBtn.addEventListener('click', () => {
        isUnlocked = true;
        splashScreen.classList.add('fade-out');
        mainContent.classList.remove('blurred');
        musicToggle.classList.remove('hidden');

        // Start background music loop
        startMusic();

        // Initial celebration burst
        setTimeout(() => {
            triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.4, 80);
            playCelebrationChime();
            spawnBalloons(8);
        }, 800);
    });

    // Floating music button controls
    musicToggle.addEventListener('click', toggleMusic);

    // -----------------------------------------------------------------
    // CAKE CANDLES BLOWING
    // -----------------------------------------------------------------
    function extinguishCandle(candleId, candleEl) {
        if (!isUnlocked || blownCandles[candleId]) return;

        blownCandles[candleId] = true;
        candleEl.classList.add('extinguished');
        playBlowSound();

        // Sparkle blast on extinguished candle
        const rect = candleEl.getBoundingClientRect();
        triggerConfettiBurst(rect.left + rect.width / 2, rect.top, 15, true);

        // Check if all candles blown out
        if (blownCandles[1] && blownCandles[2] && blownCandles[3]) {
            cakeHint.innerHTML = "✨ Your wishes are off to the stars! ✨";
            cakeHint.style.color = "#ffd700";
            cakeHint.style.animation = "pulseGlow 1.5s ease-in-out infinite alternate";

            setTimeout(() => {
                triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
                playCelebrationChime();
                triggerFireworks();
                spawnBalloons(15);
            }, 500);
        }
    }

    candle1.addEventListener('click', () => extinguishCandle(1, candle1));
    candle2.addEventListener('click', () => extinguishCandle(2, candle2));
    candle3.addEventListener('click', () => extinguishCandle(3, candle3));

    // -----------------------------------------------------------------
    // ENVELOPE INTERACTION
    // -----------------------------------------------------------------
    envelope.addEventListener('click', (e) => {
        if (!isUnlocked) return;

        // Prevent trigger if letter text is clicked inside (scrolling)
        if (e.target.closest('.letter-text')) return;

        const isOpening = !envelope.classList.contains('open');
        envelope.classList.toggle('open');

        if (isOpening) {
            playCelebrationChime();
            const rect = envelope.getBoundingClientRect();
            // Confetti burst from envelope top
            setTimeout(() => {
                triggerConfettiBurst(rect.left + rect.width / 2, rect.top - 20, 40);
                startTypewriterLetter();
            }, 400);
        }
    });

    // -----------------------------------------------------------------
    // GIFT ITEMS GAME
    // -----------------------------------------------------------------
    giftBoxes.forEach(giftItem => {
        giftItem.addEventListener('click', () => {
            if (!isUnlocked) return;
            if (giftItem.classList.contains('open')) return;

            giftItem.classList.add('open');
            playCelebrationChime();

            const box = giftItem.querySelector('.gift-box');
            const rect = box.getBoundingClientRect();
            triggerConfettiBurst(rect.left + rect.width / 2, rect.top, 25, true);

            // Show hidden content text
            const revealText = giftItem.querySelector('.gift-message-reveal');
            revealText.classList.remove('hidden');
        });
    });

    // -----------------------------------------------------------------
    // FIREWORKS CANVAS ENGINE
    // -----------------------------------------------------------------
    const fireworksCanvas = document.getElementById('fireworks-canvas');
    const fireworksCtx = fireworksCanvas.getContext('2d');
    let fireworksRockets = [];
    let fireworksParticles = [];

    function resizeFireworksCanvas() {
        if (!fireworksCanvas) return;
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }
    resizeFireworksCanvas();
    window.addEventListener('resize', resizeFireworksCanvas);

    class FireworkRocket {
        constructor(startX, targetX, targetY) {
            this.x = startX;
            this.y = fireworksCanvas.height;
            this.targetX = targetX;
            this.targetY = targetY;
            this.speed = Math.random() * 3 + 8;
            this.angle = Math.atan2(targetY - this.y, targetX - startX);
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.color = ['#ff477e', '#ffd700', '#7209b7', '#4cc9f0', '#ff0055', '#2ecc71'][Math.floor(Math.random() * 6)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            const dist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
            if (dist < 15 || this.y <= this.targetY) {
                // Explode!
                explodeFirework(this.x, this.y, this.color);
                return false;
            }
            return true;
        }

        draw() {
            fireworksCtx.save();
            fireworksCtx.fillStyle = this.color;
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            fireworksCtx.fill();
            fireworksCtx.restore();
        }
    }

    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.08;
            this.friction = 0.96;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
        }

        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
            return this.alpha > 0;
        }

        draw() {
            fireworksCtx.save();
            fireworksCtx.globalAlpha = this.alpha;
            fireworksCtx.fillStyle = this.color;
            fireworksCtx.shadowBlur = 10;
            fireworksCtx.shadowColor = this.color;
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            fireworksCtx.fill();
            fireworksCtx.restore();
        }
    }

    function explodeFirework(x, y, color) {
        const particleCount = 40;
        for (let i = 0; i < particleCount; i++) {
            fireworksParticles.push(new FireworkParticle(x, y, color));
        }
        playCelebrationChime();
    }

    function triggerFireworks() {
        const count = 5;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const startX = Math.random() * (window.innerWidth * 0.6) + window.innerWidth * 0.2;
                const targetX = Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1;
                const targetY = Math.random() * (window.innerHeight * 0.4) + window.innerHeight * 0.1;
                fireworksRockets.push(new FireworkRocket(startX, targetX, targetY));
            }, i * 350);
        }
    }

    function animateFireworks() {
        fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        fireworksRockets = fireworksRockets.filter(r => {
            const alive = r.update();
            if (alive) r.draw();
            return alive;
        });

        fireworksParticles = fireworksParticles.filter(p => {
            const alive = p.update();
            if (alive) p.draw();
            return alive;
        });

        requestAnimationFrame(animateFireworks);
    }
    animateFireworks();

    // -----------------------------------------------------------------
    // FLOATING BALLOONS LAUNCHER
    // -----------------------------------------------------------------
    const balloonsContainer = document.getElementById('balloons-container');
    const balloonColors = ['#ff477e', '#ffd700', '#7209b7', '#4cc9f0', '#ff0055', '#2ecc71', '#ff9f43'];

    function spawnBalloons(count = 10) {
        if (!balloonsContainer) return;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const balloon = document.createElement('div');
                balloon.className = 'balloon';
                const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
                balloon.style.background = `radial-gradient(circle at 30% 30%, #fff, ${color} 60%, #300)`;
                balloon.style.left = `${Math.random() * 90 + 5}vw`;
                balloon.style.animationDuration = `${Math.random() * 4 + 6}s`;
                balloon.style.animationDelay = `${Math.random() * 2}s`;
                balloonsContainer.appendChild(balloon);

                // Remove balloon after float animation ends
                setTimeout(() => {
                    balloon.remove();
                }, 11000);
            }, i * 400);
        }
    }

    // -----------------------------------------------------------------
    // TYPEWRITER LETTER ANIMATION
    // -----------------------------------------------------------------
    const letterTextContainer = document.querySelector('.letter-text');
    let hasTypedLetter = false;

    function startTypewriterLetter() {
        if (hasTypedLetter || !letterTextContainer) return;
        hasTypedLetter = true;

        const originalHTML = letterTextContainer.innerHTML;
        // Collect text content while keeping paragraph breaks
        const paragraphs = Array.from(letterTextContainer.querySelectorAll('h3, p'));
        const textElementsData = paragraphs.map(el => ({
            tag: el.tagName.toLowerCase(),
            className: el.className,
            text: el.innerText
        }));

        letterTextContainer.innerHTML = '';

        let currentElIdx = 0;

        function typeNextElement() {
            if (currentElIdx >= textElementsData.length) return;

            const item = textElementsData[currentElIdx];
            const el = document.createElement(item.tag);
            if (item.className) el.className = item.className;
            letterTextContainer.appendChild(el);

            let charIdx = 0;
            const text = item.text;

            const cursor = document.createElement('span');
            cursor.className = 'typewriter-cursor';
            el.appendChild(cursor);

            const timer = setInterval(() => {
                if (charIdx < text.length) {
                    cursor.before(text.charAt(charIdx));
                    charIdx++;
                } else {
                    clearInterval(timer);
                    cursor.remove();
                    currentElIdx++;
                    setTimeout(typeNextElement, 300);
                }
            }, 30);
        }

        typeNextElement();
    }

    // -----------------------------------------------------------------
    // POLAROID 3D PARALLAX TILT & LIGHTBOX MODAL
    // -----------------------------------------------------------------
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    polaroidCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 12;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });

        // Lightbox open
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            const caption = card.querySelector('.polaroid-caption');

            if (img && lightboxModal) {
                lightboxImg.src = img.src;
                lightboxCaption.innerText = caption ? caption.innerText : '';
                lightboxModal.classList.remove('hidden');
                playCelebrationChime();
            }
        });
    });

    if (lightboxClose && lightboxModal) {
        lightboxClose.addEventListener('click', () => {
            lightboxModal.classList.add('hidden');
        });

        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                lightboxModal.classList.add('hidden');
            }
        });
    }

    // -----------------------------------------------------------------
    // REASONS WHY YOU ARE SPECIAL CARDS
    // -----------------------------------------------------------------
    const reasonCards = document.querySelectorAll('.reason-card');

    reasonCards.forEach(card => {
        card.addEventListener('click', () => {
            const isFlipped = card.classList.contains('flipped');
            card.classList.toggle('flipped');

            if (!isFlipped) {
                playCelebrationChime();
                const rect = card.getBoundingClientRect();
                triggerConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12, true);
            }
        });
    });

    // -----------------------------------------------------------------
    // BIRTHDAY TRIVIA QUIZ
    // -----------------------------------------------------------------
    const quizData = [
        {
            question: "1. When is Prerana Pritam's Special Birthday? 📅",
            options: ["July 21st", "August 15th", "June 10th", "December 25th"],
            correct: 0
        },
        {
            question: "2. What best describes Prerana's vibe? ✨",
            options: ["Pure Joy & Positive Energy", "Always Sleepy", "Grumpy", "Quiet & Shy"],
            correct: 0
        },
        {
            question: "3. What is the ultimate Birthday Wish for her 23rd year? 🎁",
            options: ["Endless Smiles, Success & Happiness!", "Only 1 slice of cake", "A pet dragon", "No gifts"],
            correct: 0
        }
    ];

    let currentQuizIdx = 0;
    let quizScore = 0;

    const quizProgress = document.getElementById('quiz-progress');
    const quizScoreEl = document.getElementById('quiz-score');
    const quizQuestionText = document.getElementById('quiz-question-text');
    const quizOptionsGrid = document.getElementById('quiz-options');
    const quizQuestionBox = document.getElementById('quiz-question-box');
    const quizRewardBox = document.getElementById('quiz-reward');
    const retryQuizBtn = document.getElementById('retry-quiz-btn');

    function loadQuizQuestion() {
        if (!quizQuestionText || !quizOptionsGrid) return;

        const currentQ = quizData[currentQuizIdx];
        quizProgress.innerText = `Question ${currentQuizIdx + 1} of ${quizData.length}`;
        quizScoreEl.innerText = quizScore;
        quizQuestionText.innerText = currentQ.question;
        quizOptionsGrid.innerHTML = '';

        currentQ.options.forEach((optText, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.innerText = optText;
            btn.addEventListener('click', () => handleQuizAnswer(idx, btn));
            quizOptionsGrid.appendChild(btn);
        });
    }

    function handleQuizAnswer(selectedIdx, btnElement) {
        const currentQ = quizData[currentQuizIdx];
        const allBtns = quizOptionsGrid.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach(b => b.disabled = true);

        if (selectedIdx === currentQ.correct) {
            btnElement.classList.add('correct');
            quizScore++;
            quizScoreEl.innerText = quizScore;
            playCelebrationChime();
            const rect = btnElement.getBoundingClientRect();
            triggerConfettiBurst(rect.left + rect.width / 2, rect.top, 20, true);
        } else {
            btnElement.classList.add('wrong');
            // Highlight correct one
            allBtns[currentQ.correct].classList.add('correct');
        }

        setTimeout(() => {
            currentQuizIdx++;
            if (currentQuizIdx < quizData.length) {
                loadQuizQuestion();
            } else {
                showQuizReward();
            }
        }, 1200);
    }

    function showQuizReward() {
        quizQuestionBox.classList.add('hidden');
        quizRewardBox.classList.remove('hidden');

        document.getElementById('quiz-final-msg').innerText = `You scored ${quizScore}/${quizData.length}! Here is your Super Secret Birthday Blessing:`;

        triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 90);
        triggerFireworks();
        spawnBalloons(12);
        playCelebrationChime();
    }

    if (retryQuizBtn) {
        retryQuizBtn.addEventListener('click', () => {
            currentQuizIdx = 0;
            quizScore = 0;
            quizRewardBox.classList.add('hidden');
            quizQuestionBox.classList.remove('hidden');
            loadQuizQuestion();
        });
    }

    // Initialize Quiz
    loadQuizQuestion();
});

