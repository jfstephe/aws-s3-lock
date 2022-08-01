import ErrorCodeEnum from '../ErrorCodeEnum';
import LockResultEnum from '../LockResultEnum';

export default class TestOwnerExpectation {
  constructor(
    public readonly ownerName: string, 
    public readonly expectedLockResult: LockResultEnum,
    public readonly errorMessage?: string,
    public readonly errorCode?: ErrorCodeEnum,
    public readonly exceptionExpected: boolean = false,
    public readonly isExpectedToHaveLockReleased: boolean = false) {
  }

  public get isExpectedToAcquireTheLock(): boolean {
    return this.expectedLockResult === LockResultEnum.Acquired;
  }

  public get isExpectedNotToAcquireTheLock(): boolean {
    return this.expectedLockResult === LockResultEnum.NotAcquired;
  }
}
