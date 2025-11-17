export * from './concurrency-equipment-validate-concurrency.service';
export * from './concurrency-equipment-validation.service';

import { ConcurrencyEquipmentValidateConcurrencyService } from './concurrency-equipment-validate-concurrency.service';
import { ConcurrencyEquipmentValidationService } from './concurrency-equipment-validation.service';

export const CONCURRENCY_VALIDATION_SERVICES = [
  ConcurrencyEquipmentValidateConcurrencyService,
  ConcurrencyEquipmentValidationService,
];
