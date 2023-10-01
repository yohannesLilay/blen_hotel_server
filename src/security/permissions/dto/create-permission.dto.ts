import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { UniqueCodeNameValidator } from '../validators/unique-code-name.validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(5, { message: 'Name must have at least 5 characters.' })
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(5, { message: 'Code Name must have at least 5 characters.' })
  @IsNotEmpty()
  @Validate(UniqueCodeNameValidator)
  code_name: string;
}
