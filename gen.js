import { walkDOMOfftext,DOMFromString,xpath } from 'pitaka/xmlparser';
import { sortObj } from 'pitaka/utils';
import {readTextContent, nodefs ,patchBuf, writeChanged} from 'pitaka/cli'
import Errata from './errata.js'
import {onOpen,onClose,doInlineTag,onText} from './handler.js'
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
const ctx={started:true,cites:[],onText,grammars:{}, liststack:[] , books:{}};
for (let i=0;i<json.length;i++) {
    const entry=json[i];
    ctx.word=entry.word;
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
let s=outcontent.join('\n');
s=s.replace(/■ /g,'\n■ ').replace(/\n+/g,'\n')
.replace(/ \. \^w/g,' .\n ^w').replace(/; \^w/g,';\n ^w') //extremely long line 6Kb reduced to 2Kb
.replace(/1\^sup[st] sg\. ?/,'^g#1sg ')
.replace(/1\^sup[st] pl\. ?/,'^g#1pl ')
.replace(/2\^sup[nd] sg\. ?/,'^g#2sg ')
.replace(/2\^sup[nd] pl\. ?/,'^g#2pl ')
.replace(/3\^sup[rd] sg\. ?/,'^g#3sg ')
.replace(/3\^sup[rd] pl\. ?/,'^g#3pl ')

// if (writeChanged(outfn,s)) {
//     console.log('written',outfn,s.length)
// }
// writeChanged('sc-pts-cite.txt',ctx.cites.join('\n'));
const books=sortObj(ctx.books);
writeChanged('cite-books.txt',books.join('\n'));