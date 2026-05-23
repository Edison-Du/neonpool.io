import ClassicGame from '../../../src/modules/game/classicGame.mjs';
import { FourPlayerGame } from '../../../src/modules/game/fourPlayerGame.mjs';
import { ThreePlayerGame } from '../../../src/modules/game/threePlayerGame.mjs';
import { TwoPlayerGame } from '../../../src/modules/game/twoPlayerGame.mjs';
import { GameReplay, GameState, LogUtil } from '../../../src/modules/util/logUtil.mjs';
import { Vector2D } from '../../../src/modules/util/vector2D.mjs';
import replays from './replays.json' with {type: 'json'};

/**
 * Checks if the game state matches the end state
 * @param {ClassicGame} game The game instance
 * @param {GameState} endState The end state to compare against
 */
function checkSameEndStates(game, endState) {
  expect(game.turn).toEqual(endState.turn);
  expect(game.gameTick).toEqual(endState.gameTick);
  expect(game.currentPlayerIndex).toEqual(endState.currentPlayerIndex);
  expect(game.players).toEqual(endState.players);
  expect(game.gameHasEnded).toEqual(endState.gameHasEnded);
  expect(game.balls).toEqual(endState.balls);
  expect(game.ballInHand).toEqual(endState.ballInHand);
  expect(game.ballIsPlaced).toEqual(endState.ballIsPlaced);
  expect(game.runningColourCount).toEqual(endState.runningColourCount);
  expect(game.ballsPocketedThisTurn).toEqual(endState.ballsPocketedThisTurn);
}

/**
 * Simulates a game based on the provided replay data
 * @param {GameReplay} replay 
 * @returns {ClassicGame} The final game state after simulating the replay
 */
function simulateGame(replay) {
  const game = (() => {
    if (replay.numPlayers === 2) {
      return new TwoPlayerGame(replay.seed);
    } else if (replay.numPlayers === 3) {
      return new ThreePlayerGame(replay.seed);
    } else if (replay.numPlayers === 4) {
      return new FourPlayerGame(replay.seed);
    }
  })();
  for (const move of replay.moves) {
    const { moveType, gameTick, data } = move;
    // Fast forward game to the correct tick if necessary
    while (game.gameTick < gameTick) {
      game.simulateTick();
    }
    switch (moveType) {
      case LogUtil.moveTypes.SHOOT_BALL: {
        const { direction: { x, y }, strength } = data;
        game.shootCueBall(new Vector2D(x, y), strength);
        break;
      }
      case LogUtil.moveTypes.PLACE_BALL: {
        const { position: { x, y } } = data;
        game.placeCueBall(new Vector2D(x, y));
        break;
      }
      case LogUtil.moveTypes.FORFEIT:
        game.forfeitPlayer(data.player);
        break;
    }
  }
  while (game.ballsAreMoving && !game.gameHasEnded) {
    game.simulateTick();
  }
  return game;
}

/**
 * Tests a game replay against an expected end state
 * @param {GameReplay} replay 
 * @param {GameState} endState 
 */
function testGameReplay(replay, endState) {
    const finalGameState = simulateGame(replay);
    checkSameEndStates(finalGameState, endState);
}

describe('ClassicGame', () => {
  const tests = [
    "[2p] initial ball valid placement",
    "[2p] p0 forfeits before ball placement",
    "[2p] p0 forfeits after ball placement",
    // "[3p] full game", // slow
    // "[3p] all balls of lost player pocketed", // slow
    "[3p] pX shoots and leaves before potting own ball",
    "[3p] pX shoots and leaves before potting opponent ball",
    "[3p] pX pots ball on break",
    "[4p] basic break",
    "[4p] p1 forfeits on p0's turn",
    "[4p] p0 p1 p2 forfeit in order",
    "[4p] p0 forfeit p1 can place anywhere",
    "[4p] pX forfeit while ball not placed",
    "[4p] pX forfeit before pocketing ball",
    // "[4p] pX forfeit having already won", // slow
    // "[4p] pX forfeit having already lost", // slow
  ]
  for (const name of tests) {
    test(name, () => {
        const {replay, expected} = replays[name];
        testGameReplay(replay, expected);
    })
  }
});
