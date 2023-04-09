import { BlogDocument } from './schema/blogs.schema';
import { BanUsersForBlogDocument } from './schema/ban.users.for.blog.schema';
import { ImageModelDocument } from '../../../common/schemas/image.schema';

export abstract class IBlogsRepository {
  abstract getBlogIdSpecial(id: string);
  abstract getBlogId(id: string);
  abstract deleteBlogId(id: string);
  abstract getBanBlogs(idBlog: string);
  abstract getBanUsersForBlogs(blogId: string);
  abstract deleteBanUsers(userId: string, blogId: string);
  abstract saveBanUser(banUser: BanUsersForBlogDocument);
  abstract save(blog: BlogDocument);
  abstract saveImage(image: ImageModelDocument);
  abstract getInfoForImage(url: string);
}
