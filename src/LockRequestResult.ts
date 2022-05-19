import LockResultEnum from './LockResultEnum';

/**
 * The result of the lock request. 
 */
export default class LockRequestResult {
  constructor(
    public readonly requestedLockOwner: string,
    public readonly lockResult: LockResultEnum,
    public readonly errorMessage?: string) {
  }

  public get succeeded(): boolean {
    return this.lockResult === LockResultEnum.Acquired;
  }

  public get failed(): boolean {
    return this.lockResult === LockResultEnum.NotAcquired;
  }

  public toString(): string {
    return `Lock Owner requested: ${this.requestedLockOwner}
Lock: ${this.lockResult}
Error message: ${this.errorMessage ? this.errorMessage : 'None'}`;
  }
}
