import express, { Request, Response } from 'express';
import {body, validationResult} from 'express-validator';
import { BadRequestError , validateRequest} from '@ccktickets/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signin', [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().notEmpty().withMessage('You must provide a password')
],
validateRequest, 
async (req: Request, res: Response) => {

  const {email, password} = req.body;

  const existingUser = await User.findOne({email});
  if (!existingUser) {
    throw new BadRequestError('Invalid login credentials')
  }

  const passwordsMatch = await Password.compare(existingUser.password, password);
  if (!passwordsMatch) {
    throw new BadRequestError('Invalid login credentials')
  }

  // Create JWT
  const token = jwt.sign({id: existingUser.id, email: existingUser.email}, process.env.JWT_KEY! );

  // Store JWT on session
  req.session = {
    jwt: token
  };

  res.status(200).send(existingUser);
});

export {router as signinRouter}