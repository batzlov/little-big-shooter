import * as THREE from "three";
import * as CANNON from "cannon-es";

import Experience from "../core/experience";

export default class Bullet {
    constructor(position = { x: 0, y: 0, z: 0 }) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.bulletModel;
        this.position = position;
        this.physicsWorld = this.experience.physicsWorld;
        this.shotAt = new Date();
        this.destroyed = false;
        this.destroyBulletAfter = 4000; // ms

        this.initModel();
        this.initPhysics();
    }

    initModel() {
        // clone model
        this.model = this.resource.scene.clone();
        this.model.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        this.model.rotation.y += Math.PI;
        this.model.scale.set(0.05, 0.05, 0.05);
        this.scene.add(this.model);
    }

    initPhysics() {
        this.body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Sphere(0.05),
            linearDamping: 0.01,
            angularDamping: 0.01,
        });

        this.physicsWorld.instance.addBody(this.body);
    }

    setPosition(position) {
        this.body.position.copy(position);
        this.model.position.copy(position);
    }

    updatePosition(position) {
        this.body.position.copy(position);
        this.model.position.copy(position);
    }

    updateRotation(rotation) {
        this.model.rotation.x += rotation.x;
        this.model.rotation.y += rotation.y;
        this.model.rotation.y += 0.5 * Math.PI;
    }

    update() {
        this.model.position.copy(this.body.position);
        this.model.quaternion.copy(this.body.quaternion);

        if (new Date() - this.shotAt > this.destroyBulletAfter) {
            this.destroy();
        }
    }

    destroy() {
        this.destroyed = true;
        this.scene.remove(this.model);
        this.physicsWorld.instance.removeBody(this.body);
    }
}
