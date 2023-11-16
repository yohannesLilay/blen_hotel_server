import { PartialType } from '@nestjs/swagger';
import { CreateCaptainOrderDto } from './create-captain-order.dto';

export class UpdateCaptainOrderDto extends PartialType(CreateCaptainOrderDto) {}
