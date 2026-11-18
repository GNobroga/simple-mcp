
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from '@fastify/type-provider-zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp';
import Fastify, { type FastifyPluginCallback } from 'fastify';
import z from 'zod';
import { prisma } from './database/prisma.js';
import { env } from './config/env.js';

const app = Fastify();
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

const MCP_SERVER_NAME = 'fastify-mcp';
const MCP_VERSION = '1.0.0';

app.decorate('prisma', prisma);

const postsRoutes: FastifyPluginCallback = (fastify) => {
    fastify.withTypeProvider<ZodTypeProvider>().get<{ Params: { id: number } }>('/users/:id', {
        schema: {
            params: z.object({
                id: z.coerce.number(),
            })
        }
    }, async (request) => {
        const { id } = request.params;

        const posts = await fastify.prisma.post.findMany({
            where: {
                userId: id,
            }
        });

        return posts;
    });
};

app.register(postsRoutes, { prefix: '/posts' });

app.post('/mcp', (request, reply) => {
    reply.hijack();

    const server = new McpServer({
        name: MCP_SERVER_NAME,
        version: MCP_VERSION,
    });


    server.registerTool('get_posts', {
        title: 'Get Posts',
        description: 'Retrieve a posts by their unique ID',
        inputSchema: z.object({
            userId: z.string(),
        }),
    }, async ({ userId }) => {
        const req = await fetch(`http://localhost:${env.PORT}/posts/users/${userId}`);
        const posts = await req.json();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(posts),
                }
            ]
        }
    })

    const transport = new StreamableHTTPServerTransport();

    transport.handleRequest(
        request.raw,
        reply.raw,
        request.body
    );

    server.connect(transport);

});

app.listen({
    port: env.PORT,
}, (err, address) => {
 if (!err) {
    return;
 }
 console.log(`Server running in ${address}`);
});