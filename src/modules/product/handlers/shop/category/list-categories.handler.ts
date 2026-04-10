import { FastifyRequest, FastifyReply } from "fastify";
import { listCategoriesService } from "../../../services/shop/category/list-categories.service";
import { handleProductError } from "../../../errors";
import type { CategoryFilter } from "../../../services/helpers/category";

const VALID_FILTERS = new Set<CategoryFilter>(['all', 'parents', 'children']);

export const listCategoriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { type } = request.query as { type?: string };

        const filter: CategoryFilter = VALID_FILTERS.has(type as CategoryFilter) ? (type as CategoryFilter) : 'all';

        const { msg, data } = await listCategoriesService(filter);

        return reply.send({ success: true, msg, data });
        
    } catch (error) {
        return handleProductError(error, reply, request, "listar categorías");
    }
};
