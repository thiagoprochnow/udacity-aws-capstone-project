import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getFileById } from '../../helpers/files'
import { getUserId } from '../utils';
import { getJWTToken, parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger("file");

// Get all Files items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const fileId = event.pathParameters.fileId

    logger.info("Entered 1");

    if(fileId == "" || fileId == undefined){
      return {
        statusCode: 400,
        body: "Missing File ID"
      }
    }

    const jwtToken = getJWTToken(event)
    const userId = parseUserId(jwtToken);
    logger.info("Entered 2");
    const files = await getFileById(fileId, userId)
    logger.info("Entered 3");

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
