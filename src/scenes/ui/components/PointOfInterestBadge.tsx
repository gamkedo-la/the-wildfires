import { RESOURCES } from "@game/assets";
import { Stack } from "@game/ui/components/Stack";
import { TEXT_STYLE } from "@game/consts";
import {
  POI_STATE,
  PointOfInterest,
} from "@game/entities/point-of-interest/PointOfInterest";

export const PointOfInterestBadge = ({
  item,
  x,
  y,
  scale = 1,
  visible = true,
}: {
  item: PointOfInterest;
  x: number;
  y: number;
  scale?: number;
  visible?: boolean;
}) => (
  <container
    width={200}
    height={80}
    x={x}
    y={y}
    scale={scale}
    visible={visible}
  >
    <nineslice
      texture={RESOURCES["poi-results-nine-slice"]}
      origin={0}
      width={100}
      height={40}
      scale={2}
      leftWidth={7}
      rightWidth={7}
      topHeight={16}
      bottomHeight={6}
      tint={
        item.state.get() === POI_STATE.UNTOUCHED
          ? 0xffffff
          : item.finalState.get() === POI_STATE.SAVED
          ? 0xbbffbb
          : item.finalState.get() === POI_STATE.DAMAGED
          ? 0xffbbbb
          : 0xffffbb
      }
    />
    <Stack direction="vertical" spacing={10} x={10} y={0}>
      <container width={20} height={20}>
        <image
          texture={RESOURCES["poi-status-icons"]}
          frame={
            item.finalState.get() === POI_STATE.SAVED
              ? 1
              : item.finalState.get() === POI_STATE.DAMAGED
              ? 0
              : 2
          }
          visible={item.state.get() !== POI_STATE.UNTOUCHED}
          x={10}
          y={5}
          width={20}
          height={20}
        />
        <text
          x={item.state.get() !== POI_STATE.UNTOUCHED ? 25 : 10}
          y={0}
          text={item.name}
          resolution={2}
          style={{ ...TEXT_STYLE, fontSize: "16px", color: "#2a1d0d" }}
        />
      </container>
      <container width={200} height={30}>
        <container x={3} y={0} width={20} height={20}>
          <image
            texture={RESOURCES["poi-tiles-icons"]}
            x={20}
            y={5}
            width={20}
            height={20}
            frame={0}
          />
          <text
            x={40}
            y={0}
            text={item.savedTiles.get().toString()}
            style={{
              ...TEXT_STYLE,
              fontSize: "16px",
              color: "#2a1d0d",
            }}
          />
          <image
            texture={RESOURCES["poi-tiles-icons"]}
            x={80}
            y={5}
            width={20}
            height={20}
            frame={1}
          />
          <text
            x={98}
            y={0}
            text={item.damagedTiles.get().toString()}
            style={{
              ...TEXT_STYLE,
              fontSize: "16px",
              color: "#2a1d0d",
            }}
          />
          <image
            texture={RESOURCES["poi-tiles-icons"]}
            x={135}
            y={5}
            width={20}
            height={20}
            frame={2}
          />
          <text
            x={150}
            y={0}
            text={`${item.maxTiles.get()}`}
            style={{
              ...TEXT_STYLE,
              fontSize: "16px",
              color: "#2a1d0d",
            }}
          />
        </container>
      </container>
    </Stack>
  </container>
);
