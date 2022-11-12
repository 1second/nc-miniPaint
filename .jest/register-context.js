import registerRequireContextHook from "babel-plugin-require-context-hook/register";
import { Blob } from 'buffer'
globalThis.Blob = Blob 
console.log('test setup ======================')
registerRequireContextHook();
