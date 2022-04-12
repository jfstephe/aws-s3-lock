import ILockStageContainer from '../ILockStageContainer';
import LockOwner from '../LockOwner';
import InitialState from './InitialState';
import TestLockReadWriter from './TestLockReadWriter';
import TestStage from './TestStage';

export default class TestLockStageContainer implements ILockStageContainer {
  private readonly _testLockReadWriter: TestLockReadWriter = new TestLockReadWriter();

  constructor(
      initialState: InitialState,
      private _stageSequence: TestStage<unknown>[],
      private _clock: sinon.SinonFakeTimers) {
    this._testLockReadWriter.init(initialState);
  }

  public async getInitialLockCounter(targetOwnerName: string): Promise<number|undefined> {
    const stageOverride: TestStage<number> = await this.waitUntilOwnerStageIsNext<number>(targetOwnerName, 'getInitialLockCounter');
    // NOTE: The initial lock counter call must be overwritten to provide an initial counter value. This is an internal implementation
    // detail which is why it's not provided in the InitialState object.
    if (stageOverride.actionOverride) {
      const counter = await stageOverride.actionOverride;
      this._testLockReadWriter.setLockCounter(counter);
    }
    else {
      throw new Error(`getInitialLockCounter() must be overridden in orde rto set the initial counter value.`);
    }
    return this._testLockReadWriter.getLockCounter();
  }

  public async getLockOwnerForInitialCheck(targetOwnerName: string): Promise<LockOwner> {
    const stageOverride: TestStage<LockOwner> = await this.waitUntilOwnerStageIsNext<LockOwner>(targetOwnerName, 'getLockOwnerForInitialCheck');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.getLockOwner();
  }

  public async setLockOwnerForMainAcquire(targetLockOwner: LockOwner): Promise<void> {
    const stageOverride: TestStage<void> = await this.waitUntilOwnerStageIsNext<void>(targetLockOwner.lockOwnerName, 'setLockOwnerForMainAcquire');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.setLockOwner(targetLockOwner);
  }
  
  public async setLockOwnerForLockRollback(targetOwnerName: string): Promise<void> {
    const stageOverride: TestStage<void> = await this.waitUntilOwnerStageIsNext<void>(targetOwnerName, 'setLockOwnerForLockRollback');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.setLockOwner(LockOwner.NO_LOCK);
  }

  public async getLockOwnerForFinalCheck(targetOwnerName: string): Promise<LockOwner> {
    const stageOverride: TestStage<LockOwner> = await this.waitUntilOwnerStageIsNext<LockOwner>(targetOwnerName, 'getLockOwnerForFinalCheck');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.getLockOwner();
  }

  public async getLockOwnerForLockRollback(targetOwnerName: string): Promise<LockOwner> {
    const stageOverride: TestStage<LockOwner> = await this.waitUntilOwnerStageIsNext<LockOwner>(targetOwnerName, 'getLockOwnerForLockRollback');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.getLockOwner();
  }

  public async getLockCounter(targetOwnerName: string): Promise<number|undefined> {
    const stageOverride: TestStage<number> = await this.waitUntilOwnerStageIsNext<number>(targetOwnerName, 'getLockCounter');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.getLockCounter();
  }

  public async setLockCounter(targetOwnerName: string, newCounter: number): Promise<void> {
    const stageOverride: TestStage<void> = await this.waitUntilOwnerStageIsNext<void>(targetOwnerName, 'setLockCounter');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.setLockCounter(newCounter);
  }

  public async getLockOwnerForRelease(expectedCurrentOwnerName: string): Promise<LockOwner> {
    const stageOverride: TestStage<LockOwner> = await this.waitUntilOwnerStageIsNext<LockOwner>(expectedCurrentOwnerName, 'getLockOwnerForRelease');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.getLockOwner();
  }

  public async releaseLock(expectedCurrentOwnerName: string): Promise<void> {
    const stageOverride: TestStage<void> = await this.waitUntilOwnerStageIsNext<void>(expectedCurrentOwnerName, 'releaseLock');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.setLockOwner(LockOwner.NO_LOCK);
  }

  public async getLockOwnerForStatusCheck(expectedCurrentOwnerName: string): Promise<LockOwner> {
    const stageOverride: TestStage<LockOwner> = await this.waitUntilOwnerStageIsNext<LockOwner>(expectedCurrentOwnerName, 'getLockOwnerForStatusCheck');
    return stageOverride.actionOverride ? stageOverride.actionOverride : this._testLockReadWriter.getLockOwner();
  }

  public getTestLockOwner(): LockOwner {
    return this._testLockReadWriter.currentLockOwner;
  }

  /**
   * Waits until the next operation is the one with the provided stage name and owner name. If not this
   * will wait and defer to other operations that are required to run before it.
   * Time is mocked out using sinon.
   */
  private async waitUntilOwnerStageIsNext<T>(targetOwnerName: string, stageName: keyof ILockStageContainer): Promise<TestStage<T>> {
    let nextOperation: TestStage<T>;
    let continueLoop: boolean;
    do {
      nextOperation = this._stageSequence[0] as TestStage<T>;
      // Continue until we have the required owner's stage.
      continueLoop = !(nextOperation.ownerName === targetOwnerName && nextOperation.stageName === stageName);
      if (continueLoop) {
        await this._clock.tickAsync(1);
      }
    } while (continueLoop);

    // Apply any delay
    if (nextOperation.preActionDelayInMs >= 0) {
      await this._clock.tickAsync(nextOperation.preActionDelayInMs);
    }

    // Remove the 'nextOperation' from the start of the stage sequence.
    this._stageSequence.splice(0, 1);
    return nextOperation;
  }
}
