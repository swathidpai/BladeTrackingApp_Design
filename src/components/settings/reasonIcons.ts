import {
  AlertTriangle,
  Ban,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplet,
  Droplets,
  type LucideIcon,
  Rainbow,
  ShieldAlert,
  Snowflake,
  Sun,
  Thermometer,
  Tornado,
  Umbrella,
  Waves,
  Wind,
  Zap,
} from "lucide-react";

export const REASON_ICONS: Record<string, LucideIcon> = {
  wind: Wind,
  "cloud-fog": CloudFog,
  "cloud-rain": CloudRain,
  "cloud-drizzle": CloudDrizzle,
  "cloud-lightning": CloudLightning,
  "cloud-hail": CloudHail,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  zap: Zap,
  droplet: Droplet,
  droplets: Droplets,
  waves: Waves,
  snowflake: Snowflake,
  sun: Sun,
  rainbow: Rainbow,
  thermometer: Thermometer,
  umbrella: Umbrella,
  tornado: Tornado,
  "alert-triangle": AlertTriangle,
  ban: Ban,
  "shield-alert": ShieldAlert,
};

export const REASON_ICON_KEYS = Object.keys(REASON_ICONS);

export function reasonIconComponent(key: string): LucideIcon {
  return REASON_ICONS[key] ?? Cloud;
}
