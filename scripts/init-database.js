// MongoDB Database Initialization Script
use admin;

// Create admin user
db.createUser({
  user: "admin",
  pwd: "secure_admin_password_change_me",
  roles: ["root"]
});

// Create application database
use dilsedaan_production;

// Create application user
db.createUser({
  user: "dilsedaan_app",
  pwd: "secure_app_password_change_me",
  roles: [
    { role: "readWrite", db: "dilsedaan_production" },
    { role: "dbAdmin", db: "dilsedaan_production" }
  ]
});

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "role"],
      properties: {
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        role: { enum: ["user", "admin", "moderator"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("campaigns", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "targetAmount", "creator"],
      properties: {
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        targetAmount: { bsonType: "number" },
        currentAmount: { bsonType: "number" },
        status: { enum: ["draft", "active", "completed", "cancelled"] },
        creator: { bsonType: "objectId" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("donations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["amount", "campaign", "donor"],
      properties: {
        amount: { bsonType: "number" },
        campaign: { bsonType: "objectId" },
        donor: { bsonType: "objectId" },
        transactionHash: { bsonType: "string" },
        status: { enum: ["pending", "completed", "failed"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "twoFactor.isEnabled": 1 });

db.campaigns.createIndex({ "status": 1 });
db.campaigns.createIndex({ "creator": 1 });
db.campaigns.createIndex({ "createdAt": -1 });
db.campaigns.createIndex({ "targetAmount": 1 });
db.campaigns.createIndex({ "currentAmount": 1 });

db.donations.createIndex({ "campaign": 1 });
db.donations.createIndex({ "donor": 1 });
db.donations.createIndex({ "createdAt": -1 });
db.donations.createIndex({ "transactionHash": 1 }, { unique: true });
db.donations.createIndex({ "status": 1 });

print("✅ Database initialization completed successfully!");
