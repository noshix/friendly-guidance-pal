export const ELECTRICIAN_DAY = {
  year: 2026,
  celebrationDate: "2026-10-17",
  breakfastDate: "2026-10-16",
  breakfastTime: "07:30",
  startsAt: "2026-10-16T07:30:00-04:00",
  giftLimit: 500,
  televisionInches: 65,
  address: "Av. Manoel José de Arruda, 664, Jardim Shangri-lá, Cuiabá - MT",
} as const;

export const ELECTRICIAN_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ELECTRICIAN_DAY.address)}`;

function calendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function electricianBreakfastCalendar() {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pizzatto//Dia do Eletricista//PT-BR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:dia-do-eletricista-2026@pizzatto",
    "DTSTAMP:20261005T120000Z",
    "DTSTART:20261016T113000Z",
    "SUMMARY:Café da manhã do Dia do Eletricista — Pizzatto",
    `LOCATION:${calendarText(ELECTRICIAN_DAY.address)}`,
    `DESCRIPTION:${calendarText("Sexta-feira, 16 de outubro de 2026, às 07h30 (horário de Cuiabá). Antecipamos a comemoração do Dia do Eletricista, 17 de outubro, pois não abrimos aos sábados.")}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
