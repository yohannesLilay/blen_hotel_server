import { IsDateString, IsNotEmpty } from 'class-validator';

export class RoomRevenueReportDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @IsDateString()
  @IsNotEmpty()
  end_date: Date;
}
