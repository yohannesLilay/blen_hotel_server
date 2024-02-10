import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class ProductSalesReportDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @IsDateString()
  @IsNotEmpty()
  end_date: Date;

  @IsNotEmpty()
  @IsInt()
  product_id: number;
}
