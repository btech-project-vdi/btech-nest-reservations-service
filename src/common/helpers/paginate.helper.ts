import { PaginationDto } from '../dto/pagination.dto';
import { Paginated } from '../interfaces/paginated.interface';

export const paginate = async <T>(
  data: T[],
  paginationDto: PaginationDto,
): Promise<Paginated<T>> => {
  const { page = 1, limit = 8 } = paginationDto;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedItems = data.slice(start, end);
  return {
    data: await Promise.all(paginatedItems),
    total: data.length,
    page,
    limit,
    totalPages: Math.ceil(data.length / limit),
  };
};
