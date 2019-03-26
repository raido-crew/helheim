const ip = 'ws://51.15.91.6:2657';
//const ip = 'ws://127.0.0.1:2657';
let selectedClassPlayer1 = 0;
let selectedRoom = '';
let nickname = '';
let gameStartTime = 0;
let timeFrame = 0;
const fps = 60;
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;
let id, player1, deadPlayer1, stage, renderer, smoothie, grass, bullet, enemy,
    blood, bulletDamage, room, client, currentPlayerId, connected;

let requestMap = new XMLHttpRequest();
requestMap.open('GET', 'map.json', false);
requestMap.send(null);
let map;

const windowSize = [window.innerWidth, window.innerHeight];

let app = new Application({
      width: windowSize[0],
      height: windowSize[1],
      antialias: true,
      transparent: false,
      resolution: 1,
    },
);

const HPBarWidth = 100;

let bullets = {};
let enemies = {};
let players = {};

let playerDeadMessage = false;

const bulletTexture = 'bulletTextureClass1.png';