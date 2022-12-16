import mongoose from 'mongoose';

export class BlogsModel {
  constructor(
    public id: string,
    public name: string,
    public websiteUrl: string,
    public description: string,
    public createdAt: string,
  ) {}
}

export const BlogsTypeSchema = new mongoose.Schema<BlogsModel>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export class PostsModel {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
  ) {}
}

export const PostsTypeSchema = new mongoose.Schema<PostsModel>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export class CommentsModel {
  constructor(
    public id: string,
    public idPost: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public createdAt: string,
  ) {}
}

export const CommentsTypeSchema = new mongoose.Schema<CommentsModel>({
  id: { type: String, required: true },
  idPost: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export class UsersModel {
  constructor(
    public id: string,
    public login: string,
    public password: string,
    public email: string,
    public createdAt: string,
  ) {}
}

export const UsersTypeSchema = new mongoose.Schema<UsersModel>({
  id: { type: String, required: true },
  login: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export class EmailConfirmationModel {
  constructor(
    public userId: string,
    public confirmationCode: string,
    public expirationDate: Date,
    public isConfirmed: boolean,
  ) {}
}

export const EmailConfirmationSchema =
  new mongoose.Schema<EmailConfirmationModel>({
    userId: { type: String, required: true },
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    isConfirmed: { type: Boolean, required: true },
  });

export class RefreshTokenDataModel {
  constructor(
    public iat: number,
    public exp: number,
    public deviceId: string,
    public ip: string,
    public deviceName: string | undefined,
    public userId: string,
  ) {}
}

export const RefreshTokenDataSchema =
  new mongoose.Schema<RefreshTokenDataModel>({
    iat: { type: Number, required: true },
    exp: { type: Number, required: true },
    deviceId: { type: String, required: true },
    ip: { type: String, required: true },
    deviceName: { type: String, required: true },
    userId: { type: String, required: true },
  });

export class CountAttemptModel {
  constructor(
    public ip: string,
    public iat: number,
    public method: string,
    public originalUrl: string,
    public countAttempt: number,
  ) {}
}

export class LikesModel {
  constructor(
    public id: string,
    public userId: string,
    public login: string,
    public status: string,
    public createDate: string,
  ) {}
}
export const LikesTypeSchema = new mongoose.Schema<LikesModel>({
  id: { type: 'string', required: true },
  userId: { type: 'string', required: true },
  login: { type: 'string', required: true },
  status: { type: 'string', required: true },
  createDate: { type: 'string', required: true },
});

export type BlogsQueryType = {
  pagesCount: number;
  pageSize: number;
  page: number;
  totalCount: number;
  items: BlogsModel[];
};

export type PostQueryType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostsModel[];
};

export type ItemsUsers = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UserQueryType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ItemsUsers[];
};

export type InfoLikesType = {
  likesCount: number | undefined;
  dislikesCount: number | undefined;
  myStatus: string | undefined;
};

export type ItemsComments = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: string;
  likesInfo: InfoLikesType;
};

export type CommentsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ItemsComments[];
};
