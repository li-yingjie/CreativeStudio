/* Illustrated empty-state mark — a frosted glass card stack with a
 * magnifying glass overlay. Designed for "no results" surfaces in the
 * resource library where filters knocked the list empty. Renders the
 * art at the natural 70×71 size by default; pass `size` to scale. */

interface EmptySearchMarkProps {
  size?: number
  className?: string
}

export default function EmptySearchMark({
  size = 70,
  className,
}: EmptySearchMarkProps) {
  return (
    <svg
      width={size}
      height={(size * 71) / 70}
      viewBox="0 0 70 71"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M67.9813 50.9535L58.4163 41.3884C60.4279 38.4666 61.6097 34.9312 61.6097 31.1193C61.6097 21.1117 53.498 13 43.4904 13C33.4828 13 25.3711 21.1117 25.3711 31.1193C25.3711 41.1269 33.4828 49.2386 43.4904 49.2386C47.1766 49.2386 50.6013 48.1372 53.4628 46.2464L63.0781 55.8617C64.4309 57.2145 66.6235 57.2145 67.9813 55.8617C69.3392 54.5089 69.3341 52.3163 67.9813 50.9585V50.9535ZM32.306 31.1143C32.306 24.9387 37.3148 19.9299 43.4904 19.9299C49.6659 19.9299 54.6748 24.9387 54.6748 31.1143C54.6748 37.2898 49.6659 42.2986 43.4904 42.2986C37.3148 42.2986 32.306 37.2898 32.306 31.1143Z"
        fill="url(#esm_grad_glass)"
        fillOpacity="0.2"
      />
      <path
        d="M5.54297 30.708H42.3018C44.7061 30.708 46.5059 32.219 46.5059 33.9189V53.5146C46.5056 55.2144 44.706 56.7246 42.3018 56.7246H5.54297C3.13872 56.7246 1.33908 55.2144 1.33887 53.5146V33.9189C1.33887 32.219 3.13858 30.708 5.54297 30.708Z"
        fill="url(#esm_grad_card)"
      />
      <path
        d="M5.54297 30.708H42.3018C44.7061 30.708 46.5059 32.219 46.5059 33.9189V53.5146C46.5056 55.2144 44.706 56.7246 42.3018 56.7246H5.54297C3.13872 56.7246 1.33908 55.2144 1.33887 53.5146V33.9189C1.33887 32.219 3.13858 30.708 5.54297 30.708Z"
        stroke="url(#esm_grad_stroke_a)"
        strokeWidth="0.677897"
      />
      <path
        d="M5.54297 30.708H42.3018C44.7061 30.708 46.5059 32.219 46.5059 33.9189V53.5146C46.5056 55.2144 44.706 56.7246 42.3018 56.7246H5.54297C3.13872 56.7246 1.33908 55.2144 1.33887 53.5146V33.9189C1.33887 32.219 3.13858 30.708 5.54297 30.708Z"
        stroke="url(#esm_grad_stroke_b)"
        strokeWidth="0.677897"
      />
      <circle
        cx="16.3716"
        cy="44.106"
        r="2.09039"
        fill="url(#esm_grad_dot_1)"
        fillOpacity="0.2"
      />
      <circle
        cx="23.9185"
        cy="44.106"
        r="2.09039"
        fill="url(#esm_grad_dot_2)"
        fillOpacity="0.2"
      />
      <circle
        cx="31.4615"
        cy="44.106"
        r="2.09039"
        fill="url(#esm_grad_dot_3)"
        fillOpacity="0.2"
      />
      <defs>
        <linearGradient
          id="esm_grad_glass"
          x1="22.1115"
          y1="21.7209"
          x2="76.3622"
          y2="64.3466"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="#666666" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          id="esm_grad_card"
          x1="0.521483"
          y1="33.3051"
          x2="29.0527"
          y2="84.6893"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F2F2F3" />
          <stop offset="0.350715" stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#E9EAEB" />
        </linearGradient>
        <linearGradient
          id="esm_grad_stroke_a"
          x1="23.9225"
          y1="30.3691"
          x2="23.9225"
          y2="57.0637"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#E1E1E1" />
        </linearGradient>
        <linearGradient
          id="esm_grad_stroke_b"
          x1="23.9225"
          y1="30.3691"
          x2="23.9225"
          y2="57.0637"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#F4F4F4" />
        </linearGradient>
        <linearGradient
          id="esm_grad_dot_1"
          x1="13.9689"
          y1="42.8466"
          x2="19.5379"
          y2="46.9961"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="#666666" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="esm_grad_dot_2"
          x1="21.5158"
          y1="42.8466"
          x2="27.0848"
          y2="46.9961"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="#666666" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="esm_grad_dot_3"
          x1="29.0587"
          y1="42.8466"
          x2="34.6277"
          y2="46.9961"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="#666666" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
