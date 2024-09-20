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
      input: "maps/test-island-16.tmx",
      output: "test-island-16.json",
      executable: "tiled",
      args: "--export-map json --embed-tilesets ${input} ${output}",
    },
    { input: "airplane/martin.png", output: "martin.png" },
    { input: "sounds/airplane-propeller-loop.mp3", output: "airplane-propeller-loop.mp3" },
  ],
};

export default config;
