import { Observable } from 'rxjs';
import {
  FindSubscribersWithNaturalPersonsDto,
  FindSubscribersWithNaturalPersonsResponseDto,
} from '../dto/find-subscribers-with-natural-persons.dto';
import {
  ValidateSubscriberAlertLevelDto,
  ValidateSubscriberAlertLevelResponseDto,
} from '../dto/validate-subscriber-alert-level.dto';
import {
  FindUserProfileDto,
  UserProfileResponseDto,
} from '../dto/find-user-profile.dto';

export interface SubscribersService {
  findSubscribersWithNaturalPersons(
    data: FindSubscribersWithNaturalPersonsDto,
  ): Observable<FindSubscribersWithNaturalPersonsResponseDto>;

  validateSubscriberAlertLevel(
    data: ValidateSubscriberAlertLevelDto,
  ): Observable<ValidateSubscriberAlertLevelResponseDto>;

  findUserProfile(data: FindUserProfileDto): Observable<UserProfileResponseDto>;
}
