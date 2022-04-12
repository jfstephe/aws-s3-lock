import LockOwner from './LockOwner';

export default interface ILockStageContainer {
  // Acquire
  getInitialLockCounter(targetOwnerName: string): Promise<number|undefined>;
  getLockOwnerForInitialCheck(targetOwnerName: string): Promise<LockOwner>;
  setLockOwnerForMainAcquire(targetLockOwner: LockOwner): Promise<void>;
  getLockCounter(targetOwnerName: string): Promise<number|undefined>;
  setLockCounter(targetOwnerName: string, newCounter: number): Promise<void>;
  getLockOwnerForFinalCheck(expectedLockOwner: string): Promise<LockOwner>;
  getLockOwnerForLockRollback(targetOwnerName: string): Promise<LockOwner>;
  setLockOwnerForLockRollback(targetLockOwner: string): Promise<void>;
  // Release
  getLockOwnerForRelease(expectedCurrentOwnerName: string): Promise<LockOwner>;
  releaseLock(expectedCurrentOwnerName: string): Promise<void>
  // Status check
  getLockOwnerForStatusCheck(expectedCurrentOwnerName: string|undefined): Promise<LockOwner>;
}
