const iconProps = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  "aria-hidden": "true",
  focusable: "false",
};

export const PlayIcon = () => (
  <svg {...iconProps} fill="none">
    <path d="M8 5.4v13.2L19 12 8 5.4Z" fill="currentColor" />
  </svg>
);

export const PauseIcon = () => (
  <svg {...iconProps} fill="none">
    <rect x="7" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
  </svg>
);

export const RestartIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M5 8.5V4.8m0 0h3.7M5 4.8l3.1 3.1a7 7 0 1 1-1.9 7.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const VolumeIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M4 9.5h3l4-3.5v12l-4-3.5H4v-5Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M15 9a4.2 4.2 0 0 1 0 6M17.6 6.6a7.6 7.6 0 0 1 0 10.8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const MutedIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M4 9.5h3l4-3.5v12l-4-3.5H4v-5Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="m15.2 9.4 4.4 5.2m0-5.2-4.4 5.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

export const LogOutIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10M14.5 8.5 18 12l-3.5 3.5M10.5 12H18"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CameraIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1-1.6h6.6l1 1.6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12.4" r="3.1" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const AlertIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M12 4.5 21 20H3L12 4.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M12 9.5v4.6M12 17.1v.1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const MusicIcon = () => (
  <svg {...iconProps} width="24" height="24" fill="none">
    <path
      d="M9 17.5V6.2l9-2v10.6M9 17.5a2.8 2.8 0 1 1-2.8-2.8c.7 0 1.4.3 1.9.7M18 14.8a2.8 2.8 0 1 1-2.8-2.8c.7 0 1.4.3 1.9.7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
