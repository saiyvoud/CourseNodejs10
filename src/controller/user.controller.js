import { ValidateData } from "../service/validate.js";
import connected from "../config/db_mysql.js";
import { v4 as uuidv4 } from 'uuid';
import { Role } from "../service/message.js";
// es class
export default class UserController {
  static login() {}
  static async register(req, res) {
    try {
      const { username, email, phoneNumber, password } = req.body; 
      const validate = await ValidateData({username,email,phoneNumber,password});
      if(validate.length > 0){
        return res.status(400).json({success: false,messsage: "Please Input:" + validate.join(",")})
      }
      const uuid = uuidv4();
     const mysql = "Insert into user (uuid,username,email,phoneNumber,password,role,createdAt,updatedAt) Values (?,?,?,?,?,?,?,?)";
      const dateTime = new Date().
      toISOString().
      replace(/T/, " ") 
      .replace(/\..+/, "");
     connected.query(mysql,[uuid,username, email, phoneNumber, password,Role.user,dateTime,dateTime],function(err,result){
        if(err) {
            return res.status(400).json({"error": "Error Register",err});
        }
        return res.status(201).json({success: true,messsage: "Register Sucess"});
     })
    } catch (error) {
    return res.status(500).json({success: false,messsage: "Faild Server Internal"})
    }
  }
}
