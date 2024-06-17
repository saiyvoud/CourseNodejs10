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
import { Decrypts, GenerateToken } from "../service/service.js";
// es class
export default class UserController {
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
}
