-- schema.sql
-- قاعدة البيانات لمؤسسة اللبيب (Etablissement Allabib)
-- تدعم الجداول الأساسية لمنظومة إدارة الغياب، استعمالات الزمن، استدعاءات أولياء الأمور، الامتحانات والملفات.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول المستويات الدراسية (Academic Levels)
CREATE TABLE IF NOT EXISTS levels (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول الأقسام الدراسية (Classes)
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    level_id INT REFERENCES levels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول الحسابات والملفات الشخصية للمستخدمين (Profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    class_id INT REFERENCES classes(id) ON DELETE SET NULL,
    qr_code_token VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS qr_code_token VARCHAR(255);

-- 4. جدول المواد الدراسية (Subjects)
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    coefficient INT DEFAULT 1,
    level_id INT REFERENCES levels(id) ON DELETE CASCADE
);

-- 5. جدول الاستعمال الزمني الشامل (Timetable Slots)
CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    class_id INT REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_time_order CHECK (start_time < end_time)
);

-- 6. جدول التعديلات، الإلغاءات والتعويضات الحصصية (Session Substitutions & Adjustments)
CREATE TABLE IF NOT EXISTS session_substitutions (
    id SERIAL PRIMARY KEY,
    timetable_id INT REFERENCES timetables(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('cancelled', 'substituted', 'room_changed')) NOT NULL,
    substitute_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    new_room_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. جدول تسجيل الحضور والغياب (Attendance)
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    class_id INT REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    timetable_id INT REFERENCES timetables(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late')) NOT NULL,
    justified BOOLEAN DEFAULT FALSE NOT NULL,
    justification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. جدول استدعاءات أولياء الأمور (Parent Summons)
CREATE TABLE IF NOT EXISTS parent_summons (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    reason_fr TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'acknowledged')) DEFAULT 'pending' NOT NULL,
    date_issued DATE DEFAULT CURRENT_DATE NOT NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. جدول الملفات والموارد والدروس المرفوعة (School Resources)
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    class_id INT REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) DEFAULT 'pdf' NOT NULL,
    file_public_id VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.resources ALTER COLUMN file_public_id DROP NOT NULL;
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_file_type_check;

-- 10. جدول الإشعارات والإعلانات (Notifications & Announcements)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    title_fr VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    message_fr TEXT NOT NULL,
    media_url TEXT,
    video_url TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 11. جدول مواعيد الاختيارات والامتحانات المبرمجة (Programmed Exam Schedules)
CREATE TABLE IF NOT EXISTS exam_schedules (
    id SERIAL PRIMARY KEY,
    class_id INT REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. جدول إعدادات العطل المدرسية
CREATE TABLE IF NOT EXISTS school_holidays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. جدول معلومات التواصل الإداري
CREATE TABLE IF NOT EXISTS school_contact_info (
    id INT PRIMARY KEY DEFAULT 1,
    phone_1 VARCHAR(50) DEFAULT '0537-000000',
    phone_2 VARCHAR(50) DEFAULT '0661-000000',
    email VARCHAR(100) DEFAULT 'contact@allabib.ma',
    address_ar TEXT DEFAULT 'شارع المدارس، الحي الإداري، المغرب',
    address_fr TEXT DEFAULT 'Avenue des Ecoles, Quartier Administratif, Maroc',
    working_hours_ar TEXT DEFAULT 'من الإثنين إلى الجمعة: 8:00 - 18:00 | السبت: 8:00 - 12:00',
    working_hours_fr TEXT DEFAULT 'Lundi au Vendredi: 8:00 - 18:00 | Samedi: 8:00 - 12:00',
    assistance_msg_ar TEXT DEFAULT 'إذا واجهتكم أي مشكلة تواصلوا مع إدارة مؤسستكم',
    assistance_msg_fr TEXT DEFAULT 'Si vous rencontrez un problème, veuillez contacter l''administration de votre établissement',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO school_contact_info (id, phone_1, phone_2, email, address_ar, address_fr, working_hours_ar, working_hours_fr, assistance_msg_ar, assistance_msg_fr)
VALUES (1, '0537-000000', '0661-000000', 'contact@allabib.ma', 'شارع المدارس، الحي الإداري، المغرب', 'Avenue des Ecoles, Quartier Administratif, Maroc', 'من الإثنين إلى الجمعة: 8:00 - 18:00 | السبت: 8:00 - 12:00', 'Lundi au Vendredi: 8:00 - 18:00 | Samedi: 8:00 - 12:00', 'إذا واجهتكم أي مشكلة تواصلوا مع إدارة مؤسستكم', 'Si vous rencontrez un problème, veuillez contacter l''administration de votre établissement')
ON CONFLICT (id) DO NOTHING;

-- 14. تفعيل سياسات الحماية وقواعد الوصول (RLS Policies)
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_summons ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_contact_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Univ access levels" ON levels;
CREATE POLICY "Univ access levels" ON levels FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access classes" ON classes;
CREATE POLICY "Univ access classes" ON classes FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access profiles" ON profiles;
CREATE POLICY "Univ access profiles" ON profiles FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access subjects" ON subjects;
CREATE POLICY "Univ access subjects" ON subjects FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access timetables" ON timetables;
CREATE POLICY "Univ access timetables" ON timetables FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access substitutions" ON session_substitutions;
CREATE POLICY "Univ access substitutions" ON session_substitutions FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access attendance" ON attendance;
CREATE POLICY "Univ access attendance" ON attendance FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access summons" ON parent_summons;
CREATE POLICY "Univ access summons" ON parent_summons FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access resources" ON resources;
CREATE POLICY "Univ access resources" ON resources FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access notifications" ON notifications;
CREATE POLICY "Univ access notifications" ON notifications FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access holidays" ON school_holidays;
CREATE POLICY "Univ access holidays" ON school_holidays FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access exams" ON exam_schedules;
CREATE POLICY "Univ access exams" ON exam_schedules FOR ALL USING (true);
DROP POLICY IF EXISTS "Univ access contact" ON school_contact_info;
CREATE POLICY "Univ access contact" ON school_contact_info FOR ALL USING (true);

-- 15. تريغر المزامنة التلقائية للمستخدمين
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_count INT;
    assigned_role VARCHAR(20);
    user_name VARCHAR(150);
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    IF user_count = 0 THEN
        assigned_role := 'admin';
    ELSE
        assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    END IF;

    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name', 
        NEW.raw_user_meta_data->>'full_name', 
        split_part(NEW.email, '@', 1),
        'مستخدم جديد'
    );

    INSERT INTO public.profiles (id, name, email, role, created_at)
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        assigned_role,
        COALESCE(NEW.created_at, NOW())
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        name = COALESCE(public.profiles.name, EXCLUDED.name);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, authenticated;
