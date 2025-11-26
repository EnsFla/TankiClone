// Audio class - Sound system
class Audio {
    constructor() {
        this.enabled = true;
        this.masterVolume = 0.5;
        this.sfxVolume = 0.7;
        this.sounds = {};
    }
    play(name) { if (this.enabled) console.log('Sound:', name); }
    stopAll() {}
    toggle() { this.enabled = !this.enabled; return this.enabled; }
}
window.Audio = Audio;