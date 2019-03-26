let left = keyboard(65),
    up = keyboard(87),
    right = keyboard(68),
    down = keyboard(83),
    reload = keyboard(82),
    cancel = keyboard(88);

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
      'keydown', key.downHandler.bind(key), false,
  );
  window.addEventListener(
      'keyup', key.upHandler.bind(key), false,
  );
  return key;
}
