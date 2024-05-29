import { action, computed, observable } from 'mobx';
import { Ghost } from './Ghost';
import { makeGhosts, resetGhosts } from './makeGhosts';
import { Maze } from './Maze';
import { PacMan, resetPacMan } from './PacMan';
import { MilliSeconds, PixelsPerFrame } from './Types';
import { Store } from './Store';
import { ENERGIZER_ID } from './MazeData';
import { TimeoutTimer } from './TimeoutTimer';

export const DEFAULT_SPEED = 4;

const ENERGIZER_DURATION: MilliSeconds = 5000;

export class Game {
  constructor(store: Store) {
    this.store = store;
    this.pacMan = new PacMan(this);
    this.ghosts = makeGhosts(this);
  }

  store: Store;

  //** The timestamp we got from requestAnimationFrame().
  @observable
  externalTimeStamp: MilliSeconds | null = null;

  @observable
  timestamp: MilliSeconds = 0;

  @observable
  lastFrameLength: MilliSeconds = 17;

  @observable
  frameCount = 0;

  @observable
  gamePaused = false;

  speed: PixelsPerFrame = DEFAULT_SPEED;

  @observable
  ghosts: Ghost[];

  pacMan: PacMan;

  @observable
  score = 0;

  @observable
  killedGhosts = 0;

  maze = new Maze();

  // Creates an API that spawns a new ghost (always red ghost).
  @action.bound
  spawnGhost() {
    let ghost = new Ghost(this);

    ghost.ghostNumber = this.ghosts.length;
    ghost.name = 'Blinky';
    ghost.color = 'red';
    ghost.colorCode = '#ff0000';
    ghost.initialWaitingTimeInBox = 0;
    ghost.setTileCoordinates({ x: 12, y: 14 });
    ghost.direction = 'LEFT';
    ghost.resetGhost();

    this.ghosts = [...this.ghosts, ghost]; // create a new array to trigger mobx reaction
  }

  @action.bound
  revivePacMan() {
    this.pacMan.send('REVIVED');
    this.timestamp = 0;
    this.ghosts = this.ghosts.slice(0, 4); // Remove extra ghosts

    resetPacMan(this.pacMan);
    resetGhosts(this.ghosts);

    this.maze.pills[23][1] = ENERGIZER_ID;
    this.maze.pills[23][26] = ENERGIZER_ID;
    this.maze.pills[3][1] = ENERGIZER_ID;
    this.maze.pills[3][26] = ENERGIZER_ID;

    this.store.soundRevive?.('/track/revive.mp3');
  }

  @computed
  get gameOver(): boolean {
    const pacMan = this.pacMan;
    return pacMan.dead && pacMan.extraLivesLeft === 0;
  }

  energizerTimer = new TimeoutTimer(ENERGIZER_DURATION, () => {
    this.handleEnergizerTimedOut();
  });

  @action
  handleEnergizerTimedOut() {
    this.pacMan.send('ENERGIZER_TIMED_OUT');
    for (const ghost of this.ghosts) {
      ghost.send('ENERGIZER_TIMED_OUT');
    }
  }

  readyGameForPlay() {
    resetPacMan(this.pacMan);
  }
}
