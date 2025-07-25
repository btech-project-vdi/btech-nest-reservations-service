import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateReservationDto,
  CreateReservationResponseDto,
} from '../dto/create-reservation.dto';
import { ReservationLaboratoryEquipmentService } from './reservation-laboratory-equipment.service';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { RpcException } from '@nestjs/microservices';
import { validateSelfOverlappingReservations } from '../helpers/validate-selft-overlapping-reservations.helper';
import { validateUniqueEquipmentPerDayInRequest } from '../helpers/validate-unique-equipment-per-day-in-request.helper';
import { isValidDayOfWeek } from '../helpers/is-valid-day-of-week.helper';
import { AdminLaboratoriesService } from '../../common/services/admin-laboratories.service';
import { validateReservationHourRange } from '../helpers/validate-reservation-hour-range.helper';
import { checkExistingUserReservations } from '../helpers/check-existing-user-reservations.helper';
import { validateReservationDate } from '../helpers/validate-reservation-date.helper';
import { getNextDayName } from 'src/common/helpers/get-day-name.helper';
import { AdminProgrammingService } from 'src/common/services/admin-programming.service';
import { FindOneByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-by-laboratory-equipment-id.dto';
import { ValidateHoursDisponibilityDto } from '../dto/validate-hours-disponibility.dto';
import { StatusReservation } from '../enums/status-reservation.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { Repository } from 'typeorm';
import { FindAvailableProgrammingHoursResponseDto } from 'src/common/dto/find-available-programming-hours.dto';
import { formatValidateHoursResponse } from '../helpers/formate-validate-hours-response.helper';
import { formatReservationResponse } from '../helpers/format-reservation-response.helper';
import { AvailableSlotDto } from '../dto/get-available-slot.dto';
import {
  ValidateRepeatedReservationDto,
  ValidateRepeatedReservationResponseDto,
} from '../dto/validate-repeated-reservation.dto';
import { generatePotentialDates } from '../helpers/generate-potential-dates.helper';
import { validateSingleReservation } from '../helpers/validate-single-reservation.helper';
import {
  FindAllReservationsDto,
  FindAllReservationsResponseDto,
} from '../dto/find-all-reservations.dto';
import { formatFindReservationsResponse } from '../helpers/format-find-reservations-response.helper';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { paginate } from 'src/common/helpers/paginate.helper';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto } from 'src/common/dto/find-laboratories-by-laboratories-subscription-detail-ids.dto';
import { Paginated } from 'src/common/dto/paginated.dto';
import { EmailsClient } from '../../grpc/clients/emails.client';
import { formatDateToSpanish } from '../helpers/format-date-to-spanish.helper';
import { InformationSubscriberDto } from '../dto/information-subscriber.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly adminProgrammingService: AdminProgrammingService,
    private readonly EmailsClient: EmailsClient,
  ) {}
  async createReservation(
    user: SessionUserDataDto,
    createReservationDto: CreateReservationDto,
  ) {
    const { metadata, reservationDetails, informationSubscriber } =
      createReservationDto;
    const existingUserReservations = await this.prepareAndValidateReservation(
      user,
      reservationDetails,
    );
    await Promise.all(
      reservationDetails.map(async (detail, index) =>
        this.validateReservationDetail(
          detail,
          index,
          user,
          user.subscriberId,
          existingUserReservations,
        ),
      ),
    );
    const reservation = this.reservationRepository.create({
      subscriberId: user.subscriberId,
      username: user.username,
      metadata: metadata ?? {
        'Fecha de creación': new Date().toISOString(),
        'Codigo de usuario': user.username,
      },
      reservationLaboratoryEquipment: await Promise.all(
        reservationDetails.map((detail) =>
          this.reservationLaboratoryEquipmentService.create(detail),
        ),
      ),
    });
    const reservationSaved = await this.reservationRepository.save(reservation);
    const reservationFormatted = formatReservationResponse(reservationSaved);
    await this.sendEmailForConfirmationReservation(
      reservationFormatted,
      informationSubscriber,
    );
    return reservationFormatted;
  }

  async findAll(
    user: SessionUserDataDto,
    findAllReservationsDto: FindAllReservationsDto,
  ): Promise<Paginated<FindAllReservationsResponseDto>> {
    const { status, ...paginationDto } = findAllReservationsDto;
    const queryBuilder = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.reservationLaboratoryEquipment', 'rle')
      .select([
        'reservation.reservationId',
        'reservation.subscriberId',
        'reservation.username',
        'reservation.metadata',
        'reservation.createdAt',
        'rle.reservationLaboratoryEquipmentId',
        'rle.laboratoryEquipmentId',
        'rle.reservationDate',
        'rle.reservationFinalDate',
        'rle.initialHour',
        'rle.finalHour',
        'rle.metadata',
      ])
      .where('reservation.subscriberId = :subscriberId', {
        subscriberId: user.subscriberId,
      })
      .orderBy('reservation.createdAt', 'DESC');

    if (status)
      queryBuilder.andWhere('rle.status IN (:...status)', {
        status: Array.isArray(status) ? status : [status],
      });
    const reservations = await queryBuilder.getMany();
    const laboratoryEquipmentIds = [
      ...new Set(
        reservations
          .flatMap((r) => r.reservationLaboratoryEquipment)
          .map((rle) => rle.laboratoryEquipmentId)
          .filter(Boolean),
      ),
    ];
    const equipmentMap = await this.findEquipmentMapData(
      laboratoryEquipmentIds,
    );

    const reservationsResponseFormat = formatFindReservationsResponse(
      reservations,
      equipmentMap,
    );
    return paginate(reservationsResponseFormat, paginationDto);
  }

  async validateRepeatedReservation(
    validateDto: ValidateRepeatedReservationDto,
  ): Promise<{
    validReservations: ValidateRepeatedReservationResponseDto[];
    invalidReservations: ValidateRepeatedReservationResponseDto[];
  }> {
    const { programmingSubscriptionDetailId, laboratoryEquipmentId } =
      validateDto;

    const programmingDays =
      await this.adminProgrammingService.findDaysWithDetails(
        programmingSubscriptionDetailId,
      );

    const subscriptionDetail = programmingDays[0].programmingSubscriptionDetail;
    const initialDateSubscription = new Date(subscriptionDetail.initialDate);
    const finalDateSubscription = new Date(subscriptionDetail.finalDate);

    const repeatStartDate = new Date(validateDto.initialDate);
    const repeatEndDate = validateDto.repeatEndDate
      ? new Date(validateDto.repeatEndDate)
      : finalDateSubscription; // Validaciones de rango de repetición con la suscripción

    if (repeatStartDate < initialDateSubscription)
      throw new RpcException({
        code: HttpStatus.BAD_REQUEST,
        message: `La fecha de inicio de la repetición no puede ser anterior a la fecha inicial de la programación.`,
      });

    if (repeatEndDate > finalDateSubscription)
      throw new RpcException({
        code: HttpStatus.BAD_REQUEST,
        message: `La fecha de finalización de la repetición no puede ser posterior a la fecha final de la programación.`,
      });

    if (repeatStartDate > repeatEndDate)
      throw new RpcException({
        code: HttpStatus.BAD_REQUEST,
        message: `La fecha de inicio de la repetición no puede ser posterior a la fecha de finalización de la repetición.`,
      });

    const laboratoryEquipment =
      await this.adminLaboratoriesService.findLaboratoryEquipmentByLaboratoryEquipmentId(
        laboratoryEquipmentId,
      );

    const maxCapacity = laboratoryEquipment.quantity;
    const labEquipmentId = laboratoryEquipmentId;

    // ESTO SÍ ES CORRECTO.
    const allRelevantExistingReservations =
      await this.reservationLaboratoryEquipmentService.findReservationsByEquipmentAndDateRange(
        {
          laboratoryEquipmentId,
          initialDate: repeatStartDate.toString(),
          finalDate: repeatEndDate.toString(),
        },
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
    ); // Validar disponibilidad para cada fecha potencial

    const validationResults = await Promise.all(
      potentialReservationInstances.map((reservationInstance) => {
        return validateSingleReservation(
          reservationInstance.reservationDate,
          reservationInstance.reservationFinalDate,
          validateDto.initialHour,
          validateDto.finalHour,
          labEquipmentId,
          maxCapacity,
          allRelevantExistingReservations,
          programmingDays,
        );
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

  private async prepareAndValidateReservation(
    user: SessionUserDataDto,
    reservationDetails: CreateReservationDetailDto[],
  ): Promise<ReservationLaboratoryEquipment[]> {
    // 1. Validaciones "locales" (dentro de la misma solicitud)
    validateSelfOverlappingReservations(reservationDetails);
    validateUniqueEquipmentPerDayInRequest(reservationDetails);

    // Determinar el rango de fechas de la nueva reserva
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    if (reservationDetails.length === 0)
      throw new RpcException({
        code: HttpStatus.BAD_REQUEST,
        message:
          'La solicitud de reserva no contiene detalles. Por favor, agregue detalles a la solicitud de reserva.',
      });

    for (const detail of reservationDetails) {
      const currentDate = new Date(detail.initialDate);
      if (isNaN(currentDate.getTime()))
        // Validar que la fecha sea válida
        throw new RpcException({
          code: HttpStatus.BAD_REQUEST,
          message: `La fecha de inicio de la reserva no es válida: ${detail.initialDate}`,
        });
      if (!minDate || currentDate < minDate) minDate = currentDate;
      if (!maxDate || currentDate > maxDate) maxDate = currentDate;
    }

    // Ampliar el rango de búsqueda para incluir el día completo de la fecha final
    const searchStartDate = minDate as Date;
    const searchEndDate = new Date((maxDate as Date).getTime());
    searchEndDate.setDate(searchEndDate.getDate() + 1);

    // Obtener todas las reservas existentes del usuario para el rango de fechas relevante
    const existingUserReservations =
      await this.reservationLaboratoryEquipmentService.findReservationsByUserAndDateRange(
        user.subscriberId,
        searchStartDate,
        searchEndDate,
      );

    return existingUserReservations;
  }

  private async validateReservationDetail(
    detail: CreateReservationDetailDto,
    index: number,
    user: SessionUserDataDto,
    userId: string,
    existingUserReservations: ReservationLaboratoryEquipment[],
  ) {
    isValidDayOfWeek(detail.dayName, detail.initialDate);
    const laboratory =
      await this.adminLaboratoriesService.findOneByLaboratoryEquipmentId(
        detail.laboratoryEquipmentId,
      );
    validateReservationHourRange(
      detail.initialHour,
      detail.finalHour,
      detail.initialDate,
      detail.finalDate,
      index,
    );
    checkExistingUserReservations(detail, existingUserReservations);
    validateReservationDate(detail.initialDate, index);
    const crossesMidnight = detail.finalHour < detail.initialHour;
    if (crossesMidnight) {
      const nextDayName = getNextDayName(detail.dayName);
      await this.validateConsecutiveDaysAvailability(
        detail,
        user,
        userId,
        laboratory,
        nextDayName,
      );
    } else {
      await this.validateSingleDayAvailability(
        detail,
        user,
        laboratory,
        userId,
      );
    }
  }

  private async validateConsecutiveDaysAvailability(
    detail: CreateReservationDetailDto,
    user: SessionUserDataDto,
    userId: string,
    laboratory: FindOneByLaboratoryEquipmentIdResponseDto,
    nextDayName: string,
  ) {
    // Validar parte del día inicial (desde initialHour hasta 23:59)
    const initialDayAvailability = await this.validateHoursDisponibility(
      {
        dayOfWeek: detail.dayName,
        date: detail.initialDate.split('T')[0],
        initialHour: detail.initialHour,
        finalHour: '23:59',
        subscriptionDetailId: user.subscription.subscriptionDetailId,
        numberReservationDays: laboratory.parameters.numberReservationDay,
      },
      userId,
    );
    // Calcular fecha del día siguiente
    const nextDayDate = new Date(detail.initialDate);
    nextDayDate.setDate(nextDayDate.getDate() + 1);
    const nextDayDateStr = nextDayDate.toISOString().split('T')[0];
    // Validar parte del día siguiente (desde 00:00 hasta finalHour)
    const nextDayAvailability = await this.validateHoursDisponibility(
      {
        dayOfWeek: nextDayName,
        date: nextDayDateStr,
        initialHour: '00:00',
        finalHour: detail.finalHour,
        subscriptionDetailId: user.subscription.subscriptionDetailId,
        numberReservationDays: laboratory.parameters.numberReservationDay,
      },
      userId,
    );

    if (initialDayAvailability.length === 0 || nextDayAvailability.length === 0)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El laboratorio no tiene programación disponible para la reserva que cruza medianoche entre ${detail.dayName} y ${nextDayName}`,
      });
  }

  private async validateSingleDayAvailability(
    detail: CreateReservationDetailDto,
    user: SessionUserDataDto,
    laboratory: FindOneByLaboratoryEquipmentIdResponseDto,
    userId: string,
  ) {
    const availability = await this.validateHoursDisponibility(
      {
        dayOfWeek: detail.dayName,
        date: detail.initialDate.split('T')[0],
        initialHour: detail.initialHour,
        finalHour: detail.finalHour,
        subscriptionDetailId: user.subscription.subscriptionDetailId,
        numberReservationDays: laboratory.parameters.numberReservationDay,
      },
      userId,
    );

    if (availability.length === 0)
      throw new RpcException({
        status: 400,
        message: `El laboratorio no se encuentra disponible para la fecha seleccionada ${detail.initialDate} y hora seleccionada ${detail.initialHour} - ${detail.finalHour}`,
      });
  }

  async validateHoursDisponibility(
    validateHoursDisponibilityDto: ValidateHoursDisponibilityDto,
    userId: string,
  ) {
    const {
      dayOfWeek,
      date,
      initialHour,
      finalHour,
      subscriptionDetailId,
      numberReservationDays,
    } = validateHoursDisponibilityDto;

    const queryDate = new Date(date);
    const initialHourString = `${initialHour}:00`;
    const finalHourString = `${finalHour}:00`;
    const queryDateFormatted = queryDate.toISOString().split('T')[0];
    // 1. Validar límite de reservas del usuario
    await this.hasUserReachedReservationLimit(
      userId,
      queryDateFormatted,
      numberReservationDays,
    );
    // 2. Obtener subscription details activos
    const laboratoriesSubscriptionDetailsIds =
      await this.adminLaboratoriesService.findLaboratoriesSubscriptionDetailsIdsBySubscriptionDetailId(
        subscriptionDetailId,
      );

    // 3. Obtener horarios de programación disponibles
    const availableProgrammingHours =
      await this.adminProgrammingService.findAvailableProgrammingHours({
        laboratoriesSubscriptionDetailsIds,
        dayOfWeek,
        queryDate: queryDateFormatted,
        initialHour: initialHourString,
        finalHour: finalHourString,
      });

    if (!availableProgrammingHours.length) return [];

    const laboratoriesInfo =
      await this.adminLaboratoriesService.findByLaboratoriesSubscriptionDetailsIds(
        laboratoriesSubscriptionDetailsIds,
      );

    // 5. Verificar disponibilidad real
    const resultWithAvailability = await this.getAvailableSlots(
      availableProgrammingHours,
      laboratoriesInfo,
      queryDateFormatted,
      initialHourString,
      finalHourString,
    );
    const validSlots = resultWithAvailability.filter(
      (slot) =>
        slot &&
        slot.laboratory &&
        slot.laboratory.equipment &&
        slot.laboratory.equipment.length > 0,
    );
    return validSlots.flatMap((slot: AvailableSlotDto) => {
      return formatValidateHoursResponse(slot);
    });
  }

  async hasUserReachedReservationLimit(
    userId: string,
    date: string,
    numberReservationDays: number,
  ): Promise<void> {
    const reservationsCount = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin(
        'reservation.reservationLaboratoryEquipment',
        'reservationLaboratoryEquipment',
      )
      .where('reservation.subscriberId = :userId', { userId })
      .andWhere('reservationLaboratoryEquipment.reservationDate = :date', {
        date,
      })
      .andWhere('reservationLaboratoryEquipment.status IN (:...statuses)', {
        statuses: [StatusReservation.PENDING, StatusReservation.CONFIRMED],
      })
      .getCount();
    if (reservationsCount >= numberReservationDays)
      throw new RpcException({
        status: 400,
        message: `El usuario ha alcanzado el límite de reservas para la fecha: ${date}`,
      });
  }

  private async getAvailableSlots(
    availableProgrammingHours: FindAvailableProgrammingHoursResponseDto[],
    laboratoriesInfo: FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto[],
    queryDateFormatted: string,
    initialHourString: string,
    finalHourString: string,
  ) {
    return await Promise.all(
      availableProgrammingHours.map(async (slot) => {
        const equipmentWithAvailability = await Promise.all(
          laboratoriesInfo.map(async (le) => {
            if (!le.laboratoryEquipmentId) {
              return {
                ...le,
                availableQuantity: 0,
                isAvailable: false,
              };
            }
            const overlappingReservationsCount =
              await this.reservationLaboratoryEquipmentService.checkAvailability(
                le.laboratoryEquipmentId,
                queryDateFormatted,
                initialHourString,
                finalHourString,
              );
            const availableQuantity =
              le.quantity - overlappingReservationsCount;
            return {
              equipmentId: le.equipment.equipmentId,
              description: le.equipment.description,
              quantity: le.quantity,
              availableQuantity,
              isAvailable: availableQuantity > 0,
              resources: le.equipment.equipmentResources.map((er) => ({
                attribute: er.attribute.description,
                resource: er.description,
              })),
            };
          }),
        );
        const firstLab = laboratoriesInfo[0];
        return {
          laboratoryId: firstLab.laboratory.laboratoryId,
          laboratoryEquipmentId: firstLab.laboratoryEquipmentId,
          description: firstLab.laboratory.description,
          slotId: slot.programmingHoursId,
          initialHour: slot.initialHour,
          finalHour: slot.finalHour,
          laboratory: {
            laboratoryId: firstLab.laboratory.laboratoryId,
            description: firstLab.laboratory.description,
            equipment: equipmentWithAvailability.filter((e) => e.isAvailable),
          },
        };
      }),
    );
  }

  async findEquipmentMapData(
    laboratoryEquipmentIds: string[],
  ): Promise<
    Map<string, FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto>
  > {
    const equipmentDataPromises = laboratoryEquipmentIds.map((id) =>
      this.adminLaboratoriesService.findLaboratoryEquipmentByLaboratoryEquipmentId(
        id,
      ),
    );
    const equipmentData = await Promise.all(equipmentDataPromises);
    const equipmentMap = new Map(
      equipmentData.map((equipment) => [
        equipment.laboratoryEquipmentId,
        equipment,
      ]),
    );
    return equipmentMap;
  }

  private async sendEmailForConfirmationReservation(
    reservation: CreateReservationResponseDto,
    informationSubscriber: InformationSubscriberDto,
  ) {
    const { reservationLaboratoryEquipment } = reservation;

    const details = await Promise.all(
      reservationLaboratoryEquipment.map(async (rle) => {
        const equipmentMap = await this.findEquipmentMapData([
          rle.laboratoryEquipmentId,
        ]);
        const equipmentData = equipmentMap.get(rle.laboratoryEquipmentId);

        return {
          labDescription: equipmentData?.laboratory?.description || '',
          equipmentDescription: equipmentData?.equipment?.description || '',
          date: formatDateToSpanish(rle.reservationDate),
          startTime: rle.initialHour,
          endTime: rle.finalHour,
        };
      }),
    );

    await this.EmailsClient.sendLabReservationEmail({
      to: informationSubscriber.email,
      companyName: informationSubscriber.companyName,
      logoUrl: informationSubscriber.logoUrl,
      userName: informationSubscriber.subscriberName,
      reservationDate: formatDateToSpanish(reservation.createdAt),
      details,
      primaryColor: informationSubscriber.primaryColor,
    });
  }
}
