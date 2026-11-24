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

export const PreviousIcon = () => (
  <svg {...iconProps} fill="none">
    <path d="M18.5 5.8v12.4L8.8 12l9.7-6.2Z" fill="currentColor" />
    <rect x="5" y="5.5" width="2" height="13" rx="1" fill="currentColor" />
  </svg>
);

export const NextIcon = () => (
  <svg {...iconProps} fill="none">
    <path d="M5.5 5.8v12.4L15.2 12 5.5 5.8Z" fill="currentColor" />
    <rect x="17" y="5.5" width="2" height="13" rx="1" fill="currentColor" />
  </svg>
);

export const ShuffleIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M4 7h3.2c1.5 0 2.6.7 3.5 2l3 4.4c.9 1.3 2 2 3.5 2H20m0 0-2.4-2.4M20 15.4l-2.4 2.4M4 17h3.2c1.5 0 2.6-.7 3.5-2M14.5 8.6c.9-1 1.9-1.6 3.2-1.6H20m0 0-2.4-2.4M20 7l-2.4 2.4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const UploadIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M12 16V5m0 0L7.8 9.2M12 5l4.2 4.2M5 15v3.2A1.8 1.8 0 0 0 6.8 20h10.4a1.8 1.8 0 0 0 1.8-1.8V15"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SettingsIcon = () => (
  <svg {...iconProps} fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="m12 3.8 1.2 1.9 2.2-.5.6 2.2 2.1.9-.9 2.1 1.5 1.6-1.5 1.6.9 2.1-2.1.9-.6 2.2-2.2-.5-1.2 1.9-1.2-1.9-2.2.5-.6-2.2-2.1-.9.9-2.1L5.3 12l1.5-1.6-.9-2.1 2.1-.9.6-2.2 2.2.5L12 3.8Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const DownloadIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M12 4v10m0 0 3.7-3.7M12 14l-3.7-3.7M5 16.5v1.7A1.8 1.8 0 0 0 6.8 20h10.4a1.8 1.8 0 0 0 1.8-1.8v-1.7"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LockIcon = () => (
  <svg {...iconProps} fill="none">
    <rect
      x="5"
      y="10.5"
      width="14"
      height="9.5"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const TrashIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M5 7.5h14M9.5 7.5v-1A1.5 1.5 0 0 1 11 5h2a1.5 1.5 0 0 1 1.5 1.5v1M7 7.5l.7 10.2a1.8 1.8 0 0 0 1.8 1.8h5a1.8 1.8 0 0 0 1.8-1.8L17 7.5M10 11v5M14 11v5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const QueueIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="M4 7h11M4 12h8M4 17h6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path d="M17 9.2v8.3l4-2.8-4-5.5Z" fill="currentColor" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...iconProps} fill="none">
    <path
      d="m6 6 12 12M18 6 6 18"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);
