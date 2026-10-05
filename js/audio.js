/**
 * Clash of Dots - 100% Procedural Studio Audio Engine
 * Pure Web Audio API synthesis - zero external audio files, zero latency,
 * realistic acoustic transients, rich multi-voice harmonies, and generative synthwave BGM.
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.45;
        this.isMuted = false;
        this.isMusicPlaying = false;
        this.musicGain = null;
        this.musicInterval = null;
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
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.12, this.ctx.currentTime);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.12, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // --- PROCEDURAL SOUND FX ---

    // Subtle Button Hover Tick
    playHover() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(1400, now + 0.03);

            gain.gain.setValueAtTime(this.sfxVolume * 0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.03);
        } catch (e) {}
    }

    // Tactile Button Click Pop
    playClick() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(240, now + 0.06);

            gain.gain.setValueAtTime(this.sfxVolume * 0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.06);
        } catch (e) {}
    }

    // Realistic Physical Disc Drop Impact (Resonant body + attack click)
    playDrop(player = 1) {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // Layer 1: Resonant Body Thud
            const osc = this.ctx.createOscillator();
            const bodyGain = this.ctx.createGain();
            const baseFreq = player === 1 ? 340 : 420;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq * 1.6, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.11);

            bodyGain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
            bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

            osc.connect(bodyGain);
            bodyGain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.11);

            // Layer 2: High-Frequency Acrylic/Wood Click Transient
            const clickOsc = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            clickOsc.type = 'triangle';
            clickOsc.frequency.setValueAtTime(1800, now);
            clickOsc.frequency.exponentialRampToValueAtTime(600, now + 0.025);

            clickGain.gain.setValueAtTime(this.sfxVolume * 0.18, now);
            clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

            clickOsc.connect(clickGain);
            clickGain.connect(this.ctx.destination);

            clickOsc.start(now);
            clickOsc.stop(now + 0.025);
        } catch (e) {}
    }

    // Power-up: Bomb Detonation (Sub-bass boom + filtered noise burst)
    playExplosion() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // Sub-bass thump
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(120, now);
            sub.frequency.exponentialRampToValueAtTime(35, now + 0.35);

            subGain.gain.setValueAtTime(this.sfxVolume * 0.55, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            sub.connect(subGain);
            subGain.connect(this.ctx.destination);
            sub.start(now);
            sub.stop(now + 0.35);

            // Noise blast
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(700, now);
            filter.frequency.linearRampToValueAtTime(60, now + 0.35);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(this.sfxVolume * 0.45, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            noise.start(now);
            noise.stop(now + 0.35);
        } catch (e) {}
    }

    // Power-up: Laser Beam Sweep
    playLaser() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1600, now);
            osc.frequency.exponentialRampToValueAtTime(160, now + 0.24);

            gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.24);
        } catch (e) {}
    }

    // Power-up: Freeze Spell (Crystalline chime cluster)
    playFreeze() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            [1318.5, 1760.0, 2093.0, 2637.0].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.03);
                gain.gain.setValueAtTime(this.sfxVolume * 0.16, now + idx * 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.22);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.03);
                osc.stop(now + idx * 0.03 + 0.22);
            });
        } catch (e) {}
    }

    // Coin & Treasury Chime (Crystal double tone B5 -> E6)
    playCoin() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now);
            osc.frequency.setValueAtTime(1318.51, now + 0.075);

            gain.gain.setValueAtTime(this.sfxVolume * 0.24, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.38);
        } catch (e) {}
    }

    // Victory Fanfare (4-Voice Harmonic Polyphony)
    playWin() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            chords.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                gain.gain.setValueAtTime(this.sfxVolume * 0.28, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.45);
            });
        } catch (e) {}
    }

    // Defeat / Loss Sound (Mellow Minor Descent)
    playLose() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const notes = [440.0, 415.3, 392.0, 329.6]; // A4, Ab4, G4, E4
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + idx * 0.13);
                gain.gain.setValueAtTime(this.sfxVolume * 0.16, now + idx * 0.13);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.13 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.13);
                osc.stop(now + idx * 0.13 + 0.35);
            });
        } catch (e) {}
    }

    // Draw / Stalemate Sound
    playDraw() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            [392.0, 440.0].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                gain.gain.setValueAtTime(this.sfxVolume * 0.2, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.3);
            });
        } catch (e) {}
    }

    // Error / Warning Buzz
    playError() {
        if (this.isMuted || this.sfxVolume <= 0) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            gain.gain.setValueAtTime(this.sfxVolume * 0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    // Level-Up Trumpet Fanfare
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
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                gain.gain.setValueAtTime(this.sfxVolume * 0.24, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.28);
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
        this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.12, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);

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
                noteGain.gain.linearRampToValueAtTime(1, now + 0.08);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

                osc.connect(noteGain);
                noteGain.connect(this.musicGain);

                osc.start(now);
                osc.stop(now + 0.45);

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

window.AudioEngine = AudioEngine;
window.audioEngine = new AudioEngine();
