import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CredentialsService } from './credentials.service';

import { Public } from 'src/decorator/public.decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.credentialsService.findOne(id);
  }

  @Public()
  @Post()
  updatePassword(@Body() updateCredentialDto: any) {
    return this.credentialsService.updatePassword(
      updateCredentialDto.user,
      updateCredentialDto.password,
      updateCredentialDto.credentialName,
    );
  }

  @Public()
  @MessagePattern({ cmd: 'get-auth-token' })
  getTokenCredentials(
    @Payload()
    data: {
      name: string;
    },
  ) {
    return this.credentialsService.findOne(data.name);
  }
}
