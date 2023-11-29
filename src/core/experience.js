import * as THREE from "three";
import CannonDebugger from "cannon-es-debugger";

import sources from "../constants/sources.js";

import Debug from "../utils/debug.js";
import Sizes from "../utils/sizes.js";
import Time from "../utils/time.js";
import EventEmitter from "../utils/event-emitter.js";
import Resources from "../utils/resources.js";
import InputHandler from "./input-handler.js";
import SoundHandler from "./sound-handler.js";

import Camera from "../core/camera.js";
import Renderer from "../core/renderer.js";
import PhysicsWorld from "../core/physics-world.js";
import FirstPersonControls from "../core/first-person-controls.js";
import YUKAEntityManager from "../core/yuka-entity-manager.js";

import World from "../world/world.js";
import Player from "../world/player.js";

let instance = null;

export default class Experience {
    constructor(canvas, loadingScreen, reloadInfo, healthInfo, weaponInfo) {
        if (instance) {
            return instance;
        }

        instance = this;

        window.experience = this;

        this.canvas = canvas;
        this.loadingScreen = loadingScreen;
        this.reloadInfo = reloadInfo;
        this.healthInfo = healthInfo;
        this.weaponInfo = weaponInfo;
        this.isPaused = false;

        this.init();
        this.initEvents();
    }

    async init() {
        this.showLoadingIndicator();
        this.debug = new Debug();
        this.sizes = new Sizes();
        this.time = new Time();
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.resources = new Resources(sources);
        await this.resources.load();
        this.soundHandler = new SoundHandler();
        this.inputHandler = new InputHandler();
        this.physicsWorld = new PhysicsWorld();
        this.yukaEntityManager = new YUKAEntityManager();
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.player = new Player();
        this.firstPersonControls = new FirstPersonControls(
            this.camera.instance,
            this.player
        );
        this.world = new World();
        this.hideLoadingIndicator();
        this.showHealthInfo();
        this.showWeaponInfo();
    }

    initEvents() {
        this.sizes.on("resize", () => {
            this.resize();
        });

        this.time.on("tick", () => {
            this.update();
        });
    }

    destroyEvents() {
        this.sizes.off("resize");
        this.time.off("tick");
    }

    resize() {
        this.camera.resize();
        this.renderer.resize();
    }

    update() {
        if (this.isPaused) {
            return;
        }

        if (this.camera) {
            this.camera.update();
        }

        if (this.world) {
            this.world.update();
        }

        if (this.player) {
            this.player.update();
        }

        if (this.inputHandler) {
            this.inputHandler.update();
        }

        if (this.physicsWorld) {
            this.physicsWorld.update();
        }

        if (this.yukaEntityManager) {
            this.yukaEntityManager.update();
        }

        if (this.firstPersonControls) {
            this.firstPersonControls.update(this.clock.getDelta());
        }

        if (this.renderer) {
            this.renderer.update();
        }
    }

    destroy() {
        this.destroyEvents();

        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();

                for (const key in child.material) {
                    const value = child.material[key];

                    if (value && typeof value.dispose === "function") {
                        value.dispose();
                    }
                }
            }
        });

        // this.camera.controls.dispose();
        this.renderer.instance.dispose();

        if (this.debug.active) {
            this.debug.ui.destroy();
        }
    }

    showWeaponInfo() {
        document.querySelector(".weapon-info").classList.remove("hidden");
    }

    hideWeaponInfo() {
        document.querySelector(".weapon-info").classList.add("hidden");
    }

    showHealthInfo() {
        document.querySelector(".health-info").classList.remove("hidden");
    }

    hideHealthInfo() {
        document.querySelector(".health-info").classList.add("hidden");
    }

    showLoadingIndicator() {
        this.loadingScreen.classList.remove("hidden");
    }

    hideLoadingIndicator() {
        this.loadingScreen.classList.add("hidden");
        this.canvas.classList.remove("hidden");
    }

    showReloadInfo() {
        this.reloadInfo.classList.remove("fade-out");
    }

    hideReloadInfo() {
        this.reloadInfo.classList.add("fade-out");
    }

    gameOver() {
        document.querySelector(".weapon-info").classList.toggle("hidden");
        document.querySelector(".health-info").classList.toggle("hidden");
        document.querySelector(".reload-info").classList.toggle("hidden");

        document.querySelector(".main-menu-title").innerHTML = "GAME OVER";
        document.querySelector(".main-menu").classList.toggle("hidden");
        document.querySelector("canvas.webgl").classList.toggle("hidden");

        const menuBtns = document.querySelectorAll(".main-menu-btn");
        menuBtns.forEach((btn) => {
            if (btn.getAttribute("data-action") === "restart") {
                btn.classList.add("btn-primary");
                btn.classList.remove("btn-neutral");
                btn.classList.remove("hidden");
            } else {
                btn.classList.add("hidden");
                btn.classList.remove("btn-primary");
            }
        });
    }
}
