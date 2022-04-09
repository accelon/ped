import  {romanToInt} from 'pitaka/utils'
/* parse Sutta Central PED citation */

const bookVolPage=(m,book,roman,page)=>{
	const v=romanToInt(roman);
	book=book.toLowerCase().replace("pts","ps");
	const bk=book.indexOf("-")>0?book.replace("-",v):book+v;
	//PTS jataka is cs jataka att  j6 ==> j6a
	return bk+","+page;
}
const bookPage=(m,book,page)=>{
	const bk=book.toLowerCase()
		.replace("dhs","ds")
		.replace("netti","ne")
		.replace("tha-ap","thap");

	return bk.replace("-","0")+"-"+page;
}

const bookGroupGatha=(m,book,group,gatha)=>{
	return book.toLowerCase()+"_"+(gatha)+"g"+romanToInt(group);
}

const bookVaggaVatthuGatha=(m,book,vagga,vatthu,gatha)=>{
	return book.toLowerCase()+romanToInt(vagga)+"."+vatthu+"."+gatha;
}
const patterns=[
	[/^(V)in\.([iv]{1,3})\.(\d+)/	, bookVolPage],
	[/^([DMSA])N\.([iv]{1,3})\.(\d+)/,bookVolPage],
	[/^(Ja)\.([iv]{1,3})\.(\d+)/	, bookVolPage],
	[/^(Dhp-a|Pts|Dhp-a)\.([iv]{1,3})\.(\d+)/	,bookVolPage],

	[/^(Dhp-a|Pts|Dhp-a)\.([iv]{1,3})\.(\d+)/	,bookVolPage],

	[/^(Bv)\.([ivx]{1,5})\.(\d+)/	,bookGroupGatha],

	[/^(Vb|Pp|Ud|Mil|Kv|Iti|Mnd|Ne|Netti)\.(\d+)/,bookPage],
	[/^(Vv-a|Vb-a|Pv-a|Pp-a|Kv-a|Dhs-a|Snp-a|Tha-ap)\.(\d+)/,bookPage],

	//[/^(Pv-a)\.(\d+)/,bookPage],
	//[/^(Vb)\.(\d+)/,bookPage],
	
	[/^(Pv|Cp)\.([iv]{1,3})\.(\d+)#(\d+)/,bookVaggaVatthuGatha],
	[/^Snp\.(\d+)/,"snp-$1g1"],
	[/^Dhp\.(\d+)/,"dhp-$1"],
	[/^Vv\.(\d+)#(\d+)/,"vv$1.$2"],
	[/^Dhs\.(\d+)/,"ds-$1g3"],
	[/^Vism\.(\d+)/,"vism-$1"],
	[/^Th([ai])g\.(\d+)/,"th$1g_$2"],
	[/^Th([ai])g-a\.(\d+)/,"th$1g0a_$2"],
	[/^Cnd\.(\d+)/,"cnd-$1"],
	[/^Mhvs\.(\d+)/,"mv-$1"],
	[/^Ds\.(\d+)/,"ds-$1"],
	[/^Divy\.(\d+)/,"divy-$1"],
	[/^Kp-a\.(\d+)/,"kp0a-$1"],
]
export const parsePEDCite=cite=>{
	for (var i=0;i<patterns.length;i++) {
		const pat=patterns[i][0];
		const func=patterns[i][1];
		const o=cite.replace(pat,func);
		if (o!==cite) return o;
	}
	return cite;
}