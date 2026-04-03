const IMAGE_CONFIG: Record<string, { imageField: string, fallback: string }> = {
  profile: { imageField: "profile_image_path", fallback: "/profile/profile.webp" },
  projects: { imageField: "image_url", fallback: "/projects/default.webp" },
  social_profiles: { imageField: "icon_path", fallback: "/socials/default.webp" }
};

export function getImageField(dataset: string) {
  return IMAGE_CONFIG[dataset]?.imageField;
}

export function resolveImagePath(dataset: string, record: Record<string, unknown>) {
  const field = getImageField(dataset);

  if (!field) return null;

  return (record[field] as string) || null;
}