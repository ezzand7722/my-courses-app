-- Seed data for development
-- Demo password hash for 'password123' (bcrypt)
-- NOTE: This is a placeholder. Generate a real hash before seeding.
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 12).then(h => console.log(h));"

-- Demo teachers (replace HASH_HERE with actual bcrypt hash)
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, bio, created_at) VALUES
  ('teacher-001-demo', 'أحمد محمد الدمرداش', 'ahmad@demo.com', '$2a$12$placeholder.hash.change.me.before.seeding', 'teacher', 'معلم رياضيات وفيزياء بخبرة تزيد عن 15 سنة. متخصص في تبسيط المفاهيم المعقدة.', datetime('now')),
  ('teacher-002-demo', 'سارة إبراهيم', 'sara@demo.com', '$2a$12$placeholder.hash.change.me.before.seeding', 'teacher', 'متخصصة في الكيمياء والأحياء، حاصلة على دكتوراه من جامعة بغداد. صاحبة أسلوب تعليمي مبتكر.', datetime('now'));

-- Demo courses
INSERT OR IGNORE INTO courses (id, teacher_id, title, description, subject, is_published, created_at, updated_at) VALUES
  ('course-001-demo', 'teacher-001-demo', 'رياضيات 2024 — الفصل الأول', 'دورة شاملة في رياضيات الصف العاشر، تغطي جميع محاور الفصل الأول بأسلوب مبسط وشامل.', 'math', 1, datetime('now'), datetime('now')),
  ('course-002-demo', 'teacher-001-demo', 'فيزياء الحركة والديناميكا — مكثف', 'دورة مكثفة لأبواب الفيزياء، تشمل قوانين نيوتن، الحركة الدائرية، ومبادئ الطاقة.', 'physics', 1, datetime('now'), datetime('now')),
  ('course-003-demo', 'teacher-002-demo', 'كيمياء الأحماض والقواعد — مكثف 2024', 'شرح مفصّل لوحدة الأحماض والقواعد مع تمارين محلولة، مناسب للمستوى الثانوي.', 'chemistry', 1, datetime('now'), datetime('now')),
  ('course-004-demo', 'teacher-002-demo', 'أحياء الخلية والوراثة 2024', 'دورة أحياء متكاملة تغطي أساسيات الخلية، الوراثة، والجهاز العصبي.', 'biology', 1, datetime('now'), datetime('now'));

-- Demo lessons (no Stream UIDs - teachers add real videos)
INSERT OR IGNORE INTO lessons (id, course_id, title, description, order_index, is_published, created_at) VALUES
  ('lesson-001-demo', 'course-001-demo', 'مقدمة الدورة ومعلومات عامة', 'شرح مدة الدورة ومتطلباتها', 1, 1, datetime('now')),
  ('lesson-002-demo', 'course-001-demo', 'الدوال والعلاقات — الجزء الأول', 'مفهوم الدالة وأنواعها', 2, 1, datetime('now')),
  ('lesson-003-demo', 'course-001-demo', 'الدوال والعلاقات — الجزء الثاني', 'تطبيقات على الدوال', 3, 1, datetime('now')),
  ('lesson-004-demo', 'course-002-demo', 'قوانين نيوتن للحركة', 'القوانين الثلاثة مع أمثلة', 1, 1, datetime('now')),
  ('lesson-005-demo', 'course-002-demo', 'الحركة الدائرية', 'التسارع المركزي والقوة المركزية', 2, 1, datetime('now')),
  ('lesson-006-demo', 'course-003-demo', 'مقدمة في الأحماض والقواعد', 'تعريف الحمض والقاعدة وخصائصهما', 1, 1, datetime('now')),
  ('lesson-007-demo', 'course-003-demo', 'الرقم الهيدروجيني pH', 'حساب pH وتطبيقاته', 2, 1, datetime('now')),
  ('lesson-008-demo', 'course-004-demo', 'بنية الخلية ووظائفها', 'أجزاء الخلية ودور كل عضية', 1, 1, datetime('now')),
  ('lesson-009-demo', 'course-004-demo', 'الوراثة وقوانين مندل', 'الصفات الوراثية وطريقة انتقالها', 2, 1, datetime('now'));
