import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ContractModule } from './contract/contract.module';
import { BusdModule } from './busd/busd.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { VolumeModule } from './volume/volume.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
      logging: false,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    VolumeModule,
    ContractModule,
    BusdModule,
  ],
})
export class AppModule {}
