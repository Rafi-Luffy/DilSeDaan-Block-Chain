import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IWithdrawalRequest extends Document {
  _id: string;
  campaign: Types.ObjectId;
  requestedBy: Types.ObjectId;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed';
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  documents: Array<{
    type: string;
    url: string;
    description?: string;
  }>;
  milestoneId?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  processedAt?: Date;
  rejectionReason?: string;
  transactionId?: string;
  fees: {
    processingFee: number;
    gstAmount: number;
    netAmount: number;
  };
  metadata?: {
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: 'milestone' | 'emergency' | 'operational' | 'completion';
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalRequestSchema = new Schema<IWithdrawalRequest>({
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: [100, 'Minimum withdrawal amount is ₹100'],
    validate: {
      validator: function(v: number) {
        return v > 0;
      },
      message: 'Withdrawal amount must be positive'
    }
  },
  purpose: {
    type: String,
    required: true,
    minlength: [10, 'Purpose must be at least 10 characters'],
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed', 'failed'],
    default: 'pending',
    index: true
  },
  bankAccount: {
    accountNumber: {
      type: String,
      required: true,
      minlength: 9,
      maxlength: 18
    },
    ifscCode: {
      type: String,
      required: true,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/
    },
    accountHolderName: {
      type: String,
      required: true,
      maxlength: 100
    },
    bankName: {
      type: String,
      required: true,
      maxlength: 100
    }
  },
  documents: [{
    type: {
      type: String,
      required: true,
      enum: ['invoice', 'receipt', 'milestone_proof', 'bank_statement', 'other']
    },
    url: {
      type: String,
      required: true
    },
    description: String
  }],
  milestoneId: {
    type: Schema.Types.ObjectId,
    ref: 'Milestone'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  processedAt: Date,
  rejectionReason: String,
  transactionId: String,
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    gstAmount: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    }
  },
  metadata: {
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['milestone', 'emergency', 'operational', 'completion'],
      default: 'operational'
    },
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for performance
withdrawalRequestSchema.index({ campaign: 1, status: 1 });
withdrawalRequestSchema.index({ requestedBy: 1, status: 1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });
withdrawalRequestSchema.index({ 'metadata.priority': 1, status: 1 });

// Pre-save middleware to calculate fees
withdrawalRequestSchema.pre('save', function(next) {
  if (this.isModified('amount')) {
    // Calculate processing fee (2% of amount, min ₹10, max ₹500)
    this.fees.processingFee = Math.max(10, Math.min(500, this.amount * 0.02));
    
    // Calculate GST (18% on processing fee)
    this.fees.gstAmount = this.fees.processingFee * 0.18;
    
    // Calculate net amount
    this.fees.netAmount = this.amount - this.fees.processingFee - this.fees.gstAmount;
  }
  next();
});

// Method to validate withdrawal against campaign balance
withdrawalRequestSchema.methods.validateBalance = async function() {
  const Campaign = mongoose.model('Campaign');
  const campaign = await Campaign.findById(this.campaign);
  
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  
  // Check if campaign has sufficient balance
  const availableBalance = campaign.raisedAmount - campaign.withdrawnAmount || 0;
  if (this.amount > availableBalance) {
    throw new Error(`Insufficient balance. Available: ₹${availableBalance}`);
  }
  
  return true;
};

export const WithdrawalRequest = mongoose.model<IWithdrawalRequest>('WithdrawalRequest', withdrawalRequestSchema);
