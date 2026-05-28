import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import artisansRouter from "./artisans";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import blogRouter from "./blog";
import homepageRouter from "./homepage";
import cartRouter from "./cart";
import wishlistRouter from "./wishlist";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(homepageRouter);
router.use(categoriesRouter);
router.use(artisansRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(blogRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(contactRouter);

export default router;
