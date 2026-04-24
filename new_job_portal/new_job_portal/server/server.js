import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/new_job_portal';
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true
  })
);
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    salary: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    skills: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Shortlisted', 'Rejected'],
      default: 'Submitted'
    }
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, job: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);
const Application = mongoose.model('Application', applicationSchema);

const seedJobs = [
  {
    title: 'Frontend Developer',
    company: 'PixelWorks Studio',
    location: 'Bengaluru, India',
    type: 'Full time',
    salary: '₹8L - ₹14L',
    description:
      'Build polished React interfaces for recruiter and candidate workflows.',
    skills: ['React', 'CSS', 'JavaScript']
  },
  {
    title: 'Node.js Backend Engineer',
    company: 'CloudNest Systems',
    location: 'Hyderabad, India',
    type: 'Full time',
    salary: '₹10L - ₹18L',
    description:
      'Design secure APIs, data models, and application services for a hiring platform.',
    skills: ['Node.js', 'Express', 'MongoDB']
  },
  {
    title: 'MERN Stack Intern',
    company: 'LaunchPath Labs',
    location: 'Remote',
    type: 'Internship',
    salary: '₹25K / month',
    description:
      'Work with mentors to ship features across React, Express, and MongoDB.',
    skills: ['HTML', 'CSS', 'React']
  },
  {
    title: 'UI Engineer',
    company: 'HireVista',
    location: 'Pune, India',
    type: 'Contract',
    salary: '₹70K - ₹1.1L / month',
    description:
      'Create accessible dashboards, forms, filters, and job discovery screens.',
    skills: ['Accessibility', 'React', 'Design Systems']
  },
  {
    title: 'Full Stack Developer',
    company: 'StackWave Technologies',
    location: 'Mumbai, India',
    type: 'Full time',
    salary: '₹9L - ₹16L',
    description:
      'Ship end-to-end hiring workflows using React, Node.js, Express, and MongoDB.',
    skills: ['React', 'Node.js', 'MongoDB']
  },
  {
    title: 'QA Automation Engineer',
    company: 'TestGrid Solutions',
    location: 'Noida, India',
    type: 'Full time',
    salary: '₹6L - ₹11L',
    description:
      'Build reliable automated test suites for candidate, recruiter, and admin journeys.',
    skills: ['JavaScript', 'Cypress', 'API Testing']
  },
  {
    title: 'DevOps Engineer',
    company: 'InfraPilot',
    location: 'Gurugram, India',
    type: 'Full time',
    salary: '₹12L - ₹22L',
    description:
      'Maintain CI/CD pipelines, cloud deployments, monitoring, and release automation.',
    skills: ['Docker', 'AWS', 'CI/CD']
  },
  {
    title: 'Data Analyst',
    company: 'InsightBridge Analytics',
    location: 'Chennai, India',
    type: 'Full time',
    salary: '₹7L - ₹13L',
    description:
      'Analyze recruitment funnels, application trends, and hiring performance metrics.',
    skills: ['SQL', 'Power BI', 'Excel']
  },
  {
    title: 'Product Designer',
    company: 'FlowCraft Design',
    location: 'Remote',
    type: 'Contract',
    salary: '₹80K - ₹1.3L / month',
    description:
      'Design candidate-facing job discovery experiences and recruiter dashboards.',
    skills: ['Figma', 'UX Research', 'Prototyping']
  },
  {
    title: 'Mobile App Developer',
    company: 'AppNest Digital',
    location: 'Kochi, India',
    type: 'Full time',
    salary: '₹8L - ₹15L',
    description:
      'Create mobile job search and application features with a polished user experience.',
    skills: ['React Native', 'JavaScript', 'REST APIs']
  },
  {
    title: 'Technical Recruiter',
    company: 'PeopleFirst Careers',
    location: 'Delhi, India',
    type: 'Full time',
    salary: '₹5L - ₹9L',
    description:
      'Source engineering candidates, coordinate interviews, and manage application pipelines.',
    skills: ['Sourcing', 'Screening', 'ATS']
  },
  {
    title: 'Cloud Support Engineer',
    company: 'NimbusCare',
    location: 'Ahmedabad, India',
    type: 'Night shift',
    salary: '₹6L - ₹10L',
    description:
      'Support cloud-hosted applications, troubleshoot incidents, and document fixes.',
    skills: ['Linux', 'Networking', 'Cloud']
  }
];

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  location: user.location,
  skills: user.skills,
  joinedAt: user.createdAt
});

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d'
  });

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
};

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim()).filter(Boolean);
  }

  return String(skills || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone, location, skills } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      phone,
      location,
      skills: normalizeSkills(skills)
    });

    return res.status(201).json({
      token: createToken(user),
      user: toPublicUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create account.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      token: createToken(user),
      user: toPublicUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not sign in.' });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json({ jobs });
});

app.post('/api/applications', requireAuth, async (req, res) => {
  try {
    const { jobId } = req.body;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const application = await Application.create({
      user: req.user._id,
      job: job._id
    });

    await application.populate('job');
    return res.status(201).json({ application });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: 'You have already applied to this job.' });
    }

    return res.status(500).json({ message: 'Could not submit application.' });
  }
});

app.get('/api/applications/me', requireAuth, async (req, res) => {
  const applications = await Application.find({ user: req.user._id })
    .populate('job')
    .sort({ createdAt: -1 });

  res.json({
    user: toPublicUser(req.user),
    applications
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const connectDatabase = async () => {
  await mongoose.connect(MONGODB_URI);
  await Promise.all(
    seedJobs.map((job) =>
      Job.updateOne(
        { title: job.title, company: job.company },
        { $setOnInsert: job },
        { upsert: true }
      )
    )
  );
};

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
