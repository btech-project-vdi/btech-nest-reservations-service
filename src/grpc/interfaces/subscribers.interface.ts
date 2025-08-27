import { Observable } from 'rxjs';
import {
  FindSubscribersWithNaturalPersonsDto,
  FindSubscribersWithNaturalPersonsResponseDto,
} from '../dto/find-subscribers-with-natural-persons.dto';

export interface SubscribersService {
  findSubscribersWithNaturalPersons(
    data: FindSubscribersWithNaturalPersonsDto,
  ): Observable<FindSubscribersWithNaturalPersonsResponseDto>;
}
