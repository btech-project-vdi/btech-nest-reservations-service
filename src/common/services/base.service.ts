/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';
import { paginate } from '../helpers/paginate.helper';
import { Paginated } from '../dto/paginated.dto';

@Injectable()
export abstract class BaseService<T extends object> {
  constructor(private readonly repository: Repository<T>) {}

  async findAllBase<R>(
    data: R[],
    paginationDto: PaginationDto,
  ): Promise<Paginated<R>> {
    return await paginate(data, paginationDto);
  }

  async searchBase<R>(
    data: R[],
    term: string,
    paginationDto: PaginationDto,
    searchFields: string[],
  ): Promise<Paginated<R>> {
    const normalizedTerm = term.toLowerCase().trim();

    const filtered = data.filter((item) =>
      searchFields.some((fieldPath) => {
        const value = this.getNestedValue(item, fieldPath);

        if (Array.isArray(value)) {
          return value.some((element) => {
            if (typeof element === 'object' && element !== null) {
              return Object.values(element).some(
                (val) =>
                  typeof val === 'string' &&
                  val.toLowerCase().includes(normalizedTerm),
              );
            }

            return (
              typeof element === 'string' &&
              element.toLowerCase().includes(normalizedTerm)
            );
          });
        }

        return (
          typeof value === 'string' &&
          value.toLowerCase().includes(normalizedTerm)
        );
      }),
    );

    return await paginate(filtered, paginationDto);
  }

  async deleteAll(): Promise<void> {
    await this.repository.delete({});
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }
}
