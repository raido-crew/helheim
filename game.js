'use strict';

let gameStartTime = 0;
const fps = 60;
//const HPBarWidth = 100;
let left = keyboard(65),
    up = keyboard(87),
    right = keyboard(68),
    down = keyboard(83),
    reload = keyboard(82);
let ammoCount = null,
    bulletSpeed = null,
    playerSpeed = null,
    reloadTimeMs = null,
    reloadAmmo = null;
let playerTexture = null;
let bulletTexture = null;
let collisionBullet = null;
let bulletKillRange = null;
let bullets = [];
let enemies = [];
let allEnemiesCount = 0;
let player1DeadMessage = false,
    isReloading = false;
let isPlayerDead = false;
let scoreCount = 0;
let reloadTimeEnd = null;
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;
let id, player1, deadPlayer1, stage, renderer, smoothie, grass, bullet, enemy, deadEnemy, blood, playerHP, bulletDamage,
    playerDeadTexture, enemyDamaged;

let requestMap = new XMLHttpRequest();
requestMap.open("GET", "map.json", false);
requestMap.send(null);
const map = JSON.parse(requestMap.responseText);

const windowSize = [window.innerWidth, window.innerHeight];

let app = new Application({
        width: windowSize[0],
        height: windowSize[1],
        antialias: true,
        transparent: false,
        resolution: 1
    }
);

document.body.appendChild(app.view);

loader
    .add("resources/texturePack1.json")
    .load(selectClassBody);

function selectClassBody() {
    document.getElementById('ClassSelection').style.display = "block";
}

function selectClass1() {
    ammoCount = ammoCountClass1;
    bulletSpeed = bulletSpeedClass1;
    playerSpeed = playerSpeedClass1;
    reloadTimeMs = reloadTimeMsClass1;
    reloadAmmo = reloadAmmoClass1;
    collisionBullet = collisionBulletClass1;
    playerTexture = playerTextureClass1;
    bulletTexture = bulletTextureClass1;
    bulletKillRange = bulletKillRangeClass1;
    playerHP = playerHPClass1;
    bulletDamage = bulletDamageClass1;
    playerDeadTexture = playerDeadTextureClass1;
    init();
}
function selectClass2() {
    ammoCount = ammoCountClass2;
    bulletSpeed = bulletSpeedClass2;
    playerSpeed = playerSpeedClass2;
    reloadTimeMs = reloadTimeMsClass2;
    reloadAmmo = reloadAmmoClass2;
    collisionBullet = collisionBulletClass2;
    playerTexture = playerTextureClass2;
    bulletTexture = bulletTextureClass2;
    bulletKillRange = bulletKillRangeClass2;
    playerHP = playerHPClass2;
    bulletDamage = bulletDamageClass2;
    playerDeadTexture = playerDeadTextureClass2;
    init();
}
function selectClass3() {
    ammoCount = ammoCountClass3;
    bulletSpeed = bulletSpeedClass3;
    playerSpeed = playerSpeedClass3;
    reloadTimeMs = reloadTimeMsClass3;
    reloadAmmo = reloadAmmoClass3;
    collisionBullet = collisionBulletClass3;
    playerTexture = playerTextureClass3;
    bulletTexture = bulletTextureClass3;
    bulletKillRange = bulletKillRangeClass3;
    playerHP = playerHPClass3;
    bulletDamage = bulletDamageClass3;
    playerDeadTexture = playerDeadTextureClass3;
    init();
}
function selectClass4() {
    ammoCount = ammoCountClass4;
    bulletSpeed = bulletSpeedClass4;
    playerSpeed = playerSpeedClass4;
    reloadTimeMs = reloadTimeMsClass4;
    reloadAmmo = reloadAmmoClass4;
    collisionBullet = collisionBulletClass4;
    playerTexture = playerTextureClass4;
    bulletTexture = bulletTextureClass4;
    bulletKillRange = bulletKillRangeClass4;
    playerHP = playerHPClass4;
    bulletDamage = bulletDamageClass4;
    playerDeadTexture = playerDeadTextureClass4;
    init();
}

function init() {
    document.getElementById('ClassSelection').style.display = "none";
    stage = new Container();
    renderer = PIXI.autoDetectRenderer(
        windowSize[0],
        windowSize[1],
        {view:document.getElementById("gCanvas")}
    );
    app.stage.addChild(stage);

    id = resources["resources/texturePack1.json"].textures;

    smoothie = new Smoothie({
        engine: PIXI,
        renderer: renderer,
        root: stage,
        fps: fps,
        update: updateFrame.bind(this),
        //renderFps : 60,
    });

    makeWorld();

    updateAmmoGUI(ammoCount);
    updateScoreGUI(scoreCount);

    gameStartTime = Date.now();
    smoothie.start();
}

function updateFrame() {
    let curTime = Date.now();
    let difTime = curTime - gameStartTime;

    moveAtTopLayer(player1);

    //grass.tilePosition.x += tileSpeed;
    //player1.position.x += tileSpeed;

    spawnEnemy(difTime);

    if (!isPlayerDead) {
        updateHPGUI();
        player1.position.x += player1.vx;
        player1.position.y += player1.vy;
        player1.rotation = rotationToPoint(renderer.plugins.interaction.mouse.global, player1.position);
    }

    if (!isPlayerDead && isReloading) {
        let reloadingTimeLeft = reloadTimeEnd - Date.now();
        if (reloadingTimeLeft > 0) {
            updateAmmoGUIReloading(reloadingTimeLeft);
        }
        if (reloadingTimeLeft <= 0) {
            ammoCount = reloadAmmo;
            isReloading = false;
            updateAmmoGUI(ammoCount);
        }
    }

    for (let b = bullets.length - 1; b >= 0; b--) {
        bullets[b].position.x += Math.cos(bullets[b].rotation) * bulletSpeed;
        bullets[b].position.y += Math.sin(bullets[b].rotation) * bulletSpeed;

        if (bullets[b].position.x > window.innerWidth || bullets[b].position.y > window.innerHeight ||
            bullets[b].position.x < 0 || bullets[b].position.y < 0) {
            stage.removeChild(bullets[b]);
            bullets.splice(b, 1);
        }
    }

    for (let e = enemies.length - 1; e >= 0; e--) {
        let isEnemyDead = false;
        for (let b = bullets.length - 1; b >= 0; b--) {
            if (distanceToPoint(enemies[e].position, bullets[b].position) < bulletKillRange) {
                enemies[e].HP -= bulletDamage;
                blood = new Sprite(id["bloodTexture.png"]);
                blood.position.x = bullets[b].position.x;
                blood.position.y = bullets[b].position.y;
                stage.addChild(blood);
                if (collisionBullet) {
                    stage.removeChild(bullets[b]);
                    bullets.splice(b, 1);
                }
                break;
            }
        }

        if (!enemies[e].isDamaged && enemies[e].HP < enemies[e].maxHP) {
            enemyDamaged = new Sprite(id["enemyDamagedTexture.png"]);
            enemyDamaged.position.x = enemies[e].position.x;
            enemyDamaged.position.y = enemies[e].position.y;
            enemyDamaged.anchor.x = enemies[e].anchor.x;
            enemyDamaged.anchor.y = enemies[e].anchor.y;
            enemyDamaged.rotation = enemies[e].rotation;
            enemyDamaged.speed = enemies[e].speed * 0.5;
            enemyDamaged.HP = enemies[e].HP;
            enemyDamaged.maxHP = enemies[e].maxHP;
            enemyDamaged.damage = enemies[e].damage;
            enemyDamaged.attackCooldown = enemies[e].attackCooldown;
            enemyDamaged.timeLastAttack = enemies[e].timeLastAttack;
            enemyDamaged.isDamaged = true;

            stage.removeChild(enemies[e]);
            enemies.splice(e, 1, enemyDamaged);
            stage.addChild(enemyDamaged);
        }
        if (enemies[e].HP <= 0) {
            isEnemyDead = true;
            scoreCount++;
            updateScoreGUI(scoreCount);

            deadEnemy = new Sprite(id["enemyDeadTexture.png"]);
            deadEnemy.position.x = enemies[e].position.x;
            deadEnemy.position.y = enemies[e].position.y;
            deadEnemy.anchor.x = enemies[e].anchor.x;
            deadEnemy.anchor.y = enemies[e].anchor.y;
            deadEnemy.rotation = enemies[e].rotation;
            stage.addChild(deadEnemy);
            stage.removeChild(enemies[e]);
            enemies.splice(e, 1);
        }

        if (!isEnemyDead) {
            if (enemies[e].timeLastAttack + enemies[e].attackCooldown >= curTime) {
                enemies[e].timeLastAttack = 0;
            }
            if (distanceToPoint(enemies[e].position, player1.position) < 25 && enemies[e].timeLastAttack === 0) {
                player1.HP -= enemies[e].damage;
                enemies[e].timeLastAttack = curTime;
            }
            if (!isPlayerDead) {
                enemies[e].rotation = rotationToPoint(player1.position, enemies[e].position);
                enemies[e].position.x += Math.cos(enemies[e].rotation) * enemies[e].speed;
                enemies[e].position.y += Math.sin(enemies[e].rotation) * enemies[e].speed;
            }
        }
    }

    if (player1.HP <= 0) {
        isPlayerDead = true;
        if (!player1DeadMessage) {
            updateHPGUI();
            updatePlayer1DeadMessage(difTime);
        }

        deadPlayer1 = new Sprite(id[playerDeadTexture]);
        deadPlayer1.position.x = player1.position.x;
        deadPlayer1.position.y = player1.position.y;
        deadPlayer1.anchor.x = player1.anchor.x;
        deadPlayer1.anchor.y = player1.anchor.y;
        deadPlayer1.rotation = 0;
        stage.addChild(deadPlayer1);
        stage.removeChild(player1);
    }

    renderer.render(stage);
}

function updateAmmoGUI(ammoCount) {
    document.getElementById('AmmoGUI').innerHTML = "Ammo: " + ammoCount;
}

function updateAmmoGUIReloading(reloadingTimeLeft) {
    document.getElementById('AmmoGUI').innerHTML = "Reloading.. " + Math.round((reloadingTimeLeft / 1000)*10)/10 + "s left";
}

function updateScoreGUI(scoreCount) {
    document.getElementById('ScoreGUI').innerHTML = "Score: " + scoreCount;
}

function updatePlayer1DeadMessage(difTime) {
    document.getElementById('GameOver').style.display = "block";
    document.getElementById('GameOverText').innerHTML = "You dead!!.. Your Score: " + scoreCount + " Time alive: " + Math.round((difTime / 1000)*10)/10 + "s";
    player1DeadMessage = true;
}

//function updateHPBar(subj) {
//    const HPDec = subj.HP / subj.maxHP;
//
//    let HPBarGreen = new Sprite(id["HPBarGreen.png"]);
//    HPBarGreen.position.x = subj.position.x;
//    HPBarGreen.position.y = subj.position.y - 50;
//    HPBarGreen.anchor.x = 0.5;
//    HPBarGreen.anchor.y = 0.5;
//    HPBarGreen.width = HPDec * HPBarWidth;
//    stage.addChild(HPBarGreen);
//
//    const HPDec = enemy.HP / enemy.maxHP;
//    enemy.HPBar = new Sprite(id["HPBarRed.png"]);
//    enemy.HPBar.position.x = enemy.position.x - 100;
//    enemy.HPBar.position.y = enemy.position.y;
//    enemy.HPBar.anchor.x = 0.5;
//    enemy.HPBar.anchor.y = 0.5;
//    enemy.HPBar.width = (1 - HPDec) * HPBarWidth;
//    stage.addChild(enemy.HPBar);
//
//}

function updateHPGUI() {
    document.getElementById('HPGUI').innerHTML = "HP: " + player1.HP;
}

function moveAtTopLayer(object) {
    stage.removeChild(object);
    stage.addChild(object);
}

function makeWorld() {
    grass = new PIXI.extras.TilingSprite(id["grassTexture.png"], window.innerWidth * 2, window.innerHeight);
    grass.position.x = 0;
    grass.position.y = 0;
    grass.tilePosition.x = 0;
    grass.tilePosition.y = 0;
    stage.addChild(grass);

    player1 = new Sprite(id[playerTexture]);
    player1.anchor.x = 0.5;
    player1.anchor.y = 0.5;
    player1.position.x = 200;
    player1.position.y = 150;
    stage.addChild(player1);
    player1.vx = 0;
    player1.vy = 0;
    player1.HP = playerHP;
    player1.maxHP = playerHP;
    player1.damage = bulletDamage;

    stage.interactive = true;



    stage.on("mousedown", function(){
        shoot(player1.rotation, {
            x: player1.position.x+Math.cos(player1.rotation)*10,
            y: player1.position.y+Math.sin(player1.rotation)*10
        });
    });

    left.press = () => {
        player1.vx = -playerSpeed;
    };

    left.release = () => {
        if (!right.isDown) {
            player1.vx = 0;
        }
    };

    up.press = () => {
        player1.vy = -playerSpeed;
    };
    up.release = () => {
        if (!down.isDown) {
            player1.vy = 0;
        }
    };

    right.press = () => {
        player1.vx = playerSpeed;
    };
    right.release = () => {
        if (!left.isDown) {
            player1.vx = 0;
        }
    };

    down.press = () => {
        player1.vy = playerSpeed;
    };
    down.release = () => {
        if (!up.isDown) {
            player1.vy = 0;
        }
    };

    reload.press = () => {
        reloadAmmoStart();
    };
}

function shoot(rotation, startPosition) {
    if (isReloading) {
        return;
    }
    bullet = new Sprite(id[bulletTexture]);
    bullet.position.x = startPosition.x;
    bullet.position.y = startPosition.y;
    bullet.anchor.x = 0.5;
    bullet.anchor.y = 0.5;
    bullet.rotation = rotation;
    stage.addChild(bullet);
    bullets.push(bullet);
    ammoCount--;
    updateAmmoGUI(ammoCount);
    if (ammoCount === 0) {
        reloadAmmoStart();
    }
}

function reloadAmmoStart() {
    if (!isReloading) {
        isReloading = true;
        reloadTimeEnd = Date.now() + reloadTimeMs;
    }
}

function rotationToPoint(targetPosition, objectPosition) {
    const dist_Y = targetPosition.y - objectPosition.y;
    const dist_X = targetPosition.x - objectPosition.x;
    return Math.atan2(dist_Y, dist_X);
}

function distanceToPoint (targetPosition, objectPosition){
    return Math.sqrt(Math.pow((objectPosition.x - targetPosition.x), 2) +  Math.pow((objectPosition.y - targetPosition.y), 2))
}

function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    key.downHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    key.upHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}

function spawnEnemy(difTime) {
    if (difTime / enemySpawnPeriod <= allEnemiesCount) {
        return;
    }
    enemy = new Sprite(id["enemyTexture.png"]);
    enemy.position.x = Math.floor(Math.random() * windowSize[0]);
    enemy.position.y = Math.floor(Math.random() * windowSize[1]);
    enemy.anchor.x = 0.5;
    enemy.anchor.y = 0.5;
    enemy.rotation = rotationToPoint(player1.position, enemy.position);
    if (distanceToPoint(player1.position, enemy.position) < 250) {
        enemy.position.x += 250;
        enemy.position.y += 250;
    }
    enemy.speed = enemySpeed;
    enemy.HP = enemyHP;
    enemy.maxHP = enemyHP;
    enemy.damage = enemyDamage;
    enemy.attackCooldown = enemyAttackCooldown;
    enemy.timeLastAttack = 0;
    enemy.isDamaged = false;
    stage.addChild(enemy);
    enemies.push(enemy);
    allEnemiesCount++;
}