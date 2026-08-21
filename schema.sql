-- schema.sql
-- قاعدة البيانات لمؤسسة اللبيب (Etablissement Allabib)
-- تدعم الجداول الأساسية لمنظومة إدارة الغياب، استعمالات الزمن ومنع التعارضات، استدعاءات أولياء الأمور والملفات.

-- تفعيل ملحقات مفيدة لقاعدة البيانات (اختياري)
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
    name VARCHAR(100) NOT NULL, -- e.g., "1Bac Sc Ex 1" or "2Bac SM 2"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول الحسابات والملفات الشخصية للمستخدمين (Profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    class_id INT REFERENCES classes(id) ON DELETE SET NULL, -- للطلاب فقط
    qr_code_token VARCHAR(255) UNIQUE, -- كود فريد لتسجيل الدخول الفوري ومسح الحضور
    phone_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- التعديل المباشر لإضافة الأنساق والعمود email للجدول في حال كان منشأ من قبل
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS qr_code_token VARCHAR(255);

-- 4. جدول المواد الدراسية (Subjects)
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    coefficient INT DEFAULT 1 NOT NULL,
    level_id INT REFERENCES levels(id) ON DELETE CASCADE
);

-- 5. جدول الاستعمال الزمني الشامل (Timetable Slots)
CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    class_id INT REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL, -- 0 = الإثنين، 1 = الثلاثاء... 5 = السبت، 6 = الأحد (أو حسب التوزيع المعتمد)
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

-- 9. جدول الملفات والموارد والدروس المرفوعة عبر Cloudinary (School Resources)
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

-- تعديلات مباشرة للتأكد من المرونة وقبول جميع أنواع الملفات والفيديوهات
ALTER TABLE public.resources ALTER COLUMN file_public_id DROP NOT NULL;
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_file_type_check;

-- 10. جدول الإشعارات (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL يعني إشعار عام للكل
    title VARCHAR(200) NOT NULL,
    title_fr VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    message_fr TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. جدول إعدادات العطل المدرسية لتعطيل الإشعارات تلقائياً
CREATE TABLE IF NOT EXISTS school_holidays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

----------------------------------------------------
-- دالة الفحص والتريغر لمنع التعارضات في جدول الحصص --
----------------------------------------------------

CREATE OR REPLACE FUNCTION check_timetable_conflicts()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. فحص تعارض الأستاذ (الأستاذ يدرس في نفس اليوم والوقت قسماً آخر)
    IF EXISTS (
        SELECT 1 FROM timetables
        WHERE teacher_id = NEW.teacher_id
          AND day_of_week = NEW.day_of_week
          AND id <> COALESCE(NEW.id, -1)
          AND (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    ) THEN
        RAISE EXCEPTION 'تعارض: الأستاذ يدرس في حصة أخرى في نفس الوقت المحدد.';
    END IF;

    -- 2. فحص تعارض القاعة (القاعة محجوزة لقسم أو أستاذ آخر في نفس اليوم والوقت)
    IF EXISTS (
        SELECT 1 FROM timetables
        WHERE room_number = NEW.room_number
          AND day_of_week = NEW.day_of_week
          AND id <> COALESCE(NEW.id, -1)
          AND (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    ) THEN
        RAISE EXCEPTION 'تعارض: القاعة الدراسية محجوزة لحصة أخرى في نفس الوقت المحدد.';
    END IF;

    -- 3. فحص تعارض القسم (القسم مجدول له حصة أخرى في نفس اليوم والوقت)
    IF EXISTS (
        SELECT 1 FROM timetables
        WHERE class_id = NEW.class_id
          AND day_of_week = NEW.day_of_week
          AND id <> COALESCE(NEW.id, -1)
          AND (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    ) THEN
        RAISE EXCEPTION 'تعارض: هذا القسم لديه مادة أخرى مجدولة في نفس هذا الوقت.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ربط دالة منع التعارض بالتريغر قبل الإدخال أو التعديل
CREATE OR REPLACE TRIGGER trg_check_timetable_conflicts
BEFORE INSERT OR UPDATE ON timetables
FOR EACH ROW
EXECUTE FUNCTION check_timetable_conflicts();


----------------------------------------------------
-- إعداد سياسات الحماية على مستوى الصفوف (RLS) ----
----------------------------------------------------

-- تمكين الـ RLS على الجداول
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

-- دالة مساعدة لمعرفة دور المستخدم الحالي
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
BEGIN
    RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. سياسات Profiles
DROP POLICY IF EXISTS "Profiles viewable by everyone logged in" ON profiles;
CREATE POLICY "Profiles viewable by everyone logged in" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Profiles insertable by authenticated users (during setup)" ON profiles;
CREATE POLICY "Profiles insertable by authenticated users (during setup)" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR get_user_role() = 'admin');

DROP POLICY IF EXISTS "Profiles updatable by admin or self" ON profiles;
CREATE POLICY "Profiles updatable by admin or self" ON profiles
    FOR UPDATE USING (get_user_role() = 'admin' OR auth.uid() = id);

-- 2. سياسات Levels
DROP POLICY IF EXISTS "Levels readable by everyone" ON levels;
CREATE POLICY "Levels readable by everyone" ON levels
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Levels managed by admin" ON levels;
CREATE POLICY "Levels managed by admin" ON levels
    FOR ALL USING (get_user_role() = 'admin');

-- 3. سياسات Classes
DROP POLICY IF EXISTS "Classes readable by everyone" ON classes;
CREATE POLICY "Classes readable by everyone" ON classes
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Classes managed by admin" ON classes;
CREATE POLICY "Classes managed by admin" ON classes
    FOR ALL USING (get_user_role() = 'admin');

-- 4. سياسات Subjects
DROP POLICY IF EXISTS "Subjects readable by everyone" ON subjects;
CREATE POLICY "Subjects readable by everyone" ON subjects
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Subjects managed by admin" ON subjects;
CREATE POLICY "Subjects managed by admin" ON subjects
    FOR ALL USING (get_user_role() = 'admin');

-- 5. سياسات Timetables
DROP POLICY IF EXISTS "Timetables readable by everyone" ON timetables;
CREATE POLICY "Timetables readable by everyone" ON timetables
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Timetables managed by admin" ON timetables;
CREATE POLICY "Timetables managed by admin" ON timetables
    FOR ALL USING (get_user_role() = 'admin');

-- 6. سياسات Session Substitutions
DROP POLICY IF EXISTS "Substitutions readable by everyone" ON session_substitutions;
CREATE POLICY "Substitutions readable by everyone" ON session_substitutions
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Substitutions managed by admin" ON session_substitutions;
CREATE POLICY "Substitutions managed by admin" ON session_substitutions
    FOR ALL USING (get_user_role() = 'admin');

-- 7. سياسات Attendance
DROP POLICY IF EXISTS "Attendance viewable by admins, teachers, or the student" ON attendance;
CREATE POLICY "Attendance viewable by admins, teachers, or the student" ON attendance
    FOR SELECT USING (
        get_user_role() IN ('admin', 'teacher') OR student_id = auth.uid()
    );

DROP POLICY IF EXISTS "Attendance managed by admin and teachers" ON attendance;
CREATE POLICY "Attendance managed by admin and teachers" ON attendance
    FOR ALL USING (get_user_role() IN ('admin', 'teacher'));

-- 8. سياسات Parent Summons
DROP POLICY IF EXISTS "Summons viewable by admin or self student" ON parent_summons;
CREATE POLICY "Summons viewable by admin or self student" ON parent_summons
    FOR SELECT USING (
        get_user_role() = 'admin' OR student_id = auth.uid()
    );

DROP POLICY IF EXISTS "Summons insertable and updatable by admin" ON parent_summons;
CREATE POLICY "Summons insertable and updatable by admin" ON parent_summons
    FOR ALL USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Summons acknowledgment updates by students themselves" ON parent_summons;
CREATE POLICY "Summons acknowledgment updates by students themselves" ON parent_summons
    FOR UPDATE USING (student_id = auth.uid())
    WITH CHECK (status = 'acknowledged');

-- 9. سياسات Resources
DROP POLICY IF EXISTS "Resources readable by students in the class or teachers/admins" ON resources;
CREATE POLICY "Resources readable by students in the class or teachers/admins" ON resources
    FOR SELECT USING (
        get_user_role() IN ('admin', 'teacher') OR 
        class_id = (SELECT class_id FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Resources managed by admin or teachers" ON resources;
CREATE POLICY "Resources managed by admin or teachers" ON resources
    FOR ALL USING (auth.role() = 'authenticated');

-- 10. سياسات Notifications
DROP POLICY IF EXISTS "Notifications readable by recipients or public notifications" ON notifications;
CREATE POLICY "Notifications readable by recipients or public notifications" ON notifications
    FOR SELECT USING (
        recipient_id IS NULL OR recipient_id = auth.uid() OR get_user_role() = 'admin'
    );

DROP POLICY IF EXISTS "Notifications managed by admin or teachers" ON notifications;
CREATE POLICY "Notifications managed by admin or teachers" ON notifications
    FOR ALL USING (get_user_role() IN ('admin', 'teacher'));

-- 11. سياسات School Holidays
DROP POLICY IF EXISTS "Holidays readable by everyone" ON school_holidays;
CREATE POLICY "Holidays readable by everyone" ON school_holidays
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Holidays managed by admin" ON school_holidays;
CREATE POLICY "Holidays managed by admin" ON school_holidays
    FOR ALL USING (get_user_role() = 'admin');

-- 12. جدول معلومات التواصل الإداري وتحديثها من طرف المشرف (Contact Information)
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

-- إدراج البيانات الافتراضية للتواصل
INSERT INTO school_contact_info (id, phone_1, phone_2, email, address_ar, address_fr, working_hours_ar, working_hours_fr, assistance_msg_ar, assistance_msg_fr)
VALUES (1, '0537-000000', '0661-000000', 'contact@allabib.ma', 'شارع المدارس، الحي الإداري، المغرب', 'Avenue des Ecoles, Quartier Administratif, Maroc', 'من الإثنين إلى الجمعة: 8:00 - 18:00 | السبت: 8:00 - 12:00', 'Lundi au Vendredi: 8:00 - 18:00 | Samedi: 8:00 - 12:00', 'إذا واجهتكم أي مشكلة تواصلوا مع إدارة مؤسستكم', 'Si vous rencontrez un problème, veuillez contacter l''administration de votre établissement')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE school_contact_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contact info readable by everyone" ON school_contact_info;
CREATE POLICY "Contact info readable by everyone" ON school_contact_info
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Contact info managed by admin" ON school_contact_info;
CREATE POLICY "Contact info managed by admin" ON school_contact_info
    FOR ALL USING (get_user_role() = 'admin');

-- 13. التريغر التلقائي والمزامنة الفورية الشاملة بين auth.users و public.profiles
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
    -- حساب عدد الحسابات الموجودة لتحديد هل هو المشرف الأول أم لا
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    IF user_count = 0 THEN
        assigned_role := 'admin';
    ELSE
        assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'admin');
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

-- تفعيل التريغر على جدول auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. المزامنة الفورية الشاملة (Backfill Sync) لكل الحسابات المسجلة سابقاً في auth.users
INSERT INTO public.profiles (id, name, email, role, created_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'مستخدم جديد'),
    u.email,
    COALESCE(u.raw_user_meta_data->>'role', 'admin'),
    COALESCE(u.created_at, NOW())
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- منح الصلاحيات الشاملة على المخطط والجدول لجميع الأدوار الإدارية والعملاء
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, service_role, authenticated;


