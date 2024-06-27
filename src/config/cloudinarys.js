import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dvp8eh8cx",
  api_key: "228474629168451",
  api_secret: "lyrfSk_zQzgieYsan4xLTQEkjlQ",
  secure: true,
});

const UploadImageToCloud = async (files, oldImage) => {
  try {
    if (oldImage) {
      const spliUrl = files.split("/");
      const image_id = spliUrl[spliUrl.length - 1].split(".")[0];
      await cloudinary.v2.uploader.destroy(image_id);
    }
    const base64 = files.toString("base64");
    const imagePath = "data:image/png;base64," + base64;
    const url = await cloudinary.v2.uploader.upload(imagePath, {
      public_id: "IMG_" + Date.now(),
      resource_type: "auto",
    });
    return url.url;
  } catch (error) {
    console.log(error);
    return "";
  }
};
export default UploadImageToCloud;