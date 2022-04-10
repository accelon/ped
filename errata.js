export  default {
    'pli2en_dppn.json':[ //fix invalid xml structure
        ['<dt><dt>','</dt><dt>',2],  
        ['</p><dd ',',</p></dd><dd ',2],
        ['</dd><dl>','</dd></dl><dl>']
    ],
    'pli2en_pts_small.json':'pli2en_pts.json',
    'pli2en_pts.json':[

        /* remove &lt; and &gt; */
        ['&gt;;',';'], //assaya 112b 
        ['E. will&lt;','E. will. —'], // vuṇāti,  697b 
        ['&lt;<br>','<br>'],// gaṇeti , pdf 270b
        ['ch&lt;sk. kṣ cp. P chamā&lt;k ch churik etc.' //nicchodeti
        ,'ch＞;sk. kṣ cp. P chamā＞kṣāra, chārikā＞kṣāra, churika＞kṣurikā etc.'], //394a
        ['phalika&lt;spha geiger P.G','phalika＜sphaṭika (see Geiger P.G'], //phāṭeti 523a
        ['&lt;(b)',';(b)'],//rukkha 622a
        ['nillaccheti</a></i>.&lt;','nillaccheti</a></i>.'],//lañchati 630b
        ['&lt;(d)dara','—(d)dara'],//vīta 696a

        ['Vism262','Vism.262'],
        ['Dhs-a166','Dhs-a.166'],
        ['Vv-a 118','Vv-a.118'],
//sc typo
        ["<span class='grammar'>adjverb</span>","<span class='grammar'>adverb</span>"], //178b ubhayattha
 //parse errar wrong id
 //id='panunna (Paṇunna
 //id='brāhmañña. brāhmaññatā
 // id mana(s)
 //sajju, sajjukaṁ, sajju
 //rumma rummin rumma
        
//pts problem
        ["<span class='grammar'>adj. f. scil. pannā</span>","<span class='grammar'>adj. f.</span> scil. pannā"],
        ["<span class='grammar'>adj. in sense of collect. neuter</span>","<span class='grammar'>adj</span> in sense of collect. <span class='grammar'>neuter</span>"],
//markup errors
        ['<sup>2;</sup>','<sup>2</sup>;'],
        ["pv36/pli/ms'>Pv.36</a><sup>5 2</sup>","pv36/pli/ms#52.1'>Pv:36.52</a>"],
        ["ms'>Pv.20</a><sup>9.ii</sup>","ms#9.2'>Pv20:9.2</a>"],
    ],
}