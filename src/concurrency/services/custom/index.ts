export * from './concurrency-equipment-count-reservations-in-group.service';
export * from './concurrency-equipment-custom.service';
export * from './concurrency-limit-find-applicable.service';
export * from './concurrency-limit-custom.service';

import { ConcurrencyEquipmentCountReservationsInGroupService } from './concurrency-equipment-count-reservations-in-group.service';
import { ConcurrencyEquipmentCustomService } from './concurrency-equipment-custom.service';
import { ConcurrencyLimitFindApplicableService } from './concurrency-limit-find-applicable.service';
import { ConcurrencyLimitCustomService } from './concurrency-limit-custom.service';

export const CONCURRENCY_CUSTOM_SERVICES = [
  ConcurrencyEquipmentCountReservationsInGroupService,
  ConcurrencyEquipmentCustomService,
  ConcurrencyLimitFindApplicableService,
  ConcurrencyLimitCustomService,
];
