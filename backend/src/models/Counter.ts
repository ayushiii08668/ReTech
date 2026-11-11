import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICounter extends Document {
  name: string;
  year: number;
  sequence: number;
}

const CounterSchema = new Schema<ICounter>({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  sequence: { type: Number, default: 0 },
});

CounterSchema.index({ name: 1, year: 1 }, { unique: true });

const Counter: Model<ICounter> = mongoose.model<ICounter>('Counter', CounterSchema);

export type CounterPrefix =
  | 'RET'
  | 'REQ'
  | 'SAN'
  | 'AGT'
  | 'CERT'
  | 'MKT'
  | 'ENQ'
  | 'PTR'
  | 'RFB'
  | 'RCY';

export async function getNextId(prefix: CounterPrefix): Promise<string> {
  const currentYear = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { name: prefix, year: currentYear },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );

  const seqStr = String(counter.sequence).padStart(4, '0');
  return `${prefix}-${currentYear}-${seqStr}`;
}

export default Counter;

