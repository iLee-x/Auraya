import { config } from '../config';

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Auraya E-Commerce API',
    version: '1.0.0',
    description: 'API documentation for the Auraya e-commerce platform',
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Categories', description: 'Product category management' },
    { name: 'Products', description: 'Product catalog' },
    { name: 'Cart', description: 'Shopping cart (requires auth)' },
    { name: 'Addresses', description: 'User addresses (requires auth)' },
    { name: 'Orders', description: 'Order management (requires auth)' },
    { name: 'Health', description: 'System health check' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT token stored in HttpOnly cookie. Login via /auth/login to set it.',
      },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['CUSTOMER', 'ADMIN', 'SELLER'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string', nullable: true },
          parentId: { type: 'string', nullable: true },
          children: {
            type: 'array',
            items: { $ref: '#/components/schemas/Category' },
          },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string', nullable: true },
          price: { type: 'string', example: '99.99' },
          stock: { type: 'integer' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                url: { type: 'string' },
                sortOrder: { type: 'integer' },
              },
            },
          },
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                slug: { type: 'string' },
              },
            },
          },
          seller: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              name: { type: 'string', nullable: true },
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' },
          },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string' },
          quantity: { type: 'integer' },
          product: { $ref: '#/components/schemas/Product' },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          recipientName: { type: 'string' },
          phone: { type: 'string', nullable: true },
          addressLine1: { type: 'string' },
          addressLine2: { type: 'string', nullable: true },
          city: { type: 'string' },
          state: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          isDefault: { type: 'boolean' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string', nullable: true },
          shippingAddress: { type: 'object' },
          status: { type: 'string', enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
          totalAmount: { type: 'string', example: '199.98' },
          stripePaymentId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' },
          },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productName: { type: 'string' },
          productSlug: { type: 'string' },
          productPrice: { type: 'string' },
          quantity: { type: 'integer' },
        },
      },
    },
  },
  paths: {
    // ─── Health ───
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: { description: 'All services healthy' },
          503: { description: 'One or more services unhealthy' },
        },
      },
    },

    // ─── Auth ───
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully. Sets auth cookie.' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful. Sets auth cookie.' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        responses: {
          200: { description: 'Logged out. Clears auth cookie.' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Current user info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } },
                  },
                },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
    },

    // ─── Categories ───
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        parameters: [
          { name: 'flat', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Return flat list instead of tree' },
          { name: 'parentId', in: 'query', schema: { type: 'string' }, description: 'Filter by parent category ID' },
        ],
        responses: {
          200: { description: 'List of categories' },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category (Admin)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  parentId: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Category created' },
          403: { description: 'Admin only' },
        },
      },
    },
    '/categories/{idOrSlug}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by ID or slug',
        parameters: [
          { name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Category details' },
          404: { description: 'Category not found' },
        },
      },
    },
    '/categories/{id}': {
      patch: {
        tags: ['Categories'],
        summary: 'Update category (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  parentId: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Category updated' },
          403: { description: 'Admin only' },
          404: { description: 'Category not found' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Category deleted' },
          403: { description: 'Admin only' },
          404: { description: 'Category not found' },
        },
      },
    },

    // ─── Products ───
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'string' }, description: 'Page number (default: 1)' },
          { name: 'limit', in: 'query', schema: { type: 'string' }, description: 'Items per page (default: 20, max: 100)' },
          { name: 'categorySlug', in: 'query', schema: { type: 'string' }, description: 'Filter by category slug (includes child categories)' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or description' },
          { name: 'minPrice', in: 'query', schema: { type: 'string' }, description: 'Minimum price filter' },
          { name: 'maxPrice', in: 'query', schema: { type: 'string' }, description: 'Maximum price filter' },
          { name: 'sellerId', in: 'query', schema: { type: 'string' }, description: 'Filter by seller' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'price', 'name'] }, description: 'Sort field (default: createdAt)' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Sort direction (default: desc)' },
        ],
        responses: {
          200: {
            description: 'Paginated product list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product (Admin/Seller)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  stock: { type: 'integer', default: 0 },
                  isActive: { type: 'boolean', default: true },
                  categoryIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product created' },
          403: { description: 'Admin or Seller only' },
        },
      },
    },
    '/products/{idOrSlug}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID or slug',
        parameters: [
          { name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Product details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: { product: { $ref: '#/components/schemas/Product' } },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Product not found' },
        },
      },
    },
    '/products/{id}': {
      patch: {
        tags: ['Products'],
        summary: 'Update product (Admin/Seller)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  price: { type: 'number' },
                  stock: { type: 'integer' },
                  isActive: { type: 'boolean' },
                  categoryIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product updated' },
          403: { description: 'Not authorized' },
          404: { description: 'Product not found' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product (soft delete, Admin/Seller)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Product deleted' },
          403: { description: 'Not authorized' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/products/{id}/images': {
      post: {
        tags: ['Products'],
        summary: 'Upload product images (Admin/Seller)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  images: { type: 'array', items: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Images uploaded' },
          403: { description: 'Not authorized' },
        },
      },
    },
    '/products/{id}/images/{imageId}': {
      delete: {
        tags: ['Products'],
        summary: 'Delete product image (Admin/Seller)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'imageId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Image deleted' },
          403: { description: 'Not authorized' },
          404: { description: 'Image not found' },
        },
      },
    },
    '/products/{id}/images/reorder': {
      put: {
        tags: ['Products'],
        summary: 'Reorder product images (Admin/Seller)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['imageIds'],
                properties: {
                  imageIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Images reordered' },
          403: { description: 'Not authorized' },
        },
      },
    },

    // ─── Cart ───
    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get current user cart',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Cart with items',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object', properties: { cart: { $ref: '#/components/schemas/Cart' } } },
                  },
                },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear cart',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Cart cleared' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1, default: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Item added to cart' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/cart/items/{itemId}': {
      patch: {
        tags: ['Cart'],
        summary: 'Update cart item quantity',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: {
                  quantity: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Item quantity updated' },
          401: { description: 'Not authenticated' },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove item from cart',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Item removed' },
          401: { description: 'Not authenticated' },
        },
      },
    },

    // ─── Addresses ───
    '/addresses': {
      get: {
        tags: ['Addresses'],
        summary: 'List user addresses',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'List of addresses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        addresses: { type: 'array', items: { $ref: '#/components/schemas/Address' } },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
      post: {
        tags: ['Addresses'],
        summary: 'Create address',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['recipientName', 'addressLine1', 'city', 'state', 'postalCode', 'country'],
                properties: {
                  recipientName: { type: 'string' },
                  phone: { type: 'string' },
                  addressLine1: { type: 'string' },
                  addressLine2: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  postalCode: { type: 'string' },
                  country: { type: 'string' },
                  isDefault: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Address created' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/addresses/{id}': {
      get: {
        tags: ['Addresses'],
        summary: 'Get address by ID',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Address details' },
          401: { description: 'Not authenticated' },
          404: { description: 'Address not found' },
        },
      },
      patch: {
        tags: ['Addresses'],
        summary: 'Update address',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  recipientName: { type: 'string' },
                  phone: { type: 'string' },
                  addressLine1: { type: 'string' },
                  addressLine2: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  postalCode: { type: 'string' },
                  country: { type: 'string' },
                  isDefault: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Address updated' },
          401: { description: 'Not authenticated' },
          404: { description: 'Address not found' },
        },
      },
      delete: {
        tags: ['Addresses'],
        summary: 'Delete address',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Address deleted' },
          401: { description: 'Not authenticated' },
          404: { description: 'Address not found' },
        },
      },
    },
    '/addresses/{id}/default': {
      patch: {
        tags: ['Addresses'],
        summary: 'Set address as default',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Default address updated' },
          401: { description: 'Not authenticated' },
          404: { description: 'Address not found' },
        },
      },
    },

    // ─── Orders ───
    '/orders/checkout': {
      post: {
        tags: ['Orders'],
        summary: 'Checkout (create order from cart)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['addressId'],
                properties: {
                  addressId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Order created' },
          400: { description: 'Cart is empty or insufficient stock' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List user orders',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Paginated order list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        orders: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Order details' },
          401: { description: 'Not authenticated' },
          404: { description: 'Order not found' },
        },
      },
    },
    '/orders/admin/all': {
      get: {
        tags: ['Orders'],
        summary: 'List all orders (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'All orders (paginated)' },
          403: { description: 'Admin only' },
        },
      },
    },
    '/orders/admin/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Update order status (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Order status updated' },
          403: { description: 'Admin only' },
          404: { description: 'Order not found' },
        },
      },
    },
  },
};

export default swaggerDocument;
