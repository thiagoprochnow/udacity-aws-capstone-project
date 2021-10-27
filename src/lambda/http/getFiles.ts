import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getFiles } from '../../helpers/files'
import { getUserId } from '../utils';
import { getJWTToken, parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger("file");

// Get all Files items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const jwtToken = getJWTToken(event)
    const userId = parseUserId(jwtToken);
    const files = await getFiles(userId)

    logger.info("File Fetched", {
      // Additional information stored with a log statement
      userId: userId,
      date: new Date().toISOString,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        files: files
      })
    }
})

handler.use(
  cors({
    credentials: true
  })
)
