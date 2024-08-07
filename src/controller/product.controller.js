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
export default class ProductController {
  static async searchProduct(req, res) {
    try {
      const search = req.query.search;
      if (!search) return SendError400(res, EMessage.BadRequest + " search");
      const check = `SELECT * FROM product WHERE name LIKE '%${search}%'`;
      connected.query(check, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " search");
        if(!result[0]) return SendError404(res, EMessage.NotFound + " search");
        return SendSuccess(res, SMessage.Search, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async selectAll(req, res) {
    try {
      const mysql = `select product.pID,product.pUuid,product.name,product.detail,product.amount,product.price,product.image,category.title,product.createdAt,product.updatedAt
        From product 
        INNER JOIN category ON product.category_id = category.cUuid`;
      connected.query(mysql, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " product");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async selectOne(req, res) {
    try {
      const pUuid = req.params.pUuid;
      const checkProduct = `select product.pID,product.pUuid,product.name,product.detail,product.amount,product.price,product.image,category.title,product.createdAt,product.updatedAt
        From product 
        INNER JOIN category ON product.category_id = category.cUuid Where pUuid=?`;
      connected.query(checkProduct, pUuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " product", err);
        if (!result[0])
          return SendError404(res, EMessage.NotFound + " product");
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async insert(req, res) {
    try {
      const { name, detail, amount, price, category_id } = req.body;
      const validate = await ValidateData({
        name,
        detail,
        amount,
        price,
        category_id,
      });

      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const image = req.files;
      if (!image) return SendError400(res, EMessage.BadRequest + "image");
      console.log(image);
      const pUuid = uuidv4();
      const checkCategory = "select * from category where cUuid=?";
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      connected.query(checkCategory, category_id, async (error, result) => {
        if (error)
          return SendError404(res, EMessage.NotFound + " category", error);
        if (!result[0])
          return SendError404(res, EMessage.NotFound + " category");
        const image_url = await UploadImageToCloud(image.image.data);
        if (!image_url) return SendError400(res, EMessage.UploadImageError);
        const insert = `insert into product (pUuid,name,detail,amount,price,image,createdAt,category_id,updatedAt) 
        values (?,?,?,?,?,?,?,?,?)`;
        connected.query(
          insert,
          [
            pUuid,
            name,
            detail,
            amount,
            price,
            image_url,
            datetime,
            category_id,
            datetime,
          ],
          (err) => {
            if (err) return SendError404(res, EMessage.InsertError, err);
            console.log(err);
            return SendCreate(res, SMessage.Insert);
          }
        );
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async updateProduct(req, res) {
    try {
      const pUuid = req.params.pUuid;
      const { name, detail, amount, price, category_id } = req.body;
      const validate = await ValidateData({
        name,
        detail,
        amount,
        price,
        category_id,
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const image = req.files;
      if (!image) return SendError400(res, EMessage.BadRequest + " image");
      const checkProductId = "select * from product where pUuid=?";
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      connected.query(checkProductId, pUuid, (error, productData) => {
        if (error)
          return SendError404(res, EMessage.NotFound + " product", error);
        if (!productData[0])
          return SendError404(res, EMessage.NotFound + " product");
        const checkCategory = "select * from category where cUuid=?";
        connected.query(
          checkCategory,
          category_id,
          async (errCategory, categoryData) => {
            if (errCategory)
              return SendError404(
                res,
                EMessage.NotFound + " category",
                errCategory
              );
            if (!categoryData)
              return SendError404(res, EMessage.NotFound + " category");
            const image_url = await UploadImageToCloud(image.image.data);
            if (!image_url)
              return SendError400(res, EMessage.BadRequest + " image");
            const update = `update product set name=?,detail=?,amount=?,
              price=?,image=?,category_id=?,updatedAt=? where pUuid=?`;
            connected.query(
              update,
              [
                name,
                detail,
                amount,
                price,
                image_url,
                category_id,
                datetime,
                pUuid,
              ],
              (errUpdate) => {
                if (errUpdate)
                  return SendError400(res, EMessage.UpdateError, errUpdate);
                return SendSuccess(res, SMessage.Update);
              }
            );
          }
        );
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async deleteProduct(req, res) {
    try {
      const pUuid = req.params.pUuid;
      const check = "select * from product where pUuid = ?";
      connected.query(check, pUuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " product");
        if (!result[0])
          return SendError404(res, EMessage.NotFound + " product");
        const deleteproduct = "Delete from product where pUuid=?";
        connected.query(deleteproduct, pUuid, (error) => {
          if (error) return SendError400(res, EMessage.DeleteError, error);
          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
}
