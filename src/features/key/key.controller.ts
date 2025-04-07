import { Controller, Get } from '@nestjs/common';
import { KeyService } from './key.service';
import { Public } from 'src/decorator/public.decorator';

@Controller('keys')
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @Public()
  @Get('public')
  getPublicKey() {
    const publicKey = this.keyService.getPublicKey();
    return { publicKey };
  }
}
