import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class SalesByStaffReportDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @IsDateString()
  @IsNotEmpty()
  end_date: Date;

  @IsNotEmpty()
  @IsInt()
  staff_id: number;
}
