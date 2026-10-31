const digitalEnquirySchema = new Schema({});

export type DigitalEnquiryDoc = InferSchemaType<typeof digitalEnquirySchema>;

export const DigitalEnquiry = (mongoose.models.DigitalEnquiry as Model<DigitalEnquiryDoc>) ||
  mongoose.model<DigitalEnquiryDoc>("DigitalEnquiry", digitalEnquirySchema);