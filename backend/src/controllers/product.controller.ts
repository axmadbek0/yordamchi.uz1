import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    
    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category_id: String(category) } : {}),
        ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {})
      },
      include: {
        category: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock_quantity, category_id, images } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock_quantity: Number(stock_quantity),
        category_id,
        images: images || []
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};
