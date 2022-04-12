import ILockOwnerRaw from './ILockOwnerRaw';

export default class LockOwner {
  public static readonly NO_LOCK = new LockOwner('', undefined);

  public static isNoLockOwner(lockOwner: LockOwner): boolean {
    return lockOwner.lockOwnerName === LockOwner.NO_LOCK.lockOwnerName &&
           lockOwner.lockExpiryTimeStamp?.getTime() === LockOwner.NO_LOCK.lockExpiryTimeStamp?.getTime();
  }

  public static fromJSON(raw?: ILockOwnerRaw): LockOwner {
    let owner = LockOwner.NO_LOCK;
    if (raw) {
      owner = new LockOwner(raw.lockOwnerName, raw.lockExpiryTimeStamp ? new Date(raw.lockExpiryTimeStamp) : undefined);
    }
    return owner;
  }

  constructor(
    public lockOwnerName: string,
    public lockExpiryTimeStamp?: Date // TODO don't observe daylight savings
  ) {
  }

  public getRemainingTimeInSeconds(): number {
    return this.lockExpiryTimeStamp ? (this.lockExpiryTimeStamp.getTime() - new Date().getTime()) / 1000 : 0;
  }

  public toJSON(): ILockOwnerRaw {
    return {
      lockOwnerName: this.lockOwnerName,
      lockExpiryTimeStamp: this.lockExpiryTimeStamp?.toISOString()
    };
  }
}
