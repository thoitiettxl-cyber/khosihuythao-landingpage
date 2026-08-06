export function containsPlaceholder(value: string): boolean {
  return /TODO|example\.invalid|09xx|\+84\.\.\./i.test(value);
}

export function joinBase(base: string, path: string): string {
  return `${base.endsWith("/") ? base : `${base}/`}${path.replace(/^\//, "")}`;
}
