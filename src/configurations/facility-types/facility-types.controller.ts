import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FacilityTypesService } from './facility-types.service';
import { CreateFacilityTypeDto } from './dto/create-facility-type.dto';
import { UpdateFacilityTypeDto } from './dto/update-facility-type.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('facility-types')
export class FacilityTypesController {
  constructor(private readonly facilityTypesService: FacilityTypesService) {}

  @Post()
  @Permissions('add_facility_type')
  async create(@Body() createFacilityTypeDto: CreateFacilityTypeDto) {
    return await this.facilityTypesService.create(createFacilityTypeDto);
  }

  @Get()
  @Permissions('view_facility_type')
  async findAll() {
    return await this.facilityTypesService.findAll();
  }

  @Get('template')
  @Permissions('add_facility_type')
  async template() {
    return await this.facilityTypesService.template();
  }

  @Get(':id')
  @Permissions('view_facility_type')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.facilityTypesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_facility_type')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacilityTypeDto: UpdateFacilityTypeDto,
  ) {
    if (id != updateFacilityTypeDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.facilityTypesService.update(+id, updateFacilityTypeDto);
  }

  @Delete(':id')
  @Permissions('delete_facility_type')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.facilityTypesService.remove(+id);
  }
}
