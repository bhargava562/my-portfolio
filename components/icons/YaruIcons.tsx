import React from 'react';

export const YaruFolderIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M5 20C5 14.4772 9.47715 10 15 10H40L50 20H85C90.5228 20 95 24.4772 95 30V80C95 85.5228 90.5228 90 85 90H15C9.47715 90 5 85.5228 5 80V20Z"
      fill="#E95420"
    />
    <path
      d="M5 30C5 24.4772 9.47715 20 15 20H85C90.5228 20 95 24.4772 95 30V80C95 85.5228 90.5228 90 85 90H15C9.47715 90 5 85.5228 5 80V30Z"
      fill="url(#folder-gradient)"
    />
    <defs>
      <linearGradient id="folder-gradient" x1="50" y1="20" x2="50" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E95420" />
        <stop offset="1" stopColor="#C73E0F" />
      </linearGradient>
    </defs>
  </svg>
);

export const YaruFileIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20 10C14.4772 10 10 14.4772 10 20V80C10 85.5228 14.4772 90 20 90H80C85.5228 90 90 85.5228 90 80V30L70 10H20Z"
      fill="#F5F5F5"
    />
    <path
      d="M70 10V30H90"
      fill="#DCDCDC"
    />
    <rect x="25" y="40" width="50" height="4" rx="2" fill="#AEA79F" />
    <rect x="25" y="50" width="50" height="4" rx="2" fill="#AEA79F" />
    <rect x="25" y="60" width="30" height="4" rx="2" fill="#AEA79F" />
  </svg>
);

export const YaruAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="45" fill="#E95420" />
    <path
      d="M70 50C70 61.0457 61.0457 70 50 70C38.9543 70 30 61.0457 30 50C30 38.9543 38.9543 30 50 30C61.0457 30 70 38.9543 70 50Z"
      fill="white"
    />
  </svg>
);

export const YaruLinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="20" fill="#0077B5" />
    <path d="M25 35H35V75H25V35ZM30 20C27 20 25 22 25 25C25 28 27 30 30 30C33 30 35 28 35 25C35 22 33 20 30 20ZM40 35H50V40C52 37 55 35 60 35C70 35 75 42 75 55V75H65V57C65 50 62 45 57 45C52 45 50 50 50 57V75H40V35Z" fill="white" />
  </svg>
);

export const YaruGithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="20" fill="#181717" />
    <path d="M50 15C30 15 15 30 15 50C15 65 25 78 40 83C42 83 43 82 43 80V74C32 76 30 69 30 69C28 65 26 64 26 64C22 62 26 62 26 62C30 62 32 66 32 66C36 72 42 70 44 69C44 66 45 64 47 63C38 62 29 59 29 44C29 40 30 36 33 33C32 32 31 28 33 23C33 23 37 22 45 27C49 26 53 26 57 27C65 22 69 23 69 23C71 28 70 32 69 33C72 36 73 40 73 44C73 59 64 62 55 63C57 65 59 69 59 75V80C59 82 60 83 62 83C77 78 87 65 87 50C87 30 72 15 50 15Z" fill="white" />
  </svg>
);

