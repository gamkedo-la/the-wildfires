# The wildfires

A firefighting plane game.

## Requirements

[Node.js](https://nodejs.org) will be required to start and run the project.

If you are interested in editing/building the assets, you will need `Aseprite`, `Tiled` or `Blockbench`.

## Available Commands

| Command          | Description                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`    | Install project dependencies                                                                                                                                      |
| `npm run dev`    | Launch a development web server                                                                                                                                   |
| `npm run build`  | Create a production build in the `dist` folder                                                                                                                    |
| `npm run assets` | Compiles all the assets from `/assets` folder to be used in the game (you should have the software being used installed, see `assets/asset-conversion.config.ts`) |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080`.

Once the server is running you can edit any of the files in the `src` folder. Vite will automatically recompile your code and then reload the browser.

## Handling Assets

The assets in this game are all handled automatically for loading and use in code. Any asset inside `public/assets` is considered an asset being used for the game. That means that it will be included on the `public/assetPack.json` for loading when running the game, and on the `src/assets.ts` where it will be referred from in the code.

Both `public/assetPack.json` and `src/assets.ts` should not be edited manually, as they will lose their changes once the automatic asset handling will be run.

# Credits

This repository was initially created using the Vite template provided by [Phaser](https://phaser.io).
