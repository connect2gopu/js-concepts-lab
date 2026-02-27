// Allow TypeScript to resolve plain CSS file imports (e.g. globals.css).
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
