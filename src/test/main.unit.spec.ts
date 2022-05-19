import * as assert from 'assert';
import * as sinon from 'sinon';
import LockOwner from '../LockOwner';
import LockRequestResult from '../LockRequestResult';
import LockResultEnum from '../LockResultEnum';
import S3Lock from '../S3Lock';
import IDictionary from './IDIctionary';
import TestConfig from './TestConfig';
import TestScenarioLibrary from './TestScenarioLibrary';

let s3Lock: S3Lock;
let testResults: IDictionary<LockRequestResult>;
let clock: sinon.SinonFakeTimers

const testCases = [
  TestScenarioLibrary.singleUserAcquireLock,
  TestScenarioLibrary.singleUserAcquireLockOnPreviouslyExpiredLock,
  TestScenarioLibrary.singleUserAcquireLockThenRelease,
  TestScenarioLibrary.singleUserWithSlowButAcceptableNetwork,
  TestScenarioLibrary.singleUserWithSlowAndUnacceptableNetwork,
  TestScenarioLibrary.singleUserNetworkFailureOnGetInitialLockCounter,
  TestScenarioLibrary.singleUserNetworkFailureOnInitialCheck,
  TestScenarioLibrary.singleUserNetworkFailureOnSetMainAcquireCall,
  TestScenarioLibrary.singleUserNetworkFailureOnGetLockCounter,
  TestScenarioLibrary.singleUserNetworkFailureOnSetLockCounter,
  TestScenarioLibrary.singleUserNetworkFailureOnFinalLockOwnerCheck,
  TestScenarioLibrary.singleUserNetworkFailureOnGetOwnerForLockRollback,
  TestScenarioLibrary.singleUserNetworkFailureOnSetOwnerForLockRollback,
  TestScenarioLibrary.twoUsersMakingCallsInLockStep,
  TestScenarioLibrary.twoUsersButUserBAcquiresLockBeforeUserAInitialCheck,
  TestScenarioLibrary.twoUsersUserAAcquiredLockButUserBHasOldCounterValue,
  TestScenarioLibrary.twoUsersUserBAcquiredLockButUserBHasOldCounterValueAndRollsBackBeforeUserAFinalCheck,
  TestScenarioLibrary.twoUsersUserBAcquiredLockButUserBHasOldCounterValueAndRollsBackAfterUserAFinalCheck,
  TestScenarioLibrary.threeUsersMakingcallsInLockStep
];

testCases.forEach((testConfig: TestConfig) => {
  describe(`UNIT TEST: Given the locks are configured for AWS S3 bucket "${testConfig.bucketName}" and folder "${testConfig.bucketLockFolder}"`, () => {
    beforeEach(() => {
      clock = sinon.useFakeTimers(TestScenarioLibrary.testStartTime);
      testConfig.reset(clock);
      testResults = {};
      s3Lock = new S3Lock(testConfig.bucketName, testConfig.bucketLockFolder, 'testContext', 2, testConfig.lockStageContainer);
    });

    afterEach(() => {
      clock.restore();
    });

    describe(`When the lock is attempted to be acquired using scenario: ${testConfig.testScenarioName}`, () => {
      beforeEach(async () => {
        // Run the test here
        return Promise.all(testConfig.testExpectation.ownerExpectations.map(async (ownerExpectation) => {
          try {
            testResults[ownerExpectation.ownerName] = await s3Lock.acquireLock(ownerExpectation.ownerName);
          }
          catch (err) {
            testResults[ownerExpectation.ownerName] = new LockRequestResult(ownerExpectation.ownerName, LockResultEnum.NotAcquired, err.message);
          }
          return testResults[ownerExpectation.ownerName];
        }));
      });
      testConfig.testExpectation.ownerExpectations.forEach((ownerExpectation) => {
        if (ownerExpectation.isExpectedToAcquireTheLock) {
          it(`Then the lock for owner ${ownerExpectation.ownerName} should be ${ownerExpectation.expectedLockResult}`, async () => {
            assert.ok(testResults[ownerExpectation.ownerName].succeeded);
            const status = await s3Lock.getLockStatus(ownerExpectation.ownerName);
            assert.equal(status.lockOwnerName, ownerExpectation.ownerName);
          });
        }
        else { // if (ownerExpectation.isExpectedNotToAcquireTheLock) ...
          if (ownerExpectation.exceptionExpected) {
            it(`Then call to acquire the lock should thrown an exception with the error message: "${ownerExpectation.errorMessage}"`, () => {
              const errorMessage = testResults[ownerExpectation.ownerName].errorMessage;
              const hasErrorMessage = !!errorMessage;
              assert.ok(hasErrorMessage && errorMessage.startsWith(ownerExpectation.errorMessage as string), `Error message "${errorMessage}" does not start with "${ownerExpectation.errorMessage}"`);
            });
          }
          else {
            it(`Then the lock for owner ${ownerExpectation.ownerName} should not be acquired and the user should have the error message: "${ownerExpectation.errorMessage}"`, () => {
              assert.ok(testResults[ownerExpectation.ownerName].failed);
              const errorMessage = testResults[ownerExpectation.ownerName].errorMessage;
              const hasErrorMessage = !!errorMessage;
              assert.ok(hasErrorMessage && errorMessage.startsWith(ownerExpectation.errorMessage as string), `Error message "${errorMessage}" does not start with "${ownerExpectation.errorMessage}"`);
            });
          }
        }
        if (ownerExpectation.isExpectedToHaveLockReleased) {
          describe(`When the lock is attempted to be released`, async () => {
            beforeEach(async () => {
              await s3Lock.getLockStatus(ownerExpectation.ownerName);
              await s3Lock.releaseLock(ownerExpectation.ownerName);
            });
            it(`Then the lock should have been sucessfully released`, () => {
              const currentlockOwner = testConfig.lockStageContainer.getTestLockOwner();
              assert.ok(LockOwner.isNoLockOwner(currentlockOwner));
            });
          });
        }
      });
    });
  });
});
