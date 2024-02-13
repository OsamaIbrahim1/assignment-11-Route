import slugify from "slugify";
import Brand from "../../../DB/models/brand.model.js";
import { systemRoles } from "../../utils/system-role.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";
import Product from "../../../DB/models/product.model.js";

//================================= add product =================================//
/**
 * * destructure  data from body and query and authUser
 * * find brand and category and subCategory
 * * role = admin , brand owner
 * * generate the slug
 * * count appliedPrice
 * * uploade images Product
 * * Create new product
 * * response successfully
 */
export const addProduct = async (req, res, next) => {
  // * destructure  data from body and query and authUser
  const { title, desc, basePrice, discount, stock, specs } = req.body;
  const { categoryId, subCategoryId, brandId } = req.query;
  const addedBy = req.authUser._id;

  // * find brand and category and subCategory
  const brand = await Brand.findById(brandId);
  if (!brand) {
    return next(new Error("Brand not found", { cause: 404 }));
  }

  if (!brand.categoryId.equals(categoryId)) {
    return next(new Error("Category not found", { cause: 404 }));
  }
  if (!brand.subCategoryId.equals(subCategoryId)) {
    return next(new Error("subCategoryId not found", { cause: 404 }));
  }

  // * role = admin , brand owner
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    !brand.addedBy.equals(addedBy)
  ) {
    return next(
      new Error("You are not allowed to add product to this brand", {
        cause: 404,
      })
    );
  }

  // * generate the slug
  const slug = slugify(title, { lower: true, replacement: "-" });

  // * count appliedPrice
  const appliedPrice = basePrice - basePrice * ((discount || 0) / 100);

  // * uploade images Product
  if (!req.files?.length) {
    return next(new Error("Image is required", { cause: 400 }));
  }
  const folderId = generateUniqueString(4);
  let Images = [];
  const folder = brand.Image.public_id.split(`${brand.folderId}/`)[0];
  for (const file of req.files) {
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(file.path, {
        folder: folder + `${brand.folderId}/Products/${folderId}`,
      });
    Images.push({ secure_url, public_id });
  }
  req.folder = folder + `${brand.folderId}/Products/${folderId}`;

  // * Create new product
  const product = {
    title,
    desc,
    slug,
    basePrice,
    discount,
    appliedPrice,
    stock,
    specs: JSON.parse(specs),
    categoryId,
    subCategoryId,
    brandId,
    addedBy,
    Images,
    folderId,
  };
  const createProduct = await Product.create(product);
  req.savedDocuments = { model: Product, _id: createProduct._id };

  // * response successfully
  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: createProduct,
  });
};

//================================= update product =================================//
/**
 *
 */
export const updateProduct = async (req, res, next) => {
  // * destructure data from body and authUser
  const { title, desc, basePrice, discount, stock, specs, oldPublicId } =
    req.body;
  const { productId } = req.query;
  const { _id } = req.authUser;

  // * find product by _id
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));

  // * authorized update product
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    product.addedBy.toString() !== _id
  ) {
    return next(
      new Error("You are not allowed to update Product", { cause: 401 })
    );
  }

  // * if user wants to update title product
  if (title) {
    product.title = title;
    product.slug = slugify(title, { lower: true, replacement: "-" });
  }

  // * if user wants to update description product
  if (desc) product.desc = desc;

  // * if user wants to update stock product
  if (stock) product.stock = stock;

  // * if user wants to update price product
  if (specs) product.specs = JSON.parse(specs);

  // * if user wants to update price product
  const appliedPrice =
    (basePrice || product.basePrice) *
    (1 - (discount || product.discount) / 100);
  product.appliedPrice = appliedPrice;
  if (discount) product.discount = discount;
  if (basePrice) product.basePrice = basePrice;

  // * if user wants to update image product
  if (oldPublicId) {
    if (!req.file) return next(new Error(`Image is required`, { cause: 400 }));

    const folderPath = product.Images[0].public_id.split(
      `${product.folderId}/`
    )[0];
    const newPublicId = oldPublicId.split(`${product.folderId}/`)[1];

    // * update image and use same public id  and folder id
    const { secure_url } = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: folderPath + `${product.folderId}`,
        public_id: newPublicId,
      }
    );
    product.Images.map((img) => {
      if (img.public_id === oldPublicId) img.secure_url = secure_url;
    });
    req.folder = folderPath + `${product.folderId}`;
  }

  // * save updates product
  product.updatedBy = _id;
  await product.save();

  // * response successfully
  res
    .status(200)
    .json({ success: true, message: `Successfully updated`, data: product });
};
