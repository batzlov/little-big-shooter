import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as YUKA from "yuka";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

import Experience from "../core/experience";

export default class Obstacle {
    constructor(resource, position, rotation = null, scale = null) {
        this.resource = resource;

        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.physicsWorld = this.experience.physicsWorld;
        this.yukaEntityManager = this.experience.yukaEntityManager;

        this.position = position;
        this.rotation = rotation;

        this.init();
    }

    init() {
        this.initModel();
        this.initPhysics();
        this.initYukaGameEntity();
    }

    initModel() {
        this.model = SkeletonUtils.clone(this.resource.scene);
        this.model.position.copy(this.position);

        if (this.rotation) {
            this.model.rotation.x = this.rotation.x;
            this.model.rotation.y = this.rotation.y;
            this.model.rotation.z = this.rotation.z;
        }

        if (this.scale) {
            this.model.scale.copy(this.scale);
        }

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
                this.position.y + modelBoxSize.y / 2,
                this.position.z
            ),
            shape: this.shape,
            linearDamping: 0.01,
            angularDamping: 0.01,
        });

        this.physicsWorld.instance.addBody(this.body);
    }

    initYukaGameEntity() {
        this.yukaGameEntity = new YUKA.GameEntity();
        this.yukaGameEntity.position.copy(this.body.position);
        this.yukaGameEntity.rotation.copy(this.body.quaternion);
        this.yukaGameEntity.boundingRadius = this.shape.halfExtents.x * 4;
        this.yukaEntityManager.add(this.yukaGameEntity);
    }
}
