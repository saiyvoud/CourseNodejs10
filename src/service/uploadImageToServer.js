import Jimp from "jimp";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UploadImageToServer = async (files, oldImage) => {
  try {
    const imgBuffer = Buffer.from(files, "base64");
    const imgName = "IMG-" + Date.now() + ".png";
    const imgPath = `${__dirname}/../../assets/images/${imgName}`;
    const pngBuffer = await sharp(imgBuffer).toBuffer();
    const image = await Jimp.read(pngBuffer);
    if (!image) {
      return "Error Covert files";
    }
    image.write(imgPath);
    return imgName;
  } catch (error) {
    console.log(error);
    return "";
  }
};
export default UploadImageToServer;