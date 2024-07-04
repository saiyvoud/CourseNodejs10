import { join } from "path";
import connected from "../config/db_mysql";
import { EMessage, SMessage } from "../service/message";
import { SendCreate, SendError400, SendError404, SendError500 } from "../service/response";
import { ValidateData } from "../service/validate.js";
import {v4 as uuidv4} from "uuid";
export default class OrderDetailController {
  static async insert(req, res) {
    try {
      const { orders_id, product_id, amount, total } = req.body;
      const validate = await ValidateData({orders_id,product_id,amount,total});
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate + join(","));
      }
      const checkProduct  = "select * from product where pUuid=?";
      const ordUuid = uuidv4(); const datetime = new Date().toISOString() 
      .replace(/T/, " ")
      .replace(/\..+/, "");
      connected.query(checkProduct,product_id,(errProduct,products)=>{
        if(errProduct) return SendError404(res,EMessage.NotFound + " product");
        if(!products[0]) return SendError404(res,EMessage.NotFound + " product");
        const checkOrder = "select * from orders where oUuid=?";
        connected.query(checkOrder,orders_id,(errOrder,orders)=>{
            if(errOrder) return SendError404(res,EMessage.NotFound + " order");
            if(!orders[0]) return SendError404(res,EMessage.NotFound + " order");
            const insert = `insert into orders (ordUuid,orders_id,product_id,amount,
            total,createdAt,updatedAt)
             values (?,?,?,?,?,?,?)`
           connected.query(insert , [ordUuid,orders_id, product_id, amount, total,datetime,datetime,],(err)=>{
            if(err) return SendError404(res,EMessage.InsertError,err);
            return SendCreate(res,SMessage.Insert);
           })
        })
      })
    } catch (error) {
        return SendError500(res,EMessage.Server,error);
    }
  }
}
