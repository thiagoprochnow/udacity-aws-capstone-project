import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateFileRequest } from '../../requests/CreateFileRequest'
import { getUserId } from '../utils';
import { createFile } from '../../helpers/files'
import { File } from '../../models/File'
import * as uuid from "uuid";
import { getJWTToken, parseUserId } from '../../auth/utils'
import { createLogger } from "../../utils/logger";
const logger = createLogger("file");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newFile: CreateFileRequest = JSON.parse(event.body)
    const file = newFile as File
    // Creating a new File
    if(Object.keys(file).length < 1 || file.name == ""){
      return {
        statusCode: 400,
        body: "Please fill name field"
      }
    }
    const fileId = uuid.v4();
    const jwtToken = getJWTToken(event)
    const userId = parseUserId(jwtToken);
    const insertedFile = await createFile(file, userId, fileId)

    logger.info("File CREATED", {
      // Additional information stored with a log statement
      key: fileId,
      userId: userId,
      date: new Date().toISOString,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: insertedFile,
      }),
    };
})

handler.use(
  cors({
    credentials: true
  })
)
