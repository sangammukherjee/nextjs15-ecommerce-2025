import multer from "multer";
import path from "path";

//configure stroage
const stroage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.filename + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an mage! Please upload only images."));
  }
};

export const upload = multer({
  storage: stroage,
  fileFilter: fileFilter,
  limits: { fieldSize: 1024 * 1024 * 5 },
});
