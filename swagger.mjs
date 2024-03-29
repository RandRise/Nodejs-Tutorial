import swaggerJSDOC from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'City API', version: '1.0.0' },
    },
    apis: ['./server1.mjs'],
};

const swaggerSpec = swaggerJSDOC(options);

export { swaggerSpec };