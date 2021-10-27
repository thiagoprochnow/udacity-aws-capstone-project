import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { generateUploadUrl } from '../../helpers/files'
import { getUserId } from '../utils'
import * as uuid from "uuid";
import { getJWTToken, parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger("file");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const fileId = event.pathParameters.fileId
    // Return a presigned URL to upload a file for a File item with the provided id
    
    const jwtToken = getJWTToken(event);

    const userId = parseUserId(jwtToken);

    const imageId = uuid.v4();

    const signedUrl: String = await generateUploadUrl(
      fileId,
      imageId,
      userId
    );

    logger.info("File UPDATED", {
      // Additional information stored with a log statement
      key: fileId,
      userId: userId,
      date: new Date().toISOString,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: signedUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
