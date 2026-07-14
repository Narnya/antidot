// Ambient declarations so Metro static image imports typecheck. Metro turns an
// `import img from './x.png'` into an asset reference (a number at runtime).
declare module '*.png' {
  const asset: number;
  export default asset;
}
declare module '*.jpg' {
  const asset: number;
  export default asset;
}
