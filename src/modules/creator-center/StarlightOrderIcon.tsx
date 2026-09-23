export default function StarlightOrderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <mask
        id="starlight-order-mask"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="4"
        y="0"
        width="8"
        height="5"
      >
        <rect
          x="4.625"
          y="0.666626"
          width="6.75"
          height="4.00793"
          rx="1.3"
          fill="url(#starlight-order-clip)"
        />
      </mask>
      <g mask="url(#starlight-order-mask)">
        <rect x="2" y="2" width="12" height="13.25" fill="url(#starlight-order-mask-body)" />
      </g>
      <rect
        x="2"
        y="2"
        width="12"
        height="13.25"
        rx="2.5"
        fill="url(#starlight-order-body)"
      />
      <rect
        x="4.625"
        y="0.666626"
        width="6.75"
        height="4.00793"
        rx="1.3"
        fill="url(#starlight-order-clip-shine)"
      />
      <rect
        x="4.625"
        y="0.666626"
        width="6.75"
        height="4.00793"
        rx="1.3"
        fill="url(#starlight-order-clip-fill)"
      />
      <path
        d="M4.625 2.12623C4.625 1.32011 5.20703 0.666626 5.925 0.666626H10.075C10.793 0.666626 11.375 1.32011 11.375 2.12623V3.70702C11.375 4.51314 10.793 5.16663 10.075 5.16663H5.925C5.20703 5.16663 4.625 4.51314 4.625 3.70702V2.12623Z"
        fill="url(#starlight-order-clip-inner)"
      />
      <path
        d="M10.0752 4.70235V5.20236H5.9248V4.70235H10.0752ZM10.875 3.90252V1.96647C10.8749 1.52478 10.5169 1.16675 10.0752 1.16664H5.9248C5.48313 1.16675 5.12511 1.52478 5.125 1.96647V3.90252C5.12504 4.34426 5.48309 4.70224 5.9248 4.70235V5.20236C5.25179 5.20226 4.69839 4.69083 4.63184 4.03533L4.625 3.90252V1.96647C4.62511 1.24863 5.20699 0.666732 5.9248 0.666626H10.0752L10.208 0.673462C10.8634 0.740078 11.3749 1.29348 11.375 1.96647V3.90252L11.3682 4.03533C11.306 4.64715 10.8198 5.13334 10.208 5.19553L10.0752 5.20236V4.70235C10.5169 4.70224 10.875 4.34426 10.875 3.90252Z"
        fill="url(#starlight-order-clip-edge)"
      />
      <path
        opacity="0.8"
        d="M10.4 8C10.7314 8 11 8.26863 11 8.6C11 8.93137 10.7314 9.2 10.4 9.2H5.6C5.26863 9.2 5 8.93137 5 8.6C5 8.26863 5.26863 8 5.6 8H10.4Z"
        fill="url(#starlight-order-line-wide)"
      />
      <path
        opacity="0.6"
        d="M8.5 11C8.77614 11 9 11.2239 9 11.5C9 11.7761 8.77614 12 8.5 12H5.5C5.22386 12 5 11.7761 5 11.5C5 11.2239 5.22386 11 5.5 11H8.5Z"
        fill="url(#starlight-order-line-short)"
      />
      <defs>
        <linearGradient
          id="starlight-order-clip"
          x1="8"
          y1="0.666626"
          x2="8"
          y2="4.67452"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E3E3E5" stopOpacity="0.6" />
          <stop offset="1" stopColor="#BBBBC0" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient
          id="starlight-order-mask-body"
          x1="8"
          y1="2"
          x2="8"
          y2="15.25"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#575757" />
          <stop offset="1" stopColor="#151515" />
        </linearGradient>
        <linearGradient
          id="starlight-order-body"
          x1="8"
          y1="1.59829"
          x2="8"
          y2="14.4467"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#575757" />
          <stop offset="1" stopColor="#151515" />
        </linearGradient>
        <linearGradient
          id="starlight-order-clip-shine"
          x1="8"
          y1="0.666626"
          x2="8"
          y2="4.67456"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="starlight-order-clip-fill"
          x1="8"
          y1="0.666626"
          x2="8"
          y2="4.67452"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E3E3E5" stopOpacity="0.6" />
          <stop offset="1" stopColor="#BBBBC0" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient
          id="starlight-order-clip-inner"
          x1="8"
          y1="0.666626"
          x2="8"
          y2="4.97063"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EEEEEE" />
          <stop offset="1" stopColor="#686868" />
        </linearGradient>
        <linearGradient
          id="starlight-order-clip-edge"
          x1="8"
          y1="5"
          x2="8"
          y2="-0.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="starlight-order-line-wide"
          x1="5.09744"
          y1="8.47407"
          x2="10.9026"
          y2="8.47407"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <linearGradient
          id="starlight-order-line-short"
          x1="5.06496"
          y1="11.3951"
          x2="8.93504"
          y2="11.3951"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="1" stopColor="white" />
        </linearGradient>
      </defs>
    </svg>
  )
}
