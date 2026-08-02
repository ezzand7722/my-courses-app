/**
 * Seed script for local development
 * Usage: npx wrangler d1 execute coursesproj-db --local --file=scripts/seed.sql
 * 
 * This script generates the seed SQL and outputs it.
 * Run: npx ts-node scripts/seed.ts > scripts/seed.sql
 * Then: wrangler d1 execute coursesproj-db --local --file=scripts/seed.sql
 */

const { createHash, randomUUID } = require('crypto');

// For bcrypt in seed, we use a pre-computed hash for 'password123'
// bcrypt.hash('password123', 12) => use this hash:
const DEMO_PASSWORD_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/x.XXXxx';
// NOTE: In production, generate real hashes. This is a placeholder for seed.
// Use this command to generate real hash:
// node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 12).then(h => console.log(h));"

const now = new Date().toISOString();

// IDs
const teacher1Id = 'teacher-001-demo-seed';
const teacher2Id = 'teacher-002-demo-seed';
const course1Id = 'course-001-demo-seed';
const course2Id = 'course-002-demo-seed';
const course3Id = 'course-003-demo-seed';
const course4Id = 'course-004-demo-seed';

const sql = `
-- Seed data for development
-- Demo teachers
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, bio, created_at) VALUES
  ('${teacher1Id}', 'أحمد محمد الدمرداش', 'ahmad@demo.com', '${DEMO_PASSWORD_HASH}', 'teacher', 'معلم رياضيات وفيزياء بخبرة تزيد عن 15 سنة. متخصص في تبسيط المفاهيم المعقدة.', '${now}'),
  ('${teacher2Id}', 'سارة إبراهيم', 'sara@demo.com', '${DEMO_PASSWORD_HASH}', 'teacher', 'متخصصة في الكيمياء والأحياء، حاصلة على دكتوراه من جامعة بغداد. صاحبة أسلوب تعليمي مبتكر.', '${now}');

-- Demo courses
INSERT OR IGNORE INTO courses (id, teacher_id, title, description, subject, is_published, created_at, updated_at) VALUES
  ('${course1Id}', '${teacher1Id}', 'رياضيات 2024 — الفصل الأول', 'دورة شاملة في رياضيات الصف العاشر، تغطي جميع محاور الفصل الأول بأسلوب مبسط وشامل.', 'math', 1, '${now}', '${now}'),
  ('${course2Id}', '${teacher1Id}', 'فيزياء الحركة والديناميكا — مكثف', 'دورة مكثفة لأبواب الفيزياء، تشمل قوانين نيوتن، الحركة الدائرية، ومبادئ الطاقة.', 'physics', 1, '${now}', '${now}'),
  ('${course3Id}', '${teacher2Id}', 'كيمياء الأحماض والقواعد — مكثف 2024', 'شرح مفصّل لوحدة الأحماض والقواعد مع تمارين محلولة، مناسب للمستوى الثانوي.', 'chemistry', 1, '${now}', '${now}'),
  ('${course4Id}', '${teacher2Id}', 'أحياء الخلية والوراثة 2024', 'دورة أحياء متكاملة تغطي أساسيات الخلية، الوراثة، والجهاز العصبي.', 'biology', 1, '${now}', '${now}');

-- Demo lessons (no real video UIDs for seed - teachers add their own)
INSERT OR IGNORE INTO lessons (id, course_id, title, description, order_index, is_published, created_at) VALUES
  ('lesson-001', '${course1Id}', 'مقدمة الدورة ومعلومات عامة', 'شرح مدة الدورة ومتطلباتها', 1, 1, '${now}'),
  ('lesson-002', '${course1Id}', 'الدوال والعلاقات — الجزء الأول', 'مفهوم الدالة وأنواعها', 2, 1, '${now}'),
  ('lesson-003', '${course1Id}', 'الدوال والعلاقات — الجزء الثاني', 'تطبيقات على الدوال', 3, 1, '${now}'),
  ('lesson-004', '${course2Id}', 'قوانين نيوتن للحركة', 'القوانين الثلاثة مع أمثلة', 1, 1, '${now}'),
  ('lesson-005', '${course2Id}', 'الحركة الدائرية', 'التسارع المركزي والقوة المركزية', 2, 1, '${now}'),
  ('lesson-006', '${course3Id}', 'مقدمة في الأحماض والقواعد', 'تعريف الحمض والقاعدة وخصائصهما', 1, 1, '${now}'),
  ('lesson-007', '${course3Id}', 'الرقم الهيدروجيني pH', 'حساب pH وتطبيقاته', 2, 1, '${now}'),
  ('lesson-008', '${course4Id}', 'بنية الخلية ووظائفها', 'أجزاء الخلية ودور كل عضية', 1, 1, '${now}'),
  ('lesson-009', '${course4Id}', 'الوراثة وقوانين مندل', 'الصفات الوراثية وطريقة انتقالها', 2, 1, '${now}');
`;

console.log(sql);
