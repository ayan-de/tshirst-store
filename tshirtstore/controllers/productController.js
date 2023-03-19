const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const cloudinary = require("cloudinary");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  //images

  let imageArray = [];

  if (!req.files) {
    return next(new CustomError(`Images are required`, 401));
  }

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resultperPage = 6;
  const totalcountProduct = await Product.countDocuments();

  
  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = productsObj.base;
  const filterProductNumber = products.length;

  productsObj.pager(resultperPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filterProductNumber,
    totalcountProduct,
  });
});