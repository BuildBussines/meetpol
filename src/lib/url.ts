export const fixUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : 'https://' + u)
