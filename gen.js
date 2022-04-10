import { walkDOMOfftext,DOMFromString,xpath } from 'pitaka/xmlparser';
import { sortObj } from 'pitaka/utils';
import {readTextContent, nodefs ,patchBuf, writeChanged} from 'pitaka/cli'
import Errata from './errata.js'
import {onOpen,onClose,doInlineTag,onText,prolog} from './handler.js'
await nodefs;
const srcfolder='dictionaries/';
const desfolder='off/';
const inputfn='pli2en_pts.json';
const rawcontent=readTextContent(srcfolder+inputfn);
/*
TODO 
repeated def //Māsati, Māsana, Māsin 未去除，dl#id 不同

expand compound, 
Akkhi
añjan˚  ==> añjanakkhi

search cs for more precise location and convert to off

*/
let errata=Errata[inputfn];
if (typeof errata=='string') errata=Errata[errata];
const json=JSON.parse( patchBuf(rawcontent, errata ));
const outcontent=[];
const words=[];
const ctx={started:true,cites:[],onText,grammars:{}, liststack:[] , books:{}, ubooks:{}};
for (let i=0;i<json.length;i++) {
    const entry=json[i];
    ctx.word=entry.word;
    words.push(ctx.word);
    const xml=doInlineTag(entry.text.replace(/<br>/g,'<br/>').replace(/\&/g,'&amp;'),ctx);
    // const debug=entry.word=='veṭṭhadīpaka';
    const dom=DOMFromString(xml);
    if (!dom) {
        console.log('error parseing dom',entry.word)
    } else {
        
        const out=walkDOMOfftext(dom,ctx,onOpen,onClose);
        // console.log(ctx.snippet)
        // outcontent.push('^e '+entry.word);
        outcontent.push(out);
    }
}
// console.log( sortObj(ctx.grammars))
const outfn=desfolder+inputfn.replace('.json','.off');
let s=prolog(outcontent.join('\n'));

if (writeChanged(outfn,s)) {
    console.log('written',outfn,s.length)
}
//₧
// writeChanged('sc-pts-cite.txt',ctx.cites.join('\n'));
// const books=sortObj(ctx.ubooks);
// writeChanged('cite-ubooks.txt',books.join('\n'));
// writeChanged('words.txt.org',words.join('\n'));