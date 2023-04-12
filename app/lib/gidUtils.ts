export function fromGID(gid: string) {
  return gid.split('/').pop();
}