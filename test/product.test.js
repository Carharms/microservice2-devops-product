const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');

// Mock the pg module
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

const app = express();
app.use(express.json());

// Mock DB pool
const mockPool = {
  query: jest.fn(),
};

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/products', async (req, res) => {
  try {
    const result = await mockPool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await mockPool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/products', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const result = await mockPool.query(
      'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *',
      [name, price, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

describe('Product Service API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return OK status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 10.99, description: 'Test product 1' },
        { id: 2, name: 'Product 2', price: 20.99, description: 'Test product 2' }
      ];
      
      mockPool.query.mockResolvedValue({ rows: mockProducts });

      const response = await request(app).get('/products');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM products');
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app).get('/products');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('GET /products/:id', () => {
    it('should return a single product', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 10.99, description: 'Test product 1' };
      mockPool.query.mockResolvedValue({ rows: [mockProduct] });

      const response = await request(app).get('/products/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM products WHERE id = $1', ['1']);
    });

    it('should return 404 for non-existent product', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/products/999');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Product not found' });
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app).get('/products/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProduct = { name: 'New Product', price: 15.99, description: 'New test product' };
      const createdProduct = { id: 3, ...newProduct };
      mockPool.query.mockResolvedValue({ rows: [createdProduct] });

      const response = await request(app)
        .post('/products')
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdProduct);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *',
        [newProduct.name, newProduct.price, newProduct.description]
      );
    });

    it('should handle database errors during creation', async () => {
      const newProduct = { name: 'New Product', price: 15.99, description: 'New test product' };
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/products')
        .send(newProduct);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('Input validation', () => {
    it('should handle missing required fields gracefully', async () => {
      const incompleteProduct = { name: 'Incomplete Product' };
      mockPool.query.mockResolvedValue({ rows: [{ id: 1, ...incompleteProduct, price: null, description: null }] });

      const response = await request(app)
        .post('/products')
        .send(incompleteProduct);

      expect(response.status).toBe(201);
    });
  });

  describe('Database connection', () => {
    it('should handle connection configuration', () => {
      const Pool = require('pg').Pool;
      expect(Pool).toHaveBeenCalled();
    });
  });
});