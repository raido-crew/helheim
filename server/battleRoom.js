const Room = require('colyseus').Room;
const State = require('./state');
const World = require('./world');
const Player = require('./player');

class BattleRoom extends Room {

  onInit(options) {
    this.maxClients = 12;
    console.log('Init room BattleRoom', options);
    this.world = new World({
      width: 800,
      height: 800,
      clusterSize: 2,
      indexes: ['player', 'bullet'],
    });
    this.setSimulationInterval(() => this.update(), 1000 / 20);
    this.setState(new State(this.world));
  }

  onJoin(client, options) {
    console.log('Joined ' + options.name + ' session ' + client.sessionId);

    client.name = options.name;

    const player = new Player(client, options);
    client.player = player;
    this.world.add('player', player);
  }

  onMessage(client, data) {
    const type = data[0];
    const message = data[1];
    const player = client.player;

    if (type === 'rotation') {
      player.rotation = message;
    } else if (type === 'isShooting') {
      player.isShooting = message;
    } else if (type === 'left') {
      player.movingLeft = message;
    } else if (type === 'up') {
      player.movingUp = message;
    } else if (type === 'right') {
      player.movingRight = message;
    } else if (type === 'down') {
      player.movingDown = message;
    } else if (type === 'reload' && message === 'true') {
      player.reloadTimeEnd = Date.now() + player.reloadTime;
      player.isReloading = true;
    } else if (type === 'reload' && message === 'false') {
      player.reloadTimeEnd = 0;
      player.isReloading = false;
    }
  }

  update() {
    const world = this.world;
    const now = Date.now();

    world.forEach('player', (player) => {
      player.update();

      player.node.root.updateItem(player);

      if (!player.isDead && player.isShooting && !player.isReloading &&
          !player.isFireReloading && player.ammoCount > 0) {
        const bullet = player.shoot();
        world.add('bullet', bullet);
      }
    });

    world.forEach('bullet', (bullet) => {
      bullet.update();

      let deleting = false;
      if (bullet.x <= 0 || bullet.y <= 0 ||
          bullet.x >= world.width || bullet.y >= world.height) {
        deleting = true;
      } else {
        world.forEachAround('player', bullet, (player) => {
          if (deleting ||
              player.isDead ||
              player === bullet.owner ||
              (Math.pow(player.x - bullet.x, 2) +
                  Math.pow(player.y - bullet.y, 2)) > bullet.bulletKillRange) {
            return;
          }

          // hit
          bullet.hit = true;
          //bullet.setV(player);

          if (!bullet.owner.deleted) {
            const damage = bullet.damage;

            player.tHit = now;

            player.hp -= damage;

            if (player.hp <= 0) {
              bullet.owner.score++;

              this.state.score++;

              player.killer = bullet.owner.id;
            }

          }

          deleting = true;
        });
      }

      if (!deleting) {
        bullet.node.root.updateItem(bullet);
      } else {
        world.remove('bullet', bullet);
        bullet.delete();
      }
    });
  }

  onLeave(client) {
    this.world.remove('player', client.player);
    client.player.delete();
  }
}

module.exports = BattleRoom;