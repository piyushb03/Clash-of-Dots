/**
 * Clash of Dots - Visual Effects Engine
 * Ambient background cyber-mesh particles, drop impact shockwaves,
 * sparks, victory confetti explosion, and power-up VFX (laser, bomb, freeze).
 */

class ParticleEngine {
    constructor() {
        this.bgCanvas = document.getElementById('bg-particles');
        this.fxCanvas = document.getElementById('fx-particles');
        this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
        this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext('2d') : null;

        this.bgParticles = [];
        this.fxParticles = [];
        this.maxBgParticles = 45;
        this.animId = null;

        this.initCanvases();
        window.addEventListener('resize', () => this.resizeCanvases());
    }

    initCanvases() {
        if (!this.bgCanvas || !this.fxCanvas) return;
        this.resizeCanvases();
        this.initBgParticles();
        this.startLoop();
    }

    resizeCanvases() {
        if (!this.bgCanvas || !this.fxCanvas) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        this.fxCanvas.width = this.width;
        this.fxCanvas.height = this.height;
    }

    initBgParticles() {
        this.bgParticles = [];
        for (let i = 0; i < this.maxBgParticles; i++) {
            this.bgParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(234, 179, 8, 0.3)'
            });
        }
    }

    startLoop() {
        const loop = () => {
            this.update();
            this.draw();
            this.animId = requestAnimationFrame(loop);
        };
        loop();
    }

    update() {
        // Update ambient background particles
        for (let p of this.bgParticles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;
        }

        // Update foreground FX particles
        for (let i = this.fxParticles.length - 1; i >= 0; i--) {
            const p = this.fxParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += (p.gravity || 0);
            p.alpha -= (p.decay || 0.02);
            if (p.rotation !== undefined) p.rotation += p.vRot || 0.05;

            if (p.alpha <= 0 || p.y > this.height + 50) {
                this.fxParticles.splice(i, 1);
            }
        }
    }

    draw() {
        // Draw background particles & constellation connections
        if (this.bgCtx) {
            this.bgCtx.clearRect(0, 0, this.width, this.height);
            for (let i = 0; i < this.bgParticles.length; i++) {
                const p = this.bgParticles[i];
                this.bgCtx.beginPath();
                this.bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.bgCtx.fillStyle = p.color;
                this.bgCtx.fill();

                // Draw subtle connecting lines
                for (let j = i + 1; j < this.bgParticles.length; j++) {
                    const p2 = this.bgParticles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        this.bgCtx.beginPath();
                        this.bgCtx.moveTo(p.x, p.y);
                        this.bgCtx.lineTo(p2.x, p2.y);
                        this.bgCtx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - dist / 110)})`;
                        this.bgCtx.lineWidth = 0.75;
                        this.bgCtx.stroke();
                    }
                }
            }
        }

        // Draw foreground FX particles
        if (this.fxCtx) {
            this.fxCtx.clearRect(0, 0, this.width, this.height);
            for (let p of this.fxParticles) {
                this.fxCtx.save();
                this.fxCtx.globalAlpha = Math.max(0, p.alpha);
                this.fxCtx.translate(p.x, p.y);

                if (p.type === 'confetti') {
                    this.fxCtx.rotate(p.rotation);
                    this.fxCtx.fillStyle = p.color;
                    this.fxCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                } else if (p.type === 'ring') {
                    this.fxCtx.beginPath();
                    this.fxCtx.arc(0, 0, p.radius, 0, Math.PI * 2);
                    this.fxCtx.strokeStyle = p.color;
                    this.fxCtx.lineWidth = p.lineWidth || 2;
                    this.fxCtx.stroke();
                    p.radius += p.expandRate || 2;
                } else {
                    // Standard glow spark
                    this.fxCtx.beginPath();
                    this.fxCtx.arc(0, 0, p.radius || 3, 0, Math.PI * 2);
                    this.fxCtx.fillStyle = p.color;
                    this.fxCtx.shadowColor = p.color;
                    this.fxCtx.shadowBlur = 8;
                    this.fxCtx.fill();
                }

                this.fxCtx.restore();
            }
        }
    }

    // Impact effect at DOM element coordinates
    triggerDropImpact(element, color = '#3b82f6') {
        if (!element || !this.fxCtx) return;
        const rect = element.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Shockwave ring
        this.fxParticles.push({
            type: 'ring',
            x: cx,
            y: cy,
            vx: 0,
            vy: 0,
            radius: 8,
            expandRate: 2.2,
            lineWidth: 2.5,
            color: color,
            alpha: 0.9,
            decay: 0.045
        });

        // Sparks
        for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.5 + 1.2;
            this.fxParticles.push({
                type: 'spark',
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.1,
                radius: Math.random() * 2.5 + 1.5,
                color: color,
                alpha: 1,
                decay: 0.03
            });
        }
    }

    // Victory confetti explosion
    triggerVictoryConfetti() {
        const colors = ['#3b82f6', '#facc15', '#10b981', '#ec4899', '#a855f7', '#06b6d4'];
        const cx = this.width / 2;
        const cy = this.height / 3;

        for (let i = 0; i < 110; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            this.fxParticles.push({
                type: 'confetti',
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                gravity: 0.18,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.15,
                size: Math.random() * 8 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.009
            });
        }
    }

    // Bomb explosion VFX
    triggerBombExplosion(element) {
        if (!element || !this.fxCtx) return;
        const rect = element.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        this.fxParticles.push({
            type: 'ring',
            x: cx,
            y: cy,
            vx: 0,
            vy: 0,
            radius: 12,
            expandRate: 5,
            lineWidth: 4,
            color: '#f97316',
            alpha: 1,
            decay: 0.04
        });

        const colors = ['#ef4444', '#f97316', '#facc15', '#ffffff'];
        for (let i = 0; i < 35; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.fxParticles.push({
                type: 'spark',
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.12,
                radius: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.025
            });
        }
    }

    // Screen Shake
    shakeScreen() {
        if (window.stateManager && !window.stateManager.settings.screenShake) return;
        const body = document.body;
        body.classList.add('screen-shake');
        setTimeout(() => body.classList.remove('screen-shake'), 320);
    }
}

window.particleEngine = new ParticleEngine();
