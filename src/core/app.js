import Experience from "./experience.js";

export default class App {
    constructor() {
        this.init();
    }

    init() {
        this.experience = null;
        this.menuButtons = document.querySelectorAll(
            ".main-menu-btn:not(.hidden)"
        );
        this.hightlightedMenuButtonIndex = 0;
        this.handleMenuInputs();
    }

    handleMenuInputs() {
        document.addEventListener("keydown", (event) => {
            if (this.experience && !this.experience.isPaused) {
                if (event.code === "KeyP") {
                    this.showPauseMenu();
                    this.experience.firstPersonControls.unlock();
                }

                return;
            }

            switch (event.code) {
                case "KeyW":
                case "ArrowUp":
                    this.highlightMenuButton();
                    break;
                case "KeyS":
                case "ArrowDown":
                    this.highlightMenuButton();
                    break;
                case "Enter":
                    this.startHighlightedAction();
                    break;
            }
        });
    }

    highlightMenuButton() {
        this.menuButtons[this.hightlightedMenuButtonIndex].classList.remove(
            "btn-primary"
        );
        this.menuButtons[this.hightlightedMenuButtonIndex].classList.add(
            "btn-neutral"
        );

        this.hightlightedMenuButtonIndex++;
        if (this.hightlightedMenuButtonIndex >= this.menuButtons.length) {
            this.hightlightedMenuButtonIndex = 0;
        }

        this.menuButtons[this.hightlightedMenuButtonIndex].classList.remove(
            "btn-neutral"
        );
        this.menuButtons[this.hightlightedMenuButtonIndex].classList.add(
            "btn-primary"
        );
    }

    startHighlightedAction() {
        const action =
            this.menuButtons[this.hightlightedMenuButtonIndex].getAttribute(
                "data-action"
            );
        switch (action) {
            case "start":
                this.startGame();
                break;
            case "resume":
                this.resumeToGame();
                break;
            case "restart":
                this.restartGame();
                break;
            case "instructions":
                this.showInstructions();
                break;
        }
    }

    startGame() {
        document.querySelector(".main-menu").classList.add("hidden");
        // document.querySelector("canvas.webgl").classList.remove("hidden");
        this.experience = new Experience(
            document.querySelector("canvas.webgl"),
            document.querySelector(".loading-screen")
        );
    }

    resumeToGame() {
        document.querySelector(".main-menu").classList.add("hidden");
        document.querySelector("canvas.webgl").classList.remove("hidden");
        this.experience.isPaused = false;
        this.experience.inputHandler.lockPointer = true;
        this.experience.firstPersonControls.lock();
    }

    restartGame() {
        this.experience.destroy();
        this.startGame();
    }

    showInstructions() {}

    showPauseMenu() {
        document.querySelector(".main-menu").classList.toggle("hidden");
        document.querySelector("canvas.webgl").classList.toggle("hidden");

        // hide start and instructions buttons
        let pauseMenuButtons = document.querySelectorAll(
            ".main-menu-btn.hidden"
        );
        pauseMenuButtons.forEach((button, index) => {
            if (index === 0) {
                button.classList.remove("btn-neutral");
                button.classList.add("btn-primary");
            }

            button.classList.remove("hidden");
        });

        this.menuButtons.forEach((button) => {
            button.classList.add("hidden");
        });

        this.menuButtons = pauseMenuButtons;
    }
}
