export type Field = { key: string; label: string; type?: 'text' | 'number' | 'textarea' | 'email' | 'select' | 'checkbox' | 'color'; req?: boolean; options?: string[] }
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
export const categoryFields: Field[] = [
  { key: 'name', label: 'Category name', req: true }, { key: 'icon', label: 'Icon (emoji)' },
  { key: 'kind', label: 'Type', type: 'select', options: ['generic', 'templates', 'donations', 'fund'] },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'coming_soon', label: '🚧 Enable coming soon (visitors see only a poster; admin & testers see the real page)', type: 'checkbox' },
  { key: 'poster_title', label: 'Poster title (default: Coming Soon)' }, { key: 'poster_text', label: 'Poster text', type: 'textarea' },
  { key: 'poster_image', label: 'Poster image URL (optional)' },
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

export const homeDefaults: Record<string, string> = {
  hero_badge: 'Talent × Opportunity', hero_title: 'Where *talent* meets opportunity', hero_subtitle: 'MeetPol connects ambitious job seekers with employers who are looking for them.',
  box1_icon: '🎓', box1_title: 'Job seekers', box1_text: 'Build one rich profile and let employers find you.', box1_color: '#c8f432', box1_link: '',
  box2_icon: '🏢', box2_title: 'Employers', box2_text: 'Review applicant profiles and post exactly who you want to hire.', box2_color: '#ffffff', box2_link: '',
  box3_icon: '🔒', box3_title: 'Private by design', box3_text: 'Row Level Security keeps your data editable only by you.', box3_color: '#8aa82a', box3_link: '',
}
export const siteFields: Field[] = [
  { key: 'site_name', label: 'Site name (top-left logo & browser tab)' },
  { key: 'announcement', label: 'Announcement banner (empty = hidden)' }, { key: 'footer_text', label: 'Footer text' },
]
// Homepage: headline + the three boxes (icon, title, text, optional link, accent color)
export const homeFields: Field[] = [
  { key: 'hero_badge', label: 'Small label above the title' }, { key: 'hero_title', label: 'Homepage title (put *stars* around the word to highlight it in lime)' }, { key: 'hero_subtitle', label: 'Homepage subtitle', type: 'textarea' },
  ...[1, 2, 3].flatMap(i => [
    { key: `box${i}_icon`, label: `Box ${i} — icon (emoji)` }, { key: `box${i}_title`, label: `Box ${i} — title` },
    { key: `box${i}_text`, label: `Box ${i} — text`, type: 'textarea' as const },
    { key: `box${i}_link`, label: `Box ${i} — link (optional, e.g. /postings or https://…)` },
    { key: `box${i}_color`, label: `Box ${i} — accent color`, type: 'color' as const },
  ]),
]
