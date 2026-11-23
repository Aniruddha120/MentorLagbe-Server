import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI as string, { serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: true } });

const tutors = [
  { name: 'Ayesha Rahman', email: 'ayesha.tutor@mentorlagbe.com' },
  { name: 'Rakib Hasan', email: 'rakib.tutor@mentorlagbe.com' },
  { name: 'Nusrat Jahan', email: 'nusrat.tutor@mentorlagbe.com' },
  { name: 'Sabbir Ahmed', email: 'sabbir.tutor@mentorlagbe.com' },
];

const tuitions = [
  { title: 'HSC Physics Mastery Batch', subject: 'Physics', classLevel: 'HSC', mode: 'Online', location: 'Zoom', monthlyFee: 2500, daysPerWeek: 3, bannerImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1200&auto=format&fit=crop', description: 'Concept-first HSC Physics with numericals, board questions, and weekly tests.', tutorName: 'Ayesha Rahman', tutorEmail: 'ayesha.tutor@mentorlagbe.com' },
  { title: 'SSC Math Problem Solving', subject: 'Math', classLevel: 'SSC', mode: 'Offline', location: 'Dhanmondi, Dhaka', monthlyFee: 2000, daysPerWeek: 3, bannerImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop', description: 'Algebra, geometry, and trigonometry with exam-focused practice.', tutorName: 'Rakib Hasan', tutorEmail: 'rakib.tutor@mentorlagbe.com' },
  { title: 'IELTS Speaking & Writing', subject: 'IELTS', classLevel: 'Admission/Professional', mode: 'Online', location: 'Google Meet', monthlyFee: 3500, daysPerWeek: 2, bannerImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop', description: 'Band 7+ strategies, mock speaking, and detailed writing feedback.', tutorName: 'Nusrat Jahan', tutorEmail: 'nusrat.tutor@mentorlagbe.com' },
  { title: 'Programming with Python', subject: 'Programming', classLevel: 'University', mode: 'Online', location: 'Discord', monthlyFee: 4000, daysPerWeek: 2, bannerImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop', description: 'Python basics to projects: data structures, OOP, and automation.', tutorName: 'Sabbir Ahmed', tutorEmail: 'sabbir.tutor@mentorlagbe.com' },
  { title: 'Class 8 Science Foundation', subject: 'Science', classLevel: 'Class 8', mode: 'Offline', location: 'Uttara, Dhaka', monthlyFee: 1800, daysPerWeek: 3, bannerImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop', description: 'Build strong fundamentals in physics, chemistry, and biology.', tutorName: 'Ayesha Rahman', tutorEmail: 'ayesha.tutor@mentorlagbe.com' },
  { title: 'English Grammar & Writing', subject: 'English', classLevel: 'Class 9-10', mode: 'Online', location: 'Zoom', monthlyFee: 1500, daysPerWeek: 2, bannerImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop', description: 'Grammar, paragraph writing, and board exam preparation.', tutorName: 'Nusrat Jahan', tutorEmail: 'nusrat.tutor@mentorlagbe.com' },
  { title: 'Admission Math Crash Course', subject: 'Math', classLevel: 'Admission', mode: 'Online', location: 'Zoom', monthlyFee: 3000, daysPerWeek: 4, bannerImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop', description: 'Intensive admission math with shortcuts and model tests.', tutorName: 'Rakib Hasan', tutorEmail: 'rakib.tutor@mentorlagbe.com' },
  { title: 'Chemistry for HSC', subject: 'Chemistry', classLevel: 'HSC', mode: 'Offline', location: 'Mirpur, Dhaka', monthlyFee: 2600, daysPerWeek: 3, bannerImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop', description: 'Organic, inorganic, and quantitative chemistry with lab-style explanations.', tutorName: 'Ayesha Rahman', tutorEmail: 'ayesha.tutor@mentorlagbe.com' },
  { title: 'Web Development Mentorship', subject: 'Programming', classLevel: 'University', mode: 'Online', location: 'Google Meet', monthlyFee: 4500, daysPerWeek: 2, bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop', description: '1-on-1 mentorship for HTML, CSS, JS, React, and project building.', tutorName: 'Sabbir Ahmed', tutorEmail: 'sabbir.tutor@mentorlagbe.com' },
  { title: 'Class 6-7 Math Basics', subject: 'Math', classLevel: 'Class 6-7', mode: 'Offline', location: 'Banani, Dhaka', monthlyFee: 1600, daysPerWeek: 3, bannerImage: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=1200&auto=format&fit=crop', description: 'Friendly math coaching to build confidence and accuracy.', tutorName: 'Rakib Hasan', tutorEmail: 'rakib.tutor@mentorlagbe.com' },
  { title: 'Spoken English Confidence', subject: 'English', classLevel: 'Professional', mode: 'Online', location: 'Zoom', monthlyFee: 2200, daysPerWeek: 2, bannerImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop', description: 'Practical spoken English for interviews, presentations, and daily life.', tutorName: 'Nusrat Jahan', tutorEmail: 'nusrat.tutor@mentorlagbe.com' },
  { title: 'ICT for HSC & Admission', subject: 'ICT', classLevel: 'HSC', mode: 'Online', location: 'Zoom', monthlyFee: 2000, daysPerWeek: 2, bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop', description: 'ICT concepts, number systems, programming basics, and MCQ practice.', tutorName: 'Sabbir Ahmed', tutorEmail: 'sabbir.tutor@mentorlagbe.com' },
];

async function run() {
  await client.connect();
  const db = client.db(process.env.DB_NAME || 'mentorlagbe');
  const users = db.collection('user');
  const tuitionsCol = db.collection('tuitions');
  const now = new Date();

  for (const t of tutors) {
    await users.updateOne({ email: t.email }, { $setOnInsert: { ...t, role: 'tutor', plan: 'free', createdAt: now, emailVerified: false } }, { upsert: true });
  }
  for (const t of tuitions) {
    await tuitionsCol.updateOne({ title: t.title, tutorEmail: t.tutorEmail }, { $setOnInsert: { ...t, approvalStatus: 'approved', isActive: true, createdAt: now } }, { upsert: true });
  }
  console.log('Seeded tutors and tuitions');
  await client.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
