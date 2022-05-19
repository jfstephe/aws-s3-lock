import ILockStageContainer from './ILockStageContainer';
import LockOwner from './LockOwner';
import LockRequestResult from './LockRequestResult';
import LockResultEnum from './LockResultEnum';
import LockStageContainer from './LockStageContainer';

const ACQUIRE_LOCK_MAX_DURATION_IN_MINUTES: number = 1;

/**
 * Runs in AWS region and profile as per your environment/config.
 */
export default class S3Lock {
  /**
   * Creates a lock object, that can then be acquired, released etc.
   * @param awsBucketName - the name of the AWS bucket (e.g. 's3-lock-integration-test').
   * @param awslockFolder - the name of the folder underneath that bucket.
   * @param lockName - the name of the lock. This is used in the naming of the files so multiple locks can exist in the same folder for different purposes.
   * @param maximumAllowedTimeForOperationInMinutes - the maximum time expected for the operation to take that you need the lock for. S3 operations have a 2 minute timeout by default.
   * @param _lockStageContainer - a stub can be provided for testing purposes. In general don't use.
   */
  constructor(
  awsBucketName: string,
  awslockFolder: string,
  lockName: string,
  private readonly maximumAllowedTimeForOperationInMinutes: number,
  private readonly _lockStageContainer: ILockStageContainer = new LockStageContainer(awsBucketName, awslockFolder, lockName)) {
  }

  /**
   * Gets the current lock status (you should assume this is out of date immediately after being called).
   * @param expectedLockOwnerName - Optional expected lock owner name, used for testing only.
   * @returns The current LockOwner that has acquired the lock or LockOwner.NO_LOCK
   * @throws Error, only when problems connecting to S3
   */
  public async getLockStatus(expectedLockOwnerName?: string): Promise<LockOwner> {
    return this._lockStageContainer.getLockOwnerForStatusCheck(expectedLockOwnerName);
  }

  /**
   * Acquires a lock that can be use to manage access to other resources.
   * @param newOwnerName The expected new owner of the lock (if all goes well)
   * @throws Error, only if when an error occurs when attempting to rollback a lock.
   */
  public async acquireLock(newOwnerName: string): Promise<LockRequestResult> {
    let lockRequestResult: LockRequestResult;
    let releaseLockOnException: boolean = false;
    let lockCounter: number|undefined;
    let currentLockOwner: LockOwner;
    try {
      // Initial lock counter get.
      const initialLockCounter: number|undefined = await this._lockStageContainer.getInitialLockCounter(newOwnerName);

      // Lock owner - Initial check + main owner-lock acquire
      currentLockOwner = await this._lockStageContainer.getLockOwnerForInitialCheck(newOwnerName);
      const lockIsExpired = currentLockOwner.getRemainingTimeInSeconds() <= (this.maximumAllowedTimeForOperationInMinutes * 60);
      if (LockOwner.isNoLockOwner(currentLockOwner) || currentLockOwner.lockOwnerName === newOwnerName || lockIsExpired) {
        const now = new Date();
        const totalDurationOfAcquireLockAndMainOperationInMs = ((this.maximumAllowedTimeForOperationInMinutes + ACQUIRE_LOCK_MAX_DURATION_IN_MINUTES) * 60000);
        const lockExpiryTimeAsEpochInMs = now.getTime() + totalDurationOfAcquireLockAndMainOperationInMs;
        currentLockOwner = new LockOwner(newOwnerName, new Date(lockExpiryTimeAsEpochInMs));
        await this._lockStageContainer.setLockOwnerForMainAcquire(currentLockOwner);
      }
      else {
        throw new Error(`Lock is currently held by owner ${currentLockOwner.lockOwnerName}, wait for ${currentLockOwner.getRemainingTimeInSeconds()} seconds before retrying.`);
      }

      // Lock Counter - get and check value is unchanged
      lockCounter = await this._lockStageContainer.getLockCounter(newOwnerName);

      releaseLockOnException = true;
      if (lockCounter === initialLockCounter) {
        lockCounter = (lockCounter ?? 0) + 1;
        await this._lockStageContainer.setLockCounter(newOwnerName, lockCounter);
      }
      else {
        throw new Error(`There is another attempting to acquire the lock at the same time. Please retry.`);
      }
      releaseLockOnException = false;

      // Lock Owner - Final check
      currentLockOwner = await this._lockStageContainer.getLockOwnerForFinalCheck(newOwnerName);
      if (LockOwner.isNoLockOwner(currentLockOwner)) {
        throw new Error(`Lock is not currently held by anyone but should be. Please retry.`);
      }
      else if (newOwnerName !== currentLockOwner.lockOwnerName) {
        throw new Error(`Lock is currently held by owner ${currentLockOwner.lockOwnerName}, wait for ${currentLockOwner.getRemainingTimeInSeconds()} seconds before retrying.`);
      }
      else if (currentLockOwner.getRemainingTimeInSeconds() <= (this.maximumAllowedTimeForOperationInMinutes * 60)) {
        throw new Error(`Acquiring the lock took too long, you potentially do not have enough time to perform your opertion (limit set to ${this.maximumAllowedTimeForOperationInMinutes} minutes). Please retry.`);
      }
      lockRequestResult = new LockRequestResult(newOwnerName, LockResultEnum.Acquired)
    }
    catch (err) {
      if (releaseLockOnException) {
        // NOTE: This could potentially throw an exception, in which case the lock would exist until the lock timestamp expires.
        currentLockOwner = await this._lockStageContainer.getLockOwnerForLockRollback(newOwnerName);
        if (currentLockOwner.lockOwnerName === newOwnerName) {
          await this._lockStageContainer.setLockOwnerForLockRollback(newOwnerName);
        }
      }
      const errorMessage = `Lock error: ${err.message}`;
      lockRequestResult = new LockRequestResult(newOwnerName, LockResultEnum.NotAcquired, errorMessage)
    }
    return lockRequestResult;
  }

  public async releaseLock(expectedCurrentOwnerName: string): Promise<void> {
    const currentLockOwner: LockOwner = await this._lockStageContainer.getLockOwnerForRelease(expectedCurrentOwnerName);
    if (currentLockOwner.lockOwnerName === expectedCurrentOwnerName) {
      await this._lockStageContainer.releaseLock(expectedCurrentOwnerName);
    }
  }
}
