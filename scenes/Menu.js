// Menu : nom de la scène, en majuscules
class Menu extends Phaser.Scene {
    constructor() {
            super('Menu');
        }
        preload() {

        }
        create() {
            // Création d'un texte avec un eventlistener : click = on démarre la scène Game
            this.clickButton = this.add.text(window.innerWidth/2, window.innerHeight/2, 'Start Game', { fill: '#0f0' })
                // event listener version phaser
                .setInteractive()
                .on('pointerdown', () => {
                    // passage à la scène Game
                    this.scene.start('Bag');
                });
        }
        update(time, delta) {

        }
    }
    // importation de la scène dans le fichier main js
    export default Menu;