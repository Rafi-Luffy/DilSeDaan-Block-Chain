import mongoose, { Schema } from 'mongoose';

const milestoneSchema = new Schema({
  campaignId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Milestone description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be at least 1']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'verified', 'rejected', 'funds_released'],
    default: 'pending'
  },
  proofDocuments: [{
    type: String
  }],
  submittedAt: Date,
  verifiedAt: Date,
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  transactionHash: {
    type: String,
    match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash']
  },
  order: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Main Campaign Schema
const campaignSchema = new Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  // Financial Information
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [500, 'Minimum target amount is ₹500'],
    max: [10000000, 'Maximum target amount is ₹1 crore'] // Government compliance limit
  },
  raisedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Raised amount cannot be negative']
  },
  
  // Timeline
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
  // Campaign Management
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Campaign creator is required']
  },
  category: {
    type: String,
    enum: ['education', 'healthcare', 'environment', 'animal_welfare', 'disaster_relief', 'community_development', 'sports', 'arts_culture', 'human_rights', 'technology', 'other'],
    required: [true, 'Campaign category is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'active', 'paused', 'completed', 'cancelled', 'rejected'],
    default: 'draft',
    index: true
  },
  
  // Location Information (Important for Indian Compliance)
  location: {
    state: {
      type: String,
      required: [true, 'State is required for compliance']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[1-9][0-9]{5}$/, 'Invalid pincode format']
    }
  },
  
  // Media and Documentation
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    type: String
  }],
  
  // Campaign updates
  updates: [{
    title: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    imageUrl: String
  }],
  
  // Verification and Compliance
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  verificationDocuments: {
    panCard: String, // IPFS hash
    aadharCard: String, // IPFS hash
    addressProof: String, // IPFS hash
    organizationRegistration: String, // IPFS hash
    fcraRegistration: String, // IPFS hash
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  
  // Beneficiary Information
  beneficiaryCount: {
    type: Number,
    required: [true, 'Number of beneficiaries is required'],
    min: [1, 'At least 1 beneficiary is required']
  },
  beneficiaryDetails: [{
    name: String,
    age: Number,
    relation: String,
    aadharNumber: {
      type: String,
      match: [/^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/, 'Invalid Aadhar number format']
    }
  }],
  
  // Milestones for Progress Tracking
  milestones: [milestoneSchema],
  
  // Donation Tracking
  donorCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastDonationAt: Date,
  
  // Blockchain Integration
  contractAddress: {
    type: String,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address']
  },
  transactionHashes: [{
    type: String,
    match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash']
  }],
  
  // Analytics and Performance
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  shareCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Tax and Legal Compliance
  taxExemptionCertificate: String, // IPFS hash
  utilizationCertificate: String, // IPFS hash
  auditReport: String, // IPFS hash
  
  // Featured and Priority
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  
  // Content Moderation
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderationNotes: String,
  
  // Tags for Better Discovery
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number']
    },
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    }
  },
  
  // Analytics fields
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  clickThroughRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  conversionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  socialEngagement: {
    facebook: {
      type: Number,
      default: 0
    },
    twitter: {
      type: Number,
      default: 0
    },
    whatsapp: {
      type: Number,
      default: 0
    },
    linkedin: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
campaignSchema.index({ status: 1, category: 1 });
campaignSchema.index({ creator: 1, status: 1 });
campaignSchema.index({ endDate: 1, status: 1 });
campaignSchema.index({ isVerified: 1, isFeatured: 1 });

// Virtual for progress percentage
campaignSchema.virtual('progressPercentage').get(function() {
  return Math.min(((this as any).raisedAmount / (this as any).targetAmount) * 100, 100);
});

// Virtual for days remaining
campaignSchema.virtual('daysRemaining').get(function() {
  if (!(this as any).endDate) return null;
  const today = new Date();
  const timeDiff = (this as any).endDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(daysDiff, 0);
});

// Pre-save middleware to update milestone order
campaignSchema.pre('save', function(next) {
  if ((this as any).milestones && (this as any).milestones.length > 0) {
    (this as any).milestones.forEach((milestone: any, index: number) => {
      milestone.order = index + 1;
    });
  }
  next();
});

// Instance methods
campaignSchema.methods.isActive = function() {
  return (this as any).status === 'active' && (this as any).endDate > new Date();
};

campaignSchema.methods.canReceiveDonations = function() {
  return this.isActive() && (this as any).isVerified && (this as any).raisedAmount < (this as any).targetAmount;
};

campaignSchema.methods.updateProgress = function(donationAmount: number) {
  (this as any).raisedAmount += donationAmount;
  (this as any).donorCount += 1;
  (this as any).lastDonationAt = new Date();
  
  // Check if target is reached
  if ((this as any).raisedAmount >= (this as any).targetAmount) {
    (this as any).status = 'completed';
  }
  
  return this.save();
};

// Static methods
campaignSchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    isVerified: true,
    endDate: { $gt: new Date() }
  });
};

campaignSchema.statics.findFeatured = function() {
  return this.find({
    isFeatured: true,
    status: 'active',
    isVerified: true
  }).sort({ priority: -1, createdAt: -1 });
};

// Export models
export const Campaign = mongoose.model('Campaign', campaignSchema);
export const Milestone = mongoose.model('Milestone', milestoneSchema);
