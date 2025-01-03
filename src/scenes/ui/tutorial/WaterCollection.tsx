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

export function WaterCollection({
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
  const divePlaneY = 150;

  const planeX = createTransitionSignal(0);
  const planeY = createTransitionSignal(startingPlaneY);

  const keyPressPos = createTransitionSignal(0);
  const keyPressTint = createTransitionSignal(0);

  const waterFx = scene.add.particles(0, 0, "water", {
    quantity: 10,
    blendMode: Phaser.BlendModes.SCREEN,
    speedX: { random: [-30, 30] },
    speedY: { random: [-30, 30] },
    frequency: 10,
    lifespan: 500,
    emitting: false,
  });

  waterFx.setDepth(2);

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
          <Wait duration={1000} />
          <Parallel>
            <Transition
              signal={planeY}
              to={divePlaneY}
              duration={1000}
              ease="Cubic.easeInOut"
            />
            <Transition
              signal={keyPressTint}
              to={1}
              duration={100}
              ease="Cubic.easeIn"
            />
            <Transition
              signal={keyPressPos}
              to={3}
              duration={100}
              ease="Cubic.easeIn"
            />
          </Parallel>
          <Repeat times={4}>
            <Step
              duration={250}
              action={() =>
                waterFx.emitParticle(200, x + planeX.get(), y + planeY.get())
              }
            />
          </Repeat>
          <Parallel>
            <Transition
              signal={planeY}
              to={startingPlaneY}
              duration={1000}
              ease="Cubic.easeInOut"
            />
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
        </Sequence>
      </Parallel>
    </Repeat>
  );

  return (
    <container x={x} y={y} width={width} height={height}>
      {Array.from({ length: 4 }).map((_, index) => (
        <sprite
          texture={"tilemap-spritesheet"}
          frame={50 + index}
          x={16 + width / 2 - 2 * 32 + index * 32}
          y={126}
          scale={2}
        />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <sprite
          texture={"tilemap-spritesheet"}
          frame={50 + index}
          x={width / 2 - 2 * 32 + index * 32}
          y={150}
          scale={2}
        />
      ))}
      {Array.from({ length: 4 }).map((_, index) => (
        <sprite
          texture={"tilemap-spritesheet"}
          frame={50 + index}
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
        text={"Collect"}
        originX={0.5}
        style={{ ...TEXT_STYLE, fontSize: 24, color: "#ffffff" }}
        resolution={4}
      />

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
        y={computed(() => height - 51 + keyPressPos.get())}
        text={"space"}
        originX={0.5}
        style={{ ...TEXT_STYLE, fontSize: 16, color: "#45230d" }}
        resolution={4}
      />
    </container>
  );
}
