const mongoose = require('mongoose');
require('dotenv').config();

// Simple Campaign schema for seeding
const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  category: { type: String, required: true },
  status: { type: String, default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  beneficiaryCount: { type: Number, required: true },
  images: [{
    url: { type: String, required: true },
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  documents: [String],
  tags: [String],
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  priority: { type: Number, default: 0 }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false },
  phone: { type: String }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
const User = mongoose.model('User', userSchema);

const sampleCampaigns = [
  {
    title: "Padhega India, Tabhi Toh Badhega India!",
    description: "Let every child hold a book, not a broom. Support education for underprivileged children across India to build a stronger nation. Your contribution helps provide school books, uniforms, and digital learning tools to children who dream of a better future.",
    targetAmount: 500000,
    category: "education",
    status: "active",
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    location: { state: "Delhi", city: "New Delhi", pincode: "110001" },
    beneficiaryCount: 1000,
    images: [{ url: "/images/image_1.png", caption: "Children learning in rural schools", isPrimary: true }],
    tags: ["education", "children", "rural", "digital-learning", "books"],
    isVerified: true,
    isFeatured: true,
    priority: 10
  },
  {
    title: "Ek Thali Khushiyon Ki",
    description: "Feed one empty stomach, fill two hearts. Provide nutritious meals to hungry families and street children across India. No child should sleep hungry when we can make a difference together.",
    targetAmount: 300000,
    category: "healthcare",
    status: "active",
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    location: { state: "Maharashtra", city: "Mumbai", pincode: "400001" },
    beneficiaryCount: 500,
    images: [{ url: "/images/image_2.png", caption: "Children receiving nutritious meals", isPrimary: true }],
    tags: ["food", "children", "nutrition", "hunger", "slums"],
    isVerified: true,
    isFeatured: true,
    priority: 9
  },
  {
    title: "Aarogya Bharat - Healthcare for All",
    description: "Bringing quality healthcare to remote villages where medical facilities are scarce. Support mobile medical units, free health checkups, and essential medicines for rural communities.",
    targetAmount: 750000,
    category: "healthcare",
    status: "active",
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    location: { state: "Rajasthan", city: "Jaipur", pincode: "302001" },
    beneficiaryCount: 2000,
    images: [{ url: "/images/image_3.png", caption: "Mobile medical unit serving rural areas", isPrimary: true }],
    tags: ["healthcare", "rural", "medical", "villages", "mobile-units"],
    isVerified: true,
    isFeatured: true,
    priority: 8
  },
  {
    title: "Swachh Bharat, Sundar Bharat",
    description: "Clean India, Beautiful India - Join our mission to create sustainable waste management systems in rural areas. Build toilets, install water purification systems, and educate communities about hygiene practices.",
    targetAmount: 600000,
    category: "environment",
    status: "active",
    endDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
    location: { state: "Uttar Pradesh", city: "Lucknow", pincode: "226001" },
    beneficiaryCount: 1500,
    images: [{ url: "/images/image_4.png", caption: "Clean water and sanitation facilities", isPrimary: true }],
    tags: ["environment", "sanitation", "clean-water", "toilets", "hygiene"],
    isVerified: true,
    isFeatured: false,
    priority: 7
  },
  {
    title: "Skill India - Empowering Youth",
    description: "Empower unemployed youth with market-relevant skills training in technology, handicrafts, and vocational trades. Bridge the gap between education and employment by providing hands-on training and certification.",
    targetAmount: 400000,
    category: "education",
    status: "active",
    endDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
    location: { state: "Karnataka", city: "Bangalore", pincode: "560001" },
    beneficiaryCount: 800,
    images: [{ url: "/images/image_5.png", caption: "Youth skill development training program", isPrimary: true }],
    tags: ["skill-development", "youth", "employment", "training", "certification"],
    isVerified: true,
    isFeatured: false,
    priority: 6
  },
  {
    title: "Gau Seva - Protecting Stray Animals",
    description: "Rescue, treat, and care for abandoned and injured stray animals across India. Build animal shelters, provide veterinary care, and promote animal welfare awareness.",
    targetAmount: 350000,
    category: "animal_welfare",
    status: "active",
    endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    location: { state: "Gujarat", city: "Ahmedabad", pincode: "380001" },
    beneficiaryCount: 1000,
    images: [{ url: "/images/image_6.png", caption: "Animal rescue and care facility", isPrimary: true }],
    tags: ["animal-welfare", "stray-animals", "veterinary", "shelter", "rescue"],
    isVerified: true,
    isFeatured: false,
    priority: 5
  },
  {
    title: "Divyang Shakti - Empowering Differently Abled",
    description: "Empower differently-abled individuals with assistive technologies, skill training, and employment opportunities. Break barriers and create an inclusive society.",
    targetAmount: 450000,
    category: "human_rights",
    status: "active",
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    location: { state: "Tamil Nadu", city: "Chennai", pincode: "600001" },
    beneficiaryCount: 600,
    images: [{ url: "/images/image_7.png", caption: "Differently abled individuals in skill training", isPrimary: true }],
    tags: ["disability", "inclusion", "assistive-technology", "employment", "accessibility"],
    isVerified: true,
    isFeatured: false,
    priority: 4
  },
  {
    title: "Kisan Kalyan - Supporting Farmers",
    description: "Support small and marginal farmers with modern farming techniques, organic seeds, irrigation systems, and fair market access. Help farmers achieve financial stability.",
    targetAmount: 650000,
    category: "community_development",
    status: "active",
    endDate: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000),
    location: { state: "Punjab", city: "Chandigarh", pincode: "160001" },
    beneficiaryCount: 1200,
    images: [{ url: "/images/image_8.png", caption: "Farmers using modern farming techniques", isPrimary: true }],
    tags: ["agriculture", "farmers", "organic-farming", "irrigation", "rural-development"],
    isVerified: true,
    isFeatured: false,
    priority: 3
  },
  {
    title: "Mahila Shakti - Women Empowerment",
    description: "Empower women with entrepreneurship skills, microfinance support, and leadership training. Create self-help groups and support women-led businesses.",
    targetAmount: 550000,
    category: "human_rights",
    status: "active",
    endDate: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000),
    location: { state: "West Bengal", city: "Kolkata", pincode: "700001" },
    beneficiaryCount: 900,
    images: [{ url: "/images/image_9.png", caption: "Women in entrepreneurship training program", isPrimary: true }],
    tags: ["women-empowerment", "entrepreneurship", "microfinance", "self-help-groups", "leadership"],
    isVerified: true,
    isFeatured: false,
    priority: 2
  },
  {
    title: "Digital India - Technology for Villages",
    description: "Bridge the digital divide by bringing internet connectivity, computer literacy, and digital services to remote villages. Establish digital literacy centers and enable online access to government services.",
    targetAmount: 700000,
    category: "technology",
    status: "active",
    endDate: new Date(Date.now() + 130 * 24 * 60 * 60 * 1000),
    location: { state: "Madhya Pradesh", city: "Bhopal", pincode: "462001" },
    beneficiaryCount: 2500,
    images: [{ url: "/images/image_10.png", caption: "Digital literacy training in rural areas", isPrimary: true }],
    tags: ["digital-literacy", "rural-internet", "technology", "government-services", "connectivity"],
    isVerified: true,
    isFeatured: false,
    priority: 1
  },
  {
    title: "Virasat - Preserving Cultural Heritage",
    description: "Preserve India's rich cultural heritage by supporting traditional artists, craftsmen, and cultural practices. Document folk songs, protect historical sites, and provide platforms for traditional art forms.",
    targetAmount: 400000,
    category: "arts_culture",
    status: "active",
    endDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
    location: { state: "Rajasthan", city: "Udaipur", pincode: "313001" },
    beneficiaryCount: 750,
    images: [{ url: "/images/image_11.png", caption: "Traditional artists preserving cultural heritage", isPrimary: true }],
    tags: ["cultural-heritage", "traditional-arts", "craftsmen", "folk-culture", "preservation"],
    isVerified: true,
    isFeatured: false,
    priority: 0
  },
  {
    title: "Flood Relief Kerala - Emergency Response",
    description: "Immediate relief for flood-affected families in Kerala. Provide emergency shelter, food, medical aid, and rehabilitation support. Help families rebuild their homes and lives after devastating floods.",
    targetAmount: 1000000,
    category: "disaster_relief",
    status: "active",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    location: { state: "Kerala", city: "Kochi", pincode: "682001" },
    beneficiaryCount: 3000,
    images: [{ url: "/images/image_12.png", caption: "Flood relief operations in Kerala", isPrimary: true }],
    tags: ["disaster-relief", "floods", "emergency", "rehabilitation", "kerala"],
    isVerified: true,
    isFeatured: true,
    priority: 10
  },
  {
    title: "Cancer Care Support - Fighting Together",
    description: "Support cancer patients and their families with treatment costs, emotional counseling, and rehabilitation services. Provide free chemotherapy, medicines, and support services to those who cannot afford expensive treatments.",
    targetAmount: 850000,
    category: "healthcare",
    status: "active",
    endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    location: { state: "Maharashtra", city: "Pune", pincode: "411001" },
    beneficiaryCount: 400,
    images: [{ url: "/images/image_13.png", caption: "Cancer patients receiving treatment and support", isPrimary: true }],
    tags: ["cancer-care", "healthcare", "treatment", "counseling", "medical-support"],
    isVerified: true,
    isFeatured: true,
    priority: 9
  }
];

async function seedCampaigns() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dilsedaan');
    console.log('Connected to MongoDB');

    // Check if campaigns already exist
    const existingCampaigns = await Campaign.countDocuments();
    if (existingCampaigns > 0) {
      console.log(`Found ${existingCampaigns} existing campaigns. Clearing database first...`);
      await Campaign.deleteMany({});
      console.log('Cleared existing campaigns');
    }

    // Find or create a default user to be the creator
    let defaultUser = await User.findOne({ email: 'admin@dilsedaan.com' });
    if (!defaultUser) {
      defaultUser = await User.create({
        name: 'Admin User',
        email: 'admin@dilsedaan.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        phone: '9876543210'
      });
      console.log('Created default admin user');
    }

    // Create campaigns with the default user as creator
    const campaignsToCreate = sampleCampaigns.map(campaign => ({
      ...campaign,
      creator: defaultUser._id
    }));

    const createdCampaigns = await Campaign.insertMany(campaignsToCreate);
    
    console.log(`Successfully created ${createdCampaigns.length} campaigns!`);
    
    // Log some statistics
    const verifiedCount = createdCampaigns.filter(c => c.isVerified).length;
    const featuredCount = createdCampaigns.filter(c => c.isFeatured).length;
    
    console.log(`- ${verifiedCount} verified campaigns`);
    console.log(`- ${featuredCount} featured campaigns`);
    console.log('- Categories represented:', [...new Set(createdCampaigns.map(c => c.category))]);
    
  } catch (error) {
    console.error('Error seeding campaigns:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run the seeding function
seedCampaigns();
