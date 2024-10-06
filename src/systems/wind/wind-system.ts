import { Math as PMath } from "phaser";

import { System } from "..";
import { GameScene } from "../../scenes/game-scene";

export class WindSystem implements System {
  scene: GameScene;
  windInterval: number;
  direction: PMath.Vector2;
  newDirection: PMath.Vector2;
  speed: number;
  newSpeed: number;

  constructor(scene: GameScene, windInterval: number) {
    this.scene = scene;
    this.windInterval = windInterval;
  }

  create(): this {
    this.direction = PMath.Vector2.UP.add(PMath.Vector2.UP).normalize();
    this.newDirection = this.direction.clone();
    this.speed = 2;
    this.newSpeed = this.speed;

    this.scene.time.addEvent({
      delay: this.windInterval,
      loop: true,
      callback: () => this.change()
    });

    return this;
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

    let velocity = this.direction.clone().scale(this.speed);
    let newVelocity = this.newDirection.clone().scale(this.newSpeed);

    velocity.lerp(newVelocity, deltaSeconds);

    this.speed = velocity.length();
    this.direction = velocity.normalize();
  }

  get() {
    return {
      direction: this.direction,
      speed: this.speed,
      angle: PMath.RadToDeg(this.direction.angle())
    }
  }

  private change() {
    this.newDirection = new PMath.Vector2(PMath.RND.normal(), PMath.RND.normal()).normalize()
    this.newSpeed = PMath.RND.between(1, 10);
  }
}