import Battle from "./scenes/Battle.js";
import Menu from "./scenes/Menu.js";
import Bag from "./scenes/Bag.js";

window.config = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                scale: 0
            },
            debug: false
        }
    },
    scene: [Menu, Battle, Bag],
}
var game = new Phaser.Game(window.config)
game.scale.resize(window.innerWidth, window.innerHeight);