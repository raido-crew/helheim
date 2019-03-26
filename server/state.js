class State {
  constructor(world) {
    this.world = world;
    this.score = 0;
  }

  toJSON() {
    const players = {};
    this.world.forEach('player', (item) => players[item.id] = item);

    const bullets = {};
    this.world.forEach('bullet', (item) => bullets[item.id] = item);

    return {
      score: this.score,
      players: players,
      bullets: bullets,
    }
  }
}

module.exports = State;