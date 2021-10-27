import { FilesAccess } from './filesAcess'
import { AttachmentUtils } from './attachmentUtils';
import { File } from '../models/File'
import { CreateFileRequest } from '../requests/CreateFileRequest'
import { UpdateFileRequest } from '../requests/UpdateFileRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { FileUpdate } from '../models/FileUpdate';

const fileAccess = new FilesAccess()

// Implement businessLogic
export async function createFile(file: File, userId: string, fileId: string): Promise<File> {
  return fileAccess.createFile(file, userId, fileId)
}

export async function getFiles(userId: string): Promise<File[]> {
  return fileAccess.getFiles(userId)
}

export async function getFileById(fileId: string, userId: string): Promise<File[]> {
  return fileAccess.getFileById(fileId, userId)
}

export async function deleteFile(fileId: string, userId: string) {
  return fileAccess.deleteFile(fileId, userId)
}

export async function updateFile(newFile: FileUpdate, fileId: string, userId: string) {
  return fileAccess.updateFile(newFile, fileId, userId)
}

export async function generateUploadUrl(fileId: string, imageId: string, userId: string): Promise<string> {
  return fileAccess.generateUploadUrl(fileId, imageId, userId)
}
