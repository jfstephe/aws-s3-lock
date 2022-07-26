import { AWSError, S3 } from 'aws-sdk';
import s3 = require('aws-sdk/clients/s3');
import { PromiseResult } from 'aws-sdk/lib/request';
import ILockOwnerRaw from './ILockOwnerRaw';
import ILockReadWriter from './ILockReadWriter';
import LockOwner from './LockOwner';
import LockTypeEnum from './LockTypeEnum';

export default class S3LockReadWriter implements ILockReadWriter {
  private _s3: S3;
  /** Always ends with a '/' if set to a value with a length > 0*/
  private readonly _awslockFolder: string;

  constructor(
  private readonly _awsBucketName: string,
  awslockFolder: string,
  private readonly _lockName: string) {
    const isAwslockFolderSet = (awslockFolder ?? '').length > 0;
    this._awslockFolder = isAwslockFolderSet ? (awslockFolder.endsWith('/') ? awslockFolder : `${awslockFolder}/`) : '';
  }

  public init() {
    this._s3 = new S3({
      apiVersion: '2006-03-01',
      endpoint: 's3.amazonaws.com'
    });
  }

  public async getLockOwner(): Promise<LockOwner> {
    const awsGetObjectRequest: s3.GetObjectRequest = this.createGetLockRequest(LockTypeEnum.Owner);
    const bodyAsString: string = await this.getFileContents(awsGetObjectRequest);
    const lockOwnerRaw = bodyAsString ? JSON.parse(bodyAsString) as ILockOwnerRaw : undefined;
    return LockOwner.fromJSON(lockOwnerRaw);
  }

  public async setLockOwner(newLockOwner: LockOwner): Promise<void> {
    let result: Promise<void>;
    const contents: string = JSON.stringify(newLockOwner.toJSON());
    const awsPutObjectRequest: s3.PutObjectRequest = this.createPutLockRequest(LockTypeEnum.Owner, contents);
    try {
      await this._s3.putObject(awsPutObjectRequest).promise();
      result = Promise.resolve();
    }
    catch (err) {
      const awsError: PromiseResult<S3.PutObjectOutput, AWSError> = err as PromiseResult<S3.PutObjectOutput, AWSError>;
      result = Promise.reject((awsError?.$response?.error as AWSError)?.message);
    }
    return result;
  }

  public async getLockCounter(): Promise<number|undefined> {
    const awsGetObjectRequest: s3.GetObjectRequest = this.createGetLockRequest(LockTypeEnum.Counter);
    const bodyAsString: string = await this.getFileContents(awsGetObjectRequest);
    const counter: number|undefined = bodyAsString ? JSON.parse(bodyAsString) as number : undefined;
    return counter;
  }

  public async setLockCounter(newLockCounter: number): Promise<void> {
    let result: Promise<void>;
    const contents: string = newLockCounter + '';
    const awsPutObjectRequest: s3.PutObjectRequest = this.createPutLockRequest(LockTypeEnum.Counter, contents);
    try {
      await this._s3.putObject(awsPutObjectRequest).promise();
      result = Promise.resolve();
    }
    catch (err) {
      const awsError: PromiseResult<S3.PutObjectOutput, AWSError> = err as PromiseResult<S3.PutObjectOutput, AWSError>;
      result = Promise.reject((awsError?.$response?.error as AWSError)?.message);
    }
    return result;
  }

  private createGetLockRequest(lockType: LockTypeEnum): s3.GetObjectRequest {
    const awsGetObjectRequest: s3.GetObjectRequest = {
      Bucket: this._awsBucketName,
      Key: `${this._awslockFolder}${this._lockName}-${lockType}.json`
    };
    return awsGetObjectRequest
  }

  private createPutLockRequest(lockType: string, contents: string): s3.PutObjectRequest {
    const awsPutObjectRequest: s3.PutObjectRequest = {
      Bucket: this._awsBucketName,
      Key: `${this._awslockFolder}${this._lockName}-${lockType}.json`,
      Body: contents
    };
    return awsPutObjectRequest;
  }

  private async getFileContents(awsGetObjectRequest: S3.GetObjectRequest): Promise<string> {
    let contents: string|undefined;
    try {
      const rawS3File = await this._s3.getObject(awsGetObjectRequest).promise();
      contents = rawS3File.Body?.toString() as string;
    }
    catch (err) {
      const error = err as AWSError | Error;
      if ((error as AWSError).code !== 'NoSuchKey') {
        throw err;
      }
    }
    return contents as string;
  }
}
