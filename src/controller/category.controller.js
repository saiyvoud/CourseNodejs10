import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
  SendSuccess,
} from "../service/response.js";
import { EMessage, SMessage } from "../service/message.js";
import connected from "../config/db_mysql.js";
import { v4 as uuidv4 } from "uuid";
export default class CategoryController {
  static async selectAll(req, res) {
    try {
      const select = "Select * from category";
      connected.query(select, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async selectOne(req, res) {
    try {
      const cUuid = req.params.cUuid;
      const check = "select * from category where cUuid=?";
      connected.query(check, cUuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " category",err);
        if(!result[0]) return SendError404(res, EMessage.NotFound + " category");
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async insert(req, res) {
    try {
      const { title } = req.body;
      if (!title) {
        return SendError400(res, EMessage.BadRequest + " title");
      }
      const cUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");

      const mysql =
        "insert into category (cUuid,title,createdAt,updatedAt) values (?,?,?,?)";
      connected.query(mysql, [cUuid, title, datetime, datetime], (err) => {
        if (err) return SendError400(res, EMessage.InsertError, err);
        return SendCreate(res, SMessage.Insert);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async updateCategory(req, res) {
    try {
      const cUuid = req.params.cUuid;
      const check = "select * from category where cUuid = ?";
      const { title } = req.body;
      if (!title) return SendError400(res, EMessage.BadRequest + " title");
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      connected.query(check, cUuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " category");
        if(!result[0]) return SendError404(res, EMessage.NotFound + " category");
        const update =
          "update category set title=? , updatedAt=? where cUuid=?";
        connected.query(
          update,
          [title, datetime, result[0]["cUuid"]],
          (error) => {
            if (error) return SendError400(res, EMessage.UpdateError, error);
            return SendSuccess(res, SMessage.Update);
          }
        );
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async deleteCategory(req, res) {
    try {
      const cUuid = req.params.cUuid;
      const check = "select * from category where cUuid = ?";
      connected.query(check, cUuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " Category");
        if(!result[0]) return SendError404(res, EMessage.NotFound + " category");
        const deleteCategory = "Delete from category where cUuid=?";
        connected.query(deleteCategory, cUuid, (error) => {
          if (error) return SendError400(res, EMessage.DeleteError, error);
          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
}
