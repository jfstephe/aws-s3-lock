import LockResult from './LockResultEnum';

/**
 * The result of the lock request. 
 */
export default class LockRequestResult {
  constructor(
    public readonly requestedLockOwner: string,
    public readonly lockResult: LockResult,
    public readonly errorMessage?: string) {
  }

  public get suceeded(): boolean {
    return this.lockResult === LockResult.Acquired;
  }

  public get failed(): boolean {
    return this.lockResult === LockResult.NotAcquired;
  }

  public toString(): string {
    return `Lock Owner requested: ${this.requestedLockOwner}
Lock: ${this.lockResult}
Error message: ${this.errorMessage ? this.errorMessage : 'None'}`;
  }
}
