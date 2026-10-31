export type Field = { key: string; label: string; type?: 'text' | 'number' | 'textarea' | 'email'; req?: boolean }
export const applicantFields: Field[] = [
  { key: 'name', label: 'Full name', req: true }, { key: 'age', label: 'Age', type: 'number' },
  { key: 'degree', label: 'Degree' }, { key: 'graduation_year', label: 'Graduation year', type: 'number' },
  { key: 'email', label: 'Gmail address', type: 'email' }, { key: 'phone', label: 'Phone number' },
  { key: 'instagram', label: 'Instagram ID' }, { key: 'facebook', label: 'Facebook ID' }, { key: 'snapchat', label: 'Snapchat ID' },
  { key: 'intro', label: 'Self-introduction', type: 'textarea' }, { key: 'why_job', label: 'Why do you want the job?', type: 'textarea' },
  { key: 'achievements', label: 'Achievements', type: 'textarea' }, { key: 'dream_career', label: 'Dream career goal', type: 'textarea' },
]
export const postingFields: Field[] = [
  { key: 'title', label: 'Role title', req: true }, { key: 'company', label: 'Company' }, { key: 'location', label: 'Location' },
  { key: 'looking_for', label: 'Who are you looking for?', type: 'textarea' },
]
export const settingFields: Field[] = [
  { key: 'hero_title', label: 'Hero title' }, { key: 'hero_subtitle', label: 'Hero subtitle', type: 'textarea' },
  { key: 'announcement', label: 'Announcement banner (empty = hidden)' }, { key: 'footer_text', label: 'Footer text' },
]
