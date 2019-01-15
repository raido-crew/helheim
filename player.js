const Bullet = require('./bullet');

let playerIds = 0;

function Player(client, options) {
  this.client = client;
  this.id = ++playerIds;
  this.owner = client;
  this.score = 0;
  this.movingLeft = 0;
  this.movingRight = 0;
  this.movingUp = 0;
  this.movingDown = 0;
  this.x = 180 + this.id * 10;
  this.y = 130 + this.id * 20;
  this.rotation = 0;
  this.speed = 1.9;
  this.hp = 50;
  this.maxHp = 50;
  this.isShooting = false;
  this.lastShot = 0;
  this.isReloading = false;
  this.ammoCount = 6;
  this.reloadTime = 2400;
  this.reloadAmmo = 6;
  this.selectedClass = options.selectedClass;
  this.fireRate = 500;
  this.bulletDamage = 10;
  this.isFireReloading = false;
  this.isDead = false;
  this.reloadTimeEnd = 0;
  this.reloadFireTimeEnd = 0;
  this.hpSprite = 'HPBarGreen.png';
  this.bulletSpeed = 'bulletSpeedClass' + options.selectedClass;
  this.collisionBullet = true;
  this.bulletKillRange = 25;
  this.deleted = false;
  this.killer = null;
  this.radius = 5;
}

Player.prototype.update = function() {
  if (this.deleted) return;
  const now = Date.now();
  if (!this.isDead) {
    // movement
    this.x += (this.movingRight - this.movingLeft) * this.speed;
    this.y += (this.movingDown - this.movingUp) * this.speed;

    // reloading
    if (this.isReloading && now >= this.reloadTimeEnd) {
      this.isReloading = false;
      this.ammoCount = this.reloadAmmo;
    }

    if (this.isFireReloading && now >= this.reloadFireTimeEnd) {
      this.isFireReloading = false;
      this.reloadFireTimeEnd = 0;
    }
  }
};

Player.prototype.delete = function() {
  this.deleted = true;
  this.owner = null;
};

Player.prototype.shoot = function() {
  if (this.deleted || this.isDead || this.ammoCount <= 0) return;

  this.reloadFireTimeEnd = Date.now() + this.fireRate;
  this.isFireReloading = true;
  const bullet = new Bullet(this);
  this.ammoCount--;

  return bullet;
};

Player.prototype.toJSON = function() {
  return {
    clientName: this.client.name || 'guest',
    clientId: this.client.id,
    id: this.id,
    owner: this.owner.sessionId,
    x: this.x,
    y: this.y,
    rotation: this.rotation,
    hp: this.hp,
    maxHp: this.maxHp,
    selectedClass: this.selectedClass,
    isDead: this.isDead,
    score: this.score,
    hpSprite: this.hpSprite,
    ammoCount: this.ammoCount,
    isReloading: this.isReloading,
  };
};

module.exports = Player;