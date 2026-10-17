// Google Maps links built from the company address, so editing the address in
// the admin panel moves the pin everywhere. Neither URL needs an API key.

/** Opens Google Maps (app on phones) with a pin on the address. */
export function mapsLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** Embeddable map centred on the address, for an <iframe>. */
export function mapsEmbed(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`;
}
