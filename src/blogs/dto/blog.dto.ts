export class CreateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogDto {
  name: string;
  websiteUrl: string;
  description: string;
}
