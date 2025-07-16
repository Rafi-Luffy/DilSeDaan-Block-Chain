import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import connectDB from '../config/database';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out for production)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Campaign.deleteMany({});

    // Create Admin User with Indian Tax Department credentials
    console.log('Creating admin user...');
    const adminPasswordHash = await bcrypt.hash('ServingIndia', 12);
    const adminUser = await User.create({
      email: 'Indian_tax_dep.charity@gmail.com',
      password: adminPasswordHash,
      name: 'Indian Tax Department - Charity Division',
      role: 'admin',
      isEmailVerified: true,
      profile: {
        bio: 'Official administrator for charity oversight and compliance',
        location: 'New Delhi, India',
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          privacy: {
            showDonations: false,
            showProfile: true
          }
        },
        stats: {
          totalDonated: 0,
          totalCampaigns: 0,
          totalVolunteerHours: 0,
          impactScore: 100
        }
      }
    });

    // Create Test Users
    console.log('👥 Creating test users...');
    const testUsers = [];

    const users = [
      {
        email: 'rajesh.kumar@example.com',
        name: 'Rajesh Kumar',
        role: 'donor',
        location: 'Delhi, India'
      },
      {
        email: 'priya.sharma@example.com',
        name: 'Priya Sharma',
        role: 'donor',
        location: 'Bangalore, India'
      },
      {
        email: 'amit.patel@example.com',
        name: 'Amit Patel',
        role: 'donor',
        location: 'Mumbai, India'
      },
      {
        email: 'neha.gupta@example.com',
        name: 'Neha Gupta',
        role: 'charity',
        location: 'Chennai, India'
      }
    ];

    for (const userData of users) {
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await User.create({
        email: userData.email,
        password: passwordHash,
        name: userData.name,
        role: userData.role,
        isEmailVerified: true,
        profile: {
          location: userData.location,
          preferences: {
            language: 'en',
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            privacy: {
              showDonations: true,
              showProfile: true
            }
          },
          stats: {
            totalDonated: Math.floor(Math.random() * 50000),
            totalCampaigns: Math.floor(Math.random() * 5),
            totalVolunteerHours: Math.floor(Math.random() * 100),
            impactScore: Math.floor(Math.random() * 50) + 10
          }
        }
      });
      testUsers.push(user);
    }

    // Create Sample Campaigns
    console.log('📋 Creating sample campaigns...');
    const sampleCampaigns = [
      {
        title: 'Padhega India, Tabhi Toh Badhega India!',
        description: 'Every child deserves access to quality education. Help us provide books, uniforms, and educational resources to underprivileged children across India.',
        category: 'education',
        targetAmount: 500000,
        currentAmount: 150000,
        location: {
          state: 'Maharashtra',
          city: 'Mumbai',
          pincode: '400001',
          address: 'Mumbai Education District'
        },
        beneficiaryCount: 500,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        tags: ['education', 'children', 'rural development'],
        images: [
          {
            url: '/images/campaigns/image_1.png',
            caption: 'Education for all children',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Ek Thali Khushiyon Ki',
        description: 'No one should sleep hungry. Join us in providing nutritious meals to families in need across India.',
        category: 'other',
        targetAmount: 300000,
        currentAmount: 89000,
        location: {
          state: 'Rajasthan',
          city: 'Jaipur',
          pincode: '302001',
          address: 'Jaipur Food Distribution Center'
        },
        beneficiaryCount: 1000,
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        tags: ['food', 'hunger', 'relief'],
        images: [
          {
            url: '/images/campaigns/image_2.png',
            caption: 'Nutritious meals for families',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Beti Padhao, Sapne Sajao',
        description: 'Empowering girls through education and skill development. Help us break barriers and create opportunities for young women.',
        category: 'education',
        targetAmount: 400000,
        currentAmount: 123400,
        location: {
          state: 'Uttar Pradesh',
          city: 'Lucknow',
          pincode: '226001',
          address: 'Lucknow Women Empowerment Center'
        },
        beneficiaryCount: 300,
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        tags: ['women empowerment', 'education', 'skills'],
        images: [
          {
            url: '/images/campaigns/image_3.png',
            caption: 'Empowering girls through education',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Ek Chhat – Ek Jeevan',
        description: 'Providing safe shelter and housing for homeless families. Every family deserves a roof over their head.',
        category: 'community_development',
        targetAmount: 800000,
        currentAmount: 192000,
        location: {
          state: 'West Bengal',
          city: 'Kolkata',
          pincode: '700001',
          address: 'Kolkata Housing Project'
        },
        beneficiaryCount: 150,
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        tags: ['housing', 'shelter', 'families'],
        images: [
          {
            url: '/images/campaigns/image_4.png',
            caption: 'Safe shelter for families',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Jeevan Bachao, Muskaan Lautaao',
        description: 'Emergency medical assistance for critical patients who cannot afford life-saving treatments.',
        category: 'healthcare',
        targetAmount: 600000,
        currentAmount: 256000,
        location: {
          state: 'Karnataka',
          city: 'Bangalore',
          pincode: '560001',
          address: 'Bangalore Medical Emergency Center'
        },
        beneficiaryCount: 200,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        tags: ['healthcare', 'emergency', 'medical'],
        images: [
          {
            url: '/images/campaigns/image_5.png',
            caption: 'Emergency medical assistance',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Garmi ho ya Sardi, Madad ho har kism ki',
        description: 'Disaster relief and emergency assistance for natural calamities across all seasons.',
        category: 'disaster_relief',
        targetAmount: 450000,
        currentAmount: 123000,
        location: {
          state: 'Gujarat',
          city: 'Ahmedabad',
          pincode: '380001',
          address: 'Gujarat Disaster Relief Center'
        },
        beneficiaryCount: 800,
        endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        tags: ['disaster relief', 'emergency', 'natural calamities'],
        images: [
          {
            url: '/images/campaigns/image_6.png',
            caption: 'Disaster relief support',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Gaon-Gaon Paani, Har Haath Swachhta',
        description: 'Clean water and sanitation facilities for rural villages across India.',
        category: 'environment',
        targetAmount: 700000,
        currentAmount: 234000,
        location: {
          state: 'Madhya Pradesh',
          city: 'Bhopal',
          pincode: '462001',
          address: 'Madhya Pradesh Water Project'
        },
        beneficiaryCount: 2000,
        endDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        tags: ['water', 'sanitation', 'rural development'],
        images: [
          {
            url: '/images/campaigns/image_7.png',
            caption: 'Clean water for villages',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Naye Hunar, Nayi Pehchaan',
        description: 'Skill development and vocational training for unemployed youth across India.',
        category: 'education',
        targetAmount: 350000,
        currentAmount: 98000,
        location: {
          state: 'Punjab',
          city: 'Chandigarh',
          pincode: '160001',
          address: 'Punjab Skill Development Center'
        },
        beneficiaryCount: 400,
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        tags: ['skill development', 'youth', 'employment'],
        images: [
          {
            url: '/images/campaigns/image_8.png',
            caption: 'Skill development for youth',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Maa Yamuna Ko Saaf Bhi Rakhna Hai, Zinda Bhi',
        description: 'Environmental conservation and river cleaning project for the sacred Yamuna river.',
        category: 'environment',
        targetAmount: 900000,
        currentAmount: 345000,
        location: {
          state: 'Uttar Pradesh',
          city: 'Mathura',
          pincode: '281001',
          address: 'Yamuna Conservation Project'
        },
        beneficiaryCount: 5000,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        tags: ['environment', 'river cleaning', 'conservation'],
        images: [
          {
            url: '/images/campaigns/image_9.png',
            caption: 'Yamuna river conservation',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Buzurgo Ka Haq – Apnapan aur Samman',
        description: 'Care and support for elderly citizens who need assistance and companionship.',
        category: 'human_rights',
        targetAmount: 250000,
        currentAmount: 67000,
        location: {
          state: 'Tamil Nadu',
          city: 'Chennai',
          pincode: '600001',
          address: 'Chennai Elderly Care Center'
        },
        beneficiaryCount: 120,
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        tags: ['elderly care', 'support', 'companionship'],
        images: [
          {
            url: '/images/campaigns/image_10.png',
            caption: 'Care for elderly citizens',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Khilti Muskaan, Acid ke Paar',
        description: 'Support and rehabilitation for acid attack survivors, providing medical care and legal assistance.',
        category: 'healthcare',
        targetAmount: 500000,
        currentAmount: 178000,
        location: {
          state: 'Delhi',
          city: 'New Delhi',
          pincode: '110001',
          address: 'Delhi Survivor Support Center'
        },
        beneficiaryCount: 50,
        endDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
        tags: ['survivor support', 'rehabilitation', 'legal aid'],
        images: [
          {
            url: '/images/campaigns/image_11.png',
            caption: 'Support for acid attack survivors',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Mazdoor Desh Ka Mazboot Haath',
        description: 'Supporting migrant workers and daily wage laborers with emergency assistance and job security.',
        category: 'community_development',
        targetAmount: 400000,
        currentAmount: 145000,
        location: {
          state: 'Bihar',
          city: 'Patna',
          pincode: '800001',
          address: 'Bihar Worker Support Center'
        },
        beneficiaryCount: 600,
        endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        tags: ['workers', 'employment', 'job security'],
        images: [
          {
            url: '/images/campaigns/image_12.png',
            caption: 'Support for migrant workers',
            isPrimary: true
          }
        ],
        milestones: []
      },
      {
        title: 'Man Ki Baat, Sunne Wale Hain Hum',
        description: 'Mental health support and counseling services for those struggling with depression and anxiety.',
        category: 'healthcare',
        targetAmount: 300000,
        currentAmount: 89000,
        location: {
          state: 'Haryana',
          city: 'Gurgaon',
          pincode: '122001',
          address: 'Haryana Mental Health Center'
        },
        beneficiaryCount: 250,
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        tags: ['mental health', 'counseling', 'support'],
        images: [
          {
            url: '/images/campaigns/image_13.png',
            caption: 'Mental health support services',
            isPrimary: true
          }
        ],
        milestones: []
      }
    ];

    for (let i = 0; i < sampleCampaigns.length; i++) {
      const campaignData = sampleCampaigns[i];
      const creator = testUsers[i % testUsers.length];

      await Campaign.create({
        ...campaignData,
        creator: creator._id,
        status: 'active'
      });
    }

    console.log('Database seeding completed successfully!');
    console.log('\nSeeded Data Summary:');
    console.log(`Admin User: Indian_tax_dep.charity@gmail.com (password: ServingIndia)`);
    console.log(`👥 Test Users: ${testUsers.length} users created`);
    console.log(`📋 Sample Campaigns: ${sampleCampaigns.length} campaigns created`);
    console.log('\n🔑 Test User Credentials:');
    console.log('Email: rajesh.kumar@example.com | Password: password123');
    console.log('Email: priya.sharma@example.com | Password: password123');
    console.log('Email: amit.patel@example.com | Password: password123');
    console.log('Email: neha.gupta@example.com | Password: password123');

    console.log('\nYou can now start the server and test the authentication!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this script is executed directly
if (process.argv[1].endsWith('seed') || process.argv[1].endsWith('seed.ts')) {
  seedData();
}

export default seedData;
