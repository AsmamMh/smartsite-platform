import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FactureController } from './facture.controller';
import { FactureService } from './facture.service';
import { Facture, FactureSchema } from '../entities/facture.entity';
import { Payment, PaymentSchema } from '../entities/payment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Facture.name, schema: FactureSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [FactureController],
  providers: [FactureService],
  exports: [FactureService],
})
export class FactureModule {}
