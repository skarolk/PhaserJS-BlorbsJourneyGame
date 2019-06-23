import Phaser from "phaser";

import Player from "../units/Player";
import Enemy from "../units/Enemy";
import Blorb from "../units/Blorb";
import Ammo from "../bullets/Ammo";

import EyeballCluster from "../units/EyeballCluster";
import Eyeball from "../units/Eyeball";

import {
  PLAYER1_IMAGE,
  PLAYER2_IMAGE,
  PLAYER3_IMAGE,
  PLAYER4_IMAGE,
  PLAYER5_IMAGE,
  EYEBALL_IMAGE,
  EYEBALL_CLUSTER_IMAGE,
  DNA_IMAGE,
  BACKGROUND_IMAGE,
  TOOTH_IMAGE,
  NAIL_IMAGE
} from "../consts/images";

import {
  SPIT1_SOUND,
  THUM2_SOUND,
  KACHING_SOUND,
  EXPLODE_SOUND
} from "../consts/sounds";

// image assets
import player1 from "../assets/player-1.png";
import player2 from "../assets/player-2.png";
import player3 from "../assets/player-3.png";
import player4 from "../assets/player-4.png";
import player5 from "../assets/player-5.png";
import tooth from "../assets/tooth.png";
import nail from "../assets/clawber-claw-small.png";
import bg from "../assets/background.png";
import dna from "../assets/dna.png";
import eyeball from "../assets/eyeball.png";
import eyeballCluster from "../assets/eyeball-cluster.png";

// sounds
import explode from "../assets/sounds/explode.mp3";
import kaching from "../assets/sounds/kaching.mp3";
import thum2 from "../assets/sounds/thum2.mp3";
import spit1 from "../assets/sounds/spit1.mp3";

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
    this.load.image(NAIL_IMAGE, nail);
    this.load.image(BACKGROUND_IMAGE, bg);
    this.load.image(DNA_IMAGE, dna);
    this.load.image(EYEBALL_IMAGE, eyeball);

    // audio
    this.load.audio(SPIT1_SOUND, spit1);
    this.load.audio(THUM2_SOUND, thum2);
    this.load.audio(EXPLODE_SOUND, explode);
    this.load.audio(KACHING_SOUND, kaching);
    this.load.image(EYEBALL_CLUSTER_IMAGE, eyeballCluster);
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

    this.healthbar = this.add.text(20, 20, `health: ${this.player.health}`, {
      font: "50px Times New Roman",
      fill: "#ffffff"
    });
    this.healthbar.setScrollFactor(0, 0);

    // const testbar = new Phaser.Geom.Rectangle(25, 25, 300, 40);
    // let graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
    // graphics.fillRectShape(testbar);

    // graphics.setScrollFactor(0, 0);
    // this.healthbar.setScrollFactor(0, 0);

    /*** PHYSICS GROUPS ***/
    // powerups
    this.powerups = this.physics.add.staticGroup();

    // bullets
    this.bulletGroup = this.physics.add.group({
      classType: Ammo
    });

    // camera
    this.cameras.main.setBounds(
      0,
      0,
      this.background.width,
      this.background.height
    );
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);

    this.enemiesGroup = this.physics.add.group({
      classType: Enemy
    });

    this.maxEnemies = 30;
    // this.enemies = [];

    this.time.addEvent({
      delay: 700,
      callback: function() {
        this.danceBlorbs(this.currentEnemies());
        this.spawnEnemies(this.currentEnemies());
        this.cleanupEnemies(this.currentEnemies());
      }, // End callback for adding enemies
      callbackScope: this,
      loop: true
    });

    // check collisions
    this.physics.add.collider(
      this.player,
      this.enemiesGroup,
      this.handlePlayerEnemyCollider.bind(this)
    );

    // check overlaps
    this.physics.add.overlap(
      this.bulletGroup,
      this.enemiesGroup,
      this.handleBulletEnemyCollider.bind(this)
    );

    this.physics.add.overlap(
      this.player,
      this.powerups,
      this.handlePlayerPowerupOverlap.bind(this)
    );
  }

  update() {
    this.player.update();
    this.currentEnemies().forEach(enemy => enemy.update());
    this.currentBullets().forEach(bullet => bullet.update());
  }

  /*** Helper fns ***/
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
      const playerBounds = this.player.getBounds();
      console.log(playerBounds);

      const rnd = new Phaser.Math.RandomDataGenerator();

      const spawnX = rnd.pick([
        Phaser.Math.Between(10, playerBounds.left - 200),
        Phaser.Math.Between(playerBounds.right + 200, this.background.width)
      ]);
      const spawnY = rnd.pick([
        Phaser.Math.Between(10, playerBounds.top - 200),
        Phaser.Math.Between(playerBounds.bottom + 200, this.background.height)
      ]);

      if (Math.random() > 0.5) {
        this.spawnBlorb(spawnX, spawnY);
      } else {
        this.spawnEyeballCluster(spawnX, spawnY);
      }
    }
  }

  // Spawn a blorb
  spawnBlorb(x, y) {
    this.enemiesGroup.add(new Blorb(this, x, y));
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
    for (let i = 0; i < spawnNum; i++) {
      const eyeball = new Eyeball(this, x, y);
      this.enemiesGroup.add(eyeball);
      eyeball.setInitialVelocity(400);
    }
  }

  cleanupEnemies(currentEnemies) {
    currentEnemies.forEach(enemy => {
      const { x, y } = enemy.body;
      if (
        x > this.background.width + 100 ||
        x < -100 ||
        y > this.background.height + 100 ||
        y < -100
      ) {
        enemy.destroy();
      }
    });
  }

  handlePlayerPowerupOverlap(player, powerup) {
    this.player.health += 10;
    this.sound.play(KACHING_SOUND, {
      seek: 0.15
    });
    powerup.destroy();
  }

  handlePlayerEnemyCollider(player, enemy) {
    if (enemy) {
      enemy.damage(1);
      this.player.health -= 50;
    }
  }

  handleBulletEnemyCollider(bullet, enemy) {
    if (enemy) {
      enemy.damage(bullet.damage);
      bullet.destroy();
    }
  }

  currentEnemies() {
    return Array.from(this.enemiesGroup.getChildren());
  }

  currentBullets() {
    return Array.from(this.bulletGroup.getChildren());
  }
}
