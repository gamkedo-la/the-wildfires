const config = {
  conversions: [
    {
      input: "tiles/tilemap-test.aseprite",
      output: "tilemap-test.png",
      executable: "aseprite",
      args: "-b ${input} --sheet ${output}",
    },
    {
      input: "tiles/tilemap-test.aseprite",
      output: "tiles/tilemap-test.png",
      outputFolder: "assets/",
      executable: "aseprite",
      args: "-b ${input} --sheet ${output}",
    },
    {
      input: "tiles/tilemap-test-2.aseprite",
      output: "tilemap-test-2.png",
      executable: "aseprite",
      args: "-b ${input} --sheet ${output}",
    },
    {
      input: "tiles/tilemap-test-2.aseprite",
      output: "tiles/tilemap-test-2.png",
      outputFolder: "assets/",
      executable: "aseprite",
      args: "-b ${input} --sheet ${output}",
    },
    {
      input: "maps/test-island-16.tmx",
      output: "test-island-16.json",
      executable: "tiled",
      args: "--export-map json --embed-tilesets ${input} ${output}",
    },
    { input: "airplane/martin.png", output: "martin.png" },
    {
      input: "sounds/airplane-propeller-loop.mp3",
      output: "airplane-propeller-loop.mp3",
    },

    { input: "airplane/martin_export.png", output: "martin-sprite.png" },
    {
      input: "canadair-c415/canadair_export.png",
      output: "canadair-sprite.png",
    },
    {
      input: "skycrane/skycrane_export.png",
      output: "skycrane-sprite.png",
    },
    { input: "ui/the-wildfires-ui-sketch.png", output: "the-wildfires-ui.png" },
  ],
};

export default config;
