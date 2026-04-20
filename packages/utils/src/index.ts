// Shared utility functions

export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const slugify = (str: string): string =>
  str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export const paginate = <T>(items: T[], page: number, limit: number) => {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
};
