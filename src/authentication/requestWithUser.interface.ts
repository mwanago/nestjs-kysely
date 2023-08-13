import { Request } from 'express';
import { User } from '../users/user.model';

export interface RequestWithUser extends Request {
  user: User;
}
