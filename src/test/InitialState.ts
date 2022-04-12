import LockOwner from '../LockOwner'

/**
 * Contains the initial state of the lock for tests
 */
export default class InitialState {
  constructor(
  public readonly lockOwner: LockOwner) {
  }
}
