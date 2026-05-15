const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  credentials: "이메일",
};

export function getSignupMethodLabels(user: {
  password: string | null;
  accounts: { provider: string }[];
}): string[] {
  const labels: string[] = [];
  if (user.password && user.password.length > 0) {
    labels.push("이메일");
  }
  for (const account of user.accounts) {
    const label = PROVIDER_LABELS[account.provider] ?? account.provider;
    if (!labels.includes(label)) {
      labels.push(label);
    }
  }
  if (labels.length === 0) {
    labels.push("—");
  }
  return labels;
}

export function formatSignupMethods(user: {
  password: string | null;
  accounts: { provider: string }[];
}): string {
  return getSignupMethodLabels(user).join(" · ");
}
