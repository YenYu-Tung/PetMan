import { observable, action } from 'mobx';
import { Game } from './Game';
import { DebugState } from './DebugState';
import { Socket } from 'socket.io-client';

export class Store {
  @observable
  game: Game = new Game(this);

  socket? : Socket | null = null;
  srcKiller : string | null = null;
  debugState = new DebugState(this);
  soundEat : ((filepath: string) => void) | null = null;
  soundRevive : ((filepath: string) => void) | null = null;
  soundGameOver : ((filepath: string) => void) | null = null;
  setPlaying : ((playing: boolean) => void) | null = null;

  @action.bound
  resetGame() {
    this.game = new Game(this);
    this.game.readyGameForPlay();
  }
}
