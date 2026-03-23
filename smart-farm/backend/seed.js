require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User      = require('./models/User');
const Land      = require('./models/Land');
const Crop      = require('./models/Crop');
const Equipment = require('./models/Equipment');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔌 Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), Land.deleteMany(), Crop.deleteMany(), Equipment.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // ── Admin ───────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Rajesh Verma',
    email: 'admin@smartfarm.com',
    password: 'admin123',
    role: 'admin',
    phone: '9900000001',
    address: 'Agriculture Department, Pune, Maharashtra',
  });
  console.log('✅ Admin created: admin@smartfarm.com / admin123');

  // ── Farmers ─────────────────────────────────────────────────────────────
  const farmersData = [
    { name: 'Ramesh Patil',    email: 'farmer@demo.com',         password: 'farmer123', phone: '9876543210', address: 'Nashik, Maharashtra' },
    { name: 'Sunita Devi',     email: 'sunita@farm.com',          password: 'farmer123', phone: '9876543211', address: 'Amravati, Maharashtra' },
    { name: 'Arjun Singh',     email: 'arjun@farm.com',           password: 'farmer123', phone: '9876543212', address: 'Nagpur, Maharashtra' },
    { name: 'Kavitha Reddy',   email: 'kavitha@farm.com',         password: 'farmer123', phone: '9876543213', address: 'Aurangabad, Maharashtra' },
    { name: 'Mohan Sharma',    email: 'mohan@farm.com',           password: 'farmer123', phone: '9876543214', address: 'Solapur, Maharashtra' },
  ];

  const farmers = await User.insertMany(farmersData.map(f => ({ ...f, role: 'farmer' })));
  console.log(`✅ ${farmers.length} farmers created`);

  // ── Land Records ─────────────────────────────────────────────────────────
  const landsData = [
    { farmerId: farmers[0]._id, landSize: 3.5, unit: 'acres', soilType: 'Black Cotton', irrigationType: 'Drip', location: 'Nashik, Maharashtra', surveyNumber: '45/A', approvalStatus: 'approved', remarks: 'Documents verified. Land suitable for grape cultivation.' },
    { farmerId: farmers[0]._id, landSize: 1.8, unit: 'acres', soilType: 'Sandy',        irrigationType: 'Borewell', location: 'Sinnar, Nashik', surveyNumber: '102/B', approvalStatus: 'pending' },
    { farmerId: farmers[1]._id, landSize: 5.0, unit: 'acres', soilType: 'Loamy',        irrigationType: 'Canal',   location: 'Amravati, Maharashtra', surveyNumber: '77/C', approvalStatus: 'approved', remarks: 'Verified. Good water availability.' },
    { farmerId: farmers[1]._id, landSize: 2.2, unit: 'acres', soilType: 'Clay',         irrigationType: 'Rain-fed', location: 'Daryapur, Amravati', surveyNumber: '33/A', approvalStatus: 'rejected', remarks: 'Survey number mismatch. Please resubmit with correct documents.' },
    { farmerId: farmers[2]._id, landSize: 7.5, unit: 'acres', soilType: 'Black Cotton', irrigationType: 'Flood',   location: 'Nagpur, Maharashtra', surveyNumber: '55/D', approvalStatus: 'pending' },
    { farmerId: farmers[3]._id, landSize: 4.0, unit: 'hectares', soilType: 'Silty',     irrigationType: 'Sprinkler', location: 'Aurangabad, Maharashtra', surveyNumber: '88/E', approvalStatus: 'approved', remarks: 'All records verified.' },
    { farmerId: farmers[4]._id, landSize: 2.5, unit: 'acres', soilType: 'Loamy',        irrigationType: 'Drip',    location: 'Solapur, Maharashtra', surveyNumber: '11/F', approvalStatus: 'pending' },
  ];
  const lands = await Land.insertMany(landsData);
  console.log(`✅ ${lands.length} land records created`);

  // ── Crops ─────────────────────────────────────────────────────────────────
  const cropsData = [
    { farmerId: farmers[0]._id, cropName: 'Grapes',    cropStatus: 'sown',       sowingDate: '2024-06-01', harvestDate: '2024-11-15', fertilizer: 'NPK 19-19-19',   notes: 'Good growth, needs foliar spray' },
    { farmerId: farmers[0]._id, cropName: 'Onion',     cropStatus: 'to_be_sown', sowingDate: '2024-10-01', harvestDate: '2025-01-15', fertilizer: 'Urea',            notes: 'Preparing soil' },
    { farmerId: farmers[1]._id, cropName: 'Cotton',    cropStatus: 'sown',       sowingDate: '2024-05-20', harvestDate: '2024-12-01', fertilizer: 'DAP',             notes: 'Bollworm control applied' },
    { farmerId: farmers[1]._id, cropName: 'Soybean',   cropStatus: 'harvested',  sowingDate: '2024-06-15', harvestDate: '2024-09-20', fertilizer: 'Rhizobium',       notes: 'Good yield this season' },
    { farmerId: farmers[2]._id, cropName: 'Wheat',     cropStatus: 'to_be_sown', sowingDate: '2024-11-01', harvestDate: '2025-03-15', fertilizer: 'Urea + DAP',      notes: 'Waiting for monsoon to end' },
    { farmerId: farmers[2]._id, cropName: 'Turmeric',  cropStatus: 'sown',       sowingDate: '2024-07-01', harvestDate: '2025-01-01', fertilizer: 'Organic compost', notes: 'Organic farming plot' },
    { farmerId: farmers[3]._id, cropName: 'Sugarcane', cropStatus: 'sown',       sowingDate: '2024-01-15', harvestDate: '2025-01-15', fertilizer: 'Ammonium sulphate', notes: 'Ratoon crop' },
    { farmerId: farmers[4]._id, cropName: 'Jowar',     cropStatus: 'harvested',  sowingDate: '2024-05-01', harvestDate: '2024-08-25', fertilizer: 'Urea',            notes: 'Yield 22 quintals/acre' },
    { farmerId: farmers[4]._id, cropName: 'Pomegranate', cropStatus: 'sown',     sowingDate: '2023-03-01', harvestDate: '2024-10-01', fertilizer: 'MKP spray',       notes: 'Fruit setting in progress' },
  ];
  const crops = await Crop.insertMany(cropsData);
  console.log(`✅ ${crops.length} crop records created`);

  // ── Equipment ─────────────────────────────────────────────────────────────
  const equipmentData = [
    { farmerId: farmers[0]._id, equipmentName: 'Mahindra 575 DI',       type: 'Tractor',        purchaseYear: 2019, condition: 'good'      },
    { farmerId: farmers[0]._id, equipmentName: 'KSB Irrigation Pump',   type: 'Irrigation Pump', purchaseYear: 2021, condition: 'excellent' },
    { farmerId: farmers[1]._id, equipmentName: 'John Deere 5310',        type: 'Tractor',        purchaseYear: 2018, condition: 'good'      },
    { farmerId: farmers[1]._id, equipmentName: 'Preet 987 Harvester',    type: 'Harvester',      purchaseYear: 2022, condition: 'excellent' },
    { farmerId: farmers[2]._id, equipmentName: 'TAFE 45 DI Tractor',     type: 'Tractor',        purchaseYear: 2015, condition: 'fair'      },
    { farmerId: farmers[2]._id, equipmentName: 'Manual Sprayer 16L',     type: 'Sprayer',        purchaseYear: 2023, condition: 'excellent' },
    { farmerId: farmers[3]._id, equipmentName: 'Eicher 368 Tractor',     type: 'Tractor',        purchaseYear: 2017, condition: 'good'      },
    { farmerId: farmers[4]._id, equipmentName: 'Kirloskar Water Pump',   type: 'Irrigation Pump', purchaseYear: 2020, condition: 'good'      },
    { farmerId: farmers[4]._id, equipmentName: 'Kubota Thresher',        type: 'Thresher',       purchaseYear: 2016, condition: 'fair'      },
  ];
  await Equipment.insertMany(equipmentData);
  console.log(`✅ ${equipmentData.length} equipment records created`);

  // Send one notification to demo farmer
  await User.findByIdAndUpdate(farmers[0]._id, {
    $push: {
      notifications: {
        message: `Your land at Nashik, Maharashtra has been approved. Documents verified. Land suitable for grape cultivation.`,
        read: false,
      }
    }
  });

  console.log('\n🌾 ─────────────────────────────────────────────────');
  console.log('   Seed completed successfully!');
  console.log('   Admin:  admin@smartfarm.com  /  admin123');
  console.log('   Farmer: farmer@demo.com      /  farmer123');
  console.log('─────────────────────────────────────────────────\n');

  await mongoose.disconnect();
};

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
