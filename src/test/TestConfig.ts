import InitialState from './InitialState';
import TestExpectation from './TestExpectation';
import TestLockStageContainer from './TestLockStageContainer';
import TestStage from './TestStage';

export default class TestConfig {
  private _lockStageContainer: TestLockStageContainer;
  constructor(public readonly testScenarioName: string,
              public readonly bucketName: string,
              public readonly bucketLockFolder: string, 
              public readonly initialState: InitialState,
              public readonly stageSequence: TestStage<unknown>[],
              public readonly testExpectation: TestExpectation) { 
  }

  public get lockStageContainer(): TestLockStageContainer {
    return this._lockStageContainer;
  }

  public reset(clock: sinon.SinonFakeTimers) {
    this._lockStageContainer = new TestLockStageContainer(this.initialState, [...this.stageSequence], clock);
  }
}
