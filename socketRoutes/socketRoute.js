﻿/**
 * Predicate for checking if a route should be used
 * @callback RoutePredicate
 * @param {Hub} hub The current state of the hub
 * @param {PlayerId} playerId The id of the player that triggered the event
 * @return {boolean} Whether the route should be used or not
 */

/**
 * Maps the current hub to a new form
 * @callback SocketEventHandler
 * @param {Hub} hub The current state of the hub
 * @param {PlayerId} playerId The id of the player who triggered the event
 * @param {any} data The data that was sent with the event
 * @return {[Hub,SocketCmd[]]} The new state of the hub and an array of cmds to execute
 */

/**
 * Specifies an event and the corresponding handler
 * @typedef {[string,SocketEventHandler]} EventPaths
 */

/**
 * A default event handler for when no event matches
 * @type {SocketEventHandler}
 */
const defaultUnknownPath = (hub) => [hub, []]

/**
 * Makes a new socket-route
 * @param {RoutePredicate} pred
 * @param {SocketEventHandler[]} handlers The paths the event can go down
 * @param {SocketEventHandler?} unknownPath The path if none of the others match
 * @constructor
 */
function SocketRoute (pred, handlers, unknownPath) {
  this.pred = pred
  this.eventPaths = handlers.map(it => [it.name, it])
  this.unknownPathHandler = unknownPath ?? defaultUnknownPath
}

module.exports = SocketRoute
