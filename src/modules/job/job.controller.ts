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
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/role.decorator';
import { UserRole } from 'src/schemas/user.schema';

@ApiTags('Jobs')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @Roles(UserRole.HIRER)
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobService.create(createJobDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.HUSTLER, UserRole.HIRER)
  findAll() {
    return this.jobService.findAll();
  }

  @Get('my-jobs')
  @Roles(UserRole.HIRER)
  findMyJobs(@Request() req) {
    return this.jobService.findMyJobs(req.user.sub);
  }

  @Get(':jobId')
  @Roles(UserRole.HUSTLER, UserRole.HIRER)
  findOne(@Param('jobId') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':jobId')
  @Roles(UserRole.HIRER)
  update(
    @Param('jobId') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req,
  ) {
    return this.jobService.update(id, updateJobDto, req.user.sub);
  }

  @Delete(':jobId')
  @Roles(UserRole.HIRER)
  remove(@Param('jobId') id: string, @Request() req) {
    return this.jobService.delete(id, req.user.sub);
  }

  @Patch(':jobId/select-candidate/:hustlerId')
  @Roles(UserRole.HIRER)
  selectCandidate(
    @Param('jobId') id: string,
    @Param('hustlerId') hustlerId: string,
    @Request() req,
  ) {
    return this.jobService.selectCandidate(id, hustlerId, req.user.sub);
  }

  @Patch(':jobId/close')
  @Roles(UserRole.HIRER)
  closeJob(@Param('jobId') id: string, @Request() req) {
    return this.jobService.closeJob(id, req.user.sub);
  }
}
