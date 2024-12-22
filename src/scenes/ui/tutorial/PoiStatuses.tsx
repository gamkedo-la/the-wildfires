import { RESOURCES } from "@game/assets";
import { TEXT_STYLE } from "@game/consts";
import { AbstractScene } from "../..";

export function PoiStatuses({
  x,
  y,
  scene,
}: {
  x: number;
  y: number;
  scene: AbstractScene;
}) {
  const width = 350;
  const height = 250;

  const px = 75;
  const py = 160;

  const poiEvacuating = (
    <container x={px} y={py} scale={2}>
      <sprite x={0} y={-32} texture={RESOURCES["poi-status-icons"]} frame={3} />

      <rectangle x={0} y={0} width={10} height={27} fillColor={0x2a1d0d} />
      <rectangle x={0} y={5} width={10} height={15} fillColor={0xa58c27} />

      <sprite x={0} y={0} texture={"pin-vertical-spritesheet"} frame={5} />
    </container>
  );

  const p2x = px + 110;
  const p2y = py;

  const poiDamaged = (
    <container x={p2x} y={p2y} scale={2}>
      <sprite
        x={-8}
        y={-32}
        texture={RESOURCES["poi-status-icons"]}
        frame={2}
      />
      <sprite x={8} y={-32} texture={RESOURCES["poi-status-icons"]} frame={4} />

      <rectangle x={0} y={0} width={10} height={27} fillColor={0x2a1d0d} />
      <rectangle x={0} y={8} width={10} height={10} fillColor={0xa58c27} />
      <rectangle x={0} y={-10} width={10} height={10} fillColor={0xae2334} />

      <sprite x={0} y={0} texture={"pin-vertical-spritesheet"} frame={5} />
    </container>
  );

  const p3x = px + 200;
  const p3y = py;

  const poiSaved = (
    <container x={p3x} y={p3y} scale={2}>
      <sprite x={0} y={-32} texture={RESOURCES["poi-status-icons"]} frame={1} />

      <rectangle x={0} y={0} width={10} height={27} fillColor={0x2a1d0d} />
      <rectangle x={0} y={0} width={10} height={27} fillColor={0xa58c27} />

      <sprite x={0} y={0} texture={"pin-vertical-spritesheet"} frame={5} />
    </container>
  );

  return (
    <container x={x - width / 2} y={y} width={width} height={height}>
      <text
        x={px}
        y={py + 50}
        originX={0.5}
        text={"Evacuating"}
        style={{ ...TEXT_STYLE, fontSize: "16px" }}
      />

      <text
        x={p2x}
        y={py + 50}
        originX={0.5}
        text={"Damaged"}
        style={{ ...TEXT_STYLE, fontSize: "16px" }}
      />

      <text
        x={p3x}
        y={py + 50}
        originX={0.5}
        text={"Saved"}
        style={{ ...TEXT_STYLE, fontSize: "16px" }}
      />

      <text
        x={width / 2}
        y={30}
        text={"Protect points"}
        originX={0.5}
        style={{ ...TEXT_STYLE, fontSize: "20px", color: "#ffffff" }}
      />

      {poiEvacuating}
      {poiDamaged}
      {poiSaved}
    </container>
  );
}
