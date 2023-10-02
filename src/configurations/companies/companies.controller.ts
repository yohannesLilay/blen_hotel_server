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
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Permissions('add_company')
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return await this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Permissions('view_company')
  async findAll() {
    return await this.companiesService.findAll();
  }

  @Get(':id')
  @Permissions('view_company')
  async findOne(@Param('id') id: number) {
    return await this.companiesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_company')
  async update(
    @Param('id') id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    if (id != updateCompanyDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.companiesService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  @Permissions('delete_company')
  async remove(@Param('id') id: number) {
    return await this.companiesService.remove(+id);
  }
}
