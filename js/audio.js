/**
 * Clash of Dots - Audio Engine
 * Hybrid Web Audio API procedural synthesizer + Local Audio File fallback.
 * Zero-latency immediate feedback for clicks, drops, powerups, and ambient music.
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        this.isMuted = false;
        this.isMusicPlaying = false;
        this.musicNode = null;
        this.musicInterval = null;

        // Fallback HTML5 audio elements
        this.audioElements = {
            turn: document.getElementById('turn-sound'),
            winning: document.getElementById('winning-sound'),
            losing: document.getElementById('losing-sound'),
            draw: document.getElementById('draw-sound')
        };

        this.initContext = this.initContext.bind(this);
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    setSFXVolume(val) {
        this.sfxVolume = Math.max(0, Math.min(1, val));
    }

    setMusicVolume(val) {
        this.musicVolume = Math.max(0, Math.min(1, val));
        if (this.musicGain) {
            this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.15, this.ctx ? this.ctx.currentTime : 0);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.15, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // --- PROCEDURAL SOUND EFFECTS (Zero Latency) ---

    // Hover button tick
    playHover() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

            gain.gain.setValueAtTime(this.sfxVolume * 0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {}
    }

    // Button Click
    playClick() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);

            gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.08);
        } catch (e) {}
    }

    // Disc Drop / Turn
    playDrop(player = 1) {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();

        // Play original turn.mp3 as rich layer if available
        if (this.audioElements.turn) {
            try {
                this.audioElements.turn.volume = this.sfxVolume;
                this.audioElements.turn.currentTime = 0;
                this.audioElements.turn.play().catch(() => {});
            } catch (e) {}
        }

        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const baseFreq = player === 1 ? 320 : 440;
            osc.frequency.setValueAtTime(baseFreq * 1.5, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.12);

            gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    // Power-up Bomb Explosion
    playExplosion() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            // Noise buffer
            const bufferSize = this.ctx.sampleRate * 0.3;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.linearRampToValueAtTime(80, now + 0.3);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            whiteNoise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            whiteNoise.start(now);
            whiteNoise.stop(now + 0.3);
        } catch (e) {}
    }

    // Power-up Laser / Beam
    playLaser() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);

            gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.22);
        } catch (e) {}
    }

    // Freeze Spell
    playFreeze() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            [1200, 1600, 2100].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.04);
                gain.gain.setValueAtTime(this.sfxVolume * 0.15, now + i * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.15);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + i * 0.04);
                osc.stop(now + i * 0.04 + 0.15);
            });
        } catch (e) {}
    }

    // Coin / Reward Chime
    playCoin() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now); // B5
            osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

            gain.gain.setValueAtTime(this.sfxVolume * 0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    // Win Celebration Sound
    playWin() {
        if (this.audioElements.winning) {
            try {
                this.audioElements.winning.volume = this.isMuted ? 0 : this.sfxVolume;
                this.audioElements.winning.currentTime = 0;
                this.audioElements.winning.play().catch(() => {});
            } catch (e) {}
        }

        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            // Arpeggio fanfare: C5, E5, G5, C6
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                gain.gain.setValueAtTime(this.sfxVolume * 0.25, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.4);
            });
        } catch (e) {}
    }

    // Defeat / Loss Sound
    playLose() {
        if (this.audioElements.losing) {
            try {
                this.audioElements.losing.volume = this.isMuted ? 0 : this.sfxVolume;
                this.audioElements.losing.currentTime = 0;
                this.audioElements.losing.play().catch(() => {});
            } catch (e) {}
        }

        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const notes = [440, 415.3, 392, 349.2];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + idx * 0.15);
                gain.gain.setValueAtTime(this.sfxVolume * 0.2, now + idx * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.15);
                osc.stop(now + idx * 0.15 + 0.35);
            });
        } catch (e) {}
    }

    // Draw Sound
    playDraw() {
        if (this.audioElements.draw) {
            try {
                this.audioElements.draw.volume = this.isMuted ? 0 : this.sfxVolume;
                this.audioElements.draw.currentTime = 0;
                this.audioElements.draw.play().catch(() => {});
            } catch (e) {}
        }
    }

    // Invalid / Error Buzz
    playError() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(140, now);
            gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {}
    }

    // Level Up Fanfare
    playLevelUp() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const notes = [440, 554.37, 659.25, 880, 1108.73];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(this.sfxVolume * 0.25, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.3);
            });
        } catch (e) {}
    }

    // --- PROCEDURAL AMBIENT SYNTH MUSIC ---
    startAmbientMusic() {
        if (this.isMusicPlaying) return;
        this.initContext();
        if (!this.ctx) return;

        this.isMusicPlaying = true;
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.15, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);

        // Synth chord progression: Am7 -> Fmaj7 -> Cmaj7 -> Gsus4
        const chordProgressions = [
            [220, 261.63, 329.63, 392],    // Am7
            [174.61, 220, 261.63, 329.63], // Fmaj7
            [261.63, 329.63, 392, 493.88], // Cmaj7
            [196, 246.94, 293.66, 392]     // G
        ];

        let chordIdx = 0;
        let noteStep = 0;

        const playNextArp = () => {
            if (!this.isMusicPlaying || !this.ctx) return;
            try {
                const chord = chordProgressions[chordIdx];
                const freq = chord[noteStep % chord.length];
                const now = this.ctx.currentTime;

                const osc = this.ctx.createOscillator();
                const noteGain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                noteGain.gain.setValueAtTime(0.001, now);
                noteGain.gain.linearRampToValueAtTime(1, now + 0.1);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

                osc.connect(noteGain);
                noteGain.connect(this.musicGain);

                osc.start(now);
                osc.stop(now + 0.5);

                noteStep++;
                if (noteStep >= 8) {
                    noteStep = 0;
                    chordIdx = (chordIdx + 1) % chordProgressions.length;
                }
            } catch (e) {}
        };

        this.musicInterval = setInterval(playNextArp, 480);
    }

    stopAmbientMusic() {
        this.isMusicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

// Global instance
window.audioEngine = new AudioEngine();
