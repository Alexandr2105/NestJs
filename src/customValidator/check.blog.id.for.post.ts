import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogDocument } from '../blogs/schema/blogs.schema';

@ValidatorConstraint({ name: 'post', async: true })
@Injectable()
export class CheckBlogIdForPost implements ValidatorConstraintInterface {
  constructor(
    @InjectModel('blogs') protected blogsCollection: Model<BlogDocument>,
  ) {}

  async validate(id: string): Promise<boolean> {
    const blog = await this.blogsCollection.findOne({ id: id });
    if (blog) {
      return true;
    } else {
      throw new NotFoundException();
    }
  }
}
