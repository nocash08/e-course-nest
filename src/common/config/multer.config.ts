import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage } from "multer";
import { extname } from "path";

export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(new Error("Only image files are allowed!"), false);
  }
  callback(null, true);
};

export const generateFilename = (req: any, file: any, callback: any) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
};

export const multerOptions = (destination: string): MulterOptions => ({
  storage: diskStorage({
    destination: `./public/${destination}`,
    filename: generateFilename,
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
});
