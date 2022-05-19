import LockResultEnum from '../LockResultEnum';
import TestOwnerExpectation from './TestOwnerExpectation'

export default class TestExpectation {
  constructor(
    public readonly ownerExpectations: TestOwnerExpectation[],
    ) {
  }

  public get isExpectedToSucceed(): boolean {
    return this.getNumberOfAcquiredLocksExpected() === 1;
  }

  public get isExpectedToFail(): boolean {
    return this.getNumberOfAcquiredLocksExpected() === 0;
  }

  private getNumberOfAcquiredLocksExpected(): number {
    return this.ownerExpectations.filter((ownerExpectation) => ownerExpectation.expectedLockResult === LockResultEnum.Acquired).length;
  }
}
