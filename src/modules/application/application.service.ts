import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument, ApplicationStatus } from 'src/schemas/application.schema';
import { Job, JobDocument, JobStatus } from 'src/schemas/job.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
    jobId: string,
    hustlerId: string,
    file: Express.Multer.File,
  ) {
    // Check if job exists and is open
    const job = await this.jobModel.findOne({
      _id: new Types.ObjectId(jobId),
      isDeleted: false,
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('This job is no longer accepting applications');
    }

    // Check if user already applied
    const existingApplication = await this.applicationModel.findOne({
      jobId: new Types.ObjectId(jobId),
      hustlerId: new Types.ObjectId(hustlerId),
      isDeleted: false,
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied to this job');
    }

    // Upload file to Cloudinary
    if (!file) {
      throw new BadRequestException('Please upload a file (resume or portfolio)');
    }

    const fileUrl = await this.cloudinaryService.uploadFile(file);

    // Create application
    const application = await this.applicationModel.create({
      ...createApplicationDto,
      jobId: new Types.ObjectId(jobId),
      hustlerId: new Types.ObjectId(hustlerId),
      fileUrl,
    });

    return {
      message: 'Application submitted successfully',
      data: application,
    };
  }

  async findByJob(jobId: string, hirerId: string) {
    // Verify job belongs to hirer
    const job = await this.jobModel.findOne({
      _id: new Types.ObjectId(jobId),
      isDeleted: false,
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.hirerId.toString() !== hirerId) {
      throw new ForbiddenException('You can only view applications for your own jobs');
    }

    const applications = await this.applicationModel
      .find({
        jobId: new Types.ObjectId(jobId),
        isDeleted: false,
      })
      .populate('hustlerId', 'name email phoneNumber')
      .sort({ createdAt: -1 })
      .lean();

    return {
      message: 'Applications fetched successfully',
      data: applications,
    };
  }

  async findMyApplications(hustlerId: string) {
    const applications = await this.applicationModel
      .find({
        hustlerId: new Types.ObjectId(hustlerId),
        isDeleted: false,
      })
      .populate('jobId', 'title description budget status')
      .sort({ createdAt: -1 })
      .lean();

    return {
      message: 'Your applications fetched successfully',
      data: applications,
    };
  }

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    hirerId: string,
  ) {
    const application = await this.applicationModel
      .findOne({
        _id: new Types.ObjectId(applicationId),
        isDeleted: false,
      })
      .populate('jobId');

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = application.jobId as any;
    
    if (job.hirerId.toString() !== hirerId) {
      throw new ForbiddenException('You can only update applications for your own jobs');
    }

    application.status = status;
    await application.save();

    return {
      message: 'Application status updated successfully',
      data: application,
    };
  }

  async deleteApplication(applicationId: string, hustlerId: string) {
    const application = await this.applicationModel.findOne({
      _id: new Types.ObjectId(applicationId),
      isDeleted: false,
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.hustlerId.toString() !== hustlerId) {
      throw new ForbiddenException('You can only delete your own applications');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Cannot delete an application that has been reviewed');
    }

    application.isDeleted = true;
    await application.save();

    // Delete file from Cloudinary
    await this.cloudinaryService.deleteFile(application.fileUrl);

    return {
      message: 'Application deleted successfully',
    };
  }
}
