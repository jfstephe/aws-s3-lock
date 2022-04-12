import LockResult from '../LockResultEnum';

export default class TestOwnerExpectation {
  constructor(
    public readonly ownerName: string, 
    public readonly expectedLockResult: LockResult,
    public readonly errorMessage?: string,
    public readonly exceptionExpected: boolean = false,
    public readonly isExpectedToHaveLockReleased: boolean = false) {
  }

  public get isExpectedToAcquireTheLock(): boolean {
    return this.expectedLockResult === LockResult.Acquired;
  }

  public get isExpectedNotToAcquireTheLock(): boolean {
    return this.expectedLockResult === LockResult.NotAcquired;
  }
}
