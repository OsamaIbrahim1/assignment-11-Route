import { Router } from "express";

import * as productController from "./product.Controller.js";
import expressAsyncHandler from "express-async-handler";
import { systemRoles } from "../../utils/system-role.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/allowedExtentions.js";
import {
  addProductSchema,
  updateProductSchema,
} from "./product.Validation-Schema.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./product.endpoints-rule.js";

const router = Router();

router.post(
  "/addProduct",
  auth(endPointsRoles.ADD_PRODUCT),
  validationMiddleware(addProductSchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).array("image", 3),
  expressAsyncHandler(productController.addProduct)
);

router.put(
  "/updateProduct",
  auth(endPointsRoles.UPDATE_PRODUCT),
  validationMiddleware(updateProductSchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(productController.updateProduct)
);

export default router;
