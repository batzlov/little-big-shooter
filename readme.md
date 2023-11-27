# Little Big Shooter

Little Big Shooter, ein Projekt von Robert Ackermann. Made with ♥ and ☕ in Erfurt.

## Allgemein

Das Projekt wurde im Rahmen meines Masterpraxisprojekts an der Fachhochschule Erfurt umgesetzt. Seit einiger Zeit hatte ich bereits ein persönliches Interesse an Three.js und so entsand die Idee, sich genauer mit dieser Bibliothek auseinander zu setzen.

## Technologien

Für die Umsetzung des Projekts wurden folgende Technologien verwendet:

1.  [Vite](https://vitejs.dev/) - Build-Tool
2.  [Three.js](https://threejs.org/) - Darstellung von 3D-Objekten
3.  [cannon-es](https://github.com/pmndrs/cannon-es) - Physik-Engine
4.  [Yuka](https://mugen87.github.io/yuka/) - AI für Gegner
5.  [daisyUI](https://daisyui.com/) - CSS-Framework

## Installation

1. Klonen des Projekts

```bash
    git clone https://github.com/batzlov/little-big-shooter.git
```

2. Wechseln in das Projektverzeichnis

```bash
    cd little-big-shooter
```

3. Installation der Abhängigkeiten

```bash
    npm install
```

## Starten der Anwendung

```bash
    npm run dev
```

## Bekannte Fehler

-   das Zielen/Schießen ist teilweiße etwas ungenau, dies tritt vor allem verstärkt auf, wenn sich der Spieler nah an den Gegnern befindet (vermutlich fehlerhafte Beschleunigung der Kugel auf der y-Achse)
-   der Spieler kann nicht von hohen Gebäuden hinunter schießen
-   die physikalischen Körper verschieben sich teilweiße bei Kollisionen
-   Gegner erkennen teilweße Hindernisse nicht und laufen durch diese hindurch
-   Spiel hängt sich teilweiße auf

## Assets

Die genutzten 3D-Assets stammen vn der Plattform [poly.pizza](https://poly.pizza/), welche eine Sammlung von kostenlosen 3D-Modellen zur Verfügung stellt. Die Assets wurden von mir teilweiße für das Projekt angepasst. Detaillierte Informationen sind in der Datei [attributions.md](./static/models/attributions.md) zu finden.

Die genutzten Sounds stammen von der Plattform [pixabay](https://pixabay.com), auch hier wurden teilweiße von mir Änderungen vorgenommen um diese in eine gwünschte Form zu bringen. Detaillierte Informationen sind auch hier in der Datei [attributions.md](./static/sounds/attributions.md) zu finden.
