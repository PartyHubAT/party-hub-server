﻿const PlayerBase = require('./playerBase.js')
const Lobby = require('./lobby.js')
const { Map } = require('immutable')

module.exports = class Hub {
  /**
   * The player-base
   * @type {PlayerBase}
   */
  #playerBase
  /**
   * The current lobbies
   */
  #lobbies

  constructor (playerBase, lobbies) {
    this.#playerBase = playerBase
    this.#lobbies = lobbies
  }

  /**
   * An empty hub
   * @type {Hub}
   */
  static empty = new Hub(PlayerBase.empty, Map())

  /**
   * Creates a new hub with a different player-base
   * @param {PlayerBase} playerBase The new player-base
   * @return {Hub} A hub with the new player-base
   */
  #withPlayerBase (playerBase) {
    return new Hub(playerBase, this.#lobbies)
  }

  /**
   * Creates a new hub with  different lobbies
   * @param lobbies The new lobbies
   * @return {Hub} A hub with the new lobbies
   */
  #withLobbies (lobbies) {
    return new Hub(this.#playerBase, lobbies)
  }

  /**
   * Processes an event
   * @param {string} playerId The id of the player who triggered the event
   * @param {string} eventName The name of the event
   * @param {any} data The data that was sent with the event
   * @return {{emits: *[], newHub: Hub}} A new hub, with any changes the event cause, as well as an array of emits
   */
  processSocketEvent (playerId, eventName, data) {
    const noChanges = { newHub: this, emits: [] }

    if (this.#playerBase.has(playerId)) { // The player is already in the player-base
      switch (eventName) {
        case 'newRoom': {
          const newLobby = Lobby.openNew().addPlayer(playerId)
          return {
            newHub:
              this
                .#withPlayerBase(
                  this.#playerBase
                    .setPlayerName(playerId, data.playerName)
                    .setPlayerRoomId(playerId, newLobby.roomId))
                .#withLobbies(this.#lobbies.set(newLobby.roomId, newLobby)),
            emits: [{
              targetId: playerId,
              eventName: 'joinSuccess',
              data: { roomId: newLobby.roomId }
            }]
          }
        }
        case 'disconnect':
          console.log(`Unknown player (${playerId}) disconnected from the lonely-zone.`)
          return {
            newHub:
              this.#withPlayerBase(this.#playerBase.remove(playerId)),
            emits: []
          }
        default:
          return noChanges
      }
    } else { // The player who sent the message is completely unknown
      // The only thing unknown players can do is connect
      if (eventName === 'connect') {
        console.log(`New player (${playerId}) entered the lonely-zone.`)
        return {
          newHub:
            this.#withPlayerBase(this.#playerBase.addLonely(playerId)),
          emits: []
        }
      } else { return noChanges }
    }
  }
}
