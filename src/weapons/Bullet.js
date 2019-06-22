import { TOOTH_IMAGE } from "../consts/images";

export default class Bullet {
  constructor({ scene, group, x, y, angle }) {
    this.sprite = group
      .create(x, y, TOOTH_IMAGE)
      .setScale(0.25, 0.25)
      .setAngularVelocity(400)
      .setAngle(angle);

    // timer to destroy bullet
    this.lifespan = 100;

    // movement logic
    this.speed = 1000;
    scene.physics.velocityFromRotation(
      this.sprite.rotation,
      this.speed,
      this.sprite.body.acceleration
    );
    this.sprite.body.velocity.x *= 2;
    this.sprite.body.velocity.y *= 2;
  }

  get active() {
    return this.lifespan > 0;
  }

  update() {
    this.lifespan--;
    if (this.lifespan <= 0) {
      this.sprite.setActive(false);
      this.sprite.setVisible(false);
    }
  }

  handleOutOfBounds() {
    this.sprite.destroy();
  }
}
