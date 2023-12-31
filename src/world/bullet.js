import * as THREE from "three";
import * as CANNON from "cannon-es";

import Experience from "../core/experience";

export default class Bullet {
    constructor(position = { x: 0, y: 0, z: 0 }, shotByEnemy = false) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.bulletModel;
        this.position = position;
        this.physicsWorld = this.experience.physicsWorld;
        this.shotAt = new Date();
        this.shotByEnemy = shotByEnemy;
        this.destroyed = false;
        this.destroyBulletAfter = 3000; // ms

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

        const scale = 0.001;
        this.model.scale.set(scale, scale, scale);

        this.scene.add(this.model);
    }

    initPhysics() {
        this.body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Sphere(0.05),
            linearDamping: 0.01,
            angularDamping: 0.01,
        });
        this.body.isBullet = true;
        this.body.shotByEnemy = this.shotByEnemy;

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
    }

    update() {
        this.model.position.copy(this.body.position);

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
