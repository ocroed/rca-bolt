import { RootCauseAnalysis } from '../types';

export const mockRCAs: RootCauseAnalysis[] = [
  {
    id: 'RCA-2023-001',
    title: 'Conveyor Belt Failure - Line 3',
    description: 'Unexpected conveyor belt failure on production line 3 resulting in 8 hours of downtime and damaged products.',
    status: 'completed',
    createdAt: '2023-09-15T08:30:00Z',
    updatedAt: '2023-10-05T14:20:00Z',
    completedAt: '2023-10-05T14:20:00Z',
    impact: {
      financialCost: 125000,
      downtimeDays: 0.33,
      productionLoss: 1200,
      severityLevel: 3
    },
    equipment: 'Conveyor System CM-1045',
    location: 'Building A, Line 3',
    department: 'Production',
    assignedTo: [
      { id: 'user1', name: 'John Doe', role: 'Maintenance Lead', department: 'Maintenance' },
      { id: 'user2', name: 'Jane Smith', role: 'Production Supervisor', department: 'Production' }
    ],
    leadInvestigator: { id: 'user1', name: 'John Doe', role: 'Maintenance Lead', department: 'Maintenance' },
    findings: [
      'Belt tension system was improperly calibrated during last maintenance cycle',
      'Warning indicators were ignored by operators for 3 days prior to failure',
      'Preventative maintenance schedule was not followed correctly'
    ],
    recommendations: [
      'Recalibrate tension systems on all conveyor lines',
      'Implement operator training for recognizing warning signs',
      'Update maintenance schedule and accountability system'
    ],
    actions: [
      {
        id: 'action1',
        description: 'Revise maintenance protocols for conveyor systems',
        assignedTo: 'user1',
        dueDate: '2023-10-20T00:00:00Z',
        status: 'completed'
      },
      {
        id: 'action2',
        description: 'Conduct training session for line operators',
        assignedTo: 'user2',
        dueDate: '2023-10-25T00:00:00Z',
        status: 'completed'
      }
    ]
  },
  {
    id: 'RCA-2023-002',
    title: 'CNC Machine Calibration Error',
    description: 'Systematic calibration error in CNC machines resulting in quality issues across multiple product lines.',
    status: 'in-progress',
    createdAt: '2023-10-12T09:15:00Z',
    updatedAt: '2023-10-18T11:20:00Z',
    impact: {
      financialCost: 89000,
      downtimeDays: 0.5,
      productionLoss: 750,
      severityLevel: 4
    },
    equipment: 'CNC Machine Series K400',
    location: 'Building B, Machining Department',
    department: 'Manufacturing',
    assignedTo: [
      { id: 'user3', name: 'Robert Chen', role: 'Quality Engineer', department: 'Quality' },
      { id: 'user4', name: 'Maria Garcia', role: 'Production Manager', department: 'Production' }
    ],
    leadInvestigator: { id: 'user3', name: 'Robert Chen', role: 'Quality Engineer', department: 'Quality' },
    findings: [
      'Software update introduced systematic calibration error',
      'Quality control process failed to detect the issue for 2 production cycles',
      'Calibration verification procedure was inadequate'
    ],
    recommendations: [
      'Implement stronger testing protocol for software updates',
      'Add additional quality check for calibrated parts',
      'Update calibration verification procedures'
    ],
    actions: [
      {
        id: 'action3',
        description: 'Develop new calibration verification protocol',
        assignedTo: 'user3',
        dueDate: '2023-10-30T00:00:00Z',
        status: 'in-progress'
      },
      {
        id: 'action4',
        description: 'Roll back software update and coordinate with vendor',
        assignedTo: 'user4',
        dueDate: '2023-10-20T00:00:00Z',
        status: 'completed'
      }
    ]
  },
  {
    id: 'RCA-2023-003',
    title: 'Hydraulic System Pressure Loss',
    description: 'Unexpected pressure loss in main hydraulic system affecting multiple production stations.',
    status: 'in-progress',
    createdAt: '2023-10-05T14:30:00Z',
    updatedAt: '2023-10-19T09:45:00Z',
    impact: {
      financialCost: 215000,
      downtimeDays: 1.5,
      productionLoss: 3200,
      severityLevel: 5
    },
    equipment: 'Hydraulic System H-9000',
    location: 'Building A, Central Systems',
    department: 'Facilities',
    assignedTo: [
      { id: 'user5', name: 'Thomas Johnson', role: 'Maintenance Technician', department: 'Maintenance' },
      { id: 'user6', name: 'Sarah Williams', role: 'Systems Engineer', department: 'Engineering' }
    ],
    leadInvestigator: { id: 'user6', name: 'Sarah Williams', role: 'Systems Engineer', department: 'Engineering' },
    findings: [
      'Primary pump failure due to contaminated hydraulic fluid',
      'Backup pump failed to engage due to electrical fault',
      'Pressure monitoring system did not trigger alerts properly'
    ],
    recommendations: [
      'Implement more frequent fluid testing and replacement',
      'Overhaul backup systems and test protocols',
      'Upgrade monitoring and alert systems'
    ],
    actions: [
      {
        id: 'action5',
        description: 'Replace contaminated hydraulic fluid in all systems',
        assignedTo: 'user5',
        dueDate: '2023-10-25T00:00:00Z',
        status: 'in-progress'
      },
      {
        id: 'action6',
        description: 'Diagnose and repair backup pump system',
        assignedTo: 'user5',
        dueDate: '2023-10-28T00:00:00Z',
        status: 'pending'
      },
      {
        id: 'action7',
        description: 'Design improved monitoring system',
        assignedTo: 'user6',
        dueDate: '2023-11-15T00:00:00Z',
        status: 'in-progress'
      }
    ]
  },
  {
    id: 'RCA-2023-004',
    title: 'Supply Chain Component Delay',
    description: 'Critical component shortage due to supplier quality issues leading to production stoppage.',
    status: 'review',
    createdAt: '2023-09-28T10:20:00Z',
    updatedAt: '2023-10-17T15:30:00Z',
    impact: {
      financialCost: 320000,
      downtimeDays: 3.0,
      productionLoss: 4500,
      severityLevel: 5
    },
    equipment: 'Assembly Line 4',
    location: 'Building C, Assembly Department',
    department: 'Supply Chain',
    assignedTo: [
      { id: 'user7', name: 'Daniel Brown', role: 'Supply Chain Manager', department: 'Supply Chain' },
      { id: 'user8', name: 'Lisa Taylor', role: 'Quality Control Specialist', department: 'Quality' }
    ],
    leadInvestigator: { id: 'user7', name: 'Daniel Brown', role: 'Supply Chain Manager', department: 'Supply Chain' },
    findings: [
      'Supplier changed manufacturing process without notification',
      'Incoming quality inspection failed to detect component issues',
      'No redundant supplier for critical component',
      'Inventory buffer was inadequate for production needs'
    ],
    recommendations: [
      'Implement supplier change management requirements',
      'Enhance incoming quality inspection processes',
      'Develop secondary supplier relationships for critical components',
      'Review and update inventory buffer policies'
    ],
    actions: [
      {
        id: 'action8',
        description: 'Develop new supplier quality agreement',
        assignedTo: 'user7',
        dueDate: '2023-10-30T00:00:00Z',
        status: 'in-progress'
      },
      {
        id: 'action9',
        description: 'Identify and qualify backup suppliers',
        assignedTo: 'user7',
        dueDate: '2023-11-15T00:00:00Z',
        status: 'in-progress'
      },
      {
        id: 'action10',
        description: 'Redesign quality inspection protocol',
        assignedTo: 'user8',
        dueDate: '2023-10-25T00:00:00Z',
        status: 'in-progress'
      }
    ]
  },
  {
    id: 'RCA-2023-005',
    title: 'Power Fluctuation - Electronics Assembly',
    description: 'Power fluctuations caused damage to sensitive electronic components during assembly process.',
    status: 'draft',
    createdAt: '2023-10-18T08:45:00Z',
    updatedAt: '2023-10-18T08:45:00Z',
    impact: {
      financialCost: 75000,
      downtimeDays: 0.25,
      productionLoss: 500,
      severityLevel: 2
    },
    equipment: 'Electronics Assembly Station E5',
    location: 'Building D, Electronics Department',
    department: 'Electronics',
    assignedTo: [
      { id: 'user9', name: 'Michael Lee', role: 'Electrical Engineer', department: 'Engineering' }
    ],
    leadInvestigator: { id: 'user9', name: 'Michael Lee', role: 'Electrical Engineer', department: 'Engineering' },
    findings: [],
    recommendations: [],
    actions: []
  }
];