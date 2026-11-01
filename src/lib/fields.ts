export type Field = { key: string; label: string; type?: 'text' | 'number' | 'textarea' | 'email' | 'select'; req?: boolean; options?: string[] }
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
  { key: 'site_name', label: 'Site name (top-left logo & browser tab)' },
  { key: 'hero_title', label: 'Homepage title' }, { key: 'hero_subtitle', label: 'Homepage subtitle', type: 'textarea' },
  { key: 'announcement', label: 'Announcement banner (empty = hidden)' }, { key: 'footer_text', label: 'Footer text' },
]
export const categoryFields: Field[] = [
  { key: 'name', label: 'Category name', req: true }, { key: 'icon', label: 'Icon (emoji)' },
  { key: 'kind', label: 'Type', type: 'select', options: ['generic', 'templates', 'donations', 'fund'] },
  { key: 'description', label: 'Description', type: 'textarea' },
]
export const itemFields: Field[] = [
  { key: 'title', label: 'Title', req: true }, { key: 'link_url', label: 'Link (for templates: the website to preview)' },
  { key: 'image_url', label: 'Image URL (optional)' }, { key: 'description', label: 'Description', type: 'textarea' },
]
export const CURRENCIES = ['USD', 'PKR', 'EUR', 'GBP', 'INR', 'AED', 'SAR']
export const requestFields: Field[] = [
  { key: 'applicant_name', label: 'Your name', req: true }, { key: 'age', label: 'Age', type: 'number' },
  { key: 'reason', label: 'Reason for needing donations', req: true },
  { key: 'description', label: 'Description (tell your story)', type: 'textarea' },
  { key: 'phone', label: 'Phone number' }, { key: 'email', label: 'Gmail address', type: 'email' },
  { key: 'bank_account', label: 'Bank account / JazzCash / Easypaisa details (where supporters send money)', type: 'textarea', req: true },
  { key: 'goal_amount', label: 'Goal amount', type: 'number', req: true }, { key: 'currency', label: 'Currency', type: 'select', options: CURRENCIES },
]
export const fundFields: Field[] = [
  { key: 'amount', label: 'Amount you are sending', type: 'number', req: true },
  { key: 'reference', label: 'Transaction ID / reference (optional)' },
  { key: 'message', label: 'Message (optional)', type: 'textarea' },
]
