import ILockReadWriter from '../ILockReadWriter';
import LockOwner from '../LockOwner';
import InitialState from './InitialState';

export default class TestLockReadWriter implements ILockReadWriter {
  private _currentLockOwner: LockOwner;
  private _currentLockCounter: number;

  public init(initialStateOverride: InitialState) {
    this._currentLockOwner = initialStateOverride.lockOwner;
  }

  public getLockOwner(): Promise<LockOwner> {
    return Promise.resolve(this._currentLockOwner)
  }

  public setLockOwner(newLockOwner: LockOwner): void {
    this._currentLockOwner = newLockOwner;
  }

  public getLockCounter(): Promise<number|undefined> {
    return Promise.resolve(this._currentLockCounter);
  }

  public setLockCounter(newLockCounter: number): void {
    this._currentLockCounter = newLockCounter;
  }

  public get currentLockOwner(): LockOwner {
    return this._currentLockOwner;
  }
}
