// Bun bundles imported files and gives their URL.
declare module "*.svg" {
  const url: string;
  export default url;
}
