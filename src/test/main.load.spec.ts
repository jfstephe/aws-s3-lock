import * as assert from 'assert';
import LockOwner from '../LockOwner';
import LockRequestResult from '../LockRequestResult';
import LockResult from '../LockResultEnum';
import S3Lock from '../S3Lock';
import S3LockReadWriter from '../S3LockReadWriter';
import IDictionary from './IDIctionary';

const S3_BUCKET_NAME: string = 's3-lock-integration-test';
const S3_BUCKET_LOCK_FOLDER: string = 'testSubFolder';
const TEST_LOCK_NAME: string = 'testContext';
const OWNER_NAME: string = 'userA';
const CONCURRENT_ATTEMPTS = 5;

let s3Lock: S3Lock = new S3Lock(S3_BUCKET_NAME, S3_BUCKET_LOCK_FOLDER, TEST_LOCK_NAME, 2);
const s3LockReadWriter: S3LockReadWriter = new S3LockReadWriter(S3_BUCKET_NAME, S3_BUCKET_LOCK_FOLDER, TEST_LOCK_NAME);
s3LockReadWriter.init();

let testResults: IDictionary<Promise<LockRequestResult>> = {};

describe(`LOAD TEST: Given the locks are configured for AWS S3 bucket "${S3_BUCKET_NAME}" and folder "${S3_BUCKET_LOCK_FOLDER}"`, () => {
  before(async function() {
    this.timeout(5000);
    // Release the current lock (if any)
    const lockOwner: LockOwner = await s3LockReadWriter.getLockOwner();
    await s3Lock.releaseLock(lockOwner.lockOwnerName);
  });
  describe(`When the lock is attempted to be acquired by ${CONCURRENT_ATTEMPTS}`, () => {
    beforeEach(async function() {
      this.timeout(5000);
      for (let attempt = 0; attempt <= CONCURRENT_ATTEMPTS; attempt++) {
        const ownerName = `${OWNER_NAME}-${attempt}`;
        try {
          testResults[ownerName] = s3Lock.acquireLock(ownerName);
        }
        catch (err) {
          testResults[ownerName] = Promise.resolve<LockRequestResult>(new LockRequestResult(ownerName, LockResult.NotAcquired, err.message));
        }
      }
      return Promise.all(Object.values(testResults));
    });
    it(`Then at most one attempt should have succeeded and incremented the lock counter`, async function() {
      const results = await Promise.all(Object.values(testResults));
      results.forEach((lockRequestResult: LockRequestResult) => {
        console.log(lockRequestResult.toString())
      });
      const suceededRequests = results.filter((lockRequestResult: LockRequestResult) => {
        return lockRequestResult.suceeded;
      });
      if (this.test) {
        // Adds a dynamic report onto the test step.
        this.test.title += ` (${suceededRequests.length} succeeded)`;
      }
      assert.ok(suceededRequests.length <= 1, 'At most one request should succeed');
      if (suceededRequests.length === 1) {
        assert.ok(suceededRequests[0].suceeded);
      }
    });
  });
});
