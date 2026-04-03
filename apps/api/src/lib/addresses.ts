export function isEthereumAddress(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  return /^0x[a-fA-F0-9]{40}$/.test(value);
}
