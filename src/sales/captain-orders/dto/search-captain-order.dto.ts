import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class SearchCaptainOrderDto {
  @IsOptional()
  @IsString()
  captain_order_number?: string;

  @IsOptional()
  @IsDateString()
  captain_order_date?: Date;

  @IsOptional()
  @IsString()
  captain_order_status?: string;

  @IsOptional()
  @IsInt()
  casher?: number;

  @IsOptional()
  @IsInt()
  waiter?: number;

  @IsOptional()
  @IsInt()
  facility_type?: number;
}
