import * as THREE from "three";
import Experience from "../core/experience.js";

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.debug = this.experience.debug;

        this.initSunLight();
        this.initAmbientLight();
    }

    initSunLight() {
        this.sunLight = new THREE.DirectionalLight("#ffffff", 10);
        this.sunLight.shadow.camera.far = 15;
        this.sunLight.shadow.mapSize.set(1024, 1024);
        this.sunLight.shadow.normalBias = 0.05;
        this.sunLight.position.set(0, 10, 2);
        this.scene.add(this.sunLight);
    }

    initAmbientLight() {
        this.ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(this.ambientLight);
    }

    setEnvironmentMap() {}
}
