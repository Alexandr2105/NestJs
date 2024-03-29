import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryCount {
  skipHelper = (pageNumber: number, pageSize: number) => {
    return (pageNumber - 1) * pageSize;
  };

  pagesCountHelper = (totalCount: number, pageSize: number) => {
    return Math.ceil(totalCount / pageSize);
  };

  queryCheckHelper = (query: any) => {
    const pageNumber =
      query.pageNumber <= 0 || isNaN(query.pageNumber) ? 1 : +query.pageNumber;
    const pageSize =
      query.pageSize <= 0 || isNaN(query.pageSize) ? 10 : +query.pageSize;
    const sortBy =
      query.sortBy === '' || query.sortBy === undefined
        ? 'createdAt'
        : query.sortBy;
    const sortDirection =
      query.sortDirection === '' || query.sortDirection === undefined
        ? 'desc'
        : query.sortDirection;
    const searchNameTerm =
      query.searchNameTerm === undefined ? '' : query.searchNameTerm;
    const searchLoginTerm =
      query.searchLoginTerm === '' || query.searchLoginTerm === undefined
        ? ''
        : query.searchLoginTerm;
    const searchEmailTerm =
      query.searchEmailTerm === '' || query.searchEmailTerm === undefined
        ? ''
        : query.searchEmailTerm;
    const banStatus =
      query.banStatus === undefined || query.banStatus === ''
        ? 'all'
        : query.banStatus;
    const bodySearchTerm =
      query.bodySearchTerm === '' || query.bodySearchTerm === undefined
        ? ''
        : query.bodySearchTerm;
    let publishedStatus;
    if (
      query.publishedStatus === 'all' ||
      query.publishedStatus === '' ||
      query.publishedStatus === undefined
    ) {
      publishedStatus = '';
    } else if (query.publishedStatus === 'published') {
      publishedStatus = true;
    } else if (query.publishedStatus === 'notPublished') {
      publishedStatus = false;
    }
    let sort = {};
    if (query.sort === undefined) {
      sort = { avgScores: 'desc', sumScore: 'desc' };
    } else if (Array.isArray(query.sort)) {
      for (const p of query.sort) {
        Object.assign(sort, { [p.split(' ')[0]]: p.split(' ')[1] });
      }
    } else {
      sort = { [query.sort.split(' ')[0]]: query.sort.split(' ')[1] };
    }

    return {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
      searchLoginTerm,
      searchEmailTerm,
      banStatus,
      bodySearchTerm,
      publishedStatus,
      sort,
    };
  };
}
