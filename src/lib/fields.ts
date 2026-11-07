import { ICON_CHOICES } from '../components/Icon'
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
  { key: 'name', label: 'Category name', req: true }, { key: 'icon', label: 'Icon', type: 'select', options: ICON_CHOICES },
  { key: 'kind', label: 'Type', type: 'select', options: ['generic', 'templates', 'donations', 'fund'] },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'coming_soon', label: 'Enable coming soon (visitors see only a poster; admin & testers see the real page)', type: 'checkbox' },
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
  box1_icon: 'graduation-cap', box1_title: 'Job seekers', box1_text: 'Build one rich profile and let employers find you.', box1_color: '#c8f432', box1_link: '',
  box2_icon: 'building', box2_title: 'Employers', box2_text: 'Review applicant profiles and post exactly who you want to hire.', box2_color: '#ffffff', box2_link: '',
  box3_icon: 'lock', box3_title: 'Private by design', box3_text: 'Row Level Security keeps your data editable only by you.', box3_color: '#8aa82a', box3_link: '',
}
export const siteFields: Field[] = [
  { key: 'site_name', label: 'Site name (top-left logo & browser tab)' },
  { key: 'announcement', label: 'Announcement banner (empty = hidden)' }, { key: 'footer_text', label: 'Footer text' },
]
// Homepage: headline + the three boxes (icon, title, text, optional link, accent color)
export const homeFields: Field[] = [
  { key: 'hero_badge', label: 'Small label above the title' }, { key: 'hero_title', label: 'Homepage title (put *stars* around the word to highlight it in lime)' }, { key: 'hero_subtitle', label: 'Homepage subtitle', type: 'textarea' },
  ...[1, 2, 3].flatMap(i => [
    { key: `box${i}_icon`, label: `Box ${i} — icon`, type: 'select' as const, options: ICON_CHOICES }, { key: `box${i}_title`, label: `Box ${i} — title` },
    { key: `box${i}_text`, label: `Box ${i} — text`, type: 'textarea' as const },
    { key: `box${i}_link`, label: `Box ${i} — link (optional, e.g. /postings or https://…)` },
    { key: `box${i}_color`, label: `Box ${i} — accent color`, type: 'color' as const },
  ]),
]

// Google Fonts specs (only weights each font really has) + the heading weight to use
export const HEAD_FONTS: Record<string, { spec: string; w: number }> = {
  'Instrument Serif': { spec: 'Instrument+Serif:ital@0;1', w: 400 }, 'Playfair Display': { spec: 'Playfair+Display:ital,wght@0,400;1,400', w: 400 },
  'DM Serif Display': { spec: 'DM+Serif+Display:ital@0;1', w: 400 }, 'Lora': { spec: 'Lora:ital,wght@0,400;1,400', w: 400 },
  'Space Grotesk': { spec: 'Space+Grotesk:wght@700', w: 700 }, 'Poppins': { spec: 'Poppins:wght@700', w: 700 },
  'Montserrat': { spec: 'Montserrat:wght@700', w: 700 }, 'Outfit': { spec: 'Outfit:wght@700', w: 700 }, 'Inter': { spec: 'Inter:wght@700', w: 700 },
}
export const BODY_FONTS: Record<string, string> = {
  'Inter': 'Inter:wght@400;500;600;700', 'Poppins': 'Poppins:wght@400;500;600;700', 'DM Sans': 'DM+Sans:wght@400;500;700', 'Manrope': 'Manrope:wght@400;500;700',
  'Outfit': 'Outfit:wght@400;500;700', 'Roboto': 'Roboto:wght@400;500;700', 'Lora': 'Lora:wght@400;500;700', 'Space Grotesk': 'Space+Grotesk:wght@400;500;700',
}
export const designDefaults: Record<string, string> = {
  font_heading: 'Instrument Serif', font_body: 'Inter', text_size: 'Normal', heading_size: 'Normal',
  text_color: '#ffffff', muted_color: '#a1a1aa', accent_color: '#c8f432',
}
export const designFields: Field[] = [
  { key: 'font_heading', label: 'Heading font', type: 'select', options: Object.keys(HEAD_FONTS) },
  { key: 'font_body', label: 'Body text font', type: 'select', options: Object.keys(BODY_FONTS) },
  { key: 'text_size', label: 'Text size', type: 'select', options: ['Small', 'Normal', 'Large', 'Extra large'] },
  { key: 'heading_size', label: 'Headline size', type: 'select', options: ['Compact', 'Normal', 'Large', 'Huge'] },
  { key: 'text_color', label: 'Text color', type: 'color' }, { key: 'muted_color', label: 'Secondary text color', type: 'color' },
  { key: 'accent_color', label: 'Accent color (buttons, highlights, 3D shape)', type: 'color' },
]
