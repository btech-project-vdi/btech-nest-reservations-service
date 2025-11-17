import { Injectable } from '@nestjs/common';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { AdminProgrammingService } from 'src/common/services/admin-programming.service';
import { handleValidationError } from 'src/common/helpers/handle-validation-error.helper';
import { ReservationLaboratoryEquipmentValidationService } from 'src/reservation-laboratory-equipment/services/validation/reservation-laboratory-equipment-validation.service';
import {
  ValidateRepeatedReservationDto,
  ValidateRepeatedReservationResponseDto,
} from 'src/reservation/dto/validate-repeated-reservation.dto';
import { validateRepeatedReservationDates } from 'src/reservation/helpers/validate-repeated-reservation-dates.helper';
import { generatePotentialDates } from 'src/reservation/helpers/generate-potential-dates.helper';
import { validateSingleReservation } from 'src/reservation/helpers/validate-single-reservation.helper';
import { checkExistingUserReservations } from 'src/reservation/helpers/check-existing-user-reservations.helper';

@Injectable()
export class ReservationValidateRepeatedService {
  constructor(
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly adminProgrammingService: AdminProgrammingService,
    private readonly reservationLaboratoryEquipmentValidationService: ReservationLaboratoryEquipmentValidationService,
  ) {}

  async execute(validateDto: ValidateRepeatedReservationDto): Promise<{
    validReservations: ValidateRepeatedReservationResponseDto[];
    invalidReservations: ValidateRepeatedReservationResponseDto[];
  }> {
    const { programmingSubscriptionDetailId, laboratoryEquipmentId, user } =
      validateDto;

    const programmingDays =
      await this.adminProgrammingService.findDaysWithDetails(
        programmingSubscriptionDetailId,
      );

    const { repeatStartDate, repeatEndDate } = validateRepeatedReservationDates(
      validateDto.initialDate,
      validateDto.initialHour,
      validateDto.repeatEndDate,
      programmingDays,
    );

    const laboratoryEquipment =
      await this.adminLaboratoriesService.findLaboratoryEquipmentByLaboratoryEquipmentId(
        laboratoryEquipmentId,
      );

    const maxCapacity = laboratoryEquipment.quantity;
    const labEquipmentId = laboratoryEquipmentId;

    const allRelevantExistingReservations =
      await this.reservationLaboratoryEquipmentValidationService.findReservationsByEquipmentAndDateRange(
        {
          laboratoryEquipmentId,
          initialDate: repeatStartDate.toString(),
          finalDate: repeatEndDate.toString(),
        },
      );

    const searchEndDate = new Date(repeatEndDate.getTime());
    searchEndDate.setDate(searchEndDate.getDate() + 1);

    const existingUserReservations =
      await this.reservationLaboratoryEquipmentValidationService.findReservationsByUserAndDateRange(
        user.subscriberId,
        repeatStartDate,
        searchEndDate,
      );

    const potentialReservationInstances = generatePotentialDates(
      repeatStartDate,
      repeatEndDate,
      validateDto.repeatPattern,
      validateDto.daysOfWeek || [],
      programmingDays,
      validateDto.initialHour,
      validateDto.finalHour,
      new Date(validateDto.initialDate),
      new Date(validateDto.finalDate),
    );

    const validationResults = await Promise.all(
      potentialReservationInstances.map((reservationInstance) => {
        const equipmentAvailability = validateSingleReservation(
          reservationInstance.reservationDate,
          reservationInstance.reservationFinalDate,
          validateDto.initialHour,
          validateDto.finalHour,
          labEquipmentId,
          maxCapacity,
          allRelevantExistingReservations,
          programmingDays,
        );

        if (!equipmentAvailability.isValid) return equipmentAvailability;

        try {
          const reservationDetail = {
            laboratoryEquipmentId: labEquipmentId,
            initialDate: reservationInstance.reservationDate
              .toISOString()
              .split('T')[0],
            initialHour: validateDto.initialHour,
            finalDate: reservationInstance.reservationFinalDate
              .toISOString()
              .split('T')[0],
            finalHour: validateDto.finalHour,
            dayName: reservationInstance.reservationDate
              .toLocaleDateString('es-ES', { weekday: 'long' })
              .toLowerCase()
              .replace(/^\w/, (c) => c.toUpperCase()),
            metadata: {},
          };

          checkExistingUserReservations(
            reservationDetail,
            existingUserReservations,
          );

          return { isValid: true };
        } catch (error) {
          const errorMessage = handleValidationError(
            error,
            'Conflicto con reservas existentes del usuario',
          );
          return {
            isValid: false,
            reason: errorMessage,
          };
        }
      }),
    );

    const validReservations: ValidateRepeatedReservationResponseDto[] = [];
    const invalidReservations: ValidateRepeatedReservationResponseDto[] = [];

    validationResults.forEach((result, index) => {
      const reservationInstance = potentialReservationInstances[index];
      const reservationData = {
        dayName: reservationInstance.reservationDate
          .toLocaleDateString('es-ES', { weekday: 'long' })
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase()),
        laboratoryEquipmentId: labEquipmentId,
        initialDate: reservationInstance.reservationDate
          .toISOString()
          .split('T')[0],
        finalDate: reservationInstance.reservationFinalDate
          .toISOString()
          .split('T')[0],
        initialHour: validateDto.initialHour,
        finalHour: validateDto.finalHour,
      };

      if (result.isValid) {
        validReservations.push(reservationData);
      } else {
        invalidReservations.push({
          ...reservationData,
          reason: result.reason,
        });
      }
    });

    return {
      validReservations,
      invalidReservations,
    };
  }
}
