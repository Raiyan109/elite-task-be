interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    path?: string;
}

interface MulterRequest extends Request {
    files?: {
        [fieldname: string]: MulterFile[];
    };
}