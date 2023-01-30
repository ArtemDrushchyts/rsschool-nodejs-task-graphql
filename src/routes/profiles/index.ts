import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    return await fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request:any, reply): Promise<ProfileEntity> {
      const {id} = request.params;
      const profile = await fastify.db.profiles.findOne({key: 'id', equals: id})
      if(profile) {
        return profile
      } else {
        throw fastify.httpErrors.notFound();
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request:any, reply): Promise<ProfileEntity> {
      const {userId, memberTypeId} = request.body;
      const user = await fastify.db.users.findOne({key: 'id', equals: userId});
      if(!user) {
        throw fastify.httpErrors.badRequest();
      }
      const profile = await fastify.db.profiles.findOne({key: 'userId', equals: userId});
      if(profile) {
        throw fastify.httpErrors.badRequest();
      }
      const memberType = await fastify.db.memberTypes.findOne({key: 'id', equals: memberTypeId});
      if(!memberType) {
        throw fastify.httpErrors.badRequest();
      }

      return await fastify.db.profiles.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request:any, reply): Promise<ProfileEntity> {
      const {id} = request.params;
      const profile = await fastify.db.profiles.findOne({key: 'id', equals: id})
      if(!profile) {
        throw fastify.httpErrors.badRequest();
      }
      return await fastify.db.profiles.delete(id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request:any, reply): Promise<ProfileEntity> {
      const {id} = request.params;
      try {
        const profile = await fastify.db.profiles.change(id, request.body);
        return profile;
      } catch (err) {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
