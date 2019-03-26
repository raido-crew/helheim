'use strict';

let bulletIds = 0;

function Bullet(owner) {
  this.deleted = false;

  this.owner = owner;
  this.id = ++bulletIds;
  this.bulletDamage = this.owner.bulletDamage;
  this.collisionBullet = this.owner.collisionBullet;
  this.speed = this.owner.bulletSpeed;
  this.bulletKillRange = this.owner.bulletKillRange;
  this.x = this.owner.x;
  this.y = this.owner.y;
  this.rotation = this.owner.rotation;
  this.damage = this.owner.bulletDamage;
  this.radius = 2;
}

Bullet.prototype.delete = function() {
  if (this.deleted)
    return;

  this.deleted = true;
  this.owner = null;
};

Bullet.prototype.update = function() {
  if (this.deleted) return;

  this.x += Math.cos(this.rotation) * this.speed;
  this.y += Math.sin(this.rotation) * this.speed;
};

Bullet.prototype.toJSON = function() {
  return {
    id: this.id,
    player: this.owner.id,
    x: this.x,
    y: this.y,
    rotation: this.rotation,
  };
};

module.exports = Bullet;