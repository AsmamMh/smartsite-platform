// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/roles/entities/role.entity';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ required: true, trim: true })
  prenom: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  motDePasse: string; // hashed !

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }], default: ['USER'] })
  roles: Types.ObjectId[] | Role[];

  @Prop({ default: true })
  estActif: boolean;

  // Champs de ton diagramme que tu peux ajouter
  @Prop()
  telephone?: string;

  @Prop()
  departement?: string;

  @Prop([String])
  certifications?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Optionnel : index pour recherche rapide
UserSchema.index({ email: 1 });