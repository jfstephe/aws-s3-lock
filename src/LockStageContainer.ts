import ILockStageContainer from './ILockStageContainer';
import LockOwner from './LockOwner';
import S3LockReadWriter from './S3LockReadWriter';

export default class LockStageContainer implements ILockStageContainer {
  private readonly _s3LockReadWriter: S3LockReadWriter;

  constructor(
  awsBucketName: string,
  awslockFolder: string,
  lockName: string) {
    this._s3LockReadWriter = new S3LockReadWriter(awsBucketName, awslockFolder, lockName);
    this._s3LockReadWriter.init();
  }

  public async getInitialLockCounter(targetOwnerName: string): Promise<number|undefined> {
    return this._s3LockReadWriter.getLockCounter();
  }

  public async getLockOwnerForInitialCheck(targetOwnerName: string): Promise<LockOwner> {
    return this._s3LockReadWriter.getLockOwner();
  }

  public async setLockOwnerForMainAcquire(targetLockOwner: LockOwner): Promise<void> {
    return this._s3LockReadWriter.setLockOwner(targetLockOwner);
  }

  public async setLockOwnerForLockRollback(targetOwnerName: string): Promise<void> {
    return this._s3LockReadWriter.setLockOwner(LockOwner.NO_LOCK);
  }

  public async getLockOwnerForFinalCheck(targetOwnerName: string): Promise<LockOwner> {
    return this._s3LockReadWriter.getLockOwner();
  }

  public async getLockOwnerForLockRollback(targetOwnerName: string): Promise<LockOwner> {
    return this._s3LockReadWriter.getLockOwner();
  }

  public async getLockCounter(targetOwnerName: string): Promise<number|undefined> {
    return this._s3LockReadWriter.getLockCounter();
  }

  public async setLockCounter(targetOwnerName: string, newCounter: number): Promise<void> {
    return this._s3LockReadWriter.setLockCounter(newCounter);
  }

  public async getLockOwnerForRelease(expectedCurrentOwnerName: string): Promise<LockOwner> {
    return this._s3LockReadWriter.getLockOwner();
  }

  public async releaseLock(expectedCurrentOwnerName: string): Promise<void> {
    return this._s3LockReadWriter.setLockOwner(LockOwner.NO_LOCK);
  }

  public async getLockOwnerForStatusCheck(expectedCurrentOwnerName: string): Promise<LockOwner> {
    return this._s3LockReadWriter.getLockOwner();
  }
}
