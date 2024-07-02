import UploadImageToCloud from "../config/cloudinarys.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
  SendSuccess,
} from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
export default class BannerController {
  static async selectAll(req, res) {
    try {
      const selectall = "select * from banner";
      connected.query(selectall, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " banner");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async selectOne (req,res){
    try {
        const bUuid = req.params.bUuid;
        const selectOne = "select * from banner where bUuid=?";
        connected.query(selectOne,bUuid,(err,result)=>{
            if(err) return SendError404(res,EMessage.NotFound + " banner",err);
            if(!result[0]) return SendError404(res,EMessage.NotFound + " banner");
            return SendSuccess(res,SMessage.SelectOne,result[0]);
        })
    } catch (error) {
        return SendError500(res, EMessage.Server, error);
    }
  }
  static async insert(req, res) {
    try {
      const { title, detail } = req.body;
      const validate = await ValidateData({ title, detail });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const image = req.files;
      if (!image) return SendError400(res, EMessage.BadRequest + " Image");
      console.log(image.image);
      const bUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const image_url = await UploadImageToCloud(image.image.data);
      if (!image_url) return SendError400(res, EMessage.UploadImageError);
      const insert =
        "insert into banner (bUuid,title,detail,image,createdAt,updatedAt) value (?,?,?,?,?,?)";
      connected.query(
        insert,
        [bUuid, title, detail, image_url, datetime, datetime],
        (err) => {
          if (err) return SendError400(res, EMessage.InsertError, err);
          return SendCreate(res, SMessage.Insert);
        }
      );
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async updateBanner (req,res){
    try {
        const bUuid = req.params.bUuid;
        const checkBanner = "select * from banner where bUuid=?";
        const {title ,detail} = req.body;
        const validate = await ValidateData({title,detail});
        if(validate.length>0){
            return SendError400(res,EMessage.PleaseInput + validate.join(","));
        }
        const image = req.files;
        if(!image) return SendError400(res,EMessage.BadRequest + " image");
        const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      connected.query(checkBanner,bUuid, async (err,result)=>{
        if(err) return SendError404(res,EMessage.NotFound + " banner",err)
        const image_url = await UploadImageToCloud(image.image.data);
        if(!image_url) return SendError400(res,EMessage.UploadImageError);
        const updated = "update banner set title=? , detail=? , image=? , updatedAt=? where bUuid=?";
        connected.query(updated,[title,detail,image_url,datetime,bUuid],(error)=>{
            if(error) return SendError404(res,EMessage.UpdateError,error);
            return SendSuccess(res,SMessage.Update);
        })
      })
    } catch (error) {
        return SendError500(res,EMessage.Server,error);
    }
  }
  static async deleteBanner (req,res){
    try {
        const bUuid = req.params.bUuid;
       const checkBanner = "select * from banner where bUuid=?";
       connected.query(checkBanner,bUuid,(err,result)=>{
        if(err) return SendError404(res,EMessage.NotFound+ " banner");
        if(!result[0]) return SendError404(res,EMessage.NotFound+ " banner");
        const deleteBanner = "delete from banner where bUuid=?";
        connected.query(deleteBanner,result[0]['bUuid'],(error)=>{
            if(error) return SendError400(res,EMessage.DeleteError,error);
            return SendSuccess(res,SMessage.Delete);
        }) 
       })
    } catch (error) {
        return SendError500(res,EMessage.Server,error);
    }
  }
}
