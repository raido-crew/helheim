import model.Character
import org.w3c.workers.Client

external fun require(module: String): dynamic

open external class Room() {
  // TODO add implementation for external class, afterwards extends that
}

fun main(args: Array<String>) {
  val colyseus = require("colyseus")
  val express = require("express")

  val app = express()

  val gameServer = js("new colyseus.Server(http.createServer(app))")

  app.get("/") { req, resp ->
    resp.send(generateCharacters())
  }

  app.listen(3000) {
    println("Listening on port 3000")
  }
}

fun generateCharacters() = arrayOf(
    Character(),
    Character(),
    Character()
)

