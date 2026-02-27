import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/role.decorator';
import { UserRole } from 'src/schemas/user.schema';
import { ApplicationStatus } from 'src/schemas/application.schema';

@ApiTags('Applications')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('job/:jobId')
  @Roles(UserRole.HUSTLER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['message', 'expectedCost', 'file'],
      properties: {
        message: {
          type: 'string',
          description: 'Application message explaining your experience',
          example: 'I have 5 years of experience in full stack development...',
        },
        expectedCost: {
          type: 'number',
          description: 'Expected cost for the project in USD',
          example: 4500,
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Resume or portfolio file (PDF, DOCX, etc.)',
        },
      },
    },
  })
  create(
    @Param('jobId') jobId: string,
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.applicationService.create(
      createApplicationDto,
      jobId,
      req.user.sub,
      file,
    );
  }

  @Get('job/:jobId')
  @Roles(UserRole.HIRER)
  findByJob(@Param('jobId') jobId: string, @Request() req) {
    return this.applicationService.findByJob(jobId, req.user.sub);
  }

  @Get('my-applications')
  @Roles(UserRole.HUSTLER)
  findMyApplications(@Request() req) {
    return this.applicationService.findMyApplications(req.user.sub);
  }

  @Patch(':id/status/:status')
  @Roles(UserRole.HIRER)
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: ApplicationStatus,
    @Request() req,
  ) {
    return this.applicationService.updateStatus(id, status, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.HUSTLER)
  remove(@Param('id') id: string, @Request() req) {
    return this.applicationService.deleteApplication(id, req.user.sub);
  }
}
