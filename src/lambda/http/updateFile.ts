import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateFile } from '../../helpers/files'
import { UpdateFileRequest } from '../../requests/UpdateFileRequest'
import { getUserId } from '../utils'
import { getJWTToken, parseUserId } from '../../auth/utils'
import { FileUpdate } from '../../models/FileUpdate'
import { createLogger } from '../../utils/logger'
const logger = createLogger("file");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const fileId = event.pathParameters.fileId
    const updatedFile: UpdateFileRequest = JSON.parse(event.body)
    const updatedItem = updatedFile as FileUpdate
    // Update a File item with the provided id using values in the "updateFile" object
    const jwtToken = getJWTToken(event)
    const userId = parseUserId(jwtToken);
    await updateFile(updatedItem, fileId, userId)


    return {
      statusCode: 202,
      body: ""
    };
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
