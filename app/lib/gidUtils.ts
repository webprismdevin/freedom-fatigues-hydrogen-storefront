export function fromGID(gid: string) {
  return gid.split('/').pop();
}

export function toGID(id: string, type: string) {
  return `gid://shopify/${type}/${id}`;
}
