import { FastifyInstance } from "fastify";
import productSignatureRoute from "./product-signature.route";
import paymentSignatureRoute from "./payment-signature.route";
import promotionSignatureRoute from "./promotion-signature.route";
import categorySignatureRoute from "./category-signature.route";

export const uploadRoutes = async (app: FastifyInstance) => {
    app.register(productSignatureRoute);   // POST /api/uploads/product-signature
    app.register(paymentSignatureRoute);   // POST /api/uploads/payment-signature
    app.register(promotionSignatureRoute); // POST /api/uploads/promotion-signature
    app.register(categorySignatureRoute);  // POST /api/uploads/category-signature
};
