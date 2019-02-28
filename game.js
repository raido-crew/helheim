'use strict';

document.body.appendChild(app.view);

loader.add('resources/texturePack1.json').load(setProperties);

function setProperties() {
  let params = new URLSearchParams(document.location.search.substring(1));
  selectedRoom = params.get('room') || 'testroom';
  selectedClassPlayer1 = parseInt(params.get('class'), 10) || 1;
  nickname = params.get('name');

  updateLoadingStatusGUI('Connecting to server (ip:' + ip + ')..');
  client = new Colyseus.Client(ip);

  updateLoadingStatusGUI('Waiting for response (ip:' + ip + ')..');

  client.onOpen.add(function() {
    updateLoadingStatusGUI('Joining room \'' + selectedRoom + '\'..');
    room = client.join(selectedRoom,
        {selectedClass: selectedClassPlayer1, name: nickname});
    room.onJoin.add(function() {
      connected = true;
      updateLoadingStatusGUI(
          'Joined.. sessionId: ' + room.sessionId + ' ; roomId: ' + room.id +
          ' ; clientId: ' + client.id);
      init();
    });
  });
}

function init() {
  //document.getElementById('LoadingStatus').style.display = 'none';
  document.getElementById('gCanvas').style.display = 'inline';
  stage = new Container();
  renderer = PIXI.autoDetectRenderer(
      windowSize[0],
      windowSize[1],
      {view: document.getElementById('gCanvas')},
  );
  app.stage.addChild(stage);

  stage.interactive = true;

  id = resources['resources/texturePack1.json'].textures;

  smoothie = new Smoothie({
    engine: PIXI,
    renderer: renderer,
    root: stage,
    fps: fps,
    update: updateFrame.bind(this),
    //renderFps : 60,
  });

  makeWorld();

  //gameStartTime = Date.now();
  smoothie.start();
}

function updateFrame() {
  const now = Date.now();
  if (now - timeFrame < 100) {
    timeFrame = now;
    room.send([
      'rotation',
      rotationToPoint(renderer.plugins.interaction.mouse.global,
          players[currentPlayerId])]);
  }
  //movePlayersAtTopLayer();

  updateAmmoGUI();
  updateHPGUI();
  updateScoreGUIPlayers();

  updatePlayerHPBars();
}

function makeWorld() {
  //map = JSON.parse(requestMap.responseText);
  //generateMap(map); //todo
  grass = new PIXI.extras.TilingSprite(id['grassTexture.png'],
      window.innerWidth * 2, window.innerHeight);
  grass.position.x = 0;
  grass.position.y = 0;
  grass.tilePosition.x = 0;
  grass.tilePosition.y = 0;
  stage.addChild(grass);

  stage.on('mousedown', function() {
    //player1.isShooting = true;
    room.send(['isShooting', 1]);
  });

  stage.on('mouseup', function() {
    //player1.isShooting = false;
    room.send(['isShooting', 0]);
  });

  left.press = () => {
    //player1.vx = -player1.speed;
    room.send(['left', 1]);
  };

  left.release = () => {
    //player1.vx = 0;
    room.send(['left', 0]);
  };

  up.press = () => {
    //player1.vy = -player1.speed;
    room.send(['up', 1]);
  };
  up.release = () => {
    //player1.vy = 0;
    room.send(['up', 0]);
  };

  right.press = () => {
    //player1.vx = player1.speed;
    room.send(['right', 1]);
  };
  right.release = () => {
    //player1.vx = 0;
    room.send(['right', 0]);
  };

  down.press = () => {
    //player1.vy = player1.speed;
    room.send(['down', 1]);
  };
  down.release = () => {
    //player1.vy = 0;
    room.send(['down', 0]);
  };

  reload.press = () => {
    //reloadAmmoStart(player1);
    room.send(['reload', 'true']);
  };

  cancel.press = () => {
    //reloadAmmoStart(player1);
    room.send(['reload', 'false']);
  };

  room.listen('players/:id', (change) => {
    if (change.operation === 'add') {
      players[change.path['id']] = change.value;
      spawnPlayer(players[change.path['id']]);
      if (players[change.path['id']].owner.id === room.clientId) {
        currentPlayerId = change.path['id'];
      }
    } else if (change.operation === 'remove') {
      deletePlayer(players[change.path['id']]);
    }
  });

  room.listen('players/:id/:attribute', (change) => {
    if (change.operation === 'replace' || change.operation === 'add') {
      if (change.path['attribute'] === 'x' ||
          change.path['attribute'] === 'y' ||
          change.path['attribute'] === 'rotation') {
        players[change.path['id']].body[change.path['attribute']] = change.value;
      }
      players[change.path['id']][change.path['attribute']] = change.value;
    }
  });

  room.listen('bullets/:id', (change) => {
    if (change.operation === 'add') {
      bullets[change.path['id']] = change.value;
      spawnBullet(bullets[change.path['id']]);
    } else if (change.operation === 'remove') {
      deleteBullet(bullets[change.path['id']]);
    }
  });

  room.listen('bullets/:id/:attribute', (change) => {
    if (change.operation === 'replace' || change.operation === 'add') {
      if (change.path['attribute'] === 'x' ||
          change.path['attribute'] === 'y' ||
          change.path['attribute'] === 'rotation') {
        bullets[change.path['id']].body[change.path['attribute']] = change.value;
      }
      bullets[change.path['id']][change.path['attribute']] = change.value;
    }
  });
}

function updateAmmoGUI() {
  const player = players[currentPlayerId];
  if (player.isReloading) {
    document.getElementById('AmmoGUI').innerHTML = 'Reloading';
  } else {
    document.getElementById('AmmoGUI').innerHTML = 'Ammo: ' +
        player.ammoCount;
  }
}

function updateHPGUI() {
  document.getElementById('HPGUI').innerHTML = 'HP: ' +
      players[currentPlayerId].hp;
}

function updateScoreGUIPlayers() {
  let list = '';
  for (let player in players) {
    if (players.hasOwnProperty(player)) {
      list = updateScoreGUI(list, players[player]['clientName'],
          players[player]['score']);
    }
  }
  document.getElementById('ScoreGUI').innerHTML = list;
}

function updateScoreGUI(list, name, scoreCount) {
  if (!list) list += '<br>';
  list = list + name + ': ' + scoreCount;
  return list;
}

function updateLoadingStatusGUI(status) {
  document.getElementById('LoadingStatus').innerHTML += '<br>' + status;
}

function spawnPlayer(player) {
  player.body = new Sprite(
      id[classStats['playerTextureClass' + player.selectedClass]]);
  player.body.anchor.x = 0.5;
  player.body.anchor.y = 0.5;
  player.body.x = player.x;
  player.body.y = player.y;
  stage.addChild(player.body);

  player.hpBar = new Sprite(id[player.hpSprite]);
  player.hpBar.position.x = player.x;
  player.hpBar.position.y = player.y - HPBarWidth / 2;
  player.hpBar.anchor.x = 0.5;
  player.hpBar.anchor.y = 0.5;
  player.hpBar.width = HPBarWidth * player.hp / player.maxHp;

  stage.addChild(player.hpBar);
}

function deletePlayer(player) {
  stage.removeChild(player.body);
  stage.removeChild(player.hpBar);
  delete players[player];
}

function updatePlayerHPBars() {
  for (let player in players) {
    if (players.hasOwnProperty(player) && player.hasOwnProperty("hpBar")) {
      updateHPBar(player);
    }
  }
}

function updateHPBar(player) {

  if (player.hp <= 0) {
    return;
  }

  player.hpBar.position.x = player.x;
  player.hpBar.position.y = player.y - HPBarWidth / 2;

}

function spawnBullet(bullet) {
  bullet.body = new Sprite(id[bulletTexture]);
  bullet.body.anchor.x = 0.5;
  bullet.body.anchor.y = 0.5;
  bullet.body.x = bullet.x;
  bullet.body.y = bullet.y;
  bullet.body.rotation = bullet.rotation;
  stage.addChild(bullet.body);
}

function deleteBullet(bullet) {
  stage.removeChild(bullet);
  delete bullets[bullet];
}

function moveAtTopLayer(object) {
  stage.removeChild(object);
  stage.addChild(object);
}

function movePlayersAtTopLayer() {
  for (let player in players) {
    if (players.hasOwnProperty(player)) {
      moveAtTopLayer(player);
    }
  }
}

function rotationToPoint(targetPosition, objectPosition) {
  const dist_Y = targetPosition.y - objectPosition.y;
  const dist_X = targetPosition.x - objectPosition.x;
  return Math.atan2(dist_Y, dist_X);
}