import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop();

    return {
      folder: "rmkzapout/files",
      resource_type: "raw",
      public_id: `${Date.now()}-${file.originalname.replace(`.${ext}`, "")}`,
      format: ext,   // ⭐ this preserves correct extension
    };
  },
});

const parser = multer({ storage });

export default parser;