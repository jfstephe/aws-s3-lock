import LockOwner from '../LockOwner';

export default class TestLockOwnerFactory {
  public static create(ownerName: string, timeOfDay: string) {
    const dateTime = new Date(`01 January 2000 ${timeOfDay} UTC`);
    return new LockOwner(ownerName, dateTime)
  }
}
