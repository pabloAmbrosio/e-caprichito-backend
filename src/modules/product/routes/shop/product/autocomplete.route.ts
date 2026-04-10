import { FastifyInstance } from "fastify";
import { autocompleteHandler } from "../../../handlers/shop";
import { AutocompleteSchema } from "../../../schemas/autocomplete.schema";
import { AutocompleteRouteSpec } from "../../../product-route-specs";
import { AUTOCOMPLETE_URL } from "../../../constants";

const schema = { querystring: AutocompleteSchema };

export default (app: FastifyInstance) => {
  app.get<AutocompleteRouteSpec>(AUTOCOMPLETE_URL, { schema, preHandler: [app.authenticateOptional] }, autocompleteHandler);
};
