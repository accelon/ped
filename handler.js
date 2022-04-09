import {romanToInt,toSuperscript} from 'pitaka/utils'
import {parsePEDCite} from './citeparser.js'
import {Grammars} from './codes.js'
const ListItems={
	'decimal':  ' ①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'                     //decimal,  level 1
	,'upper-latin': ' ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ'   //level 2 upper latin
	,'lower-latin': ' ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ'   //level 2lower latin
	,'lower-greek': ' αβγδεζηθικλμνξοπρςστυφχψω'                    //level 3 lower greek
	,'upper-roman': ' ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ'                  
	,'little':'                            '
    ,'compounds':' ❶❷❸❹❺❻❼❽❾❿' //UL
    ,'plain':' ⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑' //UL


	   //upper-roman , replace decimal as level 1, used in anu gutta arahant rudati
}	   //
export const onOpen={
    dl:(el,ctx)=>{

    },
    dfn:(el,ctx)=>{
        const t=el.innerText();
        if (t.indexOf(' ')>-1) {
            // console.log(t)
        }
    },
    dt:(el,ctx)=>{
        return '\n^dt ';
    },
    ol:(el,ctx)=>{
        const List=ListItems[el.attrs.class];
        if (!List) console.log('unknown OL type',el.attrs.class);
        ctx.liststack.push({List , count:0 });
        return '\n'
    },
    ul:(el,ctx)=>{
        const List=ListItems[el.attrs.class];
        if (!List) console.log('unknown UL type',el.attrs.class);
        ctx.liststack.push({List, count:0});
    },
    li:(el,ctx)=>{
        const L=ctx.liststack[ctx.liststack.length-1];
        if (!L) {
            console.log("li not in List")
        }
        if (L.List) {
            const s=L.List.charAt( ++L.count);
            // console.log(s)
            return '\n'+s;
        } else {
            console.log("li not in ol or ul");
        }
    },
    p:(el,ctx)=>{
        let o='\n'
        const cls=el.attrs.class;
        if (cls=='eti') {
            o+='^eti '
        }
        return o;
    },
    sup:(el,ctx)=>ctx.sup=true
}
export const onClose={
    sup:(el,ctx)=>ctx.sup=false,
    // p:(el,ctx)=>'\n',
    ol:(el,ctx)=>{ctx.liststack.pop(); return ''},
    ul:(el,ctx)=>{ctx.liststack.pop(); return ''},
}
export const onText=(el,ctx,text)=>{
    if (ctx.sup) {
        const sup=toSuperscript(text)
        if (sup===text) {
            if (parseInt(text)) {
                // console.log('might be part of link',text)
            } else {
                return '^sup['+text+']';
            }
        }
        return sup;
    }
    return text;
}

const parseSCUrl=url=>{
    url=url.replace(/https:\/\/suttacentral.net\//,'');
    url=url.replace(/\/en\/[a-z]+/g,'');   //sujato or brahmali
    url=url.replace(/\/pli\/[a-z]+/g,''); //ms
    url=url.replace('#',':');
    return url;
}

export const doInlineTag=(buf,ctx)=>{
    buf=buf.replace(/<i class='term'>(-?)<a href='\/define\/([^>]+)'>([^>]+)<\/a><\/i>/g,(m,dash,m1,m2)=>{
        if (m1!==m2) {
            console.log('define word unmatch',m1,m2);
        }
        return '^w['+m1+']';
    });
    buf=buf.replace(/<a class='ref' href='([^>]+)'>([^>]+)<\/a> ?/g,(m,href,ptslink)=>{
        const sclink=parseSCUrl(href);
        ctx.cites.push([ctx.word,sclink,ptslink]);
        return '^sc@'+sclink+' ';
    })
    buf=buf.replace(/<span class='ref'>([^>\.]+)\.([iv]+)\.(\d+)<\/span> ?/g,(m,book,vol,m1)=>{
        const v=romanToInt(vol);
        return '^pts@'+book.toLowerCase()+v+'.'+m1+' ';
    })
    buf=buf.replace(/<span class='ref'>([^>]+)<\/span> ?/g,(m,ref)=>{
        const cite=parsePEDCite(ref);
        const book=cite.match(/([a-z0]+)/)
        // console.log(book)
        if (book) {
            if (!ctx.books[book[0]])ctx.books[book[0]]=0;
            ctx.books[book[0]]++;
        } else {
            console.log('error cite',cite)
        }
        return '^pts#'+cite+' ';
    })
    buf=buf.replace(/<span class='grammar'>([^>]+)<\/span> ?/g,(m,m1)=>{
        // if (!ctx.grammars[m1])   ctx.grammars[m1]=0;
        // ctx.grammars[m1]++;
        const grammar=Grammars[m1]||m1;
        if (!grammar) {
            console.log('unknow grammar',m1);
            return '^g['+m1+']';
        }
        return '^g#'+grammar+' ';
    })
    buf=buf.replace(/<abbr title='([^>]+)'>([^>]+)<\/abbr> ?/g,(m,title,m1)=>{
        // console.log(title,m1)
        // if (!ctx.grammars[title+':'+m1])   ctx.grammars[title+':'+m1]=0;
        // ctx.grammars[title+':'+m1]++;
        // const grammar=Grammars[m1]||m1;
        // if (!grammar) {
        //     console.log('unknow grammar',m1);
        //     return '^g['+m1+']';
        // }
        // return '^g#'+grammar+(space?'':' ');
        return '^g#'+m1.replace('. ','.').replace(' ','.')+' ';
    })
    buf=buf.replace(/<span class='inline-li'>(\d+)<\/span>/g,(m,m1)=>{
        const n=parseInt(m1);
        if (n>=1&&n<=20) {
            return '\n'+String.fromCharCode(n+ 0x2473);// PTS 義項，被引用時無<span>標記 ，如(1)
        } else {
            console.log('inline-li too big',m1)
        }

    })
    buf=buf.replace(/<i class='term'>([^>]+)<\/i>/g,'^l[$1]');
    buf=buf.replace(/<i'>([^>]+)<\/i>/,'^i[$1]');
    return buf;
}