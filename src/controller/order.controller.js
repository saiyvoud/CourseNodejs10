import UploadImageToCloud from "../config/cloudinarys.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage, StatusOrder } from "../service/message.js";
import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
  SendSuccess,
} from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import {v4 as uuidv4} from "uuid";
export default class OrderController {
  static async selectAll(req, res) {
    try {
      const selectall = "select * from orders";
      connected.query(selectall, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " orders");
        if(!result[0]) return SendError404(res, EMessage.NotFound + " orders");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async selectOne(req, res) {
    try {
      const oUuid = req.params.oUuid;
      const selectOne = "select * from orders where oUuid=?";
      connected.query(selectOne, oUuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " orders", err);
        if (!result[0]) return SendError404(res, EMessage.NotFound + " orders");
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async insert(req, res) {
    try {
      const { totalPrice, user_id } = req.body;
      const validate = await ValidateData({ totalPrice, user_id });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const billQR = req.files;
      if (!billQR) return SendError400(res, EMessage.BadRequest + " billQR");
      const image_url = await UploadImageToCloud(billQR.billQR.data);
      if (!image_url)
        return SendError400(res, EMessage.UploadImageError + " billQR");
      const oUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");

      const insert = `insert into orders (oUuid,totalPrice,billQR,user_id,status,createdAt,updatedAt) 
                values (?,?,?,?,?,?,?)`;
      connected.query(
        insert,
        [
          oUuid,
          totalPrice,
          image_url,
          user_id,
          StatusOrder.padding,
          datetime,
          datetime,
        ],
        (err) => {
          if (err) return SendError400(res, EMessage.InsertError, err);
          return SendCreate(res, SMessage.Insert);
        }
      );
    } catch (error) {
      console.log(error);
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async updateOrderStatus(req, res) {
    try {
      const oUuid = req.params.oUuid;
      const { status } = req.body;
      if (!status) return SendError400(res, EMessage.BadRequest + " status");
      const check = Object.values(StatusOrder); // ok
      if (!check.includes(status))
        return SendError400(res, EMessage.BadRequest + " status not match");
      
       
      const checkOUuid = "select * from orders where oUuid=?";
      const datetime = new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
      connected.query(checkOUuid, oUuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " orders", err);
        if (!result[0]) return SendError404(res, EMessage.NotFound + " orders");
        const update = "update orders set status=? , updatedAt=? where oUuid =?";
        connected.query(update, [status, datetime,oUuid], (error) => {
          if (error) return SendError400(res, EMessage.InsertError, err);
          return SendSuccess(res, SMessage.Update);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async deleteOrder(req, res) {
    try {
      const oUuid = req.params.oUuid;
      const checkOrder = "select * from orders where oUuid=?";
      connected.query(checkOrder, oUuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " orders");
        if (!result[0]) return SendError404(res, EMessage.NotFound + " orders");
        const deleteOrder = "delete from orders where oUuid=?";
        connected.query(deleteOrder, result[0]["oUuid"], (error) => {
          if (error) return SendError400(res, EMessage.DeleteError, error);
          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
}
