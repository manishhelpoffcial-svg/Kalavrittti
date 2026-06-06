import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

interface CartItem {
  productId: number;
  title: string;
  price: number;
  mrp: number;
  quantity: number;
  mainImage: string | null;
  artisanName: string | null;
  slug: string;
}

function getCartFromSession(req: any): CartItem[] {
  if (!req.session) req.session = {};
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

function computeCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal, shipping, discount: 0, total, itemCount };
}

router.get("/cart", (req: any, res) => {
  const items = getCartFromSession(req);
  const totals = computeCartTotals(items);
  res.json({ items, ...totals });
});

router.post("/cart/items", async (req: any, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    const cart = getCartFromSession(req);
    const existing = cart.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId,
        title: product.title,
        price: parseFloat(product.price as string),
        mrp: parseFloat(product.mrp as string),
        quantity,
        mainImage: product.mainImage,
        artisanName: null,
        slug: product.slug,
      });
    }
    req.session.cart = cart;

    const totals = computeCartTotals(cart);
    res.json({ items: cart, ...totals });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

router.patch("/cart/items/:productId", (req: any, res) => {
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;
  const cart = getCartFromSession(req);
  const item = cart.find((i) => i.productId === productId);
  if (item) item.quantity = quantity;
  req.session.cart = cart;
  const totals = computeCartTotals(cart);
  res.json({ items: cart, ...totals });
});

router.delete("/cart/items/:productId", (req: any, res) => {
  const productId = parseInt(req.params.productId);
  const cart = getCartFromSession(req).filter((i) => i.productId !== productId);
  req.session.cart = cart;
  const totals = computeCartTotals(cart);
  res.json({ items: cart, ...totals });
});

export default router;
