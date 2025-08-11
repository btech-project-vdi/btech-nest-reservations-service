import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { FindDaysWithDetailsDto } from 'src/common/dto/find-days-with-details.dto';

export const validateRepeatedReservationDates = (
  initialDate: string,
  initialHour: string,
  repeatEndDate: string | undefined,
  programmingDays: FindDaysWithDetailsDto[],
): { repeatStartDate: Date; repeatEndDate: Date } => {
  const subscriptionDetail = programmingDays[0].programmingSubscriptionDetail;
  const initialDateSubscription = new Date(subscriptionDetail.initialDate);
  const finalDateSubscription = new Date(subscriptionDetail.finalDate);

  const repeatStartDate = new Date(`${initialDate}T${initialHour}:00.000Z`);
  const calculatedRepeatEndDate = repeatEndDate
    ? new Date(repeatEndDate)
    : finalDateSubscription;

  const currentDateTime = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }),
  );

  if (repeatStartDate < currentDateTime)
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message:
        'La fecha de inicio de la repetición no puede ser anterior a la fecha y hora actual.',
    });

  if (repeatStartDate < initialDateSubscription)
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message:
        'La fecha de inicio de la repetición no puede ser anterior a la fecha inicial de la programación.',
    });

  if (calculatedRepeatEndDate > finalDateSubscription)
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message:
        'La fecha de finalización de la repetición no puede ser posterior a la fecha final de la programación.',
    });

  if (repeatStartDate > calculatedRepeatEndDate)
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message:
        'La fecha de inicio de la repetición no puede ser posterior a la fecha de finalización de la repetición.',
    });

  return {
    repeatStartDate,
    repeatEndDate: calculatedRepeatEndDate,
  };
};
