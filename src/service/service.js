import CryptoJS from "crypto-js";
import { SCREATKEY } from "../config/config.js";
import jwt from "jsonwebtoken";
export const Decrypts = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const decoded = CryptoJS.AES.decrypt(data, SCREATKEY).toString(
        CryptoJS.enc.Utf8
      );
      resolve(decoded);
    } catch (error) {
      reject(error);
    }
  });
};
export const Encrypts = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const encrypt = CryptoJS.AES.encrypt(data, SCREATKEY).toString();

      resolve(encrypt);
    } catch (error) {
      reject(error);
    }
  });
};

export const GenerateToken = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(data.role);
      const payload = {
        id: data.id,
        role: await Encrypts(data.role),
      };
      console.log(payload);
      const payload_refresh = {
        id: payload.id,
        role: payload.role,
      };
      const token = jwt.sign(payload, SCREATKEY, { expiresIn: "2h" });
      const refreshToken = jwt.sign(payload_refresh, SCREATKEY, {
        expiresIn: "4h",
      });
      let date = new Date();
      let expiresIn = date.setHours(2 + date.getHours());
      resolve({ token, refreshToken,expiresIn });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
