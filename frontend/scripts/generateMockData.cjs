const fs = require('fs');
const path = require('path');

const departments = ['Engineering', 'HR', 'Finance', 'Operations', 'Security', 'IT Support'];
const firstNames = ['John', 'Emily', 'Michael', 'Sarah', 'David', 'Jessica', 'James', 'Ashley', 'Robert', 'Amanda', 'William', 'Jennifer', 'Joseph', 'Melissa', 'Thomas', 'Nicole', 'Charles', 'Stephanie', 'Christopher', 'Elizabeth', 'Daniel', 'Rachel', 'Matthew', 'Heather', 'Anthony', 'Amber', 'Mark', 'Mary', 'Donald', 'Samantha'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const employees = [];
for (let i = 1; i <= 100; i++) {
  const fName = getRandomItem(firstNames);
  const lName = getRandomItem(lastNames);
  employees.push({
    id: `user-${i}`,
    employeeId: `EMP-${i.toString().padStart(3, '0')}`,
    name: `${fName} ${lName}`,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}@company.com`,
    department: i <= 30 ? 'Engineering' : i <= 40 ? 'HR' : i <= 55 ? 'Finance' : i <= 70 ? 'Operations' : i <= 80 ? 'Security' : 'IT Support',
    role: 'Employee',
    phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: `uid-${i}`,
    assignedAssets: [],
    avatar: `https://ui-avatars.com/api/?name=${fName}+${lName}&background=random`,
    isActive: Math.random() > 0.05,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

const assetModels = [
  { brand: 'Apple', model: 'MacBook Pro M2 Max, 16"', category: 'laptop', cost: 3499 },
  { brand: 'Apple', model: 'MacBook Pro M3 Pro, 14"', category: 'laptop', cost: 1999 },
  { brand: 'Dell', model: 'Latitude 5540', category: 'laptop', cost: 1299 },
  { brand: 'Lenovo', model: 'ThinkPad X1 Carbon', category: 'laptop', cost: 1499 },
  { brand: 'HP', model: 'EliteBook 840 G10', category: 'laptop', cost: 1399 },
  { brand: 'Dell', model: 'U2723QE Monitor', category: 'monitor', cost: 600 },
  { brand: 'Cisco', model: 'Meraki MR46', category: 'router', cost: 899 },
  { brand: 'Cisco', model: 'Catalyst 9200', category: 'switch', cost: 1599 },
  { brand: 'HP', model: 'LaserJet Pro MFP', category: 'printer', cost: 450 },
  { brand: 'Dell', model: 'PowerEdge R750', category: 'server', cost: 5000 },
];

const statuses = [
  { status: 'active', weight: 45 },
  { status: 'in_use', weight: 25 },
  { status: 'maintenance', weight: 10 },
  { status: 'retired', weight: 15 },
  { status: 'disposed', weight: 5 },
];

function getRandomStatus() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const s of statuses) {
    sum += s.weight;
    if (rand <= sum) return s.status;
  }
  return 'active';
}

const locations = ["New York, Desk 4B", "San Francisco, Floor 3", "London, Room 201", "Austin, Cubicle 12", "Seattle, Lab A"];
const vendors = ['TechData', 'CDW', 'SHI', 'Insight', 'Apple Direct'];

const assets = [];
for (let i = 1; i <= 500; i++) {
  const modelInfo = getRandomItem(assetModels);
  const status = getRandomStatus();
  let assignedTo = null;
  let assignedToName = '-';
  
  if (status === 'in_use') {
    const emp = getRandomItem(employees);
    assignedTo = emp.id;
    assignedToName = emp.name;
    emp.assignedAssets.push(`IT-${i.toString().padStart(5, '0')}`);
  }

  const purDate = new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const warrEnd = new Date(purDate);
  warrEnd.setFullYear(warrEnd.getFullYear() + (Math.random() > 0.5 ? 3 : 1));

  assets.push({
    id: `asset-${i}`,
    assetId: `IT-${i.toString().padStart(5, '0')}`,
    name: `${modelInfo.brand} ${modelInfo.model}`,
    category: modelInfo.category,
    brand: modelInfo.brand,
    model: modelInfo.model,
    serialNumber: Math.random().toString(36).substring(2, 12).toUpperCase(),
    barcode: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
    qrCode: `QR-${i}`,
    purchaseDate: purDate.toISOString().split('T')[0],
    warrantyStart: purDate.toISOString().split('T')[0],
    warrantyEnd: warrEnd.toISOString().split('T')[0],
    cost: modelInfo.cost,
    department: getRandomItem(departments),
    assignedTo,
    assignedToName,
    location: getRandomItem(locations),
    status,
    condition: getRandomItem(['new', 'good', 'fair', 'poor']),
    vendor: getRandomItem(vendors),
    invoiceUrl: '#',
    imageUrl: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=200&h=200`,
    attachments: [],
    notes: 'Generated mock data',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
  });
}

const fileContent = `
import { Asset } from '@/types/asset';
import { Employee } from '@/types/employee';

export const mockEmployees: Employee[] = ${JSON.stringify(employees, null, 2)} as Employee[];

export const mockAssets: Asset[] = ${JSON.stringify(assets, null, 2)} as Asset[];
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'lib', 'mock-data.ts'), fileContent.trim());
console.log('Mock data generated successfully.');
