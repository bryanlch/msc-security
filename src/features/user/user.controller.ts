import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Public } from 'src/decorator/public.decorator';
import { LogInDto } from './dto/logIn.dto';
import { ResponseAPI } from 'src/enums/responses.enum';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogUpDto } from './dto/logUp.dto';
import { LogUpdateDto } from './dto/logUpdate.dto';
import { ListUserDto } from './dto/list.dto';
import { KeyService } from '../key/key.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly keyService: KeyService,
  ) {}

  @Public()
  @ApiOperation({
    summary: 'Get public key',
    description: 'Get public key',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        publicKey: '',
      },
    },
  })
  @Get('public-key')
  async getPublicKey() {
    try {
      const publicKey = this.keyService.getPublicKey();
      return { publicKey };
    } catch (error) {
      console.log(error.message.replace(/Error:\s*/g, ''));
      throw new InternalServerErrorException({
        message: ResponseAPI.ERROR_PUBLIC_KEY,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Sign up',
    description: 'Method to register in the web admin',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.CREATE_SUCCESSFUL,
        user: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Post('sign-up')
  async signUp(@Body() user: LogUpDto, @Res() res: Response) {
    try {
      const newUSer = await this.userService.signUp(user);
      if (!newUSer)
        throw new InternalServerErrorException({
          message: ResponseAPI.NOT_CREATE,
        });
      return res.status(201).send({
        message: ResponseAPI.CREATE_SUCCESSFUL,
        user: newUSer,
      });
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_CREATE,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Update user',
    description: 'Update user',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.UPDATE_SUCCESSFUL,
        user: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Put('update/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() user: LogUpdateDto,
    @Res() res: Response,
  ) {
    try {
      const userUpdate = await this.userService.updateUser(id, user);
      if (!userUpdate)
        throw new InternalServerErrorException({
          message: ResponseAPI.USER_UPDATED_ERROR,
        });
      return res.status(201).send({
        message: ResponseAPI.UPDATE_SUCCESSFUL,
        user: userUpdate,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.USER_UPDATED_ERROR,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Upsert user',
    description: 'Upsert user',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.UPDATE_SUCCESSFUL,
        user: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Post('upsert')
  async upsertUser(
    @Body() user: LogUpDto | LogUpdateDto,
    @Res() res: Response,
  ) {
    try {
      const userId = user?.id;
      if (userId) {
        const userUpdate = await this.userService.updateUser(
          userId,
          user as LogUpdateDto,
        );
        if (!userUpdate)
          throw new InternalServerErrorException({
            message: ResponseAPI.USER_UPDATED_ERROR,
          });

        return res.status(201).send({
          message: ResponseAPI.USER_UPDATED,
          user: userUpdate,
        });
      }

      const newUSer = await this.userService.signUp(user);
      if (!newUSer)
        throw new InternalServerErrorException({
          message: ResponseAPI.USER_CREATED_ERROR,
        });

      return res.status(201).send({
        message: ResponseAPI.USER_CREATED,
        user: newUSer,
      });
    } catch (error: any) {
      throw new InternalServerErrorException({
        error: ResponseAPI.USER_CREATED_ERROR,
        message: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @Public()
  @ApiOperation({
    summary: 'Login',
    description: 'Login method for web admin',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        user: {},
        token: '',
      },
    },
  })
  @Post('sign-in')
  async signIn(@Body() credentials: LogInDto) {
    try {
      return await this.userService.signIn(credentials);
    } catch (error: any) {
      console.log(error.message.replace(/Error:\s*/g, ''));
      throw new InternalServerErrorException({
        message: ResponseAPI.ERROR_SIGN_IN,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Sign out',
    description: 'Method to log out of the web admin',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.SIGN_OUT_SUCCESSFUL,
        out: true,
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get('sign-out')
  async signOut(@Req() req: Request) {
    try {
      const email = req.user['email'];
      const userExist = await this.userService.signOut(email);
      if (!userExist)
        throw new InternalServerErrorException({
          message: ResponseAPI.NOT_FOUND,
        });

      return { message: ResponseAPI.SIGN_OUT_SUCCESSFUL, out: true };
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: ResponseAPI.ERROR_SIGN_IN,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete logic user',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.DELETED_SUCCESSFUL,
        users: [],
      },
    },
  })
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteLogic(@Param('id') id: string) {
    try {
      const userDelete = await this.userService.deleteLogic(id);
      if (!userDelete)
        throw new InternalServerErrorException({
          message: ResponseAPI.USER_DELETE_ERROR,
        });

      return {
        message: ResponseAPI.DELETED_SUCCESSFUL,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.USER_DELETE_ERROR,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @Public()
  @Get('validate')
  async validate(@Req() req: Request) {
    try {
      const userValidate = await this.userService.validae(
        req.headers.authorization,
      );
      return {
        message: ResponseAPI.USER_LOGIN,
        user: userValidate,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.ERROR_SIGN_IN,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Get user by id',
    description: 'Get user by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.USER_EXIST,
        user: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get('by-id/:id')
  async getUser(@Param('id') id: string) {
    try {
      const user = await this.userService.getUser(id);
      if (!user)
        throw new InternalServerErrorException({
          message: ResponseAPI.NOT_FOUND,
        });

      return {
        message: ResponseAPI.USER_EXIST,
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.USER_EXIST,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Update status user',
    description: 'Update status user',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.UPDATE_SUCCESSFUL,
        user: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Put('status/:id')
  async updateStatusUser(
    @Param('id') id: string,
    @Body() body: { status: boolean },
  ) {
    try {
      const user = await this.userService.updateStatusUser(id, body);
      if (!user)
        throw new InternalServerErrorException({
          message: ResponseAPI.NOT_FOUND,
        });

      return {
        message: ResponseAPI.UPDATE_SUCCESSFUL,
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message.replace(/Error:\s*/g, ''),
        message: ResponseAPI.NOT_FOUND,
      });
    }
  }

  @Public()
  @Post('rescue-password')
  async rescuePassword(@Body() user: { email: string }) {
    try {
      await this.userService.rescuePassword(user.email);
      return { message: ResponseAPI.RESCUES_PASSWORD };
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @Public()
  @Post('recovery-password')
  async recoveryPassword(@Body() user: { password: string; uuid: string }) {
    try {
      await this.userService.recoveryPassword(user.password, user.uuid);

      return { message: ResponseAPI.RECOVERY_PASSWORD };
    } catch (err: any) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: err.message,
      });
    }
  }

  @Post('verify-account')
  async requestVerifyAccount(@Body() user: { email: string }) {
    try {
      await this.userService.requestVerifyAccount(user.email);

      return { message: '' };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message,
      });
    }
  }

  @Public()
  @Post('auth/verify')
  async verifyAccount(@Body() user: { id: string }) {
    try {
      await this.userService.verifyAccount(user.id);

      return { message: ResponseAPI.VERIFY_ACCOUNT };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Get user ',
    description: 'Get user',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.USER_EXIST,
        user: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get('list')
  async listUsers(@Query() params: ListUserDto) {
    try {
      const list = await this.userService.listUsers(params);

      const array = list[0].map((user: any) => {
        return {
          ...user,
          role: user.role?.name,
        };
      });

      return {
        message: ResponseAPI.USER_LIST,
        list: array,
        count: list[1],
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.USER_LIST_ERROR,
        error: error.message,
      });
    }
  }
}
