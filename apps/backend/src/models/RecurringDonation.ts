import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IRecurringDonation extends Document {
  _id: string;
  donor: Types.ObjectId;
  campaign: Types.ObjectId;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  startDate: Date;
  endDate?: Date;
  maxOccurrences?: number;
  currentOccurrence: number;
  nextPaymentDate: Date;
  paymentMethod: string;
  totalPaid: number;
  lastPaymentDate?: Date;
  lastPaymentStatus?: 'success' | 'failed' | 'pending';
  failedAttempts: number;
  metadata?: {
    createdBy?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const recurringDonationSchema = new Schema<IRecurringDonation>({
  donor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: [10, 'Minimum recurring donation amount is ₹10'],
    max: [100000, 'Maximum recurring donation amount is ₹1,00,000']
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'completed'],
    default: 'active',
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  maxOccurrences: {
    type: Number,
    min: 1,
    max: 120
  },
  currentOccurrence: {
    type: Number,
    default: 0
  },
  nextPaymentDate: {
    type: Date,
    required: true,
    index: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  lastPaymentDate: {
    type: Date
  },
  lastPaymentStatus: {
    type: String,
    enum: ['success', 'failed', 'pending']
  },
  failedAttempts: {
    type: Number,
    default: 0,
    max: 3
  },
  metadata: {
    createdBy: String,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for performance
recurringDonationSchema.index({ donor: 1, status: 1 });
recurringDonationSchema.index({ campaign: 1, status: 1 });
recurringDonationSchema.index({ nextPaymentDate: 1, status: 1 });
recurringDonationSchema.index({ frequency: 1, status: 1 });

// Method to calculate next payment date
recurringDonationSchema.methods.calculateNextPaymentDate = function() {
  const current = this.nextPaymentDate || this.startDate;
  const next = new Date(current);
  
  switch (this.frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next;
};

// Method to check if subscription should end
recurringDonationSchema.methods.shouldEnd = function() {
  if (this.endDate && new Date() >= this.endDate) return true;
  if (this.maxOccurrences && this.currentOccurrence >= this.maxOccurrences) return true;
  if (this.failedAttempts >= 3) return true;
  return false;
};

export const RecurringDonation = mongoose.model<IRecurringDonation>('RecurringDonation', recurringDonationSchema);
