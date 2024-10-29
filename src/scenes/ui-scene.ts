import { Scene } from "phaser";
import { GameScene } from "./game-scene";
import PhaserGamebus from "../lib/gamebus";
import { RESOURCES } from "../assets";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";

export class UIScene extends Scene {
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  gameScene: GameScene;

  constructor() {
    super("UI");
  }

  water_level: Phaser.GameObjects.Rectangle;
  damage_level: Phaser.GameObjects.Rectangle;
  waterDialSprite: Phaser.GameObjects.Image;
  speedDialSprite: Phaser.GameObjects.Image;
  offscreenArrow: Phaser.GameObjects.Image;
  knotsTXT: Phaser.GameObjects.Text;

  create({ gameScene }: { gameScene: GameScene }) {
    this.gameScene = gameScene;
    this.bus = this.gamebus.getBus();

    // These events keys should probably be constants
    this.gamebus.on("water_level_changed", (water_level: number) => {
      // console.log("ui water gauge changing: "+water_level.toFixed(1));
      // the num we get is 0 to 100 and needle starts at about 225
      this.waterDialSprite.angle = 225+90*water_level/100;
    });

    this.gamebus.on("damage_level_changed", (damage_level: number) => {
      console.log("ui damage gauge changing: "+damage_level.toFixed(1));
    });

    // NOTE: this is fired every single frame... 
    // perhaps it should not be an event and we
    // simply read a global variable instead?
    this.gamebus.on("speed_changed", (vel: number) => {
      //console.log("speed updated: "+vel.toFixed(1));
      // FIXME: 150 is a magic number set to look correct - depends on max speed!
      this.speedDialSprite.angle = 270+90*vel/150; 
      vel = Math.round(vel);
      let str = ""+vel;
      if (vel<10) str = "00"+str; else if (vel<100) str = "0"+str;
      this.knotsTXT.text = str;
    });

    // NOTE: this is fired every single frame... 
    // perhaps it should not be an event and we
    // simply read a global variable instead?
    this.gamebus.on("position_changed", (x: number, y:number) => {
      console.log("pos updated: "+x.toFixed(1)+","+y.toFixed(1));
      if (x<70 || x>GAME_WIDTH-70 || y<70 || y>GAME_HEIGHT-70) {
        // plane is off-screen so we need the arrow
        if (x<70) this.offscreenArrow.setX(70);
        if (x>GAME_WIDTH-70) this.offscreenArrow.setX(GAME_WIDTH-70);
        if (y<70) this.offscreenArrow.setY(70);
        if (y>GAME_HEIGHT-70) this.offscreenArrow.setY(GAME_HEIGHT-70);
      } else { // plane is on-screen so hide the offscreen arror
        //this.offscreenArrow.setPosition(-999,-999);
      }
    });

    // the backdrop of the cockpit control panel
    this.add.image(512, 384, RESOURCES["the-wildfires-ui"]);

    // q) why was this not being added to assets.ts as expected?
    // a) you need to stop vite and re-run it (npm run dev) to refresh
    this.waterDialSprite = this.add.image(264, 745, RESOURCES["water-dial"]);
    this.waterDialSprite.angle = 225;

    // speedometer
    this.speedDialSprite = this.add.image(28, 754, RESOURCES["water-dial"]);
    this.speedDialSprite.angle = 270;

    // txt speed in knots
    this.knotsTXT = this.add.text(44, 700, '0000', { fontFamily: 'Arial', fontSize: 12, color: '#efd8a1' });

    // the arrow that appears when you fly off-screen
    // hmm why is this not visible?? =(
    this.offscreenArrow = this.gameScene.add.image(20, 20, RESOURCES["plane-offscreen-pointer"]);


  }
}
