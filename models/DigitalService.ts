const digitalServiceSchema = new Schema({});

export type DigitalServiceDoc = InferSchemaType<typeof digitalServiceSchema>;

export const DigitalService = (mongoose.models.DigitalService as Model<DigitalServiceDoc>) ||
  mongoose.model<DigitalServiceDoc>("DigitalService", digitalServiceSchema);