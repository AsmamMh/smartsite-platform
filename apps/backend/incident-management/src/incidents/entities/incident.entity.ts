import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type IncidentDocument = Incident & Document;

// Align with frontend types (src/app/types/index.ts)
export enum IncidentType {
  SAFETY = "safety",
  QUALITY = "quality",
  DELAY = "delay",
  OTHER = "other",
}

export enum IncidentSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum IncidentStatus {
  OPEN = "open",
  INVESTIGATING = "investigating",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

@Schema({ timestamps: true })
export class Incident {
  @Prop({ required: true, enum: IncidentType })
  type: IncidentType;

  @Prop({ required: true, enum: IncidentSeverity })
  severity: IncidentSeverity;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop()
  reporterName?: string;

  @Prop()
  reporterPhone?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  assignedToCin?: string;

  @Prop({ type: Types.ObjectId, ref: "Site", required: false })
  site?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: false })
  reportedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: false })
  assignedTo?: Types.ObjectId;

  @Prop({ required: true, enum: IncidentStatus, default: IncidentStatus.OPEN })
  status: IncidentStatus;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);

IncidentSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = (ret._id as Types.ObjectId)?.toString?.() ?? ret._id;
    if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.toISOString();
    if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString();
    if (ret.resolvedAt instanceof Date) ret.resolvedAt = ret.resolvedAt.toISOString();
    return ret;
  },
});
