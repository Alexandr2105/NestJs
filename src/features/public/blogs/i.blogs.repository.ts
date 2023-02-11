import { BlogDocument } from './schema/blogs.schema';
import { BanUsersForBlogDocument } from './schema/ban.users.for.blog.schema';

export abstract class IBlogsRepository {
  abstract getBlogIdSpecial(id: string): Promise<BlogDocument | false>;
  abstract getBlogId(id: string): Promise<BlogDocument | false>;
  abstract deleteBlogId(id: string): Promise<boolean>;
  abstract getBanBlogs(idBlog: string);
  abstract getBanUsersForBlogs(
    blogId: string,
  ): Promise<BanUsersForBlogDocument[]>;
  abstract deleteBanUsers(userId: string);
  abstract saveBanUser(banUser: BanUsersForBlogDocument);
  abstract save(blog: BlogDocument);
}
