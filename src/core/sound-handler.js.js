import * as THREE from "three";

import Experience from "./experience";

export default class SoundHandler {
    constructor() {
        this.listener = new THREE.AudioListener();
        this.sound = new THREE.Audio(this.listener);

        this.experience = new Experience();
        this.ressources = this.experience.resources;
    }

    play(sound) {
        this.sound.stop();
        this.sound.setBuffer(sound);
        this.sound.setLoop(false);
        this.sound.setVolume(0.5);
        this.sound.play();
    }

    playShootSound() {
        this.sound.stop();
        this.sound.setBuffer(this.ressources.items.singleShotSound);
        this.sound.setLoop(false);
        this.sound.setVolume(0.5);
        this.sound.play();
    }

    playBurstSound() {
        this.sound.stop();
        this.sound.setBuffer(this.ressources.items.burstSound);
        this.sound.setLoop(true);
        this.sound.setVolume(0.5);
        this.sound.play();
    }

    stop() {
        setTimeout(() => {
            this.sound.stop();
        }, 100);
    }

    currentlyPlaying() {
        if (this.sound.buffer === this.ressources.items.singleShotSound) {
            return "singleShotSound";
        }

        if (this.sound.buffer === this.ressources.items.burstSound) {
            return "burstSound";
        }

        return null;
    }
}
