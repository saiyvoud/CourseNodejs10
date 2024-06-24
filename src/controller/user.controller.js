import { ValidateData } from "../service/validate.js";
import connected from "../config/db_mysql.js";
import { v4 as uuidv4 } from "uuid";
import { EMessage, Role, SMessage } from "../service/message.js";
import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
  SendSuccess,
} from "../service/response.js";
import CryptoJS from "crypto-js";
import {
  Decrypts,
  Encrypts,
  GenerateToken,
  VerifyToken,
} from "../service/service.js";
import { UploadNewImageToCloud } from "../config/cloudinary.js";
// es class
export default class UserController {
  static async selectAll(req, res) {
    try {
      const mysql = "select * from user";
      connected.query(mysql, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async selectOne(req, res) {
    try {
      const uuid = req.params.uuid;
      const checkuser = "select * from user where uuid=?";
      connected.query(checkuser, uuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " user");
        if (!result[0]) return SendError404(res, EMessage.NotFound + " user");
        // const newData = {
        //   ...result[0] -password
        // }
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const validate = await ValidateData({ email, password });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const checkEmail = "select * from user where email=?";
      connected.query(checkEmail, email, async (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound, err);
        if (!result[0]) return SendError404(res, EMessage.NotFound, err);
        const decryptPassword = await Decrypts(result[0]["password"]);
        if (password != decryptPassword) {
          return SendError400(res, "Password not match");
        }
        const data = {
          id: result[0]["uuid"],
          role: result[0]["role"],
        };
        const token = await GenerateToken(data);
        const newData = Object.assign(
          JSON.parse(JSON.stringify(result[0])),
          JSON.parse(JSON.stringify(token))
        );
        return SendSuccess(res, SMessage.Login, newData);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return SendError400(res, EMessage.BadRequest + " refreshToken");
      }
      const verifyData = await VerifyToken(refreshToken);
      if (!verifyData) {
        return SendError404(res, EMessage.NotFound);
      }
      const checkUuid = "Select * from user where uuid=?";
      connected.query(checkUuid, verifyData, async (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound);
        const data = {
          id: verifyData,
          role: result[0]["role"],
        };
        const token = await GenerateToken(data);
        if (!token) return SendError500(res, EMessage.UpdateError);
        return SendSuccess(res, SMessage.Update, token);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async register(req, res) {
    try {
      const { username, email, phoneNumber, password } = req.body;
      const validate = await ValidateData({
        username,
        email,
        phoneNumber,
        password,
      });
      if (validate.length > 0) {
        return SendError400(res, "Please Input: " + validate.join(","));
      }
      const uuid = uuidv4();
      const mysql =
        "Insert into user (uuid,username,email,phoneNumber,password,role,createdAt,updatedAt) Values (?,?,?,?,?,?,?,?)";

      const generatePassword = CryptoJS.AES.encrypt(
        password,
        "Nodejs10"
      ).toString();
      const dateTime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      connected.query(
        mysql,
        [
          uuid,
          username,
          email,
          phoneNumber,
          generatePassword,
          Role.user,
          dateTime,
          dateTime,
        ],
        function (err, result) {
          if (err) return SendError400(res, "Error Register", err);
          return SendCreate(res, "Register Success");
        }
      );
    } catch (error) {
      return SendError500(res, "Error Server Internal", error);
    }
  }
  static async updatePassword(req, res) {
    try {
      const uuid = req.params.uuid;
      const { oldPassword, newPassword } = req.body;
      const validate = await ValidateData({ oldPassword, newPassword });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const checkUuid = "select * from user where uuid =?";
      connected.query(checkUuid, uuid, async (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + "uuid");
        const decryptPassword = await Decrypts(result[0]["password"]);
        if (oldPassword != decryptPassword) {
          return SendError400(res, EMessage.NotMatch);
        }
        const generatePassword = await Encrypts(newPassword);
        const update = "update user set password=? where uuid=?";
        connected.query(update, [generatePassword, uuid], (error) => {
          if (error) return SendError404(res, EMessage.UpdateError, error);
          return SendSuccess(res, SMessage.Update);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async forgotPassword(req, res) {
    try {
      const { email, password } = req.body;
      const validate = await ValidateData({ email, password });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const checkEmail = "select * from user where email=?";
      connected.query(checkEmail, email, async (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " Email");
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " Email");
        }

        const forgot = "update user set password=? where uuid=?";

        const generatePassword = await Encrypts(password);

        connected.query(
          forgot,
          [generatePassword, result[0]["uuid"]],
          (error, data) => {
            if (error) return SendError404(res, EMessage.UpdateError, error);

            return SendSuccess(res, SMessage.Update);
          }
        );
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async updateProfile(req, res) {
    try {
      const uuid = req.params.uuid;
      const image = req.files;
      if (!image) return SendError400(res, EMessage.BadRequest + "image");
      const check = "select * from user where uuid=?";
      connected.query(check, uuid, async (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " user");
        const image_url = await UploadNewImageToCloud(image.profile.data);
        if (!image_url) return SendError400(res, EMessage.UploadImageError);
        const update = "update user set profile=? where uuid=?";
        connected.query(update, [image_url, uuid], (error) => {
          if (error) return SendError400(res, EMessage.UpdateError, error);
          return SendSuccess(res, SMessage.Update);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async updateUser(req, res) {
    try {
      const uuid = req.params.uuid;
      const { username, phoneNumber } = req.body;
      const validate = await ValidateData({ username, phoneNumber });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const dateTime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const update =
        "update user set username=? , phoneNumber=?, updatedAt=? where uuid=?";
      connected.query(
        update,
        [username, phoneNumber, dateTime, uuid],
        (err) => {
          if (err) return SendError404(res, EMessage.NotFound + " uuid");
          return SendSuccess(res, SMessage.Update);
        }
      );
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async deleteUser(req, res) {
    try {
      const uuid = req.params.uuid;
      //console.log(uuid);
      const deleteUser = "delete from user where uuid=?";
      const checkUuid = "select * from user where uuid=?";
      connected.query(checkUuid, uuid, (error, result) => {
        if (error) return SendError400(res.EMessage.NotFound + " user");
        if (!result[0]) return SendError404(res, EMessage.NotFound + " user");

        connected.query(deleteUser, uuid, (err) => {
          if (err) return SendError404(res, EMessage.DeleteError, err);

          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
}
