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

export const prolog=buf=>{
    buf=buf.replace(/■ /g,'\n■ ').replace(/\n+/g,'\n')
    .replace(/\]˚/g,'°]')  //should be part of markup
    .replace(/ \. \^w/g,' .\n ^w').replace(/; \^w/g,';\n ^w') //extremely long line 6Kb reduced to 2Kb
    .replace(/([ \)])\. \^l/g,'$1\.\n ^l')
    .replace(/1\^sup\[st\] sg\. ?/,'^g#1sg ')
    .replace(/1\^sup\[st\] pl\. ?/,'^g#1pl ')
    .replace(/2\^sup\[nd\] sg\. ?/,'^g#2sg ')
    .replace(/2\^sup\[nd\] pl\. ?/,'^g#2pl ')
    .replace(/3\^sup\[rd\] sg\. ?/,'^g#3sg ')
    .replace(/3\^sup\[rd\] pl\. ?/,'^g#3pl ')
    .replace(/[Ee]xpl\^sup\[n\]/g,'^g#expl') //explanation
    .replace(/[Ee]xpl\^sup\[n\.\]/g,'^g#expl .') //explanation
    .replace(/[Ee]xpl\^sup\[d.\]/g,'^g#expld .') //explained.
    .replace(/[Ee]xpl\^sup\[d]/g,'^g#expld') //explained
    //grammar
    .replace(/\bger\. ?/g,' ^g#ger ') //
    .replace(/\^i\[voc\.\]/g,'^g#voc') //wrong markup
    .replace(/\^i\[acc\.\]/g,'^g#acc') //accusative
    .replace(/\^i\[nt\.\]/g,'^g#nt') //neuter
    .replace(/\(act\./g,'(^g#act') //active , 可能有漏網因act 和 pass 都是單字
    .replace(/\bpass\.\)/g,'^g#pass)') //pass , 可能有漏網

    .replace(/\b[Ff]\. ?/g,'^g#f ') //feminine
    .replace(/\b[Mm]\. ?/g,'^g#m ') //feminine
    .replace(/\b[A]or\. ?/g,'^g#aor ') //aorist
    .replace(/\b[Dd]er\. ?/g,'^g#der ') //derived
    .replace(/\b[Ff]r\. ?/g,'^g#fr ') //from
    .replace(/\b[Sk]k\. ?/g,'^g#sk ') //sanskrit
    .replace(/\bBSk\. ?/g,'^g#bsk ') //Buddhist sanskrit
    .replace(/\b[Nn]om\. ?/g,'^g#nom ') //naminative
    .replace(/\b[Vv]oc\. ?/g,'^g#voc ') //vocative
    .replace(/\b[Aa]cc\. ?/g,'^g#acc ') //accusative
    .replace(/\b[Aa]dj\. ?/g,'^g#adj ') //adjective
    .replace(/\b[Ll]oc\. ?/g,'^g#loc ') //locative
    .replace(/\b[Nn]t\. ?/g,'^g#nt ') //neuter
    .replace(/\b[Ss]g\. ?/g,'^g#sg ') //singluar
    .replace(/\b[Pp]l\. ?/g,'^g#pl ') //plurar
    .replace(/\b[Pp]rep\. ?/g,'^g#prep ') //preposition
    .replace(/\b[Cc]aus\. ?/g,'^g#caus ') // causative
    .replace(/\b[Cc]pd\. ?/g,'^g#cpd ') // compound
    .replace(/\b[Qq]\.v\. ?/g,'^g#qv ') // quod vide (which see)
    .replace(/\b[Cc]p\. ?/g,'^g#cp ') //compare to
    .replace(/\bscil\. ?/g,'^g#scil ') //scilicet , namely
    .replace(/\bsq. ?/g,'⊕') //scilicet , namely
    return buf;
}
export const doInlineTag=(buf,ctx)=>{
    buf=buf.replace(/<i class='term'>(-?)<a href='\/define\/([^>]+)'>([^>]+)<\/a><\/i>/g,(m,dash,m1,m2)=>{
        if (m1!==m2) {
            console.log('define word unmatch',m1,m2);
        }
        return (dash||'')+'^w['+m1+']';
    });
    buf=buf.replace(/<a href='\/define\/([^>]+)'>([^>]+)<\/a>/g,(m,m1,m2)=>{
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
        const book=cite.match(/([a-zA-Z0]+)/)
        // console.log(book)
        if (cite==ref) {
            console.log('cannot parse cite',cite)
            if (book){
                if (!ctx.ubooks[book[0]])ctx.ubooks[book[0]]=0;
                ctx.ubooks[book[0]]++;
    
            }
        }
        if (book) {
            if (!ctx.books[book[0]])ctx.books[book[0]]=0;
            ctx.books[book[0]]++;
        } else {
            console.log('error cite',cite)
        }
        return '^pts#'+cite.toLowerCase()+' ';
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
        return '^g#'+m1.replace(/. ?/,'_').replace(' ','_').replace(/_$/,'')+' ';
    })
    buf=buf.replace(/<span class='inline-li'>(\d+)<\/span>/g,(m,m1)=>{
        const n=parseInt(m1);
        if (n>=1&&n<=20) {
            return '\n'+String.fromCharCode(n+ 0x2473);// PTS 義項，被引用時無<span>標記 ，如(1)
        } else {
            console.log('inline-li too big',m1)
        }
    })
    buf=buf.replace(/<i class='term'>([^>]+)<\/i>/g,(m,m1)=>'^l['+m1.replace('˚','°')+']');
    buf=buf.replace(/<i>([^>]+)<\/i>/g,(m,m1)=>{
        if (m1.indexOf('˚')>-1 || m1[0]=='-') {
            return '^l['+m1.replace('˚','°')+']'; //expandable lemma,change to degree sign      
        } else {
            return '^i['+m1+']';
        }
    }); //also expandable
    buf=buf.replace(/([\(\-,;\. ])˚([aāâiīuūûôenoṁṃcvkbdtphḍṭñṅṇsjgymrlḷ\-]+)/g,(m,prefix,m1)=>{
        return prefix+'^le[°'+m1+']';
        // (-˚xxx   (˚xxx (-xxx
    })
    buf=buf.replace(/([aāâiīuūûôenoṁṃcvkbdtphḍṭñṅṇsjgymrlḷ\-]+)˚/g,(m,m1)=>{
        return '^le['+m1+'°]';
    })

    return buf;
}