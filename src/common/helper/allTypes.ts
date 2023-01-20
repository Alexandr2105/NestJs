export type BlogsQueryType = {
  pagesCount: number;
  pageSize: number;
  page: number;
  totalCount: number;
  items: BlogNotUserId[];
};

type BlogNotUserId = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
};

export type PostQueryType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostNotUserId[];
};

type PostNotUserId = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
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
