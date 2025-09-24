import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadWithLogging = (fieldName: string) => {
  return (req: any, res: any, next: any) => {
    console.log(`Middleware Upload: Mencari file di field '${fieldName}'...`);

    upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        console.error("Middleware Upload: Error dari multer:", err);
        return next(err);
      }
      console.log(
        "Middleware Upload: Selesai. req.file adalah:",
        req.file ? "DITEMUKAN" : "TIDAK DITEMUKAN (null)"
      );
      next();
    });
  };
};

export default uploadWithLogging;
