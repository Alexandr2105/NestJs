import { IBlogsRepository } from './i.blog.repository';
import { BlogDocument } from './schema/blogs.schema';
import { BanUsersForBlogDocument } from './schema/ban.users.for.blog.schema';

export class BlogRepositorySql extends IBlogsRepository {
  constructor() {
    super();
  }

  deleteBanUsers(userId: string) {}

  deleteBlogId(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getBanBlogs(idBlog: string) {}

  getBanUsersForBlogs(blogId: string): Promise<BanUsersForBlogDocument[]> {
    return Promise.resolve([]);
  }

  getBlogId(id: string): Promise<BlogDocument | false> {
    return Promise.resolve(undefined);
  }

  getBlogIdSpecial(id: string): Promise<BlogDocument | false> {
    return Promise.resolve(undefined);
  }

  save(blog: BlogDocument) {}

  saveBanUser(banUser: BanUsersForBlogDocument) {}
}
