import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request:any, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({key: 'id', equals: request.params.id})
      if(post) {
        return post
      } else {
        throw fastify.httpErrors.notFound();
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request:any, reply): Promise<PostEntity> {
      const {body} = request;
      return await fastify.db.posts.create(body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request:any, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({key: 'id', equals: request.params.id});
      if(post) {
        return await fastify.db.posts.delete(request.params.id);
      } else {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request:any, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({key: 'id', equals: request.params.id});
      if(post) {
        return await fastify.db.posts.change(request.params.id, request.body);
      } else {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
