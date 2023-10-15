import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

/** DTOs */
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/** Entities */
import { User } from './entities/user.entity';

/** Services */
import { RolesService } from '../roles/roles.service';

/** Constants */
import { Gender } from './constants/gender.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      phone_number: createUserDto.phone_number,
      gender: createUserDto.gender,
      password: createUserDto.password,
    });
    user.roles = await this.rolesService.findByIds(createUserDto.roles);

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: ['roles'] });
  }

  async template() {
    const roles = await this.rolesService.findAll();
    return {
      roleOptions: roles,
      genderOptions: Gender,
    };
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email: email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { phone_number: phoneNumber },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (id == 1) throw new NotFoundException('User can not be updated!');
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found.');

    user.name = updateUserDto.name;
    user.email = updateUserDto.email;
    user.phone_number = updateUserDto.phone_number;
    user.gender = updateUserDto.gender;
    user.roles = await this.rolesService.findByIds(updateUserDto.roles);

    return await this.userRepository.save(user);
  }

  async toggleStatus(id: number): Promise<User> {
    if (id == 1) throw new NotFoundException('User can not be updated!');
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found.');

    user.status = !user.status;

    return await this.userRepository.save(user);
  }

  async updateRefreshToken(id: number, refreshToken: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found.');

    user.refresh_token = refreshToken;

    return await this.userRepository.save(user);
  }

  async changeUserPassword(
    userId: number,
    newPassword: string,
  ): Promise<User | undefined> {
    const user = await this.findOne(userId);

    if (!user) throw new NotFoundException('User not found.');

    user.password = newPassword;
    return this.userRepository.save(user);
  }

  async setLastLogin(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found.');

    user.last_login = new Date();

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    if (id == 1) throw new NotFoundException('User can not be deleted!');
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found.');

    await this.userRepository.remove(user);
  }

  async seed(): Promise<void> {
    let superAdminUser = await this.userRepository.findOne({
      where: { email: 'yohannesLilay@gmail.com' },
    });

    if (!superAdminUser) {
      superAdminUser = this.userRepository.create({
        name: 'Yohannes Lilay',
        email: 'yohannesLilay@gmail.com',
        phone_number: '+251923302158',
        gender: Gender.MALE,
        password: 'Password@1',
      });

      const superAdminRole = await this.rolesService.findByName('SUPER ADMIN');

      if (superAdminRole) {
        superAdminUser.roles = [superAdminRole];
      }

      await this.userRepository.save(superAdminUser);
      console.log('User seeded successfully.');
    } else {
      console.log('User already exists. No action taken.');
    }
  }
}
