import * as THREE from "three";
import * as CANNON from "cannon";

import Experience from "../core/experience.js";

import colors from "../constants/colors.js";

export default class Ground {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.world = this.experience.world;

        this.initGeometry();
        this.initTexture();
        this.initMaterial();
        this.initMesh();
        this.initPhysics();
    }

    initGeometry() {
        this.geometry = new THREE.PlaneGeometry(40 * 3.54, 40 * 3.54);
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

    initPhysics() {
        this.shape = new CANNON.Plane();
        this.body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, 0, 0),
            shape: this.shape,
        });

        this.body.quaternion.setFromAxisAngle(
            new CANNON.Vec3(-1, 0, 0),
            Math.PI * 0.5
        );

        this.world.physicsWorld.addBody(this.body);
    }
}
