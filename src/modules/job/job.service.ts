import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument, JobStatus } from 'src/schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, hirerId: string) {
    const job = await this.jobModel.create({
      ...createJobDto,
      hirerId: new Types.ObjectId(hirerId),
    });

    return {
      message: 'Job created successfully',
      data: job,
    };
  }

  async findAll() {
    const jobs = await this.jobModel
      .find({ isDeleted: false, status: JobStatus.OPEN })
      .populate('hirerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return {
      message: 'Jobs fetched successfully',
      data: jobs,
    };
  }

  async findOne(id: string) {
    const job = await this.jobModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: false })
      .populate('hirerId', 'name email')
      .populate('selectedHustlerId', 'name email')
      .lean();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return {
      message: 'Job fetched successfully',
      data: job,
    };
  }

  async findMyJobs(hirerId: string) {
    const jobs = await this.jobModel
      .find({ 
        hirerId: new Types.ObjectId(hirerId), 
        isDeleted: false 
      })
      .populate('selectedHustlerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return {
      message: 'Your jobs fetched successfully',
      data: jobs,
    };
  }

  async update(id: string, updateJobDto: UpdateJobDto, hirerId: string) {
    const job = await this.jobModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.hirerId.toString() !== hirerId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('Cannot update a job that is not open');
    }

    Object.assign(job, updateJobDto);
    await job.save();

    return {
      message: 'Job updated successfully',
      data: job,
    };
  }

  async delete(id: string, hirerId: string) {
    const job = await this.jobModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.hirerId.toString() !== hirerId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }

    job.isDeleted = true;
    await job.save();

    return {
      message: 'Job deleted successfully',
    };
  }

  async selectCandidate(jobId: string, hustlerId: string, hirerId: string) {
    const job = await this.jobModel.findOne({
      _id: new Types.ObjectId(jobId),
      isDeleted: false,
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.hirerId.toString() !== hirerId) {
      throw new ForbiddenException('You can only select candidates for your own jobs');
    }

    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('Job is not open for selection');
    }

    job.selectedHustlerId = new Types.ObjectId(hustlerId);
    job.status = JobStatus.IN_PROGRESS;
    await job.save();

    return {
      message: 'Candidate selected successfully',
      data: job,
    };
  }

  async closeJob(jobId: string, hirerId: string) {
    const job = await this.jobModel.findOne({
      _id: new Types.ObjectId(jobId),
      isDeleted: false,
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.hirerId.toString() !== hirerId) {
      throw new ForbiddenException('You can only close your own jobs');
    }

    job.status = JobStatus.CLOSED;
    await job.save();

    return {
      message: 'Job closed successfully',
      data: job,
    };
  }
}
