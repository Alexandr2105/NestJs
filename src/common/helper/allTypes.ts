export type BlogsQueryType = {
  pagesCount: number;
  pageSize: number;
  page: number;
  totalCount: number;
  items: BlogNotUserId[];
};

export type BlogsQueryTypeSA = {
  pagesCount: number;
  pageSize: number;
  page: number;
  totalCount: number;
  items: BlogNotUserIdSA[];
};

type BlogNotUserId = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

type BlogNotUserIdSA = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: BlogOwnerInfoSA;
  banInfo: BanInfoSa;
};

type BlogOwnerInfoSA = {
  userId: string;
  userLogin: string;
};

type BanInfoSa = {
  isBanned: boolean;
  banDate: string;
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

type BanInfo = {
  isBanned: boolean | undefined;
  banDate: string | undefined;
  banReason: string | undefined;
};

export type ItemsUsers = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: BanInfo;
};

export type UserQueryType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ItemsUsers[];
};

type InfoLikesType = {
  likesCount: number | undefined;
  dislikesCount: number | undefined;
  myStatus: string | undefined;
};

export type ItemsComments = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
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

export type AllCommentsForAllPostsCurrentUserBlogs = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: InfoComments[];
};

type InfoComments = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  postInfo: PostInfo;
  likesInfo: InfoLikesType;
};

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

type PostInfo = {
  id: string;
  title: string;
  blogId: string;
  blogName: string;
};

export type BanUsersInfoForBlog = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BanUsers[];
};

type BanUsers = {
  id: string;
  login: string;
  banInfo: BanInfo;
};

export type AllQuestionsSa = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: QuestionsSa[];
};

type QuestionsSa = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
