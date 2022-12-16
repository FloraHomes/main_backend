import multer from "multer";

function imageUpload() {
  const imageUpload = multer({
    limits: {
      fileSize: 3000000, // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg|jpeg|svg)$/)) {
        return cb(new Error("Please upload a Image"));
      }
      cb(null, file.originalname);
    },
  });
  return imageUpload;
}

export default imageUpload;
