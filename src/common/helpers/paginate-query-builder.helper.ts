import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationDto, PaginationResponseDto } from '../dto/pagination.dto';

export const paginateQueryBuilder = async <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  paginationDto: PaginationDto,
): Promise<PaginationResponseDto<T>> => {
  const { page = 1, limit = 8 } = paginationDto;
  const skip = (page - 1) * limit;
  queryBuilder.skip(skip).take(limit);
  const [data, total] = await queryBuilder.getManyAndCount();
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
