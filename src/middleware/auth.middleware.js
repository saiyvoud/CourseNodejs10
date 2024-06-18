import { EMessage } from "../service/message.js";
import { SendError401, SendError500 } from "../service/response.js";
import { VerifyToken } from "../service/service.js";

export const auth = async (req, res, next) => {
  try {
    const authorized = req.headers["authorization"];
    if (!authorized) { 
      return SendError401(res, EMessage.Unauthorized);
    }
    const token = authorized.replace("Bearer ", "");
    
    const verifyData = await VerifyToken(token);
    if (!verifyData) {
      return SendError401(res, EMessage.InvaildUnauthorized);
    }
    req.user = verifyData;
    next();
  } catch (error) {
    return SendError500(res, EMessage.Server.error);
  }
};
