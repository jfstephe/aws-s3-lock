import * as assert from 'assert';
import LockOwner from '../LockOwner';
import LockRequestResult from '../LockRequestResult';
import LockResultEnum from '../LockResultEnum';
import S3Lock from '../S3Lock';
import S3LockReadWriter from '../S3LockReadWriter';

const S3_BUCKET_NAME: string = 's3-lock-integration-test';
const S3_BUCKET_LOCK_FOLDER: string = 'testSubFolder';
const TEST_LOCK_NAME: string = 'testContext';
const OWNER_NAME: string = 'userA';

let s3Lock: S3Lock = new S3Lock(S3_BUCKET_NAME, S3_BUCKET_LOCK_FOLDER, TEST_LOCK_NAME, 2);
let lockRequestResult: LockRequestResult;
const s3LockReadWriter: S3LockReadWriter = new S3LockReadWriter(S3_BUCKET_NAME, S3_BUCKET_LOCK_FOLDER, TEST_LOCK_NAME);
s3LockReadWriter.init();

describe(`INTEGRATION TEST: Given the locks are configured for AWS S3 bucket "${S3_BUCKET_NAME}" and folder "${S3_BUCKET_LOCK_FOLDER}"`, () => {
  before(async function() {
    this.timeout(5000);
    // Release the current lock (if any)
    const lockOwner: LockOwner = await s3LockReadWriter.getLockOwner();
    await s3Lock.releaseLock(lockOwner.lockOwnerName);
  });
  describe(`When the lock is attempted to be acquired by ${OWNER_NAME}`, () => {
    beforeEach(async function() {
      this.timeout(5000);
      try {
        lockRequestResult = await s3Lock.acquireLock(OWNER_NAME);
      }
      catch (err) {
        lockRequestResult = new LockRequestResult(OWNER_NAME, LockResultEnum.NotAcquired, err.message);
      }
      //  console.log(lockRequestResult.toString())
      return lockRequestResult;
    });
    it(`Then the lock for owner ${OWNER_NAME} should be ${LockResultEnum.Acquired}`, () => {
      assert.ok(lockRequestResult.succeeded);
    });
    describe(`When the lock is attempted to be released`, () => {
      beforeEach(async function() {
        this.timeout(5000);
        await s3Lock.releaseLock(OWNER_NAME);
      });
      it(`Then the lock should not be acquired by anyone`, async function() {
        this.timeout(5000);
        const lockOwner: LockOwner = await s3LockReadWriter.getLockOwner();
        assert.ok(LockOwner.isNoLockOwner(lockOwner));
      });
    });
  });
});
