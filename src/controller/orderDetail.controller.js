import { join } from "path";
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
export default class OrderDetailController {
  static async selectAll(req, res) {
    try {
      const selectall = `select order_detail.ordID,order_detail.ordUuid,order_detail.orders_id,
      product.name,product.price,product.image , 
      order_detail.amount,order_detail.total,order_detail.createdAt,
      order_detail.updatedAt from order_detail
      INNER JOIN product ON order_detail.product_id = pUuid
      INNER JOIN orders ON order_detail.orders_id = oUuid
      `;
      connected.query(selectall, (err, result) => {
        if (err)
          return SendError404(res, EMessage.NotFound + " order_detail", err);
        if (!result[0]) SendError404(res, EMessage.NotFound + " order_detail");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async selectOne(req, res) {
    try {
      const ordUuid = req.params.ordUuid;
      const selectOne = "Select * from order_detail where ordUuid=?";
      connected.query(selectOne, ordUuid, (err, result) => {
        if (err)
          return SendError404(res, EMessage.NotFound + " order detail", err);
        if (!result[0])
          return SendError404(res, EMessage.NotFound + " order detail");
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async selectBy(req, res) {
    try {
      const orders_id = req.params.orders_id;
      const select = "select * from order_detail where orders_id = ?";
      connected.query(select, orders_id, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " order", err);
        if (!result[0]) return SendError404(res, EMessage.NotFound + " order");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async insert(req, res) {
    try {
      const { orders_id, product_id, amount, total } = req.body;
      const validate = await ValidateData({
        orders_id,
        product_id,
        amount,
        total,
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate + join(","));
      }
      const checkProduct = "select * from product where pUuid=?";
      const ordUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      connected.query(checkProduct, product_id, (errProduct, products) => {
        if (errProduct)
          return SendError404(res, EMessage.NotFound + " product");
        if (!products[0])
          return SendError404(res, EMessage.NotFound + " product");
        const checkOrder = "select * from orders where oUuid=?";
        connected.query(checkOrder, orders_id, (errOrder, orders) => {
          if (errOrder) return SendError404(res, EMessage.NotFound + " order");
          if (!orders[0])
            return SendError404(res, EMessage.NotFound + " order");
          const insert = `insert into order_detail (ordUuid,orders_id,product_id,amount,
            total,createdAt,updatedAt)
             values (?,?,?,?,?,?,?)`;
          connected.query(
            insert,
            [ordUuid, orders_id, product_id, amount, total, datetime, datetime],
            (err) => {
              if (err) return SendError404(res, EMessage.InsertError, err);
              return SendCreate(res, SMessage.Insert);
            }
          );
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
}
