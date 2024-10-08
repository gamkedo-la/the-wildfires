import { Scene } from "phaser";

export class PauseScene extends Scene {
  constructor() {
    super("Pause");
  }

  key_esc!: Phaser.Input.Keyboard.Key;
  key_p!: Phaser.Input.Keyboard.Key;

  create() {
    this.key_esc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.key_p = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0);

    this.add.text(width / 2, height / 2 - 50, 'Paused', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const resumeButton = this.add.text(width / 2, height / 2 + 50, 'Resume', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    resumeButton.on('pointerdown', () => {
      this.scene.resume('Game');
      this.scene.stop();
    });
  }

  update(time: number, delta: number) {
    if (this.key_esc.isDown || Phaser.Input.Keyboard.JustDown(this.key_p)) {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.scene.resume('Game');
    this.scene.stop();
  }
}
