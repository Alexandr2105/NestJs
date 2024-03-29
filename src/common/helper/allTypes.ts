export type BlogsQueryType = {
  pagesCount: number;
  pageSize: number;
  page: number;
  totalCount: number;
  items: BlogNotUserId[];
};

type InfoImages = {
  wallpaper: Wallpaper;
  main: Main[];
};

type Wallpaper = {
  url: string;
  width: number;
  height: number;
  fileSize: number;
};

type Main = {
  url: string;
  width: number;
  height: number;
  fileSize: number;
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
  images: InfoImages;
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

export type AllMyGames = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Games[];
};

type Games = {
  id: string;
  firstPlayerProgress: {
    answers: Answers[];
    player: {
      id: string;
      login: string;
    };
    score: number;
  };
  secondPlayerProgress: {
    answers: Answers[];
    player: {
      id: string;
      login: string;
    };
    score: number;
  };
  questions: Questions[];
  status: 'PendingSecondPlayer' | 'Active' | 'Finished';
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
};

type Answers = {
  questionId: string;
  answerStatus: 'Correct' | 'Incorrect';
  addedAt: string;
};

type Questions = {
  id: string;
  body: string;
};

export type AllStatistics = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Statistics[];
};

type Statistics = {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: {
    id: string;
    login: string;
  };
};

export type TelegramUpdateMessage = {
  message: {
    from: {
      id: number;
      first_name: string;
      last_name: string;
    };
    text: string;
  };
};
