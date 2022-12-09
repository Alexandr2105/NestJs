import mongoose from 'mongoose';

export class ItemsBlogs {
  constructor(
    public id: string,
    public name: string,
    public websiteUrl: string,
    public description: string,
    public createdAt: string,
  ) {}
}

export const BlogsTypeSchema = new mongoose.Schema<ItemsBlogs>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export class ItemsPosts {
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

export class CommentsTypeForDB {
  constructor(
    public id: string,
    public idPost: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public createdAt: string,
  ) {}
}

export class UserTypeForDB {
  constructor(
    public id: string,
    public login: string,
    public password: string,
    public email: string,
    public createdAt: string,
  ) {}
}

export class EmailConfirmationTypeForDB {
  constructor(
    public userId: string,
    public confirmationCode: string,
    public expirationDate: Date,
    public isConfirmed: boolean,
  ) {}
}

export class RefreshTokenDataTypeForDB {
  constructor(
    public iat: number,
    public exp: number,
    public deviceId: string,
    public ip: string,
    public deviceName: string | undefined,
    public userId: string,
  ) {}
}

export class CountAttemptTypeForDB {
  constructor(
    public ip: string,
    public iat: number,
    public method: string,
    public originalUrl: string,
    public countAttempt: number,
  ) {}
}

export class LikeInfoTypeForDB {
  constructor(
    public id: string,
    public userId: string,
    public login: string,
    public status: string,
    public createDate: string,
  ) {}
}

export type BlogsQueryType = {
  pagesCount: number;
  pageSize: number;
  page: number;
  totalCount: number;
  items: ItemsBlogs[];
};

export type PostQueryType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ItemsPosts[];
};

export type ItemsUsers = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UsersType = {
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
