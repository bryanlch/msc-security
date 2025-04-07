import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { LogInDto } from './dto/logIn.dto';
import { ResponseAPI } from 'src/enums/responses.enum';
import { LogUpDto } from './dto/logUp.dto';
import { PermissionsService } from '../permissions/permissions.service';
import { LogUpdateDto } from './dto/logUpdate.dto';
import { ListUserDto } from './dto/list.dto';
import { ProducerService } from 'src/communications/producer/producer.service';
import { ConsumerService } from 'src/communications/consumer/consumer.service';
import * as bcrypt from 'bcryptjs';
import { KeyService } from '../key/key.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly permissionsService: PermissionsService,
    private readonly producerService: ProducerService,
    private readonly consumerService: ConsumerService,
    private readonly keyService: KeyService,
  ) {}

  private async validateUserDuplicate(email: string) {
    try {
      const user = await this.userRepository.findOne({
        select: [
          'rolId',
          'name',
          'lastName',
          'email',
          'status',
          'password',
          'verifyAccount',
        ],
        where: { email: email },
      });

      if (!user) throw new Error(ResponseAPI.USER_NOT_FOUND);

      if (!user.status) throw new Error(ResponseAPI.USER_INACTIVE);

      if (!user.verifyAccount) throw new Error(ResponseAPI.USER_NOT_VERIFIED);

      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  private extractTokenFromHeader(authorization: string): string | undefined {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async signUp(user: LogUpDto) {
    try {
      const userExist = await this.userRepository.findOne({
        where: { email: user.email },
      });
      if (userExist) throw new Error(ResponseAPI.USER_EXIST);

      const rolValid = await this.permissionsService.findRolById(user.rolId);
      if (!rolValid) throw new Error(ResponseAPI.ROLE_NOT_FOUND);

      user.password = await this.getPassword(user.password);
      const newUser = await this.userRepository.create(user);
      await this.userRepository.save(newUser);
      const {
        id,
        rolId,
        password,
        createdAt,
        updatedAt,
        ...newUserWithoutSensitiveInfo
      } = newUser;

      const rol = await this.permissionsService.findOne(rolId);
      const token = await this.jwtService.signAsync({
        jwtid: uuidv4(),
        sub: { ...newUserWithoutSensitiveInfo, rol: rol.name },
      });

      this.requestVerifyAccount(user.email);

      return {
        user: {
          ...newUserWithoutSensitiveInfo,
          rol: rol.name,
        },
        token,
        access: rol.module,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async signIn(credentials: LogInDto) {
    try {
      const user = await this.validateUserDuplicate(credentials.email);

      const desencrytPassword = await this.keyService.desencrytPassword(
        credentials.password,
      );

      const comparePass = bcrypt.compare(
        desencrytPassword.data.toString(),
        user.password,
      );
      delete user.password;

      if (!comparePass) throw new Error(ResponseAPI.USER_PASSWORD_EMAIL);
      const {
        id,
        rolId,
        status,
        createdAt,
        updatedAt,
        ...userWithoutSensitiveInfo
      } = user;

      const rol = await this.permissionsService.findOneForSingIn(rolId);
      const token = await this.jwtService.signAsync({
        jwtid: uuidv4(),
        sub: { ...userWithoutSensitiveInfo, rol: rol.name },
      });

      return {
        user: {
          ...userWithoutSensitiveInfo,
          rol: rol.name,
        },
        token,
        access: rol?.module ?? [],
      };
    } catch (error) {
      console.log('🚀 ~ UserService ~ error:', error);
      throw new Error(error);
    }
  }

  async deleteLogic(id: string) {
    try {
      const userExist = await this.userRepository.findOne({ where: { id } });
      if (!userExist) throw new Error(ResponseAPI.NOT_FOUND);

      await this.userRepository.update(id, {
        status: false,
        verifyAccount: false,
      });
      return userExist;
    } catch (error) {
      throw new Error(error);
    }
  }

  async signOut(email: string) {
    try {
      const userExist = await this.userRepository.findOne({
        where: { email: email, status: true },
      });
      return userExist;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUser(id: string, user: LogUpdateDto) {
    try {
      const userExist = await this.userRepository.findOne({ where: { id } });
      if (!userExist) throw new Error(ResponseAPI.NOT_FOUND);

      const rolValid = await this.permissionsService.findRolById(user.rolId);
      if (!rolValid) throw new Error(ResponseAPI.ROLE_NOT_FOUND);

      if (user.password) {
        const nowPassword = user.password;
        const comparePass = await bcrypt.compare(
          nowPassword,
          userExist.password,
        );
        delete user.password;

        if (!comparePass) {
          const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
          await bcrypt.genSalt(saltRounds).then(async (salt: any) => {
            const hash = bcrypt.hashSync(nowPassword, salt);
            user.password = hash;
          });
        }
      }

      if (
        user?.email &&
        userExist.email !== user.email &&
        !userExist.verifyAccount
      ) {
        const userExist = await this.userRepository.findOne({
          where: { email: user.email },
        });
        if (userExist) throw new Error(ResponseAPI.USER_EMAIL_EXIST);
      }

      if (userExist.verifyAccount) {
        delete user?.email;
      }
      await this.userRepository.update(id, user);
      delete user?.password;

      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async validae(auth: string) {
    try {
      const token = this.extractTokenFromHeader(auth);
      if (!token) {
        throw new UnauthorizedException();
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      const user = payload.sub;

      if (!user.rol) {
        throw new Error(ResponseAPI.USER_INVALID);
      }

      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async assingRole(id: string, rolId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error(ResponseAPI.NOT_FOUND);
      }

      const rol = await this.permissionsService.findRolById(rolId);
      if (!rol) {
        throw new Error(ResponseAPI.ROLE_NOT_FOUND);
      }

      await this.userRepository.update(id, { rolId });

      return {
        ...user,
        rol: rol.name,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUser(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: [
          'id',
          'name',
          'lastName',
          'email',
          'rolId',
          'status',
          'verifyAccount',
        ],
      });
      if (!user) {
        throw new Error(ResponseAPI.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new Error('Method not implemented.');
    }
  }

  async listUsers(params: ListUserDto) {
    try {
      const { search, pageNumber = 0 } = params;
      const number = pageNumber ?? 1;
      const offset = (number - 1) * 10;
      const value = search?.trim() ?? '';
      const likeValue = `%${value}%`;

      let whereQuery = {};
      if (search) {
        whereQuery = {
          where: [
            {
              name: Like(likeValue),
            },
            {
              lastName: Like(likeValue),
            },
            {
              email: Like(likeValue),
            },
          ],
        };
      }
      const users = await this.userRepository.findAndCount({
        ...whereQuery,
        select: [
          'id',
          'name',
          'lastName',
          'email',
          'rolId',
          'status',
          'verifyAccount',
          'createdAt',
          'updatedAt',
        ],
        relations: ['role'],
        order: {
          createdAt: 'DESC',
        },
        skip: offset,
        take: 10,
        cache: true,
      });
      return users;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateStatusUser(id: string, body: { status: boolean }) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error(ResponseAPI.NOT_FOUND);
      }
      await this.userRepository.update(id, { status: body.status });
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async rescuePassword(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new Error('User not found');
      if (!user.verifyAccount) throw new Error('User not verified');

      const uuid = uuidv4();
      const streamName = 'recovery_password_admin';
      const sendInfo = {
        customer: `${user.name} ${user.lastName}`,
        email: user.email,
        link: `https://adm.miviajero.travel/recover-pass/${uuid}`,
        id: uuid,
        templateId: 1,
      };

      this.producerService.redisRequest(streamName, sendInfo);

      const streamNameEmail = 'email_request';

      this.producerService.redisRequest(streamNameEmail, sendInfo);
      return;
    } catch (error) {
      throw new Error(error);
    }
  }

  async recoveryPassword(password: string, id: string) {
    try {
      const streamName = 'recovery_password_admin';
      const userInfo: any = await this.consumerService.searchQueu(
        id,
        streamName,
      );

      if (!userInfo.recovery) throw new Error('Id not found');

      const newPassword = await this.getPassword(password);
      this.consumerService.deleteQeue(streamName, userInfo.id);

      return await this.userRepository.update(
        { email: userInfo.recovery.email },
        { password: newPassword },
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async requestVerifyAccount(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new Error('User not found');

      const uuid = uuidv4();
      const streamName = 'verify_account_admin';

      const sendInfo = {
        customer: `${user.name} ${user.lastName}`,
        email: user.email,
        link: `https://adm.miviajero.travel/verify-account/${uuid}`,
        id: uuid,
        templateId: 3,
      };

      this.producerService.redisRequest(streamName, sendInfo);

      const streamNameEmail = 'email_request';

      this.producerService.redisRequest(streamNameEmail, sendInfo);

      return;
    } catch (error) {
      throw new Error(error);
    }
  }

  async verifyAccount(id: string) {
    try {
      const streamName = 'verify_account_admin';
      const userInfo: any = await this.consumerService.searchQueu(
        id,
        streamName,
      );

      if (!userInfo.recovery) throw new Error('Id not found');
      this.consumerService.deleteQeue(streamName, userInfo.id);

      return await this.userRepository.update(
        { email: userInfo.recovery.email },
        { verifyAccount: true },
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  private async getPassword(password: string) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const newPassword = await bcrypt
      .genSalt(saltRounds)
      .then(async (salt: any) => {
        const hash = bcrypt.hashSync(password, salt);
        return hash;
      });

    return newPassword;
  }
}
