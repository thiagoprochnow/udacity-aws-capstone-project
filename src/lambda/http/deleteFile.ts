import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteFile } from '../../helpers/files'
import { getUserId } from '../utils'
import { getJWTToken, parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger("file");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const fileId = event.pathParameters.fileId
    // Remove a File item by id
    const jwtToken = getJWTToken(event)
    const userId = parseUserId(jwtToken);
    await deleteFile(fileId, userId)

    logger.info("File DELETED", {
      // Additional information stored with a log statement
      key: fileId,
      userId: userId,
      date: new Date().toISOString,
    });

    return {
      statusCode: 202,
      body: ""
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
