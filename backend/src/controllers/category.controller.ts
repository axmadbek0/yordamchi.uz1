import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, parent_id } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        parent_id
      }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};
