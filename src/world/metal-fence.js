import * as THREE from "three";
import * as CANNON from "cannon-es";

import Experience from "../core/experience";

export default class MetalFence {
    constructor(position = { x: 0, y: 0, z: 0 }, rotation = null) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.physicsWorld = this.experience.physicsWorld;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.metalFenceModel;
        this.position = position;
        this.rotation = rotation;

        this.initModel();
        this.initPhysics();
    }

    initModel() {
        this.model = this.resource.scene.clone();
        this.model.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        if (this.rotation) {
            this.model.rotation.set(
                this.rotation.x,
                this.rotation.y,
                this.rotation.z
            );
        }
        this.scene.add(this.model);
    }

    initPhysics() {
        const modelBox = new THREE.Box3().setFromObject(this.resource.scene);
        const modelBoxSize = modelBox.getSize(new THREE.Vector3());

        this.shape = new CANNON.Box(
            new CANNON.Vec3(
                (modelBoxSize.x - 0.2) / 2,
                modelBoxSize.y / 2,
                modelBoxSize.z / 2
            )
        );
        this.body = new CANNON.Body({
            mass: 500,
            position: new CANNON.Vec3(
                this.position.x,
                // FIXME: this is a hack to fix the model's position
                this.position.y + modelBoxSize.y / 2,
                this.position.z
            ),
            shape: this.shape,
            linearDamping: 0.01,
            angularDamping: 0.01,
        });

        if (this.rotation) {
            this.body.quaternion.setFromAxisAngle(
                new CANNON.Vec3(0, 1, 0),
                this.rotation.y
            );
        }

        this.physicsWorld.instance.addBody(this.body);
    }
}
