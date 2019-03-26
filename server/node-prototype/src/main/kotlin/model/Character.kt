package model

data class Character(val coordinates: Coordinates,
                     var hp: Int,
                     var rotation: Double,
                     var isClickPressed: Boolean,
                     var speedX: Double,
                     var speedY: Double) {

  constructor() : this(Coordinates(0.0, 0.0), 100, 0.0, false, 0.0, 0.0)

}
