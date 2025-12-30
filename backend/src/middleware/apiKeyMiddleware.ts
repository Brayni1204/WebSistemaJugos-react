import { Request, Response, NextFunction } from 'express';

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-provisioning-api-key'];
  const expectedApiKey = process.env.PROVISIONING_API_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing API key.' });
  }

  next();
};
