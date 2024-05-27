import { observable, action } from 'mobx';
import { Game } from './Game';
import { DebugState } from './DebugState';
import { Socket } from 'socket.io-client';

export class Store {
  @observable
  game: Game = new Game(this);

  socket? : Socket | null = null;
  debugState = new DebugState(this);
  soundEffect : ((filepath: string) => void) | null = null;

  @action.bound
  resetGame() {
    this.game = new Game(this);
    this.game.readyGameForPlay();
  }
}
