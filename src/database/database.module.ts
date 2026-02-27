import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          if (connection.readyState === 1) {
            Logger.log(
              '✅ MongoDB database connected successfully!',
              'DatabaseModule',
            );
          }
          return connection;
        },
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
