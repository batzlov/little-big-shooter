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
        this.scene.add(this.model);
    }

    initPhysics() {
        const modelBox = new THREE.Box3().setFromObject(this.resource.scene);
        const modelBoxSize = modelBox.getSize(new THREE.Vector3());

        this.shape = new CANNON.Box(
            new CANNON.Vec3(
                modelBoxSize.x / 2,
                modelBoxSize.y / 2,
                modelBoxSize.z / 2
            )
        );
        this.body = new CANNON.Body({
            mass: 500,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y + 2.5,
                this.position.z
            ),
            shape: this.shape,
            linearDamping: 0.01,
            angularDamping: 0.01,
        });

        this.physicsWorld.instance.addBody(this.body);
    }

    update() {
        this.model.position.copy(this.body.position);
        this.model.quaternion.copy(this.body.quaternion);
    }
}
