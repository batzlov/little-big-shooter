import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import EventEmitter from "./event-emitter.js";

export default class Resources extends EventEmitter {
    constructor(sources) {
        super();

        this.sources = sources;

        this.items = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;

        this.initLoaders();
        this.startLoading();
    }

    initLoaders() {
        this.loaders = {};

        this.loaders.gltfLoader = new GLTFLoader();
        this.loaders.textureLoader = new THREE.TextureLoader();
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
    }

    textureLoaderAsync(path) {
        return new Promise((resolve, reject) => {
            this.loaders.textureLoader.load(
                path,
                (data) => resolve(data),
                null,
                (error) => reject(error)
            );
        });
    }

    startLoading() {
        // if there are no sources, skip loading
        if (this.finishedLoading()) {
            // this is a hack to make sure emit is called after we started listening to the event when there are no sources to load
            window.requestAnimationFrame(() => {
                this.emit("ready");
            });
            return;
        }

        for (const source of this.sources) {
            let loader = null;

            switch (source.type) {
                case "gltf":
                    loader = this.loaders.gltfLoader;
                    break;
                case "texture":
                    loader = this.loaders.textureLoader;
                    break;
                case "cubeTexture":
                    loader = this.loaders.cubeTextureLoader;
                    break;
                default:
                    console.error("Unhandled source type...");
                    break;
            }

            loader.load(source.path, (file) => {
                this.sourceLoaded(source, file);
            });
        }
    }

    finishedLoading() {
        return this.toLoad === this.loaded;
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file;

        this.loaded++;

        if (this.finishedLoading()) {
            this.emit("ready");
        }
    }
}
