import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "docl6igdw",
  api_key: "945332527494631",
  api_secret: "zGxo1lQO009p1EjeJoXWrnfrQuo",
  secure: true,
});

const UploadNewImageToCloud = async (file) => {
  try {
    const base64 = file.toString("base64");
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
const UploadOldImageToCloud = async (file) => {
  try {
    const spliUrl = file.split("/");
    const image_id = spliUrl[spliUrl.length - 1].split(".")[0];
    const url = await cloudinary.v2.uploader.destroy(image_id);
    return url;
  } catch (error) {
    console.log(error);
    return "";
  }
};

export { UploadNewImageToCloud, UploadOldImageToCloud };
