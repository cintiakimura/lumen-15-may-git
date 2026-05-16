import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lumen } from '@/api/lumenClient';
import { createPageUrl } from '@/utils';
import { isDemoMode, withDemoParam } from '@/lib/demoMode';
import authService from '@/components/services/authService';
import storageService from '@/components/services/storageService';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState('');
  const [vat, setVat] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [teachers, setTeachers] = useState(['']);
  const [logo, setLogo] = useState('');
  const [color, setColor] = useState('#00c600');
  const [font, setFont] = useState('Inter');
  const navigate = useNavigate();

  const handleAddTeacher = () => {
    setTeachers([...teachers, '']);
  };

  const handleRemoveTeacher = (index) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const handleTeacherChange = (index, value) => {
    const newTeachers = [...teachers];
    newTeachers[index] = value;
    setTeachers(newTeachers);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async () => {
    const validTeachers = teachers.filter(t => t);
    const onboardingData = {
      company,
      vat,
      address,
      email,
      phone,
      teachers: validTeachers,
      branding: { logo, color, font }
    };
    
    localStorage.setItem('onboarding', JSON.stringify(onboardingData));
    
    // Send mock invite emails to teachers
    validTeachers.forEach(teacherEmail => {
      console.log(`Mock email sent to ${teacherEmail}: You've been invited to teach at ${company}`);
    });
    
    if (isDemoMode()) {
      authService.completeOnboarding({ logo, color, font });
      storageService.setOnboarded(true);
      const user = authService.getCurrentUser();
      const page = user?.role === 'teacher' ? 'TeacherDashboard' : 'StudentDashboard';
      navigate(withDemoParam(createPageUrl(page)));
      return;
    }

    await lumen.auth.updateMe({ onboarded: true });

    const user = await lumen.auth.me();
    if (user?.role === 'teacher') {
      navigate(createPageUrl('TeacherDashboard'));
    } else {
      navigate(createPageUrl('StudentDashboard'));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'hsl(var(--background))',
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: 'hsl(var(--primary))', fontSize: '32px', marginBottom: '32px', fontWeight: '100' }}>
          Setup Your Academy
        </h1>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              style={{
                height: '4px',
                flex: 1,
                background: s <= step ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                borderRadius: '2px',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '12px',
                color: 'hsl(var(--foreground))',
                fontSize: '14px'
              }}
            />
            <input
              type="text"
              placeholder="VAT Number"
              value={vat}
              onChange={(e) => setVat(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '12px',
                color: 'hsl(var(--foreground))',
                fontSize: '14px'
              }}
            />
            <textarea
              placeholder="Billing Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '12px',
                color: 'hsl(var(--foreground))',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '12px',
                color: 'hsl(var(--foreground))',
                fontSize: '14px'
              }}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '12px',
                color: 'hsl(var(--foreground))',
                fontSize: '14px'
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'hsl(var(--foreground))' }}>Add Teacher Emails</p>
            {teachers.map((teacher, idx) => (
              <input
                key={idx}
                type="email"
                placeholder="teacher@example.com"
                value={teacher}
                onChange={(e) => handleTeacherChange(idx, e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px'
                }}
              />
            ))}
            <button
              onClick={handleAddTeacher}
              style={{
                background: 'transparent',
                border: '1px dashed hsl(var(--border))',
                borderRadius: '12px',
                padding: '12px',
                color: 'hsl(var(--primary))',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              + Add Teacher
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ color: 'hsl(var(--foreground))', marginBottom: '8px' }}>Logo</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
              {logo && (
                <img src={logo} alt="Logo" style={{
                  marginTop: '12px',
                  maxWidth: '100px',
                  borderRadius: '8px'
                }} />
              )}
            </div>
            <div>
              <p style={{ color: 'hsl(var(--foreground))', marginBottom: '8px' }}>Accent Color</p>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              />
            </div>
            <div>
              <p style={{ color: 'hsl(var(--foreground))', marginBottom: '8px' }}>Font</p>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="Inter">Inter</option>
                <option value="Akkurat">Akkurat</option>
                <option value="System">System</option>
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'hsl(var(--foreground))', marginBottom: '8px' }}>Add Teachers</p>
            {teachers.map((teacher, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  placeholder="teacher@example.com"
                  value={teacher}
                  onChange={(e) => handleTeacherChange(idx, e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'hsl(var(--foreground))',
                    fontSize: '14px'
                  }}
                />
                {teachers.length > 1 && (
                  <button
                    onClick={() => handleRemoveTeacher(idx)}
                    style={{
                      background: 'transparent',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: 'hsl(var(--foreground))',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddTeacher}
              style={{
                background: 'transparent',
                border: '1px dashed hsl(var(--border))',
                borderRadius: '12px',
                padding: '12px',
                color: 'hsl(var(--primary))',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              + Add Teacher
            </button>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '12px',
                color: 'hsl(var(--foreground))',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              style={{
                flex: 1,
                background: 'hsl(var(--primary))',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                color: '#000000',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              style={{
                flex: 1,
                background: 'hsl(var(--primary))',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                color: '#000000',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}