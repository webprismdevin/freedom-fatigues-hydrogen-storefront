import clsx from 'clsx';

type IconProps = JSX.IntrinsicElements['svg'] & {
  direction?: 'up' | 'right' | 'down' | 'left';
};

function Icon({
  children,
  className,
  fill = 'currentColor',
  stroke,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      {...props}
      fill={fill}
      stroke={stroke}
      className={clsx('h-5 w-5', className)}
    >
      {children}
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Icon {...props} stroke={props.stroke || 'currentColor'}>
      <title>Menu</title>
      <line x1="3" y1="6.375" x2="17" y2="6.375" strokeWidth="1.25" />
      <line x1="3" y1="10.375" x2="17" y2="10.375" strokeWidth="1.25" />
      <line x1="3" y1="14.375" x2="17" y2="14.375" strokeWidth="1.25" />
    </Icon>
  );
}

export function IconRedo() {
  return (
    <svg
      width="auto"
      height="20"
      viewBox="0 0 138 53"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mf-class-1"
    >
      <path
        d="M18.7226 9.12234C18.5266 13.813 14.5639 17.4557 9.87461 17.2583C5.18394 17.0623 1.54128 13.0997 1.73861 8.41034C1.93461 3.71967 5.89594 0.0770035 10.5866 0.274338C15.2773 0.470337 18.9186 4.43167 18.7226 9.12234Z"
        fill="currentColor"
        className="mf-class-2"
      ></path>
      <path
        d="M17.8586 44.3112C17.6626 49.0018 13.7 52.6445 9.01062 52.4472C4.32128 52.2512 0.678618 48.2885 0.874618 43.5992C1.07195 38.9085 5.03328 35.2658 9.72262 35.4632C11.224 35.5258 12.6186 35.9752 13.8133 36.7098C14.3933 37.0658 14.9266 37.4912 15.4026 37.9712C15.9066 38.4792 16.3466 39.0525 16.7106 39.6725C17.5026 41.0312 17.9293 42.6232 17.8586 44.3112Z"
        fill="currentColor"
        className="mf-class-2"
      ></path>
      <path
        d="M11.2004 27.6086C11.2004 27.6086 11.0191 24.9326 11.7031 22.6153C12.7524 19.0593 15.8471 15.142 15.8471 15.142L9.97377 14.8953L4.51111 15.0526C4.51111 15.0526 8.33644 18.954 8.77511 22.4926C9.21378 26.03 8.85778 27.51 8.85778 27.51"
        fill="currentColor"
        className="mf-class-2"
      ></path>
      <path
        d="M11.0957 26.1034C11.0957 26.1034 11.021 27.8607 11.6143 30.1247C12.5543 33.714 16.833 39.5487 16.833 39.5487L9.57301 37.778L4.02234 37.426C4.02234 37.426 8.05567 33.6634 8.63034 30.1434C9.20634 26.6234 8.86234 22.4914 8.86234 22.4914"
        fill="currentColor"
        className="mf-class-2"
      ></path>
      <path
        d="M54.8216 23.7358C54.3749 23.6144 53.9283 23.5731 53.3203 23.5731C51.3323 23.5731 49.2229 24.9531 48.1683 26.7784V39.3958H44.3136V20.3278H48.0456V22.5184C48.9789 21.2198 50.9669 19.9224 53.7656 19.9224C54.1723 19.9224 54.8216 19.9624 55.2669 20.0438L54.8216 23.7358Z"
        fill="currentColor"
        className="mf-class-2"
      ></path>
      <path
        d="M61.5559 27.4271H71.9412C71.3732 24.9938 69.1839 23.2884 66.9119 23.2884C64.4359 23.2884 62.2052 24.9524 61.5559 27.4271ZM61.2319 30.6738C61.4345 33.8778 64.0719 36.4338 67.3985 36.4338C70.2385 36.4338 71.7799 35.0551 72.8745 33.8378L75.3905 36.2311C73.9705 38.0564 71.2519 39.8018 67.3572 39.8018C61.7999 39.8018 57.4985 35.5818 57.4985 29.8618C57.4985 24.1418 61.3932 19.9218 66.7892 19.9218C72.1039 19.9218 75.9585 24.2231 75.9585 29.8618C75.9585 30.0244 75.9585 30.3084 75.9172 30.6738H61.2319Z"
        fill="currentColor"
        className="mf-class-2"
      ></path>
      <path
        d="M85.0872 34.1211C86.6699 34.1211 87.9272 35.3784 87.9272 36.9611C87.9272 38.5438 86.6699 39.8011 85.0872 39.8011C83.5045 39.8011 82.2472 38.5438 82.2472 36.9611C82.2472 35.3784 83.5045 34.1211 85.0872 34.1211ZM85.0872 19.9224C86.6699 19.9224 87.9272 21.1798 87.9272 22.7611C87.9272 24.3438 86.6699 25.6011 85.0872 25.6011C83.5045 25.6011 82.2472 24.3438 82.2472 22.7611C82.2472 21.1798 83.5045 19.9224 85.0872 19.9224Z"
        fill="#B3B3B3"
        className="mf-class-2"
      ></path>
      <path
        d="M108.82 26.2918C107.644 24.7504 105.696 23.5731 103.384 23.5731C99.6922 23.5731 97.2588 26.5358 97.2588 29.8611C97.2588 33.2691 99.8962 36.1504 103.587 36.1504C105.535 36.1504 107.522 35.1771 108.82 33.4318V26.2918ZM108.943 37.6518C107.402 39.0304 105.332 39.8011 103.06 39.8011C101.355 39.8011 99.5708 39.3144 98.2722 38.5438C95.3922 36.8398 93.4042 33.6758 93.4042 29.8611C93.4042 26.0478 95.4322 22.8438 98.3122 21.1398C99.6122 20.3691 101.194 19.9224 102.979 19.9224C105.048 19.9224 107.118 20.5704 108.82 21.9904V10.5918H112.675V39.3958H108.943V37.6518Z"
        fill="currentColor"
        className="mf-class-2"
      ></path>
      <path
        d="M127.808 36.1498C131.338 36.1498 133.812 33.3511 133.812 29.8618C133.812 26.3724 131.338 23.5724 127.808 23.5724C124.279 23.5724 121.804 26.3724 121.804 29.8618C121.804 33.3511 124.279 36.1498 127.808 36.1498ZM127.808 19.9218C133.447 19.9218 137.667 24.1818 137.667 29.8618C137.667 35.5404 133.447 39.8018 127.808 39.8018C122.17 39.8018 117.95 35.5404 117.95 29.8618C117.95 24.1818 122.17 19.9218 127.808 19.9218Z"
        fill="currentColor"
        className="mf-class-2"
      ></path>
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props} stroke={props.stroke || 'currentColor'}>
      <title>Close</title>
      <line
        x1="4.44194"
        y1="4.30806"
        x2="15.7556"
        y2="15.6218"
        strokeWidth="1.25"
      />
      <line
        y1="-0.625"
        x2="16"
        y2="-0.625"
        transform="matrix(-0.707107 0.707107 0.707107 0.707107 16 4.75)"
        strokeWidth="1.25"
      />
    </Icon>
  );
}

export function IconArrow({direction = 'right'}: IconProps) {
  let rotate;

  switch (direction) {
    case 'right':
      rotate = 'rotate-0';
      break;
    case 'left':
      rotate = 'rotate-180';
      break;
    case 'up':
      rotate = '-rotate-90';
      break;
    case 'down':
      rotate = 'rotate-90';
      break;
    default:
      rotate = 'rotate-0';
  }

  return (
    <Icon className={`h-5 w-5 ${rotate}`}>
      <title>Arrow</title>
      <path d="M7 3L14 10L7 17" strokeWidth="1.25" />
    </Icon>
  );
}

export function IconCaret({
  direction = 'down',
  stroke = 'currentColor',
  ...props
}: IconProps) {
  let rotate;

  switch (direction) {
    case 'down':
      rotate = 'rotate-0';
      break;
    case 'up':
      rotate = 'rotate-180';
      break;
    case 'left':
      rotate = '-rotate-90';
      break;
    case 'right':
      rotate = 'rotate-90';
      break;
    default:
      rotate = 'rotate-0';
  }

  return (
    <Icon
      {...props}
      className={`h-5 w-5 transition ${rotate}`}
      fill="transparent"
      stroke={stroke}
    >
      <title>Caret</title>
      <path d="M14 8L10 12L6 8" strokeWidth="1.25" />
    </Icon>
  );
}

export function IconSelect(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Select</title>
      <path d="M7 8.5L10 6.5L13 8.5" strokeWidth="1.25" />
      <path d="M13 11.5L10 13.5L7 11.5" strokeWidth="1.25" />
    </Icon>
  );
}

export function IconBag(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Bag</title>
      <path
        fillRule="evenodd"
        d="M8.125 5a1.875 1.875 0 0 1 3.75 0v.375h-3.75V5Zm-1.25.375V5a3.125 3.125 0 1 1 6.25 0v.375h3.5V15A2.625 2.625 0 0 1 14 17.625H6A2.625 2.625 0 0 1 3.375 15V5.375h3.5ZM4.625 15V6.625h10.75V15c0 .76-.616 1.375-1.375 1.375H6c-.76 0-1.375-.616-1.375-1.375Z"
      />
    </Icon>
  );
}

export function IconAccount(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Account</title>
      <path
        fillRule="evenodd"
        d="M9.9998 12.625c-1.9141 0-3.6628.698-5.0435 1.8611C3.895 13.2935 3.25 11.7221 3.25 10c0-3.728 3.022-6.75 6.75-6.75 3.7279 0 6.75 3.022 6.75 6.75 0 1.7222-.645 3.2937-1.7065 4.4863-1.3807-1.1632-3.1295-1.8613-5.0437-1.8613ZM10 18c-2.3556 0-4.4734-1.0181-5.9374-2.6382C2.7806 13.9431 2 12.0627 2 10c0-4.4183 3.5817-8 8-8s8 3.5817 8 8-3.5817 8-8 8Zm0-12.5c-1.567 0-2.75 1.394-2.75 3s1.183 3 2.75 3 2.75-1.394 2.75-3-1.183-3-2.75-3Z"
      />
    </Icon>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Help</title>
      <path d="M3.375 10a6.625 6.625 0 1 1 13.25 0 6.625 6.625 0 0 1-13.25 0ZM10 2.125a7.875 7.875 0 1 0 0 15.75 7.875 7.875 0 0 0 0-15.75Zm.699 10.507H9.236V14h1.463v-1.368ZM7.675 7.576A3.256 3.256 0 0 0 7.5 8.67h1.245c0-.496.105-.89.316-1.182.218-.299.553-.448 1.005-.448a1 1 0 0 1 .327.065c.124.044.24.113.35.208.108.095.2.223.272.383.08.154.12.34.12.558a1.3 1.3 0 0 1-.076.471c-.044.131-.11.252-.197.361-.08.102-.174.197-.283.285-.102.087-.212.182-.328.284a3.157 3.157 0 0 0-.382.383c-.102.124-.19.27-.262.438a2.476 2.476 0 0 0-.164.591 6.333 6.333 0 0 0-.043.81h1.179c0-.263.021-.485.065-.668a1.65 1.65 0 0 1 .207-.47c.088-.139.19-.263.306-.372.117-.11.244-.223.382-.34l.35-.306c.116-.11.218-.23.305-.361.095-.139.168-.3.219-.482.058-.19.087-.412.087-.667 0-.35-.062-.664-.186-.942a1.881 1.881 0 0 0-.513-.689 2.07 2.07 0 0 0-.753-.427A2.721 2.721 0 0 0 10.12 6c-.4 0-.764.066-1.092.197a2.36 2.36 0 0 0-.83.536c-.225.234-.4.515-.523.843Z" />
    </Icon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Search</title>
      <path
        fillRule="evenodd"
        d="M13.3 8.52a4.77 4.77 0 1 1-9.55 0 4.77 4.77 0 0 1 9.55 0Zm-.98 4.68a6.02 6.02 0 1 1 .88-.88l4.3 4.3-.89.88-4.3-4.3Z"
      />
    </Icon>
  );
}

export function IconCheck({
  stroke = 'currentColor',
  ...props
}: React.ComponentProps<typeof Icon>) {
  return (
    <Icon {...props} fill="transparent" stroke={stroke}>
      <title>Check</title>
      <circle cx="10" cy="10" r="7.25" strokeWidth="1.25" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m7.04 10.37 2.42 2.41 3.5-5.56"
      />
    </Icon>
  );
}

export function IconXMark({
  stroke = 'currentColor',
  ...props
}: React.ComponentProps<typeof Icon>) {
  return (
    <Icon {...props} fill="transparent" stroke={stroke}>
      <title>Delete</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </Icon>
  );
}

export function IconRemove(props: IconProps) {
  return (
    <Icon {...props} fill="transparent" stroke={props.stroke || 'currentColor'}>
      <title>Remove</title>
      <path
        d="M4 6H16"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.5 9V14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 9V14" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5.5 6L6 17H14L14.5 6"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6L8 5C8 4 8.75 3 10 3C11.25 3 12 4 12 5V6"
        strokeWidth="1.25"
      />
    </Icon>
  );
}

export function IconFilters(props: IconProps) {
  return (
    <Icon {...props} fill="transparent" stroke={props.stroke || 'currentColor'}>
      <title>Filters</title>
      <circle cx="4.5" cy="6.5" r="2" />
      <line x1="6" y1="6.5" x2="14" y2="6.5" />
      <line x1="4.37114e-08" y1="6.5" x2="3" y2="6.5" />
      <line x1="4.37114e-08" y1="13.5" x2="8" y2="13.5" />
      <line x1="11" y1="13.5" x2="14" y2="13.5" />
      <circle cx="9.5" cy="13.5" r="2" />
    </Icon>
  );
}

export function IconInformation({
  className = 'h-5 w-5',
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
