import ILockStageContainer from '../ILockStageContainer';

/**
 * Describes what action is performed for a given lock owner request at the various stages in the acquireLock() or releaseLcok() processes.
 */
export default class TestStage<T> {
  constructor(
    public readonly ownerName: string,
    public readonly stageName: keyof ILockStageContainer,
    /**
     * Allows mocking out specific test-stage results, for example, network errors when calling S3
     * or different lockCounter/lockOwner (based on T) values at different points in time during the sequence of tests stages. */
    public readonly actionOverride?: Promise<T>,
    /**
     * The delay in ms before the action is invoked.
     */
    public readonly preActionDelayInMs: number = -1) {
  }
}
