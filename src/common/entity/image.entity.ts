import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { BlogEntity } from '../../features/public/blogs/entity/blog.entity';
import { PostEntity } from '../../features/public/posts/entity/post.entity';

@Entity()
export class ImageEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  url: string;
  @Column()
  bucket: string;
  @Column()
  blogId: string;
  @Column({ default: null })
  postId: string;

  @ManyToOne(() => BlogEntity, (b) => b.image, { onDelete: 'CASCADE' })
  blog: BlogEntity;
  @ManyToOne(() => PostEntity, (p) => p.image, { onDelete: 'CASCADE' })
  post: PostEntity;
}
