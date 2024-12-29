import { Math as PMath } from "phaser";

import { System } from "..";
import { MapScene } from "../../scenes/game/map-scene";
import { MutableSignal } from "@game/state/lib/types";
import { mutable } from "@game/state/lib/signals";

type AperiodicParams = {
  factor1: number;
  factorPi: number;
  factorE: number;
  factorTotal: number;
  scale1: number;
  scalePi: number;
  scaleE: number;
};

const defaultAperiodicParams = {
  factor1: 1,
  factorPi: 1,
  factorE: 1,
  factorTotal: 1,
  scale1: 1,
  scalePi: 1,
  scaleE: 1,
};

// Idea taken from https://stackoverflow.com/a/60772438.
//
// Graphs for the current functions can be found at:
//
// https://www.geogebra.org/graphing/cvbketbq
function aperiodicFunc(p: AperiodicParams): (x: number) => number {
  return (x) => {
    return (
      p.factorTotal *
      (p.factor1 * Math.sin(p.scale1 * x) -
        p.factorE * Math.sin(p.scaleE * Math.E * x) +
        p.factorPi * Math.sin(p.scalePi * Math.PI * x))
    );
  };
}

// The aperiodic functions are defined in a way where
// the value is always between -1 and 1 (basically, totalFactor
// should be inverse of sum of factor[1,E,Pi]).

const speedFunc = aperiodicFunc({
  factor1: -3.2,
  factorE: -1.2,
  factorPi: 1.9,
  factorTotal: 0.159,
  scale1: -1.3,
  scaleE: -1.7,
  scalePi: 0.7,
});

const dirFunc = aperiodicFunc({
  ...defaultAperiodicParams,
  factorTotal: 0.33,
  scale1: -0.9,
  scaleE: -0.4,
  scalePi: -0.4,
});

export class WindSystem implements System {
  scene: MapScene;
  direction: PMath.Vector2;
  speed: number;

  randomPad: number;
  windVector: MutableSignal<PMath.Vector2>;

  constructor(scene: MapScene) {
    this.scene = scene;
  }

  create(): this {
    this.direction = PMath.Vector2.UP;
    this.speed = 2;
    this.windVector = mutable(this.direction.clone());
    this.randomPad = Math.random() * Math.PI;

    return this;
  }

  update(time: number, _delta: number): void {
    // Time in ms passed to aperiodic function is scaled
    // so that change rate is not too fast.
    const scaledTime = time * 0.000025;

    this.direction.setAngle(dirFunc(scaledTime) * Math.PI + this.randomPad);
    this.speed = (speedFunc(scaledTime) + 1) * 5;

    this.windVector.mutate((vec) => {
      vec.set(this.direction.x, this.direction.y).scale(this.speed);
      return true;
    });
  }

  get() {
    return {
      direction: this.direction,
      speed: this.speed,
      angle: PMath.RadToDeg(this.direction.angle()),
    };
  }

  destroy(): void {
    console.log("WindSystem destroy");
  }
}
