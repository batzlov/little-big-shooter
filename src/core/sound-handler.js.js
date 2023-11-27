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
        if (this.experience.isPaused) {
            return;
        }

        this.sound.stop();
        this.sound.setBuffer(sound);
        this.sound.setLoop(false);
        this.sound.setVolume(0.5);
        this.sound.play();
    }

    playShootSound() {
        this.play(this.ressources.items.singleShotSound);
    }

    playBurstSound() {
        this.play(this.ressources.items.burstSound);
    }

    playReloadSound() {
        this.play(this.ressources.items.reloadSound);
    }

    playEmptySound() {
        this.play(this.ressources.items.emptySound);
    }

    playHurtSound() {
        this.play(this.ressources.items.hurtSound);
    }

    stop() {
        setTimeout(() => {
            this.sound.stop();
        }, 100);
    }

    currentlyPlaying() {
        if (
            this.sound.buffer === this.ressources.items.singleShotSound &&
            this.sound.isPlaying
        ) {
            return "singleShotSound";
        }

        if (
            this.sound.buffer === this.ressources.items.burstSound &&
            this.sound.isPlaying
        ) {
            return "burstSound";
        }

        if (
            this.sound.buffer === this.ressources.items.reloadSound &&
            this.sound.isPlaying
        ) {
            return "reloadSound";
        }

        if (
            this.sound.buffer === this.ressources.items.emptySound &&
            this.sound.isPlaying
        ) {
            return "emptySound";
        }

        if (
            this.sound.buffer === this.ressources.items.hurtSound &&
            this.sound.isPlaying
        ) {
            return "hurtSound";
        }

        return null;
    }
}
