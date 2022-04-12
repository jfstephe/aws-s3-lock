import LockOwner from './LockOwner';
import InitialState from './test/InitialState';

export default interface ILockReadWriter {
  init(/** For test purposes only */initialStateOverride: InitialState): void;
  getLockOwner(): Promise<LockOwner>;
  setLockOwner(newLockOwner: LockOwner): void;
  getLockCounter(): Promise<number|undefined>;
  setLockCounter(newLockCounter: number): void;
}
