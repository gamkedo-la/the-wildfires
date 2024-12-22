import { TEXT_STYLE } from "@game/consts";
import {
  createTransitionSignal,
  Parallel,
  Repeat,
  Sequence,
  Step,
  Transition,
  Wait,
} from "../../../ui/animation/animation";
import { AbstractScene } from "../..";
import { RESOURCES } from "@game/assets";
import { computed } from "@game/state/lib/signals";
import { Math as PMath } from "phaser";
import { KeyButton } from "./Directions";
export function WaterDrop({
  x,
  y,
  scene,
}: {
  x: number;
  y: number;
  scene: AbstractScene;
}) {
  const width = scene.scale.width / 3;
  const height = 300;

  const startingPlaneY = 100;

  const planeX = createTransitionSignal(0);
  const planeY = createTransitionSignal(startingPlaneY);

  const keyPressPos = createTransitionSignal(0);
  const keyPressTint = createTransitionSignal(0);
  const keyPressPickTint = createTransitionSignal(0);
  const waterFx = scene.add.particles(0, 0, "water", {
    quantity: 10,
    speedX: { random: [-20, 20] },
    speedY: { random: [-20, 20] },
    gravityY: 50,
    frequency: 10,
    lifespan: 1200,
    emitting: false,
  });

  const tint = [
    [0x664433, 0x927e6a, 0xefd8a1, 0x927e6a],
    [0x434033, 0xefd8a1, 0x927e6a],
    [0x3f4033, 0x927e6a, 0xefd8a1],
    [0x504033, 0xefd8a1],
  ];

  const smokeFx = scene.add.particles(0, 0, "smoke-spritesheet", {
    x: () => PMath.RND.between(x + 130, x + 205),
    y: () => PMath.RND.between(240, 250),
    color: PMath.RND.pick(tint),
    frame: [0, 1, 2, 3],
    quantity: 1,
    angle: () => PMath.RND.between(-180, -90),
    speed: [5, 15],
    gravityX: -5,
    gravityY: -10,
    frequency: 25,
    lifespan: [2000, 4000],
  });

  const retardantFx = scene.add.particles(
    0,
    0,
    RESOURCES["retardant-particle"],
    {
      x: {
        onEmit: () =>
          PMath.RND.between(
            scene.scale.width / 2 - 30,
            scene.scale.width / 2 + 30
          ),
        onUpdate: (particle, key, t, value) => {
          return value + Math.sin(5 * t * Math.PI) + (Math.random() - 0.5);
        },
      },
      y: { min: 210, max: 220 },
      quantity: 10,
      speedY: { min: -25, max: -15 },
      frequency: 25,
      lifespan: { min: 1000, max: 2000 },
      emitting: false,
    }
  );

  smokeFx.setDepth(2);
  retardantFx.setDepth(2);
  // TODO: Lost the z-index battle here (the particles go above everything no matter what depth)
  waterFx.setDepth(2);

  const tintSignal = createTransitionSignal(0xffffff);
  const fireOpacity = createTransitionSignal(1);

  scene.animationEngine.run(
    <Repeat times={1000}>
      <Parallel>
        <Transition
          signal={planeX}
          from={0}
          to={width}
          duration={5000}
          ease="Linear"
        />
        <Sequence>
          <Transition
            signal={keyPressPickTint}
            to={1}
            duration={1}
            ease="Cubic.easeIn"
          />
          <Wait duration={800} />
          <Transition
            signal={keyPressPickTint}
            to={0}
            duration={1}
            ease="Cubic.easeIn"
          />
          <Wait duration={200} />
          <Parallel>
            <Wait duration={800} />
            <Transition
              signal={keyPressTint}
              to={1}
              duration={100}
              ease="Cubic.easeIn"
            />
            <Transition
              signal={keyPressPos}
              to={5}
              duration={100}
              ease="Cubic.easeIn"
            />
          </Parallel>
          <Parallel>
            <Repeat times={6}>
              <Step
                duration={250}
                action={() =>
                  waterFx.emitParticle(200, x + planeX.get(), y + planeY.get())
                }
              />
            </Repeat>
            <Sequence>
              <Wait duration={1000} />
              <Step
                duration={1}
                action={() => {
                  smokeFx.stop();
                  retardantFx.explode();
                }}
              />
              <Transition
                signal={fireOpacity}
                to={0}
                duration={100}
                ease="Cubic.easeIn"
              />
              <Transition
                signal={tintSignal}
                to={0xaaaaff}
                duration={1}
                ease="Cubic.easeIn"
              />
            </Sequence>
          </Parallel>
          <Parallel>
            <Wait duration={1000} />
            <Transition
              signal={keyPressTint}
              to={0}
              duration={100}
              ease="Cubic.easeIn"
            />
            <Transition
              signal={keyPressPos}
              to={0}
              duration={1}
              ease="Cubic.easeIn"
            />
          </Parallel>
          <Step duration={0} action={() => smokeFx.start()} />
          <Transition
            signal={fireOpacity}
            to={1}
            duration={1}
            ease="Cubic.easeIn"
          />
          <Transition
            signal={tintSignal}
            to={0xffffff}
            duration={1}
            ease="Cubic.easeIn"
          />
        </Sequence>
      </Parallel>
    </Repeat>
  );

  const fireFrames = createTransitionSignal(0);

  scene.animationEngine.run(
    <Repeat times={1000}>
      <Step duration={1000} action={() => fireFrames.set(1)} />
      <Step duration={1000} action={() => fireFrames.set(0)} />
    </Repeat>
  );

  return (
    <container x={x} y={y} width={width} height={height}>
      {Array.from({ length: 4 }).map((_, index) => (
        <sprite
          texture={"tilemap-spritesheet"}
          frame={20 + index}
          x={16 + width / 2 - 2 * 32 + index * 32}
          y={126}
          scale={2}
        />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <sprite
          texture={"tilemap-spritesheet"}
          frame={20 + index}
          x={width / 2 - 2 * 32 + index * 32}
          y={150}
          scale={2}
          tint={tintSignal}
        />
      ))}
      {Array.from({ length: 3 }).map((_, index) => (
        <sprite
          texture={"tilemap-spritesheet"}
          frame={computed(() => 30 + fireFrames.get() + index)}
          alpha={fireOpacity}
          x={width / 2 - 1 * 32 + index * 32}
          y={150}
          scale={2}
        />
      ))}
      {Array.from({ length: 4 }).map((_, index) => (
        <sprite
          texture={"tilemap-spritesheet"}
          frame={20 + index}
          x={16 + width / 2 - 2 * 32 + index * 32}
          y={174}
          scale={2}
        />
      ))}
      <image
        texture={"martin-spritesheet"}
        frame={0}
        angle={-90}
        x={planeX}
        y={155}
        tint={0x000000}
        alpha={0.5}
      />
      <image
        texture={"martin-spritesheet"}
        frame={0}
        angle={-90}
        x={planeX}
        y={planeY}
        depth={-1}
      />

      <text
        x={width / 2}
        y={30}
        text={"Extinguish"}
        originX={0.5}
        style={{ ...TEXT_STYLE, fontSize: "20px", color: "#ffffff" }}
      />

      <KeyButton
        keyName="1"
        x={width / 2 - 25}
        y={220}
        press={keyPressPickTint}
      />
      <KeyButton keyName="2" x={width / 2 + 25} y={220} />

      <nineslice
        texture={RESOURCES["key-nine-slice"]}
        frame={0}
        originX={0.5}
        x={width / 2}
        y={height - 40}
        width={150}
        height={25}
        scale={1.5}
        leftWidth={4}
        rightWidth={4}
        topHeight={4}
        bottomHeight={5}
        tint={computed(() => (keyPressTint.get() === 1 ? 0xa56243 : 0xffffff))}
      />
      <text
        x={width / 2}
        y={computed(() => height - 54 + keyPressPos.get())}
        text={"space"}
        originX={0.5}
        style={{ ...TEXT_STYLE, fontSize: "18px", color: "#45230d" }}
      />
    </container>
  );
}
