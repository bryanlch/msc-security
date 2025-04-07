import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Credential } from './entities/credential.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Encryption } from 'src/utils/util.crypto';

@Injectable()
export class CredentialsService {
  private encryption = new Encryption();
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private logger = new Logger(CredentialsService.name);

  @Cron(CronExpression.EVERY_6_HOURS)
  async upsert() {
    try {
      const url: string = this.configService.get('URL_AUTH_CREDENTIALS');

      const credentials = await this.credentialRepository.find({
        select: ['id', 'name', 'user', 'password'],
      });

      credentials.forEach(async (element) => {
        const decryptedPass = await this.encryption.decipheriv(
          element.password,
        );
        try {
          const {
            data: { BearerToken: token },
            data,
          } = await this.httpService.axiosRef.post(url, {
            UserName: element.user,
            Password: decryptedPass,
          });

          if (!token) {
            return this.credentialRepository.update(
              { id: element.id },
              { payload: data },
            );
          }

          await this.credentialRepository.upsert(
            [{ name: element.name, token, updatedAt: new Date() }],
            ['name'],
          );
        } catch (error) {
          console.error('ERROR UPSERT: ', error.response.data);

          return this.credentialRepository.update(
            { id: element.id },
            { payload: { error: error.response.data } },
          );
        }
      });
    } catch (error) {
      console.log('🚀 ~ CredentialsService ~ error:', error);
      this.logger.error({
        text: '🚀 ~ CredentialsService ~ upsert ~  Ha ocurrido un error al actualizar las credenciales',
        error,
      });
    }
  }

  async updatePassword(user: string, pass: string, credentialName: string) {
    const passEncrypted = await this.encryption.cipheriv(pass);

    await this.credentialRepository.upsert(
      [
        {
          name: credentialName,
          user,
          password: passEncrypted,
          updatedAt: new Date(),
        },
      ],
      ['name'],
    );

    return { message: 'Se actualizo la crendencial correctamente' };
  }

  async findOne(data: string) {
    try {
      const response = await this.credentialRepository.findOneBy({
        name: data,
      });
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
