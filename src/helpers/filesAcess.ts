import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { File } from '../models/File'
import { FileUpdate } from '../models/FileUpdate';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)


const logger = createLogger('FilesAccess')

// Implement the dataLayer logic
export class FilesAccess {

  
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly filesTable = process.env.FILE_SHARING_TABLE,
    private readonly fileIndex = process.env.FILE_SHARING_CREATED_AT_INDEX,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly s3 = new XAWS.S3({
      signatureVersion: 'v4'
    })) {
  }
  
  async getFiles(userId: String): Promise<File[]> {
    console.log('Getting all files information')

    const result = await this.docClient.query({
      TableName: this.filesTable,
      IndexName: this.fileIndex,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    }).promise()

    const items = result.Items
    return items as File[]
  }

  async getFileById(fileId: String, userId: String): Promise<File[]> {
    console.log('Getting all files information')

    logger.info("Entered 4");

    const result = await this.docClient.query({
      TableName: this.filesTable,
      IndexName: this.fileIndex,
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "fileId = :fileId",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":fileId": fileId
      },
    }).promise()

    logger.info("Entered 5");

    const file = result.Items
    return file as File[]
  }

  async createFile(file: File, userId: string, fileId: string): Promise<File> {
    const timestamp = new Date().toISOString()
    const newItem = {
      createdAt: timestamp,
      name: file.name,
      userId: userId,
      fileId: fileId
    }

    const result = await this.docClient.put({
      TableName: this.filesTable,
      Item: newItem
    }).promise()

    const item = newItem as File

    return item
  }

  async updateFile(newFile: FileUpdate, fileId: string, userId: string): Promise<void>{

    const params = {
      TableName: this.filesTable,
      Key: {
        userId: userId,
        fileId: fileId
      },
      UpdateExpression: "set #N = :n, #available = :available",
      ExpressionAttributeValues: {
        ":n": newFile.name,
        ":available": newFile.available,
      },
      ExpressionAttributeNames: {
        "#N": "name",
        "#available": "available",
      },
      ReturnValues:"UPDATED_NEW"
    }

    const response = await this.docClient.update(params).promise()
  }

  async deleteFile(fileId: string, userId: string): Promise<void>{
    const params = {
      TableName: this.filesTable,
      Key: {
        userId: userId,
        fileId: fileId
      }
    }

    const response = await this.docClient.delete(params).promise()
  }

  async generateUploadUrl(
    fileId: String,
    imageId: String,
    userId: String
  ): Promise<string> {
    const attachmentUrl = await this.s3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: parseInt(this.urlExpiration),
    });

    this.docClient.update(
      {
        TableName: this.filesTable,
        Key: {
          fileId,
          userId,
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
          ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
        },
      },
      function (err, data) {
        if (err) {
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element updated " + data);
        }
      }
    );
    return attachmentUrl;
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}