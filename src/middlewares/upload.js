import multer from 'multer';

// memoryStorage kullanıyoruz, çünkü Cloudinary'ye direkt buffer üzerinden yükleyeceğiz
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
