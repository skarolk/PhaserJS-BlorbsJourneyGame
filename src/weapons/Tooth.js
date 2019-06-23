import Ammo from "./Ammo";

import { TOOTH_IMAGE } from "../consts/images";
import { THUM2_SOUND } from "../consts/sounds";

export default class Tooth extends Ammo {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.setTexture(TOOTH_IMAGE);

    // damage
    this.damage = 1;
  }

  init(angle, scale) {
    // set movement physics
    this.setAngularVelocity(500);
    this.setScale(scale);
    this.setAngle(angle);

    this.scene.physics.velocityFromRotation(
      this.rotation,
      this.speed,
      this.body.velocity
    );

    this.body.velocity.x *= 2;
    this.body.velocity.y *= 2;

    // play launch sound
    this.scene.sound.play(THUM2_SOUND, {
      seek: 0.15
    });
  }
}
