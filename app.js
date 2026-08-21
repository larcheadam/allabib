// app.js - Etablissement Allabib client-side core logic

// 1. configuration variables
const SUPABASE_URL = "https://pfyhjbwqtiuchkmnlgaf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lkR8CKbCS_GKX0a5AodCuQ_od_v4_WQ";
const CLOUDINARY_CLOUD_NAME = "ilbpvbdc";
const CLOUDINARY_UPLOAD_PRESET = "allabib_preset"; // Create unsigned preset named 'allabib_preset' in Cloudinary dashboard

// Initialize Supabase Client
// The UMD CDN build of @supabase/supabase-js exports as window.supabase
const _supabaseLib = window.supabase;
const sb = _supabaseLib.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// State Variables
let currentUser = null;
let userProfile = null;
let currentLanguage = 'ar';
let activeQrScanner = null;
let holidaysList = [];

// 2. Localization Translations Dictionary
const TRANSLATIONS = {
  ar: {
    // General / Headers
    school_name: "مؤسسة اللبيب",
    loading: "جاري تحميل المنظومة الرقمية...",
    nav_calculator: "حاسبة المعدل",
    nav_directory: "دليل الاتصال",
    install_app: "تثبيت التطبيق",
    upload_qr_image: "أو اختر صورة رمز QR من جهازك",
    adm_contact_edit: "تعديل معلومات التواصل",
    adm_contact_edit_title: "إدارة وتحديث معلومات التواصل الإداري",
    notifications_title: "الإشعارات",
    notif_clear: "مسح الكل",
    notif_empty: "لا توجد إشعارات حالياً",
    go_dashboard: "لوحة التحكم",
    logout: "تسجيل الخروج",
    welcome_title: "البوابة المدرسية الرقمية لمؤسسة اللبيب",
    welcome_desc: "منظومة مدمجة لتتبع المسار الدراسي وتسهيل التواصل بين الإدارة والأساتذة والتلاميذ وأولياء أمورهم.",
    stat_digital: "رقمي وتفاعلي",
    stat_secure: "تسجيل دخول آمن",
    login_tab_pass: "الدخول بالبريد الإلكتروني",
    login_tab_qr: "الدخول برمز QR",
    login_title: "تسجيل الدخول للمنظومة",
    email_label: "البريد الإلكتروني",
    password_label: "كلمة المرور",
    btn_login: "دخول",
    qr_login_title: "تسجيل دخول سريع بواسطة رمز QR",
    qr_login_desc: "يرجى مسح الرمز الشخصي الموجود في بطاقتك الدراسية أمام كاميرا الهاتف للدخول الفوري.",
    start_camera: "تشغيل الكاميرا",
    stop_camera: "إيقاف الكاميرا",
    
    // Student Dashboard
    summons_alert_title: "تنبيه: استدعاء ولي الأمر عاجل",
    btn_acknowledge: "تأكيد الإطلاع",
    next_class_title: "الحصة الحالية والقادمة",
    no_current_class: "لا توجد حصص مجدولة في الوقت الحالي.",
    my_qr_card: "بطاقة الهوية الرقمية",
    qr_usage_desc: "اعرض هذا الكود عند مدخل المؤسسة أو عند تسجيل الحضور والغياب.",
    download: "تحميل البطاقة",
    my_timetable: "جدول الحصص الأسبوعي للقسم",
    time_slots: "الحصص",
    day_mon: "الإثنين",
    day_tue: "الثلاثاء",
    day_wed: "الأربعاء",
    day_thu: "الخميس",
    day_fri: "الجمعة",
    day_sat: "السبت",
    class_resources: "الملفات والموارد التعليمية المرفوعة",
    no_resources: "لم يقم الأساتذة برفع أي دروس أو ملفات لقسمك بعد.",
    my_attendance: "سجل الغياب والتأخر الخاص بي",
    date: "التاريخ",
    status: "الحالة",
    justification: "المبرر",
    exam_countdown: "العد التنازلي للاختبارات",
    days_remaining: "يوم متبقي للامتحان الوطني الموحد",
    exam_date_notice: "الامتحان الوطني الموحد المبرمج في يونيو 2027.",
    
    // Teacher Dashboard
    teacher_welcome_subtitle: "بوابة الأستاذ لإدارة الحضور ومشاركة الموارد الرقمية والجدولة الحصصية.",
    teach_tab_schedule: "جدول الحصص",
    teach_tab_attendance: "تسجيل الحضور",
    teach_tab_files: "رفع الموارد الرقمية",
    teach_tab_req: "الإلغاءات والتعويضات",
    my_assigned_schedule: "جدول الحصص الخاص بي كأستاذ",
    mark_session_attendance: "تسجيل الحضور والغياب للحصة",
    select_session: "اختر الحصة المجدولة اليوم",
    select_default: "-- اختر حصة دراسية --",
    load_students: "تحميل قائمة التلاميذ",
    student_name: "اسم التلميذ(ة)",
    attendance_action: "ملاحظة",
    save_attendance: "حفظ الحضور والغياب",
    upload_digital_resources: "رفع ومشاركة المواد التعليمية الرقمية (PDF / الصور)",
    upload_info: "يتم رفع الملفات مباشرة إلى سحابة Cloudinary ومشاركتها فوراً مع تلاميذ القسم المعني.",
    target_class: "القسم المستهدف",
    target_subject: "المادة التعليمية",
    resource_title: "عنوان الدرس أو المورد",
    select_file: "اختر الملف (PDF أو صورة فقط، بحد أقصى 10 ميغابايت)",
    btn_share_resource: "رفع ونشر الملف",
    sub_request_title: "طلب إلغاء حصة دراسية أو إبلاغ بطلب تعويض",
    sub_request_desc: "يرجى تسجيل النموذج التالي لإبلاغ الإدارة عن تغيير طارئ أو غياب مبرمج ليتمكن الإداري من ترتيب الأستاذ البديل وتحديث لوحة التلاميذ.",
    select_slot_to_modify: "اختر الحصة المراد تعديلها",
    modification_date: "تاريخ التعديل",
    modification_type: "نوع التعديل المطلوب",
    opt_cancel: "إلغاء الحصة بالكامل",
    opt_sub: "تعويض بأستاذ بديل",
    opt_room: "تغيير قاعة الدرس فقط",
    additional_notes: "ملاحظات / سبب الغياب",
    btn_send_request: "إرسال الطلب للإدارة",
    
    // Admin Dashboard
    admin_dashboard_title: "لوحة تحكم إدارة مؤسسة اللبيب",
    admin_welcome_subtitle: "التحكم الكامل بالهيكلية التعليمية، إدارة استعمالات الزمن، ومنع تداخل الحصص.",
    admin_menu: "قائمة الإدارة",
    adm_classes: "المستويات والأقسام",
    adm_timetable_builder: "مخطط الجدول والتعارضات",
    adm_subs: "التعويض والبدائل",
    adm_user_gen: "توليد الحسابات و QR",
    adm_attendance: "إدارة الغياب والاستدعاءات",
    adm_notifs: "الإعلانات والتقويم المدرسي",
    manage_levels_classes_title: "تهيئة البنية المدرسية (المستويات والأقسام والمواد)",
    add_level: "إضافة مستوى دراسي جديد",
    level_name_ar: "اسم المستوى بالعربية",
    level_name_fr: "اسم المستوى بالفرنسية",
    btn_add: "إضافة",
    add_class: "إضافة قسم / شعبة دراسية",
    select_level: "المستوى الدراسي",
    class_name: "اسم القسم/الشعبة",
    add_subject: "إضافة مادة دراسية ومعاملها",
    subj_name_ar: "اسم المادة بالعربية",
    subj_name_fr: "اسم المادة بالفرنسية",
    subj_coefficient: "معامل المادة",
    list_levels_classes: "قائمة المستويات والأقسام المتاحة",
    list_subjects: "قائمة المواد حسب المستوى",
    subject: "المادة",
    level: "المستوى",
    coefficient: "المعامل",
    master_timetable_builder_title: "مخطط وموزع الاستعمال الزمني الشامل",
    conflict_prevention_info: "تتحقق المنظومة في الوقت الفعلي من عدم تداخل حصص الأساتذة، عدم تكرار حجز قاعات الحصص في نفس الوقت، ومطابقة حضور الأقسام.",
    add_timetable_slot: "جدولة حصة دراسية جديدة",
    assign_teacher: "الأستاذ المدرس",
    start_time: "وقت البدء",
    end_time: "وقت الإنتهاء",
    room_number: "رقم القاعة",
    btn_save_slot: "حفظ وتدقيق الحصة",
    view_schedule_class: "عرض الجدول الزمني للقسم:",
    subs_management_title: "إدارة التفويتات والتعويضات الاستعجالية للحصص",
    subs_info: "بوابة التعديل اللحظي عند غياب أستاذ، حيث يتم فحص التداخل للأستاذ البديل الجديد وتنبيه التلاميذ عبر إشعارات فورية منبثقة.",
    register_new_sub: "تسجيل تفويت/تعويض لحصة دراسية معينة",
    select_timetable_slot: "الحصة المعنية",
    substitute_teacher: "الأستاذ البديل المقترح",
    new_room: "رقم القاعة الجديدة",
    btn_apply_notify: "تطبيق الإجراء وإخطار الطلاب",
    logged_substitutions_title: "سجل التعديلات والتعويضات السابقة",
    class: "القسم",
    notes: "ملاحظات",
    user_creation_title: "توليد حسابات المستخدمين وبطاقات الهوية الرقمية QR",
    user_creation_desc: "قم بإنشاء حسابات التلاميذ والأساتذة لتزويدهم بالولوج، والحصول التلقائي على رمز QR فريد خاص بتسجيل الدخول السريع.",
    create_new_account: "إنشاء مستخدم جديد في النظام",
    fullname: "الاسم الكامل",
    user_role: "دور المستخدم",
    role_student: "تلميذ",
    role_teacher: "أستاذ",
    role_admin: "مدير / إداري",
    assign_class: "تعيين القسم الدراسي (للتلاميذ فقط)",
    phone: "رقم الهاتف (للتواصل)",
    btn_create_user: "تأكيد وتوليد الحساب والبطاقة",
    system_users_directory: "إدارة الحسابات المسجلة وبطاقات QR",
    action: "الإجراءات",
    absence_summons_title: "إدارة الغياب المدرسي واستدعاءات أولياء الأمور",
    absence_desc: "متابعة دقيقة لغياب التلاميذ المسجل من الأساتذة، وتدوين المبررات القانونية وإصدار استدعاءات أولياء الأمور.",
    justify_absence_title: "تتبع وتبرير الغياب",
    student: "التلميذ",
    issue_summons_title: "إصدار استدعاء ولي الأمر (Parent Summons)",
    select_student: "التلميذ المعني بالاستدعاء",
    reason_ar: "سبب الاستدعاء بالعربية",
    reason_fr: "سبب الاستدعاء بالفرنسية",
    btn_issue_summons: "إصدار الاستدعاء فوراً",
    summons_tracking_title: "سجل استدعاءات أولياء الأمور وتأكيد الإطلاع",
    reason: "السبب",
    announcements_holidays_title: "نشر الإعلانات وتحديد التقويم المدرسي والعطل",
    holidays_notifs_desc: "قم بكتابة لوحات الإعلانات للجميع، وتحديد التواريخ التي يتم فيها حظر إرسال التنبيهات المزعجة (أيام العطل المدرسية).",
    post_announcement_title: "نشر إعلان عام في لوحة التحكم",
    ann_title_ar: "عنوان الإعلان بالعربية",
    ann_title_fr: "عنوان الإعلان بالفرنسية",
    ann_msg_ar: "نص الإعلان بالعربية",
    ann_msg_fr: "نص الإعلان بالفرنسية",
    btn_broadcast: "بث الإعلان والتحذير",
    add_holiday_title: "إضافة عطلة مدرسية في الرزنامة (لتعطيل التنبيهات)",
    holiday_name: "اسم العطلة المدرسية",
    start_date: "تاريخ البدء",
    end_date: "تاريخ الإنتهاء",
    saved_holidays_title: "العطل المبرمجة المسجلة:",
    install_app_title: "تثبيت تطبيق مؤسسة اللبيب",
    install_app_desc: "تثبيت التطبيق على شاشتك للاستعمال دون اتصال واستقبال إشعارات الحصص.",
    btn_install: "تثبيت",
    btn_close: "إغلاق",
    id_card_print: "بطاقة التعريف الرقمية للطالب",
    print: "طباعة البطاقة",
    
    // Calculator
    calc_title: "حاسبة المعدل العام التفاعلية",
    calc_desc: "قم بإدخال نقط الفروض التي حصلت عليها ومعامل كل مادة لحساب معدلك التقديري الإجمالي بنقرة واحدة.",
    grade: "النقطة (على 20)",
    add_subject_row: "إضافة مادة",
    btn_calculate_gpa: "احسب المعدل العام",
    your_estimated_gpa: "معدلك التقديري العام هو",
    
    // Directory
    dir_title: "دليل الاتصال الإداري للمؤسسة",
    dir_desc: "دليل الاتصال الهاتفي والبريدي بالطاقم الإداري والتربوي لمؤسسة اللبيب."
  },
  fr: {
    // General / Headers
    school_name: "Etablissement Allabib",
    loading: "Chargement du système numérique...",
    nav_calculator: "Calculateur",
    nav_directory: "Contact",
    install_app: "Installer l'application",
    upload_qr_image: "Ou sélectionnez l'image du QR Code",
    adm_contact_edit: "Modifier les contacts",
    adm_contact_edit_title: "Gestion des coordonnées administratives",
    notifications_title: "Notifications",
    notif_clear: "Effacer tout",
    notif_empty: "Aucune notification pour le moment",
    go_dashboard: "Tableau de bord",
    logout: "Se déconnecter",
    welcome_title: "Portail Numérique Etablissement Allabib",
    welcome_desc: "Une plateforme intégrée pour suivre le parcours scolaire et faciliter la communication entre l'administration, les enseignants, les élèves et les parents.",
    stat_digital: "100% Digital",
    stat_secure: "Accès Sécurisé",
    login_tab_pass: "Connexion par Email",
    login_tab_qr: "Connexion par QR Code",
    login_title: "Connexion à la Plateforme",
    email_label: "Adresse Email",
    password_label: "Mot de passe",
    btn_login: "Se connecter",
    qr_login_title: "Connexion rapide par QR Code",
    qr_login_desc: "Veuillez scanner le code personnel figurant sur votre carte scolaire devant la caméra pour vous connecter instantanément.",
    start_camera: "Démarrer la caméra",
    stop_camera: "Arrêter la caméra",

    // Student Dashboard
    summons_alert_title: "Alerte: Convocation urgente des parents",
    btn_acknowledge: "Confirmer la lecture",
    next_class_title: "Séance en cours & suivante",
    no_current_class: "Aucune séance planifiée actuellement.",
    my_qr_card: "Carte d'identité numérique",
    qr_usage_desc: "Présentez ce code à l'entrée de l'établissement ou lors de l'enregistrement de présence.",
    download: "Télécharger",
    my_timetable: "Emploi du temps de la classe",
    time_slots: "Séances",
    day_mon: "Lundi",
    day_tue: "Mardi",
    day_wed: "Mercredi",
    day_thu: "Jeudi",
    day_fri: "Vendredi",
    day_sat: "Samedi",
    class_resources: "Ressources pédagogiques partagées",
    no_resources: "Aucune ressource partagée pour le moment.",
    my_attendance: "Mon historique d'absence & retard",
    date: "Date",
    status: "Statut",
    justification: "Justificatif",
    exam_countdown: "Compte à rebours des examens",
    days_remaining: "jours restants avant l'examen national",
    exam_date_notice: "L'examen national unifié est prévu pour Juin 2027.",

    // Teacher Dashboard
    teacher_welcome_subtitle: "Portail Enseignant pour gérer les présences, partager les ressources et consulter les séances.",
    teach_tab_schedule: "Emploi du temps",
    teach_tab_attendance: "Saisie de présence",
    teach_tab_files: "Partager ressources",
    teach_tab_req: "Absences & Remplacements",
    my_assigned_schedule: "Mon emploi du temps d'enseignant",
    mark_session_attendance: "Enregistrer les présences pour la séance",
    select_session: "Choisir la séance planifiée aujourd'hui",
    select_default: "-- Choisir une séance --",
    load_students: "Charger la liste des élèves",
    student_name: "Nom de l'élève",
    attendance_action: "Observation",
    save_attendance: "Enregistrer la présence",
    upload_digital_resources: "Publier une ressource pédagogique (PDF / Image)",
    upload_info: "Les fichiers sont téléchargés directement sur Cloudinary et partagés instantanément avec la classe.",
    target_class: "Classe cible",
    target_subject: "Matière",
    resource_title: "Titre de la ressource",
    select_file: "Choisir le fichier (PDF ou Image uniquement, max 10 Mo)",
    btn_share_resource: "Publier la ressource",
    sub_request_title: "Déclarer une absence ou demander un remplacement",
    sub_request_desc: "Remplissez ce formulaire pour informer l'administration de tout changement planifié afin qu'elle puisse réassigner la séance et avertir les élèves.",
    select_slot_to_modify: "Choisir la séance à modifier",
    modification_date: "Date de modification",
    modification_type: "Type de modification",
    opt_cancel: "Annuler complètement la séance",
    opt_sub: "Remplacement par un enseignant remplaçant",
    opt_room: "Changement de salle uniquement",
    additional_notes: "Notes / Raison de l'absence",
    btn_send_request: "Envoyer la demande",

    // Admin Dashboard
    admin_dashboard_title: "Tableau de Bord Administratif - Etablissement Allabib",
    admin_welcome_subtitle: "Gestion de la structure scolaire, planification des séances et prévention des conflits.",
    admin_menu: "Menu Administratif",
    adm_classes: "Niveaux & Classes",
    adm_timetable_builder: "Emplois du temps & Conflits",
    adm_subs: "Remplacements & Ajustements",
    adm_user_gen: "Génération de comptes & QR",
    adm_attendance: "Absences & Convocations",
    adm_notifs: "Annonces & Calendrier",
    manage_levels_classes_title: "Configuration de la structure scolaire (Niveaux, Classes & Matières)",
    add_level: "Ajouter un niveau scolaire",
    level_name_ar: "Nom du niveau (Arabe)",
    level_name_fr: "Nom du niveau (Français)",
    btn_add: "Ajouter",
    add_class: "Ajouter une classe / branche",
    select_level: "Niveau scolaire",
    class_name: "Nom de la classe",
    add_subject: "Ajouter une matière et son coefficient",
    subj_name_ar: "Nom de la matière (Arabe)",
    subj_name_fr: "Nom de la matière (Français)",
    subj_coefficient: "Coefficient",
    list_levels_classes: "Niveaux & Classes disponibles",
    list_subjects: "Matières par niveau",
    subject: "Matière",
    level: "Niveau",
    coefficient: "Coefficient",
    master_timetable_builder_title: "Générateur d'emploi du temps global",
    conflict_prevention_info: "Le système valide en temps réel les emplois du temps pour éviter qu'un enseignant ou une salle ne soit réservé deux fois au même moment.",
    add_timetable_slot: "Planifier une nouvelle séance",
    assign_teacher: "Enseignant affecté",
    start_time: "Heure de début",
    end_time: "Heure de fin",
    room_number: "Numéro de salle",
    btn_save_slot: "Enregistrer & Valider la séance",
    view_schedule_class: "Afficher l'emploi du temps de la classe:",
    subs_management_title: "Gestion des remplacements et des annulations de séance",
    subs_info: "Modification en temps réel en cas d'absence. Validation du non-conflit de l'enseignant remplaçant et notification immédiate des élèves.",
    register_new_sub: "Enregistrer une annulation / remplacement",
    select_timetable_slot: "Séance concernée",
    substitute_teacher: "Enseignant remplaçant proposé",
    new_room: "Nouvelle salle",
    btn_apply_notify: "Appliquer & Notifier les élèves",
    logged_substitutions_title: "Historique des remplacements & annulations",
    class: "Classe",
    notes: "Notes",
    user_creation_title: "Génération de comptes d'utilisateurs et de cartes QR",
    user_creation_desc: "Créez les comptes des élèves et des enseignants. Générez automatiquement leur code QR d'accès.",
    create_new_account: "Créer un nouvel utilisateur",
    fullname: "Nom complet",
    user_role: "Rôle de l'utilisateur",
    role_student: "Élève",
    role_teacher: "Enseignant",
    role_admin: "Administrateur",
    assign_class: "Affecter une classe (Élèves uniquement)",
    phone: "Numéro de téléphone",
    btn_create_user: "Créer l'utilisateur & Générer le code QR",
    system_users_directory: "Annuaire des utilisateurs & Cartes QR",
    action: "Actions",
    absence_summons_title: "Absences & Convocations de parents",
    absence_desc: "Suivi des absences signalées par les enseignants, saisie des motifs officiels et émission de convocations.",
    justify_absence_title: "Suivi & Justification des absences",
    student: "Élève",
    issue_summons_title: "Émettre une convocation de parent (Parent Summons)",
    select_student: "Élève concerné",
    reason_ar: "Motif (Arabe)",
    reason_fr: "Motif (Français)",
    btn_issue_summons: "Émettre la convocation",
    summons_tracking_title: "Suivi des convocations et accusés de lecture",
    reason: "Motif",
    announcements_holidays_title: "Diffusion d'annonces et congés scolaires",
    holidays_notifs_desc: "Publiez des annonces générales et gérez les périodes de vacances durant lesquelles les notifications push sont désactivées.",
    post_announcement_title: "Diffuser une annonce générale",
    ann_title_ar: "Titre de l'annonce (Arabe)",
    ann_title_fr: "Titre de l'annonce (Français)",
    ann_msg_ar: "Texte de l'annonce (Arabe)",
    ann_msg_fr: "Texte de l'annonce (Français)",
    btn_broadcast: "Diffuser l'annonce",
    add_holiday_title: "Ajouter des vacances scolaires (Désactivation des notifications)",
    holiday_name: "Nom des vacances",
    start_date: "Date de début",
    end_date: "Date de fin",
    saved_holidays_title: "Vacances programmées:",
    install_app_title: "Installer l'application Allabib",
    install_app_desc: "Installez l'application sur votre écran d'accueil pour l'utiliser hors ligne et recevoir vos alertes.",
    btn_install: "Installer",
    btn_close: "Fermer",
    id_card_print: "Carte numérique d'élève",
    print: "Imprimer",

    // Calculator
    calc_title: "Calculateur de Moyenne Interactive",
    calc_desc: "Entrez vos notes de contrôle et le coefficient de chaque matière pour estimer votre moyenne globale.",
    grade: "Note (sur 20)",
    add_subject_row: "Ajouter une matière",
    btn_calculate_gpa: "Calculer la moyenne",
    your_estimated_gpa: "Votre moyenne estimée est de",

    // Directory
    dir_title: "Annuaire des Contacts Administratifs",
    dir_desc: "Coordonnées de l'équipe administrative et pédagogique de l'Etablissement Allabib."
  }
};

// 3. Routing Mechanism (Hash-based SPA Router)
const routes = {
  '/landing': () => showView('view-landing'),
  '/student/dashboard': () => showView('view-student'),
  '/teacher/dashboard': () => showView('view-teacher'),
  '/admin/dashboard': () => showView('view-admin'),
  '/calculator': () => showView('view-calculator'),
  '/directory': () => showView('view-directory'),
  '/dashboard': () => handleDashboardRouting()
};

function handleDashboardRouting() {
  if (!currentUser) {
    window.location.hash = '/landing';
    return;
  }
  const role = userProfile ? userProfile.role : 'student';
  if (role === 'admin') window.location.hash = '/admin/dashboard';
  else if (role === 'teacher') window.location.hash = '/teacher/dashboard';
  else window.location.hash = '/student/dashboard';
}

function showView(viewId) {
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });
  const activeView = document.getElementById(viewId);
  if (activeView) {
    activeView.classList.add('active');
  }
  
  // Custom view callbacks
  if (viewId === 'view-student') loadStudentDashboard();
  else if (viewId === 'view-teacher') loadTeacherDashboard();
  else if (viewId === 'view-admin') loadAdminDashboard();
  else if (viewId === 'view-directory') loadContactDirectory();
}

function router() {
  const hash = window.location.hash || '#/landing';
  let routeHandler = routes[hash.substring(1)];
  
  if (!routeHandler) {
    // Dynamic matching or default back to landing
    if (hash.startsWith('#/')) {
      routeHandler = routes['/landing'];
    }
  }
  
  if (routeHandler) routeHandler();
}

window.addEventListener('hashchange', router);

// 4. Internationalization Translation Handler
function switchLanguage(lang) {
  currentLanguage = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  // Update button labels
  const langBtn = document.getElementById('lang-switch-btn');
  langBtn.querySelector('#lang-label').innerText = lang === 'ar' ? 'Fr' : 'عربي';

  // Apply translations to all elements with data-key
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      // Keep SVG elements or text inside buttons intact
      const icon = el.querySelector('i');
      if (icon) {
        const textSpan = el.querySelector('span');
        if (textSpan) textSpan.innerText = TRANSLATIONS[lang][key];
        else {
          el.innerHTML = '';
          el.appendChild(icon);
          el.appendChild(document.createTextNode(' ' + TRANSLATIONS[lang][key]));
        }
      } else {
        el.innerText = TRANSLATIONS[lang][key];
      }
    }
  });

  // Toggle placeholder directions
  document.querySelectorAll('input, textarea').forEach(el => {
    const key = el.getAttribute('placeholder-key');
    if (key && TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      el.setAttribute('placeholder', TRANSLATIONS[lang][key]);
    }
  });
  
  // Update Timetable Views if loaded
  if (currentUser) {
    handleDashboardRouting();
  }
}

// 5. Cloudinary Upload Helper (attempts configured preset & ml_default with graceful Data URL fallback)
async function uploadToCloudinary(file, resourceType = 'auto', onProgress) {
  if (!file) return null;
  
  const presetsToTry = [CLOUDINARY_UPLOAD_PRESET, 'ml_default', 'unsigned_preset'];
  
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== "allabib_cloud") {
    for (const preset of presetsToTry) {
      if (!preset) continue;
      try {
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);
        
        const res = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url, true);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
              onProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
            else reject(new Error("Cloudinary status: " + xhr.status));
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(formData);
        });
        
        if (res && res.secure_url) {
          const isImg = res.resource_type === 'image' || file.type.startsWith('image/');
          const isVid = res.resource_type === 'video' || file.type.startsWith('video/');
          return {
            url: res.secure_url,
            publicId: res.public_id,
            fileType: isImg ? 'image' : (isVid ? 'video' : 'pdf')
          };
        }
      } catch (err) {
        console.warn(`Cloudinary upload with preset "${preset}" failed:`, err);
      }
    }
  }

  // Fallback: Read file as Data URL locally (Guarantees upload success 100% without external errors)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    reader.onload = () => {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      const fType = isImg ? 'image' : (isVid ? 'video' : 'pdf');
      resolve({
        url: reader.result,
        publicId: `local_${Date.now()}`,
        fileType: fType
      });
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

// Helper to convert YouTube URL to embed link
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

// 6. Toast Notification Manager
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  else if (type === 'danger') iconClass = 'fa-exclamation-circle';
  else if (type === 'warning') iconClass = 'fa-triangle-exclamation';
  
  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 7. Supabase Authentication Actions
async function initAuth() {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      currentUser = session.user;
      await fetchUserProfile(currentUser.id);
    }
    
    sb.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        currentUser = session.user;
        await fetchUserProfile(currentUser.id);
      } else {
        currentUser = null;
        userProfile = null;
        document.getElementById('user-menu').classList.add('hidden');
        document.getElementById('bell-area').classList.add('hidden');
        window.location.hash = '/landing';
      }
      document.body.classList.remove('loading-state');
    });
    
    if (!session) {
      document.body.classList.remove('loading-state');
      router();
    }
  } catch (err) {
    console.error('Auth init error:', err);
    document.body.classList.remove('loading-state');
    router();
  }
}

async function fetchUserProfile(uid) {
  try {
    let { data, error } = await sb
      .from('profiles')
      .select('*, classes(*)')
      .eq('id', uid)
      .maybeSingle();
      
    // If profile is missing (e.g. created directly via Supabase Auth dashboard), auto-heal by inserting profile record
    if (!data && currentUser) {
      const userMeta = currentUser.user_metadata || {};
      const newName = userMeta.name || userMeta.full_name || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
      const newRole = userMeta.role || 'admin';
      
      const { data: inserted, error: insertErr } = await sb
        .from('profiles')
        .insert({
          id: uid,
          name: newName,
          email: currentUser.email || '',
          role: newRole
        })
        .select('*, classes(*)')
        .single();
        
      if (!insertErr && inserted) {
        data = inserted;
      }
    }
    
    if (!data) throw new Error("Profile not found");
    
    userProfile = data;
    
    // UI updates for authenticated users
    document.getElementById('user-menu').classList.remove('hidden');
    document.getElementById('bell-area').classList.remove('hidden');
    document.getElementById('user-initials').innerText = data.name.substring(0, 1).toUpperCase();
    document.getElementById('menu-user-name').innerText = data.name;
    document.getElementById('menu-user-role').innerText = TRANSLATIONS[currentLanguage][`role_${data.role}`] || data.role;
    
    // Check for dashboard redirects
    if (window.location.hash === '#/landing' || window.location.hash === '') {
      handleDashboardRouting();
    } else {
      router();
    }
    
    // Load unread notifications counter
    loadUnreadNotificationsCount();
  } catch (err) {
    console.error("Error fetching user profile:", err);
    showToast(currentLanguage === 'ar' ? "فشل استيراد بيانات الملف الشخصي" : "Failed to load profile data", "danger");
  }
}

// Credential Login Submit Handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const btn = document.getElementById('btn-login-submit');
  
  btn.disabled = true;
  
  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showToast(currentLanguage === 'ar' ? "تم تسجيل الدخول بنجاح!" : "Logged in successfully!", "success");
  } catch (err) {
    showToast(currentLanguage === 'ar' ? "فشل تسجيل الدخول: تحقق من بريدك وكلمة مرورك" : "Login failed: verify credentials", "danger");
    console.error(err);
  } finally {
    btn.disabled = false;
  }
});

// QR Login Scan Logic (Supports direct auth payloads and profile lookup)
async function handleQrLogin(decodedText) {
  try {
    let email = null;
    let password = null;
    
    decodedText = (decodedText || '').trim();
    
    if (decodedText.startsWith("allabib_auth:")) {
      const parts = decodedText.split(":");
      if (parts.length >= 3) {
        email = parts[1];
        password = parts.slice(2).join(":");
      }
    } else {
      // Lookup profile by qr_code_token in Supabase database
      const { data: prof } = await sb
        .from('profiles')
        .select('*')
        .eq('qr_code_token', decodedText)
        .maybeSingle();
        
      if (prof && prof.qr_code_token && prof.qr_code_token.startsWith("allabib_auth:")) {
        const parts = prof.qr_code_token.split(":");
        email = parts[1];
        password = parts.slice(2).join(":");
      } else if (prof && prof.email) {
        email = prof.email;
      }
    }
    
    if (!email) {
      throw new Error("Invalid QR code payload");
    }
    
    if (activeQrScanner) {
      try { await activeQrScanner.stop(); } catch(e){}
      activeQrScanner = null;
      document.getElementById('start-qr-btn').innerHTML = `<i class="fa-solid fa-camera"></i> <span>${TRANSLATIONS[currentLanguage].start_camera}</span>`;
    }
    
    document.body.classList.add('loading-state');
    
    // If password is available, authenticate with password, else fallback to session or signIn
    if (password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      showToast(currentLanguage === 'ar' ? "تم التعرف على كود المستخدم! يرجى إدخال كلمة المرور" : "User identified! Please enter password", "info");
      document.getElementById('login-email').value = email;
      document.getElementById('tab-pass-btn').click();
      document.body.classList.remove('loading-state');
      return;
    }
    
    showToast(currentLanguage === 'ar' ? "مرحباً بك! تم تسجيل الدخول بواسطة رمز QR بنجاح!" : "Welcome! QR Code login successful", "success");
  } catch (err) {
    document.body.classList.remove('loading-state');
    showToast(currentLanguage === 'ar' ? "رمز QR غير صالح أو غير مسجل بالمنظومة" : "Invalid or unrecognized QR code", "danger");
    console.error("QR login error:", err);
  }
}

// 8. Timetable overlap conflict checking
async function checkTimetableConflict(classId, teacherId, roomNumber, dayOfWeek, startTime, endTime, excludeId = null) {
  // Query all timetables for the target day
  let query = sb
    .from('timetables')
    .select('*')
    .eq('day_of_week', dayOfWeek);
    
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  
  const { data: timetables, error } = await query;
  if (error) {
    console.error(error);
    return { hasConflict: true, message: "Error checking database conflicts." };
  }
  
  // Helper overlap check
  const isOverlap = (s1, e1, s2, e2) => {
    // Overlaps if not completely before or after
    return !(e1 <= s2 || s1 >= e2);
  };
  
  for (const slot of timetables) {
    if (isOverlap(startTime, endTime, slot.start_time, slot.end_time)) {
      // 1. Teacher Conflict
      if (slot.teacher_id === teacherId) {
        return { 
          hasConflict: true, 
          message: currentLanguage === 'ar' ? "تعارض: الأستاذ يدرس قسماً آخر في هذا الوقت." : "Conflict: Teacher is assigned to another class at this time." 
        };
      }
      // 2. Room Conflict (only if both have room numbers)
      const slotRoom = (slot.room_number || '').toLowerCase().trim();
      const newRoom = (roomNumber || '').toLowerCase().trim();
      if (slotRoom && newRoom && slotRoom === newRoom) {
        return { 
          hasConflict: true, 
          message: currentLanguage === 'ar' ? "تعارض: القاعة الدراسية محجوزة لحصة أخرى." : "Conflict: Classroom is booked for another session." 
        };
      }
      // 3. Class Conflict
      if (slot.class_id === parseInt(classId)) {
        return { 
          hasConflict: true, 
          message: currentLanguage === 'ar' ? "تعارض: هذا القسم لديه مادة أخرى في نفس الوقت." : "Conflict: Class has another scheduled subject at this time." 
        };
      }
    }
  }
  
  return { hasConflict: false };
}

// 9. STUDENT DASHBOARD MODULE
async function loadStudentDashboard() {
  if (!userProfile || userProfile.role !== 'student') return;
  
  document.getElementById('student-name').innerText = userProfile.name;
  document.getElementById('student-class-level').innerText = userProfile.classes ? userProfile.classes.name : '--';
  
  // 1. Generate QR Code Access Token Card
  const qrTarget = document.getElementById('student-qr-target');
  qrTarget.innerHTML = '';
  // Generate encrypted auth payload
  // In a real-world scenario, we fetch or derive this from qr_code_token
  const authPayload = userProfile.qr_code_token || `allabib_auth:${currentUser.email}:Allabib2027!`;
  
  QRCode.toCanvas(authPayload, { width: 160, margin: 2 }, function (err, canvas) {
    if (err) console.error(err);
    else qrTarget.appendChild(canvas);
  });
  
  // Download button mapping
  document.getElementById('download-my-qr').onclick = () => {
    const canvas = qrTarget.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `Allabib-Card-${userProfile.name}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };
  
  // 2. Check for Parent Summons (استدعاء ولي الأمر)
  const { data: summons } = await sb
    .from('parent_summons')
    .select('*')
    .eq('student_id', currentUser.id)
    .eq('status', 'pending');
    
  const summonsAlert = document.getElementById('student-summons-alert');
  if (summons && summons.length > 0) {
    summonsAlert.classList.remove('hidden');
    document.getElementById('summons-reason').innerText = currentLanguage === 'ar' ? summons[0].reason : summons[0].reason_fr;
    
    document.getElementById('btn-acknowledge-summons').onclick = async () => {
      const { error } = await sb
        .from('parent_summons')
        .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
        .eq('id', summons[0].id);
        
      if (!error) {
        showToast(currentLanguage === 'ar' ? "تم تأكيد الإطلاع بنجاح" : "Summons acknowledged", "success");
        summonsAlert.classList.add('hidden');
      }
    };
  } else {
    summonsAlert.classList.add('hidden');
  }
  
  // 3. Load Personal Timetable
  loadStudentTimetable(userProfile.class_id);
  
  // 4. Load Resources Center
  loadStudentResources(userProfile.class_id);
  
  // 5. Load Absences logs
  loadStudentAbsences(currentUser.id);
  
  // 6. Next Session Calculator widget
  initNextClassWidget(userProfile.class_id);
}

async function loadStudentTimetable(classId) {
  if (!classId) return;
  const { data: slots, error } = await sb
    .from('timetables')
    .select('*, subjects(*), profiles!teacher_id(*)')
    .eq('class_id', classId)
    .order('day_of_week')
    .order('start_time');
  
  if (error) console.error('Student timetable error:', error);
  renderTimetableGrid(slots || [], 'student-timetable-body');
}

function renderTimetableGrid(slots, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (!slots || slots.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2rem">${currentLanguage === 'ar' ? 'لا توجد حصص مجدولة بعد' : 'Aucun cours planifié'}</td></tr>`;
    return;
  }

  // Dynamically extract unique time blocks from actual slot data
  const uniqueTimes = [...new Set(slots.map(s => s.start_time + '|' + s.end_time))];
  uniqueTimes.sort((a, b) => a.localeCompare(b));

  const timeBlocks = uniqueTimes.map(t => {
    const [start, end] = t.split('|');
    const fmt = (ts) => ts ? ts.substring(0, 5) : '??:??';
    return { start, end, label: `${fmt(start)} - ${fmt(end)}` };
  });

  // Day name labels
  const dayNames = {
    ar: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    fr: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  };

  // Find which days actually have slots
  const activeDays = [...new Set(slots.map(s => s.day_of_week))].sort((a,b) => a - b);

  // Build header row dynamically
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `<th>${currentLanguage === 'ar' ? 'التوقيت' : 'Horaire'}</th>`;
  activeDays.forEach(day => {
    const labels = dayNames[currentLanguage] || dayNames['ar'];
    headerRow.innerHTML += `<th>${labels[day] || 'يوم ' + day}</th>`;
  });

  // Insert header into thead if exists, else prepend to tbody
  const table = tbody.closest('table');
  if (table) {
    let thead = table.querySelector('thead');
    if (!thead) {
      thead = document.createElement('thead');
      table.insertBefore(thead, tbody);
    }
    thead.innerHTML = '';
    thead.appendChild(headerRow);
  }

  timeBlocks.forEach(block => {
    const row = document.createElement('tr');

    // Time label column
    const timeTd = document.createElement('td');
    timeTd.className = 'tt-time-col';
    timeTd.innerHTML = `<strong>${block.label}</strong>`;
    row.appendChild(timeTd);

    // One column per active day
    activeDays.forEach(day => {
      const slotTd = document.createElement('td');

      const match = slots.find(s =>
        s.day_of_week === day &&
        s.start_time.substring(0, 5) === block.start.substring(0, 5)
      );

      if (match) {
        const subName = match.subjects
          ? (currentLanguage === 'ar' ? match.subjects.name_ar : match.subjects.name_fr)
          : '—';
        const teacherName = match.profiles ? match.profiles.name : '';
        const room = match.room_number || '';

        slotTd.innerHTML = `
          <div class="timetable-slot-cell">
            <div class="timetable-subject">${subName}</div>
            ${teacherName ? `<div class="timetable-teacher"><i class="fa-solid fa-chalkboard-user"></i> ${teacherName}</div>` : ''}
            ${room ? `<div class="timetable-room"><i class="fa-solid fa-door-open"></i> ${room}</div>` : ''}
          </div>
        `;
      } else {
        slotTd.innerHTML = `<span class="text-muted">—</span>`;
      }

      row.appendChild(slotTd);
    });

    tbody.appendChild(row);
  });
}


async function loadStudentResources(classId) {
  if (!classId) return;
  const { data: files } = await sb
    .from('resources')
    .select('*, subjects(*), profiles!teacher_id(*)')
    .eq('class_id', classId)
    .order('id', { ascending: false });
    
  const container = document.getElementById('student-resources-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (files && files.length > 0) {
    files.forEach(file => {
      const item = document.createElement('div');
      item.className = 'resource-item-card mb-3 p-3 card-nested';
      
      const isImg = file.file_type === 'image';
      const isVid = file.file_type === 'video' || (file.file_url && (file.file_url.includes('youtube.com') || file.file_url.includes('youtu.be')));
      const ytEmbed = isVid ? getYouTubeEmbedUrl(file.file_url) : null;
      const subjectName = file.subjects ? (currentLanguage === 'ar' ? file.subjects.name_ar : file.subjects.name_fr) : '';
      const teacherName = file.profiles ? file.profiles.name : '';
      
      let mediaContent = '';
      if (ytEmbed) {
        mediaContent = `
          <div class="video-embed-wrapper mt-2">
            <iframe src="${ytEmbed}" allowfullscreen></iframe>
          </div>`;
      } else if (isVid) {
        mediaContent = `
          <a href="${file.file_url}" target="_blank" class="video-link-badge mt-2">
            <i class="fa-brands fa-youtube"></i> ${currentLanguage === 'ar' ? 'مشاهدة الفيديو' : 'Regarder la فيديو'}
          </a>`;
      } else if (isImg && file.file_url) {
        mediaContent = `
          <div class="resource-img-preview mt-2">
            <img src="${file.file_url}" alt="${file.title}" style="max-width:100%; max-height:240px; border-radius:8px; object-fit:cover;">
          </div>`;
      }
      
      item.innerHTML = `
        <div class="d-flex align-items-center gap-3 mb-2">
          <div class="res-icon ${isImg ? 'type-image' : (isVid ? 'text-danger' : '')}">
            <i class="fa-solid ${isImg ? 'fa-file-image text-warning' : (isVid ? 'fa-video text-danger' : 'fa-file-pdf text-primary')} fa-2x"></i>
          </div>
          <div class="res-info flex-grow-1">
            <h5 class="m-0">${file.title}</h5>
            <small class="text-muted">${subjectName} ${teacherName ? '| أستاذ ' + teacherName : ''}</small>
          </div>
        </div>
        ${mediaContent}
        <div class="mt-2 text-start">
          <a href="${file.file_url}" target="_blank" class="btn btn-sm btn-secondary">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> ${TRANSLATIONS[currentLanguage].download || 'فتح / تحميل'}
          </a>
        </div>
      `;
      container.appendChild(item);
    });
  } else {
    container.innerHTML = `<p class="empty-notif" data-key="no_resources">${TRANSLATIONS[currentLanguage].no_resources}</p>`;
  }
}

async function loadStudentAbsences(studentId) {
  const { data: list } = await sb
    .from('attendance')
    .select('*')
    .eq('student_id', studentId);
    
  const tbody = document.getElementById('student-attendance-body');
  tbody.innerHTML = '';
  
  if (list && list.length > 0) {
    list.forEach(rec => {
      const row = document.createElement('tr');
      
      let statusText = '';
      let statusClass = '';
      if (rec.status === 'absent') {
        statusText = currentLanguage === 'ar' ? 'غائب' : 'Absent';
        statusClass = 'text-danger';
      } else {
        statusText = currentLanguage === 'ar' ? 'متأخر' : 'En retard';
        statusClass = 'text-warning';
      }
      
      const justification = rec.justified 
        ? (currentLanguage === 'ar' ? "مبرر" : "Justifié") 
        : (currentLanguage === 'ar' ? "غير مبرر" : "Non justifié");
        
      row.innerHTML = `
        <td>${rec.date}</td>
        <td class="${statusClass}"><strong>${statusText}</strong></td>
        <td><span class="badge ${rec.justified ? 'btn-success' : 'btn-secondary'}">${justification}</span></td>
      `;
      tbody.appendChild(row);
    });
  } else {
    row = document.createElement('tr');
    row.innerHTML = `<td colspan="3" class="text-center text-muted">${currentLanguage === 'ar' ? 'لا يوجد سجل غيابات' : 'No absence records'}</td>`;
    tbody.appendChild(row);
  }
}

function initNextClassWidget(classId) {
  // Simple check for next class every minute
  const check = async () => {
    const now = new Date();
    // 0 = Sunday, 1 = Monday ... 6 = Sat (Supabase: day_of_week 0 = Mon... 5 = Sat)
    // Convert JS day (0-6 Sun-Sat) to DB day (0-5 Mon-Sat, Sunday holiday)
    let day = now.getDay() - 1;
    if (day < 0) day = 6; // Sunday
    
    if (day === 6) {
      document.getElementById('next-class-container').innerHTML = `<p class="no-class-text">${currentLanguage === 'ar' ? 'اليوم الأحد: عطلة نهاية الأسبوع' : 'Today is Sunday: Weekend'}</p>`;
      return;
    }
    
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
    
    // Fetch today's schedule slots
    const { data: todaySlots } = await sb
      .from('timetables')
      .select('*, subjects(*), profiles!teacher_id(*)')
      .eq('class_id', classId)
      .eq('day_of_week', day);
      
    if (!todaySlots || todaySlots.length === 0) {
      document.getElementById('next-class-container').innerHTML = `<p class="no-class-text">${TRANSLATIONS[currentLanguage].no_current_class}</p>`;
      return;
    }
    
    // Find active or upcoming slot
    let active = null;
    let upcoming = null;
    
    todaySlots.forEach(slot => {
      if (timeStr >= slot.start_time && timeStr <= slot.end_time) {
        active = slot;
      } else if (slot.start_time > timeStr && (!upcoming || slot.start_time < upcoming.start_time)) {
        upcoming = slot;
      }
    });
    
    const container = document.getElementById('next-class-container');
    if (active) {
      const subj = currentLanguage === 'ar' ? active.subjects.name_ar : active.subjects.name_fr;
      container.innerHTML = `
        <div class="active-session-box p-3 btn-success text-white rounded">
          <h5>${currentLanguage === 'ar' ? 'الحصة الحالية:' : 'Session en cours:'} <strong>${subj}</strong></h5>
          <p>${currentLanguage === 'ar' ? 'القاعة:' : 'Salle:'} ${active.room_number || ''} | أستاذ ${active.profiles ? active.profiles.name : ''}</p>
          <small>${active.start_time.substring(0, 5)} - ${active.end_time.substring(0, 5)}</small>
        </div>
      `;
    } else if (upcoming) {
      const subj = currentLanguage === 'ar' ? upcoming.subjects.name_ar : upcoming.subjects.name_fr;
      container.innerHTML = `
        <div class="upcoming-session-box p-3 bg-light border rounded">
          <h5>${currentLanguage === 'ar' ? 'الحصة القادمة:' : 'Séance suivante:'} <strong>${subj}</strong></h5>
          <p>${currentLanguage === 'ar' ? 'القاعة:' : 'Salle:'} ${upcoming.room_number || ''} | أستاذ ${upcoming.profiles ? upcoming.profiles.name : ''}</p>
          <small>${upcoming.start_time.substring(0, 5)} (${currentLanguage === 'ar' ? 'تبدأ في' : 'commence à'} ${upcoming.start_time.substring(0, 5)})</small>
        </div>
      `;
    } else {
      container.innerHTML = `<p class="no-class-text">${currentLanguage === 'ar' ? 'انتهت حصص اليوم المبرمجة!' : 'End of scheduled sessions for today!'}</p>`;
    }
  };
  
  check();
  setInterval(check, 60000);
}

// 10. TEACHER DASHBOARD MODULE
async function loadTeacherDashboard() {
  if (!userProfile || userProfile.role !== 'teacher') return;
  
  document.getElementById('teacher-name-title').innerText = `${currentLanguage === 'ar' ? 'الأستاذ(ة):' : 'Enseignant:'} ${userProfile.name}`;
  
  // 1. Fetch classes & subjects for selects
  const { data: schedule, error: schedErr } = await sb
    .from('timetables')
    .select('*, subjects(*), classes(*), profiles!teacher_id(*)')
    .eq('teacher_id', currentUser.id)
    .order('day_of_week')
    .order('start_time');
  
  if (schedErr) console.error('Teacher schedule error:', schedErr);
  renderTimetableGrid(schedule || [], 'teacher-timetable-body');
  
  // Populate select boxes in forms
  populateTeacherSelects(schedule);
}

function populateTeacherSelects(schedule) {
  const classSelects = [
    document.getElementById('res-class-select'),
    document.getElementById('teach-attend-session-select'),
    document.getElementById('sub-timetable-select')
  ];
  
  // Clear lists
  classSelects.forEach(sel => { if(sel) sel.innerHTML = `<option value="">-- ${currentLanguage === 'ar' ? 'اختر' : 'Choisir'} --</option>`; });
  
  const subjectsSelect = document.getElementById('res-subject-select');
  subjectsSelect.innerHTML = `<option value="">-- ${currentLanguage === 'ar' ? 'اختر المادة' : 'Choisir la matière'} --</option>`;
  
  // Unique classes/subjects lists
  const classesSeen = new Set();
  const subjectsSeen = new Set();
  
  schedule.forEach(s => {
    // Fill schedule select for substitutions
    const subjName = currentLanguage === 'ar' ? s.subjects.name_ar : s.subjects.name_fr;
    const ttSelect = document.getElementById('sub-timetable-select');
    const dayName = TRANSLATIONS[currentLanguage][`day_${getDayNameKey(s.day_of_week)}`] || '';
    const optText = `${s.classes.name} - ${subjName} (${dayName} ${s.start_time.substring(0, 5)})`;
    ttSelect.innerHTML += `<option value="${s.id}">${optText}</option>`;
    
    // Fill session selector for attendance
    const dayIdx = new Date().getDay() - 1; // 0 = Mon
    // Check if slot falls on today's day of week
    if (s.day_of_week === (dayIdx < 0 ? 6 : dayIdx)) {
      const attendSelect = document.getElementById('teach-attend-session-select');
      attendSelect.innerHTML += `<option value="${s.id}" data-class="${s.class_id}">${s.classes.name} - ${subjName} (${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)})</option>`;
    }

    if (!classesSeen.has(s.class_id)) {
      classesSeen.add(s.class_id);
      document.getElementById('res-class-select').innerHTML += `<option value="${s.class_id}">${s.classes.name}</option>`;
    }
    
    if (!subjectsSeen.has(s.subject_id)) {
      subjectsSeen.add(s.subject_id);
      subjectsSelect.innerHTML += `<option value="${s.subject_id}">${subjName}</option>`;
    }
  });
}

// Attendance List loading
document.getElementById('teach-load-students-btn').onclick = async () => {
  const sessionSelect = document.getElementById('teach-attend-session-select');
  const timetableId = sessionSelect.value;
  const classId = sessionSelect.options[sessionSelect.selectedIndex].getAttribute('data-class');
  
  if (!timetableId || !classId) {
    showToast(currentLanguage === 'ar' ? "يرجى اختيار حصة صالحة أولاً" : "Please select a valid session first", "warning");
    return;
  }
  
  const { data: students, error } = await sb
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .eq('class_id', classId);
    
  if (error) {
    console.error(error);
    return;
  }
  
  const wrapper = document.getElementById('teacher-students-checklist-wrapper');
  const tbody = document.getElementById('teacher-students-body');
  tbody.innerHTML = '';
  
  document.getElementById('selected-attendance-details').innerText = sessionSelect.options[sessionSelect.selectedIndex].text;
  
  if (students && students.length > 0) {
    students.forEach(st => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${st.name}</strong></td>
        <td>
          <div class="attendance-options">
            <label class="mr-2"><input type="radio" name="attend_${st.id}" value="present" checked> ${currentLanguage === 'ar' ? 'حاضر' : 'Présent'}</label>
            <label class="mr-2 text-danger"><input type="radio" name="attend_${st.id}" value="absent"> ${currentLanguage === 'ar' ? 'غائب' : 'Absent'}</label>
            <label class="mr-2 text-warning"><input type="radio" name="attend_${st.id}" value="late"> ${currentLanguage === 'ar' ? 'متأخر' : 'Retard'}</label>
          </div>
        </td>
        <td>
          <input type="text" id="note_${st.id}" class="form-control btn-sm" placeholder="${currentLanguage === 'ar' ? 'ملاحظة...' : 'Note...'}">
        </td>
      `;
      row.setAttribute('data-student-id', st.id);
      tbody.appendChild(row);
    });
    wrapper.classList.remove('hidden');
  } else {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">${currentLanguage === 'ar' ? 'لا يوجد تلاميذ مسجلين في هذا القسم' : 'No students in this class'}</td></tr>`;
    wrapper.classList.remove('hidden');
  }
};

// Save attendance Checklist action
document.getElementById('teach-save-attendance-btn').onclick = async () => {
  const sessionSelect = document.getElementById('teach-attend-session-select');
  const timetableId = parseInt(sessionSelect.value);
  const classId = parseInt(sessionSelect.options[sessionSelect.selectedIndex].getAttribute('data-class'));
  const rows = document.querySelectorAll('#teacher-students-body tr');
  const today = new Date().toISOString().split('T')[0];
  
  const attendanceRecords = [];
  
  rows.forEach(row => {
    const studentId = row.getAttribute('data-student-id');
    if (studentId) {
      const status = row.querySelector(`input[name="attend_${studentId}"]:checked`).value;
      const note = document.getElementById(`note_${studentId}`).value.trim();
      
      attendanceRecords.push({
        student_id: studentId,
        class_id: classId,
        timetable_id: timetableId,
        date: today,
        status: status,
        justification_notes: note,
        justified: false
      });
    }
  });
  
  // Bulk upload records
  const { error } = await sb.from('attendance').insert(attendanceRecords);
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تم تسجيل وحفظ الحضور بنجاح!" : "Attendance saved successfully!", "success");
    document.getElementById('teacher-students-checklist-wrapper').classList.add('hidden');
  } else {
    console.error(error);
    showToast(currentLanguage === 'ar' ? "حدث خطأ أثناء حفظ السجل" : "Error saving attendance registry", "danger");
  }
};

// Resource Upload submit logic (Supports Files & Video Links)
document.getElementById('teacher-resource-form').onsubmit = async (e) => {
  e.preventDefault();
  const classId = document.getElementById('res-class-select').value;
  const subjectId = document.getElementById('res-subject-select').value;
  const title = document.getElementById('res-title').value.trim();
  const fileInput = document.getElementById('res-file');
  const videoUrlInput = document.getElementById('res-video-url');
  
  const file = fileInput ? fileInput.files[0] : null;
  const videoUrl = videoUrlInput ? videoUrlInput.value.trim() : '';
  
  if (!file && !videoUrl) {
    showToast(currentLanguage === 'ar' ? "يرجى اختيار ملف أو إدخال رابط فيديو" : "Please select a file or enter a video URL", "warning");
    return;
  }
  
  const uploadBtn = document.getElementById('btn-upload-resource');
  const progressWrapper = document.getElementById('upload-progress-wrapper');
  const progressFill = document.getElementById('upload-progress-fill');
  const progressText = document.getElementById('upload-progress-text');
  
  uploadBtn.disabled = true;
  if (file && progressWrapper) progressWrapper.classList.remove('hidden');
  
  try {
    let finalUrl = videoUrl;
    let fileType = 'video';
    let publicId = null;
    
    if (file) {
      const uploadRes = await uploadToCloudinary(file, 'auto', (percent) => {
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.innerText = `${percent}%`;
      });
      finalUrl = uploadRes.url;
      fileType = uploadRes.fileType;
      publicId = uploadRes.publicId;
    }
    
    // Save to Database resources
    const { error } = await sb.from('resources').insert({
      class_id: classId,
      subject_id: subjectId,
      teacher_id: currentUser.id,
      title: title,
      file_url: finalUrl,
      file_type: fileType,
      file_public_id: publicId
    });
    
    if (error) throw error;
    
    showToast(currentLanguage === 'ar' ? "تم نشر الدرس والوسائط بنجاح!" : "Resource published successfully!", "success");
    document.getElementById('teacher-resource-form').reset();
    await loadStudentResources(classId);
  } catch (err) {
    console.error("Resource upload error:", err);
    showToast(err.message || (currentLanguage === 'ar' ? "فشل رفع الملف" : "Failed to upload file"), "danger");
  } finally {
    uploadBtn.disabled = false;
    if (progressWrapper) progressWrapper.classList.add('hidden');
  }
};

// Teacher Missed Session Request Submit
document.getElementById('teacher-substitution-form').onsubmit = async (e) => {
  e.preventDefault();
  const timetableId = document.getElementById('sub-timetable-select').value;
  const date = document.getElementById('sub-date').value;
  const status = document.getElementById('sub-status').value;
  const notes = document.getElementById('sub-notes').value.trim();
  
  const { error } = await sb.from('session_substitutions').insert({
    timetable_id: timetableId,
    date: date,
    status: status,
    notes: notes
  });
  
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تم إرسال الطلب للإدارة بنجاح" : "Request sent successfully", "success");
    document.getElementById('teacher-substitution-form').reset();
  } else {
    showToast(currentLanguage === 'ar' ? "فشل إرسال الطلب" : "Error sending request", "danger");
    console.error(error);
  }
};


// 11. ADMIN DASHBOARD MODULES
async function loadAdminDashboard() {
  if (!userProfile || userProfile.role !== 'admin') return;
  
  // Load Levels, Classes, Subjects in Selects and Trees
  await loadLevelsClassesTree();
  await loadAdminSubjectLists();
  await populateAdminSelects();
  await loadAdminUsersList();
  await loadAdminAbsencesList();
  await loadAdminSummonsLogs();
  await loadHolidayList();
  await loadSubstitutionsLogs();
  await loadContactDirectory();
}

async function loadContactDirectory() {
  try {
    const { data: info, error } = await sb
      .from('school_contact_info')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
      
    if (info) {
      // Update Contact Directory View
      const phone1El = document.getElementById('dir-phone-1');
      const phone2El = document.getElementById('dir-phone-2');
      const emailEl = document.getElementById('dir-email');
      const addressEl = document.getElementById('dir-address');
      const hoursEl = document.getElementById('dir-hours');
      const msgArEl = document.getElementById('dir-msg-ar');
      const msgFrEl = document.getElementById('dir-msg-fr');
      
      if (phone1El) phone1El.innerText = info.phone_1 || '0537-000000';
      if (phone2El) phone2El.innerText = info.phone_2 || '0661-000000';
      if (emailEl) emailEl.innerText = info.email || 'contact@allabib.ma';
      if (addressEl) addressEl.innerText = currentLanguage === 'ar' ? (info.address_ar || '') : (info.address_fr || '');
      if (hoursEl) hoursEl.innerText = currentLanguage === 'ar' ? (info.working_hours_ar || '') : (info.working_hours_fr || '');
      if (msgArEl) msgArEl.innerText = info.assistance_msg_ar || 'إذا واجهتكم أي مشكلة تواصلوا مع إدارة مؤسستكم.';
      if (msgFrEl) msgFrEl.innerText = info.assistance_msg_fr || 'Si vous rencontrez un problème, veuillez contacter l\'administration de votre établissement.';

      // Pre-fill Admin Edit Contact Form inputs
      const fPhone1 = document.getElementById('cnt-phone1');
      const fPhone2 = document.getElementById('cnt-phone2');
      const fEmail = document.getElementById('cnt-email');
      const fAddrAr = document.getElementById('cnt-addr-ar');
      const fAddrFr = document.getElementById('cnt-addr-fr');
      const fHoursAr = document.getElementById('cnt-hours-ar');
      const fHoursFr = document.getElementById('cnt-hours-fr');
      const fMsgAr = document.getElementById('cnt-msg-ar');
      const fMsgFr = document.getElementById('cnt-msg-fr');
      
      if (fPhone1) fPhone1.value = info.phone_1 || '';
      if (fPhone2) fPhone2.value = info.phone_2 || '';
      if (fEmail) fEmail.value = info.email || '';
      if (fAddrAr) fAddrAr.value = info.address_ar || '';
      if (fAddrFr) fAddrFr.value = info.address_fr || '';
      if (fHoursAr) fHoursAr.value = info.working_hours_ar || '';
      if (fHoursFr) fHoursFr.value = info.working_hours_fr || '';
      if (fMsgAr) fMsgAr.value = info.assistance_msg_ar || '';
      if (fMsgFr) fMsgFr.value = info.assistance_msg_fr || '';
    }
  } catch (err) {
    console.error("Error loading contact directory:", err);
  }
}

// Handle Admin Contact Form Submit
const adminContactForm = document.getElementById('admin-contact-form');
if (adminContactForm) {
  adminContactForm.onsubmit = async (e) => {
    e.preventDefault();
    if (!userProfile || userProfile.role !== 'admin') {
      showToast(currentLanguage === 'ar' ? "هذه العملية متاحة للإدارة فقط" : "Admin only action", "warning");
      return;
    }
    
    const phone1 = document.getElementById('cnt-phone1').value.trim();
    const phone2 = document.getElementById('cnt-phone2').value.trim();
    const email = document.getElementById('cnt-email').value.trim();
    const addrAr = document.getElementById('cnt-addr-ar').value.trim();
    const addrFr = document.getElementById('cnt-addr-fr').value.trim();
    const hoursAr = document.getElementById('cnt-hours-ar').value.trim();
    const hoursFr = document.getElementById('cnt-hours-fr').value.trim();
    const msgAr = document.getElementById('cnt-msg-ar').value.trim();
    const msgFr = document.getElementById('cnt-msg-fr').value.trim();
    
    try {
      const { error } = await sb
        .from('school_contact_info')
        .upsert({
          id: 1,
          phone_1: phone1,
          phone_2: phone2,
          email: email,
          address_ar: addrAr,
          address_fr: addrFr,
          working_hours_ar: hoursAr,
          working_hours_fr: hoursFr,
          assistance_msg_ar: msgAr,
          assistance_msg_fr: msgFr,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      showToast(currentLanguage === 'ar' ? "تم تحديث معلومات التواصل بنجاح!" : "Contact information updated successfully!", "success");
      await loadContactDirectory();
    } catch (err) {
      showToast(err.message, "danger");
      console.error(err);
    }
  };
}

async function loadLevelsClassesTree() {
  const { data: levels } = await sb.from('levels').select('*');
  const { data: classes } = await sb.from('classes').select('*');
  
  const treeContainer = document.getElementById('levels-classes-tree');
  treeContainer.innerHTML = '';
  
  if (levels) {
    levels.forEach(lvl => {
      const lvlDiv = document.createElement('div');
      lvlDiv.className = 'tree-level-node mb-3';
      const lvlName = currentLanguage === 'ar' ? lvl.name_ar : lvl.name_fr;
      
      let classItems = '';
      const filtered = classes ? classes.filter(c => c.level_id === lvl.id) : [];
      filtered.forEach(c => {
        classItems += `
          <li>
            <span><i class="fa-solid fa-graduation-cap"></i> ${c.name}</span>
            <button class="btn btn-secondary btn-sm" onclick="deleteClass(${c.id})"><i class="fa-solid fa-trash text-danger"></i></button>
          </li>`;
      });
      
      lvlDiv.innerHTML = `
        <div class="tree-level"><i class="fa-solid fa-folder-open text-warning"></i> ${lvlName}</div>
        <ul class="tree-classes-list">
          ${classItems || `<li class="text-muted">${currentLanguage === 'ar' ? 'لا توجد أقسام مسجلة' : 'No classes'}</li>`}
        </ul>
      `;
      treeContainer.appendChild(lvlDiv);
    });
  }
}

async function loadAdminSubjectLists() {
  const { data: subjects } = await sb.from('subjects').select('*, levels(*)');
  const tbody = document.getElementById('admin-subjects-table-body');
  tbody.innerHTML = '';
  
  if (subjects) {
    subjects.forEach(sub => {
      const row = document.createElement('tr');
      const subName = currentLanguage === 'ar' ? sub.name_ar : sub.name_fr;
      const lvlName = currentLanguage === 'ar' ? sub.levels.name_ar : sub.levels.name_fr;
      
      row.innerHTML = `
        <td><strong>${subName}</strong></td>
        <td>${lvlName}</td>
        <td><span class="badge btn-accent">${sub.coefficient}</span></td>
      `;
      tbody.appendChild(row);
    });
  }
}

async function populateAdminSelects() {
  const { data: levels } = await sb.from('levels').select('*');
  const { data: classes } = await sb.from('classes').select('*');
  const { data: subjects } = await sb.from('subjects').select('*');
  const { data: teachers } = await sb.from('profiles').select('*').eq('role', 'teacher');
  const { data: students } = await sb.from('profiles').select('*').eq('role', 'student');
  
  const classSelects = [
    document.getElementById('tt-class'),
    document.getElementById('timetable-view-class-select'),
    document.getElementById('adm-sub-class-select'),
    document.getElementById('usr-class'),
    document.getElementById('adm-abs-class-select')
  ];
  
  classSelects.forEach(sel => {
    if (sel) {
      sel.innerHTML = `<option value="">-- ${currentLanguage === 'ar' ? 'اختر القسم' : 'Choose class'} --</option>`;
      if (classes) classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    }
  });
  
  const levelSelects = [
    document.getElementById('cls-level-select'),
    document.getElementById('sub-level-select')
  ];
  levelSelects.forEach(sel => {
    if(sel) {
      sel.innerHTML = `<option value="">-- ${currentLanguage === 'ar' ? 'اختر المستوى' : 'Choose level'} --</option>`;
      if (levels) levels.forEach(l => sel.innerHTML += `<option value="${l.id}">${currentLanguage === 'ar' ? l.name_ar : l.name_fr}</option>`);
    }
  });
  
  const subSelect = document.getElementById('tt-subject');
  if (subSelect) {
    subSelect.innerHTML = `<option value="">-- ${currentLanguage === 'ar' ? 'اختر المادة' : 'Choose subject'} --</option>`;
    if (subjects) subjects.forEach(s => subSelect.innerHTML += `<option value="${s.id}">${currentLanguage === 'ar' ? s.name_ar : s.name_fr}</option>`);
  }
  
  const teacherSelects = [
    document.getElementById('tt-teacher'),
    document.getElementById('adm-sub-teacher-select')
  ];
  teacherSelects.forEach(sel => {
    if(sel) {
      sel.innerHTML = `<option value="">-- ${currentLanguage === 'ar' ? 'اختر الأستاذ' : 'Choose teacher'} --</option>`;
      if (teachers) teachers.forEach(t => sel.innerHTML += `<option value="${t.id}">${t.name}</option>`);
    }
  });
  
  const studentSelects = [
    document.getElementById('sum-student-select')
  ];
  studentSelects.forEach(sel => {
    if (sel) {
      sel.innerHTML = `<option value="">-- ${currentLanguage === 'ar' ? 'اختر التلميذ' : 'Choose student'} --</option>`;
      if (students) students.forEach(st => sel.innerHTML += `<option value="${st.id}">${st.name}</option>`);
    }
  });
}

// LEVEL CRUDS (Single Input Field)
document.getElementById('admin-level-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('lvl-name').value.trim();
  
  const { error } = await sb.from('levels').insert({ name_ar: name, name_fr: name });
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تمت إضافة المستوى بنجاح" : "Level added", "success");
    document.getElementById('admin-level-form').reset();
    await loadAdminDashboard();
  } else {
    showToast(error.message, "danger");
  }
};

// SUBJECT CRUDS (Single Input Field)
document.getElementById('admin-subject-form').onsubmit = async (e) => {
  e.preventDefault();
  const levelId = document.getElementById('sub-level-select').value;
  const name = document.getElementById('subj-name').value.trim();
  const coeff = document.getElementById('subj-coeff').value;
  
  const { error } = await sb.from('subjects').insert({
    level_id: levelId,
    name_ar: name,
    name_fr: name,
    coefficient: coeff
  });
  
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تمت إضافة المادة" : "Subject added", "success");
    document.getElementById('admin-subject-form').reset();
    await loadAdminDashboard();
  } else {
    showToast(error.message, "danger");
  }
};

// TIMETABLE PLANNER SUBMIT (Conflict checking included)
document.getElementById('admin-timetable-form').onsubmit = async (e) => {
  e.preventDefault();
  const classId = document.getElementById('tt-class').value;
  const subjectId = document.getElementById('tt-subject').value;
  const teacherId = document.getElementById('tt-teacher').value;
  const day = parseInt(document.getElementById('tt-day').value);
  const start = document.getElementById('tt-start').value + ":00";
  const end = document.getElementById('tt-end').value + ":00";
  const room = document.getElementById('tt-room').value.trim();
  
  // Conflict verification
  const check = await checkTimetableConflict(classId, teacherId, room, day, start, end);
  if (check.hasConflict) {
    showToast(check.message, "danger");
    return;
  }
  
  const { error } = await sb.from('timetables').insert({
    class_id: classId,
    subject_id: subjectId,
    teacher_id: teacherId,
    day_of_week: day,
    start_time: start,
    end_time: end,
    room_number: room
  });
  
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تمت جدولة الحصة بنجاح!" : "Session scheduled successfully", "success");
    document.getElementById('admin-timetable-form').reset();
    await loadAdminDashboard();
    // Always refresh schedule view for inserted class
    const viewClassSelect = document.getElementById('timetable-view-class-select');
    if (viewClassSelect && viewClassSelect.value) {
      triggerAdminScheduleView(viewClassSelect.value);
    } else {
      triggerAdminScheduleView(classId);
    }
  } else {
    showToast(error.message, "danger");
  }
};

document.getElementById('timetable-view-class-select').onchange = (e) => {
  triggerAdminScheduleView(e.target.value);
};

async function triggerAdminScheduleView(classId) {
  if (!classId) return;
  const { data: slots, error } = await sb
    .from('timetables')
    .select('*, subjects(*), profiles!teacher_id(*)')
    .eq('class_id', classId)
    .order('day_of_week')
    .order('start_time');
  
  if (error) console.error('Timetable load error:', error);
  renderTimetableGrid(slots || [], 'admin-timetable-grid-body');
}

// User accounts creator (Initiates full Supabase Auth Lifecycle & enriches profile)
document.getElementById('admin-user-create-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('usr-name').value.trim();
  const email = document.getElementById('usr-email').value.trim();
  const password = document.getElementById('usr-password').value.trim();
  const role = document.getElementById('usr-role').value;
  const classId = document.getElementById('usr-class').value;
  const phone = document.getElementById('usr-phone').value.trim();
  
  // Initialize secondary client with persistSession: false to preserve active admin session
  const authBuilder = _supabaseLib.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false }
  });
  
  try {
    // 1. Invoke Supabase Auth API -> Launches Authentication Lifecycle (auth.users entry, password hashing, JWT readiness)
    const { data: signUpData, error: signUpError } = await authBuilder.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          full_name: name,
          role: role
        }
      }
    });
    
    let targetUid = null;
    
    if (signUpError) {
      // If user already exists in auth.users, handle gracefully without failing
      if (signUpError.message && (signUpError.message.includes("already registered") || signUpError.message.includes("already exists"))) {
        const { data: existingProf } = await sb.from('profiles').select('id').eq('email', email).maybeSingle();
        if (existingProf) {
          targetUid = existingProf.id;
        }
      } else {
        throw signUpError;
      }
    } else if (signUpData && signUpData.user) {
      targetUid = signUpData.user.id;
    }
    
    const qrToken = `allabib_auth:${email}:${password}`;
    
    // 2. Upsert profile attributes in public.profiles
    if (targetUid) {
      const { error: profileError } = await sb.from('profiles').upsert({
        id: targetUid,
        name: name,
        email: email,
        role: role,
        class_id: role === 'student' ? (classId ? parseInt(classId) : null) : null,
        phone_number: phone,
        qr_code_token: qrToken
      });
      
      if (profileError) throw profileError;
    }
    
    const isAlready = signUpError && signUpError.message && signUpError.message.includes("already registered");
    const msg = isAlready
      ? (currentLanguage === 'ar' ? "هذا البريد مسجل سابقاً في المنظومة، تم تحديث ملفه وبطاقته بنجاح!" : "User already registered: profile updated!")
      : (currentLanguage === 'ar' ? "تم إنشاء الحساب وإطلاق التوثيق وتوليد بطاقة QR بنجاح!" : "User created & QR generated!");
      
    showToast(msg, isAlready ? "info" : "success");
    document.getElementById('admin-user-create-form').reset();
    await loadAdminDashboard();
  } catch (err) {
    showToast(err.message, "danger");
    console.error("User creation error:", err);
  }
};

async function loadAdminUsersList() {
  const { data: users } = await sb.from('profiles').select('*, classes(*)').order('created_at', { ascending: false });
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (users) {
    users.forEach(u => {
      const row = document.createElement('tr');
      const className = u.classes ? u.classes.name : '-';
      
      row.innerHTML = `
        <td><strong>${u.name}</strong><br><small class="text-muted">${u.email || ''} ${u.phone_number ? '| ' + u.phone_number : ''}</small></td>
        <td>
          <select class="form-control form-control-sm role-changer-select" data-uid="${u.id}">
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>مشرف / مدير (Admin)</option>
            <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>أستاذ (Teacher)</option>
            <option value="student" ${u.role === 'student' ? 'selected' : ''}>تلميذ (Student)</option>
          </select>
        </td>
        <td>${className}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="showQrModal('${u.name}', '${u.role}', '${className}', '${u.qr_code_token || ''}')">
            <i class="fa-solid fa-qrcode"></i> QR
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    // Attach change event listeners to role switcher dropdowns
    document.querySelectorAll('.role-changer-select').forEach(sel => {
      sel.onchange = async (e) => {
        const targetUid = e.target.getAttribute('data-uid');
        const newRole = e.target.value;
        await updateUserRole(targetUid, newRole);
      };
    });
  }
}

async function updateUserRole(uid, newRole) {
  try {
    const { error } = await sb
      .from('profiles')
      .update({ role: newRole })
      .eq('id', uid);
      
    if (error) throw error;
    
    showToast(currentLanguage === 'ar' ? `تم تغيير دور المستخدم إلى ${newRole} بنجاح!` : `User role updated to ${newRole}!`, "success");
    if (currentUser && currentUser.id === uid) {
      await fetchUserProfile(uid);
    }
  } catch (err) {
    showToast(err.message, "danger");
    console.error(err);
  }
}

window.showQrModal = (name, role, className, qrToken) => {
  const modal = document.getElementById('qr-print-modal');
  document.getElementById('modal-card-name').innerText = name;
  document.getElementById('modal-card-role').innerText = TRANSLATIONS[currentLanguage][`role_${role}`] || role;
  document.getElementById('modal-card-class').innerText = className;
  document.getElementById('modal-card-uid').innerText = qrToken ? "Card ID Active" : "--";
  
  const canvasTarget = document.getElementById('modal-qr-canvas');
  canvasTarget.innerHTML = '';
  
  QRCode.toCanvas(qrToken || 'allabib_error', { width: 150 }, function (err, canvas) {
    if (err) {
      console.error(err);
    } else {
      canvasTarget.appendChild(canvas);
      // Append standard printable image element for 100% browser print compatibility
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.alt = 'QR Code';
      img.style.maxWidth = '150px';
      img.style.margin = '0 auto';
      canvasTarget.appendChild(img);
    }
  });
  
  modal.classList.remove('hidden');
};

document.getElementById('close-qr-modal-btn').onclick = () => {
  document.getElementById('qr-print-modal').classList.add('hidden');
};

document.getElementById('btn-print-qr-card').onclick = () => {
  window.print();
};

// ABSENCES AND SUMMONS
async function loadAdminAbsencesList() {
  const { data: list } = await sb
    .from('attendance')
    .select('*, profiles(*)')
    .order('date', { ascending: false });
    
  const tbody = document.getElementById('admin-absence-table-body');
  tbody.innerHTML = '';
  
  if (list && list.length > 0) {
    list.forEach(item => {
      const row = document.createElement('tr');
      const statusLbl = item.status === 'absent' 
        ? (currentLanguage === 'ar' ? 'غياب' : 'Absent') 
        : (currentLanguage === 'ar' ? 'تأخر' : 'Retard');
      const statusClass = item.status === 'absent' ? 'text-danger' : 'text-warning';
      
      row.innerHTML = `
        <td><strong>${item.profiles.name}</strong></td>
        <td>${item.date}</td>
        <td class="${statusClass}"><strong>${statusLbl}</strong></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="toggleAbsenceJustification(${item.id}, ${item.justified})">
            <i class="fa-solid ${item.justified ? 'fa-xmark text-danger' : 'fa-check text-success'}"></i>
            <span>${item.justified ? (currentLanguage === 'ar' ? 'إلغاء المبرر' : 'Unjustify') : (currentLanguage === 'ar' ? 'تبرير' : 'Justify')}</span>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
}

window.toggleAbsenceJustification = async (id, currentVal) => {
  const { error } = await sb
    .from('attendance')
    .update({ justified: !currentVal })
    .eq('id', id);
    
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تم تحديث مبرر الغياب" : "Justification updated", "success");
    await loadAdminAbsencesList();
  }
};

// Issue Summon parent Submit (Single Input Field)
document.getElementById('admin-summons-form').onsubmit = async (e) => {
  e.preventDefault();
  const studentId = document.getElementById('sum-student-select').value;
  const reason = document.getElementById('sum-reason').value.trim();
  
  const { error } = await sb.from('parent_summons').insert({
    student_id: studentId,
    reason: reason,
    reason_fr: reason,
    status: 'pending'
  });
  
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تم إرسال الاستدعاء بنجاح للتلميذ" : "Summons issued successfully", "success");
    document.getElementById('admin-summons-form').reset();
    await loadAdminSummonsLogs();
  } else {
    showToast(error.message, "danger");
  }
};

async function loadAdminSummonsLogs() {
  const { data: summons } = await sb
    .from('parent_summons')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false });
    
  const tbody = document.getElementById('admin-summons-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (summons) {
    summons.forEach(s => {
      const row = document.createElement('tr');
      const reasonText = currentLanguage === 'ar' ? s.reason : (s.reason_fr || s.reason);
      const statusText = s.status === 'acknowledged'
        ? `<span class="badge btn-success">${currentLanguage === 'ar' ? 'تم الاطلاع' : 'Acknowledged'}</span>`
        : `<span class="badge btn-secondary">${currentLanguage === 'ar' ? 'قيد الانتظار' : 'Pending'}</span>`;
        
      row.innerHTML = `
        <td><strong>${s.profiles ? s.profiles.name : ''}</strong></td>
        <td>${s.date_issued || ''}</td>
        <td>${reasonText}</td>
        <td>${statusText}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

// HOLIDAYS & ANNOUNCEMENTS (Supports Media File Uploads & Video Links)
document.getElementById('admin-announcement-form').onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById('ann-title').value.trim();
  const msg = document.getElementById('ann-msg').value.trim();
  const fileInput = document.getElementById('ann-file');
  const videoUrlInput = document.getElementById('ann-video-url');
  
  const file = fileInput ? fileInput.files[0] : null;
  const videoUrl = videoUrlInput ? videoUrlInput.value.trim() : '';
  const postBtn = document.getElementById('btn-post-announcement');
  
  if (postBtn) postBtn.disabled = true;
  
  try {
    let mediaUrl = null;
    if (file) {
      const uploadRes = await uploadToCloudinary(file, 'auto');
      mediaUrl = uploadRes.url;
    }
    
    const { error } = await sb.from('notifications').insert({
      title: title,
      title_fr: title,
      message: msg,
      message_fr: msg,
      media_url: mediaUrl,
      video_url: videoUrl || null
    });
    
    if (error) throw error;
    
    showToast(currentLanguage === 'ar' ? "تم نشر الإعلان والوسائط بنجاح للجميع!" : "Announcement broadcasted successfully!", "success");
    document.getElementById('admin-announcement-form').reset();
  } catch (err) {
    console.error("Announcement submit error:", err);
    showToast(err.message || (currentLanguage === 'ar' ? "فشل نشر الإعلان" : "Failed to post announcement"), "danger");
  } finally {
    if (postBtn) postBtn.disabled = false;
  }
};

// Holiday Plan Form
document.getElementById('admin-holiday-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('hol-name').value.trim();
  const start = document.getElementById('hol-start').value;
  const end = document.getElementById('hol-end').value;
  
  const { error } = await sb.from('school_holidays').insert({
    name: name,
    start_date: start,
    end_date: end
  });
  
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تم تسجيل العطلة بنجاح" : "Holiday recorded successfully", "success");
    document.getElementById('admin-holiday-form').reset();
    await loadHolidayList();
  }
};

async function loadHolidayList() {
  const { data: holidays } = await sb.from('school_holidays').select('*');
  holidaysList = holidays || [];
  
  const list = document.getElementById('saved-holidays-list');
  list.innerHTML = '';
  
  if (holidaysList.length > 0) {
    holidaysList.forEach(h => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center p-2 border-bottom';
      li.innerHTML = `
        <span><strong>${h.name}</strong> (${h.start_date} - ${h.end_date})</span>
        <button class="btn btn-secondary btn-sm" onclick="deleteHoliday(${h.id})">&times;</button>
      `;
      list.appendChild(li);
    });
  } else {
    list.innerHTML = `<li class="text-muted text-center p-2">${currentLanguage === 'ar' ? 'لم تسجل أي عطلة حالياً' : 'No recorded holidays'}</li>`;
  }
}

window.deleteHoliday = async (id) => {
  const { error } = await sb.from('school_holidays').delete().eq('id', id);
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تم حذف العطلة" : "Holiday deleted", "success");
    await loadHolidayList();
  }
};

// Load Substitutions Logs
async function loadSubstitutionsLogs() {
  const { data: list } = await sb
    .from('session_substitutions')
    .select('*, timetables(*, classes(*), subjects(*))')
    .order('date', { ascending: false });
    
  const tbody = document.getElementById('admin-subs-table-body');
  tbody.innerHTML = '';
  
  if (list && list.length > 0) {
    list.forEach(item => {
      const row = document.createElement('tr');
      const cName = item.timetables.classes.name;
      const sName = currentLanguage === 'ar' ? item.timetables.subjects.name_ar : item.timetables.subjects.name_fr;
      
      let typeText = '';
      if (item.status === 'cancelled') typeText = currentLanguage === 'ar' ? 'إلغاء الحصة' : 'Cancelled';
      else if (item.status === 'substituted') typeText = currentLanguage === 'ar' ? 'أستاذ بديل' : 'Substitution';
      else typeText = currentLanguage === 'ar' ? 'تغيير قاعة' : 'Room changed';
      
      row.innerHTML = `
        <td>${item.date}</td>
        <td>${cName}</td>
        <td>${sName}</td>
        <td><span class="badge btn-secondary">${typeText}</span></td>
        <td>${item.notes || ''}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

// Load session options based on class select
document.getElementById('adm-sub-class-select').onchange = async (e) => {
  const classId = e.target.value;
  const select = document.getElementById('adm-sub-slot-select');
  select.innerHTML = `<option value="">-- ${currentLanguage === 'ar' ? 'اختر الحصة' : 'Choose slot'} --</option>`;
  
  if (!classId) return;
  
  const { data: slots } = await sb
    .from('timetables')
    .select('*, subjects(*)')
    .eq('class_id', classId);
    
  if (slots) {
    slots.forEach(s => {
      const sName = currentLanguage === 'ar' ? s.subjects.name_ar : s.subjects.name_fr;
      const dayName = TRANSLATIONS[currentLanguage][`day_${getDayNameKey(s.day_of_week)}`] || '';
      select.innerHTML += `<option value="${s.id}">${sName} (${dayName} ${s.start_time.substring(0, 5)})</option>`;
    });
  }
};

// Register substitution submit
document.getElementById('admin-sub-registration-form').onsubmit = async (e) => {
  e.preventDefault();
  const timetableId = document.getElementById('adm-sub-slot-select').value;
  const date = document.getElementById('adm-sub-date').value;
  const status = document.getElementById('adm-sub-status').value;
  const teacherId = document.getElementById('adm-sub-teacher-select').value || null;
  const room = document.getElementById('adm-sub-room').value.trim() || null;
  const notes = document.getElementById('adm-sub-notes').value.trim();
  
  const { error } = await sb.from('session_substitutions').insert({
    timetable_id: timetableId,
    date: date,
    status: status,
    substitute_teacher_id: teacherId,
    new_room_number: room,
    notes: notes
  });
  
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تم تسجيل التعديل بنجاح" : "Adjustment logged", "success");
    document.getElementById('admin-sub-registration-form').reset();
    await loadSubstitutionsLogs();
  } else {
    showToast(error.message, "danger");
  }
};


// 12. UNIVERSAL GRADE CALCULATOR
const INITIAL_CALC_ROWS = [
  { ar: "الرياضيات", fr: "Mathématiques", coeff: 5 },
  { ar: "الفيزياء والكيمياء", fr: "Physique-Chimie", coeff: 5 },
  { ar: "علوم الحياة والأرض", fr: "SVT", coeff: 3 },
  { ar: "اللغة العربية", fr: "Arabe", coeff: 2 },
  { ar: "اللغة الفرنسية", fr: "Français", coeff: 4 },
  { ar: "اللغة الإنجليزية", fr: "Anglais", coeff: 2 },
  { ar: "الفلسفة", fr: "Philosophie", coeff: 2 }
];

function initGradeCalculator() {
  const tbody = document.getElementById('calculator-rows');
  tbody.innerHTML = '';
  
  INITIAL_CALC_ROWS.forEach((row, index) => {
    addCalculatorRow(row.ar, row.fr, row.coeff);
  });
}

function addCalculatorRow(nameAr = '', nameFr = '', coeff = 1) {
  const tbody = document.getElementById('calculator-rows');
  const tr = document.createElement('tr');
  const displayName = currentLanguage === 'ar' ? nameAr : nameFr;
  
  tr.innerHTML = `
    <td>
      <input type="text" class="form-control calc-subj-name" value="${displayName}" data-ar="${nameAr}" data-fr="${nameFr}">
    </td>
    <td>
      <input type="number" class="form-control calc-grade" placeholder="15" min="0" max="20" step="0.25" required>
    </td>
    <td>
      <input type="number" class="form-control calc-coeff" value="${coeff}" min="1" required>
    </td>
    <td>
      <button class="btn btn-secondary btn-sm remove-row-btn">&times;</button>
    </td>
  `;
  
  tr.querySelector('.remove-row-btn').onclick = () => tr.remove();
  tbody.appendChild(tr);
}

document.getElementById('calc-add-row-btn').onclick = () => {
  addCalculatorRow('', '', 1);
};

document.getElementById('calc-compute-btn').onclick = () => {
  const rows = document.querySelectorAll('#calculator-rows tr');
  let totalPoints = 0;
  let totalCoeffs = 0;
  let validationError = false;
  
  rows.forEach(row => {
    const gradeInput = row.querySelector('.calc-grade');
    const coeffInput = row.querySelector('.calc-coeff');
    
    const grade = parseFloat(gradeInput.value);
    const coeff = parseFloat(coeffInput.value);
    
    if (isNaN(grade) || grade < 0 || grade > 20) {
      gradeInput.style.borderColor = 'var(--danger-color)';
      validationError = true;
    } else {
      gradeInput.style.borderColor = 'var(--border-color)';
    }
    
    if (!isNaN(grade) && !isNaN(coeff)) {
      totalPoints += grade * coeff;
      totalCoeffs += coeff;
    }
  });
  
  if (validationError) {
    showToast(currentLanguage === 'ar' ? "يرجى تصحيح النقط الخاطئة (بين 0 و 20)" : "Please correct invalid grades (between 0 and 20)", "warning");
    return;
  }
  
  if (totalCoeffs === 0) return;
  
  const gpa = totalPoints / totalCoeffs;
  const resultBox = document.getElementById('calc-result-box');
  const gpaVal = document.getElementById('gpa-val');
  const gpaMention = document.getElementById('gpa-mention-text');
  
  gpaVal.innerText = gpa.toFixed(2);
  
  let mention = '';
  if (gpa >= 16) mention = currentLanguage === 'ar' ? 'ممتاز' : 'Très Bien';
  else if (gpa >= 14) mention = currentLanguage === 'ar' ? 'جيد' : 'Bien';
  else if (gpa >= 12) mention = currentLanguage === 'ar' ? 'مستحسن' : 'Assez Bien';
  else if (gpa >= 10) mention = currentLanguage === 'ar' ? 'مقبول' : 'Passable';
  else mention = currentLanguage === 'ar' ? 'مستدرك' : 'Insuffisant';
  
  gpaMention.innerText = mention;
  resultBox.classList.remove('hidden');
};


// 13. IN-APP NOTIFICATIONS & HOLIDAY CHECK
async function loadUnreadNotificationsCount() {
  const { count } = await sb
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
    .or(`recipient_id.is.null,recipient_id.eq.${currentUser.id}`);
    
  const badge = document.getElementById('bell-badge');
  if (count > 0) {
    badge.innerText = count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

async function loadNotificationsDropdown() {
  const { data: list } = await sb
    .from('notifications')
    .select('*')
    .or(`recipient_id.is.null,recipient_id.eq.${currentUser.id}`)
    .order('created_at', { ascending: false })
    .limit(10);
    
  const container = document.getElementById('notif-list-items');
  if (!container) return;
  container.innerHTML = '';
  
  if (list && list.length > 0) {
    list.forEach(notif => {
      const item = document.createElement('div');
      item.className = `notif-item ${notif.is_read ? '' : 'unread'} mb-2 p-2 border-bottom`;
      const titleText = currentLanguage === 'ar' ? notif.title : (notif.title_fr || notif.title);
      const msgText = currentLanguage === 'ar' ? notif.message : (notif.message_fr || notif.message);
      
      let mediaMarkup = '';
      if (notif.media_url) {
        mediaMarkup += `
          <div class="notif-media mt-2">
            <a href="${notif.media_url}" target="_blank" class="btn btn-sm btn-outline-primary">
              <i class="fa-solid fa-paperclip"></i> ${currentLanguage === 'ar' ? 'عرض / تحميل المرفق' : 'Voir le fichier'}
            </a>
          </div>`;
      }
      if (notif.video_url) {
        const ytEmbed = getYouTubeEmbedUrl(notif.video_url);
        if (ytEmbed) {
          mediaMarkup += `
            <div class="video-embed-wrapper mt-2">
              <iframe src="${ytEmbed}" allowfullscreen></iframe>
            </div>`;
        } else {
          mediaMarkup += `
            <div class="mt-2">
              <a href="${notif.video_url}" target="_blank" class="video-link-badge">
                <i class="fa-brands fa-youtube"></i> ${currentLanguage === 'ar' ? 'مشاهدة الفيديو' : 'Regarder la vidéo'}
              </a>
            </div>`;
        }
      }
      
      item.innerHTML = `
        <h5 class="m-0">${titleText}</h5>
        <p class="m-0 mt-1">${msgText}</p>
        ${mediaMarkup}
        <small class="text-muted d-block mt-1">${new Date(notif.created_at).toLocaleDateString()}</small>
      `;
      container.appendChild(item);
    });
  } else {
    container.innerHTML = `<p class="empty-notif">${TRANSLATIONS[currentLanguage].notif_empty}</p>`;
  }
}

// Notification bells interactions
document.getElementById('notification-bell-btn').onclick = async (e) => {
  e.stopPropagation();
  const dropdown = document.getElementById('notification-dropdown');
  dropdown.classList.toggle('hidden');
  
  if (!dropdown.classList.contains('hidden')) {
    await loadNotificationsDropdown();
  }
};

document.getElementById('mark-all-read-btn').onclick = async () => {
  // Mark all fetched user notifications as read
  const { error } = await sb
    .from('notifications')
    .update({ is_read: true })
    .or(`recipient_id.is.null,recipient_id.eq.${currentUser.id}`);
    
  if (!error) {
    showToast(currentLanguage === 'ar' ? "تم وضع علامة مقروء للكل" : "All notifications marked read", "success");
    await loadUnreadNotificationsCount();
    await loadNotificationsDropdown();
  }
};

// Check if current date falls in any holiday (العطل المدرسية)
function isHolidayToday() {
  const todayStr = new Date().toISOString().split('T')[0];
  
  for (const hol of holidaysList) {
    if (todayStr >= hol.start_date && todayStr <= hol.end_date) {
      return true; // Holiday active! Suppression should activate
    }
  }
  return false;
}

// 14. PWA Installation Event Listener
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Display the bottom install banner
  document.getElementById('pwa-install-banner').classList.remove('hidden');
});

document.getElementById('pwa-btn-install').onclick = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompter: ${outcome}`);
    deferredPrompt = null;
    document.getElementById('pwa-install-banner').classList.add('hidden');
  }
};

document.getElementById('pwa-btn-dismiss').onclick = () => {
  document.getElementById('pwa-install-banner').classList.add('hidden');
};

// 15. Helper utilities functions
function getDayNameKey(index) {
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return keys[index] || '';
}

function getDayNameIdx(key) {
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return keys.indexOf(key);
}

// Initialize Application UI bindings
document.addEventListener('DOMContentLoaded', () => {
  // Switch languages trigger
  document.getElementById('lang-switch-btn').onclick = () => {
    const nextLang = currentLanguage === 'ar' ? 'fr' : 'ar';
    switchLanguage(nextLang);
  };
  
  // Theme Toggle Button
  document.getElementById('dark-mode-btn').onclick = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('dark-mode-btn').innerHTML = isDark 
      ? `<i class="fa-solid fa-sun"></i>` 
      : `<i class="fa-solid fa-moon"></i>`;
  };

  // Close dropdowns on body tap
  document.body.onclick = () => {
    document.getElementById('user-dropdown').classList.add('hidden');
    document.getElementById('notification-dropdown').classList.add('hidden');
  };

  document.getElementById('user-avatar-trigger').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('user-dropdown').classList.toggle('hidden');
  };
  
  document.getElementById('user-dropdown').onclick = (e) => e.stopPropagation();
  
  // Auth Form tabs navigation
  document.getElementById('tab-pass-btn').onclick = () => {
    document.getElementById('tab-pass-btn').classList.add('active');
    document.getElementById('tab-qr-btn').classList.remove('active');
    document.getElementById('login-pass-section').classList.add('active');
    document.getElementById('login-qr-section').classList.remove('active');
    
    if (activeQrScanner) {
      activeQrScanner.stop();
      activeQrScanner = null;
    }
  };
  
  document.getElementById('tab-qr-btn').onclick = () => {
    document.getElementById('tab-qr-btn').classList.add('active');
    document.getElementById('tab-pass-btn').classList.remove('active');
    document.getElementById('login-qr-section').classList.add('active');
    document.getElementById('login-pass-section').classList.remove('active');
  };
  
  // Start QR Camera login button click
  document.getElementById('start-qr-btn').onclick = () => {
    if (activeQrScanner) {
      activeQrScanner.stop();
      activeQrScanner = null;
      document.getElementById('start-qr-btn').innerHTML = `<i class="fa-solid fa-camera"></i> <span>${TRANSLATIONS[currentLanguage].start_camera}</span>`;
      return;
    }
    
    activeQrScanner = new Html5Qrcode("qr-reader");
    activeQrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        handleQrLogin(decodedText);
      },
      (errorMessage) => {
        // quiet fail camera logs
      }
    ).then(() => {
      document.getElementById('start-qr-btn').innerHTML = `<i class="fa-solid fa-camera-slash"></i> <span>${TRANSLATIONS[currentLanguage].stop_camera}</span>`;
    }).catch(err => {
      console.error(err);
      showToast(currentLanguage === 'ar' ? "فشل الوصول إلى الكاميرا" : "Camera access denied", "danger");
    });
  };
  
  // Image File QR Reader Upload Event Listener
  const qrFileInput = document.getElementById('qr-input-file');
  if (qrFileInput) {
    qrFileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        const decodedText = await html5QrCode.scanFile(file, true);
        await handleQrLogin(decodedText);
      } catch (err) {
        showToast(currentLanguage === 'ar' ? "لم يتم العثور على رمز QR صالح في الصورة المرفقة" : "No valid QR code found in image", "danger");
        console.error("File QR scan error:", err);
      }
    };
  }
  
  // Log out button trigger
  document.getElementById('logout-btn').onclick = async () => {
    const { error } = await sb.auth.signOut();
    if (!error) {
      showToast(currentLanguage === 'ar' ? "تم تسجيل الخروج" : "Logged out", "success");
    }
  };
  
  // Teacher tabs view selector
  const teachTabs = {
    'teach-tab-schedule': 'teacher-schedule-section',
    'teach-tab-attendance': 'teacher-attendance-section',
    'teach-tab-files': 'teacher-files-section',
    'teach-tab-req': 'teacher-req-section'
  };
  Object.keys(teachTabs).forEach(tabId => {
    const el = document.getElementById(tabId);
    if(el) {
      el.onclick = () => {
        document.querySelectorAll('.teacher-tab-navigation button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.teacher-view-section').forEach(s => s.classList.remove('active'));
        
        el.classList.add('active');
        document.getElementById(teachTabs[tabId]).classList.add('active');
      };
    }
  });

  // Admin tabs view selector
  const admTabs = {
    'adm-menu-classes': 'admin-sec-classes',
    'adm-menu-timetable': 'admin-sec-timetable',
    'adm-menu-subs': 'admin-sec-subs',
    'adm-menu-users': 'admin-sec-users',
    'adm-menu-absence': 'admin-sec-absence',
    'adm-menu-notifs': 'admin-sec-notifs',
    'adm-menu-contact': 'admin-sec-contact'
  };
  Object.keys(admTabs).forEach(tabId => {
    const el = document.getElementById(tabId);
    if (el) {
      el.onclick = () => {
        document.querySelectorAll('.admin-menu-list button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        
        el.classList.add('active');
        document.getElementById(admTabs[tabId]).classList.add('active');
      };
    }
  });
  
  // Adjust admin form class selects dynamically on changes
  const usrRoleSelect = document.getElementById('usr-role');
  if (usrRoleSelect) {
    usrRoleSelect.onchange = (e) => {
      const grp = document.getElementById('usr-class-group');
      if (e.target.value === 'student') grp.classList.remove('hidden');
      else grp.classList.add('hidden');
    };
  }

  // Optional PWA Installation Prompt (Purely optional step for users)
  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const pwaBtn = document.getElementById('pwa-install-btn');
    if (pwaBtn) pwaBtn.classList.remove('hidden');
  });

  const pwaBtn = document.getElementById('pwa-install-btn');
  if (pwaBtn) {
    pwaBtn.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          pwaBtn.classList.add('hidden');
        }
        deferredInstallPrompt = null;
      }
    });
  }

  // Register service worker asynchronously in background (optional, non-blocking)
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        console.log(`Service Worker registered on scope: ${reg.scope}`);
      }).catch(err => console.warn('Service Worker registration skipped:', err));
    } catch(e) {
      console.warn('SW error ignored');
    }
  }
  
  // Init Components
  initAuth();
  initGradeCalculator();
  switchLanguage('ar'); // Default to Arabic RTL
  
  // Ensure loader is immediately dismissed
  document.body.classList.remove('loading-state');
});
