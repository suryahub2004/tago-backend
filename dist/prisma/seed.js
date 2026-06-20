"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function seedExerciseLibrary(prisma) {
    const exercises = [];
    const categories = ['strength', 'cardio', 'flexibility', 'balance'];
    const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
    const equipment = ['barbell', 'dumbbell', 'bodyweight', 'machine', 'cable'];
    for (let i = 1; i <= 60; i++) {
        exercises.push({
            name: `Exercise ${i}`,
            category: categories[i % categories.length],
            muscleGroup: muscleGroups[i % muscleGroups.length],
            equipment: equipment[i % equipment.length],
            description: `Description for Exercise ${i}`,
            isCustom: false
        });
    }
    await prisma.exercise.deleteMany();
    await prisma.exercise.createMany({ data: exercises, skipDuplicates: true });
}
async function main() {
    console.log('Seeding SmartVital database...');
    const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'admin@smartvital.io';
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'Admin@1234';
    const superAdmin = await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: {},
        create: {
            email: superAdminEmail,
            passwordHash: await bcrypt.hash(superAdminPassword, 12),
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true,
        },
    });
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@smartvital.io' },
        update: {},
        create: {
            email: 'demo@smartvital.io',
            passwordHash: await bcrypt.hash('Demo@1234', 12),
            name: 'Demo User',
            role: 'USER',
            phone: '9999999999',
            isActive: true,
            emailVerified: true,
        },
    });
    await prisma.healthProfile.upsert({
        where: { userId: demoUser.id },
        update: {},
        create: {
            userId: demoUser.id,
            age: 28,
            gender: 'Male',
            fitnessLevel: 'Active',
            fitnessGoal: 'endurance',
            stepsGoal: 10000,
            caloriesGoal: 500,
            onboardingComplete: true,
        },
    });
    await prisma.user.upsert({
        where: { email: 'parent@smartvital.io' },
        update: {},
        create: {
            email: 'parent@smartvital.io',
            passwordHash: await bcrypt.hash('Demo@1234', 12),
            name: 'Demo Parent',
            role: 'PARENT',
            phone: '9999999998',
            isActive: true,
            emailVerified: true,
        },
    });
    await prisma.product.upsert({
        where: { slug: 'smartvital-ring' },
        update: {},
        create: {
            name: 'SmartVital Ring',
            slug: 'smartvital-ring',
            description: 'Advanced health monitoring smart ring. Tracks heart rate, SpO2, skin temperature, sleep stages, and menstrual cycle.',
            deviceType: 'SMART_RING',
            category: 'device',
            price: 8999,
            stock: 100,
            images: ['https://cdn.smartvital.io/products/ring-hero.png'],
            features: ['Heart Rate', 'SpO2', 'Skin Temperature', 'Sleep Tracking', 'HRV', 'Cycle Tracking'],
            sizes: ['US 5', 'US 5.5', 'US 6', 'US 6.5', 'US 7', 'US 7.5', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11', 'US 11.5', 'US 12'],
            colors: ['Midnight Black', 'Silver', 'Rose Gold'],
            isActive: true,
            isFeatured: true,
        },
    });
    await prisma.product.upsert({
        where: { slug: 'smartvital-band' },
        update: {},
        create: {
            name: 'SmartVital Band',
            slug: 'smartvital-band',
            description: 'Professional-grade health band for serious athletes. Tracks strain, recovery, HRV, respiratory rate, and VO2 max.',
            deviceType: 'WHOOP_BAND',
            category: 'device',
            price: 12999,
            stock: 75,
            images: ['https://cdn.smartvital.io/products/band-hero.png'],
            features: ['Strain Coach', 'Recovery Score', 'HRV', 'VO2 Max', 'Respiratory Rate', 'Sleep Tracking'],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: ['Onyx Black', 'Arctic White', 'Carbon Grey'],
            isActive: true,
            isFeatured: true,
        },
    });
    await seedExerciseLibrary(prisma);
    await prisma.firmwareVersion.deleteMany();
    await prisma.firmwareVersion.createMany({
        skipDuplicates: true,
        data: [
            { deviceType: 'SMART_RING', version: '2.1.5',
                s3Key: 'firmware/ring_2.1.5.bin',
                releaseNotes: 'Improved SpO2 accuracy. Better sleep detection. Battery optimisation.',
                isLatest: true },
            { deviceType: 'WHOOP_BAND', version: '3.0.2',
                s3Key: 'firmware/band_3.0.2.bin',
                releaseNotes: 'Enhanced strain algorithm. Faster sync. Reduced power consumption.',
                isLatest: true },
        ],
    });
    console.log('✅ Seed complete — superadmin, demo users, 2 products, exercise library, firmware versions');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map