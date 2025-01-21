import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

// 定义允许的文件类型
const ALLOWED_FILE_TYPES = {
  // Document types
  '.md': ['text/markdown', 'text/plain', 'text/x-markdown', 'application/octet-stream'],
  '.doc': ['application/msword', 'application/octet-stream'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream'
  ],
  '.pdf': ['application/pdf', 'application/octet-stream'],
  '.xls': ['application/vnd.ms-excel', 'application/octet-stream'],
  '.xlsx': [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream'
  ],
  // Image types
  '.jpg': ['image/jpeg', 'image/pjpeg', 'application/octet-stream'],
  '.jpeg': ['image/jpeg', 'image/pjpeg', 'application/octet-stream'],
  '.png': ['image/png', 'application/octet-stream'],
  '.gif': ['image/gif', 'application/octet-stream'],
  '.webp': ['image/webp', 'application/octet-stream'],
  // Video types
  '.mp4': ['video/mp4', 'application/octet-stream'],
  '.webm': ['video/webm', 'application/octet-stream'],
  '.avi': ['video/x-msvideo', 'application/octet-stream'],
  '.mov': ['video/quicktime', 'application/octet-stream'],
  // Audio types
  '.mp3': ['audio/mpeg', 'application/octet-stream'],
  '.wav': ['audio/wav', 'application/octet-stream'],
  '.ogg': ['audio/ogg', 'application/octet-stream'],
  '.m4a': ['audio/mp4', 'application/octet-stream']
};

export const documentFileFilter = (req: any, file: any, callback: any) => {
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_FILE_TYPES[ext]) {
    return callback(
      new HttpException(
        'Only documents (markdown, Word, PDF, Excel) and media files (images, videos, audio) are allowed!',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  
  console.log('File MIME type:', file.mimetype); 
  
  console.log('File extension:', ext);
  
  // 验证文件的 MIME 类型
  if (!ALLOWED_FILE_TYPES[ext].includes(file.mimetype)) {
    return callback(
      new HttpException(
        `Invalid file type. Expected one of [${ALLOWED_FILE_TYPES[ext].join(', ')}] for ${ext} files, but got ${file.mimetype}`,
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  
  callback(null, true);
};

export const editFileName = (req: any, file: any, callback: any) => {
  const fileExtName = extname(file.originalname).toLowerCase();
  // 使用 Buffer 处理中文文件名
  const nameWithoutExt = Buffer.from(file.originalname, 'latin1').toString('utf8')
    .replace(extname(file.originalname), '');
  const timestamp = Date.now();
  // 生成文件名：原始文件名(UTF-8编码) + 时间戳 + 扩展名
  const newFileName = `${nameWithoutExt}-${timestamp}${fileExtName}`;
  callback(null, newFileName);
};
