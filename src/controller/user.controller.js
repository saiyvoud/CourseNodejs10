import { ValidateData } from "../service/validate.js";
import connected from "../config/db_mysql.js";
import { v4 as uuidv4 } from 'uuid';
import { Role } from "../service/message.js";
import { SendCreate, SendError400, SendError500 } from "../service/response.js";
import CryptoJS from "crypto-js";
// es class
export default class UserController {
  static login() {}
  static async register(req, res) {
    try {
      const { username, email, phoneNumber, password } = req.body; 
      const validate = await ValidateData({username,email,phoneNumber,password});
      if(validate.length > 0){
        return SendError400(res,"Please Input: " + validate.join(","))
      }
      const uuid = uuidv4();
     const mysql = "Insert into user (uuid,username,email,phoneNumber,password,role,createdAt,updatedAt) Values (?,?,?,?,?,?,?,?)";
     
     const generatePassword = CryptoJS.AES.encrypt(password,"Nodejs10").toString();
     const dateTime = new Date().
      toISOString().
      replace(/T/, " ") 
      .replace(/\..+/, "");
     connected.query(mysql,[uuid,username, email, phoneNumber,generatePassword,Role.user,dateTime,dateTime],function(err,result){
        if(err) return SendError400(res,"Error Register",err)
        return SendCreate(res,"Register Success");
     })
    } catch (error) {
    return SendError500(res,"Error Server Internal",error);
    }
  }
}
