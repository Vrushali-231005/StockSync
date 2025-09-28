import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StockSync API',
      version: '1.0.0',
      description: 'API documentation for Inventory Management System',
    },
    servers: [
      {
        url: 'https://stocksync-inventory-management.onrender.com/',
      },
    ],
  },
  apis: ['./routes/*.js'], // path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
