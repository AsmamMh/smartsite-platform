// src/permissions/schemas/permission.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string; // ex: "users:read", "projects:update", "incidents:delete"

  @Prop({ trim: true })
  description?: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);