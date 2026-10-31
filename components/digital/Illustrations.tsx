import { useId, type ReactNode } from "react";
import { BarChart3Icon, BoxesIcon, CalendarCheckIcon, ContactIcon, ReceiptTextIcon, UsersIcon } from "lucide-react";

/**
 * Original product illustrations for the Digital Solutions page, drawn as inline SVG so they stay
 * sharp at every width, reserve their own space (no layout shift) and need no image downloads.
 * All names and figures shown inside them are placeholders, not client work or real results.
 */

// Colours resolve through CSS variables so a page can re-theme the mockups (see .mock-forest).
const navy = "var(--mock-navy, #06152e)";
const navy2 = "var(--mock-navy-2, #071d3a)";
const blue = "var(--mock-blue, #0866d9)";
const bright = "var(--mock-bright, #168bfa)";
const light = "var(--mock-light, #eaf4ff)";
const soft = "var(--mock-soft, #f7fafe)";
const line = "var(--mock-line, #dde7f3)";
const text = "var(--mock-text, #152238)";
const muted = "var(--mock-muted, #64748b)";
const gold = "#d4a437";

const useSvgId = () => useId().replace(/\W/g, "");

type FrameProps = { label: string; className?: string };

function Svg({ viewBox, label, className, children }: FrameProps & { viewBox: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className={`digital-chart-text block h-auto w-full ${className ?? ""}`}>
      {children}
    </svg>
  );
}

const Skeleton = ({ x, y, w, h = 6, fill = line }: { x: number; y: number; w: number; h?: number; fill?: string }) => (
  <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
);

/* ---------- Devices ---------- */

/** Desktop browser showing a business website. */
export function WebsiteWindow({ label = "Business website shown in a desktop browser", className }: Partial<FrameProps>) {
  const id = useSvgId();
  return (
    <Svg viewBox="0 0 640 412" label={label} className={className}>
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={navy2} />
          <stop offset="1" stopColor={blue} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect width="640" height="412" rx="12" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="640" height="412" fill="#fff" />
        <rect width="640" height="30" fill={soft} />
        <circle cx="18" cy="15" r="4" fill="#f87171" />
        <circle cx="32" cy="15" r="4" fill="#fbbf24" />
        <circle cx="46" cy="15" r="4" fill="#34d399" />
        <rect x="170" y="8" width="300" height="14" rx="7" fill="#fff" stroke={line} />
        <text x="320" y="18.5" textAnchor="middle" fontSize="8" fill={muted}>
          www.yourbusiness.com
        </text>

        <circle cx="30" cy="54" r="9" fill={blue} />
        <text x="46" y="58" fontSize="11" fontWeight="700" fill={text}>
          Your Business
        </text>
        {[390, 438, 486].map((x) => (
          <Skeleton key={x} x={x} y={51} w={36} fill="#c9d6e6" />
        ))}
        <rect x="540" y="43" width="78" height="22" rx="11" fill={blue} />
        <text x="579" y="58" textAnchor="middle" fontSize="9" fontWeight="600" fill="#fff">
          Book now
        </text>

        <rect x="20" y="78" width="600" height="176" rx="10" fill={`url(#${id}h)`} />
        <text x="46" y="128" fontSize="25" fontWeight="700" fill="#fff">
          Built around
        </text>
        <text x="46" y="158" fontSize="25" fontWeight="700" fill="#fff">
          your customers
        </text>
        <Skeleton x={46} y={174} w={190} fill="#ffffff55" />
        <Skeleton x={46} y={187} w={140} fill="#ffffff55" />
        <rect x="46" y="206" width="82" height="24" rx="12" fill={gold} />
        <text x="87" y="222" textAnchor="middle" fontSize="9" fontWeight="700" fill={navy}>
          Get started
        </text>
        <rect x="372" y="96" width="222" height="140" rx="8" fill="#ffffff1f" stroke="#ffffff33" />
        <path d="M372 210 L430 164 L476 196 L524 142 L594 200 V228 a8 8 0 0 1 -8 8 H380 a8 8 0 0 1 -8 -8 Z" fill="#ffffff33" />
        <circle cx="552" cy="126" r="11" fill="#ffffff55" />

        {[20, 226, 432].map((x, i) => (
          <g key={x}>
            <rect x={x} y="270" width="188" height="122" rx="10" fill={soft} stroke={line} />
            <circle cx={x + 26} cy="298" r="13" fill={light} />
            <circle cx={x + 26} cy="298" r="5" fill={i === 1 ? gold : blue} />
            <Skeleton x={x + 14} y={324} w={110} h={8} fill="#b6c5d8" />
            <Skeleton x={x + 14} y={342} w={156} />
            <Skeleton x={x + 14} y={356} w={130} />
            <Skeleton x={x + 14} y={370} w={92} />
          </g>
        ))}
      </g>
      <rect x=".5" y=".5" width="639" height="411" rx="12" fill="none" stroke={line} />
    </Svg>
  );
}

function PhoneFrame({ label, className, children }: FrameProps & { children: ReactNode }) {
  const id = useSvgId();
  return (
    <Svg viewBox="0 0 200 410" label={label} className={className}>
      <defs>
        <clipPath id={`${id}s`}>
          <rect x="9" y="9" width="182" height="392" rx="24" />
        </clipPath>
      </defs>
      <rect width="200" height="410" rx="32" fill={navy} />
      <rect x="1.5" y="1.5" width="197" height="407" rx="31" fill="none" stroke="#3b5475" />
      <g clipPath={`url(#${id}s)`}>
        <rect x="9" y="9" width="182" height="392" fill="#fff" />
        {children}
      </g>
      <rect x="72" y="16" width="56" height="14" rx="7" fill={navy} />
    </Svg>
  );
}

/** Mobile app: appointment booking. */
export function PhoneBooking({ label = "Mobile app booking screen with a calendar and time slots", className }: Partial<FrameProps>) {
  return (
    <PhoneFrame label={label} className={className}>
      <rect x="9" y="9" width="182" height="104" fill={blue} />
      <text x="24" y="60" fontSize="11" fill="#ffffffcc">
        Book a service
      </text>
      <text x="24" y="82" fontSize="17" fontWeight="700" fill="#fff">
        Choose a time
      </text>
      <rect x="21" y="100" width="158" height="128" rx="12" fill="#fff" stroke={line} />
      {Array.from({ length: 21 }, (_, i) => {
        const x = 37 + (i % 7) * 21;
        const y = 122 + Math.floor(i / 7) * 34;
        const active = i === 10;
        return (
          <g key={i}>
            {active ? <circle cx={x} cy={y - 4} r="11" fill={blue} /> : null}
            <text x={x} y={y} textAnchor="middle" fontSize="10" fontWeight={active ? 700 : 500} fill={active ? "#fff" : text}>
              {i + 1}
            </text>
          </g>
        );
      })}
      {[
        ["10:00 AM", false],
        ["11:30 AM", true],
        ["2:00 PM", false],
      ].map(([time, selected], i) => (
        <g key={String(time)}>
          <rect x="21" y={240 + i * 36} width="158" height="29" rx="9" fill={selected ? light : "#fff"} stroke={selected ? blue : line} />
          <text x="35" y={258 + i * 36} fontSize="10" fontWeight="600" fill={selected ? blue : text}>
            {time}
          </text>
        </g>
      ))}
      <rect x="21" y="356" width="158" height="30" rx="15" fill={navy} />
      <text x="100" y="375" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
        Confirm booking
      </text>
    </PhoneFrame>
  );
}

/** Mobile app: customer home. */
export function PhoneHome({ label = "Mobile app home screen with service categories", className }: Partial<FrameProps>) {
  const id = useSvgId();
  return (
    <PhoneFrame label={label} className={className}>
      <defs>
        <clipPath id={`${id}n`}>
          <rect x="21" y="94" width="158" height="82" rx="14" />
        </clipPath>
      </defs>
      <rect x="9" y="9" width="182" height="392" fill={soft} />
      <text x="24" y="60" fontSize="10" fill={muted}>
        Welcome back
      </text>
      <text x="24" y="78" fontSize="16" fontWeight="700" fill={text}>
        Your services
      </text>
      <circle cx="166" cy="66" r="13" fill={light} />
      <circle cx="166" cy="62" r="4.5" fill={blue} />
      <path d="M157 74 a9 7 0 0 1 18 0 Z" fill={blue} />
      <rect x="21" y="94" width="158" height="82" rx="14" fill={navy2} />
      <circle cx="158" cy="112" r="34" fill={blue} opacity=".55" clipPath={`url(#${id}n)`} />
      <text x="35" y="122" fontSize="10" fill="#ffffffb3">
        Next appointment
      </text>
      <text x="35" y="141" fontSize="14" fontWeight="700" fill="#fff">
        Tomorrow, 11:30
      </text>
      <rect x="35" y="151" width="48" height="13" rx="6.5" fill={gold} />
      {[0, 1, 2, 3].map((i) => {
        const x = 21 + (i % 2) * 82;
        const y = 188 + Math.floor(i / 2) * 76;
        return (
          <g key={i}>
            <rect x={x} y={y} width="76" height="68" rx="12" fill="#fff" stroke={line} />
            <circle cx={x + 20} cy={y + 22} r="10" fill={light} />
            <circle cx={x + 20} cy={y + 22} r="4" fill={blue} />
            <Skeleton x={x + 11} y={y + 42} w={48} fill="#b6c5d8" />
            <Skeleton x={x + 11} y={y + 54} w={34} h={4} />
          </g>
        );
      })}
      <rect x="9" y="350" width="182" height="51" fill="#fff" />
      {[42, 78, 114, 150].map((x, i) => (
        <circle key={x} cx={x} cy="373" r="6.5" fill={i === 0 ? blue : "#c9d6e6"} />
      ))}
    </PhoneFrame>
  );
}

/** Mobile app: user profile. */
export function PhoneProfile({ label = "Mobile app user profile screen", className }: Partial<FrameProps>) {
  return (
    <PhoneFrame label={label} className={className}>
      <rect x="9" y="9" width="182" height="122" fill={navy2} />
      <circle cx="100" cy="82" r="26" fill={light} />
      <circle cx="100" cy="75" r="9" fill={blue} />
      <path d="M84 98 a16 13 0 0 1 32 0 Z" fill={blue} />
      <text x="100" y="146" textAnchor="middle" fontSize="13" fontWeight="700" fill={text}>
        My profile
      </text>
      {["Personal details", "My bookings", "Payments", "Notifications", "Support"].map((item, i) => (
        <g key={item}>
          <rect x="21" y={160 + i * 44} width="158" height="37" rx="10" fill={soft} stroke={line} />
          <circle cx="39" cy={178.5 + i * 44} r="7" fill={i === 1 ? gold : blue} opacity=".85" />
          <text x="54" y={182 + i * 44} fontSize="10" fontWeight="600" fill={text}>
            {item}
          </text>
        </g>
      ))}
    </PhoneFrame>
  );
}

/** Web application dashboard with charts, a table, navigation and metrics. */
export function DashboardWindow({ label = "Business dashboard with metrics, charts and a records table", className }: Partial<FrameProps>) {
  const id = useSvgId();
  const nav = ["Overview", "Customers", "Bookings", "Inventory", "Team", "Reports"];
  const kpis = [
    ["New enquiries", "128", "+12%"],
    ["Bookings", "342", "+8%"],
    ["Open tasks", "57", "-4%"],
    ["Revenue", "₹4.2L", "+15%"],
  ];
  const rows = [
    ["Customer record 01", "Website", "Active", blue],
    ["Customer record 02", "Booking", "Pending", gold],
    ["Customer record 03", "Support", "Active", blue],
    ["Customer record 04", "Billing", "Closed", muted],
  ] as const;
  return (
    <Svg viewBox="0 0 960 590" label={label} className={className}>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bright} stopOpacity=".32" />
          <stop offset="1" stopColor={bright} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect width="960" height="590" rx="14" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="960" height="590" fill={soft} />
        <rect width="178" height="590" fill={navy} />
        <circle cx="34" cy="36" r="11" fill={bright} />
        <text x="54" y="41" fontSize="14" fontWeight="700" fill="#fff">
          Workspace
        </text>
        {nav.map((item, i) => (
          <g key={item}>
            {i === 0 ? <rect x="14" y={72} width="150" height="34" rx="8" fill={blue} /> : null}
            <circle cx="34" cy={89 + i * 42} r="5" fill={i === 0 ? "#fff" : "#6f88a9"} />
            <text x="50" y={93 + i * 42} fontSize="12" fontWeight={i === 0 ? 700 : 500} fill={i === 0 ? "#fff" : "#b6c6dc"}>
              {item}
            </text>
          </g>
        ))}

        <text x="202" y="42" fontSize="20" fontWeight="700" fill={text}>
          Business overview
        </text>
        <rect x="830" y="24" width="106" height="24" rx="12" fill={light} />
        <text x="883" y="40" textAnchor="middle" fontSize="10" fontWeight="600" fill={blue}>
          Sample data
        </text>

        {kpis.map(([name, value, change], i) => {
          const x = 202 + i * 187;
          return (
            <g key={name}>
              <rect x={x} y="64" width="173" height="86" rx="10" fill="#fff" stroke={line} />
              <text x={x + 16} y="90" fontSize="11" fill={muted}>
                {name}
              </text>
              <text x={x + 16} y="122" fontSize="24" fontWeight="700" fill={text}>
                {value}
              </text>
              <text x={x + 157} y="122" textAnchor="end" fontSize="11" fontWeight="600" fill={change.startsWith("-") ? "#b45309" : "#0f7a55"}>
                {change}
              </text>
            </g>
          );
        })}

        <rect x="202" y="164" width="454" height="208" rx="10" fill="#fff" stroke={line} />
        <text x="220" y="192" fontSize="13" fontWeight="700" fill={text}>
          Enquiries over time
        </text>
        {[230, 270, 310, 350].map((y) => (
          <line key={y} x1="220" x2="638" y1={y} y2={y} stroke={line} />
        ))}
        <path d="M220 330 C270 300 300 318 345 280 S420 300 470 250 S570 262 638 216 V350 H220 Z" fill={`url(#${id}a)`} />
        <path d="M220 330 C270 300 300 318 345 280 S420 300 470 250 S570 262 638 216" fill="none" stroke={blue} strokeWidth="3" strokeLinecap="round" />
        <circle cx="470" cy="250" r="5" fill="#fff" stroke={blue} strokeWidth="3" />

        <rect x="670" y="164" width="266" height="208" rx="10" fill="#fff" stroke={line} />
        <text x="688" y="192" fontSize="13" fontWeight="700" fill={text}>
          Work by department
        </text>
        {[64, 108, 86, 132, 74, 118].map((h, i) => (
          <rect key={i} x={694 + i * 39} y={352 - h} width="24" height={h} rx="5" fill={i === 3 ? blue : light} />
        ))}

        <rect x="202" y="386" width="734" height="184" rx="10" fill="#fff" stroke={line} />
        <text x="220" y="414" fontSize="13" fontWeight="700" fill={text}>
          Recent records
        </text>
        {rows.map(([name, area, status, color], i) => {
          const y = 430 + i * 34;
          return (
            <g key={name}>
              <line x1="220" x2="918" y1={y} y2={y} stroke={line} />
              <text x="220" y={y + 22} fontSize="12" fontWeight="600" fill={text}>
                {name}
              </text>
              <text x="520" y={y + 22} fontSize="12" fill={muted}>
                {area}
              </text>
              <rect x="810" y={y + 8} width="84" height="20" rx="10" fill={color} opacity=".14" />
              <text x="852" y={y + 22} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={color === gold ? "#8a6412" : color}>
                {status}
              </text>
            </g>
          );
        })}
      </g>
      <rect x=".5" y=".5" width="959" height="589" rx="14" fill="none" stroke={line} />
    </Svg>
  );
}

/** Connected software modules around one central system. */
export function SoftwareEcosystem({ label = "Connected software modules for customers, bookings, inventory, billing, employees and reports", className }: Partial<FrameProps>) {
  const id = useSvgId();
  const modules = [
    { name: "CRM", icon: ContactIcon, x: 26, y: 34 },
    { name: "Bookings", icon: CalendarCheckIcon, x: 228, y: 14 },
    { name: "Inventory", icon: BoxesIcon, x: 430, y: 34 },
    { name: "Billing", icon: ReceiptTextIcon, x: 26, y: 322 },
    { name: "Employees", icon: UsersIcon, x: 228, y: 342 },
    { name: "Reports", icon: BarChart3Icon, x: 430, y: 322 },
  ];
  const hub = { x: 300, y: 215 };
  return (
    <Svg viewBox="0 0 600 420" label={label} className={className}>
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={navy2} />
          <stop offset="1" stopColor={blue} />
        </linearGradient>
      </defs>
      {modules.map((m) => (
        <path
          key={m.name}
          className="digital-flow"
          d={`M${m.x + 72} ${m.y + 32} C${m.x + 72} ${(m.y + hub.y) / 2}, ${hub.x} ${(m.y + hub.y) / 2}, ${hub.x} ${hub.y}`}
          fill="none"
          stroke={bright}
          strokeWidth="1.6"
          opacity=".6"
        />
      ))}
      <rect x="170" y="150" width="260" height="130" rx="18" fill={`url(#${id}h)`} />
      <text x="300" y="192" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">
        Your Business System
      </text>
      <rect x="194" y="208" width="60" height="50" rx="7" fill="#ffffff1f" />
      <path d="M200 248 l12 -14 l10 8 l14 -18 l12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <rect x="264" y="208" width="72" height="50" rx="7" fill="#ffffff1f" />
      {[218, 230, 242].map((y) => (
        <Skeleton key={y} x={272} y={y} w={56} h={5} fill="#ffffff66" />
      ))}
      <rect x="346" y="208" width="60" height="50" rx="7" fill="#ffffff1f" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={354 + i * 11} y={250 - (i + 1) * 8} width="7" height={(i + 1) * 8} rx="2" fill={i === 3 ? gold : "#ffffff99"} />
      ))}
      {modules.map(({ name, icon: Icon, x, y }) => (
        <g key={name}>
          <rect x={x} y={y} width="144" height="64" rx="12" fill="#fff" stroke={line} />
          <rect x={x + 12} y={y + 14} width="36" height="36" rx="9" fill={light} />
          <Icon x={x + 21} y={y + 23} width="18" height="18" stroke={blue} strokeWidth={1.75} aria-hidden />
          <text x={x + 58} y={y + 37} fontSize="13" fontWeight="700" fill={text}>
            {name}
          </text>
        </g>
      ))}
    </Svg>
  );
}

/* ---------- Compositions ---------- */

/** Website, dashboard and mobile app together: the page's main hero visual. */
export function HeroDevices() {
  return (
    <div className="relative mx-auto aspect-[16/10.5] sm:aspect-[16/7.2] w-full max-w-6xl [perspective:1800px]">
      <div className="absolute left-0 top-[16%] hidden w-[46%] opacity-90 [transform:rotateY(14deg)] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)] sm:block">
        <DashboardWindow label="Software dashboard interface" />
      </div>
      <div className="absolute left-[7%] top-0 z-10 w-[86%] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.85)] sm:left-[20%] sm:w-[60%]">
        <WebsiteWindow label="Business website on a desktop browser" />
      </div>
      <div className="digital-float absolute right-[2%] top-[12%] z-20 w-[25%] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] sm:right-[8%] sm:w-[16%]">
        <PhoneBooking label="Mobile booking application" />
      </div>
    </div>
  );
}

export function WebsiteComposition() {
  return (
    <div className="relative pb-[6%] pr-[9%]">
      <div className="shadow-[0_30px_60px_-30px_rgba(6,21,46,0.45)]">
        <WebsiteWindow />
      </div>
      <div className="absolute bottom-0 right-0 w-[24%] drop-shadow-[0_20px_30px_rgba(6,21,46,0.35)]">
        <PhoneHome label="The same website adapted to a phone screen" />
      </div>
    </div>
  );
}

export function PhoneComposition() {
  return (
    <div className="mx-auto flex max-w-xl items-center justify-center">
      <div className="z-0 w-[31%] translate-x-[10%] -rotate-[5deg] opacity-95 drop-shadow-[0_20px_30px_rgba(6,21,46,0.28)]">
        <PhoneProfile />
      </div>
      <div className="z-10 w-[37%] drop-shadow-[0_30px_40px_rgba(6,21,46,0.4)]">
        <PhoneHome />
      </div>
      <div className="z-0 w-[31%] -translate-x-[10%] rotate-[5deg] opacity-95 drop-shadow-[0_20px_30px_rgba(6,21,46,0.28)]">
        <PhoneBooking />
      </div>
    </div>
  );
}

/** Compact device pairing for the enquiry call-to-action panel. */
export function CtaDevices() {
  return (
    <div className="relative mx-auto max-w-md pr-[10%]">
      <div className="shadow-[0_25px_50px_-25px_rgba(6,21,46,0.5)]">
        <DashboardWindow label="Dashboard preview" />
      </div>
      <div className="absolute -bottom-[8%] right-0 w-[23%] drop-shadow-[0_18px_24px_rgba(6,21,46,0.35)]">
        <PhoneBooking label="Mobile app preview" />
      </div>
    </div>
  );
}
