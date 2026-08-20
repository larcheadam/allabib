import urllib.request, time, sys

time.sleep(1)
try:
    r = urllib.request.urlopen('http://localhost:5177/')
    html = r.read().decode('utf-8')
    
    checks = [
        ('logo.jpg in HTML', 'logo.jpg' in html),
        ('No logo.svg in HTML', 'logo.svg' not in html),
        ('Supabase CDN loaded', 'supabase-js' in html),
        ('app.js linked', 'app.js' in html),
        ('styles.css linked', 'styles.css' in html),
        ('lang=ar attr', 'lang="ar"' in html),
        ('dir=rtl attr', 'dir="rtl"' in html),
        ('manifest.json linked', 'manifest.json' in html),
        ('Arabic text present', '\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0644\u0628\u064a\u0628' in html),
        ('Login form exists', 'login-form' in html),
        ('QR tab exists', 'tab-qr-btn' in html),
        ('Calculator view', 'view-calculator' in html),
        ('Directory view', 'view-directory' in html),
        ('Admin view', 'view-admin' in html),
        ('Teacher view', 'view-teacher' in html),
        ('Student view', 'view-student' in html),
        ('Loader wrapper', 'loader-wrapper' in html),
        ('Bell notifications', 'bell-area' in html),
        ('Dark mode toggle', 'dark-mode-btn' in html),
        ('Lang switch btn', 'lang-switch-btn' in html),
        ('Assistance msg AR', '\u0625\u0630\u0627 \u0648\u0627\u062c\u0647\u062a\u0643\u0645' in html),
        ('Assistance msg FR', 'Si vous rencontrez' in html),
        ('No map section', 'school-map' not in html),
    ]
    
    passed = sum(1 for _, v in checks if v)
    total = len(checks)
    
    print(f'=== HTML PAGE VERIFICATION: {passed}/{total} checks passed ===')
    for name, result in checks:
        status = 'PASS' if result else 'FAIL'
        print(f'  [{status}] {name}')

except Exception as e:
    print(f'Server connection error: {e}')
    sys.exit(1)
