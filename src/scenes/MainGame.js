import Phaser from "phaser";

import Player from "../units/Player";
import Enemy from "../units/Enemy";
import Blorb from "../units/Blorb";

import EyeballCluster from "../units/EyeballCluster";
import Eyeball from "../units/Eyeball";

import {
  PLAYER1_IMAGE,
  PLAYER2_IMAGE,
  PLAYER3_IMAGE,
  PLAYER4_IMAGE,
  PLAYER5_IMAGE,
  EYEBALL_IMAGE,
  DNA_IMAGE,
  BACKGROUND_IMAGE,
  TOOTH_IMAGE
} from "../consts/images";

import { THUM2_SOUND, KACHING_SOUND, EXPLODE_SOUND } from "../consts/sounds";

// image assets
import player1 from "../assets/player-1.png";
import player2 from "../assets/player-2.png";
import player3 from "../assets/player-3.png";
import player4 from "../assets/player-4.png";
import player5 from "../assets/player-5.png";
import tooth from "../assets/tooth.png";
import bg from "../assets/space.png";
import dna from "../assets/dna.png";
import eyeball from "../assets/eyeball.png";

// sounds
import explode from "../assets/sounds/explode.mp3";
import kaching from "../assets/sounds/kaching.mp3";
import thum2 from "../assets/sounds/thum2.mp3";

export default class MainGame extends Phaser.Scene {
  constructor() {
    super({ key: "MainGame" });
  }

  preload() {
    // images
    this.load.image(PLAYER1_IMAGE, player1);
    this.load.image(PLAYER2_IMAGE, player2);
    this.load.image(PLAYER3_IMAGE, player3);
    this.load.image(PLAYER4_IMAGE, player4);
    this.load.image(PLAYER5_IMAGE, player5);
    this.load.image(TOOTH_IMAGE, tooth);
    this.load.image(BACKGROUND_IMAGE, bg);
    this.load.image(DNA_IMAGE, dna);
    this.load.image(EYEBALL_IMAGE, eyeball);

    // audio
    this.load.audio(THUM2_SOUND, thum2);
    this.load.audio(EXPLODE_SOUND, explode);
    this.load.audio(KACHING_SOUND, kaching);
  }

  create() {
    // background
    this.background = this.add.image(0, 0, BACKGROUND_IMAGE).setOrigin(0, 0);

    this.physics.world.setBounds(
      0,
      0,
      this.background.width,
      this.background.height
    );

    // player
    this.player = new Player(
      this,
      this.background.width / 4, // starting position
      this.background.height / 2
    );

    // initiating with health maybe
    this.player.health = 250;

    //  this.healthbar = this.add.text(20, 20, `health: ${this.player.health}`, {
    //   font: "50px Times New Roman",
    //   fill: "#ffffff"
    // });
    // this.healthbar.setScrollFactor(0, 0);

    const testbar = new Phaser.Geom.Rectangle(25, 25, 300, 40);
    let graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
    graphics.fillRectShape(testbar);

    graphics.setScrollFactor(0, 0);
    // this.healthbar.setScrollFactor(0, 0);

    // powerups temp
    this.powerups = this.physics.add.staticGroup();

    // camera
    this.cameras.main.setBounds(
      0,
      0,
      this.background.width,
      this.background.height
    );
    this.cameras.main.startFollow(this.player.sprite, true, 0.5, 0.5);

    this.enemiesGroup = this.physics.add.group({
      classType: Enemy
    });

    this.maxEnemies = 10;
    // this.enemies = [];

    this.time.addEvent({
      delay: 1000,
      callback: function() {
        const currentEnemies = Array.from(this.enemiesGroup.getChildren());

        this.danceBlorbs(currentEnemies);
        this.spawnEnemies(currentEnemies);
      }, // End callback for adding enemies
      callbackScope: this,
      loop: true
    });

    // check collisions
    this.physics.add.collider(
      this.player.bulletGroup,
      this.enemiesGroup,
      this.handleBulletEnemyCollider.bind(this)
    );

    this.physics.add.collider(
      this.player.sprite,
      this.enemiesGroup,
      this.handlePlayerEnemyCollider.bind(this)
    );

    // check overlaps
    this.physics.add.overlap(
      this.player.sprite,
      this.powerups,
      this.handlePlayerPowerupOverlap.bind(this)
    );
  }

  // Set all blorbs to random vector
  danceBlorbs(currentEnemies) {
    currentEnemies
      .filter(enemy => enemy.constructor.name === "Blorb")
      .forEach(function(blorb) {
        blorb.dance();
      });
  }

  // Choose which enemies to spawn and spawn them
  spawnEnemies(currentEnemies) {
    if (currentEnemies.length <= this.maxEnemies) {
      if (Math.random() > 0.5) {
        this.spawnBlorb();
      } else {
        this.spawnEyeballCluster();
      }
    }
  }

  // Spawn a blorb
  spawnBlorb() {
    this.enemiesGroup.add(
      new Blorb(
        this,
        Phaser.Math.Between(10, this.background.width),
        Phaser.Math.Between(10, this.background.height)
      )
    );
  }

  spawnEyeballCluster() {
    const eyeballCluster = new EyeballCluster(
      this,
      Phaser.Math.Between(10, this.background.width),
      Phaser.Math.Between(10, this.background.height)
    );
    this.enemiesGroup.add(eyeballCluster);
    eyeballCluster.setInitialVelocity(50);
  }

  spawnEyeballs(spawnNum, x, y) {
    console.log(`Spawning ${spawnNum} eyeballs!`);
    for (let i = 0; i < spawnNum; i++) {
      const eyeball = new Eyeball(this, x, y);
      this.enemiesGroup.add(eyeball);
      eyeball.setInitialVelocity(400);
    }
  }

  update() {
    this.player.update();
  }

  handlePlayerPowerupOverlap(player, powerup) {
    console.log(player);

    this.player.health += 10;
    this.sound.play(KACHING_SOUND, {
      seek: 0.15
    });
    powerup.destroy();
  }

  handlePlayerEnemyCollider(player, enemy) {
    if (enemy) {
      enemy.destroy();
      this.player.health -= 10;
    }
  }

  handleBulletEnemyCollider(bullet, enemy) {
    if (enemy) {
      enemy.damage(1);
      bullet.destroy();
    }
  }
}
