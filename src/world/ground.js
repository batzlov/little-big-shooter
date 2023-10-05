import * as THREE from "three";

import Experience from "../core/experience.js";

import colors from "../constants/colors.js";

export default class Ground {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        this.initGeometry();
        this.initTexture();
        this.initMaterial();
        this.initMesh();
    }

    initGeometry() {
        this.geometry = new THREE.PlaneGeometry(80, 80);
    }

    initTexture() {}

    initMaterial() {
        this.material = new THREE.MeshBasicMaterial({
            color: colors.grassGreen,
            side: THREE.DoubleSide,
        });
    }

    initMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = -Math.PI * 0.5;
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);
    }
}
