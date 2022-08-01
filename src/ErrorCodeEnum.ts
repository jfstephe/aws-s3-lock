enum ErrorCodeEnum {
  None = 0,
  OwnedBySomeoneElse,
  MultipleSavesInProgress,
  TooSlowAbandoned,
  /** Generic Fail */
  NoLockAcquired,
  DuringLockRelease
}

export default ErrorCodeEnum;
