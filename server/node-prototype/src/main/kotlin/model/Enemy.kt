package model

data class Enemy(val coordinates: Coordinates,
                 var hp: Int,
                 var rotation: Double,
                 var speed: Double)
