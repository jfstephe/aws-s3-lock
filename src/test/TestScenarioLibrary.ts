import LockOwner from '../LockOwner';
import LockResultEnum from '../LockResultEnum';
import InitialState from './InitialState';
import TestConfig from './TestConfig';
import TestExpectation from './TestExpectation';
import TestOwnerExpectation from './TestOwnerExpectation';
import TestStage from './TestStage';

export default class TestScenarioLibrary {
  public static readonly testStartTime = new Date('January 1, 2000 13:00:00');

  public static readonly singleUserAcquireLock = new TestConfig(
    'Single user attempts to get the lock',
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter'),
      new TestStage('userA', 'setLockCounter'),
      new TestStage('userA', 'getLockOwnerForFinalCheck'),
      new TestStage('userA', 'getLockOwnerForStatusCheck')
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.Acquired)
      ])
  );

  
  public static readonly singleUserAcquireLockOnPreviouslyExpiredLock = new TestConfig(
    `Single user attempts to get the lock, when someone else has the lock but didn't release it, and it has since expired`,
    'SomeBucket',
    'SomeKey', 
    // The lock expires at the testStartTime.
    new InitialState(new LockOwner('someoneElse', TestScenarioLibrary.testStartTime)),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter'),
      new TestStage('userA', 'setLockCounter'),
      new TestStage('userA', 'getLockOwnerForFinalCheck'),
      new TestStage('userA', 'getLockOwnerForStatusCheck')
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.Acquired)
      ])
  );
  public static readonly singleUserAcquireLockThenRelease = new TestConfig(
    'Single user attempts to get the lock and then release it',
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter'),
      new TestStage('userA', 'setLockCounter'),
      new TestStage('userA', 'getLockOwnerForFinalCheck'),
      new TestStage('userA', 'getLockOwnerForStatusCheck'),
      new TestStage('userA', 'getLockOwnerForRelease'),
      new TestStage('userA', 'releaseLock')
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.Acquired, undefined, undefined, true)
      ])
  );

  public static readonly singleUserWithSlowButAcceptableNetwork = new TestConfig(
    `Single user attempts to get the lock and while slow it's just quick enough`,
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter'),
      // The timeout allows for up to 1 minute for the lock process to complete.
      new TestStage('userA', 'setLockCounter', undefined, 59999),
      new TestStage('userA', 'getLockOwnerForFinalCheck'),
      new TestStage('userA', 'getLockOwnerForStatusCheck')
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.Acquired)
      ])
  );

  public static readonly singleUserWithSlowAndUnacceptableNetwork = new TestConfig(
    'Single user attempts to get the lock but calls take too long (timeout expires)',
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter'),
      // The timeout allows for up to 1 minute for the lock process to complete.
      new TestStage('userA', 'setLockCounter', undefined, 60000),
      new TestStage('userA', 'getLockOwnerForFinalCheck')
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Acquiring the lock took too long, you potentially do not have enough time to perform your opertion (limit set to 2 minutes). Please retry.')
      ])
  );

  public static readonly singleUserNetworkFailureOnGetInitialLockCounter = new TestConfig(
    `Single user attempts to get the lock but there's a network error on initial check`,
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.reject(new Error('Some network error')))
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Some network error')
      ])
  )

  public static readonly singleUserNetworkFailureOnInitialCheck = new TestConfig(
    `Single user attempts to get the lock but there's a network error on initial check`,
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck', Promise.reject(new Error('Some network error')))
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Some network error')
      ])
  );

  
  public static readonly singleUserNetworkFailureOnSetMainAcquireCall = new TestConfig(
    `Single user attempts to get the lock but there's a network error on the main acquire call`,
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire', Promise.reject(new Error('Some network error')))
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Some network error')
      ])
  );


  public static readonly singleUserNetworkFailureOnGetLockCounter = new TestConfig(
    `Single user attempts to get the lock but there's a network error on the get lock counter call`,
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter', Promise.reject(new Error('Some network error')))
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Some network error')
      ])
  );


  public static readonly singleUserNetworkFailureOnSetLockCounter = new TestConfig(
    `Single user attempts to get the lock but there's a network error on the set lock counter call`,
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter'),
      new TestStage('userA', 'setLockCounter', Promise.reject(new Error('Some network error'))),
      new TestStage('userA', 'getLockOwnerForLockRollback'),
      new TestStage('userA', 'setLockOwnerForLockRollback')
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Some network error')
      ])
  );


  public static readonly singleUserNetworkFailureOnFinalLockOwnerCheck = new TestConfig(
    `Single user attempts to get the lock but there's a network error on the final lock owner call`,
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter'),
      new TestStage('userA', 'setLockCounter'),
      new TestStage('userA', 'getLockOwnerForFinalCheck', Promise.reject(new Error('Some network error')))
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Some network error')
      ])
  );


  public static readonly singleUserNetworkFailureOnGetOwnerForLockRollback = new TestConfig(
    `Single user attempts to get the lock but there's a network error when setting the lock counter causing a lock rollback, but there's also an error on the get owner for lock rollback call`,
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter'),
      new TestStage('userA', 'setLockCounter', Promise.reject(new Error('Some network error1'))),
      new TestStage('userA', 'getLockOwnerForLockRollback', Promise.reject(new Error('Some network error2'))),
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Some network error2', true)
      ])
  );


  public static readonly singleUserNetworkFailureOnSetOwnerForLockRollback = new TestConfig(
    `Single user attempts to get the lock but there's a network error when setting the lock counter causing a lock rollback, but there's also an error on the set owner for lock rollback call`,
    'SomeBucket',
    'SomeKey', 
    new InitialState(LockOwner.NO_LOCK),
    [
      new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
      new TestStage('userA', 'getLockOwnerForInitialCheck'),
      new TestStage('userA', 'setLockOwnerForMainAcquire'),
      new TestStage('userA', 'getLockCounter'),
      new TestStage('userA', 'setLockCounter', Promise.reject(new Error('Some network error1'))),
      new TestStage('userA', 'getLockOwnerForLockRollback'),
      new TestStage('userA', 'setLockOwnerForLockRollback', Promise.reject(new Error('Some network error2')))
    ],
    new TestExpectation(
      [
        new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Some network error2', true)
      ])
  );

  public static readonly twoUsersMakingCallsInLockStep = new TestConfig(
      'Race condition between 2 users making calls at the same time should result in only one user getting the lock',
      'SomeBucket',
      'SomeKey', 
      new InitialState(LockOwner.NO_LOCK),
      [
        new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userB', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userA', 'getLockOwnerForInitialCheck'),
        new TestStage('userB', 'getLockOwnerForInitialCheck'),
        new TestStage('userA', 'setLockOwnerForMainAcquire'),
        new TestStage('userB', 'setLockOwnerForMainAcquire'),
        new TestStage('userA', 'getLockCounter'),
        new TestStage('userB', 'getLockCounter'),
        new TestStage('userA', 'setLockCounter'),
        new TestStage('userB', 'setLockCounter'),
        new TestStage('userA', 'getLockOwnerForFinalCheck'),
        new TestStage('userB', 'getLockOwnerForFinalCheck'),
        new TestStage('userB', 'getLockOwnerForStatusCheck')
      ],
      new TestExpectation(
        [
          new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Lock is currently held by owner userB, wait for '),
          new TestOwnerExpectation('userB', LockResultEnum.Acquired)
        ])
    );

    public static readonly twoUsersButUserBAcquiresLockBeforeUserAInitialCheck = new TestConfig(
      'Race condition between 2 users making calls at the same time but userB wins at first check',
      'SomeBucket',
      'SomeKey', 
      new InitialState(LockOwner.NO_LOCK),
      [
        new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userB', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userB', 'getLockOwnerForInitialCheck'),
        new TestStage('userB', 'setLockOwnerForMainAcquire'),
        new TestStage('userA', 'getLockOwnerForInitialCheck'),
        new TestStage('userB', 'getLockCounter'),
        new TestStage('userB', 'setLockCounter'),
        new TestStage('userB', 'getLockOwnerForFinalCheck'),
        new TestStage('userB', 'getLockOwnerForStatusCheck')
      ],
      new TestExpectation(
        [
          new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Lock is currently held by owner userB, wait for '),
          new TestOwnerExpectation('userB', LockResultEnum.Acquired)
        ])
    );


    public static readonly twoUsersUserAAcquiredLockButUserBHasOldCounterValue = new TestConfig(
      'Race condition between 2 users making calls at the same time but userB has an old counter value',
      'SomeBucket',
      'SomeKey', 
      new InitialState(LockOwner.NO_LOCK),
      [
        new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userB', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userA', 'getLockOwnerForInitialCheck'),
        new TestStage('userB', 'getLockOwnerForInitialCheck'),
        new TestStage('userB', 'setLockOwnerForMainAcquire'),
        new TestStage('userA', 'setLockOwnerForMainAcquire'),
        new TestStage('userA', 'getLockCounter'),
        new TestStage('userB', 'getLockCounter', Promise.resolve(0)),
        new TestStage('userA', 'setLockCounter'),
        new TestStage('userA', 'getLockOwnerForFinalCheck'),
        new TestStage('userB', 'getLockOwnerForLockRollback'),
        new TestStage('userA', 'getLockOwnerForStatusCheck'),
        new TestStage('userB', 'setLockOwnerForLockRollback')
      ],
      new TestExpectation(
        [
          new TestOwnerExpectation('userA', LockResultEnum.Acquired),
          new TestOwnerExpectation('userB', LockResultEnum.NotAcquired, 'Lock error: There is another attempting to acquire the lock at the same time. Please retry.')
        ])
    );

    public static readonly twoUsersUserBAcquiredLockButUserBHasOldCounterValueAndRollsBackBeforeUserAFinalCheck = new TestConfig(
      'Race condition between 2 users making calls at the same time but userB has an old counter value, userB rolls back lock before userA does final check',
      'SomeBucket',
      'SomeKey', 
      new InitialState(LockOwner.NO_LOCK),
      [
        new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userB', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userA', 'getLockOwnerForInitialCheck'),
        new TestStage('userB', 'getLockOwnerForInitialCheck'),
        new TestStage('userA', 'setLockOwnerForMainAcquire'),
        new TestStage('userB', 'setLockOwnerForMainAcquire'),
        new TestStage('userA', 'getLockCounter'),
        new TestStage('userB', 'getLockCounter', Promise.resolve(0)),
        new TestStage('userA', 'setLockCounter'),
        new TestStage('userB', 'getLockOwnerForLockRollback'),
        new TestStage('userB', 'setLockOwnerForLockRollback'),
        new TestStage('userA', 'getLockOwnerForFinalCheck')
      ],
      new TestExpectation(
        [
          new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Lock is not currently held by anyone but should be. Please retry.'),
          new TestOwnerExpectation('userB', LockResultEnum.NotAcquired, 'Lock error: There is another attempting to acquire the lock at the same time. Please retry.')
        ])
    );

    public static readonly twoUsersUserBAcquiredLockButUserBHasOldCounterValueAndRollsBackAfterUserAFinalCheck = new TestConfig(
      'Race condition between 2 users making calls at the same time but userB has an old counter value, userB rolls back lock after userA does final check',
      'SomeBucket',
      'SomeKey', 
      new InitialState(LockOwner.NO_LOCK),
      [
        new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userB', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userA', 'getLockOwnerForInitialCheck'),
        new TestStage('userB', 'getLockOwnerForInitialCheck'),
        new TestStage('userA', 'setLockOwnerForMainAcquire'),
        new TestStage('userB', 'setLockOwnerForMainAcquire'),
        new TestStage('userA', 'getLockCounter'),
        new TestStage('userB', 'getLockCounter', Promise.resolve(0)),
        new TestStage('userA', 'setLockCounter'),
        new TestStage('userA', 'getLockOwnerForFinalCheck'),
        new TestStage('userB', 'getLockOwnerForLockRollback'),
        new TestStage('userB', 'setLockOwnerForLockRollback')
      ],
      new TestExpectation(
        [
          new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Lock is currently held by owner userB, wait for'),
          new TestOwnerExpectation('userB', LockResultEnum.NotAcquired, 'Lock error: There is another attempting to acquire the lock at the same time. Please retry.')
        ])
    );

    public static readonly threeUsersMakingcallsInLockStep = new TestConfig(
      'Race condition between 3 users making calls at the same time should result in only one used getting the lock',
      'SomeBucket',
      'SomeKey', 
      new InitialState(LockOwner.NO_LOCK),
      [
        new TestStage('userA', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userB', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userC', 'getInitialLockCounter', Promise.resolve(1)),
        new TestStage('userA', 'getLockOwnerForInitialCheck'),
        new TestStage('userB', 'getLockOwnerForInitialCheck'),
        new TestStage('userC', 'getLockOwnerForInitialCheck'),
        new TestStage('userA', 'setLockOwnerForMainAcquire'),
        new TestStage('userB', 'setLockOwnerForMainAcquire'),
        new TestStage('userC', 'setLockOwnerForMainAcquire'),
        new TestStage('userA', 'getLockCounter'),
        new TestStage('userB', 'getLockCounter'),
        new TestStage('userC', 'getLockCounter'),
        new TestStage('userA', 'setLockCounter'),
        new TestStage('userB', 'setLockCounter'),
        new TestStage('userC', 'setLockCounter'),
        new TestStage('userA', 'getLockOwnerForFinalCheck'),
        new TestStage('userB', 'getLockOwnerForFinalCheck'),
        new TestStage('userC', 'getLockOwnerForFinalCheck'),
        new TestStage('userC', 'getLockOwnerForStatusCheck')
      ],
      new TestExpectation(
        [
          new TestOwnerExpectation('userA', LockResultEnum.NotAcquired, 'Lock error: Lock is currently held by owner userC, wait for '),
          new TestOwnerExpectation('userB', LockResultEnum.NotAcquired, 'Lock error: Lock is currently held by owner userC, wait for '),
          new TestOwnerExpectation('userC', LockResultEnum.Acquired)
        ])
    );
}
