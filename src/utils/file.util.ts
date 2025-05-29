import * as fs from "fs";
import * as path from "path";

/**
 * Delete file from storage
 * @param filePath relative path from public directory
 * @returns boolean indicating if deletion was successful
 */
export const deleteFile = (filePath: string): boolean => {
  try {
    if (!filePath) {
      console.log("No file path provided");
      return false;
    }

    const normalizedPath = filePath.replace(/^public[/\\]/, "");
    const fullPath = path.join(process.cwd(), "public", normalizedPath);

    console.log("Attempting to delete file at:", fullPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("File successfully deleted");
      return true;
    }

    console.log("File does not exist at path:", fullPath);
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

/**
 * Get full path of file in public directory
 * @param relativePath relative path from public directory
 * @returns full path of file
 */
export const getPublicFilePath = (relativePath: string): string => {
  const normalizedPath = relativePath.replace(/^public[/\\]/, "");
  return path.join(process.cwd(), "public", normalizedPath);
};

/**
 * Check if file exists in public directory
 * @param relativePath relative path from public directory
 * @returns boolean indicating if file exists
 */
export const fileExists = (relativePath: string): boolean => {
  try {
    const normalizedPath = relativePath.replace(/^public[/\\]/, "");
    return fs.existsSync(getPublicFilePath(normalizedPath));
  } catch {
    return false;
  }
};
